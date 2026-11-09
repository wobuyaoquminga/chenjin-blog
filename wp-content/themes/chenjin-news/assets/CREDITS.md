# Saturn photograph

`saturn-cassini.jpg`: The Greatest Saturn Portrait ...Yet (PIA06193).
Credit: NASA/JPL/Space Science Institute. Cassini natural-color mosaic, October 6, 2004.

Source: https://science.nasa.gov/photojournal/the-greatest-saturn-portrait-yet/
NASA-provided 1536px JPEG derivative; displayed with CSS positioning and motion.
Usage terms: https://www.jpl.nasa.gov/jpl-image-use-policy/
The photograph follows its source usage terms and is not relicensed under the theme code's GPL license.
No endorsement by NASA, JPL, Caltech, or the Space Science Institute is implied.

# 3D solar-system assets

Planet, Sun, Moon, and ring texture maps: Solar System Scope, https://www.solarsystemscope.com/textures/ .
Licensed under Creative Commons Attribution 4.0 International: https://creativecommons.org/licenses/by/4.0/ .
Files in `textures/` are original 2K downloads; models use the maps with spherical/radial UVs.
Based on NASA data with artistic adjustments and inferred terrain; these are texture maps, not live photographs.

Three.js 0.187.0: https://github.com/mrdoob/three.js/tree/r187 , MIT license in `vendor/THREE-LICENSE.txt`.
Build files are upstream distributions; OrbitControls imports the local Three.js module instead of a bare package name.
Planet radii and orbital distances are compressed for readability. Angular positions follow current UTC ephemerides.

Astronomy Engine 2.1.19: https://github.com/cosinekitty/astronomy/tree/v2.1.19 , MIT license in `vendor/astronomy.LICENSE.txt`.
Local VSOP87/NOVAS computation provides heliocentric J2000 ecliptic coordinates; this is not a live JPL API feed.
Reference vectors from NASA/JPL Horizons are recorded with query parameters in `tests/fixtures/solar-horizons-20261109.json` in the source repository.
Rotation axes and spin use computed values; alignment of texture longitude is approximate.
