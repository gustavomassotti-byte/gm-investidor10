#!/usr/bin/env python3
"""Importa PDFs de lotes ZIP para o site, sem extrair caminhos arbitrarios."""
from pathlib import Path
from zipfile import ZipFile, BadZipFile
import re
import shutil

SITE = Path("_site/documentos")
LOTES = Path("lotes")
CATEGORIES = {"carteiras", "acoes", "fiis", "renda-fixa"}
MAX_PDF = 45 * 1024 * 1024
MAX_FILES = 100

def category(filename, member):
    path = member.lower().replace("\\", "/")
    if any(segment in ("renda-fixa", "renda_fixa") for segment in path.split("/")):
        return "renda-fixa"
    if any(segment == "fiis" for segment in path.split("/")):
        return "fiis"
    if any(segment in ("acoes", "ações", "dossies", "dossiês", "bdrs") for segment in path.split("/")):
        return "acoes"
    name = filename.upper()
    if "CARTEIRA" in name:
        return "carteiras"
    if "DOSSIE" in name or "DOSSIÊ" in name:
        return "acoes"
    if "RENDA_FIXA" in name or "RENDA-FIXA" in name:
        return "renda-fixa"
    raise ValueError(f"Categoria desconhecida: {filename}; use pasta carteiras/, acoes/, fiis/ ou renda-fixa/ no ZIP")

def main():
    if not LOTES.exists():
        print("Nenhum lote ZIP encontrado")
        return
    total = 0
    for archive in sorted(LOTES.glob("*.zip")):
        print(f"Importando lote: {archive.name}")
        try:
            with ZipFile(archive) as z:
                for info in z.infolist():
                    if info.is_dir() or not info.filename.lower().endswith(".pdf"):
                        continue
                    total += 1
                    if total > MAX_FILES or info.file_size > MAX_PDF:
                        raise ValueError("Limite de quantidade/tamanho de PDFs excedido")
                    filename = Path(info.filename.replace("\\", "/")).name
                    if filename in ("", ".", "..") or not re.fullmatch(r"[^/\\\\\x00-\x1f]+\\.pdf", filename, re.I):
                        raise ValueError(f"Nome de PDF invalido: {filename}")
                    cat = category(filename, info.filename)
                    dest = SITE / cat / filename
                    dest.parent.mkdir(parents=True, exist_ok=True)
                    with z.open(info) as source, dest.open("wb") as target:
                        shutil.copyfileobj(source, target)
                    print(f"  {cat}/{filename}")
        except BadZipFile as exc:
            raise ValueError(f"ZIP invalido: {archive.name}") from exc
    print(f"PDFs processados dos lotes: {total}")

if __name__ == "__main__":
    main()
