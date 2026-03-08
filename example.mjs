import { getSkySnapshot, skyDataForPrompt, nakshatraSignSpan, NAKSHATRAS } from './index.mjs';

// --- Basic usage: get current planetary positions ---
const sky = getSkySnapshot();
console.log('=== Current Sky ===');
console.log(`Moon Phase: ${sky.moonPhase} (${sky.moonIllumination}%)`);
console.log(`Ayanamsa (Lahiri): ${sky.ayanamsa.toFixed(4)} deg\n`);

for (const [name, p] of Object.entries(sky.planets)) {
  const retro = p.retrograde ? ' [R]' : '';
  console.log(
    `${name.padEnd(8)} ${p.rashi.name.padEnd(12)} ${p.rashiDeg.toFixed(1).padStart(5)} deg  ` +
    `${p.nakshatra.name.padEnd(20)} pada ${p.nakshatraPada}${retro}`
  );
}

// --- Get positions for a specific date ---
console.log('\n=== Positions for Jan 1, 2026 UTC ===');
const sky2026 = getSkySnapshot(new Date('2026-01-01T00:00:00Z'));
const moon = sky2026.planets.Moon;
console.log(`Moon: ${moon.rashi.name} (${moon.rashi.sanskrit}) - ${moon.nakshatra.name} pada ${moon.nakshatraPada}`);

// --- Nakshatra sign spans ---
console.log('\n=== Nakshatras that span two signs ===');
for (const nak of NAKSHATRAS) {
  const span = nakshatraSignSpan(nak.index);
  if (span.length > 1) {
    const parts = span.map(g => `${g.sign.name} (padas ${g.padas.join(',')})`);
    console.log(`${nak.name.padEnd(20)} ${parts.join(' + ')}`);
  }
}

// --- Text output for LLM prompts ---
console.log('\n=== Sky data formatted for AI prompts ===');
console.log(skyDataForPrompt(sky));
