'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const fixture = JSON.parse(fs.readFileSync(
  path.join(__dirname, 'fixtures/solar-horizons-20261109.json'), 'utf8',
));
const moduleUrl = pathToFileURL(path.join(__dirname, '../wp-content/themes/chenjin-news/ephemeris.js'));

function length(vector) {
  return Math.hypot(vector.x, vector.y, vector.z);
}

function angularDifferenceArcsec(a, b) {
  const cosine = (a.x * b.x + a.y * b.y + a.z * b.z) / (length(a) * length(b));
  return Math.acos(Math.max(-1, Math.min(1, cosine))) * 180 * 3600 / Math.PI;
}

async function main() {
  const {
    getSolarEphemeris, getPlanetPosition, PLANET_KEYS,
    ORBITAL_PERIOD_DAYS, EPHEMERIS_SOURCE,
  } = await import(moduleUrl.href);
  const date = new Date(fixture.utc);
  const originalTime = date.getTime();
  const result = getSolarEphemeris(date);

  assert.equal(result.utc, fixture.utc);
  assert.equal(date.getTime(), originalTime, 'Caller Date stays unchanged');
  assert.deepEqual(Object.keys(result.planets), PLANET_KEYS);
  assert.match(EPHEMERIS_SOURCE, /Astronomy Engine 2\.1\.19/);

  for (const key of PLANET_KEYS) {
    const actual = result.planets[key];
    const expected = fixture.vectors[key];
    assert.ok(expected, `JPL fixture exists for ${key}`);
    for (const axis of ['x', 'y', 'z']) {
      assert.ok(Number.isFinite(actual[axis]), `${key}.${axis} finite`);
      assert.equal(actual[axis], getPlanetPosition(key, date)[axis], `${key}.${axis} consistent`);
    }
    assert.ok(ORBITAL_PERIOD_DAYS[key] > 80, `${key} has an orbital period`);
    assert.ok(actual.spinDeg >= 0 && actual.spinDeg < 360, `${key} spin normalized`);
    assert.ok(Math.abs(length(actual.pole) - 1) < 1e-12, `${key} pole is a unit vector`);

    const angle = angularDifferenceArcsec(actual, expected);
    const distance = Math.hypot(
      actual.x - expected.x, actual.y - expected.y, actual.z - expected.z,
    );
    assert.ok(angle < 60, `${key} differs from JPL Horizons by ${angle.toFixed(2)} arcsec`);
    assert.ok(distance < 0.003, `${key} differs from JPL Horizons by ${distance.toFixed(6)} AU`);
    console.log(`${key.padEnd(8)} Horizons angular difference: ${angle.toFixed(2)} arcsec`);
  }

  assert.ok(length(result.moonEarth) > 0.002 && length(result.moonEarth) < 0.003,
    'Moon position is relative to Earth, in AU');
  assert.ok(result.sun.spinDeg >= 0 && result.sun.spinDeg < 360);
  assert.ok(Math.abs(length(result.sun.pole) - 1) < 1e-12);
  assert.deepEqual(getSolarEphemeris(date), result, 'Fixed UTC date is deterministic');

  const nextDay = new Date(originalTime + 86400000);
  const shifted = getSolarEphemeris(nextDay);
  assert.equal(shifted.utc, nextDay.toISOString());
  for (const key of PLANET_KEYS) {
    const before = result.planets[key];
    const after = shifted.planets[key];
    assert.ok(Math.hypot(after.x - before.x, after.y - before.y, after.z - before.z) > 1e-5,
      `${key} responds to UTC time`);
  }

  for (const year of [1900, 2100]) {
    const sample = getSolarEphemeris(new Date(`${year}-01-01T00:00:00.000Z`));
    assert.equal(Object.keys(sample.planets).length, 8, `${year} path coverage`);
    assert.ok(PLANET_KEYS.every(key => Number.isFinite(sample.planets[key].x)));
  }

  assert.throws(() => getSolarEphemeris(new Date(NaN)), RangeError);
  assert.throws(() => getPlanetPosition('pluto', date), RangeError);
  console.log('Ephemeris checks passed.');
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
