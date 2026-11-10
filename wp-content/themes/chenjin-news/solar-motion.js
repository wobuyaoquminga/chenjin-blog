// Muse 银河太阳系的演示参数。速度单位为弧度/秒，不代表真实星历。
export const MUSE_BODIES = Object.freeze([
  { key:"mercury", name:"水星", r:0.55, orbit:8, oSpeed:0.55, spin:1.4, tilt:0.01, tex:"mercury", angle:0.8 },
  { key:"venus", name:"金星", r:0.98, orbit:11.5, oSpeed:0.42, spin:-1.1, tilt:0.05, tex:"venus", angle:5.3 },
  { key:"earth", name:"地球", r:1.02, orbit:15.5, oSpeed:0.34, spin:1.9, tilt:0.41, tex:"earth", clouds:true, atmo:0x6db9ff, angle:2.0 },
  { key:"mars", name:"火星", r:0.72, orbit:19.5, oSpeed:0.27, spin:1.8, tilt:0.44, tex:"mars", angle:1.4 },
  { key:"jupiter", name:"木星", r:3.2, orbit:27, oSpeed:0.16, spin:2.6, tilt:0.05, tex:"jupiter", angle:0.5 },
  { key:"saturn", name:"土星", r:2.7, orbit:37.5, oSpeed:0.11, spin:2.4, tilt:0.47, tex:"saturn", ring:true, angle:0.62 },
  { key:"uranus", name:"天王星", r:1.55, orbit:47, oSpeed:0.075, spin:1.5, tilt:1.35, tex:"uranus", angle:1.05 },
  { key:"neptune", name:"海王星", r:1.5, orbit:55, oSpeed:0.058, spin:1.6, tilt:0.49, tex:"neptune", atmo:0x5f83e8, angle:0.95 }
].map(body => Object.freeze(body)));

export function musePose(body, seconds) {
  return {
    orbitAngle: (body.angle || 0) + seconds * body.oSpeed,
    spinAngle: seconds * body.spin
  };
}
