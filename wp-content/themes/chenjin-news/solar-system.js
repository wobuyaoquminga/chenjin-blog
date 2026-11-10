
import { MUSE_BODIES, musePose } from './solar-motion.js';

/* Muse 交付的银河太阳系场景，接入 WordPress 首页。
   行星贴图由 Canvas 生成；速度和位置是可见动态演示，不代表真实星历。 */
(function(){
  var wrap = document.getElementById("glWrap"), canvas = document.getElementById("gl"), errBox = document.getElementById("glError");
  if(!wrap || !canvas) return;
  var fatalError = false;
  function fail(msg){
    fatalError = true;
    wrap.dataset.solarState = "failed";
    wrap.dataset.solarRunning = "false";
    if(errBox){ errBox.style.display="block"; errBox.textContent = "3D 场景加载失败：" + msg; }
  }
  try{
  if(typeof THREE === "undefined"){ fail("Three.js 未加载"); return; }
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var mobile = (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) || window.innerWidth < 760;
  var renderer;
  try{
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, powerPreference: "high-performance" });
  }catch(e){ fail(e.message); return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, mobile ? 1.5 : 2));
  if("outputColorSpace" in renderer && THREE.SRGBColorSpace) renderer.outputColorSpace = THREE.SRGBColorSpace;
  else if("outputEncoding" in renderer && THREE.sRGBEncoding) renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;

  var scene = new THREE.Scene();
  scene.background = new THREE.Color(0x04060f);
  scene.fog = new THREE.FogExp2(0x04060f, 0.0016);
  var BASE_FOV = mobile ? 47 : 40;
  var camera = new THREE.PerspectiveCamera(BASE_FOV, 1, 0.1, 900);
  var HOME_POS = mobile ? new THREE.Vector3(22, 18, 82) : new THREE.Vector3(19, 15, 66);
  var HOME_TGT = new THREE.Vector3(5, -0.5, 0);
  camera.position.copy(HOME_POS);

  var controls = new THREE.OrbitControls(camera, canvas);
  controls.target.copy(HOME_TGT);
  controls.enableDamping = true; controls.dampingFactor = 0.06;
  controls.enablePan = false; controls.minDistance = 6; controls.maxDistance = 150;
  controls.rotateSpeed = 0.55; controls.update();

  /* ---------- 程序贴图工具 ---------- */
  function cnv(w, h, fn){ var c = document.createElement("canvas"); c.width=w; c.height=h; fn(c.getContext("2d"), w, h); var t = new THREE.CanvasTexture(c); if("colorSpace" in t && THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }
  function rnd(a,b){ return a + Math.random()*(b-a); }
  function blobs(ctx,w,h,n,colors,rMin,rMax,alpha,elong){
    for(var i=0;i<n;i++){ var x=Math.random()*w, y=Math.random()*h, r=rnd(rMin,rMax);
      ctx.globalAlpha = rnd(alpha*0.4, alpha); ctx.fillStyle = colors[(Math.random()*colors.length)|0];
      ctx.beginPath(); ctx.ellipse(x, y, r*(elong?rnd(1.6,3.4):1), r, 0, 0, 6.283); ctx.fill();
      if(x< r*2){ ctx.beginPath(); ctx.ellipse(x+w, y, r*(elong?2.4:1), r, 0, 0, 6.283); ctx.fill(); } }
    ctx.globalAlpha = 1;
  }
  function speckle(ctx,w,h,n,colors,alpha){
    for(var i=0;i<n;i++){ ctx.globalAlpha = rnd(0.1,alpha); ctx.fillStyle = colors[(Math.random()*colors.length)|0];
      ctx.fillRect(Math.random()*w, Math.random()*h, rnd(1,2.4), rnd(1,2.4)); }
    ctx.globalAlpha = 1;
  }
  function bands(ctx,w,h,palette,wave){
    var y=0, i=0;
    while(y<h){ var bh = rnd(h*0.07, h*0.16); ctx.fillStyle = palette[i%palette.length];
      ctx.beginPath(); ctx.moveTo(0,y);
      for(var x=0;x<=w;x+=16) ctx.lineTo(x, y + Math.sin(x*0.02 + i*1.7)*wave);
      ctx.lineTo(w, y+bh+wave); ctx.lineTo(0, y+bh+wave); ctx.closePath(); ctx.fill(); y += bh; i++; }
  }
  var TEX = {};
  TEX.mercury = cnv(512,256,function(x,w,h){ x.fillStyle="#8d857a"; x.fillRect(0,0,w,h);
    blobs(x,w,h,240,["#7a7368","#9c958a","#6b6459","#a49d90"],4,26,.16);
    for(var i=0;i<300;i++){ var cx=Math.random()*w, cy=Math.random()*h, r=rnd(1.5,9);
      x.globalAlpha=rnd(.15,.4); x.strokeStyle="#5d574e"; x.lineWidth=1.2;
      x.beginPath(); x.arc(cx,cy,r,0,6.283); x.stroke();
      x.globalAlpha=rnd(.08,.2); x.strokeStyle="#b3ac9f"; x.beginPath(); x.arc(cx-1,cy-1,r,0,6.283); x.stroke(); }
    x.globalAlpha=1; speckle(x,w,h,900,["#6e675c","#a8a195"],.25); });
  TEX.venus = cnv(512,256,function(x,w,h){ var g=x.createLinearGradient(0,0,0,h); g.addColorStop(0,"#d9a452"); g.addColorStop(.5,"#c07f35"); g.addColorStop(1,"#d9a452"); x.fillStyle=g; x.fillRect(0,0,w,h);
    blobs(x,w,h,130,["#e8bc72","#b5712f","#f0cd8d","#a86428"],14,52,.14,true);
    x.globalAlpha=.16; x.strokeStyle="#f4d79a"; x.lineWidth=7;
    for(var i=0;i<9;i++){ x.beginPath(); x.arc(rnd(-80,w), rnd(0,h), rnd(60,170), rnd(0,3), rnd(3.4,6)); x.stroke(); } x.globalAlpha=1; });
  TEX.earth = cnv(512,256,function(x,w,h){ var g=x.createLinearGradient(0,0,0,h); g.addColorStop(0,"#173f74"); g.addColorStop(.5,"#1c5fa5"); g.addColorStop(1,"#173f74"); x.fillStyle=g; x.fillRect(0,0,w,h);
    blobs(x,w,h,90,["#2a7ab5","#22639c","#358bd0"],12,40,.18);
    var land=["#3e7c46","#5d8a4c","#8a9a5b","#b39b6b","#2f6b3c"];
    for(var c=0;c<15;c++){ var cx=rnd(20,w-20), cy=rnd(h*0.16,h*0.84);
      for(var j=0;j<16;j++){ x.globalAlpha=rnd(.55,.95); x.fillStyle=land[(Math.random()*land.length)|0];
        x.beginPath(); x.ellipse(cx+rnd(-34,34), cy+rnd(-15,15), rnd(6,24), rnd(4,13), rnd(0,3), 0, 6.283); x.fill(); } }
    x.globalAlpha=.92; x.fillStyle="#eaf4fb"; x.fillRect(0,0,w,13); x.fillRect(0,h-15,w,15);
    blobs(x,w,h,26,["#ffffff"],3,10,.5); x.globalAlpha=1; });
  TEX.clouds = cnv(512,256,function(x,w,h){ x.clearRect(0,0,w,h);
    for(var i=0;i<210;i++){ var cx=Math.random()*w, cy=Math.random()*h, r=rnd(6,26);
      var g=x.createRadialGradient(cx,cy,0,cx,cy,r); g.addColorStop(0,"rgba(255,255,255,.75)"); g.addColorStop(1,"rgba(255,255,255,0)");
      x.fillStyle=g; x.beginPath(); x.ellipse(cx,cy,r*1.9,r*0.62,rnd(-.3,.3),0,6.283); x.fill(); } });
  TEX.mars = cnv(512,256,function(x,w,h){ x.fillStyle="#a44a26"; x.fillRect(0,0,w,h);
    blobs(x,w,h,200,["#8a3a1e","#bc5f31","#7c3319","#c97a44"],8,44,.2);
    blobs(x,w,h,120,["#6e2c15"],3,14,.22);
    x.globalAlpha=.95; x.fillStyle="#f3e9dd"; x.fillRect(0,0,w,10); blobs(x,w,h,14,["#ffffff"],2,7,.6); x.globalAlpha=1;
    speckle(x,w,h,700,["#7c3319","#cf8452"],.25); });
  TEX.jupiter = cnv(1024,512,function(x,w,h){ bands(x,w,h,["#d9b98f","#b98a58","#ecd9b4","#a8743f","#e3c99c","#96622f","#d9b98f"],5);
    blobs(x,w,h,320,["#c49a68","#f2e3c2","#9c6c3a"],10,44,.1,true);
    x.globalAlpha=.9; x.fillStyle="#c33f21"; x.beginPath(); x.ellipse(w*0.68,h*0.63,w*0.075,h*0.075,0,0,6.283); x.fill();
    x.globalAlpha=.55; x.strokeStyle="#e8b08a"; x.lineWidth=5; x.beginPath(); x.ellipse(w*0.68,h*0.63,w*0.088,h*0.09,0,0,6.283); x.stroke(); x.globalAlpha=1; });
  TEX.saturn = cnv(512,256,function(x,w,h){ bands(x,w,h,["#e6d3a1","#d6bd85","#c9ab6d","#eee0b6","#dcc48f"],3);
    blobs(x,w,h,120,["#cdb27c","#f4e8c4"],10,36,.08,true); });
  TEX.ring = cnv(512,512,function(x,w,h){ x.clearRect(0,0,w,h); var cx=w/2, cy=h/2;
    for(var r=118;r<250;r+=2){ if(r>196 && r<212) continue; /* 卡西尼缝 */
      var a = 0.25 + 0.55*Math.abs(Math.sin(r*0.32)) * (1-(r-118)/240);
      x.globalAlpha = Math.min(.92, a); x.strokeStyle = r%14<7 ? "#d9c491" : "#a68d58"; x.lineWidth=2;
      x.beginPath(); x.arc(cx,cy,r,0,6.283); x.stroke(); }
    x.globalAlpha=1; });
  TEX.uranus = cnv(512,256,function(x,w,h){ var g=x.createLinearGradient(0,0,0,h); g.addColorStop(0,"#a8dcd6"); g.addColorStop(.5,"#8fd0cc"); g.addColorStop(1,"#a8dcd6"); x.fillStyle=g; x.fillRect(0,0,w,h);
    blobs(x,w,h,60,["#bde8e2","#7cc4c6","#cfeeea"],14,44,.12,true); });
  TEX.neptune = cnv(512,256,function(x,w,h){ bands(x,w,h,["#2c4ea6","#24438f","#3560bd","#203a80"],4);
    blobs(x,w,h,90,["#4a74d4","#1d3570"],10,36,.16,true);
    x.globalAlpha=.7; x.strokeStyle="#dceaff"; x.lineWidth=2.4;
    for(var i=0;i<6;i++){ var y=rnd(30,h-30); x.beginPath(); x.moveTo(rnd(0,w*.4), y); x.lineTo(rnd(w*.55,w), y+rnd(-7,7)); x.stroke(); } x.globalAlpha=1; });
  function glowTex(inner, outer){ return cnv(256,256,function(x,w,h){ var g=x.createRadialGradient(128,128,0,128,128,128);
    g.addColorStop(0,inner); g.addColorStop(0.35,outer); g.addColorStop(1,"rgba(0,0,0,0)"); x.fillStyle=g; x.fillRect(0,0,w,h); }); }
  var dotTex = cnv(64,64,function(x){ var g=x.createRadialGradient(32,32,0,32,32,32);
    g.addColorStop(0,"rgba(255,255,255,1)"); g.addColorStop(0.4,"rgba(255,255,255,.6)"); g.addColorStop(1,"rgba(255,255,255,0)");
    x.fillStyle=g; x.fillRect(0,0,64,64); });

  /* ---------- 场景结构 ---------- */
  var SUN_POS = new THREE.Vector3(-13, -3.5, 0);
  var system = new THREE.Group(); system.position.copy(SUN_POS); if(mobile) system.scale.setScalar(0.85); scene.add(system);
  var tilt = new THREE.Group(); tilt.rotation.set(0.38, 0, -0.1); system.add(tilt);
  var sunLight = new THREE.PointLight(0xffd9a0, 2.1, 0, 0); system.add(sunLight);
  scene.add(new THREE.AmbientLight(0x39507c, 0.5));
  var rim = new THREE.DirectionalLight(0x8fc9f2, 0.35); rim.position.set(50, 34, -60); scene.add(rim);

  /* 太阳：自定义着色器（流动表面 + 边缘增亮） */
  var sunUniforms = { uTime:{ value:0 } };
  var sun = new THREE.Mesh(new THREE.SphereGeometry(4.3, 56, 40), new THREE.ShaderMaterial({
    uniforms: sunUniforms,
    vertexShader: "varying vec2 vUv; varying vec3 vN; varying vec3 vV;\nvoid main(){ vUv=uv; vec4 mv=modelViewMatrix*vec4(position,1.0); vN=normalMatrix*normal; vV=-mv.xyz; gl_Position=projectionMatrix*mv; }",
    fragmentShader: "uniform float uTime; varying vec2 vUv; varying vec3 vN; varying vec3 vV;\n"
      + "float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }\n"
      + "float noise(vec2 p){ vec2 i=floor(p); vec2 f=fract(p); f=f*f*(3.0-2.0*f);\n"
      + " return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y); }\n"
      + "void main(){ vec2 p=vUv*vec2(14.0,7.0);\n"
      + " float n = noise(p + vec2(uTime*0.05, uTime*0.013))*0.55 + noise(p*2.6 - vec2(uTime*0.09,0.0))*0.3 + noise(p*6.0 + vec2(0.0,uTime*0.06))*0.15;\n"
      + " vec3 hot=vec3(1.0,0.98,0.82); vec3 mid=vec3(1.0,0.62,0.16); vec3 deep=vec3(0.85,0.32,0.03);\n"
      + " vec3 col = mix(deep, mid, smoothstep(0.25,0.62,n)); col = mix(col, hot, smoothstep(0.62,0.92,n));\n"
      + " float fres = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.0);\n"
      + " col += vec3(1.0,0.55,0.15)*fres*1.5;\n"
      + " gl_FragColor = vec4(col*1.3, 1.0); }"
  }));
  sun.userData = { name:"太阳", radius:4.3, focusDist:17 };
  system.add(sun);
  var corona1 = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex("rgba(255,236,180,0.95)","rgba(255,166,48,0.4)"), blending: THREE.AdditiveBlending, depthWrite:false, transparent:true, opacity:.95 }));
  corona1.scale.set(23,23,1); system.add(corona1);
  var corona2 = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex("rgba(255,214,130,0.5)","rgba(255,140,30,0.16)"), blending: THREE.AdditiveBlending, depthWrite:false, transparent:true, opacity:.5 }));
  corona2.scale.set(38,38,1); corona2.material.opacity = 0.42; system.add(corona2);

  /* 大气辉光（菲涅耳，背向） */
  function atmosphere(radius, colorHex, strength){
    return new THREE.Mesh(new THREE.SphereGeometry(radius, 40, 28), new THREE.ShaderMaterial({
      uniforms:{ uColor:{ value:new THREE.Color(colorHex) }, uK:{ value:strength } },
      vertexShader:"varying vec3 vN; varying vec3 vV; void main(){ vec4 mv=modelViewMatrix*vec4(position,1.0); vN=normalMatrix*normal; vV=-mv.xyz; gl_Position=projectionMatrix*mv; }",
      fragmentShader:"uniform vec3 uColor; uniform float uK; varying vec3 vN; varying vec3 vV; void main(){ float f=pow(1.0-abs(dot(normalize(vN),normalize(vV))),3.0); gl_FragColor=vec4(uColor, f*uK); }",
      side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent:true, depthWrite:false }));
  }

  /* 行星 */
  var PLANETS = MUSE_BODIES;
  var pickables = [sun], planets = [];
  PLANETS.forEach(function(cfg, i){
    var pivot = new THREE.Group(); pivot.rotation.y = musePose(cfg, 0).orbitAngle; tilt.add(pivot);
    var holder = new THREE.Group(); holder.position.set(cfg.orbit, 0, 0); holder.rotation.z = cfg.tilt; pivot.add(holder);
    var seg = cfg.r>2 ? 56 : (cfg.orbit>40 ? 32 : 44);
    var mesh = new THREE.Mesh(new THREE.SphereGeometry(cfg.r, seg, Math.round(seg*0.7)),
      new THREE.MeshStandardMaterial({ map: TEX[cfg.tex], roughness:0.92, metalness:0.0 }));
    mesh.userData = { name: cfg.name, radius: cfg.r, focusDist: cfg.r*6+4.5 };
    holder.add(mesh); pickables.push(mesh);
    var extra = null;
    if(cfg.clouds){
      extra = new THREE.Mesh(new THREE.SphereGeometry(cfg.r*1.035, 44, 30),
        new THREE.MeshStandardMaterial({ map: TEX.clouds, transparent:true, depthWrite:false, roughness:1 }));
      holder.add(extra);
    }
    if(cfg.atmo) holder.add(atmosphere(cfg.r*1.16, cfg.atmo, 0.85));
    if(cfg.ring){
      var ring = new THREE.Mesh(new THREE.RingGeometry(cfg.r*1.35, cfg.r*2.3, 96, 1),
        new THREE.MeshStandardMaterial({ map: TEX.ring, transparent:true, side: THREE.DoubleSide, roughness:0.85, metalness:0, depthWrite:false }));
      ring.rotation.x = -Math.PI/2 + 0.22; holder.add(ring);
    }
    planets.push({ cfg:cfg, pivot:pivot, mesh:mesh, extra:extra });
  });

  /* 星云 sprites */
  var nebColors = ["rgba(110,90,230,0.16)","rgba(50,120,220,0.15)","rgba(30,170,190,0.12)","rgba(234,181,79,0.08)"];
  for(var nI=0;nI<6;nI++){
    var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(nebColors[nI%4], nebColors[(nI+1)%4]), blending: THREE.AdditiveBlending, depthWrite:false, transparent:true, opacity:.5 }));
    var sc = rnd(150, 300); sp.scale.set(sc, sc*0.62, 1);
    sp.position.set(rnd(-190,190), rnd(-80,90), rnd(-240,-130));
    scene.add(sp);
  }
  /* 两层星点 */
  function starLayer(count, rMin, rMax, size, opacity){
    var pos = new Float32Array(count*3);
    for(var i=0;i<count;i++){ var th=Math.random()*6.283, ph=Math.acos(rnd(-1,1)), rr=rnd(rMin,rMax);
      pos[i*3]=rr*Math.sin(ph)*Math.cos(th); pos[i*3+1]=rr*Math.cos(ph)*0.7; pos[i*3+2]=rr*Math.sin(ph)*Math.sin(th); }
    var g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos,3));
    var pts = new THREE.Points(g, new THREE.PointsMaterial({ size:size, map:dotTex, transparent:true, opacity:opacity, depthWrite:false, blending:THREE.AdditiveBlending, color:0xdfe9ff }));
    scene.add(pts); return pts;
  }
  var farStars = starLayer(mobile?900:1700, 260, 520, 1.5, 0.85);
  var nearStars = starLayer(mobile?90:180, 130, 260, 2.6, 0.9);

  /* 银河旋臂粒子带 */
  var galTilt = new THREE.Group(); galTilt.rotation.set(0.85, 0, 0.35); tilt.add(galTilt);
  (function(){
    var N = mobile ? 2400 : 6500, pos = new Float32Array(N*3), col = new Float32Array(N*3);
    var palette = [new THREE.Color(0x9fc6ff), new THREE.Color(0xcdbffa), new THREE.Color(0xf7d98b), new THREE.Color(0xffffff), new THREE.Color(0x7fd8e8)];
    for(var i=0;i<N;i++){
      var arm = i%3, rr = 62 + Math.pow(Math.random(), 1.5)*105;
      var ang = arm*2.094 + rr*0.052 + rnd(-0.16,0.16)*(1+ (170-rr)*0.004);
      pos[i*3] = Math.cos(ang)*rr; pos[i*3+1] = rnd(-1,1)*(5.5 - rr*0.022); pos[i*3+2] = Math.sin(ang)*rr;
      var c = palette[(Math.random()*palette.length)|0], b = rnd(0.35, 1);
      col[i*3]=c.r*b; col[i*3+1]=c.g*b; col[i*3+2]=c.b*b;
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos,3));
    g.setAttribute("color", new THREE.BufferAttribute(col,3));
    var pts = new THREE.Points(g, new THREE.PointsMaterial({ size:1.35, map:dotTex, vertexColors:true, transparent:true, opacity:0.8, depthWrite:false, blending:THREE.AdditiveBlending }));
    galTilt.add(pts);
  })();
  var galaxySpin = galTilt.children[0];

  /* 后期辉光 */
  var composer = null;
  try{
    composer = new THREE.EffectComposer(renderer);
    composer.addPass(new THREE.RenderPass(scene, camera));
    var bloom = new THREE.UnrealBloomPass(new THREE.Vector2(640, 400), 0.8, 0.6, 0.85);
    composer.addPass(bloom);
    if(THREE.OutputPass) composer.addPass(new THREE.OutputPass());
  }catch(e){ composer = null; }

  /* ---------- 交互：聚焦 / 返回 ---------- */
  var focusObj = null, manualUntil = 0;
  function cameraState(){
    wrap.dataset.solarSelected = focusObj ? focusObj.userData.key : "overview";
    wrap.dataset.solarCamera = focusObj ? "focus" : (reduced || performance.now() < manualUntil ? "manual" : "auto");
  }
  controls.addEventListener("start", function(){ manualUntil = performance.now() + 2600; cameraState(); });
  var ray = new THREE.Raycaster(), ptr = new THREE.Vector2(), downAt = null;
  canvas.tabIndex = 0;
  canvas.setAttribute("aria-label", "银河太阳系：拖动旋转，滚轮或双指缩放，点击行星聚焦，双击返回总览");
  canvas.addEventListener("pointerdown", function(e){
    if(e.isPrimary === false){ downAt = null; return; }
    downAt = { x:e.clientX, y:e.clientY, id:e.pointerId };
    canvas.focus({ preventScroll:true });
  });
  canvas.addEventListener("pointerup", function(e){
    if(!downAt || e.pointerId !== downAt.id) return;
    var moved = Math.hypot(e.clientX-downAt.x, e.clientY-downAt.y); downAt = null;
    if(moved>6) return;
    var r = canvas.getBoundingClientRect();
    if(!r.width || !r.height) return;
    ptr.x = ((e.clientX-r.left)/r.width)*2-1; ptr.y = -((e.clientY-r.top)/r.height)*2+1;
    ray.setFromCamera(ptr, camera);
    var hit = ray.intersectObjects(pickables, false)[0];
    if(hit){ focusObj = hit.object; returning = false; cameraState(); }
  });
  canvas.addEventListener("pointercancel", function(){ downAt = null; });
  var returning = false;
  function overview(){ focusObj = null; returning = true; cameraState(); }
  canvas.addEventListener("dblclick", function(e){ e.preventDefault(); overview(); });
  window.addEventListener("keydown", function(e){ if(e.key==="Escape" && wrap.contains(document.activeElement)) overview(); });

  /* ---------- 尺寸 ---------- */
  function resize(){
    var w = wrap.clientWidth||1, h = wrap.clientHeight||1;
    renderer.setSize(w, h, false);
    camera.aspect = w/h; camera.updateProjectionMatrix();
    if(composer) composer.setSize(w, h);
  }
  resize(); window.addEventListener("resize", resize);
  var resizeObserver = null;
  if("ResizeObserver" in window){ resizeObserver = new ResizeObserver(resize); resizeObserver.observe(wrap); }

  /* ---------- 主循环 ---------- */
  var frameId = 0, frames = 0, elapsed = 0, previousTime = 0;
  var lastFrameAt = performance.now(), disposed = false, contextLost = false, pageHidden = false;
  var camGoal = new THREE.Vector3(), tgtGoal = new THREE.Vector3(), tmpV = new THREE.Vector3();
  function running(){ wrap.dataset.solarRunning = String(frameId !== 0 && !fatalError && !disposed && !contextLost && !pageHidden && !document.hidden); }
  function stop(){
    if(frameId) cancelAnimationFrame(frameId);
    frameId = 0; previousTime = 0; running();
  }
  function schedule(resetTime){
    if(frameId || fatalError || disposed || contextLost || pageHidden || document.hidden) return;
    if(resetTime !== false) previousTime = 0;
    frameId = requestAnimationFrame(function(now){
      try { tick(now); } catch(error) { fail(error.message || "场景运行失败"); stop(); }
    });
    running();
  }
  function renderFrame(){
    try {
      if(composer) composer.render();
      else renderer.render(scene, camera);
    } catch(e){
      if(composer){
        try { composer.dispose(); } catch(_) {}
        composer = null;
        try { renderer.render(scene, camera); return true; } catch(error) { fail(error.message || "WebGL 绘制失败"); stop(); return false; }
      }
      fail(e.message || "WebGL 绘制失败"); stop(); return false;
    }
    return true;
  }
  function tick(now){
    frameId = 0;
    if(disposed || contextLost || pageHidden || document.hidden){ running(); return; }
    var frameDelta = previousTime ? Math.max((now - previousTime)/1000, 0) : 0;
    var cameraDt = Math.min(frameDelta, 0.05);
    previousTime = now;
    lastFrameAt = performance.now();
    elapsed += frameDelta;
    var t = reduced ? elapsed * 0.3 : elapsed;
    sunUniforms.uTime.value = t;
    sun.rotation.y = t*0.25;
    var pulse = 1 + Math.sin(t*1.4)*0.012;
    corona1.scale.set(23*pulse, 23*pulse, 1); corona2.scale.set(38*(2-pulse), 38*(2-pulse), 1);
    planets.forEach(function(p){
      var pose = musePose(p.cfg, t);
      p.pivot.rotation.y = pose.orbitAngle;
      p.mesh.rotation.y = pose.spinAngle;
      if(p.extra) p.extra.rotation.y = pose.spinAngle * 1.22;
    });
    if(galaxySpin) galaxySpin.rotation.y = t*0.006;
    farStars.rotation.y = t*0.0022; nearStars.rotation.y = -t*0.0012;

    /* 滚动镜头（仅总览、无近期手动操作、非减少动态时） */
    var scrollP = 0;
    if(!focusObj && !reduced && performance.now()>manualUntil){
      scrollP = Math.min(1, Math.max(0, (window.scrollY||0) / (window.innerHeight||800)));
      tilt.rotation.y = scrollP*0.65;
      system.position.set(SUN_POS.x - scrollP*6.5, SUN_POS.y, SUN_POS.z + scrollP*9);
      var fov = BASE_FOV - scrollP*4.5;
      if(Math.abs(camera.fov-fov)>0.05){ camera.fov = fov; camera.updateProjectionMatrix(); }
    } else if(!focusObj){ tilt.rotation.y *= 0.98; system.position.lerp(SUN_POS, 0.08); }

    /* 返回总览 */
    if(returning && !focusObj){
      var kk = 1 - Math.exp(-3.0*cameraDt);
      camera.position.lerp(HOME_POS, kk); controls.target.lerp(HOME_TGT, kk);
      if(camera.position.distanceTo(HOME_POS)<0.15) returning = false;
    }
    if(focusObj) returning = false;
    /* 聚焦平滑跟随 */
    if(focusObj){
      focusObj.getWorldPosition(tmpV);
      tgtGoal.copy(tmpV);
      var dir = camera.position.clone().sub(tmpV).normalize();
      if(dir.lengthSq()<0.01) dir.set(0.4,0.35,1).normalize();
      camGoal.copy(tmpV).add(dir.multiplyScalar(focusObj.userData.focusDist)).add(new THREE.Vector3(0, focusObj.userData.radius*0.7, 0));
      var k = 1 - Math.exp(-3.2*cameraDt);
      controls.target.lerp(tgtGoal, k);
      if(performance.now()>manualUntil) camera.position.lerp(camGoal, k);
    }
    controls.update();
    if(!renderFrame()) return;
    frames++;
    if(frames % 10 === 0){
      wrap.dataset.solarFrames = String(frames);
      wrap.dataset.solarTime = elapsed.toFixed(2);
      cameraState();
    }
    schedule(false);
  }
  canvas.addEventListener("webglcontextlost", function(e){ e.preventDefault(); contextLost = true; stop(); fail("WebGL 上下文暂时丢失"); });
  canvas.addEventListener("webglcontextrestored", function(){
    contextLost = false;
    fatalError = false;
    if(errBox) errBox.style.display = "none";
    wrap.dataset.solarState = "ready";
    resize(); schedule();
  });
  document.addEventListener("visibilitychange", function(){ if(document.hidden) stop(); else schedule(); });
  window.addEventListener("focus", schedule);
  window.addEventListener("pagehide", function(e){
    pageHidden = true; stop();
    if(e.persisted || disposed) return;
    disposed = true;
    clearInterval(watchdog);
    if(resizeObserver) resizeObserver.disconnect();
    controls.dispose();
    var textures = new Set();
    scene.traverse(function(object){
      if(object.geometry) object.geometry.dispose();
      if(!object.material) return;
      var materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach(function(material){
        if(material.map) textures.add(material.map);
        material.dispose();
      });
    });
    Object.keys(TEX).forEach(function(key){ textures.add(TEX[key]); });
    textures.add(dotTex);
    textures.forEach(function(texture){ texture.dispose(); });
    if(composer && composer.dispose) composer.dispose();
    renderer.dispose();
  });
  window.addEventListener("pageshow", function(){ pageHidden = false; schedule(); });
  var watchdog = window.setInterval(function(){
    if(fatalError || disposed || contextLost || pageHidden || document.hidden) return;
    if(performance.now() - lastFrameAt > 2500){ stop(); schedule(); }
  }, 1500);
  wrap.dataset.solarSource = "muse-galaxy-demo";
  wrap.dataset.solarBodies = "太阳,水星,金星,地球,火星,木星,土星,天王星,海王星";
  wrap.dataset.solarTextures = "ready";
  wrap.dataset.solarFrames = "0";
  wrap.dataset.solarTime = "0.00";
  sun.userData.key = "sun";
  PLANETS.forEach(function(cfg, i){ planets[i].mesh.userData.key = cfg.key; });
  cameraState();
  if(renderFrame()){ wrap.dataset.solarState = "ready"; schedule(); }
  }catch(error){ fail(error.message || "场景初始化失败"); }
})();
