/**
 * E2E: flujo inicial + generación de collages Gabri/Tati (todas las plantillas).
 * Run: npx tsx scripts/e2e-collage.ts
 */
import { chromium, type Page, type Download } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const OUT = "/opt/cursor/artifacts";

const TEMPLATES = [
  "editorial",
  "polaroid",
  "film",
  "instagram",
  "scrapbook",
  "contact",
  "travel",
] as const;

async function makePhotoBuffer(
  page: Page,
  color: string,
  label: string,
): Promise<number[]> {
  return page.evaluate(
    async ({ color, label }) => {
      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 800;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 640, 800);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 56px sans-serif";
      ctx.fillText(label, 40, 100);
      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.92),
      );
      return Array.from(new Uint8Array(await blob.arrayBuffer()));
    },
    { color, label },
  );
}

async function putPhoto(page: Page, id: string, bytes: number[]) {
  await page.evaluate(
    async ({ id, bytes }) => {
      const blob = new Blob([new Uint8Array(bytes)], { type: "image/jpeg" });
      await new Promise<void>((resolve, reject) => {
        const req = indexedDB.open("gabri-tati-photos", 1);
        req.onupgradeneeded = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains("photos")) {
            db.createObjectStore("photos", { keyPath: "id" });
          }
        };
        req.onsuccess = () => {
          const db = req.result;
          const tx = db.transaction("photos", "readwrite");
          tx.objectStore("photos").put({ id, blob, mimeType: "image/jpeg" });
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
          tx.onerror = () => reject(tx.error);
        };
        req.onerror = () => reject(req.error);
      });
    },
    { id, bytes },
  );
}

async function injectFinishedGame(page: Page) {
  const gabri = await makePhotoBuffer(page, "#2F6FED", "GABRI");
  const tati = await makePhotoBuffer(page, "#FF6F61", "TATI");
  const joint = await makePhotoBuffer(page, "#2EC4B6", "JUNTOS");

  await putPhoto(page, "photo_gabri_1", gabri);
  await putPhoto(page, "photo_gabri_2", gabri);
  await putPhoto(page, "photo_tati_1", tati);
  await putPhoto(page, "photo_tati_2", tati);
  await putPhoto(page, "photo_joint", joint);

  await page.evaluate(() => {
    const now = new Date().toISOString();
    const state = {
      version: 1,
      createdAt: now,
      updatedAt: now,
      screen: "collageGenerate",
      players: {
        gabri: {
          id: "gabri",
          name: "Gabri",
          initialColorId: "azul",
          currentColorId: "azul",
          score: 18,
        },
        tati: {
          id: "tati",
          name: "Tati",
          initialColorId: "coral",
          currentColorId: "coral",
          score: 20,
        },
      },
      localPlayer: "gabri",
      playMode: "together",
      sessionCode: "TEST01",
      sessionSeed: 123,
      isHost: true,
      missionIds: [
        "color-salvaje",
        "casi-invisible",
        "naturaleza",
        "ciudad",
        "reflejo",
        "letras",
        "pequenito",
        "gigante",
        "selfie-tonto",
        "final-joint-photo",
      ],
      currentMissionIndex: 9,
      completed: Array.from({ length: 10 }, (_, i) => ({
        missionId: "x",
        index: i,
        completedAt: now,
        completedBy: i === 9 ? "both" : i % 2 === 0 ? "gabri" : "tati",
        pointsAwarded: 3,
      })),
      photos: [
        {
          id: "photo_gabri_1",
          missionId: "color-salvaje",
          missionIndex: 0,
          playerId: "gabri",
          createdAt: now,
          isJoint: false,
          selectedForGabri: true,
          selectedForTati: false,
        },
        {
          id: "photo_gabri_2",
          missionId: "naturaleza",
          missionIndex: 2,
          playerId: "gabri",
          createdAt: now,
          isJoint: false,
          selectedForGabri: true,
          selectedForTati: false,
        },
        {
          id: "photo_tati_1",
          missionId: "casi-invisible",
          missionIndex: 1,
          playerId: "tati",
          createdAt: now,
          isJoint: false,
          selectedForGabri: false,
          selectedForTati: true,
        },
        {
          id: "photo_tati_2",
          missionId: "ciudad",
          missionIndex: 3,
          playerId: "tati",
          createdAt: now,
          isJoint: false,
          selectedForGabri: false,
          selectedForTati: true,
        },
        {
          id: "photo_joint",
          missionId: "final-joint-photo",
          missionIndex: 9,
          playerId: "both",
          createdAt: now,
          isJoint: true,
          selectedForGabri: true,
          selectedForTati: true,
        },
      ],
      colorSwapTriggered: false,
      colorSwapPending: false,
      colorSwapAtIndex: null,
      events: [],
      restaurantId: "goiko",
      discardedRestaurantIds: [],
      jointBonus: 5,
      collage: {
        gabriPhotoIds: ["photo_gabri_1", "photo_gabri_2", "photo_joint"],
        tatiPhotoIds: ["photo_tati_1", "photo_tati_2", "photo_joint"],
        gabriTemplate: "editorial",
        tatiTemplate: "polaroid",
        gabriGenerated: false,
        tatiGenerated: false,
      },
      activeSpecialChallengeId: null,
      activeEventId: null,
      config: {
        colorSwapEnabled: true,
        colorSwapProbability: 0.55,
        eventProbability: 0.22,
        maxEventsPerGame: 2,
        includeSpecialInRandom: true,
        cityLabel: "Las Palmas de Gran Canaria",
        dateLabel: "11 de septiembre de 2026",
        adventureTagline: "Una tarde para dos",
      },
    };
    localStorage.setItem("gabri-tati-adventure-v2", JSON.stringify(state));
  });
}

async function openCollageGenerate(page: Page) {
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /^Continuar$/i }).click();
  await page.getByRole("button", { name: /Generar collage de Gabri/i }).waitFor({
    timeout: 15000,
  });
}

async function saveDownload(download: Download, filePath: string) {
  await download.saveAs(filePath);
  const stat = fs.statSync(filePath);
  assert.ok(stat.size > 10_000, `${filePath} demasiado pequeño (${stat.size})`);
  const buf = fs.readFileSync(filePath);
  assert.equal(buf[0], 0xff, "JPEG SOI byte 0");
  assert.equal(buf[1], 0xd8, "JPEG SOI byte 1");
  return buf;
}

async function setTemplates(
  page: Page,
  gabri: string,
  tati: string,
) {
  await page.evaluate(
    ({ gabri, tati }) => {
      const raw = localStorage.getItem("gabri-tati-adventure-v2");
      if (!raw) throw new Error("no state");
      const s = JSON.parse(raw);
      s.collage.gabriTemplate = gabri;
      s.collage.tatiTemplate = tati;
      s.collage.gabriGenerated = false;
      s.collage.tatiGenerated = false;
      s.screen = "collageGenerate";
      localStorage.setItem("gabri-tati-adventure-v2", JSON.stringify(s));
    },
    { gabri, tati },
  );
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    acceptDownloads: true,
  });

  console.log("1) Flujo inicial…");
  await page.goto(BASE, { waitUntil: "networkidle" });
  // Limpiar partida previa si existe
  await page.evaluate(() => {
    localStorage.clear();
    indexedDB.deleteDatabase("gabri-tati-photos");
  });
  await page.reload({ waitUntil: "networkidle" });

  await page.getByRole("button", { name: /Abrir|Nueva aventura/i }).click();
  await page.getByText("Solo tienes que hacer una cosa").waitFor();
  await page.getByRole("button", { name: /Seguir/i }).click();
  await page.getByRole("button", { name: /Entendido/i }).click();
  await page.getByRole("button", { name: /Empezar/i }).click();
  await page.getByText("¿Quién eres?").waitFor();
  assert.equal(await page.getByText("¿Quién juega?").count(), 0);
  await page.getByRole("button", { name: /Soy Gabri/i }).click();
  await page.getByText("¿Cómo jugáis?").waitFor();

  console.log("2) QR host…");
  await page.getByRole("button", { name: /Crear aventura/i }).click();
  await page.getByAltText("Código QR para unirse").waitFor({ timeout: 15000 });
  await page.screenshot({
    path: path.join(OUT, "test_host_qr_and_code.png"),
    fullPage: true,
  });

  console.log("3) Restaurantes…");
  await page.getByRole("button", { name: /Seguir como anfitrión/i }).click();
  await page.getByText("¿Dónde comemos?").waitFor();
  const restaurantsPath = path.join(process.cwd(), "src/data/restaurants.ts");
  const restaurantsSrc = fs.readFileSync(restaurantsPath, "utf8");
  for (const name of [
    "Goiko",
    "KFC",
    "Turca",
    "McDonald",
    "Splits",
    "Kebab",
    "Scooter",
    "Santa Brígida",
    "Poke",
    "200gr",
    "Ca Manolo",
  ]) {
    assert.ok(restaurantsSrc.includes(name), `falta en data: ${name}`);
  }
  assert.ok(!restaurantsSrc.includes("Burger King"));
  assert.ok(!restaurantsSrc.includes("Pizza Hut"));
  assert.ok(!restaurantsSrc.includes("Subway"));
  await page.getByRole("button", { name: /^Girar$/i }).click();
  await page.getByText(/Hoy coméis en/i).waitFor({ timeout: 10000 });
  await page.screenshot({ path: path.join(OUT, "test_food_roulette_result.png") });
  await page.getByRole("button", { name: /Vale, nos quedamos/i }).click();
  await page
    .getByRole("heading", { name: /descubre tu color/i })
    .waitFor({ timeout: 10000 });
  console.log("OK food -> colors");

  console.log("4) Inyectar partida terminada + fotos…");
  await injectFinishedGame(page);
  await openCollageGenerate(page);
  await page.screenshot({
    path: path.join(OUT, "test_collage_generate_screen.png"),
  });

  console.log("5) Generar collages UI (editorial + polaroid)…");
  const [dlG] = await Promise.all([
    page.waitForEvent("download", { timeout: 30000 }),
    page.getByRole("button", { name: /Generar collage de Gabri/i }).click(),
  ]);
  const gabriUiPath = path.join(OUT, "test_collage_gabri_ui.jpg");
  const gabriBuf = await saveDownload(dlG, gabriUiPath);
  await expectPreview(page, "gabri");

  const [dlT] = await Promise.all([
    page.waitForEvent("download", { timeout: 30000 }),
    page.getByRole("button", { name: /Generar collage de Tati/i }).click(),
  ]);
  const tatiUiPath = path.join(OUT, "test_collage_tati_ui.jpg");
  const tatiBuf = await saveDownload(dlT, tatiUiPath);
  await expectPreview(page, "tati");

  assert.notEqual(
    Buffer.compare(gabriBuf, tatiBuf),
    0,
    "los dos collages UI no deben ser idénticos",
  );
  await page.screenshot({ path: path.join(OUT, "test_collages_generated.png") });

  console.log("6) Separación de fotos…");
  const separation = await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem("gabri-tati-adventure-v2")!);
    const g = s.photos.filter((p: { selectedForGabri: boolean }) => p.selectedForGabri);
    const t = s.photos.filter((p: { selectedForTati: boolean }) => p.selectedForTati);
    return {
      gabriHasTatiOnly: g.some(
        (p: { playerId: string; isJoint: boolean }) =>
          p.playerId === "tati" && !p.isJoint,
      ),
      tatiHasGabriOnly: t.some(
        (p: { playerId: string; isJoint: boolean }) =>
          p.playerId === "gabri" && !p.isJoint,
      ),
      bothHaveJoint:
        g.some((p: { isJoint: boolean }) => p.isJoint) &&
        t.some((p: { isJoint: boolean }) => p.isJoint),
      gabriCount: g.length,
      tatiCount: t.length,
    };
  });
  assert.equal(separation.gabriHasTatiOnly, false);
  assert.equal(separation.tatiHasGabriOnly, false);
  assert.equal(separation.bothHaveJoint, true);
  assert.equal(separation.gabriCount, 3);
  assert.equal(separation.tatiCount, 3);

  console.log("7) Todas las plantillas…");
  for (const template of TEMPLATES) {
    await setTemplates(page, template, template);
    await openCollageGenerate(page);
    const [dl] = await Promise.all([
      page.waitForEvent("download", { timeout: 30000 }),
      page.getByRole("button", { name: /Generar collage de Gabri/i }).click(),
    ]);
    const outPath = path.join(OUT, `test_collage_template_${template}.jpg`);
    const buf = await saveDownload(dl, outPath);
    console.log(`  ✓ ${template}: ${buf.length} bytes`);
  }

  console.log("8) Dimensiones del JPEG generado (header SOF)…");
  const dims = jpegSize(gabriBuf);
  assert.equal(dims?.width, 1080, `width=${dims?.width}`);
  assert.equal(dims?.height, 1350, `height=${dims?.height}`);

  await browser.close();

  console.log("\n✓ e2e-collage: OK");
  console.log(`  Gabri UI: ${gabriBuf.length} bytes (${dims?.width}×${dims?.height})`);
  console.log(`  Tati UI:  ${tatiBuf.length} bytes`);
  console.log(`  Plantillas: ${TEMPLATES.length}/7 OK`);
  console.log(`  Separación fotos: OK (joint en ambos)`);
}

async function expectPreview(page: Page, player: "gabri" | "tati") {
  const img = page.locator(`img[alt="Collage de ${player}"]`);
  await img.waitFor({ timeout: 10000 });
  const box = await img.boundingBox();
  assert.ok(box && box.width > 100, "preview visible");
}

/** Lee width/height de un JPEG desde el marcador SOF0/SOF2. */
function jpegSize(buf: Buffer): { width: number; height: number } | null {
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xff) return null;
    const marker = buf[i + 1]!;
    const len = buf.readUInt16BE(i + 2);
    // SOF0 / SOF2
    if (marker === 0xc0 || marker === 0xc2) {
      return {
        height: buf.readUInt16BE(i + 5),
        width: buf.readUInt16BE(i + 7),
      };
    }
    i += 2 + len;
  }
  return null;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
