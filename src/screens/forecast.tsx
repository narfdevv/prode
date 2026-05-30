"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { matches } from "@/data/matches";
import { Button } from "@/components/ui/button";
import { CountryFlag } from "@/components/country-flag";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

type ScoreDraft = { home: string; away: string };

const STORAGE_KEY = "prode_predictions";

function loadSaved(): Record<string, ScoreDraft> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const initial: Record<string, ScoreDraft> = {};
  matches.forEach((m) => {
    if (m.prediction !== undefined) {
      initial[m.id] = {
        home: m.prediction.home.toString(),
        away: m.prediction.away.toString(),
      };
    }
  });
  return initial;
}

export default function Forecast() {
  const { toast } = useToast();
  const [activeGroup, setActiveGroup] = useState("Todos");
  const [savedPredictions, setSavedPredictions] = useState<Record<string, ScoreDraft>>(loadSaved);
  const [draftPredictions, setDraftPredictions] = useState<Record<string, ScoreDraft>>({});
  const [editingMatches, setEditingMatches] = useState<Set<string>>(new Set());

  const filteredMatches = matches.filter(
    (m) => activeGroup === "Todos" || m.group === activeGroup
  );

  const handleScoreChange = (matchId: string, team: "home" | "away", val: string) => {
    if (val === "" || /^[0-9]$/.test(val)) {
      setDraftPredictions((prev) => ({
        ...prev,
        [matchId]: { ...(prev[matchId] || { home: "", away: "" }), [team]: val },
      }));
    }
  };

  const handleEdit = (matchId: string) => {
    const saved = savedPredictions[matchId];
    setDraftPredictions((prev) => ({
      ...prev,
      [matchId]: saved ? { ...saved } : { home: "", away: "" },
    }));
    setEditingMatches((prev) => new Set(prev).add(matchId));
  };

  const handleSave = (matchId: string) => {
    const draft = draftPredictions[matchId];
    const updated = { ...savedPredictions, [matchId]: draft };
    setSavedPredictions(updated);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
    setEditingMatches((prev) => {
      const next = new Set(prev);
      next.delete(matchId);
      return next;
    });
    toast({ title: "¡Pronóstico guardado!", description: "Tus resultados han sido registrados." });
  };

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Próximos Partidos</h1>
        <p className="text-slate-500 mt-1 text-sm">Fase de Grupos - Ronda 1</p>
      </div>

      <Tabs defaultValue="Todos" className="mb-6" onValueChange={setActiveGroup}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="Todos">Todos los Grupos</TabsTrigger>
          <TabsTrigger value="Group A">Grupo A</TabsTrigger>
          <TabsTrigger value="Group B">Grupo B</TabsTrigger>
          <TabsTrigger value="Group C">Grupo C</TabsTrigger>
          <TabsTrigger value="Group D">Grupo D</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredMatches.map((m) => {
          const isSaved = !!savedPredictions[m.id];
          const isEditing = editingMatches.has(m.id);
          const draft = draftPredictions[m.id];
          const saved = savedPredictions[m.id];

          const currentHome = isEditing || !isSaved ? (draft?.home ?? "") : (saved?.home ?? "");
          const currentAway = isEditing || !isSaved ? (draft?.away ?? "") : (saved?.away ?? "");
          const inputsDisabled = isSaved && !isEditing;

          const canSave =
            draft?.home !== "" &&
            draft?.away !== "" &&
            draft?.home !== undefined &&
            draft?.away !== undefined;

          const isUrgent = !!m.isUrgent;

          return (
            <div
              key={m.id}
              className="bg-white rounded-xl border shadow-sm p-4 md:p-5 flex flex-col"
              data-testid={`card-match-${m.id}`}
            >
              <div className="flex justify-between items-center mb-5">
                <span className="px-2 py-1 bg-slate-100 text-xs font-bold rounded text-slate-600">
                  {m.group}
                </span>
                <div className={`flex items-center gap-1 text-xs font-medium ${isUrgent ? "text-destructive" : "text-slate-500"}`}>
                  <Clock className="w-3 h-3" />
                  Cierra en {m.closesIn}
                </div>
              </div>

              <div className="flex justify-center items-end gap-3 md:gap-4 mb-5">
                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-3xl md:text-4xl">
                    <CountryFlag countryCode={m.homeCountryCode} label={m.homeTeam} />
                  </span>
                  <span className="font-bold text-xs md:text-sm">{m.homeTeam}</span>
                  <Input
                    className="w-12 h-12 md:w-14 md:h-14 text-center text-xl font-bold bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    value={currentHome}
                    disabled={inputsDisabled}
                    onChange={(e) => handleScoreChange(m.id, "home", e.target.value)}
                    data-testid={`input-score-home-${m.id}`}
                  />
                </div>
                <div className="text-lg font-bold text-slate-300 mb-3">:</div>
                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-3xl md:text-4xl">
                    <CountryFlag countryCode={m.awayCountryCode} label={m.awayTeam} />
                  </span>
                  <span className="font-bold text-xs md:text-sm">{m.awayTeam}</span>
                  <Input
                    className="w-12 h-12 md:w-14 md:h-14 text-center text-xl font-bold bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    value={currentAway}
                    disabled={inputsDisabled}
                    onChange={(e) => handleScoreChange(m.id, "away", e.target.value)}
                    data-testid={`input-score-away-${m.id}`}
                  />
                </div>
              </div>

              {isSaved && !isEditing ? (
                <Button variant="outline" className="w-full text-sm" onClick={() => handleEdit(m.id)} data-testid={`btn-edit-prediction-${m.id}`}>
                  Editar Pronóstico
                </Button>
              ) : (
                <Button className="w-full text-sm" disabled={!canSave} onClick={() => handleSave(m.id)} data-testid={`btn-save-prediction-${m.id}`}>
                  Guardar Pronóstico
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
}
