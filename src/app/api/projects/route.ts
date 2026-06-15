import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServiceClient } from "@/lib/supabase";

// Mapa de campos conhecidos de 'projects' e o seu tipo, para converter
// as respostas dinâmicas do questionário no formato certo.
const BOOL_FIELDS = [
  "activity_open", "has_nifap", "first_install", "has_water",
  "received_aid_before", "tax_situation_ok", "first_home",
  "owns_home", "company_exists", "has_public_guarantee_before",
  "iefp_registered", "has_children",
];
const NUM_FIELDS = [
  "promoter_age", "birth_year_age", "area_ha", "budget_eur", "property_price_eur",
  "annual_income_eur", "household_size", "co_applicants",
  "latitude", "longitude",
];
const TEXT_FIELDS = [
  "contact_name", "contact_email", "contact_phone", "promoter_type",
  "location_district", "location_municipality", "water_notes",
  "crops", "animals", "buildings", "goal", "timeline",
  "production_mode", "investment_type", "employment_status",
  "energy_certificate",
];

const toBool = (v: any) =>
  v === "sim" || v === true ? true : v === "nao" || v === false ? false : null;
const toNum = (v: any) => (v === "" || v == null ? null : Number(v));

export async function POST(req: Request) {
  try {
    const b = await req.json();
    const supabase = createServiceClient();

    // utilizador autenticado? (opcional)
    let userId: string | null = null;
    const auth = req.headers.get("authorization");
    if (auth) {
      try {
        const token = auth.replace("Bearer ", "");
        const userClient = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          { global: { headers: { Authorization: `Bearer ${token}` } } }
        );
        const {
          data: { user },
        } = await userClient.auth.getUser();
        userId = user?.id ?? null;
      } catch {
        userId = null;
      }
    }

    // resolver domínio (slug -> id)
    let domainId: string | null = null;
    if (b.dominio) {
      const { data: dom } = await supabase
        .from("domains")
        .select("id")
        .eq("slug", b.dominio)
        .maybeSingle();
      domainId = dom?.id ?? null;
    }

    // construir o registo só com os campos conhecidos que vieram
    const record: Record<string, any> = {
      domain_id: domainId,
      user_id: userId,
      status: "novo",
    };
    for (const f of BOOL_FIELDS) if (f in b) record[f] = toBool(b[f]);
    for (const f of NUM_FIELDS) if (f in b) record[f] = toNum(b[f]);
    for (const f of TEXT_FIELDS) if (f in b) record[f] = b[f] || null;

    const { data, error } = await supabase
      .from("projects")
      .insert(record)
      .select("id")
      .single();

    if (error) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Se autenticado, atualiza/cria o perfil partilhado com as transversais
    if (userId) {
      const profilePatch: Record<string, any> = {
        user_id: userId,
        updated_at: new Date().toISOString(),
      };
      if ("contact_name" in b) profilePatch.full_name = b.contact_name || null;
      if ("contact_email" in b) profilePatch.email = b.contact_email || null;
      if ("contact_phone" in b) profilePatch.phone = b.contact_phone || null;
      if ("promoter_age" in b) profilePatch.promoter_age = toNum(b.promoter_age);
      if ("employment_status" in b)
        profilePatch.employment_status = b.employment_status || null;
      if ("location_district" in b)
        profilePatch.location_district = b.location_district || null;
      if ("location_municipality" in b)
        profilePatch.location_municipality = b.location_municipality || null;
      if ("annual_income_eur" in b)
        profilePatch.annual_income_eur = toNum(b.annual_income_eur);
      if ("tax_situation_ok" in b)
        profilePatch.tax_situation_ok = toBool(b.tax_situation_ok);

      await supabase
        .from("shared_profiles")
        .upsert(profilePatch, { onConflict: "user_id" });
    }

    return NextResponse.json({ ok: true, id: data.id });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
}
