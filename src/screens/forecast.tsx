"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { CountryFlag } from "@/components/country-flag";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { getCurrentUserEmail } from "@/lib/current-user";

type ScoreDraft = { home: string; away: string };

type Match = {
  id: number;
  stage: string;
  kickoffAt: string;
  homeTeam: string;
  homeCountryCode: string;
  awayTeam: string;
  awayCountryCode: string;
  status: string;
  prediction: { home: number; away: number } | null;
};

async function fetchMatches(): Promise<Match[]> {
  const email = getCurrentUserEmail();
  if (!email) throw new Error("Missing user email");

  const response = await fetch(`/api/matches?email=${encodeURIComponent(email)}`);
  if (!response.ok) throw new Error("Could not load matches");
  return response.json();
}

async function savePrediction(input: {
  matchId: number;
  predictedHomeScore: number;
  predictedAwayScore: number;
}) {
  const email = getCurrentUserEmail();
  if (!email) throw new Error("Missing user email");

  const response = await fetch("/api/predictions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, ...input }),
  });

  if (!response.ok) throw new Error("Could not save prediction");
}

function formatTimeUntil(value: string) {
  const diff = new Date(value).getTime() - Date.now();
  if (diff <= 0) return "cerrado";

  const minutes = Math.floor(diff / 60000);
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const remainingMinutes = minutes % 60;

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${remainingMinutes}m`;
  return `${remainingMinutes}m`;
}

export default function Forecast() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeGroup, setActiveGroup] = useState("Todos");
  const [draftPredictions, setDraftPredictions] = useState<Record<number, ScoreDraft>>({});
  const [editingMatches, setEditingMatches] = useState<Set<number>>(new Set());
  const { data: matches = [], isLoading } = useQuery({
    queryKey: ["matches"],
    queryFn: fetchMatches,
    enabled: typeof window !== "undefined" && Boolean(getCurrentUserEmail()),
  });
  const savePredictionMutation = useMutation({
    mutationFn: savePrediction,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["matches"] });
      toast({ title: "¡Pronóstico guardado!", description: "Tus resultados han sido registrados." });
    },
    onError: () => {
      toast({
        title: "No pudimos guardar el pronóstico",
        description: "Intentá nuevamente en unos segundos.",
        variant: "destructive",
      });
    },
  });

  const stages = useMemo(() => Array.from(new Set(matches.map((match) => match.stage))), [matches]);
  const filteredMatches = matches.filter((match) => activeGroup === "Todos" || match.stage === activeGroup);

  const handleScoreChange = (matchId: number, team: "home" | "away", val: string) => {
    if (val === "" || /^[0-9]{1,2}$/.test(val)) {
      setDraftPredictions((prev) => ({
        ...prev,
        [matchId]: { ...(prev[matchId] || { home: "", away: "" }), [team]: val },
      }));
    }
  };

  const handleEdit = (match: Match) => {
    const saved = match.prediction;
    setDraftPredictions((prev) => ({
      ...prev,
      [match.id]: saved
        ? { home: String(saved.home), away: String(saved.away) }
        : { home: "", away: "" },
    }));
    setEditingMatches((prev) => new Set(prev).add(match.id));
  };

  const handleSave = (matchId: number) => {
    const draft = draftPredictions[matchId];
    if (!draft) return;

    savePredictionMutation.mutate({
      matchId,
      predictedHomeScore: Number(draft.home),
      predictedAwayScore: Number(draft.away),
    });
    setEditingMatches((prev) => {
      const next = new Set(prev);
      next.delete(matchId);
      return next;
    });
  };

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Próximos Partidos</h1>
        <p className="text-slate-500 mt-1 text-sm">Fixture oficial del Mundial 2026</p>
      </div>

      <Tabs defaultValue="Todos" className="mb-6" onValueChange={setActiveGroup}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="Todos">Todos</TabsTrigger>
          {stages.map((stage) => (
            <TabsTrigger key={stage} value={stage}>
              {stage}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {!isLoading && filteredMatches.length === 0 ? (
          <div className="sm:col-span-2 lg:col-span-3 bg-white rounded-xl border shadow-sm p-8 text-center text-slate-500">
            Todavía no hay partidos sincronizados.
          </div>
        ) : null}
        {filteredMatches.map((m) => {
          const isSaved = !!m.prediction;
          const isEditing = editingMatches.has(m.id);
          const draft = draftPredictions[m.id];
          const saved = m.prediction;

          const currentHome = isEditing || !isSaved ? (draft?.home ?? "") : (saved?.home.toString() ?? "");
          const currentAway = isEditing || !isSaved ? (draft?.away ?? "") : (saved?.away.toString() ?? "");
          const inputsDisabled = isSaved && !isEditing;

          const canSave =
            draft?.home !== "" &&
            draft?.away !== "" &&
            draft?.home !== undefined &&
            draft?.away !== undefined;

          const closesIn = formatTimeUntil(m.kickoffAt);
          const inputsClosed = closesIn === "cerrado";
          const isUrgent = !inputsClosed && new Date(m.kickoffAt).getTime() - Date.now() < 60 * 60 * 1000;

          return (
            <div
              key={m.id}
              className="bg-white rounded-xl border shadow-sm p-4 md:p-5 flex flex-col"
              data-testid={`card-match-${m.id}`}
            >
              <div className="flex justify-between items-center mb-5">
                <span className="px-2 py-1 bg-slate-100 text-xs font-bold rounded text-slate-600">
                  {m.stage}
                </span>
                <div className={`flex items-center gap-1 text-xs font-medium ${isUrgent ? "text-destructive" : "text-slate-500"}`}>
                  <Clock className="w-3 h-3" />
                  {inputsClosed ? "Cerrado" : `Cierra en ${closesIn}`}
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
                    disabled={inputsDisabled || inputsClosed}
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
                    disabled={inputsDisabled || inputsClosed}
                    onChange={(e) => handleScoreChange(m.id, "away", e.target.value)}
                    data-testid={`input-score-away-${m.id}`}
                  />
                </div>
              </div>

              {isSaved && !isEditing ? (
                <Button
                  variant="outline"
                  className="w-full text-sm"
                  disabled={inputsClosed}
                  onClick={() => handleEdit(m)}
                  data-testid={`btn-edit-prediction-${m.id}`}
                >
                  Editar Pronóstico
                </Button>
              ) : (
                <Button
                  className="w-full text-sm"
                  disabled={!canSave || inputsClosed || savePredictionMutation.isPending}
                  onClick={() => handleSave(m.id)}
                  data-testid={`btn-save-prediction-${m.id}`}
                >
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
