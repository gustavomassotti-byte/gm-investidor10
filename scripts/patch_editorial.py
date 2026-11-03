from pathlib import Path
p=Path("_site/index.html")
s=p.read_text(encoding="utf-8")
s=s.replace('<button class="tab" data-filter="renda-fixa">Renda Fixa</button>','<button class="tab" data-filter="renda-fixa">Renda Fixa</button><button class="tab" data-filter="editorial">Editorial GM</button>')
s=s.replace("fiis:'Análises · FIIs','renda-fixa':'Renda Fixa & Crédito Privado'","fiis:'Análises · FIIs','renda-fixa':'Renda Fixa & Crédito Privado',editorial:'Editorial GM · Livros e Guias'")
s=s.replace("k==='fiis'?'Análise de FII':'Panorama mensal'","k==='fiis'?'Análise de FII':k==='editorial'?'Publicação editorial':'Panorama mensal'")
p.write_text(s,encoding="utf-8")
print("Aba Editorial GM instalada:",'data-filter="editorial"' in s)
