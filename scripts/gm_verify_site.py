#!/usr/bin/env python3
"""Verify that PDFs from the last GM Publisher batch are visible on GitHub Pages."""
import json
import os
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SITE = "https://gustavomassotti-byte.github.io/gm-investidor10/"
EXPECTED = json.loads((ROOT / "publisher" / "last-run.json").read_text(encoding="utf-8"))["files"]
wanted = {item["path"] for item in EXPECTED}
headers = {"User-Agent": "GMResearchSiteAudit/1.0", "Cache-Control": "no-cache"}


def request(url, method="GET"):
    req = urllib.request.Request(url, method=method, headers=headers)
    with urllib.request.urlopen(req, timeout=30) as response:
        body = response.read() if method == "GET" else b""
        return response.status, response.headers.get("Content-Type", ""), body


def audit():
    # GitHub Pages pode levar mais de um minuto para concluir a implantação.\n    # Aguarde a versão pública, evitando falsos negativos de corrida.\n    for attempt in range(1, 25):
        try:
            url = SITE + "manifest.json?gm_audit=" + str(int(time.time()))
            status, mime, raw = request(url)
            catalog = json.loads(raw.decode("utf-8"))
            found = {row["path"] for row in catalog}
            missing = sorted(wanted - found)
            if missing:
                raise RuntimeError(f"Não constam no catálogo: {missing}")
            bad = []
            for path in sorted(wanted):
                url = SITE + urllib.parse.quote(path, safe="/")
                try:
                    s, t, _ = request(url, "HEAD")
                    if s != 200 or "pdf" not in t.lower():
                        bad.append((path, f"HTTP {s}: {t}"))
                except Exception as exc:
                    bad.append((path, str(exc)))
            if bad:
                raise RuntimeError(f"PDF(s) inacessíveis: {bad}")
            return {"status":"success","validated":len(wanted),"manifest_total":len(catalog),"date_utc":time.strftime("%Y-%m-%dT%H:%M:%SZ",time.gmtime()),"site":SITE}
        except Exception as exc:
            print(f"Tentativa {attempt}/24: {exc}", flush=True)
            if attempt == 24:
                raise
            time.sleep(10)


if __name__ == "__main__":
    try:
        result = audit()
        msg=f"✅ {result['validated']} PDFs do lote confirmados no catálogo e acessíveis no site ({result['manifest_total']} itens totais)."
        print(msg, flush=True)
        if os.getenv("GITHUB_STEP_SUMMARY"):
            with open(os.environ["GITHUB_STEP_SUMMARY"],"a",encoding="utf-8") as f:
                f.write("## GM Research — verificação pública\n\n"+msg+"\n\n"+result["site"]+"\n")
    except Exception as exc:
        print(f"❌ Falha de verificação do portal: {exc}",file=sys.stderr)
        sys.exit(1)
