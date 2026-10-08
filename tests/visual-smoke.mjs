import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { preview } from 'vite';

// ponytail: targeted smoke check suite; upgrade to visual-regression pixelmatch when baseline images are committed.

const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/vanba/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}/`;
const OUTPUT_DIR = resolve(process.cwd(), 'tests/output');

const CHAPTER_IDS = ['network', 'services', 'payload', 'permissions', 'files', 'ransom'];

async function run() {
  console.log('[smoke] Starting preview server on port', PORT);
  const server = await preview({ preview: { port: PORT } });

  const consoleErrors = [];
  const pageErrors = [];
  const networkFailures = [];

  const browser = await chromium.launch({ channel: 'chrome', headless: true });

  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 }
    });
    const page = await context.newPage();

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    page.on('pageerror', (err) => {
      pageErrors.push(err.message);
    });
    page.on('response', (res) => {
      if (res.status() >= 400) {
        networkFailures.push({ url: res.url(), status: res.status() });
      }
    });

    console.log('[smoke] Navigating to', BASE_URL);
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    // 1. Page title and header
    const title = await page.title();
    assert.match(title, /WannaCry/i, `Expected title to contain WannaCry, got "${title}"`);
    const headerTitle = await page.locator('header').textContent();
    assert.match(headerTitle, /WannaCry Research Report/i, 'Header title missing');
    assert.match(headerTitle, /IAM302/i, 'Header subtitle missing');
    console.log('[smoke] PASS: Page title and header verified');

    // 2. Fixed TOC / chapter links (#network, #services, #payload, #permissions, #files, #ransom)
    for (const id of CHAPTER_IDS) {
      const section = page.locator(`article#${id}`);
      assert.equal(await section.count(), 1, `Article #${id} not found in DOM`);
      const isVisible = await section.isVisible();
      assert.ok(isVisible, `Article #${id} is not visible`);

      const chapterButtons = await page.locator('aside nav button').count();
      assert.ok(chapterButtons >= 6, `Expected at least 6 TOC buttons in aside, found ${chapterButtons}`);
    }
    console.log(`[smoke] PASS: Fixed TOC & all 6 chapter sections (#${CHAPTER_IDS.join(', #')}) present`);

    // 3. Progressive disclosure buttons/tabs (Linear Minimal vs Detailed vs Full Evidence)
    const btnMinimal = page.getByRole('button', { name: 'Tối giản', exact: true });
    const btnDetailed = page.getByRole('button', { name: 'Cơ chế', exact: true });
    const btnEvidence = page.getByRole('button', { name: 'Bằng chứng', exact: true });

    assert.equal(await btnMinimal.count(), 1, 'Missing "Tối giản" mode button');
    assert.equal(await btnDetailed.count(), 1, 'Missing "Cơ chế" mode button');
    assert.equal(await btnEvidence.count(), 1, 'Missing "Bằng chứng" mode button');

    // Click Detailed (Cơ chế)
    await btnDetailed.click();
    await page.waitForTimeout(100);
    const mechanismVisible = await page.locator('text=Cơ chế hệ điều hành Windows').first().isVisible();
    assert.ok(mechanismVisible, 'Detailed view mechanism block not visible after clicking "Cơ chế"');

    // Click Evidence (Bằng chứng)
    await btnEvidence.click();
    await page.waitForTimeout(100);
    const contextualEvidenceVisible = await page.locator('text=Bằng chứng đối chiếu tại chỗ').first().isVisible();
    assert.ok(contextualEvidenceVisible, 'Contextual evidence block not visible after clicking "Bằng chứng"');
    const evidenceSectionVisible = await page.locator('section#evidence-gallery').isVisible();
    assert.ok(evidenceSectionVisible, 'Evidence gallery not visible');

    // Click Minimal (Tối giản)
    await btnMinimal.click();
    await page.waitForTimeout(100);
    const mechanismAfterMinimal = await page.locator('text=Cơ chế hệ điều hành Windows').first().isVisible();
    assert.ok(!mechanismAfterMinimal, 'Mechanism block still visible after reverting to "Tối giản"');
    console.log('[smoke] PASS: Progressive disclosure tabs (Minimal / Detailed / Evidence) toggle state verified');

    // 4. Interactive widgets
    // 4a. KillSwitch demo toggle
    const btnScenarioB = page.getByRole('button', { name: 'Không phản hồi (Kịch bản B)', exact: true });
    const btnScenarioA = page.getByRole('button', { name: 'HTTP 200 OK (Kịch bản A)', exact: true });
    assert.ok(await btnScenarioB.isVisible(), 'KillSwitch scenario B button not visible');
    await btnScenarioB.click();
    await page.waitForTimeout(100);
    assert.ok(await page.locator('text=TCP Reconnect (8 lần)').isVisible(), 'Scenario B socket state not displayed');

    await btnScenarioA.click();
    await page.waitForTimeout(100);
    assert.ok(await page.locator('text=TCP Connect & Receive').isVisible(), 'Scenario A socket state not restored');
    console.log('[smoke] PASS: KillSwitch sandbox interactive toggle verified');

    // 4b. icacls token click
    const tokenGrant = page.getByRole('button', { name: '/grant', exact: true });
    const tokenEveryone = page.getByRole('button', { name: 'Everyone:F', exact: true });
    assert.ok(await tokenGrant.isVisible(), 'Token /grant not visible');
    await tokenGrant.click();
    await page.waitForTimeout(100);
    assert.ok(await page.locator('text=Tham số sửa đổi quyền').isVisible(), 'Token /grant role description not shown');

    await tokenEveryone.click();
    await page.waitForTimeout(100);
    assert.ok(await page.locator('text=Đối tượng & Quyền').isVisible(), 'Token Everyone:F role description not shown');
    console.log('[smoke] PASS: icacls token interactive inspector verified');

    // 4c. Process tree node click
    const procButton = page.getByRole('button', { name: /PID 5152/ });
    assert.ok(await procButton.isVisible(), 'Process tree PID 5152 button not visible');
    await procButton.click();
    await page.waitForTimeout(100);
    assert.ok(await page.locator('text=PID: 5152 • PPID: 7180').isVisible(), 'PID 5152 details not rendered');
    console.log('[smoke] PASS: Process lineage tree node interaction verified');

    // 5. Evidence screenshots loaded without 404
    const images = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs.map((img) => ({
        src: img.src,
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight
      }));
    });
    assert.ok(images.length > 0, 'No images found in Evidence viewer');
    const brokenImages = images.filter((img) => !img.complete || img.naturalWidth === 0);
    assert.equal(
      brokenImages.length,
      0,
      `Detected broken images: ${JSON.stringify(brokenImages, null, 2)}`
    );
    assert.equal(
      networkFailures.length,
      0,
      `Detected 4xx/5xx network failures: ${JSON.stringify(networkFailures, null, 2)}`
    );
    console.log(`[smoke] PASS: ${images.length} evidence images loaded without 404/broken assets`);

    // Capture Desktop screenshot
    const desktopScreenshot = resolve(OUTPUT_DIR, 'desktop-1440x1000.png');
    await page.screenshot({ path: desktopScreenshot, fullPage: true });
    console.log('[smoke] Saved desktop screenshot:', desktopScreenshot);

    // 6. Mobile viewport (390x844) responsive check with no horizontal overflow
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(200);

    const overflowCheck = await page.evaluate(() => {
      const docWidth = document.documentElement.scrollWidth;
      const bodyWidth = document.body.scrollWidth;
      const winWidth = window.innerWidth;
      const overflowingElements = [];
      for (const el of document.querySelectorAll('*')) {
        const rect = el.getBoundingClientRect();
        if (rect.right > winWidth + 1) {
          overflowingElements.push({
            tag: el.tagName,
            id: el.id,
            className: (el.className || '').toString().slice(0, 80),
            right: rect.right,
            width: rect.width
          });
        }
      }
      return {
        docWidth,
        bodyWidth,
        winWidth,
        hasDocOverflow: docWidth > winWidth,
        overflowingCount: overflowingElements.length,
        samples: overflowingElements.slice(0, 5)
      };
    });

    assert.ok(
      !overflowCheck.hasDocOverflow,
      `Mobile horizontal overflow detected: docWidth=${overflowCheck.docWidth} > winWidth=${overflowCheck.winWidth}. Samples: ${JSON.stringify(overflowCheck.samples, null, 2)}`
    );
    console.log('[smoke] PASS: Mobile viewport (390x844) responsive check: zero horizontal overflow');

    // Capture Mobile screenshot
    const mobileScreenshot = resolve(OUTPUT_DIR, 'mobile-390x844.png');
    await page.screenshot({ path: mobileScreenshot, fullPage: true });
    console.log('[smoke] Saved mobile screenshot:', mobileScreenshot);

    assert.equal(pageErrors.length, 0, `Uncaught page errors: ${JSON.stringify(pageErrors)}`);
    console.log('[smoke] Console error count:', consoleErrors.length);

    console.log('\n--- VERIFICATION RESULT: ALL PASS ---');
    console.log(JSON.stringify({
      status: 'PASS',
      desktopScreenshot,
      mobileScreenshot,
      evidenceImagesLoaded: images.length,
      networkFailures: networkFailures.length,
      consoleErrors,
      pageErrors
    }, null, 2));

  } finally {
    await browser.close();
    await server.close();
    console.log('[smoke] Server and browser closed cleanly.');
  }
}

run().catch((err) => {
  console.error('[smoke] TEST FAILED:', err);
  process.exitCode = 1;
});
