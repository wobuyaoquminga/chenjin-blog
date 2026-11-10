'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || path.join(os.homedir(), 'AppData/Roaming/npm/node_modules/@playwright/mcp/node_modules/playwright'));

const base = (process.env.BLOG_URL || 'https://nixiang.me/blog').replace(/\/$/, '');
const out = path.resolve(__dirname, '../.cache/solar-system');
fs.mkdirSync(out, { recursive: true });

async function instrument(context) {
  await context.addInitScript(() => {
    const probe = { cameras: [], meshes: [], controls: [] };
    Object.defineProperty(window, '__solarProbe', { value: probe });
    Object.defineProperty(window, 'THREE', {
      configurable: true,
      set(three) {
        for (const [name, key] of [
          ['PerspectiveCamera', 'cameras'],
          ['Mesh', 'meshes'],
          ['OrbitControls', 'controls'],
        ]) {
          const Original = three[name];
          three[name] = class extends Original {
            constructor(...args) {
              super(...args);
              probe[key].push(this);
            }
          };
        }
        Object.defineProperty(window, 'THREE', { configurable: true, writable: true, value: three });
      },
    });
  });
}

async function ready(page) {
  await page.goto(base + '/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.locator('[data-solar-system][data-solar-state="ready"]').waitFor({ timeout: 90000 });
}

async function scene(page) {
  return page.evaluate(() => {
    const p = window.__solarProbe;
    const root = document.querySelector('[data-solar-system]');
    const camera = p.cameras[0], controls = p.controls[0];
    const sun = p.meshes.find(mesh => mesh.userData?.key === 'sun');
    const earth = p.meshes.find(mesh => mesh.userData?.key === 'earth');
    const canvas = document.querySelector('#gl');
    const rect = canvas.getBoundingClientRect();
    const projected = sun.getWorldPosition(new THREE.Vector3()).project(camera);
    return {
      dataset: { ...root.dataset },
      cameraCount: p.cameras.length,
      controlsCount: p.controls.length,
      meshCount: p.meshes.length,
      camera: camera.position.toArray(),
      target: controls.target.toArray(),
      distance: camera.position.distanceTo(controls.target),
      sun: {
        material: sun.material.type,
        shader: sun.material.fragmentShader.includes('vec3 hot=vec3(1.0,0.98,0.82)'),
        position: sun.getWorldPosition(new THREE.Vector3()).toArray(),
        screen: { x: (projected.x + 1) * rect.width / 2, y: (1 - projected.y) * rect.height / 2 },
      },
      earthSpin: earth.rotation.y,
      earthOrbit: earth.parent.parent.rotation.y,
      canvas: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
    };
  });
}

function vectorGap(a, b) {
  return Math.hypot(...a.map((value, index) => value - b[index]));
}

async function touch(cdp, type, points) {
  await cdp.send('Input.dispatchTouchEvent', { type, touchPoints: points });
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.BROWSER_EXE || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  });
  try {
    const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    await instrument(desktopContext);
    const page = await desktopContext.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const started = Date.now();
    await ready(page);
    const root = page.locator('[data-solar-system]'), canvas = root.locator('#gl');
    let state = await scene(page);
    console.log('Muse first frame: ' + (Date.now() - started) + ' ms');
    assert.equal(state.dataset.solarSource, 'muse-galaxy-demo');
    assert.equal(state.dataset.solarTextures, 'ready');
    assert.equal(state.dataset.solarBodies.split(',').length, 9);
    assert.equal(state.cameraCount, 1);
    assert.equal(state.controlsCount, 1);
    assert.ok(state.meshCount >= 9, 'Muse scene has real meshes');
    assert.equal(state.sun.material, 'ShaderMaterial');
    assert.ok(state.sun.shader, 'Muse Sun plasma shader is active');
    assert.ok(await canvas.evaluate(el => el.getContext('webgl2') instanceof WebGL2RenderingContext));
    assert.equal(await root.locator('button,select,input').count(), 0);
    const first = state;
    await page.waitForTimeout(1100);
    state = await scene(page);
    assert.ok(state.dataset.solarRunning === 'true');
    assert.ok(Math.abs(state.earthSpin - first.earthSpin) > 0.15, 'Earth rotates within one second');
    assert.ok(Math.abs(state.earthOrbit - first.earthOrbit) > 0.02, 'Earth orbits within one second');
    await page.screenshot({ path: path.join(out, 'desktop.png') });
    console.log('Desktop: real WebGL, Muse shader and visible motion passed.');

    const rect = await canvas.boundingBox();
    const dragStart = await scene(page);
    await page.mouse.move(rect.x + rect.width * .68, rect.y + rect.height * .54);
    await page.mouse.down();
    await page.mouse.move(rect.x + rect.width * .83, rect.y + rect.height * .37, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(250);
    const dragged = await scene(page);
    assert.ok(vectorGap(dragged.camera, dragStart.camera) > .1, 'Mouse drag rotates camera');
    assert.equal(dragged.dataset.solarCamera, 'manual');
    await page.mouse.wheel(0, -350);
    await page.waitForTimeout(300);
    const zoomed = await scene(page);
    assert.ok(zoomed.distance < dragged.distance - .1, 'Wheel moves camera closer');

    const sunPoint = zoomed.sun.screen;
    assert.ok(sunPoint.x > 0 && sunPoint.x < zoomed.canvas.width && sunPoint.y > 0 && sunPoint.y < zoomed.canvas.height);
    await canvas.click({ position: sunPoint });
    await page.waitForFunction(() => document.querySelector('[data-solar-system]').dataset.solarSelected === 'sun', undefined, { timeout: 5000 });
    await page.waitForTimeout(350);
    const focused = await scene(page);
    assert.equal(focused.dataset.solarCamera, 'focus');
    assert.ok(vectorGap(focused.target, zoomed.target) > .1, 'Click follows Sun');
    await root.screenshot({ path: path.join(out, 'sun-focused.png') });
    await canvas.dblclick({ position: { x: zoomed.canvas.width * .7, y: zoomed.canvas.height * .6 } });
    await page.waitForFunction(() => document.querySelector('[data-solar-system]').dataset.solarSelected === 'overview');
    const again = await scene(page);
    await canvas.click({ position: again.sun.screen });
    await page.waitForFunction(() => document.querySelector('[data-solar-system]').dataset.solarSelected === 'sun');
    await canvas.focus();
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => document.querySelector('[data-solar-system]').dataset.solarSelected === 'overview');
    console.log('Desktop: drag, wheel, projected Sun click, double click and Escape passed.');

    for (let sample = 0; sample < 3; sample++) {
      const before = await scene(page);
      await page.waitForTimeout(10000);
      const after = await scene(page);
      assert.ok(Number(after.dataset.solarFrames) > Number(before.dataset.solarFrames), 'Foreground frames advance in interval ' + sample);
      assert.ok(Number(after.dataset.solarTime) > Number(before.dataset.solarTime) + 4, 'Visible time advances in interval ' + sample);
      assert.equal(after.dataset.solarRunning, 'true');
    }
    await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
    const offscreen = await scene(page);
    await page.waitForTimeout(1800);
    assert.ok(Number((await scene(page)).dataset.solarTime) > Number(offscreen.dataset.solarTime), 'Offscreen scene keeps moving');
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    const lifecycle = await desktopContext.newCDPSession(page);
    await lifecycle.send('Page.setWebLifecycleState', { state: 'frozen' });
    await new Promise(resolve => setTimeout(resolve, 1800));
    await lifecycle.send('Page.setWebLifecycleState', { state: 'active' });
    await page.bringToFront();
    const resumed = await scene(page);
    await page.waitForTimeout(1600);
    const movingAgain = await scene(page);
    assert.ok(movingAgain.earthSpin !== resumed.earthSpin, 'Mesh rotation resumes after freeze');
    assert.equal(movingAgain.dataset.solarRunning, 'true');
    assert.deepEqual(errors, []);
    console.log('Desktop: 30-second continuity, offscreen motion and freeze recovery passed.');
    await desktopContext.close();

    const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true });
    await instrument(mobileContext);
    const phone = await mobileContext.newPage();
    const phoneErrors = [];
    phone.on('pageerror', error => phoneErrors.push(error.message));
    await ready(phone);
    const mobileCanvas = phone.locator('#gl');
    await mobileCanvas.scrollIntoViewIfNeeded();
    assert.ok(await phone.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'No mobile overflow');
    const cdp = await mobileContext.newCDPSession(phone);
    const mobileStart = await scene(phone);
    const x = mobileStart.canvas.x + mobileStart.canvas.width * .58;
    const y = mobileStart.canvas.y + mobileStart.canvas.height * .5;
    await touch(cdp, 'touchStart', [{ x, y, id: 1 }]);
    for (let n = 1; n <= 8; n++) await touch(cdp, 'touchMove', [{ x: x + n * 7, y: y - n * 3, id: 1 }]);
    await touch(cdp, 'touchEnd', []);
    await phone.waitForTimeout(200);
    const swiped = await scene(phone);
    assert.ok(vectorGap(swiped.camera, mobileStart.camera) > .1, 'One-finger drag rotates camera');
    assert.equal(swiped.dataset.solarCamera, 'manual');
    const distanceBefore = swiped.distance;
    await touch(cdp, 'touchStart', [{ x: x - 25, y, id: 1 }, { x: x + 25, y, id: 2 }]);
    for (let n = 1; n <= 8; n++) await touch(cdp, 'touchMove', [{ x: x - 25 - n * 5, y, id: 1 }, { x: x + 25 + n * 5, y, id: 2 }]);
    await touch(cdp, 'touchEnd', []);
    await phone.waitForTimeout(300);
    assert.ok(Math.abs((await scene(phone)).distance - distanceBefore) > .1, 'Two-finger pinch changes zoom');
    await phone.screenshot({ path: path.join(out, 'mobile.png') });
    assert.deepEqual(phoneErrors, []);
    console.log('Mobile: touch drag, pinch and layout passed.');
    await mobileContext.close();

    const broken = await browser.newContext();
    await broken.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type, ...args) {
        return String(type).startsWith('webgl') ? null : original.call(this, type, ...args);
      };
    });
    const fallback = await broken.newPage();
    await fallback.goto(base + '/', { waitUntil: 'domcontentloaded' });
    await fallback.locator('[data-solar-system][data-solar-state="failed"]').waitFor({ timeout: 30000 });
    assert.equal(await fallback.locator('[data-solar-system]').getAttribute('data-solar-running'), 'false');
    assert.ok(await fallback.locator('#glError').isVisible(), 'WebGL error fallback is visible');
    await broken.close();

    const noJs = await browser.newContext({ javaScriptEnabled: false });
    const staticPage = await noJs.newPage();
    await staticPage.goto(base + '/', { waitUntil: 'load' });
    assert.equal(await staticPage.locator('[data-solar-system]').getAttribute('data-solar-state'), null);
    assert.ok(await staticPage.locator('#glWrap .muse-static-sky img').isVisible(), 'No-JS static sky is visible');
    await noJs.close();

    const other = await browser.newContext();
    await instrument(other);
    const articlePage = await other.newPage();
    await articlePage.goto(base + '/articles/', { waitUntil: 'domcontentloaded' });
    assert.equal(await articlePage.locator('[data-solar-system], #gl').count(), 0, 'Other pages contain no 3D canvas');
    assert.equal(await articlePage.evaluate(() => window.__solarProbe.meshes.length), 0, 'Other pages create no 3D meshes');
    await other.close();
    console.log('WebGL failure, no-JS fallback and non-home page passed.');
  } finally {
    await browser.close();
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
