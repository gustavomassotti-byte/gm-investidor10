#!/usr/bin/env python3
"""GM Publisher: download approved PDF assets from a fixed CDN to the public portal.

The manifest in publisher/pending.json is generated from files already approved
in GM Research's Library. This script refuses any arbitrary host, path traversal,
mismatched content hashes and accidental overwrites.
"""
import hashlib
import json
import os
import re
import shutil
import sys
import tempfile
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ALLOWED_CATEGORIES = {"fiis", "acoes", "carteiras", "editorial", "renda-fixa"}
ALLOWED_HOST = "gm-central.floot.app"
MAX_FILE_BYTES = 25 * 1024 * 1024


def fail(message):
    raise ValueError(message)


def check_item(item):
    category = item.get("category", "")
    filename = item.get("filename", "")
    if category not in ALLOWED_CATEGORIES:
        fail(f"Categoria não permitida: {category!r}")
    if filename != Path(filename).name or not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._()-]{0,180}\.pdf", filename):
        fail(f"Nome de PDF inválido: {filename!r}")
    url = item.get("url", "")
    parts = urllib.parse.urlparse(url)
    if parts.scheme != "https" or parts.hostname != ALLOWED_HOST or parts.port is not None or not parts.path.startswith("/_cdn/static/") or parts.query or parts.fragment:
        fail(f"Origem não autorizada para {filename}")
    sha = item.get("sha256", "")
    if not re.fullmatch(r"[a-f0-9]{64}", sha):
        fail(f"SHA256 inválido para {filename}")
    if not isinstance(item.get("size_bytes"), int) or not 1 <= item["size_bytes"] <= MAX_FILE_BYTES:
        fail(f"Tamanho inválido para {filename}")
    return category, filename, url, sha


def fetch_checked(url, sha, size):
    # Do not follow cross-host redirects.
    class RestrictedRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, req, fp, code, msg, headers, newurl):
            if urllib.parse.urlparse(newurl).hostname != ALLOWED_HOST:
                fail("Redirecionamento para servidor não autorizado")
            return super().redirect_request(req, fp, code, msg, headers, newurl)
    opener = urllib.request.build_opener(RestrictedRedirect)
    request = urllib.request.Request(url, headers={"User-Agent": "GMResearchPublisher/1.0"})
    with opener.open(request, timeout=60) as response:
        data = response.read(MAX_FILE_BYTES + 1)
    if len(data) != size:
        fail(f"Tamanho incorreto: recebido {len(data)}, esperado {size}")
    if not data.startswith(b"%PDF-"):
        fail("Arquivo remoto não é PDF")
    if hashlib.sha256(data).hexdigest() != sha:
        fail("SHA256 não confere com o arquivo aprovado")
    return data


def main():
    manifest_path = ROOT / "publisher" / "pending.json"
    config = json.loads(manifest_path.read_text(encoding="utf-8"))
    items = config.get("files", [])
    if not isinstance(items, list) or not 1 <= len(items) <= 50:
        fail("Manifesto deve ter entre 1 e 50 arquivos")
    seen = set()
    staged = []
    for item in items:
        category, filename, url, sha = check_item(item)
        target = ROOT / "documentos" / category / filename
        if str(target) in seen:
            fail(f"Destino duplicado: {target}")
        seen.add(str(target))
        if target.exists() and hashlib.sha256(target.read_bytes()).hexdigest() == sha:
            staged.append((target, None, "already-present", sha))
            continue
        if target.exists() and item.get("replace") is not True:
            fail(f"Destino existente diferente, substituição não autorizada: {target}")
        data = fetch_checked(url, sha, item["size_bytes"])
        staged.append((target, data, "to-publish", sha))
        print(f"VALIDADO: {category}/{filename} ({len(data)} bytes)")
    # Atomicity within the script: download and validate EVERY PDF before writing ANY PDF.
    for target, data, status, sha in staged:
        if data is not None:
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(data)
    report = {
        "checked_at_utc": datetime.now(timezone.utc).isoformat(),
        "source": "Biblioteca GM aprovada -> Floot asset -> GitHub",
        "files": [
            {"path": str(t.relative_to(ROOT)), "status": ("published" if data is not None else "already-present"), "sha256": sha}
            for t, data, status, sha in staged
        ],
        "checked": len(staged),
        "published": sum(data is not None for t, data, status, sha in staged),
    }
    (ROOT / "publisher" / "last-run.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(json.dumps({"checked": report["checked"], "published": report["published"]}))


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"FALHA DE PUBLICAÇÃO: {exc}", file=sys.stderr)
        sys.exit(1)
