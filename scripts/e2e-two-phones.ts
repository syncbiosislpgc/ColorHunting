/**
 * E2E: dos móviles — comida solo invitado, una ruleta de color por móvil.
 * Run: npx tsx scripts/e2e-two-phones.ts
 */
import { chromium, type Browser, type Page } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const OUT = "/opt/cursor/artifacts";

async function clear(page: Page) {
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.evaluate(() => {
    localStorage.clear();
    indexedDB.deleteDatabase("gabri-tati-photos");
  });
  await page.reload({ waitUntil: "networkidle" });
}

async function throughIntro(page: Page, who: "Gabri" | "Tati") {
  await page.getByRole("button", { name: /Abrir|Nueva aventura/i }).click();
  await page.getByRole("button", { name: /Seguir/i }).click();
  await page.getByRole("button", { name: /Entendido/i }).click();
  await page.getByRole("button", { name: /Empezar/i }).click();
  await page.getByText("¿Quién eres?").waitFor();
  await page.getByRole("button", { name: new RegExp(`Soy ${who}`, "i") }).click();
  await page.getByText("¿Cómo jugáis?").waitFor();
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser: Browser = await chromium.launch({ headless: true });
  const host = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const guest = await browser.newPage({ viewport: { width: 390, height: 844 } });

  console.log("1) Host crea aventura…");
  await clear(host);
  await throughIntro(host, "Gabri");
  await host.getByRole("button", { name: /Crear aventura/i }).click();
  await host.getByAltText("Código QR para unirse").waitFor({ timeout: 15000 });
  const codeText = await host
    .locator("p")
    .filter({ hasText: /^[A-Z0-9]{6}$/ })
    .first()
    .innerText();
  assert.match(codeText, /^[A-Z0-9]{6}$/);
  console.log("  session:", codeText);

  await host.getByRole("button", { name: /Seguir como anfitrión/i }).click();
  await host.getByText(/Esperando la comida/i).waitFor({ timeout: 8000 });
  assert.equal(await host.getByText(/¿Dónde comemos\?/i).count(), 0);
  await host.screenshot({ path: path.join(OUT, "test_host_waiting_food.png") });
  console.log("OK host waiting food (sin ruleta)");

  console.log("2) Guest se une y elige comida…");
  await clear(guest);
  await throughIntro(guest, "Tati");
  await guest.getByRole("button", { name: /Unirme con código/i }).click();
  await guest.getByPlaceholder("ABC123").fill(codeText);
  await guest.getByRole("button", { name: /^Unirme/i }).click();
  await guest.getByText(/¿Dónde comemos\?/i).waitFor({ timeout: 8000 });
  await guest.getByRole("button", { name: /^Girar$/i }).click();
  await guest.getByText(/Hoy coméis en/i).waitFor({ timeout: 10000 });
  await guest.getByRole("button", { name: /Vale, nos quedamos/i }).click();
  await guest.getByText(/Código de comida/i).waitFor({ timeout: 8000 });
  const foodCode = await guest
    .locator("p")
    .filter({ hasText: new RegExp(`^${codeText}-`, "i") })
    .first()
    .innerText();
  assert.ok(foodCode.toLowerCase().startsWith(codeText.toLowerCase() + "-"));
  await guest.screenshot({ path: path.join(OUT, "test_guest_food_share.png") });
  console.log("  food code:", foodCode);

  await guest.getByRole("button", { name: /Continuar a mi color/i }).click();
  await guest.getByRole("heading", { name: /Tati, descubre tu color/i }).waitFor();
  assert.equal(await guest.getByText(/Gabri, descubre tu color/i).count(), 0);
  await guest.screenshot({ path: path.join(OUT, "test_guest_only_own_color.png") });
  console.log("OK guest solo ve ruleta Tati");

  console.log("3) Host pega código de comida…");
  await host.getByPlaceholder(new RegExp(`${codeText}-`, "i")).fill(foodCode);
  await host.getByRole("button", { name: /Continuar con ese sitio/i }).click();
  await host.getByRole("heading", { name: /Gabri, descubre tu color/i }).waitFor({
    timeout: 8000,
  });
  assert.equal(await host.getByText(/Tati, descubre tu color/i).count(), 0);
  await host.screenshot({ path: path.join(OUT, "test_host_only_own_color.png") });
  console.log("OK host solo ve ruleta Gabri");

  // Host restaurant synced
  const hostRestaurant = await host.evaluate(() => {
    const s = JSON.parse(localStorage.getItem("gabri-tati-adventure-v2")!);
    return s.restaurantId;
  });
  const guestRestaurant = await guest.evaluate(() => {
    const s = JSON.parse(localStorage.getItem("gabri-tati-adventure-v2")!);
    return s.restaurantId;
  });
  assert.equal(hostRestaurant, guestRestaurant);
  assert.ok(hostRestaurant);
  console.log("OK mismo restaurantId:", hostRestaurant);

  await host.getByRole("button", { name: /^Girar$/i }).click();
  await host.getByText(/Tu color es/i).waitFor({ timeout: 8000 });
  await host.getByRole("button", { name: /Continuar/i }).click();
  await host.getByText(/Diez pruebas/i).waitFor({ timeout: 10000 });
  assert.equal(await host.getByText(/Tati, descubre tu color/i).count(), 0);

  await browser.close();
  console.log("\n✓ e2e-two-phones: OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
