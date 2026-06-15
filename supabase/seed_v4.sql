-- ============================================================
-- Seed v4 — Fundos de HABITAÇÃO, ENERGIA e EMPRESAS
-- Corre DEPOIS de schema_v3.sql e seed_v3.sql
-- TODOS marcados NEEDS_REVIEW. Valida no aviso oficial.
-- ============================================================

  insert into funding_opportunities (
  name, program, entity, summary, beneficiaries, eligible_expenses, support_rate, amount_range, status, complexity, hidden_conditions, risks, incompatibilities, required_docs, source_url, pdf_url, notes_internal, domain_id
  ) values (
  'IMT Jovem + Garantia Pública (1.ª habitação)',
  'Apoios à habitação jovem (DL 48-A/2024)',
  'AT / Estado',
  'Pacote para jovens até 35 anos na compra da 1.ª habitação própria e permanente: isenção de IMT e Imposto do Selo até 330.539€ (parcial até 660.982€), garantia pública do Estado até 15% do valor (permite financiamento até 100%, sem entrada) e isenção de emolumentos de registo.',
  'Jovens entre 18 e 35 anos, com domicílio fiscal em Portugal, na compra da 1.ª habitação própria e permanente. Não podem ser proprietários de outro imóvel habitacional (nem nos últimos 3 anos).',
  'Aquisição da primeira habitação própria e permanente.',
  'Isenção total de IMT+IS até 330.539€; parcial até 660.982€. Garantia do Estado até 15% do valor.',
  'Poupança de milhares de € em impostos + dispensa de entrada (até 100% financiado)',
  'aberto',
  'media',
  'Idade até 35 à data da aprovação do crédito. Rendimentos até ao 8.º escalão do IRS. Não ter sido proprietário de imóvel habitacional nos últimos 3 anos. Nunca ter usado a garantia pública antes. Situação fiscal e contributiva regularizada. O contrato tem de ser celebrado até 31/12/2026 — pode não ser prorrogado.',
  'Cumprir os requisitos NÃO garante aprovação do crédito — o banco avalia a taxa de esforço e o risco. A garantia pública não cobre o Imposto do Selo do crédito (só o da aquisição).',
  'A garantia pública só pode ser usada uma vez. Tem de financiar a totalidade do preço.',
  'Documento de identificação, comprovativo de rendimentos (IRS), declaração de 1.ª habitação, certidões fiscal e contributiva.',
  'https://www.portugal.gov.pt/pt/gc25/comunicacao/noticia?i=isencao-de-imt-ja-apoiou-mais-de-77-mil-jovens-na-compra-de-casa',
  '',
  'NEEDS_REVIEW. Fonte: portugal.gov.pt + DECO + bancos (jan-fev 2026). DL 48-A/2024 + Portaria 236-A/2024/1. Confirmar escalão IRS e limites de valor atualizados.',
  (select id from domains where slug='habitacao')
  );

insert into eligibility_rules (funding_id,label,field,operator,value,value2,severity,explain_pass,explain_fail,sort_order) values ((select id from funding_opportunities where name='IMT Jovem + Garantia Pública (1.ª habitação)' order by created_at desc limit 1),'Idade entre 18 e 35','birth_year_age','between','18','35','eliminatoria','Dentro do limite de idade.','Acima de 35 (à data da aprovação do crédito) não é elegível.',0);
insert into eligibility_rules (funding_id,label,field,operator,value,value2,severity,explain_pass,explain_fail,sort_order) values ((select id from funding_opportunities where name='IMT Jovem + Garantia Pública (1.ª habitação)' order by created_at desc limit 1),'Primeira habitação','first_home','is_true',null,null,'eliminatoria','Declarou 1.ª habitação.','Tem de ser a primeira habitação própria e permanente; não ter sido proprietário nos últimos 3 anos.',1);
insert into eligibility_rules (funding_id,label,field,operator,value,value2,severity,explain_pass,explain_fail,sort_order) values ((select id from funding_opportunities where name='IMT Jovem + Garantia Pública (1.ª habitação)' order by created_at desc limit 1),'Situação fiscal regularizada','tax_situation_ok','is_true',null,null,'aviso','Situação regularizada.','É exigida situação fiscal e contributiva regularizada.',2);
insert into funding_amounts (funding_id,label,kind,rate,fixed_amount,cap,base_field,notes) values ((select id from funding_opportunities where name='IMT Jovem + Garantia Pública (1.ª habitação)' order by created_at desc limit 1),'Isenção IMT+IS (estimativa)','percentagem',7,null,23000,'property_price_eur','~6-7,5% do valor poupado em IMT+IS até ao limite. VALIDAR com tabela IMT.');
insert into funding_documents_required (funding_id,name,hint,mandatory,sort_order,how_to_get,official_url) values ((select id from funding_opportunities where name='IMT Jovem + Garantia Pública (1.ª habitação)' order by created_at desc limit 1),'Comprovativo de rendimentos (IRS)','Para verificar o escalão.',true,0,'Obténs no Portal das Finanças: Início > Os meus documentos / Declarações IRS.','https://www.portaldasfinancas.gov.pt/');
insert into funding_documents_required (funding_id,name,hint,mandatory,sort_order,how_to_get,official_url) values ((select id from funding_opportunities where name='IMT Jovem + Garantia Pública (1.ª habitação)' order by created_at desc limit 1),'Declaração de 1.ª habitação própria e permanente','Declaração do próprio, modelo do banco.',true,1,'O banco fornece o modelo. Preenches e assinas.',null);
insert into funding_documents_required (funding_id,name,hint,mandatory,sort_order,how_to_get,official_url) values ((select id from funding_opportunities where name='IMT Jovem + Garantia Pública (1.ª habitação)' order by created_at desc limit 1),'Certidão de não dívida (Finanças e Seg. Social)','Situação regularizada.',true,2,'Portal das Finanças e Segurança Social Direta.','https://www.portaldasfinancas.gov.pt/');

  insert into funding_opportunities (
  name, program, entity, summary, beneficiaries, eligible_expenses, support_rate, amount_range, status, complexity, hidden_conditions, risks, incompatibilities, required_docs, source_url, pdf_url, notes_internal, domain_id
  ) values (
  'Vouchers Painéis Solares para Autoconsumo (anunciado 2026)',
  'Fundo Ambiental / PRR',
  'Agência para o Clima / Fundo Ambiental',
  'Apoio por vouchers à compra de painéis solares para autoconsumo doméstico, anunciado em janeiro de 2026 (modelo semelhante ao E-LAR). Após candidatura aprovada, recebes um voucher para usar num fornecedor aderente; o pagamento é feito diretamente ao fornecedor. Poderá incluir baterias.',
  'Famílias / pessoas singulares em habitação própria (detalhe a confirmar na abertura).',
  'Painéis fotovoltaicos para autoconsumo; possivelmente baterias e inversor.',
  'Por voucher — percentagem/valor a definir na abertura (referências de ~70% em discussão, não confirmado).',
  'A definir na abertura do aviso',
  'previsto',
  'baixa',
  'À data (jun 2026), o programa foi ANUNCIADO mas as candidaturas ainda não abriram e os valores não são oficiais. Programas anteriores esgotaram em horas — é preciso candidatar no minuto da abertura.',
  'Pode esgotar muito rápido. Despesa feita fora das regras/datas do voucher não é reembolsada. Confirmar se exige fornecedor aderente.',
  'Não acumulável com outros apoios para o mesmo equipamento.',
  'A definir na abertura. Tipicamente: comprovativo de morada, fatura/orçamento do equipamento.',
  'https://www.fundoambiental.pt/',
  '',
  'NEEDS_REVIEW. Fonte: Fundo Ambiental + ECO + Portal Energia (jan-fev 2026). Programa ainda não aberto. Monitorizar fundoambiental.pt.',
  (select id from domains where slug='energia')
  );

insert into eligibility_rules (funding_id,label,field,operator,value,value2,severity,explain_pass,explain_fail,sort_order) values ((select id from funding_opportunities where name='Vouchers Painéis Solares para Autoconsumo (anunciado 2026)' order by created_at desc limit 1),'Habitação própria','owns_home','is_true',null,null,'aviso','Tem habitação onde instalar.','Precisa de local próprio para instalar; confirmar regras na abertura.',0);
insert into funding_amounts (funding_id,label,kind,rate,fixed_amount,cap,base_field,notes) values ((select id from funding_opportunities where name='Vouchers Painéis Solares para Autoconsumo (anunciado 2026)' order by created_at desc limit 1),'Voucher solar (estimativa)','percentagem',50,null,2500,'budget_eur','Percentagem e teto NÃO confirmados. Estimativa conservadora.');
insert into funding_documents_required (funding_id,name,hint,mandatory,sort_order,how_to_get,official_url) values ((select id from funding_opportunities where name='Vouchers Painéis Solares para Autoconsumo (anunciado 2026)' order by created_at desc limit 1),'Comprovativo de morada','Fatura de serviço ou atestado de residência.',true,0,'Atestado na Junta de Freguesia, ou fatura recente de água/luz.',null);
insert into funding_documents_required (funding_id,name,hint,mandatory,sort_order,how_to_get,official_url) values ((select id from funding_opportunities where name='Vouchers Painéis Solares para Autoconsumo (anunciado 2026)' order by created_at desc limit 1),'Orçamento do equipamento','De fornecedor aderente, quando definido.',true,1,'Pede orçamento a instaladores de fotovoltaico.',null);

  insert into funding_opportunities (
  name, program, entity, summary, beneficiaries, eligible_expenses, support_rate, amount_range, status, complexity, hidden_conditions, risks, incompatibilities, required_docs, source_url, pdf_url, notes_internal, domain_id
  ) values (
  'Programa E-LAR (eletrodomésticos eficientes)',
  'Fundo Ambiental / PRR',
  'Agência para o Clima / Fundo Ambiental',
  'Voucher para substituir equipamentos a gás por elétricos eficientes (placas de indução, fornos elétricos, termoacumuladores). Dirigido sobretudo a famílias com menores rendimentos. Já teve várias fases.',
  'Pessoas singulares / famílias (com critérios de rendimento em fases anteriores).',
  'Placas de indução, fornos elétricos, termoacumuladores e equipamentos elétricos eficientes.',
  'Voucher de apoio à compra (valor por fase).',
  'Voucher (centenas de €, conforme fase)',
  'aberto',
  'baixa',
  'Procura altíssima — fases anteriores esgotaram a verba em dias. Critérios de rendimento podem aplicar-se.',
  'Esgota rápido. Verificar fornecedores aderentes.',
  'Não acumulável para o mesmo equipamento.',
  'Comprovativo de morada e de rendimentos (conforme fase).',
  'https://www.fundoambiental.pt/',
  '',
  'NEEDS_REVIEW. Fonte: Contas Poupança + Repsol (dez 2025-jan 2026). 2.ª fase abriu em dez/2025. Confirmar fase ativa.',
  (select id from domains where slug='energia')
  );

insert into funding_amounts (funding_id,label,kind,rate,fixed_amount,cap,base_field,notes) values ((select id from funding_opportunities where name='Programa E-LAR (eletrodomésticos eficientes)' order by created_at desc limit 1),'Voucher E-LAR','fixo',null,500,null,'budget_eur','Valor de referência por fase. VALIDAR.');
insert into funding_documents_required (funding_id,name,hint,mandatory,sort_order,how_to_get,official_url) values ((select id from funding_opportunities where name='Programa E-LAR (eletrodomésticos eficientes)' order by created_at desc limit 1),'Comprovativo de morada','',true,0,'Junta de Freguesia ou fatura recente.',null);
insert into funding_documents_required (funding_id,name,hint,mandatory,sort_order,how_to_get,official_url) values ((select id from funding_opportunities where name='Programa E-LAR (eletrodomésticos eficientes)' order by created_at desc limit 1),'Comprovativo de rendimentos','Se a fase tiver critério de rendimento.',false,1,'Portal das Finanças.','https://www.portaldasfinancas.gov.pt/');

  insert into funding_opportunities (
  name, program, entity, summary, beneficiaries, eligible_expenses, support_rate, amount_range, status, complexity, hidden_conditions, risks, incompatibilities, required_docs, source_url, pdf_url, notes_internal, domain_id
  ) values (
  'Investe Jovem (criação de empresa por jovens)',
  'IEFP / Garantia Jovem',
  'IEFP',
  'Apoio à criação de empresas por jovens, com apoio financeiro ao investimento, apoio à criação do próprio emprego e apoio técnico/mentoria. Enquadrado na Garantia Jovem.',
  'Jovens (tipicamente 18-35), inscritos no IEFP, que criem a sua empresa (não constituída à data do pedido).',
  'Investimento inicial do negócio, criação do próprio emprego.',
  'Apoio ao investimento + apoio ao próprio emprego (montantes por aviso).',
  'Variável conforme projeto e aviso',
  'aberto',
  'media',
  'A empresa NÃO pode estar constituída à data do pedido. Inscrição no IEFP. Plano de negócios viável. Candidaturas em períodos definidos (plataforma Empreende XXI).',
  'Plano de negócios fraco é indeferido. Prazos de candidatura específicos.',
  'Regras de não acumulação com outras medidas IEFP para o mesmo fim; alguns acumulam (ex.: Emprego Interior MAIS) — confirmar.',
  'Inscrição no IEFP, plano de negócios, documento de identificação, certidões.',
  'https://www.iefp.pt/empreendedorismo',
  '',
  'NEEDS_REVIEW. Fonte: IEFP + Santander + PME Incentivos (2025-2026). Confirmar idade, montantes e período de candidatura.',
  (select id from domains where slug='empresas')
  );

insert into eligibility_rules (funding_id,label,field,operator,value,value2,severity,explain_pass,explain_fail,sort_order) values ((select id from funding_opportunities where name='Investe Jovem (criação de empresa por jovens)' order by created_at desc limit 1),'Idade jovem (18-35)','birth_year_age','between','18','35','aviso','Dentro do perfil jovem.','Investe Jovem foca jovens; fora da faixa, ver outras medidas IEFP.',0);
insert into eligibility_rules (funding_id,label,field,operator,value,value2,severity,explain_pass,explain_fail,sort_order) values ((select id from funding_opportunities where name='Investe Jovem (criação de empresa por jovens)' order by created_at desc limit 1),'Empresa ainda não constituída','company_exists','is_false',null,null,'eliminatoria','Vais criar a empresa — elegível.','Se a empresa já está constituída, esta medida não se aplica.',1);
insert into funding_amounts (funding_id,label,kind,rate,fixed_amount,cap,base_field,notes) values ((select id from funding_opportunities where name='Investe Jovem (criação de empresa por jovens)' order by created_at desc limit 1),'Apoio à criação (estimativa)','percentagem',50,null,20000,'budget_eur','Estimativa. VALIDAR montantes do aviso.');
insert into funding_documents_required (funding_id,name,hint,mandatory,sort_order,how_to_get,official_url) values ((select id from funding_opportunities where name='Investe Jovem (criação de empresa por jovens)' order by created_at desc limit 1),'Inscrição no IEFP','',true,0,'Inscreve-te no IEFP (online no iefponline ou num centro de emprego).','https://www.iefp.pt/');
insert into funding_documents_required (funding_id,name,hint,mandatory,sort_order,how_to_get,official_url) values ((select id from funding_opportunities where name='Investe Jovem (criação de empresa por jovens)' order by created_at desc limit 1),'Plano de negócios','Viabilidade é o que mais pesa.',true,1,'Preparas o plano; o IEFP e a plataforma Empreende XXI dão estrutura.','https://www.iefp.pt/empreendedorismo');
insert into funding_documents_required (funding_id,name,hint,mandatory,sort_order,how_to_get,official_url) values ((select id from funding_opportunities where name='Investe Jovem (criação de empresa por jovens)' order by created_at desc limit 1),'Documento de identificação e certidões','',true,2,'Finanças e Segurança Social.','https://www.portaldasfinancas.gov.pt/');

  insert into funding_opportunities (
  name, program, entity, summary, beneficiaries, eligible_expenses, support_rate, amount_range, status, complexity, hidden_conditions, risks, incompatibilities, required_docs, source_url, pdf_url, notes_internal, domain_id
  ) values (
  'Microcrédito / MicroInvest (pequeno negócio)',
  'PAECPE / ANDC / IEFP',
  'IEFP / ANDC / Sociedades de Garantia Mútua',
  'Linha de crédito com garantia mútua e juros bonificados para criar pequenos negócios e o próprio emprego, para quem tem dificuldade de acesso ao crédito tradicional. Montante até ~20.000€ por promotor, prazo até 7 anos.',
  'Desempregados inscritos no IEFP, jovens à procura do 1.º emprego, independentes com rendimento baixo, pessoas em risco de exclusão com ideia viável. Microentidades até 10 trabalhadores.',
  'Investimento e necessidades de arranque do negócio.',
  'Crédito (não fundo perdido) com garantia mútua e juro bonificado.',
  'Até ~20.000€ por promotor (microcrédito ANDC até ~12.000€)',
  'aberto',
  'media',
  'É CRÉDITO, não subsídio a fundo perdido — tens de devolver. Apresenta-se via banco aderente; um pedido de cada vez. Pode exigir formação prévia em empreendedorismo.',
  'É dívida: se o negócio falha, o crédito mantém-se. Avaliar bem a viabilidade.',
  'Não entregar o pedido em vários bancos ao mesmo tempo.',
  'Plano de investimento, inscrição IEFP (se aplicável), documento de identificação.',
  'https://www.iefp.pt/empreendedorismo',
  '',
  'NEEDS_REVIEW. Fonte: IEFP + Santander + PME Incentivos (2025-2026). Confirmar tetos atuais (microcrédito subiu para ~12.000€).',
  (select id from domains where slug='empresas')
  );

insert into eligibility_rules (funding_id,label,field,operator,value,value2,severity,explain_pass,explain_fail,sort_order) values ((select id from funding_opportunities where name='Microcrédito / MicroInvest (pequeno negócio)' order by created_at desc limit 1),'Empresa ainda não constituída ou microentidade','company_exists','is_false',null,null,'aviso','Adequado a criação de negócio.','Se já tens empresa grande, esta linha pode não aplicar; é para micro/criação.',0);
insert into funding_amounts (funding_id,label,kind,rate,fixed_amount,cap,base_field,notes) values ((select id from funding_opportunities where name='Microcrédito / MicroInvest (pequeno negócio)' order by created_at desc limit 1),'Crédito disponível (estimativa)','fixo',null,20000,null,'budget_eur','Teto de referência. É crédito, não fundo perdido.');
insert into funding_documents_required (funding_id,name,hint,mandatory,sort_order,how_to_get,official_url) values ((select id from funding_opportunities where name='Microcrédito / MicroInvest (pequeno negócio)' order by created_at desc limit 1),'Plano de investimento','',true,0,'A ANDC ajuda a construir o projeto de investimento.',null);
insert into funding_documents_required (funding_id,name,hint,mandatory,sort_order,how_to_get,official_url) values ((select id from funding_opportunities where name='Microcrédito / MicroInvest (pequeno negócio)' order by created_at desc limit 1),'Inscrição no IEFP (se aplicável)','',false,1,'iefponline ou centro de emprego.','https://www.iefp.pt/');
