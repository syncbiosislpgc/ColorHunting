"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { COLLAGE_TEMPLATES } from "@/data/collageTemplates";
import type { GameController } from "@/hooks/useGame";
import { generateCollage, shareOrDownload } from "@/lib/collage/generateCollage";
import { getPhotoObjectUrl } from "@/lib/storage/photoDb";
import type { CollageTemplateId, PlayerId } from "@/types";

function PhotoThumb({
  id,
  selected,
  onToggle,
}: {
  id: string;
  selected: boolean;
  onToggle: () => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;
    void getPhotoObjectUrl(id).then((u) => {
      if (!active) {
        if (u) URL.revokeObjectURL(u);
        return;
      }
      objectUrl = u;
      setUrl(u);
    });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [id]);

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative aspect-square overflow-hidden rounded-2xl ring-2 transition ${
        selected ? "ring-[#1c1410]" : "ring-transparent opacity-60"
      }`}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="h-full w-full bg-black/10" />
      )}
      {selected && (
        <span className="absolute right-2 top-2 rounded-full bg-[#1c1410] px-2 py-0.5 text-[10px] text-white">
          OK
        </span>
      )}
    </button>
  );
}

export function AlbumScreen({
  game,
  player,
}: {
  game: GameController;
  player: PlayerId;
}) {
  const s = game.state!;
  const name = s.players[player].name;
  const photos = s.photos.filter(
    (p) => p.playerId === player || p.isJoint || p.playerId === "both",
  );

  return (
    <ScreenShell tone="cream">
      <div className="flex flex-1 flex-col">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] opacity-50">
          Collages
        </p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl leading-none">
          El álbum de {name}
        </h2>
        <p className="mt-3 text-sm opacity-60">
          Elige las mejores. La foto conjunta entra sola.
        </p>

        {photos.length === 0 ? (
          <p className="mt-10 text-sm opacity-50">No hay fotos de {name} todavía.</p>
        ) : (
          <div className="mt-6 grid grid-cols-3 gap-2">
            {photos.map((p) => (
              <PhotoThumb
                key={p.id}
                id={p.id}
                selected={player === "gabri" ? p.selectedForGabri : p.selectedForTati}
                onToggle={() => {
                  if (p.isJoint) return;
                  game.togglePhotoSelection(p.id, player);
                }}
              />
            ))}
          </div>
        )}

        <div className="mt-auto pt-8">
          <Button
            onClick={() => {
              game.syncCollageSelection();
              game.go(player === "gabri" ? "collageTati" : "collageJoint");
            }}
          >
            Continuar
          </Button>
        </div>
      </div>
    </ScreenShell>
  );
}

export function JointPhotoScreen({ game }: { game: GameController }) {
  const joint = game.state?.photos.find((p) => p.isJoint);
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!joint) return;
    let objectUrl: string | null = null;
    void getPhotoObjectUrl(joint.id).then((u) => {
      objectUrl = u;
      setUrl(u);
    });
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [joint]);

  return (
    <ScreenShell tone="sunset">
      <div className="flex flex-1 flex-col">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] opacity-50">
          Destacada
        </p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl leading-none">
          La foto de la cita
        </h2>
        <p className="mt-3 text-sm opacity-60">Va en los dos collages. Automáticamente.</p>

        <div className="mt-8 overflow-hidden rounded-[1.75rem] bg-black/5">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="Foto conjunta" className="max-h-[50vh] w-full object-cover" />
          ) : (
            <div className="flex h-56 items-center justify-center text-sm opacity-50">
              Sin foto conjunta
            </div>
          )}
        </div>

        <div className="mt-auto pt-8">
          <Button
            onClick={() => {
              game.syncCollageSelection();
              game.go("collageTemplates");
            }}
          >
            Elegir plantillas
          </Button>
        </div>
      </div>
    </ScreenShell>
  );
}

export function TemplatesScreen({ game }: { game: GameController }) {
  const s = game.state!;

  const TemplatePicker = ({
    player,
    value,
  }: {
    player: PlayerId;
    value: CollageTemplateId;
  }) => (
    <div className="mt-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] opacity-50">
        {s.players[player].name}
      </p>
      <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
        {COLLAGE_TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => game.setTemplate(player, t.id)}
            className={`min-w-[140px] rounded-2xl px-3 py-3 text-left transition ${
              value === t.id
                ? "bg-[#1c1410] text-[#fff8f1]"
                : "bg-white/60 text-[#1c1410]"
            }`}
          >
            <p className="text-sm font-semibold">{t.name}</p>
            <p className="mt-1 text-[11px] opacity-70">{t.description}</p>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <ScreenShell tone="cream">
      <div className="flex flex-1 flex-col">
        <h2 className="font-[family-name:var(--font-display)] text-4xl leading-none">
          Plantillas
        </h2>
        <p className="mt-3 text-sm opacity-60">Cada uno puede elegir un estilo distinto.</p>
        <TemplatePicker player="gabri" value={s.collage.gabriTemplate} />
        <TemplatePicker player="tati" value={s.collage.tatiTemplate} />
        <div className="mt-auto pt-8">
          <Button
            onClick={() => {
              game.syncCollageSelection();
              game.go("collageGenerate");
            }}
          >
            Generar collages
          </Button>
        </div>
      </div>
    </ScreenShell>
  );
}

export function GenerateCollageScreen({ game }: { game: GameController }) {
  const s = game.state!;
  const [busy, setBusy] = useState<"gabri" | "tati" | null>(null);
  const [preview, setPreview] = useState<{ player: PlayerId; url: string } | null>(null);

  const run = async (player: PlayerId) => {
    setBusy(player);
    try {
      const ids =
        player === "gabri"
          ? s.photos.filter((p) => p.selectedForGabri).map((p) => p.id)
          : s.photos.filter((p) => p.selectedForTati).map((p) => p.id);

      const blob = await generateCollage({
        photoIds: ids,
        template: player === "gabri" ? s.collage.gabriTemplate : s.collage.tatiTemplate,
        playerName: s.players[player].name,
        partnerLine: "GABRI × TATI",
        dateLabel: s.config.dateLabel,
        cityLabel: s.config.cityLabel,
        tagline: s.config.adventureTagline,
        accentHex:
          player === "gabri"
            ? undefined
            : "#2a9d8f",
      });

      const url = URL.createObjectURL(blob);
      setPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev.url);
        return { player, url };
      });
      game.markCollageGenerated(player);
      await shareOrDownload(
        blob,
        `${s.players[player].name.toLowerCase()}-gabri-tati.jpg`,
      );
    } finally {
      setBusy(null);
    }
  };

  return (
    <ScreenShell tone="cream">
      <div className="flex flex-1 flex-col">
        <h2 className="font-[family-name:var(--font-display)] text-4xl leading-none">
          Generar
        </h2>
        <p className="mt-3 text-sm opacity-60">
          Dos imágenes distintas. Todo se procesa en este teléfono.
        </p>

        {preview && (
          <div className="mt-6 overflow-hidden rounded-[1.5rem]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview.url} alt={`Collage de ${preview.player}`} className="w-full" />
          </div>
        )}

        <div className="mt-auto flex flex-col gap-2 pt-8">
          <Button disabled={busy !== null} onClick={() => void run("gabri")}>
            {busy === "gabri" ? "Generando…" : `Generar collage de ${s.players.gabri.name}`}
          </Button>
          <Button
            variant="soft"
            disabled={busy !== null}
            onClick={() => void run("tati")}
          >
            {busy === "tati" ? "Generando…" : `Generar collage de ${s.players.tati.name}`}
          </Button>
          <Button variant="ghost" onClick={() => game.go("collageGabri")}>
            Volver a editar
          </Button>
          <Button
            onClick={() => game.go("results")}
            disabled={!s.collage.gabriGenerated && !s.collage.tatiGenerated}
          >
            Ver resultado
          </Button>
        </div>
      </div>
    </ScreenShell>
  );
}
