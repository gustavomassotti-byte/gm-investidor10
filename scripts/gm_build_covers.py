#!/usr/bin/env python3
"""Build first-page PDF thumbnails for non-asset GM Research publications.

After the public manifest is built, generate JPEG covers and record their
relative paths. Keep PDFs and PDF URLs untouched.
"""
import hashlib
import json
import re
import sys
from pathlib import Path

import fitz

NON_ASSET_CATEGORIES = {'carteiras', 'editorial', 'renda-fixa', 'educacional', 'analista-curioso'}
THEMATIC_ACTIONS = re.compile(
    r'2027|PATRIMONIO|AJUSTE_FISCAL|BRASIL_OU_EXTERIOR|JUROS_DOLAR|'
    r'OPORTUNIDADES|ELEICOES_BOLSA', re.I,
)


def needs_cover(row):
    cat = row.get('category', '')
    # Dossiê NVIDIA: a vitrine deve exibir a primeira página do PDF oficial,
    # nunca uma capa genérica. Os outros dossiês continuam inalterados.
    is_nvidia = row.get('name', '') == (
        'GM_Research_Dossie_NVIDIA_NVDA_NVDC34_2026-11-18_APROVADO.pdf'
    )
    return cat in NON_ASSET_CATEGORIES or (
        cat == 'acoes' and (
            bool(THEMATIC_ACTIONS.search(row.get('name', ''))) or is_nvidia
        )
    )


def run(site):
    root = Path(site).resolve()
    path = root / 'manifest.json'
    rows = json.loads(path.read_text(encoding='utf-8'))
    successful = 0
    failed = []
    for row in rows:
        if not needs_cover(row):
            continue
        rel = Path(row['path'])
        pdf = (root / rel).resolve()
        if not pdf.is_relative_to(root) or not pdf.is_file():
            failed.append((str(rel), 'PDF ausente ou caminho inválido'))
            continue
        try:
            digest = hashlib.sha256(pdf.read_bytes()).hexdigest()[:12]
            stem = re.sub(r'[^a-zA-Z0-9_-]+', '-', pdf.stem).strip('-')[:65]
            cover_rel = Path('capas') / row['category'] / f'{stem}-{digest}.jpg'
            out = root / cover_rel
            out.parent.mkdir(parents=True, exist_ok=True)
            with fitz.open(pdf) as doc:
                if not len(doc):
                    raise ValueError('PDF sem páginas')
                page = doc[0]
                scale = min(1.0, 250.0 / max(1.0, page.rect.width))
                pix = page.get_pixmap(matrix=fitz.Matrix(scale, scale),
                                      colorspace=fitz.csRGB, alpha=False)
                out.write_bytes(pix.tobytes('jpg', jpg_quality=74))
            row['cover_path'] = cover_rel.as_posix()
            successful += 1
        except Exception as exc:
            failed.append((str(rel), str(exc)))
    path.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + '\n',
                    encoding='utf-8')
    print(f'Capas de PDFs geradas: {successful}; falhas: {len(failed)}')
    for filename, error in failed:
        print(f'ATENÇÃO capa não gerada: {filename}: {error}')


if __name__ == '__main__':
    run(sys.argv[1] if len(sys.argv) > 1 else '_site')
