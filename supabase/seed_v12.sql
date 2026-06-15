-- ============================================================
-- Seed v12 — Domínio STARTUPS E EMPREENDEDORISMO INOVADOR
-- Corre DEPOIS de seed_v11.sql. Tudo review_status='por_rever'.
-- ============================================================

insert into domains (slug,label,description,icon,active,sort_order) values
('startups','Startups e Empreendedorismo','Apoios à criação e crescimento de startups inovadoras: vouchers, incubação, financiamento de ignição.','🚀',true,9)
on conflict (slug) do nothing;

insert into funding_opportunities (
  name, program, entity, summary, beneficiaries, eligible_expenses, support_rate, amount_range, status, complexity, hidden_conditions, risks, incompatibilities, required_docs, source_url, platform_url, info_url, domain_id, publish_status, review_status
) values (
  'StartUP Voucher (IAPMEI)',
  'Estratégia de Empreendedorismo / StartUP Portugal',
  'IAPMEI',
  'Apoio a projetos empresariais em fase de IDEIA, com potencial de criação de startups. Inclui apoio mensal aos promotores, mentoria e acompanhamento durante o desenvolvimento da ideia (até 12 meses).',
  'Promotores com projeto em fase de ideia, sobretudo jovens, nas regiões NUTS II Norte, Centro ou Alentejo.',
  'Bolsa aos promotores, mentoria e desenvolvimento da ideia de negócio.',
  'Apoio mensal por promotor durante o desenvolvimento (por edição).',
  'Bolsa mensal por promotor (até 12 meses)',
  'aberto',
  'media',
  'Projeto tem de estar em FASE DE IDEIA (não empresa já constituída e a faturar). Domicílio fiscal nas regiões Norte, Centro ou Alentejo (Lisboa e Algarve geralmente fora). Candidatura por edição com prazo. Acompanhamento obrigatório.',
  'Concorrido e avaliado por mérito da ideia. Regiões elegíveis limitadas. É para fase muito inicial.',
  'Verificar acumulação com outras medidas de empreendedorismo para o mesmo projeto.',
  'Descrição da ideia/projeto, dados dos promotores, comprovativo de domicílio fiscal.',
  'https://www.iapmei.pt/PRODUTOS-E-SERVICOS/Empreendedorismo-Inovacao/Empreendedorismo-(1)/StartUP-Voucher-2025-2026.aspx',
  'https://www.iapmei.pt/',
  'https://startupportugal.com/pt/programs/',
  (select id from domains where slug='startups'), 'publicado', 'por_rever'
);
insert into eligibility_rules (funding_id,label,field,operator,value,value2,severity,explain_pass,explain_fail,sort_order) values ((select id from funding_opportunities where name='StartUP Voucher (IAPMEI)' order by created_at desc limit 1),'Projeto em fase de ideia (empresa ainda não constituída)','company_exists','is_false',null,null,'eliminatoria','Estás em fase de ideia — elegível.','O StartUP Voucher é para a fase de IDEIA. Se a empresa já existe e fatura, não se aplica.',0);
insert into eligibility_rules (funding_id,label,field,operator,value,value2,severity,explain_pass,explain_fail,sort_order) values ((select id from funding_opportunities where name='StartUP Voucher (IAPMEI)' order by created_at desc limit 1),'Região elegível (Norte, Centro, Alentejo)','location_district','neq','',null,'aviso','Localização registada — confirma a região.','Só elegível com domicílio fiscal no Norte, Centro ou Alentejo. Lisboa e Algarve normalmente fora.',1);
insert into funding_amounts (funding_id,label,kind,rate,fixed_amount,cap,base_field,notes) values ((select id from funding_opportunities where name='StartUP Voucher (IAPMEI)' order by created_at desc limit 1),'Bolsa de promotor','fixo',null,7000,null,'budget_eur','Apoio mensal por promotor ao longo de ~12 meses. VALIDAR valor da edição.');
insert into funding_documents_required (funding_id,name,hint,mandatory,sort_order,how_to_get,official_url) values ((select id from funding_opportunities where name='StartUP Voucher (IAPMEI)' order by created_at desc limit 1),'Descrição da ideia / projeto','',true,0,'Submetes na candidatura IAPMEI.','https://www.iapmei.pt/');
insert into funding_documents_required (funding_id,name,hint,mandatory,sort_order,how_to_get,official_url) values ((select id from funding_opportunities where name='StartUP Voucher (IAPMEI)' order by created_at desc limit 1),'Comprovativo de domicílio fiscal','Para confirmar a região elegível.',true,1,'Portal das Finanças.','https://www.portaldasfinancas.gov.pt/');

insert into funding_opportunities (
  name, program, entity, summary, beneficiaries, eligible_expenses, support_rate, amount_range, status, complexity, hidden_conditions, risks, incompatibilities, required_docs, source_url, platform_url, info_url, domain_id, publish_status, review_status
) values (
  'Vale Incubação',
  'Sistema de Incentivos Empresas 4.0 / StartUP Portugal',
  'IAPMEI / Startup Portugal',
  'Apoio à contratação de serviços de incubação prestados por incubadoras certificadas, para empresas com menos de um ano. Inclui gestão, marketing, apoio jurídico, digitalização e proteção de propriedade intelectual.',
  'Empresas com menos de 1 ano de atividade, incubadas (ou a incubar) em incubadora certificada.',
  'Serviços de incubação: gestão, marketing, jurídico, digitalização, propriedade intelectual.',
  'Apoio à aquisição de serviços de incubação (por aviso).',
  'Vale de serviços de incubação',
  'aberto',
  'media',
  'Empresa com MENOS de 1 ano. Tem de incubar fisicamente numa incubadora CERTIFICADA. Os serviços têm de ser prestados pela incubadora. Candidatura por aviso.',
  'Exige incubadora certificada — verifica a lista. Dotação limitada.',
  'Não acumulável com outro apoio para os mesmos serviços.',
  'Comprovativo de constituição da empresa (<1 ano), acordo com incubadora certificada.',
  'https://www2.gov.pt/cidadaos-europeus-viajar-viver-e-fazer-negocios-em-portugal/apoios-para-empresas-em-portugal/programas-financeiros-e-iniciativas-para-empresarios',
  'https://www.iapmei.pt/',
  'https://startupportugal.com/pt/programs/',
  (select id from domains where slug='startups'), 'publicado', 'por_rever'
);
insert into eligibility_rules (funding_id,label,field,operator,value,value2,severity,explain_pass,explain_fail,sort_order) values ((select id from funding_opportunities where name='Vale Incubação' order by created_at desc limit 1),'Empresa constituída há menos de 1 ano','company_exists','is_true',null,null,'aviso','Empresa criada — confirma que tem menos de 1 ano.','O Vale Incubação é para empresas com menos de 1 ano. Confirma a data de constituição.',0);
insert into funding_amounts (funding_id,label,kind,rate,fixed_amount,cap,base_field,notes) values ((select id from funding_opportunities where name='Vale Incubação' order by created_at desc limit 1),'Vale de incubação','fixo',null,5000,null,'budget_eur','Valor por aviso. VALIDAR.');
insert into funding_documents_required (funding_id,name,hint,mandatory,sort_order,how_to_get,official_url) values ((select id from funding_opportunities where name='Vale Incubação' order by created_at desc limit 1),'Acordo com incubadora certificada','Confirma que a incubadora é certificada.',true,0,'Contacta incubadoras certificadas da tua zona.',null);
insert into funding_documents_required (funding_id,name,hint,mandatory,sort_order,how_to_get,official_url) values ((select id from funding_opportunities where name='Vale Incubação' order by created_at desc limit 1),'Certidão de constituição da empresa','Para provar <1 ano.',true,1,'Portal da Empresa / registo comercial.',null);

insert into funding_opportunities (
  name, program, entity, summary, beneficiaries, eligible_expenses, support_rate, amount_range, status, complexity, hidden_conditions, risks, incompatibilities, required_docs, source_url, platform_url, info_url, domain_id, publish_status, review_status
) values (
  'ADN Startup (Banco Português de Fomento)',
  'Linha de financiamento a startups em fase inicial',
  'Banco Português de Fomento',
  'Linha que facilita o acesso ao financiamento bancário para microempresas em fase inicial do seu ciclo de vida, com uma dotação global de até 10 milhões de euros. Apoia o arranque com condições facilitadas.',
  'Microempresas em fase inicial (startups) que precisam de financiamento bancário.',
  'Necessidades de financiamento do arranque e crescimento inicial.',
  'Acesso facilitado a crédito (garantia/condições), não fundo perdido.',
  'Conforme projeto (linha de crédito)',
  'aberto',
  'alta',
  'É financiamento (crédito com condições facilitadas), não subsídio a fundo perdido. Passa por banco aderente e avaliação de risco. Para microempresas em fase inicial.',
  'É dívida — tens de devolver. O banco avalia a viabilidade. Não é dinheiro a fundo perdido.',
  'Verificar acumulação com outras garantias públicas.',
  'Plano de negócios, contas da empresa, situação regularizada.',
  'https://www.bpfomento.pt/',
  'https://www.bpfomento.pt/pt/catalogo/',
  'https://startupportugal.com/pt/programs/',
  (select id from domains where slug='startups'), 'publicado', 'por_rever'
);
insert into eligibility_rules (funding_id,label,field,operator,value,value2,severity,explain_pass,explain_fail,sort_order) values ((select id from funding_opportunities where name='ADN Startup (Banco Português de Fomento)' order by created_at desc limit 1),'Empresa constituída (microempresa)','company_exists','is_true',null,null,'eliminatoria','Empresa elegível.','O ADN Startup é para microempresas já constituídas em fase inicial.',0);
insert into funding_amounts (funding_id,label,kind,rate,fixed_amount,cap,base_field,notes) values ((select id from funding_opportunities where name='ADN Startup (Banco Português de Fomento)' order by created_at desc limit 1),'Financiamento (crédito)','fixo',null,50000,null,'budget_eur','Linha de crédito facilitado. NÃO é fundo perdido. VALIDAR.');
insert into funding_documents_required (funding_id,name,hint,mandatory,sort_order,how_to_get,official_url) values ((select id from funding_opportunities where name='ADN Startup (Banco Português de Fomento)' order by created_at desc limit 1),'Plano de negócios','',true,0,'Preparas e apresentas no banco aderente.','https://www.bpfomento.pt/');
insert into funding_documents_required (funding_id,name,hint,mandatory,sort_order,how_to_get,official_url) values ((select id from funding_opportunities where name='ADN Startup (Banco Português de Fomento)' order by created_at desc limit 1),'Situação regularizada','',true,1,'Finanças e Segurança Social.','https://www.portaldasfinancas.gov.pt/');

insert into funding_opportunities (
  name, program, entity, summary, beneficiaries, eligible_expenses, support_rate, amount_range, status, complexity, hidden_conditions, risks, incompatibilities, required_docs, source_url, platform_url, info_url, domain_id, publish_status, review_status
) values (
  'Startup Visa',
  'StartUP Portugal',
  'Startup Portugal / AIMA',
  'Programa que permite a empreendedores estrangeiros (fora da UE/EEE) instalar uma startup em Portugal ou transferir uma existente, através de uma incubadora certificada que acolhe o projeto e dá apoio à autorização de residência.',
  'Empreendedores de países terceiros (fora UE/EEE) com projeto de startup inovadora.',
  'Não é apoio financeiro direto — é via de acolhimento + autorização de residência para empreender.',
  'Acolhimento por incubadora certificada + via de residência.',
  'Não financeiro (via de residência)',
  'aberto',
  'alta',
  'Para empreendedores de FORA da UE/EEE. Exige acolhimento por incubadora certificada e cumprir critérios de inovação e viabilidade. Não é dinheiro — é uma via legal para empreender em Portugal.',
  'Processo de candidatura e residência com requisitos próprios. Não dá financiamento direto.',
  '—',
  'Projeto de startup, carta de acolhimento de incubadora certificada, documentos de identificação.',
  'https://startupportugal.com/pt/programs/',
  'https://startupvisa.startupportugal.com/',
  'https://startupportugal.com/pt/programs/',
  (select id from domains where slug='startups'), 'publicado', 'por_rever'
);
insert into funding_documents_required (funding_id,name,hint,mandatory,sort_order,how_to_get,official_url) values ((select id from funding_opportunities where name='Startup Visa' order by created_at desc limit 1),'Carta de acolhimento de incubadora certificada','Essencial para o Startup Visa.',true,0,'Contacta incubadoras certificadas aderentes ao Startup Visa.','https://startupvisa.startupportugal.com/');

insert into questions (domain_id,field,label,hint,input_type,options,shared,sort_order,section,section_order,required,placeholder,also_writes) values
((select id from domains where slug='startups'),'goal','Descreve a tua startup ou ideia',null,'textarea',null,false,0,'A tua startup',3,true,null,null),
((select id from domains where slug='startups'),'company_exists','Já constituíste a empresa?','Vários apoios distinguem fase de ideia vs empresa criada.','yesno',null,false,1,'A tua startup',3,true,null,null),
((select id from domains where slug='startups'),'investment_type','Em que fase estás?','','select','["Ideia","Validação / protótipo","Primeiros clientes","A escalar"]'::jsonb,false,2,'A tua startup',3,false,null,null);
