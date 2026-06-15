-- ============================================================
-- Seed REAL — Apoio Rural
-- Fundos extraídos de fontes oficiais e especializadas (jun 2026).
-- ============================================================
-- ATENCAO: TODOS marcados como NEEDS_REVIEW nas notas internas.
-- Os avisos PEPAC abrem POR PERIODOS. Valores e prazos mudam a
-- cada concurso. VALIDAR sempre o aviso especifico antes de usar
-- num relatorio. As datas referem-se a periodos decorridos/previstos.
-- ============================================================

insert into tag_categories (slug, label) values
  ('regiao', 'Regiao'),
  ('tipo_promotor', 'Tipo de promotor'),
  ('tipo_despesa', 'Tipo de despesa'),
  ('setor', 'Setor'),
  ('objetivo', 'Objetivo')
on conflict (slug) do nothing;

insert into tags (category_id, slug, label)
select c.id, v.slug, v.label
from (values
  ('regiao', 'nacional', 'Nacional / Continente'),
  ('regiao', 'alentejo', 'Alentejo'),
  ('regiao', 'algarve', 'Algarve'),
  ('regiao', 'centro', 'Centro'),
  ('regiao', 'interior', 'Interior / zona desfavorecida'),
  ('regiao', 'transicao_justa', 'Transicao Justa (Alcacer, Grandola, Odemira, Santiago do Cacem, Sines)'),
  ('tipo_promotor', 'jovem_agricultor', 'Jovem agricultor (18-40)'),
  ('tipo_promotor', 'pequeno_produtor', 'Pequeno produtor'),
  ('tipo_promotor', 'micro_pequena_empresa', 'Micro / pequena empresa'),
  ('tipo_promotor', 'singular', 'Pessoa singular'),
  ('tipo_promotor', 'coletiva', 'Pessoa coletiva'),
  ('tipo_despesa', 'maquinas', 'Maquinas e equipamento'),
  ('tipo_despesa', 'obras', 'Obras e construcao'),
  ('tipo_despesa', 'plantacoes', 'Plantacoes'),
  ('tipo_despesa', 'energia', 'Energia / solar / autoconsumo'),
  ('tipo_despesa', 'animais', 'Animais / pecuaria'),
  ('tipo_despesa', 'transformacao', 'Transformacao / comercializacao'),
  ('setor', 'agricultura', 'Agricultura'),
  ('setor', 'pecuaria', 'Pecuaria'),
  ('setor', 'transformacao', 'Transformacao / comercializacao'),
  ('setor', 'energia', 'Energia'),
  ('setor', 'turismo_rural', 'Turismo rural'),
  ('objetivo', 'instalacao', 'Instalacao / arranque'),
  ('objetivo', 'modernizacao', 'Modernizacao'),
  ('objetivo', 'investimento', 'Investimento produtivo'),
  ('objetivo', 'diversificacao', 'Diversificacao')
) as v(cat_slug, slug, label)
join tag_categories c on c.slug = v.cat_slug
on conflict (category_id, slug) do nothing;

-- ============================================================
-- FUNDOS (6 reais, todos NEEDS_REVIEW)
-- ============================================================

insert into funding_opportunities (
  name, program, entity, summary, beneficiaries, eligible_expenses, support_rate, amount_range, status, complexity, hidden_conditions, risks, incompatibilities, required_docs, source_url, notes_internal
) values (
  'Prémio Instalação Jovens Agricultores (C.2.2.1)',
  'PEPAC 2023-2027',
  'IFAP / GPP',
  'Prémio direto, não reembolsável, à primeira instalação de jovens entre 18 e 40 anos como responsáveis de exploração agrícola. Não exige investimento específico — cobre custos de arranque (formação, licenciamentos, capital circulante, primeiros equipamentos).',
  'Jovens entre 18 e 40 anos que se instalem pela primeira vez como responsáveis de exploração agrícola. Pessoas singulares ou, em sociedade, capital maioritariamente detido por jovens agricultores (cada um com mais de 25%).',
  'Prémio à instalação (sem exigência de investimento associado para receber o prémio base).',
  'Regra geral até 50.000€; até 55.000€ em zonas vulneráveis / instalação como ATP. Subiu face ao programa anterior (eram 25.000/30.000€). VALIDAR no aviso do período.',
  'Até 55.000€ a fundo perdido',
  'previsto',
  'alta',
  'Regra da primeira instalação: não pode ter recebido ajudas do Pedido Único antes dos dois anos civis anteriores ao ano da candidatura (candidatura 2025 → só PU em 2023 ou 2024). Não pode estar inscrito na AT com atividade agrícola para além desses dois anos. Em sociedade, a data de início de atividade da sociedade conta. Limite de idade à data da candidatura.',
  'Plano Empresarial mal construído (projeções irrealistas ou incoerência entre investimentos e atividade) é dos principais motivos de indeferimento OU de corte em auditoria posterior. Incumprimento do plano gera devolução. Candidaturas abrem por PERÍODOS — perder o período é perder o ano.',
  'Articula-se com Investimento Produtivo Jovens Agricultores (C.2.2.2), mas há regras de não-acumulação para a mesma despesa. VALIDAR limites por promotor.',
  'NIFAP, atividade aberta (CAE agrícola), Plano de Negócios a 5 anos no formulário, certidões fiscal e contributiva regularizadas, comprovativos de capacidade/formação agrícola.',
  'https://pepacc.pt/concursos/premio-instalacao-jovens-agricultores-1o-concurso-1o-periodo/',
  'NEEDS_REVIEW. Fonte: pepacc.pt + portugal.gov.pt (jan 2025) + incentiva/pmeincentivos (2026). Portaria 303-A/2024/1. Confirmar idade-limite, montante e prazo. Tipologia C.2.2.1.'
) on conflict do nothing;

insert into funding_opportunities (
  name, program, entity, summary, beneficiaries, eligible_expenses, support_rate, amount_range, status, complexity, hidden_conditions, risks, incompatibilities, required_docs, source_url, notes_internal
) values (
  'Investimento Produtivo Jovens Agricultores (C.2.2.2)',
  'PEPAC 2023-2027',
  'IFAP / GPP',
  'Apoio ao investimento produtivo associado à instalação do jovem agricultor: equipamento, plantações, adaptação de instalações. Complementa o Prémio de Instalação.',
  'Jovens agricultores (18-40) em primeira instalação, que não tenham recebido antes ajudas ao investimento agrícola nem prémio à primeira instalação. Plano de negócios a 5 anos.',
  'Equipamento, plantações, adaptação de instalações e outros investimentos previstos no aviso.',
  'Taxas até 60% para investimentos elegíveis (ex.: 50% de 250.000€ = até 125.000€). VALIDAR escalões.',
  'Até ~125.000€ consoante investimento elegível',
  'previsto',
  'alta',
  'Os investimentos devem ter início APÓS a data definida no aviso. A contagem dos 5 anos do plano inicia-se na data do primeiro investimento. Despesa antes da data elegível não é aceite.',
  'Risco de tesouraria: investe-se primeiro e reembolsa-se depois de aprovação/execução comprovada — precisa de capital próprio ou crédito-ponte. Incoerência do plano gera corte.',
  'Não pode ter recebido prémio à primeira instalação noutro âmbito nem ajudas ao investimento agrícola anteriores. Não-acumulação para a mesma despesa.',
  'NIFAP, atividade aberta, plano de negócios a 5 anos, orçamentos, certidões regularizadas.',
  'https://pepacc.pt/concursos/investimento-produtivo-jovens-agricultores-1o-concurso-1o-periodo/',
  'NEEDS_REVIEW. Fonte: pepacc.pt (jan 2026) + pmeincentivos. Tipologia C.2.2.2. Confirmar taxa e teto.'
) on conflict do nothing;

insert into funding_opportunities (
  name, program, entity, summary, beneficiaries, eligible_expenses, support_rate, amount_range, status, complexity, hidden_conditions, risks, incompatibilities, required_docs, source_url, notes_internal
) values (
  'Investimento Produtivo Agrícola — Modernização (C.2.1.1)',
  'PEPAC 2023-2027',
  'IFAP / GPP',
  'Medida principal de modernização das explorações: aumento de produção, valorização e qualidade dos produtos, eficiência, inovação, digitalização e práticas sustentáveis. Para exploração já existente (não exige ser jovem agricultor).',
  'Pessoas singulares ou coletivas que exerçam atividade agrícola em Portugal Continental (setor agrícola e pecuário).',
  'Máquinas e equipamento, obras, sistemas de rega, plantações, digitalização, energias renováveis na exploração.',
  '50% para investimento elegível até 500.000€; 40% entre 500.000€ e 2.000.000€. Acima de 500.000€ pode aplicar-se subvenção fixa não reembolsável (ref. ~169.000€). Majorações (ex.: produção biológica/integrada).',
  '40-50% do investimento elegível',
  'previsto',
  'alta',
  'Exige projeto com viabilidade económica e financeira. Vários projetos do mesmo promotor têm de ser comprovadamente diferentes (temporal e geograficamente). Plantações permanentes acima de 10 ha com pousio/pastagem/arroz/leguminosas <25% da área obrigam a área adjacente não-produtiva para biodiversidade.',
  'Projeto sem viabilidade demonstrada é indeferido. Regras de biodiversidade podem reduzir área produtiva planeada. Custos unitários definidos em Orientação Técnica (nem tudo a preço real).',
  'Não-acumulação para a mesma despesa. VALIDAR articulação com Desempenho Ambiental e eco-regimes.',
  'NIFAP, atividade aberta, projeto/estudo de viabilidade, orçamentos, licenciamentos aplicáveis.',
  'https://pepacc.pt/wp-content/uploads/2025/08/AVISO_Candidatura_211_Exploracoes-Agricolas_28082025.pdf',
  'NEEDS_REVIEW. Fonte: pepacc.pt (aviso ago 2025) + centralgest/isagri. Portaria 274/2024/1. Tipologia C.2.1.1. Confirmar escalões e custos unitários na OT vigente.'
) on conflict do nothing;

insert into funding_opportunities (
  name, program, entity, summary, beneficiaries, eligible_expenses, support_rate, amount_range, status, complexity, hidden_conditions, risks, incompatibilities, required_docs, source_url, notes_internal
) values (
  'Investimento na Transformação e Comercialização de Produtos Agrícolas',
  'PEPAC 2023-2027',
  'IFAP / GPP (Continente; regiões autónomas com regime próprio)',
  'Apoio a investimentos que transformam e comercializam produtos agrícolas — agregar valor à produção (ex.: fruta em compota, azeitona em azeite, criar marca e canal de venda).',
  'Explorações agrícolas e agroindústrias que transformem/comercializem produtos agrícolas.',
  'Equipamento de transformação, instalações, embalamento, logística de comercialização.',
  'Variável por aviso e dimensão; majorações para produção biológica/integrada nalgumas regiões. VALIDAR.',
  'VALIDAR no aviso específico',
  'previsto',
  'media',
  'Distingue investimento em exploração agrícola (F.1.3.1) de transformação de produtos agrícolas em geral (F.1.3.2) — o enquadramento muda taxa e elegibilidade.',
  'Escolher a ação errada (1 vs 2) leva a indeferimento ou taxa inferior. Licenciamento da unidade de transformação pode ser longo e bloquear a execução.',
  'Não-acumulação para a mesma despesa. Possível articulação com modernização.',
  'NIFAP, atividade compatível, projeto, orçamentos, licenciamentos da unidade.',
  'https://www.gpp.pt/index.php/pepac/pepac-plano-estrategico-da-pac-2023-2027',
  'NEEDS_REVIEW. Fonte: pepac.madeira (estrutura F.1.3) + pmeincentivos. No Continente confirmar designação/numeração e aviso aberto. Relevante para ZIDRA/Quinta da Cortiça (cidra/transformação).'
) on conflict do nothing;

insert into funding_opportunities (
  name, program, entity, summary, beneficiaries, eligible_expenses, support_rate, amount_range, status, complexity, hidden_conditions, risks, incompatibilities, required_docs, source_url, notes_internal
) values (
  'Sistema de Incentivos de Base Territorial — Alentejo (ALT2030-2026-16)',
  'Alentejo 2030 (FEDER)',
  'Autoridade de Gestão Alentejo 2030 / CCDR Alentejo',
  'Incentivo a investimentos de pequena dimensão que diversifiquem a base produtiva regional, criem emprego e fixem população. Inclui ação de CRIAÇÃO de micro e pequenas empresas com menos de 3 anos.',
  'Micro e pequenas empresas na região NUTS II Alentejo. Para criação: empresas com menos de 3 anos de atividade à data da candidatura.',
  'Investimento produtivo de pequena dimensão (equipamento, instalações, conforme aviso).',
  'Cofinanciamento até ~60% (VALIDAR escalão e majorações).',
  'Investimentos de pequena dimensão',
  'previsto',
  'media',
  'Localização tem de ser efetivamente na NUTS II Alentejo. Para criação, a empresa não pode ter mais de 3 anos. Exige dossier com plano de investimento, indicadores de resultados e estudo de viabilidade.',
  'Programa regional com dotação limitada — concorrência por seleção. Indicadores prometidos têm de ser cumpridos sob risco de devolução.',
  'Não-acumulação com outros apoios FEDER para a mesma despesa.',
  'Certidões, plano de investimento, estudo de viabilidade, comprovativo de localização e dimensão de empresa.',
  'https://alentejo.portugal2030.pt/',
  'NEEDS_REVIEW. Fonte: skilltech.pt (abr 2026) + alentejo.portugal2030.pt. Alentejo 2030 lança 31 avisos entre mai/2026 e abr/2027 (126,6M€) — monitorizar Plano Anual de Avisos. Confirmar aviso 16/2026 ativo, taxa e prazo.'
) on conflict do nothing;

insert into funding_opportunities (
  name, program, entity, summary, beneficiaries, eligible_expenses, support_rate, amount_range, status, complexity, hidden_conditions, risks, incompatibilities, required_docs, source_url, notes_internal
) values (
  'Comunidades de Energia Renovável e Autoconsumo Coletivo',
  'PRR / Fundo Ambiental (C13)',
  'Agência para o Clima / Fundo Ambiental',
  'Apoio à instalação de unidades de produção renovável para autoconsumo (UPAC), com ou sem armazenamento, integradas em Autoconsumo Coletivo (ACC) ou Comunidade de Energia Renovável (CER). Útil para quintas/aldeias que partilhem produção solar.',
  'Setor residencial, serviços e administração pública central em Portugal Continental, em autoconsumo coletivo ou CER.',
  'Painéis fotovoltaicos (UPAC), armazenamento/baterias, equipamento associado a ACC/CER.',
  'Comparticipação definida por aviso (vouchers/percentagem). Avisos anteriores com dezenas de M€.',
  'Dotação por aviso (ref. 75M€ no 2.º aviso, repartida por tipologia)',
  'previsto',
  'media',
  'Dirigido ao autoconsumo COLETIVO / comunidade, não ao individual avulso. Anunciado em jan/2026 novo apoio por vouchers a painéis solares para autoconsumo (modelo tipo E-LAR) — ainda sem data/valores oficiais.',
  'A instalação tem de respeitar o calendário do aviso; despesa fora de prazo não é elegível. Constituir CER/ACC tem requisitos regulatórios (ERSE/DGEG).',
  'Não-acumulação com outros apoios para o mesmo equipamento.',
  'Constituição de ACC/CER, projeto técnico, registo na DGEG conforme aplicável.',
  'https://www.fundoambiental.pt/apoios-prr/c13-eficiencia-energetica-em-edificios/c13-i01-02-03-apoio-a-concretizacao-de-comunidades-de-energia-renovavel-e-autoconsumo-coletivo.aspx',
  'NEEDS_REVIEW. Fonte: fundoambiental.pt (fev 2026) + goldenergy/deco. Avisos anteriores fechados; monitorizar reabertura e novo programa de vouchers anunciado em 2026. Regras técnicas: ERSE/DGEG.'
) on conflict do nothing;
