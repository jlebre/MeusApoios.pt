-- ============================================================
-- Seed v11 — Domínios CULTURA e INOVAÇÃO + plataformas/links
-- Corre DEPOIS de schema_v9.sql. Tudo review_status='por_rever'.
-- ============================================================

insert into domains (slug,label,description,icon,active,sort_order) values
('cultura','Cultura e Artes','Apoios à criação artística, edição e projetos culturais.','🎭',true,7),
('inovacao','Inovação e Digitalização','Incentivos à inovação, I&D, digitalização e investimento das empresas.','💡',true,8)
on conflict (slug) do nothing;

insert into funding_opportunities (
  name, program, entity, summary, beneficiaries, eligible_expenses, support_rate, amount_range, status, complexity, hidden_conditions, risks, incompatibilities, required_docs, source_url, platform_url, info_url, domain_id, publish_status, review_status
) values (
  'DGARTES — Programa de Apoio a Projetos (Criação)',
  'Programa de Apoio às Artes (Portaria 146/2021)',
  'Direção-Geral das Artes (DGARTES)',
  'Apoio à conceção, execução e apresentação de obras artísticas (artes visuais, performativas, de rua, cruzamento disciplinar). Concursos anuais com vários patamares de financiamento por candidatura.',
  'Artistas, criadores e entidades culturais. Pessoas singulares e coletivas do setor artístico.',
  'Conceção e execução de obras, residências artísticas, interpretação de repertório, edição e publicação.',
  'Patamares fixos de financiamento por candidatura (variam por concurso).',
  'Patamares por concurso (milhares a dezenas de milhares €)',
  'aberto',
  'alta',
  'Candidaturas por concurso, com prazos rígidos (ex.: prorrogado para 31/03/2026 em alguns). Avaliação por comissão e pontuação; apoio por patamares e por regiões. Candidatura eletrónica obrigatória no Balcão Artes.',
  'Muito concorrido e avaliado por mérito — cumprir requisitos não garante apoio. Prazos não se repetem.',
  'Uma entidade enquadra a atividade em apenas uma candidatura; não acumulável com financiamento continuado da área da cultura.',
  'Formulário online, portefólio/projeto artístico, orçamento, documentos da entidade.',
  'https://www.dgartes.gov.pt/pt/vnode/1',
  'https://apoios.dgartes.gov.pt/',
  'https://www.dgartes.gov.pt/pt/ebalcao/112',
  (select id from domains where slug='cultura'), 'publicado', 'por_rever'
);
insert into eligibility_rules (funding_id,label,field,operator,value,value2,severity,explain_pass,explain_fail,sort_order) values ((select id from funding_opportunities where name='DGARTES — Programa de Apoio a Projetos (Criação)' order by created_at desc limit 1),'Setor artístico/cultural','goal','neq','',null,'aviso','Projeto cultural identificado.','Destinado a projetos artísticos e culturais.',0);
insert into funding_amounts (funding_id,label,kind,rate,fixed_amount,cap,base_field,notes) values ((select id from funding_opportunities where name='DGARTES — Programa de Apoio a Projetos (Criação)' order by created_at desc limit 1),'Patamar de apoio','fixo',null,16000,null,'budget_eur','Patamares variam (ex.: 4k/8k/12k/16k€ em linhas afins). VALIDAR por concurso.');
insert into funding_documents_required (funding_id,name,hint,mandatory,sort_order,how_to_get,official_url) values ((select id from funding_opportunities where name='DGARTES — Programa de Apoio a Projetos (Criação)' order by created_at desc limit 1),'Projeto artístico / portefólio','',true,0,'Preparas e submetes no Balcão Artes.','https://www.dgartes.gov.pt/pt/ebalcao/112');
insert into funding_documents_required (funding_id,name,hint,mandatory,sort_order,how_to_get,official_url) values ((select id from funding_opportunities where name='DGARTES — Programa de Apoio a Projetos (Criação)' order by created_at desc limit 1),'Orçamento do projeto','',true,1,'Modelo no formulário de candidatura.','https://apoios.dgartes.gov.pt/');

insert into funding_opportunities (
  name, program, entity, summary, beneficiaries, eligible_expenses, support_rate, amount_range, status, complexity, hidden_conditions, risks, incompatibilities, required_docs, source_url, platform_url, info_url, domain_id, publish_status, review_status
) values (
  'Bolsas Jovens Criadores',
  'Programa de apoio a jovens criadores',
  'DGARTES / GAC',
  'Bolsas para jovens criadores nas áreas das artes visuais, performativas, literatura, música e outras, para desenvolvimento de trabalho e carreira artística.',
  'Jovens criadores (limites de idade definidos por edição).',
  'Desenvolvimento de projeto e trabalho artístico.',
  'Bolsa (valor por edição).',
  'Bolsa por edição',
  'previsto',
  'media',
  'Limites de idade (jovem criador). Candidaturas por edição anual com prazo específico (ex.: até 30/04 em 2026). Áreas elegíveis variam.',
  'Concorrido; prazos anuais curtos.',
  'Verificar acumulação com outros apoios à criação.',
  'Projeto, portefólio, comprovativo de idade.',
  'https://www.dgartes.gov.pt/pt/taxonomy/term/123',
  'https://apoios.dgartes.gov.pt/',
  'https://www.dgartes.gov.pt/pt/taxonomy/term/123',
  (select id from domains where slug='cultura'), 'publicado', 'por_rever'
);
insert into eligibility_rules (funding_id,label,field,operator,value,value2,severity,explain_pass,explain_fail,sort_order) values ((select id from funding_opportunities where name='Bolsas Jovens Criadores' order by created_at desc limit 1),'Jovem criador','promoter_age','lte','35',null,'aviso','Dentro do perfil jovem.','As bolsas jovens criadores têm limite de idade (confirmar na edição).',0);
insert into funding_amounts (funding_id,label,kind,rate,fixed_amount,cap,base_field,notes) values ((select id from funding_opportunities where name='Bolsas Jovens Criadores' order by created_at desc limit 1),'Bolsa','fixo',null,5000,null,'budget_eur','Valor por edição. VALIDAR.');
insert into funding_documents_required (funding_id,name,hint,mandatory,sort_order,how_to_get,official_url) values ((select id from funding_opportunities where name='Bolsas Jovens Criadores' order by created_at desc limit 1),'Projeto e portefólio','',true,0,'Submete no Balcão Artes.','https://apoios.dgartes.gov.pt/');

insert into funding_opportunities (
  name, program, entity, summary, beneficiaries, eligible_expenses, support_rate, amount_range, status, complexity, hidden_conditions, risks, incompatibilities, required_docs, source_url, platform_url, info_url, domain_id, publish_status, review_status
) values (
  'Vale Digitalização (Portugal 2030)',
  'SICE / COMPETE 2030 / Programas Regionais',
  'IAPMEI / Portugal 2030',
  'Apoio simplificado à digitalização de PME — aquisição de serviços como ERP, CRM, cloud. Até ~20.000€ com taxa até 75% a fundo perdido e processo expedito.',
  'Micro, pequenas e médias empresas (PME) com contabilidade organizada.',
  'Serviços de digitalização: ERP, CRM, cloud, presença digital, e-commerce.',
  'Até 75% a fundo perdido.',
  'Até ~20.000€',
  'aberto',
  'baixa',
  'Empresa tem de estar legalmente constituída e com situação regularizada. Candidatura no Balcão dos Fundos. Despesa só elegível após data do aviso. Vales têm dotação limitada e fecham quando esgota.',
  'Dotação esgota. Serviços têm de ser de entidades elegíveis. Despesa antes da data elegível não conta.',
  'Não acumulável com outro apoio para a mesma despesa.',
  'Certidão de PME, situação fiscal/contributiva regularizada, orçamentos dos serviços.',
  'https://www.iapmei.pt/PRODUTOS-E-SERVICOS/Incentivos-Financiamento/Sistemas-de-Incentivos.aspx',
  'https://balcaofundosue.pt/',
  'https://portugal2030.pt/',
  (select id from domains where slug='inovacao'), 'publicado', 'por_rever'
);
insert into eligibility_rules (funding_id,label,field,operator,value,value2,severity,explain_pass,explain_fail,sort_order) values ((select id from funding_opportunities where name='Vale Digitalização (Portugal 2030)' order by created_at desc limit 1),'Empresa constituída','company_exists','is_true',null,null,'eliminatoria','Tens empresa — elegível.','O Vale Digitalização é para empresas já constituídas (PME).',0);
insert into eligibility_rules (funding_id,label,field,operator,value,value2,severity,explain_pass,explain_fail,sort_order) values ((select id from funding_opportunities where name='Vale Digitalização (Portugal 2030)' order by created_at desc limit 1),'Situação fiscal regularizada','tax_situation_ok','is_true',null,null,'aviso','Situação regularizada.','Exige situação fiscal e contributiva regularizada.',1);
insert into funding_amounts (funding_id,label,kind,rate,fixed_amount,cap,base_field,notes) values ((select id from funding_opportunities where name='Vale Digitalização (Portugal 2030)' order by created_at desc limit 1),'Vale (estimativa)','percentagem',75,null,15000,'budget_eur','Até 75% a fundo perdido, máx ~20.000€. VALIDAR aviso.');
insert into funding_documents_required (funding_id,name,hint,mandatory,sort_order,how_to_get,official_url) values ((select id from funding_opportunities where name='Vale Digitalização (Portugal 2030)' order by created_at desc limit 1),'Certidão de PME (IAPMEI)','',true,0,'Obténs no IAPMEI.','https://www.iapmei.pt/');
insert into funding_documents_required (funding_id,name,hint,mandatory,sort_order,how_to_get,official_url) values ((select id from funding_opportunities where name='Vale Digitalização (Portugal 2030)' order by created_at desc limit 1),'Situação regularizada (Finanças e Seg. Social)','',true,1,'Portal das Finanças e Segurança Social Direta.','https://www.portaldasfinancas.gov.pt/');
insert into funding_documents_required (funding_id,name,hint,mandatory,sort_order,how_to_get,official_url) values ((select id from funding_opportunities where name='Vale Digitalização (Portugal 2030)' order by created_at desc limit 1),'Orçamentos dos serviços','',true,2,'Pede a fornecedores de serviços digitais.',null);

insert into funding_opportunities (
  name, program, entity, summary, beneficiaries, eligible_expenses, support_rate, amount_range, status, complexity, hidden_conditions, risks, incompatibilities, required_docs, source_url, platform_url, info_url, domain_id, publish_status, review_status
) values (
  'SIFIDE II — Incentivo Fiscal a I&D',
  'Sistema de Incentivos Fiscais à I&D Empresarial',
  'ANI / Autoridade Tributária',
  'Incentivo fiscal que permite deduzir até 82,5% das despesas de investigação e desenvolvimento (I&D) na coleta do IRC. Aplica-se retroativamente às despesas do ano anterior.',
  'Empresas com despesas de I&D e IRC a pagar.',
  'Despesas de I&D: pessoal, equipamento, contratação de I&D, patentes.',
  'Dedução até 82,5% das despesas de I&D na coleta de IRC.',
  'Depende das despesas de I&D e do IRC',
  'aberto',
  'alta',
  'É um benefício FISCAL (dedução no IRC), não um subsídio em dinheiro — só vale se a empresa tiver coleta de IRC. Em 2026 o SIFIDE indireto (via fundos) foi eliminado. Candidatura anual à ANI com dossier técnico.',
  'Sem IRC a pagar, o benefício não se materializa logo (pode reportar). Exige dossier técnico robusto de I&D.',
  'As mesmas despesas não podem ser usadas noutro incentivo em duplicação.',
  'Dossier técnico de I&D, contabilidade das despesas, candidatura à ANI.',
  'https://www.ani.pt/',
  'https://sifide.ani.pt/',
  'https://www.ani.pt/pt/financiamento/incentivos-fiscais-sifide-ii/',
  (select id from domains where slug='inovacao'), 'publicado', 'por_rever'
);
insert into eligibility_rules (funding_id,label,field,operator,value,value2,severity,explain_pass,explain_fail,sort_order) values ((select id from funding_opportunities where name='SIFIDE II — Incentivo Fiscal a I&D' order by created_at desc limit 1),'Empresa constituída','company_exists','is_true',null,null,'eliminatoria','Empresa elegível.','O SIFIDE é para empresas (com IRC).',0);
insert into funding_amounts (funding_id,label,kind,rate,fixed_amount,cap,base_field,notes) values ((select id from funding_opportunities where name='SIFIDE II — Incentivo Fiscal a I&D' order by created_at desc limit 1),'Dedução fiscal','percentagem',82,null,null,'budget_eur','Até 82,5% das despesas de I&D na coleta de IRC. Não é dinheiro direto.');
insert into funding_documents_required (funding_id,name,hint,mandatory,sort_order,how_to_get,official_url) values ((select id from funding_opportunities where name='SIFIDE II — Incentivo Fiscal a I&D' order by created_at desc limit 1),'Dossier técnico de I&D','Descreve os projetos de I&D.',true,0,'Preparas e submetes à ANI.','https://sifide.ani.pt/');
insert into funding_documents_required (funding_id,name,hint,mandatory,sort_order,how_to_get,official_url) values ((select id from funding_opportunities where name='SIFIDE II — Incentivo Fiscal a I&D' order by created_at desc limit 1),'Contabilidade das despesas de I&D','',true,1,'Do teu contabilista.',null);

insert into funding_opportunities (
  name, program, entity, summary, beneficiaries, eligible_expenses, support_rate, amount_range, status, complexity, hidden_conditions, risks, incompatibilities, required_docs, source_url, platform_url, info_url, domain_id, publish_status, review_status
) values (
  'Sistema de Incentivos à Inovação Produtiva (Portugal 2030)',
  'SICE — Inovação Produtiva / COMPETE 2030 e Regionais',
  'IAPMEI / Agência para o Desenvolvimento e Coesão',
  'Principal instrumento do Portugal 2030 para investimento produtivo das PME: novos estabelecimentos, aumento de capacidade, diversificação, transformação de processos. Apoio a fundo perdido até 60% em algumas regiões.',
  'PME (e algumas grandes empresas) com projetos de investimento produtivo inovador.',
  'Investimento produtivo: equipamento, instalações, ativos intangíveis.',
  'Até 60% a fundo perdido (territórios de baixa densidade); modelo misto noutros.',
  'Dezenas a centenas de milhares €',
  'aberto',
  'alta',
  'Candidaturas por fases e avisos (ex.: Fase 2 até 31/03/2026). Territórios de baixa densidade têm taxas mais altas e menos concorrência. Projeto tem de ser inovador, não mera substituição. Candidatura no Balcão dos Fundos.',
  'Avaliado por mérito e concorrência. Investimento antes da data elegível não conta. Modelo misto implica parte reembolsável.',
  'Não acumulável com outros sistemas para o mesmo investimento.',
  'Plano de investimento, certidão de PME, situação regularizada, projeções financeiras.',
  'https://www.iapmei.pt/PRODUTOS-E-SERVICOS/Incentivos-Financiamento/Sistemas-de-Incentivos.aspx',
  'https://balcaofundosue.pt/',
  'https://portugal2030.pt/',
  (select id from domains where slug='inovacao'), 'publicado', 'por_rever'
);
insert into eligibility_rules (funding_id,label,field,operator,value,value2,severity,explain_pass,explain_fail,sort_order) values ((select id from funding_opportunities where name='Sistema de Incentivos à Inovação Produtiva (Portugal 2030)' order by created_at desc limit 1),'Empresa constituída (PME)','company_exists','is_true',null,null,'eliminatoria','Empresa elegível.','É para empresas constituídas (sobretudo PME).',0);
insert into eligibility_rules (funding_id,label,field,operator,value,value2,severity,explain_pass,explain_fail,sort_order) values ((select id from funding_opportunities where name='Sistema de Incentivos à Inovação Produtiva (Portugal 2030)' order by created_at desc limit 1),'Localização (territórios de baixa densidade dão mais)','location_district','neq','',null,'aviso','Localização registada.','Territórios de baixa densidade têm taxas mais altas — confirma o teu concelho.',1);
insert into funding_amounts (funding_id,label,kind,rate,fixed_amount,cap,base_field,notes) values ((select id from funding_opportunities where name='Sistema de Incentivos à Inovação Produtiva (Portugal 2030)' order by created_at desc limit 1),'Apoio ao investimento','percentagem',60,null,null,'budget_eur','Até 60% fundo perdido (baixa densidade). VALIDAR aviso e região.');
insert into funding_documents_required (funding_id,name,hint,mandatory,sort_order,how_to_get,official_url) values ((select id from funding_opportunities where name='Sistema de Incentivos à Inovação Produtiva (Portugal 2030)' order by created_at desc limit 1),'Plano de investimento','',true,0,'Preparas com projeções; submetes no Balcão dos Fundos.','https://balcaofundosue.pt/');
insert into funding_documents_required (funding_id,name,hint,mandatory,sort_order,how_to_get,official_url) values ((select id from funding_opportunities where name='Sistema de Incentivos à Inovação Produtiva (Portugal 2030)' order by created_at desc limit 1),'Certidão de PME','',true,1,'IAPMEI.','https://www.iapmei.pt/');

insert into questions (domain_id,field,label,hint,input_type,options,shared,sort_order,section,section_order,required,placeholder,also_writes) values
((select id from domains where slug='cultura'),'goal','Descreve o teu projeto artístico',null,'textarea',null,false,0,'O teu projeto',3,true,null,null),
((select id from domains where slug='cultura'),'investment_type','Área artística','','select','["Artes visuais","Artes performativas","Música","Literatura/edição","Cruzamento disciplinar"]'::jsonb,false,1,'O teu projeto',3,false,null,null);

insert into questions (domain_id,field,label,hint,input_type,options,shared,sort_order,section,section_order,required,placeholder,also_writes) values
((select id from domains where slug='inovacao'),'goal','O que queres fazer na tua empresa?',null,'textarea',null,false,0,'O teu projeto',3,true,null,null),
((select id from domains where slug='inovacao'),'company_exists','A tua empresa já está constituída?','A maioria destes apoios é para empresas existentes.','yesno',null,false,1,'O teu projeto',3,true,null,null),
((select id from domains where slug='inovacao'),'budget_eur','Investimento previsto (€)',null,'number',null,false,2,'O teu projeto',3,false,'Ex.: 30000',null);
