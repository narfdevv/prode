import { Trophy, Clock, Star, CheckCircle2 } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";

export default function Rules() {
  return (
    <AppLayout>
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Reglamento Oficial</h1>
        <p className="text-slate-500 mt-1 text-sm">Normas y sistema de puntuación del torneo corporativo.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 md:gap-6 mb-4 md:mb-6">
        <div className="lg:w-[60%] bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 md:p-6 border-b flex items-center gap-3">
            <Trophy className="w-5 h-5 md:w-6 md:h-6 text-secondary" />
            <h2 className="text-lg md:text-xl font-bold text-slate-900">Sistema de Puntuación</h2>
          </div>
          <div className="p-5 md:p-6 flex-1 space-y-5 md:space-y-6">
            <div className="flex gap-3 md:gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-white font-bold flex items-center justify-center shrink-0 text-sm">2</div>
              <div>
                <h3 className="font-bold text-base md:text-lg text-slate-900">Acierto de Resultado</h3>
                <p className="text-slate-600 text-xs md:text-sm mt-1">1 punto por acertar el equipo ganador o si el partido termina en empate, sin importar el marcador exacto.</p>
              </div>
            </div>
            <div className="flex gap-3 md:gap-4">
              <div className="w-8 h-8 rounded-full bg-accent text-white font-bold flex items-center justify-center shrink-0 text-sm">+3</div>
              <div>
                <h3 className="font-bold text-base md:text-lg text-slate-900">Bono por Marcador Exacto</h3>
                <p className="text-slate-600 text-xs md:text-sm mt-1">3 puntos adicionales si aciertas la cantidad exacta de goles de ambos equipos.</p>
              </div>
            </div>
          </div>
          <div className="bg-primary text-primary-foreground p-5 md:p-6 flex items-center gap-3 md:gap-4">
            <div className="p-2.5 bg-white/10 rounded-full">
              <Star className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <div className="text-[10px] md:text-xs uppercase tracking-wider font-bold opacity-80">Máxima Puntuación</div>
              <div className="text-base md:text-lg font-bold">Acierto Perfecto — 5 PUNTOS</div>
            </div>
          </div>
        </div>

        <div className="lg:w-[40%] bg-white rounded-xl border shadow-sm p-5 md:p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-5">
            <Clock className="w-5 h-5 md:w-6 md:h-6 text-destructive" />
            <h2 className="text-lg md:text-xl font-bold text-slate-900">Cierre de predicciones</h2>
          </div>
          <div className="space-y-3 md:space-y-4 mb-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-accent shrink-0 mt-0.5" />
              <p className="text-xs md:text-sm text-slate-600 font-medium">Las predicciones cierran exactamente 1 hora antes del horario oficial de inicio de cada partido.</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-accent shrink-0 mt-0.5" />
              <p className="text-xs md:text-sm text-slate-600 font-medium">Una vez cerrado, no se podrán modificar los pronósticos bajo ninguna circunstancia.</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-accent shrink-0 mt-0.5" />
              <p className="text-xs md:text-sm text-slate-600 font-medium">Si no ingresas un pronóstico, sumarás 0 puntos para ese partido.</p>
            </div>
          </div>
          <div className="mt-auto h-28 md:h-32 bg-slate-900 rounded-lg overflow-hidden relative flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950 opacity-90" />
            <span className="relative text-white/80 font-bold tracking-widest uppercase text-xs md:text-sm">FIFA World Cup 2026™</span>
          </div>
        </div>
      </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 p-5 md:p-6 mb-4 md:mb-6">
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 md:p-6">
          <h3 className="font-bold text-primary mb-2 text-base md:text-lg">Fase de Grupos</h3>
          <p className="text-xs md:text-sm text-slate-700">Todos los pronósticos se basan en el resultado al finalizar los 90 minutos reglamentarios, incluyendo el tiempo de descuento otorgado por el árbitro.</p>
        </div>
        <div className="bg-accent/5 border border-accent/20 rounded-xl p-5 md:p-6">
          <h3 className="font-bold text-accent mb-2 text-base md:text-lg">Eliminatorias</h3>
          <p className="text-xs md:text-sm text-slate-700">Para partidos de eliminación directa, el resultado válido incluye los 90 minutos + tiempo extra si lo hubiera. No se contabilizan los penales para el resultado final.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-5 md:p-6 mb-4 md:mb-6">
        <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-4 md:mb-6">Desempate en el Ranking</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { n: "1", title: "Marcadores Exactos", desc: "Mayor cantidad de partidos con el resultado exacto acertado (5 puntos)." },
            { n: "2", title: "Resultados Correctos", desc: "Mayor cantidad de partidos donde se acertó ganador o empate (2 puntos)." },
            { n: "3", title: "Primera Predicción", desc: "Usuario que haya registrado su primera predicción del torneo más temprano." },
          ].map((item) => (
            <div key={item.n} className="p-4 bg-slate-50 border rounded-lg">
              <div className="text-2xl md:text-3xl font-black text-slate-200 mb-2">{item.n}</div>
              <h3 className="font-bold text-slate-900 mb-1 text-sm">{item.title}</h3>
              <p className="text-xs text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>


    </AppLayout>
  );
}
