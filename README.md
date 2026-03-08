# vedic-ephemeris

Lightweight Vedic (sidereal) ephemeris for JavaScript. Computes real-time planetary positions using Jean Meeus algorithms with Lahiri ayanamsa. **Zero dependencies.**

Used in production at [Kalmanas](https://kalmanas.com) - a Vedic astrology platform.

## Features

- **Ascendant (Lagna)** calculation from date + latitude + longitude
- **9 grahas**: Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Rahu, Ketu
- **Sidereal positions** with Lahiri ayanamsa (accurate to ~1 arcminute for Sun/Moon)
- **27 nakshatras** with pada calculation
- **12 rashis** (zodiac signs) with degree position
- **House mapping** - compute house placements from Ascendant
- **Retrograde detection** for all planets
- **Moon phase** name and illumination percentage
- **Conjunction detection** (planets within 5 degrees)
- **Nakshatra sign spans** - knows which nakshatras cross rashi boundaries
- **LLM-ready** text formatter for AI prompt injection
- Pure ESM, zero dependencies, ~420 lines

## Install

```bash
npm install vedic-ephemeris
```

Or just copy `index.mjs` into your project.

## Quick Start

```javascript
import { getSkySnapshot, getAscendant } from 'vedic-ephemeris';

// Planetary positions (only needs time)
const sky = getSkySnapshot();

console.log(sky.moonPhase);          // "Waning Gibbous"
console.log(sky.moonIllumination);   // 76

const moon = sky.planets.Moon;
console.log(moon.rashi.name);        // "Libra"
console.log(moon.nakshatra.name);    // "Vishakha"
console.log(moon.nakshatraPada);     // 1

// Ascendant (needs time + location)
const lagna = getAscendant({
  date: new Date(),
  lat: 10.5276,   // Thrissur, Kerala
  lon: 76.2144,
});

console.log(lagna.rashi.name);       // "Scorpio"
console.log(lagna.rashiDeg);         // 12.4
console.log(lagna.nakshatra.name);   // "Anuradha"
console.log(lagna.nakshatraPada);    // 3
```

## API

### `getSkySnapshot(date?)`

Returns positions for all 9 Vedic grahas at the given date (defaults to now).

```javascript
const sky = getSkySnapshot();
// sky.date           - Date object
// sky.ayanamsa       - Lahiri ayanamsa in degrees
// sky.moonPhase      - "New Moon" | "Waxing Crescent" | ... | "Waning Crescent"
// sky.moonIllumination - 0-100
// sky.planets        - { Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Rahu, Ketu }
```

Each planet object:
```javascript
{
  name: 'Moon',
  siderealLon: 188.3,        // 0-360 degrees
  rashi: { name: 'Libra', sanskrit: 'Tula', lord: 'Venus', ... },
  rashiDeg: 8.3,             // degrees within the sign (0-30)
  nakshatra: { name: 'Vishakha', deity: 'Indra and Agni', lord: 'Jupiter', ... },
  nakshatraPada: 1,          // 1-4
  retrograde: false
}
```

### `getAscendant({ date?, lat, lon })`

Compute the Vedic Ascendant (Lagna) for a location. The Ascendant determines the 1st house; all other houses follow in sequence.

```javascript
import { getAscendant } from 'vedic-ephemeris';

const lagna = getAscendant({
  date: new Date('1990-06-15T05:30:00Z'),
  lat: 10.5276,   // north positive
  lon: 76.2144,   // east positive
});
// lagna.siderealLon       - 0-360 degrees
// lagna.tropicalLon       - tropical longitude (before ayanamsa subtraction)
// lagna.rashi             - { name: 'Aquarius', sanskrit: 'Kumbha', lord: 'Saturn', ... }
// lagna.rashiDeg          - degrees within the sign (0-30)
// lagna.nakshatra         - { name: 'Dhanishtha', ... }
// lagna.nakshatraPada     - 1-4
// lagna.localSiderealTime - Local Sidereal Time in degrees
// lagna.ayanamsa          - Lahiri ayanamsa used
```

**Building a birth chart:**

```javascript
import { getSkySnapshot, getAscendant } from 'vedic-ephemeris';

const date = new Date('1990-06-15T05:30:00Z');
const sky = getSkySnapshot(date);
const lagna = getAscendant({ date, lat: 10.5276, lon: 76.2144 });

// Map planets to houses
for (const [name, planet] of Object.entries(sky.planets)) {
  const house = ((planet.rashi.index - lagna.rashi.index + 12) % 12) + 1;
  console.log(`${name} in ${planet.rashi.name} -> House ${house}`);
}
```

### `skyDataForPrompt(sky, ascendant?)`

Formats a sky snapshot as human-readable text, ideal for injecting into LLM prompts. Optionally includes the Ascendant:

```javascript
import { getSkySnapshot, getAscendant, skyDataForPrompt } from 'vedic-ephemeris';

const sky = getSkySnapshot();
const lagna = getAscendant({ lat: 10.5276, lon: 76.2144 });
const text = skyDataForPrompt(sky, lagna);
// "REAL ASTRONOMICAL DATA (calculated, not estimated):
//  Date: Sun, 08 Mar 2026 12:00:00 GMT
//  Moon Phase: Waning Gibbous (76% illumination)
//  Ascendant (Lagna): Meena (Pisces) 7.3 deg - Nakshatra: Uttara Bhadrapada pada 2
//
//  Surya (Sun): Kumbha (Aquarius) 23.8 deg - ...
//  ..."
```

### `nakshatraSignSpan(nakshatraIndex)`

Returns which zodiac signs a nakshatra spans. 9 of 27 nakshatras cross a sign boundary:

```javascript
import { nakshatraSignSpan } from 'vedic-ephemeris';

nakshatraSignSpan(15); // Vishakha
// [
//   { signIdx: 6, sign: { name: 'Libra', ... }, padas: [1, 2, 3] },
//   { signIdx: 7, sign: { name: 'Scorpio', ... }, padas: [4] }
// ]
```

### `lahiriAyanamsa(julianDay)`

Compute the Lahiri ayanamsa for any Julian Day.

### Data: `RASHIS`, `NAKSHATRAS`

Full data arrays with Sanskrit names, ruling deities, lords, and symbols.

## Accuracy

| Body | Method | Accuracy |
|------|--------|----------|
| Ascendant | Meeus ecliptic-horizon intersection | ~1 arcminute |
| Sun | Meeus Ch. 25 | ~1 arcminute |
| Moon | Meeus Ch. 47 (14 terms) | ~1 arcminute |
| Mercury, Venus | Heliocentric mean + parallax | ~0.5 degree |
| Mars, Jupiter, Saturn | Heliocentric mean + parallax | ~0.5 degree |
| Rahu/Ketu | Mean node regression | ~1 degree |
| Ayanamsa | Lahiri polynomial | ~0.01 degree |

For applications requiring arc-second precision (e.g., chart calculation for exact birth times), use Swiss Ephemeris. This library is designed for daily forecasts, content generation, and educational use.

## Use Cases

- **Birth chart (kundli) generators** - Lagna + planets + house mapping
- **Transit analysis** - "Saturn transiting 7th from Lagna"
- Vedic astrology apps and dashboards
- Daily panchang / nakshatra trackers
- AI-powered astrology content generation
- Muhurta timing and rising sign trackers
- Hindu calendar applications
- Educational tools for Jyotish students

## How It Works

**Planetary positions:**
1. Compute Julian Day from the input date
2. Calculate tropical (Western) longitude using Meeus algorithms
3. Subtract Lahiri ayanamsa to get sidereal (Vedic) longitude
4. Map sidereal longitude to rashi (sign) and nakshatra (lunar mansion)

**Ascendant (Lagna):**
1. Compute Greenwich Mean Sidereal Time (Meeus Ch. 12)
2. Add geographic longitude to get Local Sidereal Time
3. Calculate ecliptic-horizon intersection using latitude and obliquity
4. Subtract Lahiri ayanamsa for sidereal Ascendant
5. Map to rashi, nakshatra, and pada

## License

MIT - [Kalmanas](https://kalmanas.com)
