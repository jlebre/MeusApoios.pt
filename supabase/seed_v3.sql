-- ============================================================
-- Seed v3 — "como obter" os documentos (passo guiado)
-- Corre DEPOIS de seed_v2.sql.
-- Em vez de ir buscar dados oficiais (proibido/inseguro), GUIAMOS
-- a pessoa a obtê-los ela própria nos portais oficiais.
-- ============================================================

update funding_documents_required set
  how_to_get = 'Obténs no Portal das Finanças: Cidadãos > Serviços > Certidões > Pedir. Emissão gratuita e imediata.',
  official_url = 'https://www.portaldasfinancas.gov.pt/'
where name ilike '%Finanças%' or name ilike '%não dívida às Finanças%';

update funding_documents_required set
  how_to_get = 'Obténs na Segurança Social Direta: Perfil > Documentos de prova > Situação contributiva.',
  official_url = 'https://www.seg-social.pt/inicio'
where name ilike '%Segurança Social%';

update funding_documents_required set
  how_to_get = 'Registo no IFAP. Se ainda não tens NIFAP, pedes na entidade de atendimento do IFAP ou organização de agricultores da tua zona.',
  official_url = 'https://www.ifap.pt/'
where name ilike '%NIFAP%';

update funding_documents_required set
  how_to_get = 'O plano de negócios/empresarial preenche-se no próprio formulário de candidatura. Vale a pena preparar números realistas antes (investimento, receitas previstas).',
  official_url = 'https://www.gpp.pt/index.php/pepac/pepac-plano-estrategico-da-pac-2023-2027'
where name ilike '%plano%negócios%' or name ilike '%plano empresarial%' or name ilike '%Plano de Negócios%';

update funding_documents_required set
  how_to_get = 'Pede orçamentos a fornecedores para cada investimento. Importante: a despesa só conta a partir da data elegível do aviso.',
  official_url = null
where name ilike '%orçamento%';
