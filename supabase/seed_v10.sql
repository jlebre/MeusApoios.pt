-- ============================================================
-- Seed v10 — Novos domínios: FORMAÇÃO e SAÚDE/CUIDADORES
-- Corre DEPOIS de seed_v9.sql. Tudo NEEDS_REVIEW.
-- ============================================================

insert into domains (slug,label,description,icon,active,sort_order) values
('formacao','Formação e Emprego','Bolsas, cheques-formação e apoios à qualificação e ao emprego.','🎓',true,5),
('saude','Saúde e Cuidadores','Apoios a cuidadores informais e a pessoas em situação de dependência.','❤️',true,6)
on conflict (slug) do nothing;

insert into funding_opportunities (
  name, program, entity, summary, beneficiaries, eligible_expenses, support_rate, amount_range, status, complexity, hidden_conditions, risks, incompatibilities, required_docs, source_url, domain_id, publish_status
) values (
  'Cheque-Formação + Digital (IEFP)',
  'IEFP / Portugal 2030',
  'IEFP',
  'Apoio para desenvolver competências digitais, até 750€ por pessoa a cada 12 meses. Financia formação em competências digitais para empregados e desempregados.',
  'Ativos empregados e desempregados inscritos no IEFP.',
  'Ações de formação em competências digitais, certificadas pela DGERT.',
  'Até 750€ por candidato a cada 12 meses.',
  'Até 750€/ano',
  'aberto',
  'baixa',
  'Ações têm de terminar até 30/06/2026 (na fase atual). Formação não pode já ter sido financiada por outro apoio público. Entidade formadora tem de ser certificada pela DGERT.',
  'Não entregar o certificado de qualificações no prazo implica devolver o apoio. Dotação orçamental limitada.',
  'Não cumulável com outro financiamento público para a mesma formação.',
  'Inscrição no IEFP, formação certificada DGERT, comprovativos de pagamento, certificado final.',
  'https://www.iefp.pt/',
  (select id from domains where slug='formacao'), 'publicado'
);
insert into eligibility_rules (funding_id,label,field,operator,value,value2,severity,explain_pass,explain_fail,sort_order) values ((select id from funding_opportunities where name='Cheque-Formação + Digital (IEFP)' order by created_at desc limit 1),'Inscrito no IEFP','iefp_registered','is_true',null,null,'aviso','Compatível com a medida.','Cheque-Formação exige inscrição na rede de centros do IEFP.',0);
insert into funding_amounts (funding_id,label,kind,rate,fixed_amount,cap,base_field,notes) values ((select id from funding_opportunities where name='Cheque-Formação + Digital (IEFP)' order by created_at desc limit 1),'Cheque digital','fixo',null,750,null,'budget_eur','Até 750€/12 meses.');
insert into funding_documents_required (funding_id,name,hint,mandatory,sort_order,how_to_get,official_url) values ((select id from funding_opportunities where name='Cheque-Formação + Digital (IEFP)' order by created_at desc limit 1),'Inscrição no IEFP','',true,0,'iefponline ou centro de emprego.','https://www.iefp.pt/');
insert into funding_documents_required (funding_id,name,hint,mandatory,sort_order,how_to_get,official_url) values ((select id from funding_opportunities where name='Cheque-Formação + Digital (IEFP)' order by created_at desc limit 1),'Formação certificada DGERT','Confirma que a entidade é certificada.',true,1,'Verifica no site da DGERT.',null);

insert into funding_opportunities (
  name, program, entity, summary, beneficiaries, eligible_expenses, support_rate, amount_range, status, complexity, hidden_conditions, risks, incompatibilities, required_docs, source_url, domain_id, publish_status
) values (
  'Cheque-Formação (IEFP)',
  'IEFP / Portaria 229/2015',
  'IEFP',
  'Financiamento direto da formação profissional para empregadores, ativos empregados e desempregados. Valor/hora de 4€, até 50 horas em 2 anos (máx. ~175€), sem exceder 90% do custo da formação.',
  'Empregadores, ativos empregados e desempregados inscritos no IEFP.',
  'Formação profissional certificada.',
  '4€/hora, até 50h em 2 anos (máx. ~175€), até 90% do custo.',
  'Até ~175€ em 2 anos',
  'aberto',
  'baixa',
  'Máximo 50 horas em 2 anos para empregados (150h para desempregados). Entidade formadora certificada DGERT. Apoio não excede 90% do valor pago.',
  'Não entregar o certificado até 2 meses após o fim da formação implica devolver o apoio.',
  'Não cumulável com outros apoios para a mesma ação.',
  'Inscrição no IEFP, comprovativo de pagamento, certificado de formação (SIGO).',
  'https://www.iefp.pt/',
  (select id from domains where slug='formacao'), 'publicado'
);
insert into eligibility_rules (funding_id,label,field,operator,value,value2,severity,explain_pass,explain_fail,sort_order) values ((select id from funding_opportunities where name='Cheque-Formação (IEFP)' order by created_at desc limit 1),'Inscrito no IEFP','iefp_registered','is_true',null,null,'aviso','Compatível.','Exige inscrição na rede de centros do IEFP.',0);
insert into funding_amounts (funding_id,label,kind,rate,fixed_amount,cap,base_field,notes) values ((select id from funding_opportunities where name='Cheque-Formação (IEFP)' order by created_at desc limit 1),'Cheque-formação','fixo',null,175,null,'budget_eur','Até ~175€ em 2 anos.');
insert into funding_documents_required (funding_id,name,hint,mandatory,sort_order,how_to_get,official_url) values ((select id from funding_opportunities where name='Cheque-Formação (IEFP)' order by created_at desc limit 1),'Inscrição no IEFP','',true,0,'iefponline ou centro de emprego.','https://www.iefp.pt/');

insert into funding_opportunities (
  name, program, entity, summary, beneficiaries, eligible_expenses, support_rate, amount_range, status, complexity, hidden_conditions, risks, incompatibilities, required_docs, source_url, domain_id, publish_status
) values (
  'Subsídio de Apoio ao Cuidador Informal Principal',
  'Estatuto do Cuidador Informal',
  'Segurança Social',
  'Prestação mensal para quem cuida a tempo inteiro de um familiar em situação de dependência e por isso deixou de trabalhar ou reduziu a atividade. Valor de referência 590,84€/mês em 2026 (depende dos rendimentos do agregado).',
  'Cuidador informal principal reconhecido: maior de idade até à idade da reforma, sem atividade profissional remunerada, familiar até ao 4.º grau ou coabitante da pessoa cuidada.',
  'Prestação pecuniária mensal (não é reembolso).',
  'Diferença entre 590,84€ (1,1×IAS) e o rendimento de referência do agregado.',
  'Até 590,84€/mês',
  'aberto',
  'alta',
  'O cuidador NÃO pode ter atividade profissional remunerada nem receber subsídio de desemprego. A pessoa cuidada tem de receber complemento por dependência de 2.º grau ou subsídio por assistência de terceira pessoa. Condição de recursos: rendimento de referência do agregado < 698,27€/mês (1,3×IAS). Suspende se a pessoa cuidada for internada >30 dias.',
  'Perde-se o subsídio se o cuidador começar a trabalhar. Exige primeiro o reconhecimento do estatuto, que tem requisitos próprios sobre a pessoa cuidada.',
  'Não compatível com subsídio de desemprego, subsídio de doença, complemento por dependência ou pensão de velhice (com exceções). Desde 2026 não conta como rendimento para o abono de família.',
  'Reconhecimento do estatuto de cuidador informal, prestação por dependência da pessoa cuidada, comprovativos de rendimento do agregado.',
  'https://www.seg-social.pt/',
  (select id from domains where slug='saude'), 'publicado'
);
insert into eligibility_rules (funding_id,label,field,operator,value,value2,severity,explain_pass,explain_fail,sort_order) values ((select id from funding_opportunities where name='Subsídio de Apoio ao Cuidador Informal Principal' order by created_at desc limit 1),'Idade entre 18 e idade da reforma','promoter_age','between','18','66','eliminatoria','Dentro do limite de idade.','Tem de ter entre 18 anos e a idade legal de reforma (66 em 2026).',0);
insert into eligibility_rules (funding_id,label,field,operator,value,value2,severity,explain_pass,explain_fail,sort_order) values ((select id from funding_opportunities where name='Subsídio de Apoio ao Cuidador Informal Principal' order by created_at desc limit 1),'Rendimento do agregado baixo','annual_income_eur','lte','8379',null,'aviso','Rendimento compatível com a condição de recursos.','Condição de recursos: rendimento de referência < 698,27€/mês (~8.379€/ano). Acima disso pode não ter direito.',1);
insert into funding_amounts (funding_id,label,kind,rate,fixed_amount,cap,base_field,notes) values ((select id from funding_opportunities where name='Subsídio de Apoio ao Cuidador Informal Principal' order by created_at desc limit 1),'Subsídio mensal (referência)','fixo',null,7090,null,'budget_eur','Até 590,84€/mês ≈ 7.090€/ano. O valor real é a diferença para o rendimento.');
insert into funding_documents_required (funding_id,name,hint,mandatory,sort_order,how_to_get,official_url) values ((select id from funding_opportunities where name='Subsídio de Apoio ao Cuidador Informal Principal' order by created_at desc limit 1),'Reconhecimento do estatuto de cuidador informal','Pede primeiro o estatuto na Segurança Social.',true,0,'Segurança Social Direta > Cuidador Informal.','https://www.seg-social.pt/');
insert into funding_documents_required (funding_id,name,hint,mandatory,sort_order,how_to_get,official_url) values ((select id from funding_opportunities where name='Subsídio de Apoio ao Cuidador Informal Principal' order by created_at desc limit 1),'Prestação por dependência da pessoa cuidada','A pessoa cuidada tem de receber complemento por dependência 2.º grau ou subsídio de 3.ª pessoa.',true,1,'Confirma na Segurança Social.','https://www.seg-social.pt/');

-- Perguntas FORMAÇÃO
insert into questions (domain_id,field,label,hint,input_type,options,shared,sort_order,section,section_order,required,placeholder,also_writes) values
((select id from domains where slug='formacao'),'goal','O que procuras?',null,'select','["Formação para emprego","Competências digitais","Mudar de carreira","Ainda a explorar"]'::jsonb,false,0,'O teu objetivo',3,true,null,null),
((select id from domains where slug='formacao'),'iefp_registered','Estás inscrito no IEFP?','A maioria dos apoios à formação exige inscrição.','yesno',null,false,1,'O teu objetivo',3,false,null,null);

-- Perguntas SAÚDE/CUIDADORES
insert into questions (domain_id,field,label,hint,input_type,options,shared,sort_order,section,section_order,required,placeholder,also_writes) values
((select id from domains where slug='saude'),'goal','Qual é a tua situação?',null,'select','["Cuido de um familiar dependente","Tenho uma dependência","Ainda a explorar"]'::jsonb,false,0,'A tua situação',3,true,null,null),
((select id from domains where slug='saude'),'employment_status','Tens atividade profissional remunerada?','O subsídio de cuidador exige não ter trabalho remunerado.','yesno',null,false,1,'A tua situação',3,false,null,null);
