const assert = require('node:assert/strict');
const path = require('node:path');
const {pathToFileURL}=require('node:url');
(async()=>{
 const {DEMO_BODIES,demoPose}=await import(pathToFileURL(path.resolve(__dirname,'../wp-content/themes/chenjin-news/solar-motion.js')).href);
 assert.equal(DEMO_BODIES.length,8);
 assert.equal(new Set(DEMO_BODIES.map(b=>b.orbit)).size,8);
 for(const body of DEMO_BODIES){
   const a=demoPose(body,10),b=demoPose(body,11),c=demoPose(body,12);
   assert.ok(Math.abs((b.orbitAngle-a.orbitAngle)-(c.orbitAngle-b.orbitAngle))<1e-12,body.key+' constant orbital speed');
   assert.ok(Math.abs((b.spinAngle-a.spinAngle)-(c.spinAngle-b.spinAngle))<1e-12,body.key+' constant spin');
   assert.ok(Math.hypot(b.x-a.x,b.y-a.y,b.z-a.z)>6,body.key+' meaningful one-second displacement');
   assert.ok(b.spinAngle-a.spinAngle>=Math.PI/10-1e-12,body.key+' at least 18 degrees spin per second');
   assert.ok(Math.abs(Math.hypot(b.x,b.y,b.z)-body.a)<1e-12);
 }
 console.log('All eight planets move over 6 scene units and spin at least 18 degrees per second with distinct constant orbital speeds.');
})().catch(e=>{console.error(e);process.exitCode=1;});
