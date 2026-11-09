import * as THREE from './assets/vendor/three.module.js';
import { OrbitControls } from './assets/vendor/OrbitControls.js';
import { DEMO_BODIES, demoPose } from './solar-motion.js';

const root = document.querySelector('[data-solar-system]');

if (root) {
  try {
    startSolarSystem(root);
  } catch (_) {
    root.dataset.solarState = 'failed';
    root.dataset.solarRunning = 'false';
  }
}

function startSolarSystem(section) {
  const viewport = section.querySelector('.cjn-solar-viewport');
  if (!viewport) return;

  const canvas = document.createElement('canvas');
  canvas.setAttribute('data-renderer', 'webgl');
  canvas.setAttribute('aria-hidden', 'true');
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, matchMedia('(max-width: 700px)').matches ? 1.5 : 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.65;
    renderer.setClearColor(0x02040b, 1);
  } catch (error) {
    canvas.remove();
    section.dataset.solarState = 'failed';
    section.dataset.solarRunning = 'false';
    return;
  }

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x02040b);
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1800);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.055;
  controls.enablePan = false;
  controls.minPolarAngle = 0.08;
  controls.maxPolarAngle = Math.PI - 0.08;
  controls.minDistance = 7;
  controls.maxDistance = 340;
  controls.zoomSpeed = 0.8;
  controls.rotateSpeed = 0.65;
  controls.touches.ONE = THREE.TOUCH.ROTATE;
  controls.touches.TWO = THREE.TOUCH.DOLLY_ROTATE;
  controls.autoRotateSpeed = .16;

  const texturePath = './assets/textures/';
  const textureFiles = {
    sun: '2k_sun.jpg', mercury: '2k_mercury.jpg', venus: '2k_venus_atmosphere.jpg',
    earth: '2k_earth_daymap.jpg', mars: '2k_mars.jpg', jupiter: '2k_jupiter.jpg',
    saturn: '2k_saturn.jpg', saturnRing: '2k_saturn_ring_alpha.png',
    uranus: '2k_uranus.jpg', neptune: '2k_neptune.jpg', moon: '2k_moon.jpg',
  };
  const placeholderColors = {
    sun: '#ffad48', mercury: '#898078', venus: '#d6bb94', earth: '#3378a2',
    mars: '#b4644b', jupiter: '#bda17e', saturn: '#cdb992',
    saturnRing: 'rgba(0,0,0,0)', uranus: '#8cc6ce', neptune: '#446ea9', moon: '#99958e',
  };
  const textures = {};
  const pendingImages = [];
  const textureJobs = [];
  const maxAnisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  section.dataset.solarTextures = 'loading';
  for (const [key, filename] of Object.entries(textureFiles)) {
    const placeholder = document.createElement('canvas');
    placeholder.width = placeholder.height = 1;
    const context = placeholder.getContext('2d');
    context.fillStyle = placeholderColors[key];
    context.fillRect(0, 0, 1, 1);
    const texture = new THREE.Texture(placeholder);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = maxAnisotropy;
    texture.needsUpdate = true;
    textures[key] = texture;
    const image = new Image();
    image.decoding = 'async';
    pendingImages.push(image);
    textureJobs.push(new Promise((resolve, reject) => {
      image.onload = () => {
        if (!disposed) {
          // The first render allocated this texture at 1×1. Release that GPU
          // allocation so Three.js recreates it at the downloaded image size.
          texture.dispose();
          texture.image = image;
          texture.needsUpdate = true;
          drawOnce();
        }
        resolve();
      };
      image.onerror = () => reject(new Error(`Texture unavailable: ${filename}`));
      image.src = new URL(texturePath + filename, import.meta.url).href;
    }));
  }
  Promise.allSettled(textureJobs).then(results => {
    if (!disposed) section.dataset.solarTextures = results.every(result => result.status === 'fulfilled') ? 'ready' : 'partial';
  });
  const objects = [];
  const orbiters = [];
  const selectable = [];
  const byKey = new Map();
  const globe = new THREE.SphereGeometry(1, 48, 32);
  objects.push(globe);

  scene.add(new THREE.AmbientLight(0xa9b5ca, 0.7));
  const sunlight = new THREE.PointLight(0xffe5b7, 300, 0, 2);
  scene.add(sunlight);

  const sun = new THREE.Mesh(globe, new THREE.MeshBasicMaterial({ map: textures.sun, color: 0xffdcab }));
  sun.scale.setScalar(4.1);
  sun.userData.key = 'sun';
  const sunAxis = new THREE.Group();
  sunAxis.add(sun);
  scene.add(sunAxis);
  selectable.push(sun);
  byKey.set('sun', { mesh: sun, label: '太阳', radius: 4.1 });
  objects.push(sun.material);
  const haloCanvas = document.createElement('canvas');
  haloCanvas.width = haloCanvas.height = 128;
  const haloContext = haloCanvas.getContext('2d');
  const haloGradient = haloContext.createRadialGradient(64, 64, 9, 64, 64, 64);
  haloGradient.addColorStop(0, 'rgba(255,170,69,.48)');
  haloGradient.addColorStop(0.28, 'rgba(255,130,46,.17)');
  haloGradient.addColorStop(1, 'rgba(255,112,29,0)');
  haloContext.fillStyle = haloGradient;
  haloContext.fillRect(0, 0, 128, 128);
  const haloTexture = new THREE.CanvasTexture(haloCanvas);
  const haloMaterial = new THREE.SpriteMaterial({ map: haloTexture, color: 0xffc17e, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
  const halo = new THREE.Sprite(haloMaterial);
  halo.scale.set(15, 15, 1);
  scene.add(halo);
  objects.push(haloTexture, haloMaterial);

  const planets = DEMO_BODIES;

  for (const body of planets) {
    const points = [];
    for (let step = 0; step < 128; step++) {
      const pose = demoPose(body, step / 128 * body.orbit);
      points.push(new THREE.Vector3(pose.x, pose.y, pose.z));
    }
    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x66748c, transparent: true, opacity: .29, depthWrite: false });
    scene.add(new THREE.LineLoop(orbitGeometry, orbitMaterial));
    objects.push(orbitGeometry, orbitMaterial);

    const position = new THREE.Group();
    const axis = new THREE.Group();
    axis.rotation.z = body.tilt;
    position.add(axis);
    scene.add(position);
    const material = new THREE.MeshStandardMaterial({ map: textures[body.key], roughness: 1, metalness: 0 });
    const mesh = new THREE.Mesh(globe, material);
    mesh.scale.setScalar(body.size);
    mesh.userData.key = body.key;
    axis.add(mesh);
    selectable.push(mesh);
    byKey.set(body.key, { mesh, position, label: body.label, radius: body.size });
    objects.push(material);
    orbiters.push({ body, position, axis, mesh });

    if (body.key === 'saturn') {
      const ringGeometry = new THREE.RingGeometry(body.size * 1.32, body.size * 2.55, 128, 12);
      const ringUv = ringGeometry.attributes.uv;
      const ringPositions = ringGeometry.attributes.position;
      for (let point = 0; point < ringUv.count; point++) {
        const radius = Math.hypot(ringPositions.getX(point), ringPositions.getY(point));
        ringUv.setXY(point, (radius - body.size * 1.32) / (body.size * 1.23), .5);
      }
      const ringMaterial = new THREE.MeshBasicMaterial({ map: textures.saturnRing, color: 0xd7c8b4, side: THREE.DoubleSide, transparent: true, opacity: .92, depthWrite: false });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = -Math.PI / 2;
      axis.add(ring);
      objects.push(ringGeometry, ringMaterial);
    }

    if (body.key === 'earth') {
      const moonMaterial = new THREE.MeshStandardMaterial({ map: textures.moon, roughness: 1 });
      const moon = new THREE.Mesh(globe, moonMaterial);
      moon.scale.setScalar(.22);
      position.add(moon);
      orbiters[orbiters.length - 1].moon = moon;
      objects.push(moonMaterial);
    }
  }

  // Seeded positions keep the same sparse sky across reloads.
  let seed = 8462026;
  const random = () => ((seed = (1664525 * seed + 1013904223) >>> 0) / 4294967296);
  const starPositions = new Float32Array(900 * 3);
  const starColors = new Float32Array(900 * 3);
  for (let index = 0; index < 900; index++) {
    const z = random() * 2 - 1;
    const azimuth = random() * Math.PI * 2;
    const ring = Math.sqrt(1 - z * z);
    const radius = 470 + random() * 80;
    starPositions[index * 3] = Math.cos(azimuth) * ring * radius;
    starPositions[index * 3 + 1] = z * radius;
    starPositions[index * 3 + 2] = Math.sin(azimuth) * ring * radius;
    const brightness = .24 + random() * .65;
    starColors[index * 3] = brightness * .85;
    starColors[index * 3 + 1] = brightness * .92;
    starColors[index * 3 + 2] = brightness;
  }
  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
  const starMaterial = new THREE.PointsMaterial({ size: 1.55, vertexColors: true, transparent: true, opacity: .8, sizeAttenuation: true, depthWrite: false });
  scene.add(new THREE.Points(starGeometry, starMaterial));
  objects.push(starGeometry, starMaterial);

  const focusPoint = new THREE.Vector3();
  const focusDelta = new THREE.Vector3();
  const cameraGoal = new THREE.Vector3();
  const tempPoint = new THREE.Vector3();
  const sunward = new THREE.Vector3();
  const sideways = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let selected = null;
  let dragStart = null;
  let disposed = false;
  let failed = false;
  let contextLost = false;
  let frameId = 0;
  let frameCount = 0;
  let previousFrameTime = 0;
  let lastFrameAt = performance.now();
  let guided = true;
  let lastInteractionAt = performance.now() - 6000;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const startedAt = performance.now();

  function overviewDistance() {
    const vertical = THREE.MathUtils.degToRad(camera.fov);
    return Math.min(330, Math.max(105, 69 / (Math.tan(vertical / 2) * Math.min(camera.aspect, 1.2))));
  }

  function focusDistance(item) {
    const visualRadius = item.label === '土星' ? item.radius * 2.55 : item.radius * 1.3;
    const widthNeeded = visualRadius * 1.35 / (Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * camera.aspect);
    return Math.max(7, item.radius * 5.7, widthNeeded);
  }

  function guidedCameraPosition(item, point, result) {
    const distance = focusDistance(item);
    if (item.mesh === sun) return result.set(point.x + distance * .17, point.y + distance * .55, point.z + distance * .84);
    sunward.set(-point.x, 0, -point.z).normalize();
    sideways.set(-sunward.z, 0, sunward.x);
    return result.copy(point)
      .addScaledVector(sunward, distance * .72)
      .addScaledVector(sideways, distance * .45)
      .addScaledVector(up, distance * .5);
  }

  function updateCameraState() {
    section.dataset.solarSelected = selected || 'overview';
    section.dataset.solarCamera = selected ? 'focus' : controls.autoRotate ? 'auto' : 'manual';
  }

  function resetView() {
    selected = null;
    guided = true;
    controls.autoRotate = false;
    lastInteractionAt = performance.now();
    const distance = overviewDistance();
    cameraGoal.set(0, distance * .46, distance * .89);
    focusPoint.set(0, 0, 0);
    updateCameraState();
  }

  function selectBody(key) {
    if (!byKey.has(key)) return resetView();
    selected = key;
    guided = true;
    controls.autoRotate = false;
    const item = byKey.get(key);
    item.mesh.getWorldPosition(focusPoint);
    guidedCameraPosition(item, focusPoint, cameraGoal);
    updateCameraState();
  }

  function resize() {
    const width = Math.max(1, viewport.clientWidth);
    const height = Math.max(1, viewport.clientHeight);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    if (!selected && guided) {
      const distance = overviewDistance();
      cameraGoal.set(0, distance * .46, distance * .89);
    }
    drawOnce();
  }

  function updateMotion(seconds) {
    for (const { body, position, mesh, moon } of orbiters) {
      const pose = demoPose(body, seconds);
      position.position.set(pose.x, pose.y, pose.z);
      mesh.rotation.y = pose.spinAngle;
      if (moon) {
        const angle = seconds * Math.PI * 2 / 8;
        moon.position.set(Math.cos(angle) * 1.75, Math.sin(angle) * .12, Math.sin(angle) * 1.75);
        moon.rotation.y = angle;
      }
    }
    sunAxis.rotation.z = .126;
    sun.rotation.y = seconds * Math.PI * 2 / 12;
  }

  function updateRunState() {
    section.dataset.solarRunning = String(!disposed && !failed && !contextLost && !document.hidden && frameId !== 0);
  }

  function stop() {
    if (frameId) cancelAnimationFrame(frameId);
    frameId = 0;
    previousFrameTime = 0;
    updateRunState();
  }

  function failScene() {
    failed = true;
    stop();
    section.dataset.solarState = 'failed';
    updateRunState();
  }

  function drawOnce() {
    if (disposed || failed || contextLost) return false;
    try {
      renderer.render(scene, camera);
      return true;
    } catch (_) {
      failScene();
      return false;
    }
  }

  function animate(time) {
    frameId = 0;
    if (disposed || failed || document.hidden || contextLost) { updateRunState(); return; }
    try {
      const delta = previousFrameTime ? Math.min((time - previousFrameTime) / 1000, .05) : 0;
      previousFrameTime = time;
      lastFrameAt = performance.now();
      updateMotion((time - startedAt) / 1000);
      if (selected) {
        const target = byKey.get(selected);
        target.mesh.getWorldPosition(tempPoint);
        focusDelta.copy(tempPoint).sub(focusPoint);
        focusPoint.copy(tempPoint);
        if (guided) {
          guidedCameraPosition(target, focusPoint, cameraGoal);
          camera.position.lerp(cameraGoal, Math.min(1, delta * 3.5));
          controls.target.lerp(focusPoint, Math.min(1, delta * 4));
        } else {
          camera.position.add(focusDelta);
          controls.target.add(focusDelta);
        }
      } else if (guided) {
        camera.position.lerp(cameraGoal, Math.min(1, delta * 3.5));
        controls.target.lerp(focusPoint, Math.min(1, delta * 4));
        if (camera.position.distanceTo(cameraGoal) < .1 && controls.target.length() < .1) guided = false;
      }
      if (!selected && !guided) {
        const shouldRotate = !reducedMotion && performance.now() - lastInteractionAt > 5000;
        if (controls.autoRotate !== shouldRotate) {
          controls.autoRotate = shouldRotate;
          updateCameraState();
        }
      }
      controls.update(delta);
      if (!drawOnce()) return;
      frameCount++;
      if (frameCount % 10 === 0) {
        section.dataset.solarFrames = String(frameCount);
        section.dataset.solarTime = ((time - startedAt) / 1000).toFixed(2);
      }
      frameId = requestAnimationFrame(animate);
      updateRunState();
    } catch (_) { failScene(); }
  }

  function schedule() {
    if (disposed || failed || document.hidden || contextLost || frameId) return;
    previousFrameTime = 0;
    lastFrameAt = performance.now();
    updateMotion((performance.now() - startedAt) / 1000);
    frameId = requestAnimationFrame(animate);
    updateRunState();
  }

  function onPointerDown(event) {
    dragStart = { x: event.clientX, y: event.clientY };
    viewport.focus({ preventScroll: true });
  }
  function onPointerUp(event) {
    if (!dragStart) return;
    const moved = Math.hypot(event.clientX - dragStart.x, event.clientY - dragStart.y) > 5;
    dragStart = null;
    if (moved) return;
    const bounds = canvas.getBoundingClientRect();
    pointer.set(((event.clientX - bounds.left) / bounds.width) * 2 - 1, -((event.clientY - bounds.top) / bounds.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(selectable, false)[0];
    if (hit) selectBody(hit.object.userData.key);
  }

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('dblclick', event => { event.preventDefault(); resetView(); });
  controls.addEventListener('start', () => {
    guided = false;
    controls.autoRotate = false;
    lastInteractionAt = performance.now();
    updateCameraState();
  });
  controls.addEventListener('end', () => { lastInteractionAt = performance.now(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && section.contains(document.activeElement)) resetView();
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else schedule(); });
  window.addEventListener('focus', schedule);
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); contextLost = true; stop(); section.dataset.solarState = 'failed'; section.dataset.solarRunning = 'false'; });
  canvas.addEventListener('webglcontextrestored', () => {
    contextLost = false;
    section.dataset.solarState = 'ready';
    resize();
    schedule();
  });

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(viewport);
  const watchdogId = window.setInterval(() => {
    if (disposed || failed || contextLost || document.hidden || performance.now() - lastFrameAt <= 2500) return;
    if (frameId) cancelAnimationFrame(frameId);
    frameId = 0;
    schedule();
  }, 1500);

  // Render the geometry immediately, then replace each one-pixel material map
  // with its locally hosted image as that image finishes loading.
  viewport.append(canvas);
  updateMotion(0);
  resetView();
  lastInteractionAt = performance.now() - 6000;
  resize();
  camera.position.copy(cameraGoal);
  controls.target.set(0, 0, 0);
  controls.update(0);
  if (!drawOnce()) return;
  section.dataset.solarState = 'ready';
  section.dataset.solarSource = 'fixed-speed-demo';
  section.dataset.solarBodies = '太阳,水星,金星,地球,火星,木星,土星,天王星,海王星';
  section.dataset.solarFrames = '1';
  section.dataset.solarTime = '0.00';
  updateCameraState();
  schedule();

  window.addEventListener('pagehide', event => {
    if (event.persisted) { stop(); return; }
    if (disposed) return;
    disposed = true;
    stop();
    window.clearInterval(watchdogId);
    resizeObserver.disconnect();
    controls.dispose();
    for (const image of pendingImages) { image.onload = null; image.onerror = null; }
    for (const object of objects) object.dispose();
    for (const texture of Object.values(textures)) texture.dispose();
    renderer.dispose();
  });
  window.addEventListener('pageshow', () => schedule());
}
