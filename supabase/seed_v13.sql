-- ============================================================
-- Seed v13 — Reforço dos domínios magros (habitação, saúde)
-- Corre DEPOIS de seed_v12.sql. Tudo review_status='por_rever'.
-- Dá mais profundidade às áreas que tinham só 1 fundo.
-- ============================================================

insert into funding_opportunities (
  name, program, entity, summary, beneficiaries, eligible_expenses, support_rate, amount_range, status, complexity, hidden_conditions, risks, incompatibilities, required_docs, source_url, platform_url, info_url, domain_id, publish_status, review_status
) values (
  'Porta 65 Jovem (apoio ao arrendamento)',
  'Porta 65 / IHRU',
  'Instituto da Habitação e da Reabilitação Urbana (IHRU)',
  'Apoio ao arrendamento de habitação para jovens entre 18 e 35 anos, sob a forma de uma percentagem da renda mensal, atribuído durante 12 meses e renovável até 5 anos. Em 2026 o apoio médio é de ~275€/mês.',
  'Jovens entre 18 e 35 anos (num casal, um pode ter até 37) que arrendam a 1.ª casa para residência permanente.',
  'Percentagem do valor da renda mensal (apoio direto ao arrendamento).',
  'Percentagem da renda: ~50% no 1.º ano, 35% no 2.º, 25% a partir do 3.º (com majorações possíveis).',
  '~275€/mês (média 2026), renovável até 5 anos',
  'aberto',
  'media',
  'Rendimento mensal corrigido do agregado não pode exceder 4x o salário mínimo (3.680€/mês em 2026). A renda não pode ultrapassar o limite por tipologia e localização. Candidaturas contínuas, avaliadas mensalmente, sujeitas a dotação. Tem de renovar todos os anos. Não pode ser proprietário de outra habitação na mesma zona.',
  'Se a dotação esgota, transita para o mês seguinte. Não renovar a tempo interrompe o apoio. Renda acima do limite exclui.',
  'Não acumulável com outros apoios públicos diretos à renda (ex.: programas municipais) nem com o Porta 65+.',
  'Contrato de arrendamento, comprovativo de rendimentos, dados do agregado (validados com AT e Segurança Social).',
  'https://www.portaldahabitacao.pt/',
  'https://www.portaldahabitacao.pt/',
  'https://www.portaldahabitacao.pt/web/guest/porta-65-jovem',
  (select id from domains where slug='habitacao'), 'publicado', 'por_rever'
);
insert into eligibility_rules (funding_id,label,field,operator,value,value2,severity,explain_pass,explain_fail,sort_order) values ((select id from funding_opportunities where name='Porta 65 Jovem (apoio ao arrendamento)' order by created_at desc limit 1),'Idade entre 18 e 35','promoter_age','between','18','35','eliminatoria','Dentro do limite de idade.','O Porta 65 Jovem é para 18-35 anos (num casal, um pode ter até 37).',0);
insert into eligibility_rules (funding_id,label,field,operator,value,value2,severity,explain_pass,explain_fail,sort_order) values ((select id from funding_opportunities where name='Porta 65 Jovem (apoio ao arrendamento)' order by created_at desc limit 1),'Rendimento até 4x salário mínimo (3.680€/mês)','annual_income_eur','lte','44160',null,'eliminatoria','Rendimento dentro do limite.','O rendimento mensal corrigido não pode exceder 3.680€/mês (~44.160€/ano) em 2026.',1);
insert into eligibility_rules (funding_id,label,field,operator,value,value2,severity,explain_pass,explain_fail,sort_order) values ((select id from funding_opportunities where name='Porta 65 Jovem (apoio ao arrendamento)' order by created_at desc limit 1),'Para arrendamento (não compra)','goal','eq','Arrendar',null,'aviso','Procuras arrendamento — adequado.','O Porta 65 é apoio à RENDA, não à compra.',2);
insert into funding_amounts (funding_id,label,kind,rate,fixed_amount,cap,base_field,notes) values ((select id from funding_opportunities where name='Porta 65 Jovem (apoio ao arrendamento)' order by created_at desc limit 1),'Apoio mensal à renda','fixo',null,3300,null,'budget_eur','~275€/mês × 12 = ~3.300€/ano (média 2026). Depende da renda e escalão.');
insert into funding_documents_required (funding_id,name,hint,mandatory,sort_order,how_to_get,official_url) values ((select id from funding_opportunities where name='Porta 65 Jovem (apoio ao arrendamento)' order by created_at desc limit 1),'Contrato de arrendamento','',true,0,'Do teu senhorio; submetes no Portal da Habitação.','https://www.portaldahabitacao.pt/');
insert into funding_documents_required (funding_id,name,hint,mandatory,sort_order,how_to_get,official_url) values ((select id from funding_opportunities where name='Porta 65 Jovem (apoio ao arrendamento)' order by created_at desc limit 1),'Comprovativo de rendimentos','Validado com a AT.',true,1,'Portal das Finanças.','https://www.portaldasfinancas.gov.pt/');

insert into funding_opportunities (
  name, program, entity, summary, beneficiaries, eligible_expenses, support_rate, amount_range, status, complexity, hidden_conditions, risks, incompatibilities, required_docs, source_url, platform_url, info_url, domain_id, publish_status, review_status
) values (
  'Porta 65+ (arrendamento, sem limite de idade)',
  'Porta 65+ / IHRU',
  'Instituto da Habitação e da Reabilitação Urbana (IHRU)',
  'Apoio ao arrendamento para agregados em fragilidade financeira, sem limite de idade. Criado para quem teve quebra de rendimentos superior a 20% ou para famílias monoparentais. Em 2026 prevê-se incluir vítimas de violência doméstica.',
  'Agregados (qualquer idade) com quebra de rendimentos >20%, famílias monoparentais, e (a partir de 2026) vítimas de violência doméstica com estatuto.',
  'Apoio mensal à renda (diferença para a taxa de esforço máxima).',
  'Diferença entre a renda e o valor para atingir a taxa de esforço máxima do agregado.',
  'Variável conforme renda e rendimentos',
  'aberto',
  'media',
  'Exige quebra de rendimentos >20% (ou monoparentalidade). Candidaturas contínuas ao longo do ano. Não acumulável com Porta 65 Jovem. Validação cruzada com AT e Segurança Social.',
  'Depende de dotação. Mudança de casa obriga a nova análise.',
  'Não acumulável com o Porta 65 Jovem nem com outros apoios diretos à renda.',
  'Contrato de arrendamento, comprovativo da quebra de rendimentos, dados do agregado.',
  'https://www.portaldahabitacao.pt/',
  'https://www.portaldahabitacao.pt/',
  'https://www.portaldahabitacao.pt/web/guest/porta-65-jovem',
  (select id from domains where slug='habitacao'), 'publicado', 'por_rever'
);
insert into eligibility_rules (funding_id,label,field,operator,value,value2,severity,explain_pass,explain_fail,sort_order) values ((select id from funding_opportunities where name='Porta 65+ (arrendamento, sem limite de idade)' order by created_at desc limit 1),'Para arrendamento','goal','eq','Arrendar',null,'aviso','Procuras arrendamento — adequado.','O Porta 65+ é apoio à renda.',0);
insert into funding_amounts (funding_id,label,kind,rate,fixed_amount,cap,base_field,notes) values ((select id from funding_opportunities where name='Porta 65+ (arrendamento, sem limite de idade)' order by created_at desc limit 1),'Apoio à renda','fixo',null,3000,null,'budget_eur','Variável (diferença para a taxa de esforço). Estimativa.');
insert into funding_documents_required (funding_id,name,hint,mandatory,sort_order,how_to_get,official_url) values ((select id from funding_opportunities where name='Porta 65+ (arrendamento, sem limite de idade)' order by created_at desc limit 1),'Comprovativo de quebra de rendimentos','Para provar a quebra >20%.',true,0,'Declarações de rendimento atuais vs anteriores.','https://www.portaldasfinancas.gov.pt/');
insert into funding_documents_required (funding_id,name,hint,mandatory,sort_order,how_to_get,official_url) values ((select id from funding_opportunities where name='Porta 65+ (arrendamento, sem limite de idade)' order by created_at desc limit 1),'Contrato de arrendamento','',true,1,'Submetes no Portal da Habitação.','https://www.portaldahabitacao.pt/');

insert into funding_opportunities (
  name, program, entity, summary, beneficiaries, eligible_expenses, support_rate, amount_range, status, complexity, hidden_conditions, risks, incompatibilities, required_docs, source_url, platform_url, info_url, domain_id, publish_status, review_status
) values (
  'Arrendamento Apoiado (habitação do Estado)',
  'Regime do Arrendamento Apoiado',
  'IHRU / Municípios',
  'Disponibilização de imóveis públicos para arrendamento, com renda calculada em função dos rendimentos do agregado. Para quem não usufrui de outros apoios habitacionais.',
  'Agregados de baixos rendimentos sem outros apoios habitacionais, em situação de necessidade.',
  'Renda reduzida de habitação pública (calculada pelo rendimento).',
  'Renda calculada em função do rendimento do agregado (taxa de esforço).',
  'Renda reduzida (poupança variável)',
  'aberto',
  'media',
  'Depende da disponibilidade de imóveis públicos (oferta limitada). Candidatura na plataforma eletrónica do IHRU ou no município. Sujeito a condição de recursos.',
  'Oferta de imóveis muito limitada face à procura. Listas de espera.',
  'Não acumulável com outros apoios à renda para a mesma habitação.',
  'Comprovativo de rendimentos, dados do agregado, comprovativo de necessidade habitacional.',
  'https://www.portaldahabitacao.pt/',
  'https://www.portaldahabitacao.pt/',
  'https://www.portaldahabitacao.pt/',
  (select id from domains where slug='habitacao'), 'publicado', 'por_rever'
);
insert into eligibility_rules (funding_id,label,field,operator,value,value2,severity,explain_pass,explain_fail,sort_order) values ((select id from funding_opportunities where name='Arrendamento Apoiado (habitação do Estado)' order by created_at desc limit 1),'Rendimentos baixos','annual_income_eur','lte','20000',null,'aviso','Rendimento compatível.','Destina-se a agregados de baixos rendimentos; valores altos podem não ter prioridade.',0);
insert into funding_amounts (funding_id,label,kind,rate,fixed_amount,cap,base_field,notes) values ((select id from funding_opportunities where name='Arrendamento Apoiado (habitação do Estado)' order by created_at desc limit 1),'Renda apoiada','fixo',null,2400,null,'budget_eur','Poupança estimada vs mercado. Muito variável.');
insert into funding_documents_required (funding_id,name,hint,mandatory,sort_order,how_to_get,official_url) values ((select id from funding_opportunities where name='Arrendamento Apoiado (habitação do Estado)' order by created_at desc limit 1),'Comprovativo de rendimentos','',true,0,'Portal das Finanças / Segurança Social.','https://www.portaldasfinancas.gov.pt/');

insert into funding_opportunities (
  name, program, entity, summary, beneficiaries, eligible_expenses, support_rate, amount_range, status, complexity, hidden_conditions, risks, incompatibilities, required_docs, source_url, platform_url, info_url, domain_id, publish_status, review_status
) values (
  'Complemento Solidário para Idosos (CSI)',
  'Proteção social a idosos de baixos recursos',
  'Segurança Social',
  'Apoio mensal em dinheiro para idosos (66 anos e 9 meses ou mais) com baixos rendimentos. Valor de referência 670€/mês em 2026. Dá ainda acesso a medicamentos comparticipados 100% gratuitos e reembolso de óculos e próteses.',
  'Idosos residentes em Portugal com 66 anos e 9 meses ou mais, com baixos rendimentos. Também pensionistas de invalidez sem PSI.',
  'Prestação pecuniária mensal + benefícios adicionais de saúde.',
  'Diferença até ao valor de referência (670€/mês em 2026).',
  'Até 670€/mês (referência 2026)',
  'aberto',
  'media',
  'Idade 66 anos e 9 meses ou mais. Rendimentos anuais ≤8.040€ (pessoa só) ou ≤14.070€ (casal). É preciso autorizar a Segurança Social a aceder à informação fiscal e bancária. Desde 2024 os rendimentos dos filhos já NÃO contam. Conta o património mobiliário e imobiliário (exceto residência).',
  'Suspende se os rendimentos subirem ou por falta de comunicação de alterações. Conta património para além do rendimento.',
  'Acumula com pensões de velhice/invalidez/sobrevivência e 1.º grau do complemento por dependência; não com a PSI.',
  'Documento de identificação, cartão de pensionista, comprovativos de rendimentos e pensões.',
  'https://www.seg-social.pt/',
  'https://www.seg-social.pt/',
  'https://www.seg-social.pt/complemento-solidario-para-idosos',
  (select id from domains where slug='saude'), 'publicado', 'por_rever'
);
insert into eligibility_rules (funding_id,label,field,operator,value,value2,severity,explain_pass,explain_fail,sort_order) values ((select id from funding_opportunities where name='Complemento Solidário para Idosos (CSI)' order by created_at desc limit 1),'Idade 66 anos e 9 meses ou mais','promoter_age','gte','67',null,'eliminatoria','Dentro da idade de acesso.','O CSI é para idosos com 66 anos e 9 meses ou mais.',0);
insert into eligibility_rules (funding_id,label,field,operator,value,value2,severity,explain_pass,explain_fail,sort_order) values ((select id from funding_opportunities where name='Complemento Solidário para Idosos (CSI)' order by created_at desc limit 1),'Rendimentos baixos','annual_income_eur','lte','8040',null,'aviso','Rendimento compatível (pessoa só).','Rendimento anual ≤8.040€ (pessoa só) ou ≤14.070€ (casal). Acima disso não há direito.',1);
insert into funding_amounts (funding_id,label,kind,rate,fixed_amount,cap,base_field,notes) values ((select id from funding_opportunities where name='Complemento Solidário para Idosos (CSI)' order by created_at desc limit 1),'Complemento mensal','fixo',null,8040,null,'budget_eur','Até 670€/mês. O valor real é a diferença para o rendimento de referência.');
insert into funding_documents_required (funding_id,name,hint,mandatory,sort_order,how_to_get,official_url) values ((select id from funding_opportunities where name='Complemento Solidário para Idosos (CSI)' order by created_at desc limit 1),'Comprovativos de rendimentos e pensões','Todas as fontes de rendimento.',true,0,'Segurança Social Direta + Finanças.','https://www.seg-social.pt/');
insert into funding_documents_required (funding_id,name,hint,mandatory,sort_order,how_to_get,official_url) values ((select id from funding_opportunities where name='Complemento Solidário para Idosos (CSI)' order by created_at desc limit 1),'Autorização de acesso à informação fiscal e bancária','Obrigatória para o CSI.',true,1,'Dás no requerimento do CSI.','https://www.seg-social.pt/');
