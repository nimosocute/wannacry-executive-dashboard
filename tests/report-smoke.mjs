import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const output = fileURLToPath(new URL('./output/', import.meta.url));
const mode = process.argv[2] || 'green';
const url = process.argv[3] || (mode === 'green' ? 'http://localhost:4173' : 'https://wannacry-executive-dashboard.vercel.app');
const require = createRequire(import.meta.url);
let playwrightModule = process.env.PLAYWRIGHT_MODULE;
if (!playwrightModule) {
  try { playwrightModule = require.resolve('playwright'); }
  catch { playwrightModule = 'C:/Users/vanba/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'; }
}
const { chromium } = await import(pathToFileURL(playwrightModule).href);
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = { mode, url, capturedAt: new Date().toISOString(), checks: [], viewports: [] };
const check = (name, pass, detail) => results.checks.push({ name, pass: Boolean(pass), detail });
const anchors = ['overview', 'experiment', 'analysis', 'evidence', 'conclusions', 'appendix'];
const findings = ['network', 'services', 'payload', 'permissions', 'files', 'ransom'];
async function verify(name, action) {
  try { await action(); check(name, true); }
  catch (error) { check(name, false, error.message); }
}
function expect(condition, message) {
  if (!condition) throw new Error(message);
}
async function selectFinding(page, id) {
  await page.evaluate(id => { location.hash = `finding-${id}`; }, id);
  await page.locator(`#finding-${id}`).waitFor({ state: 'visible' });
}
async function shellChecks(page) {
  await verify('Keyboard focus has visible styling', async () => {
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => {
      const element = document.activeElement;
      const style = getComputedStyle(element);
      return { tag: element.tagName, visible: style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0 || style.boxShadow !== 'none' };
    });
    expect(focused.tag !== 'BODY' && focused.visible, `Focus invisible: ${JSON.stringify(focused)}`);
  });
  for (const id of anchors) {
    await verify(`Navigation and unique section #${id}`, async () => {
      const anchor = page.locator(`nav a[href="#${id}"]`).first();
      expect(await anchor.count(), `Missing navigation link #${id}`);
      expect(await page.locator(`[id="${id}"]`).count() === 1, `Missing/duplicate #${id}`);
      await anchor.click();
      expect(new URL(page.url()).hash === `#${id}`, 'Navigation did not update location hash');
    });
  }
  for (const id of findings) {
    await verify(`Finding #${id} deep link and progressive depth`, async () => {
      await selectFinding(page, id);
      const finding = page.locator(`#finding-${id}`);
      const text = await finding.innerText();
      expect(text.length > 100, 'Default finding lacks a meaningful summary/diagram');
      const visibleFindings = await page.locator('[id^="finding-"]').evaluateAll(nodes => nodes.filter(node => node.getClientRects().length).map(node => node.id));
      expect(visibleFindings.length === 1, `Expected one finding visible, got ${visibleFindings}`);
      const details = finding.locator('details');
      expect(await details.count() >= 2, 'Expected separate explanation and deep-dive details');
      for (const item of await details.all()) {
        const summary = item.locator(':scope > summary');
        if (!(await summary.isVisible())) continue;
        expect(!(await item.evaluate(node => node.open)), 'Progressive detail unexpectedly open by default');
        await summary.focus();
        await page.keyboard.press('Enter');
        expect(await item.evaluate(node => node.open), 'Enter did not expand native details');
        await page.keyboard.press('Enter');
        expect(!(await item.evaluate(node => node.open)), 'Enter did not collapse native details');
      }
      expect(await finding.locator('a[href^="#evidence-E"]').count(), 'Finding has no contextual evidence links');
    });
  }
}
async function evidenceChecks(page) {
  await page.locator('nav a[href="#evidence"]').first().click();
  for (let index = 1; index <= 8; index++) {
    const id = `E${String(index).padStart(2, '0')}`;
    await verify(`${id} native dialog, image, backlink, Escape and focus return`, async () => {
      const link = page.locator(`.ev-repository a[href="#evidence-${id}"]`).first();
      await link.focus();
      await page.keyboard.press('Enter');
      const dialog = page.locator('dialog[open]');
      await dialog.waitFor({ state: 'visible' });
      expect(new URL(page.url()).hash === `#evidence-${id}`, 'Evidence hash did not update');
      expect((await dialog.innerText()).includes(id), `Dialog lacks evidence ID ${id}`);
      const image = dialog.locator('img').first();
      await image.waitFor();
      await page.waitForFunction(image => image.complete && image.naturalWidth > 0, await image.elementHandle());
      expect(await image.getAttribute('alt'), 'Evidence image lacks alt text');
      expect(await dialog.locator('.ev-explanations dt').count() === 5, 'Evidence lacks five interpretive fields');
      expect(await dialog.locator('a[download]').count(), 'Original evidence download link missing');
      expect(await dialog.locator('a[href^="#finding-"]').count(), 'Evidence lacks finding backlink');
      expect(await dialog.evaluate(node => node.contains(document.activeElement)), 'Dialog did not acquire keyboard focus');
      await page.keyboard.press('Escape');
      await dialog.waitFor({ state: 'hidden' });
      expect(await link.evaluate(node => node === document.activeElement), 'Escape did not restore triggering link focus');
    });
  }
  await verify('Evidence search changes matching cards and resets', async () => {
    const search = page.getByLabel('Tìm chứng cứ', { exact: true });
    await search.fill('E08');
    expect(await page.locator('.ev-repository a[href="#evidence-E08"]').count(), 'Evidence search omitted E08');
    expect(await page.locator('.ev-repository a[href="#evidence-E01"]').count() === 0, 'Evidence search did not filter E01');
    await search.fill('');
    expect(await page.locator('.ev-repository a[href="#evidence-E01"]').count(), 'Evidence search reset omitted E01');
  });
  await verify('Evidence URL loads directly and backlink selects finding', async () => {
    await page.goto(`${url.replace(/#.*$/, '')}#evidence-E01`, { waitUntil: 'networkidle' });
    const dialog = page.locator('dialog[open]');
    await dialog.waitFor();
    const link = dialog.locator('a[href^="#finding-"]').first();
    const hash = await link.getAttribute('href');
    await link.click();
    await dialog.waitFor({ state: 'hidden' });
    await page.locator(hash).waitFor({ state: 'visible' });
  });
}
async function widgetChecks(page) {
  await verify('Network branch input changes reason and recorded observation', async () => {
    await selectFinding(page, 'network');
    const yes = page.getByRole('radio', { name: 'Tới được, có phản hồi', exact: true });
    const no = page.getByRole('radio', { name: 'Không tới được, không có phản hồi', exact: true });
    expect(await yes.isChecked(), 'Reachable branch is not meaningful default');
    const before = await page.locator('#finding-network').innerText();
    await no.focus();
    await page.keyboard.press('Space');
    expect(await no.isChecked(), 'Keyboard did not select unreachable branch');
    const after = await page.locator('#finding-network').innerText();
    expect(before !== after && await page.getByText('Quan sát đã ghi — B', { exact: true }).count(), 'Recorded observation did not change to B');
    expect((await page.locator('.ks-branch.ks-selected').innerText()).includes('Không'), 'Diagram selected branch did not change');
    await yes.check();
  });
  await verify('Command and token selections change explanation', async () => {
    await selectFinding(page, 'permissions');
    const widget = page.locator('.cmd-explainer');
    const select = widget.getByRole('combobox', { name: 'Chọn lệnh', exact: true });
    expect((await select.locator('option:checked').innerText()).includes('icacls'), 'No default command');
    const before = await widget.locator('.cmd-explanation').innerText();
    await select.selectOption({ label: 'cscript · VBS' });
    await widget.getByRole('button', { name: 'Giải thích token //nologo', exact: true }).focus();
    await page.keyboard.press('Enter');
    const after = await widget.locator('.cmd-explanation').innerText();
    expect(before !== after && after.includes('//nologo'), 'Command/token explanation did not change');
  });
  await verify('Timeline scenario and milestone change timestamp/PID/source', async () => {
    const summary = page.getByText('Khám phá dòng thời gian', { exact: true });
    if (await summary.count()) await summary.click();
    const widget = page.getByRole('region', { name: 'Dòng thời gian chứng cứ', exact: true });
    const before = await widget.locator('#time-selected-record').innerText();
    await widget.getByRole('button', { name: /^Nhận 155 byte/ }).click();
    const selected = await widget.locator('#time-selected-record').innerText();
    expect(selected !== before && selected.includes('11:44:17.8177930') && selected.includes('475'), 'A record details incorrect/unchanged');
    await widget.getByRole('radio', { name: 'B · Responder không tới được', exact: true }).check();
    await widget.getByRole('button', { name: /^Rename \.WNCRY/ }).focus();
    await page.keyboard.press('Enter');
    const record = await widget.locator('#time-selected-record').innerText();
    expect(record.includes('11:57:40.1701372') && record.includes('3760') && record.includes('2617'), 'B rename record missing timestamp/PID/source');
  });
  await verify('Process selection updates PID, parent, source and contextual links', async () => {
    await selectFinding(page, 'payload');
    let node = page.getByRole('button', { name: /^PID 1152\b/ }).first();
    if (!(await node.isVisible())) {
      await page.getByText('Mở cây đầy đủ · 15 PID', { exact: true }).first().click();
    }
    await node.focus();
    await page.keyboard.press('Enter');
    let detail = page.getByRole('region', { name: 'Chi tiết PID 1152', exact: true });
    await detail.waitFor();
    expect((await detail.innerText()).includes('644') && (await detail.innerText()).includes('1197'), 'Selected PID1152 lacks parent/source');
    expect(await detail.locator('a[href="#finding-services"]').count(), 'Selected PID lacks finding link');
    expect(await node.evaluate(element => element === document.activeElement), 'Process selection lost keyboard focus');
    node = page.getByRole('button', { name: /^PID 5808\b/ }).first();
    await node.click();
    detail = page.getByRole('region', { name: 'Chi tiết PID 5808', exact: true });
    expect((await detail.innerText()).includes('1721'), 'Second selected PID lacks source record');
    expect(await detail.locator('a[href="#evidence-E05"]').count(), 'Second selected PID lacks evidence link');
  });
  await verify('Toy encryption updates output; wrong key differs; matching key restores', async () => {
    await selectFinding(page, 'files');
    const summary = page.getByText('Thử đổi khóa trên văn bản giả lập', { exact: true });
    await summary.click();
    const details = summary.locator('..');
    expect((await details.innerText()).includes('IFMMP MBC'), 'Missing meaningful default toy ciphertext');
    await page.getByLabel('Khóa biến đổi', { exact: false }).selectOption('B');
    let text = await details.innerText();
    expect(text.includes('KHOOR ODE') && text.includes('JGNNQ NCD') && text.includes('Khác khóa'), 'Wrong key behavior not observable');
    await page.getByLabel('Khóa khôi phục', { exact: false }).selectOption('B');
    expect((await details.innerText()).includes('Cùng khóa'), 'Matching key did not restore text');
    await page.getByLabel('Bản rõ giả lập', { exact: false }).selectOption({ label: 'MY FICTIONAL NOTE' });
    expect((await details.innerText()).includes('MY FICTIONAL NOTE'), 'Plaintext selection did not update output');
    await summary.click();
  });
}

async function density(page) {
  return page.evaluate(() => {
    const root = document.querySelector('main') || document.body;
    const defaultText = root.innerText;
    const texts = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (!node.textContent.trim() || node.parentElement.closest('nav,script,style,[hidden]')) continue;
      const style = getComputedStyle(node.parentElement);
      if (style.visibility === 'hidden' || style.display === 'none') continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      if ([...range.getClientRects()].some(r => r.width && r.height && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth)) texts.push(node.textContent.trim());
    }
    const viewportText = texts.join(' ');
    return {
      defaultBodyCharacters: defaultText.length,
      defaultBodyWords: defaultText.split(/\s+/).filter(Boolean).length,
      viewportCharacters: viewportText.length,
      viewportWords: viewportText.split(/\s+/).filter(Boolean).length,
      viewportText,
      horizontalOverflow: document.documentElement.scrollWidth - innerWidth,
    };
  });
}

try {
  await mkdir(output, { recursive: true });
  for (const [width, height] of (mode === 'green' ? [[1440, 1000], [768, 1024], [390, 844], [320, 844]] : [[1440, 1000], [390, 844]])) {
    const page = await browser.newPage({ viewport: { width, height } });
    page.setDefaultTimeout(8000);
    const errors = [];
    const consoleErrors = [];
    const externalRequests = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    if (mode === 'green') {
      await page.route('**/*', route => {
        const requestUrl = new URL(route.request().url());
        if (['http:', 'https:'].includes(requestUrl.protocol) && requestUrl.origin !== new URL(url).origin) {
          externalRequests.push(requestUrl.href);
          return route.abort();
        }
        return route.continue();
      });
    }
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: `${output}/${mode}-${width}.png` });
    const metrics = { width, height, ...(await density(page)), errors, consoleErrors, externalRequests };
    results.viewports.push(metrics);
    if (mode === 'green') {
      check(`${width}px initial horizontal overflow`, metrics.horizontalOverflow <= 1, metrics.horizontalOverflow);
      for (const id of findings) {
        await verify(`${width}px #${id} horizontal overflow`, async () => {
          await selectFinding(page, id);
          const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
          expect(overflow <= 1, `Horizontal overflow ${overflow}px`);
        });
      }
      if (width === 1440) {
        await shellChecks(page);
        await widgetChecks(page);
        await evidenceChecks(page);
      }
      check(`${width}px no page errors`, errors.length === 0, errors);
      check(`${width}px no console errors`, consoleErrors.length === 0, consoleErrors);
      check(`${width}px no external requests`, externalRequests.length === 0, externalRequests);
    }
    if (mode === 'red' && width === 1440) {
      for (const id of anchors) {
        check(`Navigation #${id}`, await page.locator(`nav a[href="#${id}"]`).count() > 0);
        check(`Section #${id}`, await page.locator(`[id="${id}"]`).count() === 1);
      }
      for (const id of findings) check(`Finding #finding-${id}`, await page.locator(`[id="finding-${id}"]`).count() === 1);
      check('Native progressive details', await page.locator('details > summary').count() > 0);
      for (let index = 1; index <= 8; index++) {
        const id = `E${String(index).padStart(2, '0')}`;
        check(`Evidence deep link #evidence-${id}`, await page.locator(`a[href="#evidence-${id}"]`).count() > 0);
      }
      check('Native evidence dialog', await page.locator('dialog').count() > 0);
    }
    await page.close();
  }
  if (mode === 'green') {
    const baseline = JSON.parse(await readFile(`${output}/baseline.json`, 'utf8'));
    for (const before of baseline.viewports) {
      const after = results.viewports.find(item => item.width === before.width);
      check(`${before.width}px reduced default body density`, after.defaultBodyCharacters < before.defaultBodyCharacters, { before: before.defaultBodyCharacters, after: after.defaultBodyCharacters });
    }
  }
} catch (error) {
  check('Test execution', false, error.stack);
} finally {
  await browser.close();
  await writeFile(`${output}/${mode}.json`, `${JSON.stringify(results, null, 2)}\n`);
}
console.log(JSON.stringify(results, null, 2));
if (results.checks.some(result => !result.pass)) process.exitCode = 1;
