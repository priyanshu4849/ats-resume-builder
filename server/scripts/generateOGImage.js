// One-off dev tool: renders a static 1200x630 social-preview card matching the
// landing page's hero (same gradient, headline, and mock-resume visual) so
// links to the site show a real preview instead of a bare URL when shared.
// Run manually with `npm run generate:og-image` (from /server) any time the
// landing page's copy or look changes — the PNG is committed, not generated
// at runtime.
const path = require("path");
const puppeteer = require("puppeteer");

const OUTPUT_PATH = path.join(__dirname, "..", "..", "client", "public", "og-image.png");

const html = `
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1200px;
    height: 630px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 45%, #4f46e5 100%);
    color: #ffffff;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 56px 64px;
    position: relative;
    overflow: hidden;
  }
  .glow-a { position: absolute; top: -120px; right: -120px; width: 480px; height: 480px; border-radius: 50%; background: rgba(255,255,255,0.12); filter: blur(10px); }
  .glow-b { position: absolute; bottom: -100px; left: -80px; width: 360px; height: 360px; border-radius: 50%; background: rgba(79,70,229,0.35); filter: blur(10px); }
  .brand { display: flex; align-items: center; gap: 12px; font-size: 22px; font-weight: 700; position: relative; }
  .dot { width: 28px; height: 28px; border-radius: 50%; background: #fbbf24; border: 3px solid #0f172a; }
  .main { display: flex; align-items: center; justify-content: space-between; position: relative; }
  .copy { max-width: 620px; }
  h1 { font-size: 60px; font-weight: 800; line-height: 1.1; margin-bottom: 20px; }
  .highlight { background: #fcd34d; color: #0f172a; padding: 2px 14px; border-radius: 10px; border: 3px solid #0f172a; display: inline-block; }
  p { font-size: 22px; color: rgba(255,255,255,0.88); line-height: 1.5; }
  .card-wrap { position: relative; width: 300px; height: 300px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .halo { position: absolute; inset: 0; border-radius: 40%; background: rgba(255,255,255,0.14); }
  .card { position: relative; width: 190px; background: #ffffff; border-radius: 18px; border: 3px solid #0f172a; box-shadow: 6px 6px 0 0 #0f172a; padding: 16px; color: #1e293b; }
  .card .avatar { width: 36px; height: 36px; border-radius: 50%; background: #fbbf24; border: 2px solid #0f172a; margin-bottom: 10px; }
  .bar { height: 8px; border-radius: 4px; background: #cbd5e1; margin-bottom: 8px; }
  .bar.light { background: #e2e8f0; }
  .bar.w75 { width: 75%; } .bar.w50 { width: 50%; } .bar.w100 { width: 100%; } .bar.w85 { width: 85%; }
  .badge { position: absolute; font-size: 15px; font-weight: 700; padding: 8px 14px; border-radius: 999px; white-space: nowrap; }
  .badge.score { top: 8px; left: -36px; background: #0f172a; color: #fff; border: 3px solid #fff; }
  .badge.rewrite { bottom: 18px; right: -30px; background: #fcd34d; color: #78350f; border: 3px solid #0f172a; }
  footer { font-size: 18px; color: rgba(255,255,255,0.75); position: relative; }
</style>
</head>
<body>
  <div class="glow-a"></div>
  <div class="glow-b"></div>

  <div class="brand"><span class="dot"></span>ATS Resume Builder</div>

  <div class="main">
    <div class="copy">
      <h1>Land more interviews,<br><span class="highlight">faster.</span></h1>
      <p>Build a resume, score it against a real job description, and let AI fix the weak spots.</p>
    </div>

    <div class="card-wrap">
      <div class="halo"></div>
      <div class="badge score">92 &#10003; ATS Score</div>
      <div class="card">
        <div class="avatar"></div>
        <div class="bar w75"></div>
        <div class="bar w50" style="margin-bottom:16px;"></div>
        <div class="bar light w100"></div>
        <div class="bar light w100"></div>
        <div class="bar light w85"></div>
        <div class="bar light w100" style="margin-bottom:0;"></div>
      </div>
      <div class="badge rewrite">+ AI rewrite</div>
    </div>
  </div>

  <footer>ats-resume-builder-ten-xi.vercel.app</footer>
</body>
</html>
`;

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });
    await page.setContent(html, { waitUntil: "domcontentloaded" });
    await page.screenshot({ path: OUTPUT_PATH });
    console.log(`Wrote ${OUTPUT_PATH}`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
