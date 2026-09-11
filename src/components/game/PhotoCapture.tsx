"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";

interface PhotoCaptureProps {
  onConfirm: (blob: Blob) => void | Promise<void>;
  onCancel?: () => void;
  label?: string;
}

export function PhotoCapture({ onConfirm, onCancel, label = "Añadir foto" }: PhotoCaptureProps) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [busy, setBusy] = useState(false);

  const handleFile = async (file: File | null) => {
    if (!file) return;
    // Compress lightly for iPhone Safari memory
    const processed = await compressImage(file, 1600, 0.82);
    const url = URL.createObjectURL(processed);
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    setBlob(processed);
  };

  const confirm = async () => {
    if (!blob) return;
    setBusy(true);
    try {
      await onConfirm(blob);
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setBlob(null);
  };

  return (
    <div className="flex flex-col gap-3">
      {preview ? (
        <div className="overflow-hidden rounded-[1.5rem] bg-black/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Vista previa" className="max-h-[50vh] w-full object-cover" />
        </div>
      ) : (
        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-current/20 bg-white/30 px-6 text-center">
          <p className="font-[family-name:var(--font-display)] text-2xl">{label}</p>
          <p className="mt-2 text-sm opacity-60">Cámara o galería. Todo se queda en este teléfono.</p>
        </div>
      )}

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
      />

      {!preview ? (
        <div className="grid grid-cols-2 gap-3">
          <Button type="button" onClick={() => cameraRef.current?.click()}>
            Cámara
          </Button>
          <Button type="button" variant="soft" onClick={() => galleryRef.current?.click()}>
            Galería
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <Button type="button" onClick={() => void confirm()} disabled={busy}>
            {busy ? "Guardando…" : "Confirmar"}
          </Button>
          <Button type="button" variant="ghost" onClick={reset}>
            Repetir
          </Button>
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancelar
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

async function compressImage(file: File, maxSide: number, quality: number): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality),
    );
    return blob || file;
  } catch {
    return file;
  }
}
