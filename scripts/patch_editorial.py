from pathlib import Path
# A navegação Editorial/Educacional foi unificada em Conhecimento GM
# diretamente no index.html. Não adicionar uma aba legada no deploy.
p=Path("_site/index.html")
assert p.exists(), "index.html não encontrado"
print("Menu de Conhecimento GM preservado; nenhuma aba duplicada.")
