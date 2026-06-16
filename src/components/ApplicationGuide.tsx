"use client";

import { useState, useEffect } from "react";

type Doc = {
  id: string;
  name: string;
  how_to_get?: string | null;
  official_url?: string | null;
};

type Fund = {
  id: string;
  name: string;
  platform_url?: string | null;
  source_url?: string | null;
  closes_at?: string | null;
  documents: Doc[];
};

const STATUS = [
  { key: "falta", label: "Falta", cls: "bg-slate/15 text-slate" },
  { key: "tenho", label: "Tenho", cls: "bg-sky text-ocean2" },
  { key: "submetido", label: "Submetido", cls: "bg-mint/20 text-mint2" },
];

export default function ApplicationGuide({
  projectId,
  fund,
}: {
  projectId: string;
  fund: Fund;
}) {
  const [statuses, setStatuses] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch(`/api/dossier?project=${projectId}`)
      .then((r) => r.json())
      .then((d) => {
        const map: Record<string, string> = {};
        (d.docs || []).forEach((doc: any) => {
          map[doc.doc_name] = doc.status;
        });
        setStatuses(map);
      })
      .catch(() => {});
  }, [projectId]);

  function setDocStatus(docName: string, status: string) {
    setStatuses((s) => ({ ...s, [docName]: status }));
    fetch("/api/dossier", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_id: projectId,
        funding_id: fund.id,
        doc_name: docName,
        status,
      }),
    }).catch(() => {});
  }

  const total = fund.documents.length;
  const ready = fund.documents.filter(
    (d) => statuses[d.name] === "tenho" || statuses[d.name] === "submetido"
  ).length;

  return (
    <div className="rounded-2xl border border-slate/20 bg-white p-6">
      <h3 className="font-display text-lg font-bold text-ink">
        Como te candidatares: {fund.name}
      </h3>

      {/* Passos */}
      <ol className="mt-3 space-y-2 text-sm">
        <Step n={1}>Reúne os documentos da lista abaixo.</Step>
        <Step n={2}>
          Confirma as condições e o prazo no{" "}
          {fund.source_url ? (
            <a href={fund.source_url} target="_blank" rel="noreferrer" className="text-ocean underline">
              aviso oficial
            </a>
          ) : (
            "aviso oficial"
          )}
          .
        </Step>
        <Step n={3}>
          {fund.platform_url ? (
            <>
              Submete a candidatura na{" "}
              <a href={fund.platform_url} target="_blank" rel="noreferrer" className="text-ocean underline">
                plataforma oficial
              </a>
              .
            </>
          ) : (
            "Submete a candidatura na plataforma oficial."
          )}
        </Step>
        {fund.closes_at && (
          <Step n={4}>
            Não passes do prazo:{" "}
            <strong>{new Date(fund.closes_at).toLocaleDateString("pt-PT")}</strong>.
          </Step>
        )}
      </ol>

      {/* Dossier de documentos */}
      <div className="mt-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate">
            Os teus documentos
          </span>
          <span className="text-xs text-slate">
            {ready}/{total} prontos
          </span>
        </div>
        <ul className="mt-2 space-y-2">
          {fund.documents.map((d) => (
            <li key={d.id} className="rounded-lg bg-cloud p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium text-ink">{d.name}</span>
                <div className="flex gap-1">
                  {STATUS.map((s) => (
                    <button
                      key={s.key}
                      onClick={() => setDocStatus(d.name, s.key)}
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                        (statuses[d.name] || "falta") === s.key
                          ? s.cls
                          : "bg-white text-slate/60"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              {d.how_to_get && (
                <p className="mt-1 text-xs text-slate">{d.how_to_get}</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-2">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ocean text-xs font-bold text-white">
        {n}
      </span>
      <span className="text-ink">{children}</span>
    </li>
  );
}
