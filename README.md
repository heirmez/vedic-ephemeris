# vedic-ephemeris

Lightweight Vedic (sidereal) ephemeris for JavaScript. Computes real-time planetary positions using Jean Meeus algorithms with Lahiri ayanamsa. **Zero dependencies.**

Used in production at [Kalmanas](https://kalmanas.com) - a Vedic astrology platform.

## Features

- **9 grahas**: Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Rahu, Ketu
- **Sidereal positions** with Lahiri ayanamsa (accurate to ~1 arcminute for Sun/Moon)
- **27 nakshatras** with pada calculation
- **12 rashis** (zodiac signs) with degree position
- **Retrograde detection** for all planets
- **Moon phase** name and illumination percentage
- **Conjunction detection** (planets within 5 degrees)
- **Nakshatra sign spans** - knows which nakshatras cross rashi boundaries
- **LLM-ready** text formatter for AI prompt injection
- Pure ESM, zero dependencies, ~350 lines

## Install

```bash
npm install vedic-ephemeris
```

Or just copy `index.mjs` into your project.

## Quick Start

```javascript
import { getSkySnapshot } from 'vedic-ephemeris';

const sky = getSkySnapshot(); // current positions
// or: getSkySnapshot(new Date('2026-03-08T12:00:00Z'))

console.log(sky.moonPhase);          // "Waxing Gibbous"
console.log(sky.moonIllumination);   // 72

const moon = sky.planets.Moon;
console.log(moon.rashi.name);        // "Libra"
console.log(moon.rashi.sanskrit);    // "Tula"
console.log(moon.nakshatra.name);    // "Vishakha"
console.log(moon.nakshatraPada);     // 1
console.log(moon.rashiDeg);          // 8.3  (degrees within the sign)
console.log(moon.siderealLon);       // 188.3 (absolute sidereal longitude)
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

### `skyDataForPrompt(sky)`

Formats a sky snapshot as human-readable text, ideal for injecting into LLM prompts:

```javascript
import { getSkySnapshot, skyDataForPrompt } from 'vedic-ephemeris';

const text = skyDataForPrompt(getSkySnapshot());
// "REAL ASTRONOMICAL DATA (calculated, not estimated):
//  Date: Sun, 08 Mar 2026 12:00:00 GMT
//  Moon Phase: Waxing Gibbous (72% illumination)
//
//  Surya (Sun): Kumbha (Aquarius) 22.8 deg - Nakshatra: Purva Bhadrapada pada 2
//  Chandra (Moon): Tula (Libra) 8.3 deg - Nakshatra: Vishakha pada 1 [spans Libra and Scorpio]
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
| Sun | Meeus Ch. 25 | ~1 arcminute |
| Moon | Meeus Ch. 47 (14 terms) | ~1 arcminute |
| Mercury, Venus | Heliocentric mean + parallax | ~0.5 degree |
| Mars, Jupiter, Saturn | Heliocentric mean + parallax | ~0.5 degree |
| Rahu/Ketu | Mean node regression | ~1 degree |
| Ayanamsa | Lahiri polynomial | ~0.01 degree |

For applications requiring arc-second precision (e.g., chart calculation for exact birth times), use Swiss Ephemeris. This library is designed for daily forecasts, content generation, and educational use.

## Use Cases

- Vedic astrology apps and dashboards
- Daily panchang / nakshatra trackers
- AI-powered astrology content generation
- Hindu calendar applications
- Educational tools for Jyotish students

## How It Works

1. Compute Julian Day from the input date
2. Calculate tropical (Western) longitude using Meeus algorithms
3. Subtract Lahiri ayanamsa to get sidereal (Vedic) longitude
4. Map sidereal longitude to rashi (sign) and nakshatra (lunar mansion)

## License

MIT - [Kalmanas](https://kalmanas.com)
