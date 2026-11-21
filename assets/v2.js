/* GM Research Biblioteca V2
   Only reads the public PDF manifest; never moves or changes a document. */
(function(){
'use strict';
const ROOT='./', PAGE=28, SEC=['inicio','dossies','carteiras','cenarios','editorial','curioso','arquivo'];
let DATA=[], UI={section:'inicio',sub:'todos',sort:'recentes',sortBy:{},query:'',page:1}, lastSection='inicio';
const $=s=>document.querySelector(s);
const esc=x=>String(x==null?'':x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const plain=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const moneyCount=x=>new Intl.NumberFormat('pt-BR').format(x);
const nice=x=>String(x||'').replace(/\.pdf$/i,'').replace(/[_-]+/g,' ').replace(/\s+/g,' ').trim();
const datestr=x=>/^\d{4}-\d{2}-\d{2}$/.test(x||'')?x.slice(8,10)+'/'+x.slice(5,7)+'/'+x.slice(0,4):'';
const monthstr=x=>/^\d{4}-\d{2}$/.test(x||'')?x.slice(5,7)+'/'+x.slice(0,4):'';
const navURL=(sec,sub)=>'?sec='+encodeURIComponent(sec)+(sub&&sub!=='todos'?'&tipo='+encodeURIComponent(sub):'');
const href=x=>ROOT+String(x.path||'').split('/').map(encodeURIComponent).join('/');
const coverSrc=x=>typeof x.cover_path==='string'&&/^capas\/[a-z0-9\/_.()-]+\.jpg$/i.test(x.cover_path)?ROOT+x.cover_path:'';
const filenameMonth=x=>{const n=x.name||'';let d=n.match(/(?:^|[_-])(20\d{2})-([01]\d)-([0-3]\d)(?:[_-]|\.|$)/);if(d)return d[1]+'-'+d[2];const months={janeiro:1,fevereiro:2,marco:3,abril:4,maio:5,junho:6,julho:7,agosto:8,setembro:9,outubro:10,novembro:11,dezembro:12};const name=plain(n);for(const word in months){const m=name.match(new RegExp(word+'[_\\s-]*(20\\d{2})'));if(m)return m[1]+'-'+String(months[word]).padStart(2,'0');}return x.reference_month||''};
const shortDate=x=>{const m=x.reference_month||filenameMonth(x);return m?'Edição '+monthstr(m):x.published_at?'Publicação '+datestr(x.published_at):'Acervo histórico'};
const publication=x=>x.published_at?'Publicado '+datestr(x.published_at):'Publicação histórica';
const score=x=>(filenameMonth(x)||'0000-00')+(x.published_at||'0000-00')+x.name;
const topicTitle={
 'GM_Research_Especial_Bitcoin_2026-11-19_CAPA_NOVA.pdf':'Bitcoin — O Ciclo Mudou?',
 'GM_Depois_das_Urnas_Bolsa_Dolar_Juros_Inflacao.pdf':'Depois das Urnas: Bolsa, Dólar, Juros e Inflação',
 'GM_Dividendos_Novembro2026_Padrao_Outubro_REV3.pdf':'Carteira de Dividendos — Novembro 2026',
 'GM_Research_Dossie_NVIDIA_NVDA_NVDC34_2026-11-18_APROVADO.pdf':'NVIDIA — Dossiê Fundamentalista',
 'GM_Research_Observatorio_de_Gestoras_2026-11-19_CAPA_NOVA.pdf':'Observatório de Gestoras — Quando o Consenso Muda',
 'GM_Research_Especial_Ibovespa_2026_APROVADO.pdf':'Ibovespa em Duas Moedas',
 'GM_Research_Ibovespa_3T26_O_Teste_do_Caixa.pdf':'Ibovespa — O Teste do Caixa',
 'GM_Research_Especial_Dolar_2026.pdf':'O Dólar Está Caro?',
 'GM_Research_O_Preco_da_Fragilidade_2026_REVISADO.pdf':'O Preço da Fragilidade',
 'GM_Research_Ajuste_Fiscal_2027_Novembro_2026.pdf':'Ajuste Fiscal e Seus Impactos em 2027',
 'GM_Research_Brasil_ou_Exterior_2027_Novembro_2026.pdf':'Brasil ou Exterior: Onde Alocar em 2027?',
 'GM_Research_Mapa_das_Oportunidades_2027_Novembro_2026.pdf':'Mapa das Oportunidades de 2027',
 'GM_Research_Juros_Dolar_Bolsa_2027_Novembro_2026.pdf':'Juros, Dólar e Bolsa em 2027',
 'GM_Research_Onde_Estara_o_Dinheiro_em_2027.pdf':'Onde Estará o Dinheiro em 2027?',
 'GM_Research_Ano_Pos_Eleitoral_2027.pdf':'O Ano Pós-Eleitoral de 2027',
 'GM_Research_Seu_Patrimonio_Esta_Preparado_2027.pdf':'Seu Patrimônio Está Preparado para 2027?',
 'GM_Research_Seu_Patrimonio_Uma_Estrategia.pdf':'Seu Patrimônio, Uma Estratégia',
 'GM_Riscos_Invisiveis_2027.pdf':'Os Riscos Invisíveis de Sua Carteira em 2027',
 'GM_A_Cabeca_do_Investidor.pdf':'A Cabeça do Investidor',
 'GM_A_Cabeca_do_Investidor_Edicao_Visual.pdf':'A Cabeça do Investidor — Edição Visual',
 'GM_Construcao_e_Gestao_de_Carteiras.pdf':'Construção e Gestão de Carteiras',
 'GM_Derivativos_Edicao_Tecnica_Visual.pdf':'Derivativos — Edição Técnica Visual',
 'GM_Fundamentos_Metodo_da_Curiosidade_Edicao_Editorial.pdf':'Fundamentos e Método da Curiosidade',
 'GM_Gestao_de_Risco_Edicao_Editorial.pdf':'Gestão de Risco',
 'GM_Hedge_Protecao_de_Carteiras_Edicao_Institucional.pdf':'Hedge e Proteção de Carteiras',
 'GM_Long_Short_Estrategias_Relativas.pdf':'Long & Short — Estratégias Relativas',
 'GM_Research_A_Logica_de_Cada_Investimento.pdf':'A Lógica de Cada Investimento',
 'GM_Research_Dossie_Retornos_de_Longo_Prazo_Brasil.pdf':'Retornos de Longo Prazo no Brasil',
 'GM_O_Analista_Curioso_Vol_001_Mercado_Precificou_2027_2026-11-19_APROVADO.pdf':'O Mercado Já Precificou 2027?',
 'GM_O_Analista_Curioso_Vol_002_E_Se_2027_For_Diferente_2026-11-19_APROVADO.pdf':'E Se 2027 For Diferente?',
 'GM_O_Analista_Curioso_Vol_003_Assimetria_2027_2026-11-19_APROVADO.pdf':'Assimetria 2027',
 'GM_O_Analista_Curioso_Vol_004_As_20_Perguntas_Que_Podem_Mudar_2027_2026-11-19_APROVADO.pdf':'As 20 Perguntas Que Podem Mudar 2027',
 'GM_O_Analista_Curioso_Vol_005_E_Se_o_Consenso_Estiver_Errado_2026-11-19_APROVADO.pdf':'E Se o Consenso Estiver Errado?',
 'GM_O_Analista_Curioso_Vol_006_O_Mercado_Esta_Otimista_Demais_2026-11-20_APROVADO.pdf':'O Mercado Está Otimista Demais?',
 'GM_O_Analista_Curioso_Vol_007_O_Mercado_Esta_Pessimista_Demais_2026-11-20_APROVADO.pdf':'O Mercado Está Pessimista Demais?',
 'GM_Research_Custo_Brasil_2026-11-19_APROVADO.pdf':'Custo Brasil — Edição Aprovada',
 'GM_Research_Emergentes_IA_Estudo_Estrutural_2026-11-20_APROVADO.pdf':'Emergentes sob Pressão — IA e Mercados',
 'GM_O_Analista_Curioso_A_Divida_de_1624_2026-11-19_APROVADO.pdf':'A Dívida de 1624',
 'GM_Research_Custo_Brasil_2026-11-19_DEFINITIVO.pdf':'Custo Brasil — Edição Definitiva',
 'Analista_Curioso_Divida_1624.pdf':'A Dívida de 1624'
};
const blurbs=[
 [/Depois_das_Urnas/i,'Como eleições e política econômica podem mudar as perspectivas para bolsa, dólar, juros e inflação.'],
 [/^GM_Dividendos_Novembro/i,'A seleção de dividendos da GM Research para novembro, com estratégias e acompanhamento de carteira.'],
 [/Dossie_NVIDIA/i,'Fundamentos, valuation, riscos e perspectivas da NVIDIA em um estudo de companhia.'],
 [/Observatorio_de_Gestoras/i,'Uma leitura das mudanças de posicionamento e narrativas das principais gestoras.'],
 [/Especial_Bitcoin/i,'Ciclos, valuation narrativo e os riscos de um mercado em transformação.'],
 [/Especial_Ibovespa/i,'A bolsa brasileira observada em reais e em dólares, incluindo o EWZ.'],
 [/Ibovespa_3T26/i,'O que os balanços das companhias dizem sobre a sustentação da bolsa.'],
 [/Especial_Dolar/i,'Câmbio, precificação, riscos e formas de proteção patrimonial.'],
 [/O_Preco_da_Fragilidade/i,'As vulnerabilidades que o investidor nem sempre reconhece na carteira.'],
 [/A_Cabeca_do_Investidor/i,'Comportamento, decisão e os vieses que acompanham o investidor.'],
 [/Gestao_de_Risco/i,'Uma abordagem metodológica sobre perdas, proteção e sobrevivência.'],
 [/Derivativos/i,'Como instrumentos derivativos podem compor estratégias de investimento.'],
 [/Hedge_/i,'Proteção de carteiras e gestão dos riscos em cenários adversos.'],
 [/Long_Short/i,'Estratégias relativas, pares e construção de operações.'],
 [/Metodo_da_Curiosidade/i,'Uma metodologia de investigação, perguntas e análise financeira.'],
 [/Construcao_e_Gestao/i,'Critérios de alocação, diversificação e gestão de carteiras.'],
 [/Map[a_].*Oportunidades/i,'Um panorama de hipóteses e oportunidades para 2027.'],
 [/2027/i,'Um estudo sobre os cenários de mercado e as decisões para 2027.']
];
const noTicker=x=>String(x||'').replace(/^GM_(Research_)?/i,'').replace(/_((?:Novembro|Outubro|Setembro)2026|2026-11-\d\d).*/i,'');
const title=x=>topicTitle[x.name]||(/_Vol_00[1-9]_/.test(x.name)?nice(x.name).replace(/^GM O Analista Curioso /,''):nice(x.name).replace(/^GM (Research )?/,'').replace(/ (APROVADO|FINAL|CAPA NOVA|REV\d+)$/i,'').replace(/ 2026 11 \d\d.*$/,''));
const description=x=>{const b=blurbs.find(([re])=>re.test(x.name));return b?b[1]:'Estudo independente da GM Research, disponível no acervo institucional.'};
const timeless=/^(GM_A_Cabeca_do_Investidor|GM_Construcao_e_Gestao_de_Carteiras|GM_Derivativos|GM_Fundamentos|GM_Gestao_de_Risco|GM_Hedge|GM_Long_Short|GM_Research_A_Logica_de_Cada_Investimento|GM_Research_Seu_Patrimonio_Uma_Estrategia)/i;
const indexTopics=/IBOVESPA|SP500|EWZ|S_P_500|S&P.?500/i;
function section(x){
 if(x.category==='analista-curioso')return 'curioso';
 if(x.category==='carteiras')return 'carteiras';
 if(x.category==='fiis')return 'dossies';
 if(x.category==='renda-fixa')return 'cenarios';
 if(x.category==='acoes'){
  if(/RETORNOS?.{0,15}LONGO/i.test(x.name))return 'editorial';
  if(indexTopics.test(x.name))return 'cenarios';
  return 'dossies';
 }
 if(x.category==='editorial')return timeless.test(x.name)||/A_Cabeca_do_Investidor|O_Preco_da_Fragilidade/.test(x.name)?'editorial':'cenarios';
 return 'arquivo';
}
const isForeign=x=>/(MSFT34|AMZO34|GOGL34|M1TA34|EXXO34|AURA33|BLAK34|MUTC34|TSMC34|XPBR31|BERK34|INBR34|AVGO34|AAPL34|TSLA34|NVDC34|MELI34|NIKE34|_NKE_|_XOM_|_MELI_)/i.test(x.name)||/^(Alphabet_|Amazon_|Meta_|Microsoft_|MercadoLibre_|Nike_|TSMC_)/i.test(x.name);
const subType=x=>{
 const name=x.name||'';
 if(x.category==='fiis')return 'fiis';
 if(x.category==='renda-fixa')return 'renda-fixa';
 if(section(x)==='dossies')return isForeign(x)?'bdrs':'acoes';
 if(section(x)==='carteiras'){
  if(/SmallCaps|Small_Caps|Small.?Caps/i.test(name))return 'small';
  if(/BuyHold|Buy_Hold|Buy.?Hold/i.test(name))return 'buyhold';
  if(/Dividend/i.test(name))return 'dividendos';
  if(/FIIs/i.test(name))return 'fiis';
  if(/BDRs/i.test(name))return 'bdrs';
  return 'outros';
 }
 if(section(x)==='editorial'){
  if(/CAB[EÇ]A|CURIOSIDADE|LOGICA|FRAGILIDADE/i.test(name))return 'comportamento';
  if(/RISCO|HEDGE|DERIVATIV|LONG.?SHORT/i.test(name))return 'estrategia';
  return 'fundamentos';
 }
 if(section(x)==='cenarios'){
  if(/BITCOIN|IBOVESPA|SP500|EWZ/i.test(name))return 'mercados';
  if(/DOLAR|CAMBIO|JUROS|SELIC|FISCAL|URNA|ELEITORAL/i.test(name))return 'macro';
  if(/PATRIMONIO|ALOCACAO|EXTERIOR|DINHEIRO|RISCO|OPORTUNIDADE|FRAGILIDADE/i.test(name))return 'patrimonio';
  return 'outros';
 }
 return 'todos';
};
const ASSETS=[
 {name:'Petrobras',ticker:'PETR3 / PETR4',symbol:'PBR',re:/PETR[34]|PETROBRAS/i},
 {name:'Vale',ticker:'VALE3',symbol:'VALE',re:/VALE3|(?:^|[_\s-])VALE(?:[_\s-]|$)/i},
 {name:'Nike',ticker:'NKE / NIKE34',symbol:'NIKE',re:/NIKE34|(?:^|[_\s-])NKE(?:[_\s-]|$)|NIKE/i},
 {name:'ExxonMobil',ticker:'XOM / EXXO34',symbol:'XOM',re:/EXXO34|EXXON|(?:^|[_\s-])XOM(?:[_\s-]|$)/i},
 {name:'Microsoft',ticker:'MSFT34',symbol:'MS',re:/MSFT34|MICROSOFT/i},
 {name:'Amazon',ticker:'AMZO34',symbol:'AMZ',re:/AMZO34|AMAZON/i},
 {name:'Alphabet (Google)',ticker:'GOGL34',symbol:'G',re:/GOGL34|ALPHABET|GOOGLE/i},
 {name:'Meta Platforms',ticker:'M1TA34',symbol:'META',re:/M1TA34|META[_\s-]/i},
 {name:'Taiwan Semiconductor',ticker:'TSMC34',symbol:'TSMC',re:/TSMC34|TAIWAN[_\s-]?SEMICONDUCTOR|TSMC/i},
 {name:'XP Inc.',ticker:'XPBR31',symbol:'XP',re:/XPBR31|XP[_\s-]?INC/i},
 {name:'BlackRock',ticker:'BLAK34',symbol:'BLK',re:/BLAK34|BLACKROCK/i},
 {name:'Micron Technology',ticker:'MUTC34',symbol:'MU',re:/MUTC34|MICRON/i},
 {name:'Aura Minerals',ticker:'AURA33',symbol:'AURA',re:/AURA33|AURA[_\s-]?MINERALS/i},
 {name:'Mercado Livre',ticker:'MELI / MELI34',symbol:'MELI',re:/MELI34|MERCADOLIBRE|MERCADO[_\s-]?LIVRE/i},
 {name:'TOTVS',ticker:'TOTS3',symbol:'TOT',re:/TOTS3|TOTVS/i},
 {name:'Bradesco',ticker:'BBDC4',symbol:'BBDC',re:/BBDC[34]|BRADESCO/i},
 {name:'Sabesp',ticker:'SBSP3',symbol:'SAB',re:/SBSP3|SABESP/i},
 {name:'Unipar',ticker:'UNIP6',symbol:'UNI',re:/UNIP[346]|UNIPAR/i},
 {name:'TIM',ticker:'TIMS3',symbol:'TIM',re:/TIMS3|(?:^|[_\s-])TIM(?:[_\s-]|$)/i},
 {name:'Banco do Brasil',ticker:'BBAS3',symbol:'BB',re:/BBAS3|BANCO[_\s-]?DO[_\s-]?BRASIL/i},
 {name:'Direcional',ticker:'DIRR3',symbol:'DIR',re:/DIRR3|DIRECIONAL/i},
 {name:'PRIO',ticker:'PRIO3',symbol:'PRIO',re:/PRIO3|(?:^|[_\s-])PRIO(?:[_\s-]|$)/i},
 {name:'Ibovespa',ticker:'IBOV',symbol:'IBOV',re:/IBOVESPA|(?:^|[_\s-])IBOV(?:[_\s-]|$)/i},
 {name:'S&P 500',ticker:'SPX / SPY',symbol:'SPX',re:/SP500|S&P[_\s-]?500|S_P_500/i},
 {name:'EWZ',ticker:'EWZ',symbol:'EWZ',re:/(?:^|[_\s-])EWZ(?:[_\s-]|$)/i}
];
const DOMAINS={Petrobras:'petrobras.com.br',Vale:'vale.com',Nike:'nike.com',ExxonMobil:'exxonmobil.com',Microsoft:'microsoft.com',Amazon:'amazon.com', 'Alphabet (Google)':'google.com','Meta Platforms':'meta.com','Mercado Livre':'mercadolivre.com.br',TOTVS:'totvs.com',Bradesco:'bradesco.com.br',Sabesp:'sabesp.com.br',Unipar:'unipar.com',TIM:'tim.com.br','Banco do Brasil':'bb.com.br',Direcional:'direcional.com.br',PRIO:'prio3.com.br',Copel:'copel.com',Itaúsa:'itausa.com.br',TSMC:'tsmc.com','Taiwan Semiconductor':'tsmc.com','XP Inc.':'xpinc.com',BlackRock:'blackrock.com','Micron Technology':'micron.com','Aura Minerals':'auraminerals.com','BTG Pactual':'btgpactual.com','Ibovespa':'b3.com.br','S&P 500':'spglobal.com',EWZ:'ishares.com'};

Object.assign(DOMAINS,{
 'WEG':'weg.net','Suzano':'suzano.com.br','Taesa':'taesa.com.br',
 'Vivo':'vivo.com.br','Porto':'porto.com.br','CPFL Energia':'cpfl.com.br',
 'B3':'b3.com.br','Irani':'irani.com.br','Klabin':'klabin.com.br',
 'IRB(Re)':'irbbrasilre.com','AXIA Energia':'axia.com.br','ALLOS':'allos.com.br',
 'Kepler Weber':'kepler.com.br','Banco ABC Brasil':'abcbrasil.com.br',
 'BrasilAgro':'brasil-agro.com','Unifique':'unifique.com.br',
 'Grupo Fleury':'grupofleury.com.br','Smart Fit':'smartfit.com.br',
 'Brava Energia':'bravaenergia.com.br','Banco Inter':'inter.co','Berkshire Hathaway':'berkshirehathaway.com','NVIDIA':'nvidia.com','Apple':'apple.com','Tesla':'tesla.com','Broadcom':'broadcom.com','Ambev':'ambev.com.br','Itaú Unibanco':'itau.com.br','Embraer':'embraer.com'
});
const MORE_ASSETS=[
 {name:'Banco ABC Brasil',ticker:'ABCB4',re:/ABCB4|BANCO[_\s-]?ABC/i},
 {name:'BrasilAgro',ticker:'AGRO3',re:/AGRO3|BRASIL[_\s-]?AGRO/i},
 {name:'Unifique',ticker:'FIQE3',re:/FIQE3|UNIFIQUE/i},
 {name:'Grupo Fleury',ticker:'FLRY3',re:/FLRY3|FLEURY/i},
 {name:'Smart Fit',ticker:'SMFT3',re:/SMFT3|SMART[_\s-]?FIT/i},
 {name:'WEG',ticker:'WEGE3',re:/WEGE3|(?:^|[_\s-])WEG(?:[_\s-]|$)/i},
 {name:'Suzano',ticker:'SUZB3',re:/SUZB3|SUZANO/i},
 {name:'Taesa',ticker:'TAEE11',re:/TAEE11|TAESA/i},
 {name:'Vivo',ticker:'VIVT3',re:/VIVT3|TELEFONICA|TELEFÔNICA/i},
 {name:'Porto',ticker:'PSSA3',re:/PSSA3|PORTO[_\s-]?SEGURO/i},
 {name:'CPFL Energia',ticker:'CPFE3',re:/CPFE3|CPFL/i},
 {name:'B3',ticker:'B3SA3',re:/B3SA3/i},
 {name:'Irani',ticker:'RANI3',re:/RANI3|IRANI/i},
 {name:'Klabin',ticker:'KLBN11',re:/KLBN11|KLABIN/i},
 {name:'IRB(Re)',ticker:'IRBR3',re:/IRBR3|IRB[_\s-]?BRASIL/i},
 {name:'AXIA Energia',ticker:'AXIA3',re:/AXIA3|AXIA[_\s-]?ENERGIA/i},
 {name:'ALLOS',ticker:'ALOS3',re:/ALOS3|ALLOS/i},
 {name:'Kepler Weber',ticker:'KEPL3',re:/KEPL3|KEPLER/i},
 {name:'Brava Energia',ticker:'BRAV3',re:/BRAV3|BRAVA[_\s-]?ENERGIA/i},
 {name:'Banco Inter',ticker:'INBR34',re:/INBR34|INTERCO/i},
 {name:'Berkshire Hathaway',ticker:'BERK34',re:/BERK34|BERKSHIRE/i},
 {name:'NVIDIA',ticker:'NVDA / NVDC34',re:/NVDC34|\bNVIDIA\b/i},
 {name:'Apple',ticker:'AAPL / AAPL34',re:/AAPL34|\bAPPLE\b/i},
 {name:'Tesla',ticker:'TSLA / TSLA34',re:/TSLA34|\bTESLA\b/i},
 {name:'Broadcom',ticker:'AVGO / AVGO34',re:/AVGO34|\bBROADCOM\b/i},
 {name:'Ambev',ticker:'ABEV3',re:/ABEV3|\bAMBEV\b/i},
 {name:'Itaú Unibanco',ticker:'ITUB4',re:/ITUB4|ITAU[_\s-]?UNIBANCO/i},
 {name:'Embraer',ticker:'EMBJ3',re:/EMBJ3|\bEMBRAER\b/i}
];
const EXTRA_ASSETS=[
 {name:'Copel',re:/COPEL|CPLE[36]/i},
 {name:'Itaúsa',re:/ITA[UÚ]SA|ITSA[34]/i},
 {name:'TSMC',re:/TSMC|TSM[C]?34/i},
 {name:'BTLG11',re:/BTLG11/i},{name:'GARE11',re:/GARE11/i},{name:'HGLG11',re:/HGLG11/i},
 {name:'HGRU11',re:/HGRU11/i},{name:'PVBI11',re:/PVBI11/i},{name:'TRXF11',re:/TRXF11/i},
 {name:'XPML11',re:/XPML11/i},{name:'KNRI11',re:/KNRI11/i},{name:'VISC11',re:/VISC11/i},
 {name:'HGRE11',re:/HGRE11/i},{name:'MXRF11',re:/MXRF11/i},{name:'XPLG11',re:/XPLG11/i}
];

function assetInfo(x){
 const n=x.name||'';
 let found=MORE_ASSETS.find(a=>a.re.test(n))||ASSETS.find(a=>a.re.test(n))||EXTRA_ASSETS.find(a=>a.re.test(n));
 if(found&&(/MODELO_DIRR3/i.test(n)&&/UNIP6/i.test(n)))found=ASSETS.find(a=>a.name==='Unipar');
 if(found)return found;
 if(x.category==='fiis'){
  const m=n.match(/[A-Z]{4}11/i);if(m)return {name:m[0].toUpperCase(),ticker:m[0].toUpperCase()};
 }
 const m=n.match(/(?:^|[_-])([A-Z]{4}(?:34|31|11|3|4|6))(?:[_-]|\.|$)/i);
 if(m)return {name:m[1].toUpperCase(),ticker:m[1].toUpperCase()};
 return {name:nice(n).slice(0,34),ticker:''};
}
const chip=x=>'<span class="kicker">'+esc(x)+'</span>';
const moreMeta=x=>{
 const d=shortDate(x),p=publication(x),updated=/^\d{4}-\d{2}-\d{2}$/.test(x.updated_at||'')?x.updated_at:'';
 return esc(d)+(x.published_at?' · '+esc(p):'')+(updated&&updated!==x.published_at?' · Atualizado '+esc(datestr(updated)):'');
};
function cardCover(x){
 const src=coverSrc(x);
 if(src)return '<div class="report-cover"><img src="'+esc(src)+'" loading="lazy" alt="Capa: '+esc(title(x))+'"></div>';
 return '<div class="report-cover fallback"><div class="cover-fallback"><small>GM RESEARCH</small>'+esc(title(x))+'</div></div>';
}
function card(x){
 const label=x.category==='analista-curioso'?'O ANALISTA CURIOSO':section(x)==='editorial'?'GM EDITORIAL':section(x)==='cenarios'?'CENÁRIOS & MERCADO':'GM RESEARCH';
 return '<article class="report-card">'+cardCover(x)+'<div class="report-card-content">'+chip(label)
  +'<h3>'+esc(title(x))+'</h3><p class="doc-blurb">'+esc(description(x))+'</p>'
  +'<div class="doc-meta">'+moreMeta(x)+'</div>'
  +'<a class="report-action" target="_blank" rel="noopener" href="'+esc(href(x))+'" aria-label="Abrir PDF '+esc(title(x))+'">Ler publicação <span aria-hidden="true">↗</span></a></div></article>';
}
function cards(rows){return rows.length?'<div class="editorial-grid">'+rows.map(card).join('')+'</div>':'<div class="empty">Nenhum documento nesta seleção.</div>'}
function titleForAsset(x,a){const n=x.name;
 if(/EDICAO_EDITORIAL/i.test(n))return 'Dossiê · Edição editorial';
 if(/GRAFICOS|ESTUDO_VISUAL/i.test(n))return 'Estudo visual e gráficos';
 if(/MEMORANDO/i.test(n))return 'Memorando operacional';
 if(/3T26|RESULTADO/i.test(n))return 'Dossiê e resultados · 3T26';
 return 'Dossiê fundamentalista';
}
function assetLogo(a){
 const domain=DOMAINS[a.name];
 const initials=(a.name||'GM').slice(0,2).toUpperCase();
 return '<div class="asset-logo">'+(domain
  ?'<img src="https://www.google.com/s2/favicons?domain='+encodeURIComponent(domain)+'&sz=128" alt="" loading="lazy" onerror="this.nextElementSibling.style.display=\'grid\';this.remove()"><span style="display:none">'+esc(initials)+'</span>'
  :'<span>'+esc(initials)+'</span>')+'</div>';
}
function groupsForAssets(rows){
 const by=new Map;
 rows.forEach(x=>{const a=assetInfo(x),key=a.name;
  if(!by.has(key))by.set(key,{asset:a,items:[]});by.get(key).items.push(x)
 });
 const groups=[...by.values()];
 for(const g of groups)g.items.sort((a,b)=>score(b).localeCompare(score(a)));
 return groups;
}
function assetCard(g){
 const x=g.items[0],a=g.asset,old=g.items.slice(1);
 return '<article class="asset-card"><div class="asset-main"><div class="asset-head">'+assetLogo(a)+'<div class="asset-company"><h3>'+esc(a.name)+'</h3><small>'+esc(a.ticker||'Dossiê GM')+'</small></div></div>'
  +'<div class="asset-current">EDIÇÃO MAIS RECENTE NO ACERVO</div>'
  +'<p class="doc-title">'+esc(titleForAsset(x,a))+'</p><div class="asset-subline">'+moreMeta(x)+'</div>'
  +'<a class="asset-open" target="_blank" rel="noopener" href="'+esc(href(x))+'">Abrir dossiê <span aria-hidden="true">↗</span></a></div>'
  +(old.length?'<details class="history"><summary>Ver '+old.length+' '+(old.length===1?'edição anterior':'edições anteriores')+' <span aria-hidden="true">⌄</span></summary><ol>'+old.map(o=>'<li><a target="_blank" rel="noopener" href="'+esc(href(o))+'">'+esc(titleForAsset(o,a))+'</a><small>'+moreMeta(o)+'</small></li>').join('')+'</ol></details>':'')+'</article>';
}
const countType=sectionName=>DATA.filter(x=>section(x)===sectionName).length;
const subOptions={
 dossies:[['todos','Todos'],['acoes','Ações B3'],['bdrs','BDRs & exterior'],['fiis','FIIs']],
 carteiras:[['todos','Todas'],['dividendos','Dividendos'],['buyhold','Buy & Hold'],['small','Small Caps'],['fiis','FIIs'],['bdrs','BDRs']],
 cenarios:[['todos','Todos'],['macro','Macroeconomia'],['mercados','Mercados & índices'],['patrimonio','Patrimônio'],['renda-fixa','Renda Fixa']],
 editorial:[['todos','Todas'],['comportamento','Psicologia & comportamento'],['estrategia','Estratégias & risco'],['fundamentos','Fundamentos']],
 arquivo:[['todos','Tudo'],['dossies','Dossiês'],['carteiras','Carteiras'],['cenarios','Cenários'],['editorial','GM Editorial'],['curioso','O Analista Curioso']]
};
function filterRows(rows,sec){
 if(UI.sub==='todos')return rows;
 if(sec==='arquivo')return rows.filter(x=>section(x)===UI.sub);
 return rows.filter(x=>subType(x)===UI.sub);
}
function sortMode(sec=UI.query?'busca':UI.section){
 return UI.sortBy[sec]||(sec==='dossies'?'az':sec==='arquivo'||sec==='busca'?'recentes':'padrao');
}
function chronology(x){
 const updated=/^\d{4}-\d{2}-\d{2}$/.test(x.updated_at||'')?x.updated_at:'';
 const published=/^\d{4}-\d{2}-\d{2}$/.test(x.published_at||'')?x.published_at:'';
 const month=filenameMonth(x);
 return updated||published||(/^\d{4}-\d{2}$/.test(month)?month+'-01':'0000-00-00');
}
function compareChronology(a,b){return chronology(b).localeCompare(chronology(a))||score(b).localeCompare(score(a))}
function optionsUI(sec){
 const o=subOptions[sec]||[],selected=sortMode(sec);
 const sortControl='<label class="sort" for="sorter">Organizar por <select id="sorter" aria-label="Ordenar publicações">'
  +'<option value="padrao"'+(selected==='padrao'?' selected':'')+'>Padrão da coleção</option>'
  +'<option value="az"'+(selected==='az'?' selected':'')+'>Nome (A–Z)</option>'
  +'<option value="recentes"'+(selected==='recentes'?' selected':'')+'>Mais recentes</option>'
  +'</select></label>';
 return '<div class="controls"><div class="filter-pills" role="group" aria-label="Filtrar publicações">'+o.map(([k,v])=>'<button type="button" class="pill'+(UI.sub===k?' active':'')+'" data-sub="'+esc(k)+'" aria-pressed="'+(UI.sub===k?'true':'false')+'">'+esc(v)+'</button>').join('')+'</div>'+sortControl+'</div>'
  +(selected==='recentes'?'<p class="sort-note">Ordenação por última atualização registrada no acervo; quando ela não existe, utiliza a data de publicação ou o mês da edição.</p>':'');
}
function sortDocs(rows,sec=UI.query?'busca':UI.section){
 const mode=sortMode(sec);
 return rows.slice().sort((a,b)=>mode==='az'
  ?title(a).localeCompare(title(b),'pt-BR',{sensitivity:'base'})||compareChronology(a,b)
  :mode==='recentes'?compareChronology(a,b):score(b).localeCompare(score(a)));
}
function sectionHead(t,subtitle,n){
 return '<div class="subhero"><div class="page-width subhero-inner"><div><div class="eyebrow">BIBLIOTECA GM RESEARCH</div><h1>'+esc(t)+'</h1><p>'+esc(subtitle)+'</p></div><div class="subhero-count">'+moneyCount(n)+'<small>documentos no acervo</small></div></div></div>';
}
function sectionBlock(label,desc,rows){
 return '<section class="shelf"><div class="block-heading"><div><h2>'+esc(label)+'</h2><p>'+esc(desc)+'</p></div></div>'+cards(rows)+'</section>';
}
function renderDossies(){
 const rows=DATA.filter(x=>section(x)==='dossies');
 const filtered=filterRows(rows,'dossies');
 const groups=groupsForAssets(filtered);
 groups.sort((a,b)=>sortMode('dossies')==='recentes'
   ?(Math.max(...b.items.map(x=>Date.parse(chronology(x))||0))-Math.max(...a.items.map(x=>Date.parse(chronology(x))||0)))||a.asset.name.localeCompare(b.asset.name,'pt-BR',{sensitivity:'base'})
   :a.asset.name.localeCompare(b.asset.name,'pt-BR',{sensitivity:'base'}));
 return sectionHead('Dossiês de investimentos','Análises por empresa e ativo. A edição mais recente aparece primeiro; os estudos antigos continuam preservados em cada ficha.',rows.length)
  +'<div class="page-width content-area">'+optionsUI('dossies')+'<p class="result-line">'+groups.length+' ativos · '+filtered.length+' documentos nesta seleção</p>'
  +(groups.length?'<div class="asset-grid">'+groups.map(assetCard).join('')+'</div>':'<div class="empty">Nenhum dossiê nesta categoria.</div>')+'</div>';
}
function portfolioFamily(x){
 const n=x.name;
 if(/SmallCaps|Small_Caps|Small.?Caps/i.test(n))return 'Small Caps';
 if(/BuyHold|Buy_Hold|Buy.?Hold/i.test(n))return 'Buy & Hold';
 if(/Dividend/i.test(n))return 'Dividendos';
 if(/FIIs/i.test(n))return 'Fundos Imobiliários';
 if(/BDRs/i.test(n))return 'BDRs';
 return 'Outras carteiras';
}
function portfolioMonthInfo(x){
 const m=filenameMonth(x);
 if(!/^\d{4}-\d{2}$/.test(m||''))return {month:'Arquivo',year:'Histórico',full:'Edição do acervo'};
 const names=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
 const i=Number(m.slice(5))-1;
 return {month:names[i]||'Edição',year:m.slice(0,4),full:(names[i]||'Edição')+' de '+m.slice(0,4)};
}
const portfolioDescriptions={
 'Dividendos':'Ações com foco em dividendos e geração de renda.',
 'Buy & Hold':'Investimentos pensados para o longo prazo.',
 'Small Caps':'Empresas de menor capitalização e potencial de crescimento.',
 'Fundos Imobiliários':'Fundos imobiliários e geração recorrente de renda.',
 'BDRs':'Diversificação internacional com exposição a empresas globais.'
};
const portfolioSymbols={
 'Dividendos':'◇','Buy & Hold':'∞','Small Caps':'↗','Fundos Imobiliários':'▣','BDRs':'◎'
};
function portfolioMonthCard(x,fam,isNewest){
 const info=portfolioMonthInfo(x),src=coverSrc(x);
 const cover=src
  ?'<img loading="lazy" src="'+esc(src)+'" alt="Capa da edição de '+esc(info.full)+'">'
  :'<span class="portfolio-cover-fallback">GM RESEARCH<br>'+esc(fam)+'</span>';
 return '<a class="portfolio-month-card'+(isNewest?' current':'')+'" href="'+esc(href(x))+'" target="_blank" rel="noopener" title="'+esc(x.name)+'" aria-label="Abrir '+esc(fam)+', edição '+esc(info.full)+'">'
  +'<span class="portfolio-month-cover">'+cover+'</span>'
  +'<span class="portfolio-edition-details">'
  +(isNewest?'<span class="portfolio-current-tag">Mais recente</span>':'')
  +'<span class="portfolio-month-label">'+esc(info.month)+'</span>'
  +'<span class="portfolio-month-year">'+esc(info.year)+'</span>'
  +'<span class="portfolio-edition-link">Abrir PDF ↗</span>'
  +'</span></a>';
}
function renderCarteiras(){
 const rows=DATA.filter(x=>section(x)==='carteiras'),filtered=filterRows(rows,'carteiras');
 const by=new Map;
 for(const x of filtered){
  const fam=portfolioFamily(x);
  if(!by.has(fam))by.set(fam,[]);
  by.get(fam).push(x);
 }
 const familyOrder=['Dividendos','Buy & Hold','Small Caps','Fundos Imobiliários','BDRs','Outras carteiras'];
 const families=[...by.entries()].sort((a,b)=>sortMode('carteiras')==='az'
   ?a[0].localeCompare(b[0],'pt-BR',{sensitivity:'base'})
   :sortMode('carteiras')==='recentes'
    ?compareChronology(a[1].slice().sort(compareChronology)[0],b[1].slice().sort(compareChronology)[0])
    :familyOrder.indexOf(a[0])-familyOrder.indexOf(b[0]));
 const html=families.map(([fam,list])=>{
  list.sort((a,b)=>(filenameMonth(b)||'').localeCompare(filenameMonth(a)||'')||score(b).localeCompare(score(a)));
  return '<section class="portfolio-shelf" aria-label="Carteira '+esc(fam)+'">'
   +'<div class="portfolio-family">'
   +'<span class="portfolio-family-symbol" aria-hidden="true">'+esc(portfolioSymbols[fam]||'GM')+'</span>'
   +'<span class="portfolio-family-label">CARTEIRA GM RESEARCH</span>'
   +'<h2>'+esc(fam)+'</h2>'
   +'<p>'+esc(portfolioDescriptions[fam]||'Carteiras de investimento da GM Research.')+'</p>'
   +'<span class="portfolio-count">'+list.length+' '+(list.length===1?'edição disponível':'edições disponíveis')+'</span></div>'
   +'<div class="portfolio-month-line">'
   +'<div class="portfolio-line-heading"><span>Edições por mês</span><span>Selecione uma capa para abrir ↗</span></div>'
   +'<div class="portfolio-months" role="list" aria-label="Meses disponíveis: '+esc(fam)+'">'
   +list.map((x,i)=>portfolioMonthCard(x,fam,i===0)).join('')+'</div>'
   +'</div></section>';
 }).join('');
 return sectionHead('Carteiras GM Research','Cada carteira tem sua própria linha de edições. Compare os meses lado a lado e abra diretamente a versão desejada, sem perder o histórico.',rows.length)
  +'<div class="page-width content-area">'+optionsUI('carteiras')
  +(families.length?'<div class="portfolio-shelves">'+html+'</div>':'<div class="empty">Nenhuma carteira nesta seleção.</div>')
  +'<p class="portfolio-helper">Todas as versões continuam disponíveis nos mesmos arquivos. A identificação “Mais recente” considera a edição mais nova encontrada no acervo.</p></div>';
}
function renderCenarios(){
 const rows=DATA.filter(x=>section(x)==='cenarios');
 // Preservar todas as versões no Acervo completo; na vitrine, preferir a edição aprovada.
 const hasCustoAprovado=rows.some(x=>x.name==='GM_Research_Custo_Brasil_2026-11-19_APROVADO.pdf');
 const shelfRows=hasCustoAprovado?rows.filter(x=>x.name!=='GM_Research_Custo_Brasil_2026-11-19_DEFINITIVO.pdf'):rows;
 const filtered=sortDocs(filterRows(shelfRows,'cenarios'));
 // Começar pelas capas mais fortes e pelos assuntos variados, em vez de abrir
 // sempre com várias capas de projeções para 2027 visualmente semelhantes.
 const spotlightOrder=[
  'Emergentes_IA_Estudo_Estrutural',
  'Custo_Brasil_2026-11-19_APROVADO',
  'Observatorio_de_Gestoras',
  'Especial_Dolar_2026',
  'Ibovespa_3T26_O_Teste_do_Caixa',
  'Depois_das_Urnas',
  'Mapa_das_Oportunidades'
 ];
 const editorialOrder=sortMode('cenarios')==='padrao';
 const spotlight=UI.sub==='todos'&&editorialOrder?spotlightOrder.map(key=>filtered.find(x=>x.name.includes(key))).filter(Boolean):[];
 const featuredNames=new Set(spotlight.map(x=>x.name));
 const remainder=filtered.filter(x=>!featuredNames.has(x.name));
 const buckets=[['Panorama e oportunidades para 2027',x=>/2027/i.test(x.name),'Estudos prospectivos sobre economia, riscos e alocação.'],
 ['Economia, moedas e conjuntura',x=>/DOLAR|CAMBIO|JUROS|FISCAL|URNA|ELEITORAL|GESTORAS/i.test(x.name),'Câmbio, juros, política econômica e movimentos do mercado.'],
 ['Mercados, índices e ativos globais',x=>/BITCOIN|IBOVESPA|SP500|EWZ/i.test(x.name),'Panoramas de bolsa, índices e Bitcoin.'],
 ['Outros estudos de mercado',x=>true,'Outras publicações da GM Research.']];
 const shelves=!editorialOrder
  ?sectionBlock('Publicações ordenadas',sortMode('cenarios')==='az'?'Em ordem alfabética de título.':'Em ordem de publicação ou edição, conforme os dados disponíveis.',filtered)
  :UI.sub==='todos'
    ?(spotlight.length?sectionBlock('Leituras em destaque','Capas e temas selecionados para apresentar a diversidade da GM Research.',spotlight):'')+renderBucketed(remainder,buckets)
    :sectionBlock((subOptions.cenarios.find(x=>x[0]===UI.sub)||[])[1]||'Estudos','',filtered);
 return sectionHead('Cenários & Mercado','Estudos de conjuntura, economia e perspectivas. Organizados por tema, com uma seleção inicial de leituras de destaque.',rows.length)
  +'<div class="page-width content-area">'+optionsUI('cenarios')+'<div class="editorial-shelves">'+shelves+'</div></div>';
}
function renderBucketed(items,buckets){
 const seen=new Set,sections=[];
 for(const [name,pred,desc] of buckets){const chosen=items.filter(x=>!seen.has(x.name)&&pred(x));if(!chosen.length)continue;chosen.forEach(x=>seen.add(x.name));sections.push(sectionBlock(name,desc,chosen))}
 return sections.join('');
}
function renderEditorial(){
 const rows=DATA.filter(x=>section(x)==='editorial'),filtered=sortDocs(filterRows(rows,'editorial'));
 const buckets=[['Psicologia do investidor e pensamento crítico',x=>subType(x)==='comportamento','Decisões, vieses, fundamentos do método e comportamento de mercado.'],
 ['Gestão de risco e estratégias',x=>subType(x)==='estrategia','Derivativos, hedge, proteção e estratégias relativas.'],
 ['Fundamentos e construção patrimonial',x=>subType(x)==='fundamentos','Análise, alocação e construção de carteiras de longo prazo.']];
 return sectionHead('GM Editorial','Uma biblioteca permanente de livros, ensaios e publicações de referência. Aqui a obra importa mais que a data.',rows.length)
  +'<div class="page-width content-area">'+optionsUI('editorial')+'<div class="editorial-shelves">'+(UI.sub==='todos'&&sortMode('editorial')==='padrao'?renderBucketed(filtered,buckets):sectionBlock('Obras ordenadas','Livros e estudos organizados pelo critério selecionado.',filtered))+'</div></div>';
}
function renderCurioso(){
 const rows=DATA.filter(x=>section(x)==='curioso');
 const volumes=rows.filter(x=>/_Vol_(\d{3})_/i.test(x.name)).sort((a,b)=>{
   if(sortMode('curioso')!=='padrao')return sortMode('curioso')==='az'
     ?title(a).localeCompare(title(b),'pt-BR',{sensitivity:'base'})
     :compareChronology(a,b);
   const aa=(a.name.match(/_Vol_(\d{3})_/i)||[])[1]||'999',bb=(b.name.match(/_Vol_(\d{3})_/i)||[])[1]||'999';
   return aa.localeCompare(bb);
 });
 const extras=sortDocs(rows.filter(x=>!/_Vol_(\d{3})_/i.test(x.name)),'curioso');
 const volumeCards=volumes.map((x,i)=>'<article class="report-card">'+cardCover(x)
   +'<div class="report-card-content"><div class="card-index">VOLUME '+esc((x.name.match(/_Vol_(\d{3})_/i)||[])[1]||String(i+1).padStart(3,'0'))+'</div>'
   +'<h3>'+esc(title(x))+'</h3><div class="doc-meta">'+moreMeta(x)+'</div>'
   +'<a class="report-action" href="'+esc(href(x))+'" target="_blank" rel="noopener">Ler volume <span aria-hidden="true">↗</span></a></div></article>').join('');
 const specialShelf=extras.length?'<section class="section-block"><div class="block-heading"><div><div class="eyebrow">CADERNOS COMPLEMENTARES</div><h2>Estudos especiais da coleção</h2><p>Publicações independentes, fora da numeração dos volumes.</p></div></div>'+cards(extras)+'</section>':'';
 return sectionHead('O Analista Curioso','Uma coleção de perguntas que desafiam respostas fáceis sobre o mercado e a economia.',rows.length)
  +'<div class="page-width content-area"><div class="curious-intro"><div><div class="eyebrow light">COLEÇÃO GM · EDIÇÕES NUMERADAS</div>'
  +'<h2>Curiosidade como método. Análise como resposta.</h2>'
  +'<p>Volumes definitivos e aprovados, preservados em ordem numérica. Protótipos e versões em avaliação não entram no catálogo.</p></div>'
  +'<div class="curious-num" aria-label="'+volumes.length+' volumes">'+String(volumes.length).padStart(2,'0')+'</div></div>'
  +optionsUI('curioso')+'<div class="curious-grid">'+volumeCards+'</div>'+specialShelf+'</div>';
}
function archiveRows(rows){
 const visible=rows.slice(0,UI.page*PAGE);
 return (visible.length?'<div class="archive-list">'+visible.map(x=>'<div class="archive-row"><div><strong>'+esc(title(x))+'</strong><small>'+esc(({dossies:'Dossiês',carteiras:'Carteiras',cenarios:'Cenários',editorial:'GM Editorial',curioso:'O Analista Curioso'})[section(x)]||'Acervo')+' · '+esc(x.name)+'</small></div><span class="archive-date">'+esc(shortDate(x))+'</span><a class="archive-open" href="'+esc(href(x))+'" target="_blank" rel="noopener">PDF ↗</a></div>').join('')+'</div>':'<div class="empty">Não foram encontrados documentos com esses filtros.</div>')
 +(rows.length>visible.length?'<button class="load-more" data-more="1">Mostrar mais '+Math.min(PAGE,rows.length-visible.length)+' documentos</button>':'');
}
function renderArquivo(){
 const rows=sortDocs(filterRows(DATA,'arquivo'));
 return sectionHead('Acervo completo','Todos os documentos publicados, inclusive edições antigas. Nenhuma publicação é escondida ou descartada pela nova organização.',DATA.length)
  +'<div class="page-width content-area">'+optionsUI('arquivo')+'<p class="result-line">'+rows.length+' documentos encontrados</p>'+archiveRows(rows)+'</div>';
}
/* Fotografia editorial: seis imagens distintas, sem alterar coleções ou PDFs.
   Unsplash CDN: imagens redimensionadas para o banner, sem arte/ícones vetoriais. */
const collectionArt={
 dossies:{url:'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=920&q=80',label:'ANÁLISE DE EMPRESAS'},
 carteiras:{url:'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=920&q=80',label:'ESTRATÉGIA & ALOCAÇÃO'},
 cenarios:{url:'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=920&q=80',label:'ECONOMIA & MERCADOS'},
 editorial:{url:'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=920&q=80',label:'LIVROS & PESQUISA'},
 curioso:{url:'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=920&q=80',label:'INVESTIGAÇÃO & IDEIAS'},
 arquivo:{url:'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=920&q=80',label:'ACERVO INSTITUCIONAL'}
};
function collectionCard(sec,symbol,heading,desc,n){
 const art=collectionArt[sec]||collectionArt.arquivo;
 const visual='<div class="collection-visual"><img src="'+esc(art.url)+'" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer"><span class="collection-image-label">'+esc(art.label)+'</span></div>';
 return '<a href="'+esc(navURL(sec))+'" class="collection-card collection-'+esc(sec)+'" data-go="'+esc(sec)+'" aria-label="Explorar '+esc(heading)+': '+esc(desc)+'">'
  +'<div class="collection-top"><span class="collection-kicker">COLEÇÃO GM RESEARCH</span><span class="collection-total">'+n+' publicações</span></div>'
  +visual
  +'<h3>'+esc(heading)+'</h3><p>'+esc(desc)+'</p>'
  +'<footer><span>Conhecer a coleção</span><span class="collection-arrow" aria-hidden="true">↗</span></footer></a>';
}
function pick(namepart){return DATA.find(x=>x.name.includes(namepart))}
function featureCarousel(rows){
 if(!rows.length)return '<div class="empty">Destaques em atualização.</div>';
 // Exibir as doze capas de uma vez, sem arrastar e sem alterar os PDFs.
 // Grade 6x2 no desktop; colunas responsivas em telas menores.
 return '<div class="feature-grid" role="list" aria-label="Doze leituras em destaque da GM Research">'
  +rows.map(x=>{
   const label=x.category==='analista-curioso'?'O ANALISTA CURIOSO':section(x)==='editorial'?'GM EDITORIAL':section(x)==='cenarios'?'CENÁRIOS & MERCADO':section(x)==='carteiras'?'CARTEIRAS':'DOSSIÊ';
   return '<a class="feature-tile" role="listitem" href="'+esc(href(x))+'" target="_blank" rel="noopener" aria-label="Abrir publicação: '+esc(title(x))+'">'
    +cardCover(x)
    +'<div class="feature-tile-body"><span class="feature-tile-kicker">'+esc(label)+'</span>'
    +'<h3>'+esc(title(x))+'</h3><span class="feature-tile-action">Ler publicação <span aria-hidden="true">↗</span></span></div></a>';
  }).join('')+'</div>';
}
function renderInicio(){
 // A vitrine reúne coleções distintas e atualiza seus destaques apenas quando o PDF existe no catálogo.
 // Curadoria visual: capas marcantes no início, com diversidade real de coleções.
 // Apenas arquivos presentes no catálogo entram na vitrine.
 const choices=[
  'Emergentes_IA_Estudo_Estrutural',
  'Custo_Brasil_2026-11-19_APROVADO',
  'O_Preco_da_Fragilidade',
  'O_Analista_Curioso_Vol_007',
  'Especial_Dolar_2026',
  'Depois_das_Urnas',
  'Derivativos_Edicao_Tecnica_Visual',
  'GM_Dividendos_Novembro',
  'Ibovespa_3T26_O_Teste_do_Caixa',
  'Observatorio_de_Gestoras',
  'Dossie_NVIDIA',
  'Especial_Bitcoin'
 ];
 const chosen=choices.map(pick).filter(Boolean);
 const heroDocs=['Emergentes_IA_Estudo_Estrutural','O_Preco_da_Fragilidade','O_Analista_Curioso_Vol_007'].map(pick).filter(Boolean);
 const cnt=Object.fromEntries(['dossies','carteiras','cenarios','editorial','curioso'].map(k=>[k,countType(k)]));
 return '<section class="hero"><div class="page-width hero-inner"><div><div class="eyebrow light">GM RESEARCH · ACERVO DE ANÁLISE</div>'
  +'<h1>Conhecimento para <em>decisões melhores.</em></h1>'
  +'<p>Um acervo de análises, estratégias e perspectivas para quem investe com método. Pesquise por empresa, explore uma coleção ou acompanhe os estudos mais recentes.</p>'
  +'<div class="action-group"><a class="primary-button" href="'+navURL('dossies')+'" data-go="dossies">Explorar dossiês ↗</a><a class="ghost-button" href="'+navURL('editorial')+'" data-go="editorial">Conhecer a GM Editorial</a></div></div>'
  +'<div class="hero-art" aria-hidden="true"><div class="hero-panel"></div>'+heroDocs.map((x,i)=>'<img class="cover-'+['one','two','three'][i]+'" src="'+esc(coverSrc(x))+'" alt="">').join('')+'<div class="hero-caption">Pesquisa · Perspectivas · Estratégia</div></div></div></section>'
  +'<div class="page-width"><div class="quick-stats"><div class="quick-stat"><strong>'+DATA.length+'</strong><span>publicações<br>preservadas</span></div>'
  +'<div class="quick-stat"><strong>'+cnt.dossies+'</strong><span>dossiês e<br>ativos</span></div>'
  +'<div class="quick-stat"><strong>'+cnt.editorial+'</strong><span>livros e<br>ensaios</span></div>'
  +'<div class="quick-stat"><strong>'+cnt.curioso+'</strong><span>publicações do<br>Analista Curioso</span></div></div>'
  +'<section class="section-block"><div class="block-heading"><div><div class="eyebrow">DESTAQUES DA BIBLIOTECA</div><h2>Investigações que despertam perguntas</h2>'
  +'<p>Uma seleção de assuntos para descobrir a GM Research: mercados, eleições, estratégias, empresas e ideias fora do consenso.</p></div>'
  +'<a href="'+navURL('arquivo')+'" class="text-link" data-go="arquivo">Ver todo o catálogo ↗</a></div>'+featureCarousel(chosen)+'</section>'
  +'<section class="section-block collections-section"><div class="block-heading"><div><div class="eyebrow">ENCONTRE SEU CAMINHO</div><h2>Explore por coleção</h2>'
  +'<p>Escolha o tipo de análise que procura. Cada coleção tem uma proposta própria, do acompanhamento mensal às grandes perguntas do mercado.</p></div></div>'
  +'<div class="collection-grid">'
  +collectionCard('dossies','↗','Dossiês','Investigue empresas e ativos: fundamentos, riscos, valuation e histórico de ações, BDRs e FIIs.',cnt.dossies)
  +collectionCard('carteiras','◇','Carteiras','Compare as estratégias de Dividendos, Buy & Hold, Small Caps, FIIs e BDRs em edições mensais.',cnt.carteiras)
  +collectionCard('cenarios','◎','Cenários & Mercado','Entenda o ambiente econômico: eleições, juros, câmbio, índices, IA e cenários para o patrimônio.',cnt.cenarios)
  +collectionCard('editorial','▣','GM Editorial','Aprofunde ideias de longo prazo sobre comportamento, risco, derivativos, método e construção de riqueza.',cnt.editorial)
  +collectionCard('curioso','✧','O Analista Curioso','Explore perguntas provocativas e hipóteses fora do consenso em volumes numerados e estudos especiais.',cnt.curioso)
  +collectionCard('arquivo','≡','Acervo completo','Pesquise todos os documentos, incluindo edições anteriores, publicações históricas e estudos especiais.',DATA.length)
  +'</div></section>'
  +'<div class="notice">Todos os PDFs e seus endereços originais continuam preservados. Você pode acessar edições anteriores nas seções ou consultar o Acervo completo.</div></div>';
}
function renderSearch(){
 const q=plain(UI.query),rows=sortDocs(DATA.filter(x=>plain([title(x),x.name,x.display_name,assetInfo(x).ticker,assetInfo(x).name,section(x),subType(x)].join(' ')).includes(q)),'busca');
 return sectionHead('Resultados da busca','Pesquisa em todo o acervo, incluindo títulos, tickers, assuntos e versões antigas.',rows.length)
  +'<div class="page-width content-area">'+optionsUI('busca')+'<p class="result-line">'+rows.length+' documentos para "'+esc(UI.query)+'"</p>'+archiveRows(rows)+'</div>';
}
function render(){
 if(!DATA.length)return;
 const sectionName=UI.query?'busca':UI.section;
 const parts={inicio:renderInicio,dossies:renderDossies,carteiras:renderCarteiras,cenarios:renderCenarios,editorial:renderEditorial,curioso:renderCurioso,arquivo:renderArquivo,busca:renderSearch};
 $('#app').innerHTML=(parts[sectionName]||renderInicio)();
 document.querySelectorAll('.nav-item').forEach(a=>{const active=a.dataset.go===sectionName;a.setAttribute('aria-current',active?'page':'false')});
 document.title=(sectionName==='inicio'?'Biblioteca':({dossies:'Dossiês',carteiras:'Carteiras',cenarios:'Cenários & Mercado',editorial:'GM Editorial',curioso:'O Analista Curioso',arquivo:'Acervo completo',busca:'Busca'})[sectionName]||'Biblioteca')+' | GM Research';
}
function syncURL(replace){
 const p=new URLSearchParams;
 if(UI.query)p.set('q',UI.query);
 else if(UI.section!=='inicio'){p.set('sec',UI.section);if(UI.sub!=='todos')p.set('tipo',UI.sub)}
 history[replace?'replaceState':'pushState']({},'',location.pathname+(p.toString()?'?'+p.toString():'')); 
}
function go(sec,sub){
 UI.section=SEC.includes(sec)?sec:'inicio';UI.sub=sub||'todos';UI.page=1;UI.query='';lastSection=UI.section;
 $('#global-search').value='';syncURL(false);render();window.scrollTo({top:0,behavior:'instant'});
}
function initFromURL(){
 const p=new URLSearchParams(location.search);
 const q=p.get('q')||'';
 UI.query=q;UI.section=SEC.includes(p.get('sec'))?p.get('sec'):'inicio';
 UI.sub=p.get('tipo')||'todos';UI.page=1;
 $('#global-search').value=q;render();
}
document.addEventListener('click',ev=>{
 const featureStep=ev.target.closest('button[data-feature-step]');
 if(featureStep){
  const rail=document.querySelector('[data-feature-rail]');
  if(rail){
   const card=rail.querySelector('.report-card');
   const step=(card?card.getBoundingClientRect().width+18:300)*2;
   rail.scrollBy({left:step*Number(featureStep.dataset.featureStep),behavior:'smooth'});
  }
  return;
 }
 const link=ev.target.closest('a[data-go]');
 if(link){ev.preventDefault();go(link.dataset.go);return}
 const sub=ev.target.closest('button[data-sub]');
 if(sub){UI.sub=sub.dataset.sub;UI.page=1;syncURL(true);render();return}
 const more=ev.target.closest('button[data-more]');
 if(more){UI.page++;render();return}
});
document.addEventListener('change',ev=>{if(ev.target.id==='sorter'){
 const sec=UI.query?'busca':UI.section;
 UI.sortBy[sec]=ev.target.value;UI.page=1;render();
}});
$('#global-search').addEventListener('input',ev=>{
 UI.query=ev.target.value.trim();UI.page=1;
 if(UI.query.length){lastSection=UI.section}else UI.section=lastSection||'inicio';
 syncURL(true);render();
});
window.addEventListener('popstate',initFromURL);
async function boot(){
 try{
 const response=await fetch('./manifest.json?v='+Date.now(),{cache:'no-store'});
 if(!response.ok)throw Error('Não foi possível carregar o catálogo (HTTP '+response.status+').');
 const items=await response.json();
 if(!Array.isArray(items))throw Error('O catálogo está em formato inválido.');
 DATA=items.filter(x=>x&&typeof x.name==='string'&&typeof x.path==='string'&&/^documentos\/[a-z-]+\//.test(x.path)&&x.name.toLowerCase().endsWith('.pdf'));
 // Every manifest PDF remains in the full archive regardless of type.
 initFromURL();
 const h=$('#catalog-total');if(h)h.textContent=String(DATA.length);
 }catch(e){
 $('#app').innerHTML='<div class="page-width" style="padding:70px 0"><div class="empty">'+esc(e.message)+' <button class="load-more" data-retry="1">Tentar novamente</button></div></div>';
 document.querySelector('[data-retry]')?.addEventListener('click',boot,{once:true});
 }
}
boot();
})();