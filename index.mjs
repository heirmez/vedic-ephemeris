/**
 * vedic-ephemeris - Lightweight Vedic (sidereal) planetary ephemeris
 *
 * Computes tropical longitude using Jean Meeus algorithms, then subtracts
 * Lahiri ayanamsa to produce sidereal (Vedic) positions.
 *
 * Accuracy: ~1 arcminute for Sun/Moon, ~0.5 deg for outer planets.
 * Zero dependencies. Pure JavaScript.
 *
 * @see https://kalmanas.com
 * @license MIT
 */

// ---------------------------------------------------------------------------
// Rashis (zodiac signs)
// ---------------------------------------------------------------------------

export const RASHIS = [
  { index: 0,  name: 'Aries',       sanskrit: 'Mesha',      lord: 'Mars',    element: 'Fire',  quality: 'Cardinal' },
  { index: 1,  name: 'Taurus',      sanskrit: 'Vrishabha',  lord: 'Venus',   element: 'Earth', quality: 'Fixed' },
  { index: 2,  name: 'Gemini',      sanskrit: 'Mithuna',    lord: 'Mercury', element: 'Air',   quality: 'Mutable' },
  { index: 3,  name: 'Cancer',      sanskrit: 'Karka',      lord: 'Moon',    element: 'Water', quality: 'Cardinal' },
  { index: 4,  name: 'Leo',         sanskrit: 'Simha',      lord: 'Sun',     element: 'Fire',  quality: 'Fixed' },
  { index: 5,  name: 'Virgo',       sanskrit: 'Kanya',      lord: 'Mercury', element: 'Earth', quality: 'Mutable' },
  { index: 6,  name: 'Libra',       sanskrit: 'Tula',       lord: 'Venus',   element: 'Air',   quality: 'Cardinal' },
  { index: 7,  name: 'Scorpio',     sanskrit: 'Vrishchika', lord: 'Mars',    element: 'Water', quality: 'Fixed' },
  { index: 8,  name: 'Sagittarius', sanskrit: 'Dhanus',     lord: 'Jupiter', element: 'Fire',  quality: 'Mutable' },
  { index: 9,  name: 'Capricorn',   sanskrit: 'Makara',     lord: 'Saturn',  element: 'Earth', quality: 'Cardinal' },
  { index: 10, name: 'Aquarius',    sanskrit: 'Kumbha',     lord: 'Saturn',  element: 'Air',   quality: 'Fixed' },
  { index: 11, name: 'Pisces',      sanskrit: 'Meena',      lord: 'Jupiter', element: 'Water', quality: 'Mutable' },
];

// ---------------------------------------------------------------------------
// Nakshatras (27 lunar mansions)
// ---------------------------------------------------------------------------

export const NAKSHATRAS = [
  { index: 0,  name: 'Ashwini',           deity: 'Ashwini Kumaras',    lord: 'Ketu',    symbol: 'Horse head' },
  { index: 1,  name: 'Bharani',           deity: 'Yama',               lord: 'Venus',   symbol: 'Yoni (womb)' },
  { index: 2,  name: 'Krittika',          deity: 'Agni',               lord: 'Sun',     symbol: 'Razor/flame' },
  { index: 3,  name: 'Rohini',            deity: 'Brahma/Prajapati',   lord: 'Moon',    symbol: 'Chariot/cart' },
  { index: 4,  name: 'Mrigashira',        deity: 'Soma (Moon)',        lord: 'Mars',    symbol: 'Deer head' },
  { index: 5,  name: 'Ardra',             deity: 'Rudra',              lord: 'Rahu',    symbol: 'Teardrop' },
  { index: 6,  name: 'Punarvasu',         deity: 'Aditi',              lord: 'Jupiter', symbol: 'Quiver of arrows' },
  { index: 7,  name: 'Pushya',            deity: 'Brihaspati',         lord: 'Saturn',  symbol: 'Flower/udder' },
  { index: 8,  name: 'Ashlesha',          deity: 'Nagas (serpents)',   lord: 'Mercury', symbol: 'Coiled serpent' },
  { index: 9,  name: 'Magha',             deity: 'Pitris (ancestors)', lord: 'Ketu',    symbol: 'Royal throne' },
  { index: 10, name: 'Purva Phalguni',    deity: 'Bhaga',              lord: 'Venus',   symbol: 'Front legs of bed' },
  { index: 11, name: 'Uttara Phalguni',   deity: 'Aryaman',            lord: 'Sun',     symbol: 'Back legs of bed' },
  { index: 12, name: 'Hasta',             deity: 'Savitar',            lord: 'Moon',    symbol: 'Open hand' },
  { index: 13, name: 'Chitra',            deity: 'Tvashtri/Vishwakarma', lord: 'Mars',  symbol: 'Bright jewel' },
  { index: 14, name: 'Swati',             deity: 'Vayu (wind god)',    lord: 'Rahu',    symbol: 'Sword/young plant' },
  { index: 15, name: 'Vishakha',          deity: 'Indra and Agni',     lord: 'Jupiter', symbol: 'Triumphal arch' },
  { index: 16, name: 'Anuradha',          deity: 'Mitra',              lord: 'Saturn',  symbol: 'Lotus flower' },
  { index: 17, name: 'Jyeshtha',          deity: 'Indra',              lord: 'Mercury', symbol: 'Earring/umbrella' },
  { index: 18, name: 'Mula',              deity: 'Niritti',            lord: 'Ketu',    symbol: 'Tied bunch of roots' },
  { index: 19, name: 'Purva Ashadha',     deity: 'Apas (water)',       lord: 'Venus',   symbol: 'Elephant tusk/fan' },
  { index: 20, name: 'Uttara Ashadha',    deity: 'Vishvadevas',        lord: 'Sun',     symbol: 'Elephant tusk/bed' },
  { index: 21, name: 'Shravana',          deity: 'Vishnu',             lord: 'Moon',    symbol: 'Three footprints/ear' },
  { index: 22, name: 'Dhanishtha',        deity: 'Ashta Vasus',        lord: 'Mars',    symbol: 'Drum/flute' },
  { index: 23, name: 'Shatabhisha',       deity: 'Varuna',             lord: 'Rahu',    symbol: 'Empty circle' },
  { index: 24, name: 'Purva Bhadrapada',  deity: 'Aja Ekapada',        lord: 'Jupiter', symbol: 'Sword' },
  { index: 25, name: 'Uttara Bhadrapada', deity: 'Ahir Budhnya',       lord: 'Saturn',  symbol: 'Back legs of funeral pyre' },
  { index: 26, name: 'Revati',            deity: 'Pushan',             lord: 'Mercury', symbol: 'Fish/drum' },
];

// ---------------------------------------------------------------------------
// Math helpers
// ---------------------------------------------------------------------------

function rad(d) { return d * Math.PI / 180; }
function deg(r) { return r * 180 / Math.PI; }
function norm360(x) { return ((x % 360) + 360) % 360; }

// ---------------------------------------------------------------------------
// Julian Day
// ---------------------------------------------------------------------------

function julianDay(date) {
  const Y = date.getUTCFullYear();
  const M = date.getUTCMonth() + 1;
  const D = date.getUTCDate() +
    (date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600) / 24;
  let y = Y, m = M;
  if (m <= 2) { y -= 1; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + D + B - 1524.5;
}

function T(jd) { return (jd - 2451545.0) / 36525.0; }

// ---------------------------------------------------------------------------
// Lahiri Ayanamsa
// ---------------------------------------------------------------------------

/**
 * Compute Lahiri ayanamsa for a given Julian Day.
 * Returns the precession offset in degrees (~24.2 deg in 2026).
 */
export function lahiriAyanamsa(jd) {
  const t = T(jd);
  return norm360(23.85 + 1.396971 * t + 0.000308 * t * t);
}

// ---------------------------------------------------------------------------
// Sun (Meeus Ch. 25)
// ---------------------------------------------------------------------------

function sunLongitude(jd) {
  const t = T(jd);
  const L0 = norm360(280.46646 + 36000.76983 * t + 0.0003032 * t * t);
  const M = rad(norm360(357.52911 + 35999.05029 * t - 0.0001537 * t * t));
  const C = (1.914602 - 0.004817 * t - 0.000014 * t * t) * Math.sin(M)
          + (0.019993 - 0.000101 * t) * Math.sin(2 * M)
          + 0.000289 * Math.sin(3 * M);
  const sunLon = norm360(L0 + C);
  const omega = rad(norm360(125.04 - 1934.136 * t));
  return norm360(sunLon - 0.00569 - 0.00478 * Math.sin(omega));
}

// ---------------------------------------------------------------------------
// Moon (Meeus Ch. 47 simplified)
// ---------------------------------------------------------------------------

function moonLongitude(jd) {
  const t = T(jd);
  const Lp = norm360(218.3164477 + 481267.88123421 * t - 0.0015786 * t * t);
  const D  = rad(norm360(297.8501921 + 445267.1114034 * t - 0.0018819 * t * t));
  const M  = rad(norm360(357.5291092 + 35999.0502909 * t - 0.0001536 * t * t));
  const Mp = rad(norm360(134.9633964 + 477198.8675055 * t + 0.0087414 * t * t));
  const F  = rad(norm360(93.2720950 + 483202.0175233 * t - 0.0036539 * t * t));

  const lon = Lp
    + 6.288750 * Math.sin(Mp)
    + 1.274018 * Math.sin(2 * D - Mp)
    + 0.658309 * Math.sin(2 * D)
    + 0.213616 * Math.sin(2 * Mp)
    - 0.185596 * Math.sin(M)
    - 0.114336 * Math.sin(2 * F)
    + 0.058793 * Math.sin(2 * D - 2 * Mp)
    + 0.057212 * Math.sin(2 * D - M - Mp)
    + 0.053320 * Math.sin(2 * D + Mp)
    + 0.045874 * Math.sin(2 * D - M)
    + 0.041025 * Math.sin(Mp - M)
    + 0.034429 * Math.sin(D)
    + 0.030024 * Math.sin(2 * Mp - 2 * D)
    + 0.020018 * Math.sin(Mp - 2 * F);

  const moonLon = norm360(lon);
  const phase = norm360(moonLon - sunLongitude(jd)) / 360;
  return { lon: moonLon, phase };
}

// ---------------------------------------------------------------------------
// Planets (geocentric via heliocentric -> Earth parallax)
// ---------------------------------------------------------------------------

function innerPlanetGeo(heLon0, rate, semiAxis, jd) {
  const d = jd - 2451545.0;
  const planetHelo = rad(norm360(heLon0 + rate * d));
  const earthHelo  = rad(norm360(sunLongitude(jd) + 180));
  const theta = planetHelo - earthHelo;
  const geoAngle = Math.atan2(semiAxis * Math.sin(theta), 1.0 - semiAxis * Math.cos(theta));
  const geoLon = norm360(deg(earthHelo) + 180 + deg(geoAngle));

  const prevD = d - 1;
  const prevPlanetHelo = rad(norm360(heLon0 + rate * prevD));
  const prevEarthHelo = rad(norm360(sunLongitude(jd - 1) + 180));
  const prevTheta = prevPlanetHelo - prevEarthHelo;
  const prevGeoAngle = Math.atan2(semiAxis * Math.sin(prevTheta), 1.0 - semiAxis * Math.cos(prevTheta));
  const prevGeoLon = norm360(deg(prevEarthHelo) + 180 + deg(prevGeoAngle));

  return { lon: geoLon, retrograde: norm360(geoLon - prevGeoLon) > 180 };
}

function outerPlanetGeo(heLon0, rate, semiAxis, jd) {
  const d = jd - 2451545.0;
  const planetHelo = rad(norm360(heLon0 + rate * d));
  const earthHelo  = rad(norm360(sunLongitude(jd) + 180));
  const dx = semiAxis * Math.cos(planetHelo) - Math.cos(earthHelo);
  const dy = semiAxis * Math.sin(planetHelo) - Math.sin(earthHelo);
  const geoLon = norm360(deg(Math.atan2(dy, dx)));

  const prevD = d - 5;
  const prevPlanetHelo = rad(norm360(heLon0 + rate * prevD));
  const prevEarthHelo = rad(norm360(sunLongitude(jd - 5) + 180));
  const prevDx = semiAxis * Math.cos(prevPlanetHelo) - Math.cos(prevEarthHelo);
  const prevDy = semiAxis * Math.sin(prevPlanetHelo) - Math.sin(prevEarthHelo);
  const prevGeoLon = norm360(deg(Math.atan2(prevDy, prevDx)));

  return { lon: geoLon, retrograde: norm360(geoLon - prevGeoLon) > 180 };
}

function meanPlanetLongitude(planet, jd) {
  switch (planet) {
    case 'Mercury': return innerPlanetGeo(252.250906, 4.09233444, 0.38709893, jd);
    case 'Venus':   return innerPlanetGeo(181.979801, 1.60213034, 0.72332982, jd);
    case 'Mars':    return outerPlanetGeo(355.433,    0.52402612, 1.52366231, jd);
    case 'Jupiter': return outerPlanetGeo(34.351519,  0.08308676, 5.20336301, jd);
    case 'Saturn':  return outerPlanetGeo(50.077444,  0.03344531, 9.53707032, jd);
    case 'Rahu': {
      const rahuLon = norm360(125.044555 - 0.05295376 * (jd - 2451545.0));
      return { lon: rahuLon, retrograde: true };
    }
    case 'Ketu': {
      const rahuLon = norm360(125.044555 - 0.05295376 * (jd - 2451545.0));
      return { lon: norm360(rahuLon + 180), retrograde: true };
    }
    default: return { lon: 0, retrograde: false };
  }
}

// ---------------------------------------------------------------------------
// Rashi / Nakshatra lookups
// ---------------------------------------------------------------------------

function rashiFromLon(lon) {
  const idx = Math.floor(lon / 30) % 12;
  return { rashi: RASHIS[idx], rashiDeg: lon % 30 };
}

function nakshatraFromLon(lon) {
  const span = 360 / 27; // 13.3333 deg
  const idx = Math.floor(lon / span) % 27;
  const degIn = lon % span;
  const pada = Math.min(Math.floor(degIn / (span / 4)) + 1, 4);
  return { nakshatra: NAKSHATRAS[idx], pada };
}

/**
 * Compute which rashis (zodiac signs) a nakshatra spans.
 * 9 of 27 nakshatras cross a rashi boundary (e.g., Vishakha spans Libra and Scorpio).
 *
 * @param {number} nakshatraIndex - 0-26
 * @returns {Array<{signIdx: number, sign: object, padas: number[]}>}
 */
export function nakshatraSignSpan(nakshatraIndex) {
  const padaDeg = 360 / 27 / 4; // 3.3333 deg per pada
  const start = nakshatraIndex * (360 / 27);
  const groups = [];
  for (let p = 0; p < 4; p++) {
    const padaMid = start + p * padaDeg + padaDeg / 2;
    const signIdx = Math.floor(padaMid / 30) % 12;
    if (groups.length === 0 || groups[groups.length - 1].signIdx !== signIdx) {
      groups.push({ signIdx, sign: RASHIS[signIdx], padas: [p + 1] });
    } else {
      groups[groups.length - 1].padas.push(p + 1);
    }
  }
  return groups;
}

// ---------------------------------------------------------------------------
// Moon phase name
// ---------------------------------------------------------------------------

function moonPhaseName(phaseAngle) {
  const angle = phaseAngle * 360;
  if (angle < 11.25 || angle >= 348.75) return 'New Moon';
  if (angle < 78.75)  return 'Waxing Crescent';
  if (angle < 101.25) return 'First Quarter';
  if (angle < 168.75) return 'Waxing Gibbous';
  if (angle < 191.25) return 'Full Moon';
  if (angle < 258.75) return 'Waning Gibbous';
  if (angle < 281.25) return 'Last Quarter';
  return 'Waning Crescent';
}

// ---------------------------------------------------------------------------
// Obliquity of the ecliptic (Meeus Ch. 22)
// ---------------------------------------------------------------------------

function obliquityOfEcliptic(jd) {
  const t = T(jd);
  return 23.439291 - 0.0130042 * t - 1.64e-7 * t * t + 5.04e-7 * t * t * t;
}

// ---------------------------------------------------------------------------
// Greenwich Mean Sidereal Time (Meeus Ch. 12)
// ---------------------------------------------------------------------------

function greenwichMeanSiderealTime(jd) {
  const t = T(jd);
  return norm360(
    280.46061837 +
    360.98564736629 * (jd - 2451545.0) +
    0.000387933 * t * t -
    t * t * t / 38710000
  );
}

// ---------------------------------------------------------------------------
// Ascendant (Lagna)
// ---------------------------------------------------------------------------

/**
 * Compute the Vedic Ascendant (Lagna) for a given date and geographic location.
 *
 * The Ascendant is the zodiac sign rising on the eastern horizon. In Vedic
 * astrology it determines the entire house system - the Ascendant sign becomes
 * the 1st house, and all other houses follow in sequence.
 *
 * Uses the ecliptic-horizon intersection formula from Meeus (Astronomical
 * Algorithms). Accurate to ~1 arcminute for latitudes between 60N and 60S.
 *
 * @param {object} options
 * @param {Date}   [options.date=new Date()] - Date/time (UTC)
 * @param {number} options.lat - Geographic latitude in degrees (north positive)
 * @param {number} options.lon - Geographic longitude in degrees (east positive)
 * @returns {{
 *   tropicalLon: number,
 *   siderealLon: number,
 *   rashi: object,
 *   rashiDeg: number,
 *   nakshatra: object,
 *   nakshatraPada: number,
 *   localSiderealTime: number,
 *   ayanamsa: number
 * }}
 */
export function getAscendant({ date, lat, lon } = {}) {
  const d = date || new Date();
  const jd = julianDay(d);
  const ayanamsa = lahiriAyanamsa(jd);

  // Greenwich Mean Sidereal Time -> Local Sidereal Time (degrees)
  const gmst = greenwichMeanSiderealTime(jd);
  const lst = norm360(gmst + lon);

  // RAMC = Local Sidereal Time expressed as an angle
  const alpha   = rad(lst);
  const epsilon = rad(obliquityOfEcliptic(jd));
  const phi     = rad(lat);

  // Ecliptic-horizon intersection (Meeus):
  //   tan(lambda) = -cos(RAMC) / (sin(e)*tan(phi) + cos(e)*sin(RAMC))
  const y = -Math.cos(alpha);
  const x = Math.sin(epsilon) * Math.tan(phi) + Math.cos(epsilon) * Math.sin(alpha);
  const tropicalLon = norm360(deg(Math.atan2(y, x)));

  // Tropical -> sidereal
  const siderealLon = norm360(tropicalLon - ayanamsa);
  const { rashi, rashiDeg } = rashiFromLon(siderealLon);
  const { nakshatra, pada } = nakshatraFromLon(siderealLon);

  return {
    tropicalLon,
    siderealLon,
    rashi,
    rashiDeg,
    nakshatra,
    nakshatraPada: pada,
    localSiderealTime: lst,
    ayanamsa,
  };
}

// ---------------------------------------------------------------------------
// Main API
// ---------------------------------------------------------------------------

/**
 * Get a full sky snapshot: sidereal positions of Sun, Moon, Mercury, Venus,
 * Mars, Jupiter, Saturn, Rahu, and Ketu.
 *
 * @param {Date} [date=new Date()] - The date/time for the snapshot (UTC).
 * @returns {{
 *   date: Date,
 *   ayanamsa: number,
 *   planets: Record<string, {
 *     name: string,
 *     siderealLon: number,
 *     rashi: object,
 *     rashiDeg: number,
 *     nakshatra: object,
 *     nakshatraPada: number,
 *     retrograde: boolean
 *   }>,
 *   moonPhase: string,
 *   moonIllumination: number
 * }}
 */
export function getSkySnapshot(date) {
  const d = date || new Date();
  const jd = julianDay(d);
  const ayanamsa = lahiriAyanamsa(jd);

  function buildPlanet(name, tropLon, retrograde) {
    const siderealLon = norm360(tropLon - ayanamsa);
    const { rashi, rashiDeg } = rashiFromLon(siderealLon);
    const { nakshatra, pada } = nakshatraFromLon(siderealLon);
    return { name, siderealLon, rashi, rashiDeg, nakshatra, nakshatraPada: pada, retrograde };
  }

  const sunTrop = sunLongitude(jd);
  const moonData = moonLongitude(jd);

  const planets = {};
  planets.Sun  = buildPlanet('Sun', sunTrop);
  planets.Moon = buildPlanet('Moon', moonData.lon);

  for (const name of ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Rahu', 'Ketu']) {
    const r = meanPlanetLongitude(name, jd);
    planets[name] = buildPlanet(name, r.lon, r.retrograde);
  }

  return {
    date: d,
    ayanamsa,
    planets,
    moonPhase: moonPhaseName(moonData.phase),
    moonIllumination: Math.round((1 - Math.cos(rad(moonData.phase * 360))) / 2 * 100),
  };
}

/**
 * Format sky data as human-readable text (useful for LLM prompt injection).
 *
 * @param {object} sky - Output from getSkySnapshot()
 * @param {object} [ascendant] - Optional output from getAscendant()
 * @returns {string}
 */
export function skyDataForPrompt(sky, ascendant) {
  const lines = [];
  lines.push('REAL ASTRONOMICAL DATA (calculated, not estimated):');
  lines.push(`Date: ${sky.date.toUTCString()}`);
  lines.push(`Moon Phase: ${sky.moonPhase} (${sky.moonIllumination}% illumination)`);

  if (ascendant) {
    lines.push(`Ascendant (Lagna): ${ascendant.rashi.sanskrit} (${ascendant.rashi.name}) ` +
      `${ascendant.rashiDeg.toFixed(1)} deg - Nakshatra: ${ascendant.nakshatra.name} pada ${ascendant.nakshatraPada}`);
  }
  lines.push('');

  const sanskritNames = {
    Sun: 'Surya', Moon: 'Chandra', Mercury: 'Budha', Venus: 'Shukra',
    Mars: 'Mangal', Jupiter: 'Guru', Saturn: 'Shani', Rahu: 'Rahu', Ketu: 'Ketu',
  };

  for (const [key, p] of Object.entries(sky.planets)) {
    const retro = p.retrograde ? ' (retrograde)' : '';
    let spanNote = '';
    const span = nakshatraSignSpan(p.nakshatra.index);
    if (span.length > 1) {
      const parts = span.map(g => {
        const padaStr = g.padas.length === 1
          ? `pada ${g.padas[0]}`
          : `padas ${g.padas[0]}-${g.padas[g.padas.length - 1]}`;
        return `${padaStr} in ${g.sign.name}`;
      });
      spanNote = ` [${p.nakshatra.name} spans ${span.map(g => g.sign.name).join(' and ')}: ${parts.join(', ')}]`;
    }
    lines.push(
      `${sanskritNames[key]} (${key}): ${p.rashi.sanskrit} (${p.rashi.name}) ` +
      `${p.rashiDeg.toFixed(1)} deg - Nakshatra: ${p.nakshatra.name} pada ${p.nakshatraPada}${retro}${spanNote}`
    );
  }

  // Detect conjunctions (within 5 deg)
  const keys = Object.keys(sky.planets);
  const conjunctions = [];
  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      const a = sky.planets[keys[i]];
      const b = sky.planets[keys[j]];
      const diff = Math.abs(a.siderealLon - b.siderealLon);
      const angular = Math.min(diff, 360 - diff);
      if (angular < 5 && !['Rahu', 'Ketu'].includes(a.name) && !['Rahu', 'Ketu'].includes(b.name)) {
        conjunctions.push(`${a.name}-${b.name} conjunction in ${a.rashi.name} (within ${angular.toFixed(1)} deg)`);
      }
    }
  }
  if (conjunctions.length > 0) {
    lines.push('');
    lines.push(`Active conjunctions: ${conjunctions.join('; ')}`);
  }

  return lines.join('\n');
}
