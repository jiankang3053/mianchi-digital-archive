import { chromium } from "playwright";

const base = process.env.QA_BASE_URL || "http://localhost:5173";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const errors = [];
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text());
});

await page.goto(`${base}/index.html`, { waitUntil: "networkidle" });
await page.waitForTimeout(1300);

const home = await page.evaluate(() => {
  const hero = document.querySelector(".hero-copy");
  const hero3d = document.querySelector(".hero-3d");
  const loader = document.querySelector("[data-loader]");
  const heroRect = hero?.getBoundingClientRect();
  const stageRect = hero3d?.getBoundingClientRect();
  return {
    heroText: hero?.innerText || "",
    heroVisible: !!heroRect && heroRect.width > 500 && heroRect.height > 200 && heroRect.top < window.innerHeight,
    hero3dVisible: !!stageRect && getComputedStyle(hero3d).display !== "none" && stageRect.width > 180 && stageRect.height > 180,
    loaderHidden: !loader || loader.classList.contains("is-hidden"),
    rawMarkupLeak: document.body.innerText.includes("<span class="),
    locomotiveFallbackOk: document.querySelectorAll("[data-scroll]").length > 5,
    docHeight: document.documentElement.scrollHeight,
  };
});

if (!home.heroText.includes("渑池")) throw new Error("home hero text missing");
if (!home.heroVisible) throw new Error("home hero is not visible in first viewport");
if (!home.hero3dVisible) throw new Error("home 3D stage is not visible at desktop width");
if (!home.loaderHidden) throw new Error("loader did not hide");
if (home.rawMarkupLeak) throw new Error("split markup leaked into visible text");
if (!home.locomotiveFallbackOk) throw new Error("scroll interaction markers missing");

await page.click('a[href="webs/culture.html"]');
await page.waitForURL("**/webs/culture.html");
await page.waitForTimeout(500);
const cultureVisible = await page.locator(".hero-copy").innerText();
if (!cultureVisible.includes("仰韶")) throw new Error("culture page did not render meaningful hero text");

await page.goto(`${base}/design-board.html`, { waitUntil: "networkidle" });
await page.waitForTimeout(500);
const design = await page.evaluate(() => {
  const cards = [...document.querySelectorAll(".design-card")].map((card, index) => {
    const r = card.getBoundingClientRect();
    return { index, left: Math.round(r.left), right: Math.round(r.right), top: Math.round(r.top), bottom: Math.round(r.bottom), height: Math.round(r.height), text: card.innerText.slice(0, 40) };
  });
  return {
    title: document.title,
    hasMotionCopy: document.body.innerText.includes("每一次下滑，都换一束光和一个镜头"),
    cardCount: cards.length,
    cardsHaveArea: cards.every((card) => card.height > 120 && card.right > card.left),
  };
});
if (design.cardCount < 6) throw new Error("design board is missing cards");
if (!design.hasMotionCopy) throw new Error("curation page motion copy missing");
if (!design.cardsHaveArea) throw new Error("design board cards are not laid out with stable visible areas");

await page.goto(`${base}/webs/route.html`, { waitUntil: "networkidle" });
await page.waitForTimeout(900);
if (!page.url().includes("/webs/travel.html")) throw new Error("route compatibility page did not navigate to travel page");

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mobile.goto(`${base}/index.html`, { waitUntil: "networkidle" });
await mobile.waitForTimeout(700);
const mobileInfo = await mobile.evaluate(() => ({
  overflow: document.documentElement.scrollWidth - window.innerWidth,
  rawMarkupLeak: document.body.innerText.includes("<span class="),
  navVisible: !!document.querySelector(".site-header"),
  heroText: document.querySelector(".hero-copy")?.innerText.slice(0, 60),
}));
if (mobileInfo.overflow > 4) throw new Error(`mobile horizontal overflow: ${mobileInfo.overflow}`);
if (mobileInfo.rawMarkupLeak) throw new Error("mobile split markup leaked");
if (!mobileInfo.navVisible || !mobileInfo.heroText.includes("渑池")) throw new Error("mobile first viewport missing key content");

if (errors.length) throw new Error(`console errors: ${errors.join(" | ")}`);

console.log(JSON.stringify({ home, design, mobileInfo }, null, 2));
await browser.close();
