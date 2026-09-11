import type { CollageTemplateId } from "@/types";
import { loadImageElement } from "@/lib/storage/photoDb";

export interface CollageOptions {
  photoIds: string[];
  template: CollageTemplateId;
  playerName: string;
  partnerLine: string;
  dateLabel: string;
  cityLabel: string;
  tagline: string;
  accentHex?: string;
}

function coverDraw(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const ir = img.width / img.height;
  const tr = w / h;
  let sx = 0;
  let sy = 0;
  let sw = img.width;
  let sh = img.height;
  if (ir > tr) {
    sw = img.height * tr;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / tr;
    sy = (img.height - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function drawFooter(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  opts: CollageOptions,
  ink = "#1a1a1a",
) {
  ctx.fillStyle = ink;
  ctx.textAlign = "center";
  ctx.font = "600 28px Georgia, serif";
  ctx.fillText(opts.partnerLine, w / 2, h - 78);
  ctx.font = "400 18px system-ui, sans-serif";
  ctx.globalAlpha = 0.75;
  ctx.fillText(`${opts.dateLabel} · ${opts.cityLabel}`, w / 2, h - 48);
  ctx.fillText(opts.tagline, w / 2, h - 24);
  ctx.globalAlpha = 1;
}

async function loadImages(ids: string[]): Promise<HTMLImageElement[]> {
  const imgs: HTMLImageElement[] = [];
  for (const id of ids.slice(0, 9)) {
    const img = await loadImageElement(id);
    if (img) imgs.push(img);
  }
  return imgs;
}

function layoutSlots(count: number, template: CollageTemplateId): { x: number; y: number; w: number; h: number }[] {
  const W = 1080;
  const H = 1350;
  const pad = 48;
  const footer = 120;
  const areaH = H - pad * 2 - footer;

  if (template === "instagram" || template === "contact") {
    const cols = count <= 4 ? 2 : 3;
    const rows = Math.ceil(Math.min(count, 9) / cols);
    const gap = 16;
    const cellW = (W - pad * 2 - gap * (cols - 1)) / cols;
    const cellH = (areaH - gap * (rows - 1)) / rows;
    return Array.from({ length: Math.min(count, cols * rows) }, (_, i) => {
      const c = i % cols;
      const r = Math.floor(i / cols);
      return {
        x: pad + c * (cellW + gap),
        y: pad + r * (cellH + gap),
        w: cellW,
        h: cellH,
      };
    });
  }

  if (template === "film") {
    const n = Math.min(count, 5);
    const gap = 20;
    const cellH = (areaH - gap * (n - 1)) / n;
    return Array.from({ length: n }, (_, i) => ({
      x: pad + 80,
      y: pad + i * (cellH + gap),
      w: W - pad * 2 - 160,
      h: cellH,
    }));
  }

  if (template === "polaroid") {
    const n = Math.min(count, 4);
    const positions = [
      { x: 80, y: 70, w: 420, h: 480 },
      { x: 560, y: 120, w: 400, h: 460 },
      { x: 120, y: 620, w: 400, h: 460 },
      { x: 580, y: 680, w: 380, h: 430 },
    ];
    return positions.slice(0, n);
  }

  if (template === "scrapbook") {
    const n = Math.min(count, 5);
    const positions = [
      { x: 60, y: 60, w: 520, h: 420 },
      { x: 560, y: 100, w: 440, h: 380 },
      { x: 80, y: 520, w: 380, h: 420 },
      { x: 500, y: 540, w: 480, h: 360 },
      { x: 320, y: 900, w: 440, h: 280 },
    ];
    return positions.slice(0, n).map((p) => ({
      ...p,
      y: Math.min(p.y, 1080),
    }));
  }

  if (template === "travel") {
    const hero = { x: pad, y: pad, w: W - pad * 2, h: areaH * 0.55 };
    const rest = Math.min(count - 1, 3);
    if (rest <= 0) return [hero];
    const gap = 16;
    const cellW = (W - pad * 2 - gap * (rest - 1)) / rest;
    const cellH = areaH * 0.38;
    const y = pad + hero.h + 20;
    return [
      hero,
      ...Array.from({ length: rest }, (_, i) => ({
        x: pad + i * (cellW + gap),
        y,
        w: cellW,
        h: cellH,
      })),
    ];
  }

  // editorial default
  if (count === 1) {
    return [{ x: pad, y: pad, w: W - pad * 2, h: areaH }];
  }
  if (count === 2) {
    const h = (areaH - 16) / 2;
    return [
      { x: pad, y: pad, w: W - pad * 2, h },
      { x: pad, y: pad + h + 16, w: W - pad * 2, h },
    ];
  }
  const main = { x: pad, y: pad, w: W - pad * 2, h: areaH * 0.58 };
  const sideCount = Math.min(count - 1, 3);
  const gap = 14;
  const cellW = (W - pad * 2 - gap * (sideCount - 1)) / sideCount;
  const cellH = areaH * 0.36;
  const y = pad + main.h + 18;
  return [
    main,
    ...Array.from({ length: sideCount }, (_, i) => ({
      x: pad + i * (cellW + gap),
      y,
      w: cellW,
      h: cellH,
    })),
  ];
}

export async function generateCollage(opts: CollageOptions): Promise<Blob> {
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas no disponible");

  const bg =
    opts.template === "film" || opts.template === "contact"
      ? "#111111"
      : opts.template === "scrapbook"
        ? "#f3e6d8"
        : opts.template === "travel"
          ? "#f7f1e8"
          : "#faf7f2";

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // soft atmosphere
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, (opts.accentHex || "#ff6f61") + "22");
  grad.addColorStop(1, "#2ec4b618");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  const images = await loadImages(opts.photoIds);
  if (images.length === 0) {
    ctx.fillStyle = "#333";
    ctx.font = "28px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("Sin fotos seleccionadas", W / 2, H / 2);
  } else {
    const slots = layoutSlots(images.length, opts.template);
    slots.forEach((slot, i) => {
      const img = images[i];
      if (!img) return;

      if (opts.template === "polaroid") {
        ctx.save();
        ctx.translate(slot.x + slot.w / 2, slot.y + slot.h / 2);
        ctx.rotate(((i % 2 === 0 ? -1 : 1) * 3 * Math.PI) / 180);
        ctx.fillStyle = "#fff";
        ctx.shadowColor = "rgba(0,0,0,0.18)";
        ctx.shadowBlur = 18;
        ctx.fillRect(-slot.w / 2, -slot.h / 2, slot.w, slot.h);
        ctx.shadowBlur = 0;
        coverDraw(ctx, img, -slot.w / 2 + 18, -slot.h / 2 + 18, slot.w - 36, slot.h - 70);
        ctx.restore();
      } else if (opts.template === "film") {
        ctx.fillStyle = "#0a0a0a";
        ctx.fillRect(slot.x - 24, slot.y - 8, slot.w + 48, slot.h + 16);
        // sprocket holes
        ctx.fillStyle = "#222";
        for (let y = slot.y; y < slot.y + slot.h; y += 28) {
          ctx.fillRect(slot.x - 16, y, 10, 14);
          ctx.fillRect(slot.x + slot.w + 6, y, 10, 14);
        }
        coverDraw(ctx, img, slot.x, slot.y, slot.w, slot.h);
      } else if (opts.template === "scrapbook") {
        ctx.save();
        ctx.translate(slot.x + slot.w / 2, slot.y + slot.h / 2);
        ctx.rotate((((i % 3) - 1) * 4 * Math.PI) / 180);
        ctx.fillStyle = "#fffef8";
        ctx.shadowColor = "rgba(0,0,0,0.15)";
        ctx.shadowBlur = 12;
        ctx.fillRect(-slot.w / 2 - 8, -slot.h / 2 - 8, slot.w + 16, slot.h + 16);
        ctx.shadowBlur = 0;
        coverDraw(ctx, img, -slot.w / 2, -slot.h / 2, slot.w, slot.h);
        ctx.restore();
      } else {
        coverDraw(ctx, img, slot.x, slot.y, slot.w, slot.h);
        if (opts.template === "editorial") {
          ctx.strokeStyle = "rgba(0,0,0,0.08)";
          ctx.lineWidth = 2;
          ctx.strokeRect(slot.x, slot.y, slot.w, slot.h);
        }
      }
    });
  }

  // Header player name
  const ink = opts.template === "film" || opts.template === "contact" ? "#f5f5f5" : "#1a1a1a";
  ctx.fillStyle = ink;
  ctx.textAlign = "left";
  ctx.font = "700 36px Georgia, serif";
  ctx.fillText(opts.playerName.toUpperCase(), 48, 42);
  ctx.font = "400 16px system-ui, sans-serif";
  ctx.globalAlpha = 0.6;
  ctx.fillText("álbum de la tarde", 48, 66);
  ctx.globalAlpha = 1;

  drawFooter(ctx, W, H, opts, ink);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error("No se pudo generar el collage"));
        else resolve(blob);
      },
      "image/jpeg",
      0.92,
    );
  });
}

export async function shareOrDownload(blob: Blob, filename: string): Promise<void> {
  const file = new File([blob], filename, { type: blob.type || "image/jpeg" });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: "Gabri × Tati",
        text: "Una tarde para dos",
      });
      return;
    } catch {
      // fall through to download
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
