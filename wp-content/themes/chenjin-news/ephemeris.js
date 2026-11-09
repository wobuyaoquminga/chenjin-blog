import {
  Body,
  GeoMoon,
  HelioVector,
  PlanetOrbitalPeriod,
  RotateVector,
  RotationAxis,
  Rotation_EQJ_ECL,
} from './assets/vendor/astronomy.js';

// Positions and pole directions use the J2000 mean ecliptic frame. Distances
// are astronomical units, and moonEarth is relative to the center of Earth.
export const EPHEMERIS_SOURCE = 'Astronomy Engine 2.1.19 (VSOP87/NOVAS), J2000 heliocentric ecliptic coordinates';
export const PLANET_KEYS = Object.freeze([
  'mercury', 'venus', 'earth', 'mars',
  'jupiter', 'saturn', 'uranus', 'neptune',
]);

const planetBodies = Object.freeze({
  mercury: Body.Mercury,
  venus: Body.Venus,
  earth: Body.Earth,
  mars: Body.Mars,
  jupiter: Body.Jupiter,
  saturn: Body.Saturn,
  uranus: Body.Uranus,
  neptune: Body.Neptune,
});

export const ORBITAL_PERIOD_DAYS = Object.freeze(Object.fromEntries(
  PLANET_KEYS.map(key => [key, PlanetOrbitalPeriod(planetBodies[key])]),
));

const equatorialToEcliptic = Rotation_EQJ_ECL();

function utcDate(date) {
  const instant = date instanceof Date ? new Date(date.getTime()) : new Date(date);
  if (!Number.isFinite(instant.getTime())) {
    throw new RangeError('A valid UTC instant is required for the ephemeris.');
  }
  return instant;
}

function eclipticCoordinates(vector) {
  const { x, y, z } = RotateVector(equatorialToEcliptic, vector);
  return { x, y, z };
}

function orientation(body, date) {
  const axis = RotationAxis(body, date);
  return {
    spinDeg: ((axis.spin % 360) + 360) % 360,
    pole: eclipticCoordinates(axis.north),
  };
}

export function getPlanetPosition(key, date = new Date()) {
  const body = planetBodies[key];
  if (body === undefined) {
    throw new RangeError(`Unknown planet: ${key}`);
  }
  return eclipticCoordinates(HelioVector(body, utcDate(date)));
}

export function getSolarEphemeris(date = new Date()) {
  const instant = utcDate(date);
  const planets = {};
  for (const key of PLANET_KEYS) {
    const body = planetBodies[key];
    planets[key] = {
      ...eclipticCoordinates(HelioVector(body, instant)),
      ...orientation(body, instant),
    };
  }
  return {
    utc: instant.toISOString(),
    planets,
    moonEarth: eclipticCoordinates(GeoMoon(instant)),
    sun: orientation(Body.Sun, instant),
  };
}
