import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const read = (file) => readFileSync(join(root, file), "utf8");
const fail = (message) => {
  throw new Error(message);
};

const htmlFiles = ["index.html", "design-board.html", "webs/culture.html", "webs/travel.html", "webs/life.html"];

for (const file of htmlFiles) {
  const html = read(file);
  if (!html.includes("js/main.js")) fail(`${file} does not load the shared interaction script`);
  if (!html.includes("data-scroll") && file !== "design-board.html") fail(`${file} is missing scroll interaction attributes`);
}

const index = read("index.html");
if (!index.includes("data-loader")) fail("index.html is missing the opening loader");
if (!index.includes("hero-3d")) fail("index.html is missing the 3D hero stage");

const mainJs = read("js/main.js");
if (!mainJs.includes("sessionStorage")) fail("main.js must skip the loader after the first session play");
if (!mainJs.includes("locomotiveScroll")) fail("main.js must initialize the local Locomotive Scroll runtime when available");
if (!mainJs.includes("data-split")) fail("main.js must split headings for staggered text motion");

const lenisBridge = read("js/vendor/lenis-bridge.js");
if (!lenisBridge.includes("window.globalThis = window")) fail("lenis bridge must expose browser globals for the vendored UMD scripts");

const css = read("css/style.css");
if (!css.includes(".hero-3d")) fail("style.css is missing the 3D hero styling");
if (!css.includes(".motion-tracker")) fail("style.css is missing the scroll position tracker");
if (!css.includes(".reveal.is-inview")) fail("style.css must support Locomotive in-view classes");

for (const alias of ["webs/route.html", "webs/spots.html", "webs/contact.html"]) {
  const html = read(alias);
  if (html.includes("content=\"0;")) fail(`${alias} uses an instant meta refresh that can look blank`);
  if (!html.includes("site-header")) fail(`${alias} needs visible navigation while redirecting`);
}

const allTextFiles = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (/\.(html|css|js|md|json|mjs)$/i.test(name)) allTextFiles.push(path);
  }
};
walk(root);
for (const path of allTextFiles) {
  const content = readFileSync(path, "utf8");
  if (/sk-[0-9a-fA-F]{10,}/.test(content)) fail(`Secret-looking API key found in ${path}`);
}

console.log("static checks passed");
