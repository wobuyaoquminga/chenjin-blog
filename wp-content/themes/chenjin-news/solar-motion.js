// Fixed-speed visual demonstration. Periods are seconds, not astronomical time.
export const DEMO_BODIES = Object.freeze([
  { key:'mercury', label:'水星', a:8.2, size:.44, orbit:8, spin:14, tilt:.03, phase:2.6, inclination:.122 },
  { key:'venus', label:'金星', a:11.4, size:.74, orbit:11, spin:20, tilt:3.09, phase:5.1, inclination:.059 },
  { key:'earth', label:'地球', a:15.2, size:.80, orbit:14, spin:10, tilt:.409, phase:1.95, inclination:0 },
  { key:'mars', label:'火星', a:19.6, size:.59, orbit:18, spin:12, tilt:.439, phase:4.2, inclination:.032 },
  { key:'jupiter', label:'木星', a:28, size:2.08, orbit:24, spin:8, tilt:.054, phase:2.93, inclination:.023 },
  { key:'saturn', label:'土星', a:39, size:1.71, orbit:30, spin:9, tilt:.466, phase:.42, inclination:.043 },
  { key:'uranus', label:'天王星', a:50, size:1.28, orbit:36, spin:11, tilt:1.706, phase:4.78, inclination:.013 },
  { key:'neptune', label:'海王星', a:60, size:1.23, orbit:42, spin:12, tilt:.494, phase:3.48, inclination:.031 },
].map(body => Object.freeze(body)));
export function demoPose(body, seconds) {
  const orbitAngle = body.phase + seconds * Math.PI * 2 / body.orbit;
  return {
    x: body.a * Math.cos(orbitAngle),
    y: body.a * Math.sin(orbitAngle) * Math.sin(body.inclination),
    z: body.a * Math.sin(orbitAngle) * Math.cos(body.inclination),
    orbitAngle,
    spinAngle: seconds * Math.PI * 2 / body.spin,
  };
}
