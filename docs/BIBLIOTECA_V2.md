# Biblioteca GM Research — V2

**Implantação:** 19 de novembro de 2026  
**Repositório:** `gustavomassotti-byte/gm-investidor10`  
**Objetivo:** melhorar navegação e apresentação preservando todas as publicações e endereços originais.

## Garantia de integridade

- O catálogo anterior continha **139 PDFs**, oriundos de `documentos/` e do acervo histórico de arquivos ZIP.
- Nenhum PDF, arquivo ZIP ou pasta de documentos foi renomeado, movido, substituído ou excluído nesta atualização.
- A versão anterior da página foi preservada em [backup/portal-v1-2026-11-19.html](../backup/portal-v1-2026-11-19.html).
- Os **139 caminhos originais** foram preservados em [backup/inventario-pdfs-2026-11-19.txt](../backup/inventario-pdfs-2026-11-19.txt).
- O catálogo continua sendo construído automaticamente pelo workflow `.github/workflows/pages.yml`, a partir dos PDFs. A página V2 lê somente `manifest.json`.
- Todos os documentos, mesmo as edições antigas, podem ser encontrados na seção **Acervo completo**.

## Navegação pública

| Seção | Query | Conteúdo |
|---|---|---|
| Início | `?sec=inicio` | Destaques, famílias de pesquisa e busca |
| Dossiês | `?sec=dossies` | Ações B3, BDRs, FIIs; última edição e histórico por ativo |
| Carteiras | `?sec=carteiras` | Cinco linhas de carteiras, com edições anteriores preservadas |
| Cenários & Mercado | `?sec=cenarios` | Conjuntura, macro, índices, câmbio, renda fixa e Bitcoin |
| GM Editorial | `?sec=editorial` | Obras conceituais, comportamento, gestão de risco e estratégia |
| O Analista Curioso | `?sec=curioso` | Coleção editorial de volumes finais |
| Acervo completo | `?sec=arquivo` | Todos os PDFs e suas edições, sem exclusão editorial |

A pesquisa do topo procura em todo o acervo (título, ticker, empresa, nome original do arquivo, tema e seção).

## Arquivos de interface

- `index.html`: estrutura HTML pública, sem PDFs embutidos.
- `assets/v2.css`: identidade visual editorial, responsiva.
- `assets/v2.js`: metadados curatoriais, organização, ordenação, busca, agrupamento de edições e navegação.
- `v2.html`: cópia da interface V2 para testes de regressão.
- `scripts/gm_build_covers.py`: geração automática de miniaturas da primeira página dos PDFs não corporativos.

## Atualização e manutenção

Para adicionar novos PDFs, continue usando o **GM Publisher** como antes. Não há necessidade de renomear nenhum arquivo antigo. Os documentos novos entram no `manifest.json` e no acervo completo automaticamente. Ajustes de nome editorial, sinopse, coleção e identificação de empresa podem ser feitos em `assets/v2.js`; isto não altera PDFs.

O sistema de datas distingue o mês de referência do relatório (quando reconhecível) da data em que o documento foi efetivamente publicado no GitHub. Não se deve inventar datas para itens históricos.

## Reversão

Em caso de erro visual, basta restaurar o conteúdo de `backup/portal-v1-2026-11-19.html` em `index.html`. Não é necessário excluir PDF, alterar URLs ou reconstruir o acervo. O histórico Git também mantém o código anterior.

## Ponto de atenção

O catálogo histórico inclui um documento de carteira cujo nome contém `CLIENTE_FINAL`. Por ter sido preservado conforme orientação de não remover trabalhos já produzidos, sua autorização para exposição pública deverá ser revisada separadamente antes de divulgar o portal a um público maior.
