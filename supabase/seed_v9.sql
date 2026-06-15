-- Seed v9 — Apoios SOCIAIS (domínio social)
-- Corre DEPOIS de schema_v8.sql.
update domains set active=true where slug='social';

insert into funding_opportunities (
  name, program, entity, summary, beneficiaries, eligible_expenses, support_rate, amount_range, status, complexity, hidden_conditions, risks, incompatibilities, required_docs, source_url, domain_id, publish_status
) values (
  'Garantia para a Infância (complemento ao abono)',
  'Plano de Ação da Garantia para a Infância 2022-2030',
  'Segurança Social',
  'Complemento ao abono de família para crianças e jovens em situação de pobreza ou risco. Reforça o apoio às famílias de menores rendimentos, com majorações para monoparentalidade e famílias numerosas.',
  'Crianças e jovens em agregados de baixos rendimentos que já recebem (ou têm direito a) abono de família dos escalões mais baixos.',
  'Prestação pecuniária mensal (não é reembolso de despesa).',
  'Montante anual global de referência ~1.495€ (~124,60€/mês), com majorações.',
  '~1.495€/ano por criança (com majorações)',
  'aberto',
  'baixa',
  'Depende do escalão de abono de família (rendimentos do agregado). Atribuída sobretudo de forma automática a quem já recebe abono dos escalões baixos. Verificar condição de recursos.',
  'Se os rendimentos do agregado subirem de escalão, o complemento pode cessar.',
  'Articula-se com o abono de família; não é cumulável com duplicação do mesmo apoio.',
  'Abono de família ativo, IBAN, dados do agregado familiar na Segurança Social Direta.',
  'https://www.seg-social.pt/',
  (select id from domains where slug='social'), 'publicado'
);
insert into eligibility_rules (funding_id,label,field,operator,value,value2,severity,explain_pass,explain_fail,sort_order) values ((select id from funding_opportunities where name='Garantia para a Infância (complemento ao abono)' order by created_at desc limit 1),'Tem filhos / crianças a cargo','household_size','gte','2',null,'aviso','Há agregado com dependentes.','Este apoio é para quem tem crianças/jovens a cargo.',0);
insert into eligibility_rules (funding_id,label,field,operator,value,value2,severity,explain_pass,explain_fail,sort_order) values ((select id from funding_opportunities where name='Garantia para a Infância (complemento ao abono)' order by created_at desc limit 1),'Rendimentos baixos (escalão de abono)','annual_income_eur','lte','16000',null,'aviso','Rendimento compatível com escalões baixos de abono.','Depende do escalão de abono de família; rendimentos mais altos podem não ter direito.',1);
insert into funding_amounts (funding_id,label,kind,rate,fixed_amount,cap,base_field,notes) values ((select id from funding_opportunities where name='Garantia para a Infância (complemento ao abono)' order by created_at desc limit 1),'Complemento anual','fixo',null,1495,null,'budget_eur','~1.495€/ano por criança. VALIDAR escalão e majorações.');
insert into funding_documents_required (funding_id,name,hint,mandatory,sort_order,how_to_get,official_url) values ((select id from funding_opportunities where name='Garantia para a Infância (complemento ao abono)' order by created_at desc limit 1),'Abono de família ativo','Base para o complemento.',true,0,'Confirma/pede na Segurança Social Direta > Família.','https://www.seg-social.pt/');
insert into funding_documents_required (funding_id,name,hint,mandatory,sort_order,how_to_get,official_url) values ((select id from funding_opportunities where name='Garantia para a Infância (complemento ao abono)' order by created_at desc limit 1),'Dados do agregado familiar atualizados','',true,1,'Segurança Social Direta > Perfil > Agregado.','https://www.seg-social.pt/');

insert into funding_opportunities (
  name, program, entity, summary, beneficiaries, eligible_expenses, support_rate, amount_range, status, complexity, hidden_conditions, risks, incompatibilities, required_docs, source_url, domain_id, publish_status
) values (
  'Prestação Social para a Inclusão (PSI)',
  'Proteção na deficiência',
  'Segurança Social',
  'Apoio a pessoas com deficiência (grau de incapacidade ≥60%) para promover autonomia e inclusão. Tem componente base e complemento; pode ser pedida desde o nascimento.',
  'Cidadãos com deficiência e grau de incapacidade superior a 60% (nacionais, estrangeiros, refugiados, apátridas).',
  'Prestação pecuniária mensal.',
  'Componente base até ~333,64€/mês; limiar de rendimentos 920€/mês (conta de outrem) ou 1.073,33€ (independentes) em 2026.',
  'Até ~333,64€/mês (base) + complemento',
  'aberto',
  'media',
  'Exige atestado médico de incapacidade multiuso com grau ≥60%. O valor depende dos rendimentos de trabalho (diferença até ao limiar). Para menores, componente base é metade.',
  'Sem atestado de incapacidade válido não há acesso. Rendimentos de trabalho acima do limiar reduzem ou anulam a prestação.',
  'Substituiu o subsídio mensal vitalício e a pensão social de invalidez. Acumulável com alguns apoios — confirmar.',
  'Atestado médico de incapacidade multiuso, IBAN, comprovativo de rendimentos.',
  'https://www.seg-social.pt/',
  (select id from domains where slug='social'), 'publicado'
);
insert into eligibility_rules (funding_id,label,field,operator,value,value2,severity,explain_pass,explain_fail,sort_order) values ((select id from funding_opportunities where name='Prestação Social para a Inclusão (PSI)' order by created_at desc limit 1),'Atestado de incapacidade ≥60%','tax_situation_ok','is_true',null,null,'aviso','Pré-requisito a confirmar.','Precisa de atestado médico de incapacidade multiuso com grau igual ou superior a 60%.',0);
insert into funding_amounts (funding_id,label,kind,rate,fixed_amount,cap,base_field,notes) values ((select id from funding_opportunities where name='Prestação Social para a Inclusão (PSI)' order by created_at desc limit 1),'Componente base','fixo',null,4000,null,'budget_eur','~333,64€/mês ≈ 4.000€/ano (base). Depende de rendimentos.');
insert into funding_documents_required (funding_id,name,hint,mandatory,sort_order,how_to_get,official_url) values ((select id from funding_opportunities where name='Prestação Social para a Inclusão (PSI)' order by created_at desc limit 1),'Atestado médico de incapacidade multiuso','Grau ≥60%. Pede no centro de saúde.',true,0,'Pedido no centro de saúde / junta médica.',null);
insert into funding_documents_required (funding_id,name,hint,mandatory,sort_order,how_to_get,official_url) values ((select id from funding_opportunities where name='Prestação Social para a Inclusão (PSI)' order by created_at desc limit 1),'Comprovativo de rendimentos','Para calcular o valor.',true,1,'Portal das Finanças.','https://www.portaldasfinancas.gov.pt/');

insert into funding_opportunities (
  name, program, entity, summary, beneficiaries, eligible_expenses, support_rate, amount_range, status, complexity, hidden_conditions, risks, incompatibilities, required_docs, source_url, domain_id, publish_status
) values (
  'Creche Feliz (creche gratuita até aos 3 anos)',
  'Alargamento da gratuitidade das creches',
  'Segurança Social / IPSS e creches aderentes',
  'Garante vaga gratuita em creche para crianças até aos 3 anos nos estabelecimentos abrangidos (IPSS, setor social, creches privadas com acordo e públicas).',
  'Famílias com crianças até aos 3 anos, em creches aderentes.',
  'Mensalidade da creche (gratuita nos estabelecimentos abrangidos).',
  'Gratuitidade total da componente de creche nos estabelecimentos abrangidos.',
  'Poupança da mensalidade (centenas de €/mês)',
  'aberto',
  'baixa',
  'Só se aplica a creches ABRANGIDAS pelo programa (com acordo). A vaga depende da disponibilidade — a procura supera a oferta em muitas zonas.',
  'Pode não haver vaga na creche pretendida. Confirmar que a creche é aderente antes de contar com a gratuitidade.',
  'Aplica-se à componente de creche; alimentação e extras podem não estar incluídos.',
  'Inscrição na creche aderente, dados do agregado na Segurança Social.',
  'https://www.seg-social.pt/',
  (select id from domains where slug='social'), 'publicado'
);
insert into eligibility_rules (funding_id,label,field,operator,value,value2,severity,explain_pass,explain_fail,sort_order) values ((select id from funding_opportunities where name='Creche Feliz (creche gratuita até aos 3 anos)' order by created_at desc limit 1),'Criança até aos 3 anos','household_size','gte','2',null,'aviso','Há criança no agregado.','Destina-se a famílias com crianças até aos 3 anos.',0);
insert into funding_amounts (funding_id,label,kind,rate,fixed_amount,cap,base_field,notes) values ((select id from funding_opportunities where name='Creche Feliz (creche gratuita até aos 3 anos)' order by created_at desc limit 1),'Creche gratuita','fixo',null,4800,null,'budget_eur','Poupança estimada de mensalidade (~400€/mês). Varia.');
insert into funding_documents_required (funding_id,name,hint,mandatory,sort_order,how_to_get,official_url) values ((select id from funding_opportunities where name='Creche Feliz (creche gratuita até aos 3 anos)' order by created_at desc limit 1),'Inscrição em creche aderente','Confirma que a creche está no programa.',true,0,'Contacta creches IPSS/com acordo da tua zona.',null);
insert into funding_documents_required (funding_id,name,hint,mandatory,sort_order,how_to_get,official_url) values ((select id from funding_opportunities where name='Creche Feliz (creche gratuita até aos 3 anos)' order by created_at desc limit 1),'Dados do agregado','',true,1,'Segurança Social Direta.','https://www.seg-social.pt/');

-- Perguntas do domínio social
insert into questions (domain_id, field, label, hint, input_type, options, shared, sort_order, section, section_order, required, placeholder, also_writes)
values
((select id from domains where slug='social'), 'goal', 'O que procuras?', null, 'select', '["Apoio para filhos / família","Apoio por deficiência","Creche","Apoio em situação de baixos rendimentos","Ainda a explorar"]'::jsonb, false, 0, 'O teu objetivo', 3, true, null, null),
((select id from domains where slug='social'), 'household_size', 'Quantas pessoas tem o teu agregado familiar?', 'Incluindo-te a ti e dependentes.', 'number', null, false, 1, 'O teu objetivo', 3, false, 'Ex.: 3', null),
((select id from domains where slug='social'), 'has_children', 'Tens filhos ou crianças a cargo?', null, 'yesno', null, false, 2, 'O teu objetivo', 3, false, null, null);

alter table projects add column if not exists has_children boolean;
