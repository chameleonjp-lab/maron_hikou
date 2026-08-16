// マロン飛行 index.html の getWaveConfig / LOOT_DROP_TABLE / EXP_TABLE / UPGRADES を
// 監査専用に同値で再現する。前提は「全敵を撃破し、全戦利品を回収できた」楽観上限。

const TRIALS = 100_000;
const EXP_TABLE = [0, 5, 12, 22, 35, 51, 72, 98, 130, 168, 212, 265];
const MAX_LEVEL = 12;
const UPGRADES = [
  { id: 'bullet', max: 3, offense: true },
  { id: 'firerate', max: 4, offense: true },
  { id: 'piercing', max: 1, offense: true },
  { id: 'shield', max: 3, offense: false },
  { id: 'maxhp', max: 3, offense: false },
  { id: 'collectrange', max: 3, offense: false },
  { id: 'hitreduce', max: 2, offense: false },
];
const LOOT = {
  small: { drop: 0.175, values: [[1, 1]] },
  medium: { drop: 0.35, values: [[0.7, 1], [0.3, 3]] },
  large: { drop: 0.5, values: [[1, 3]] },
  boss: { drop: 1, values: [[1, 8]], count: 3 },
};

let s = 0x9e3779b9;
function random() { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) + 0.5) / 4294967296; }
function countForWave(w) {
  if (w % 5 === 0) {
    if (w === 5) return { boss: 1, small: 8 };
    if (w === 10) return { boss: 1, small: 12 };
    if (w === 15 || w === 20) return { boss: 1, medium: 6 };
    if (w === 25) return { boss: 1, large: 4 };
    return { boss: 1, medium: 4 };
  }
  if (w <= 4) return { small: (6 + (w - 1)) * 2 };
  if (w <= 9) return { small: (8 + (w - 6)) * 2, medium: (1 + Math.floor((w - 6) / 1.5)) * 2 };
  if (w <= 14) return { small: (11 + (w - 11)) * 2, medium: (3 + Math.floor((w - 11) / 2)) * 2, large: (1 + Math.floor((w - 11) / 3)) * 2 };
  if (w <= 19) return { small: 18, medium: (5 + Math.floor((w - 16) / 1.5)) * 2, large: (2 + Math.floor((w - 16) / 3)) * 2 };
  if (w <= 24) return { small: (12 + (w - 21)) * 2, medium: (5 + Math.floor((w - 21) / 1.2)) * 2, large: (2 + Math.floor((w - 21) / 2)) * 2 };
  return { small: (14 + Math.floor((w - 26) * 1.3)) * 2, medium: (6 + Math.floor((w - 26) / 1.5)) * 2, large: (3 + Math.floor((w - 26) / 3)) * 2 };
}
function drawLoot(type) {
  const conf = LOOT[type];
  let total = 0;
  const count = conf.count ?? 1;
  for (let i = 0; i < count; i++) {
    if (random() >= conf.drop) continue;
    let r = random();
    for (const [p, exp] of conf.values) { r -= p; if (r < 0) { total += exp; break; } }
  }
  return total;
}
function addUpgrade(counts) {
  const candidates = UPGRADES.filter((u) => counts[u.id] < u.max);
  if (candidates.length === 0) return;
  const pick = candidates[Math.floor(random() * candidates.length)];
  counts[pick.id] += 1;
}
function levelForExp(exp) {
  let level = 1;
  while (level < MAX_LEVEL && exp >= EXP_TABLE[level]) level += 1;
  return level;
}

const checkpoints = [5, 10, 15, 20, 25, 30];
const data = Object.fromEntries(checkpoints.map((w) => [w, { levels: [], exp: [], noOffense: 0, noSurvival: 0, dps: [] }]));
const BOSS_HP = { 5: 60, 10: 110, 15: 170, 20: 240, 25: 290, 30: 340 };
const bossPrep = Object.fromEntries(checkpoints.map((w) => [w, { levels: [], dps: [], noOffense: 0, ttk: [] }]));
const expectedXpByWave = [];
for (let w = 1; w <= 30; w++) {
  const composition = countForWave(w);
  let expected = 0;
  for (const [type, n] of Object.entries(composition)) {
    const conf = LOOT[type];
    const meanOne = conf.values.reduce((sum, [p, xp]) => sum + p * xp, 0) * conf.drop * (conf.count ?? 1);
    expected += n * meanOne;
  }
  expectedXpByWave.push({ wave: w, composition, expectedXp: Number(expected.toFixed(3)) });
}

for (let t = 0; t < TRIALS; t++) {
  let exp = 0;
  const counts = Object.fromEntries(UPGRADES.map((u) => [u.id, 0]));
  for (let w = 1; w <= 30; w++) {
    if (w % 5 === 0) {
      const offense = counts.bullet + counts.firerate + counts.piercing;
      const dps = 2.5 * (1 + counts.bullet) / Math.pow(0.85, counts.firerate);
      const prep = bossPrep[w];
      prep.levels.push(levelForExp(exp));
      prep.dps.push(dps);
      prep.ttk.push(BOSS_HP[w] / dps);
      if (offense === 0) prep.noOffense += 1;
    }
    for (const [type, n] of Object.entries(countForWave(w))) for (let i = 0; i < n; i++) exp += drawLoot(type);
    const priorLevel = levelForExp(exp - 0); // desired level after all newly collected loot
    const upgradeTotal = Object.values(counts).reduce((a, b) => a + b, 0);
    while (upgradeTotal + 1 <= priorLevel - 1 && Object.values(counts).reduce((a, b) => a + b, 0) < priorLevel - 1) addUpgrade(counts);
    if (checkpoints.includes(w)) {
      const offense = counts.bullet + counts.firerate + counts.piercing;
      const survival = counts.shield + counts.maxhp + counts.hitreduce;
      const dps = 2.5 * (1 + counts.bullet) / Math.pow(0.85, counts.firerate);
      const d = data[w];
      d.levels.push(priorLevel); d.exp.push(exp); d.dps.push(dps);
      if (offense === 0) d.noOffense += 1;
      if (survival === 0) d.noSurvival += 1;
    }
  }
}
function quantile(values, q) {
  const a = values.slice().sort((x, y) => x - y);
  return a[Math.floor((a.length - 1) * q)];
}
const summary = checkpoints.map((w) => {
  const d = data[w];
  return {
    wave: w,
    level: { p10: quantile(d.levels, .1), p50: quantile(d.levels, .5), p90: quantile(d.levels, .9) },
    exp: { p10: quantile(d.exp, .1), p50: quantile(d.exp, .5), p90: quantile(d.exp, .9) },
    dps: { p10: Number(quantile(d.dps, .1).toFixed(2)), p50: Number(quantile(d.dps, .5).toFixed(2)), p90: Number(quantile(d.dps, .9).toFixed(2)) },
    noOffenseProbability: Number((d.noOffense / TRIALS).toFixed(5)),
    noSurvivalProbability: Number((d.noSurvival / TRIALS).toFixed(5)),
  };
});
const bossPrepSummary = checkpoints.map((wave) => {
  const d = bossPrep[wave];
  return {
    wave,
    bossHp: BOSS_HP[wave],
    level: { p10: quantile(d.levels, .1), p50: quantile(d.levels, .5), p90: quantile(d.levels, .9) },
    dps: { p10: Number(quantile(d.dps, .1).toFixed(2)), p50: Number(quantile(d.dps, .5).toFixed(2)), p90: Number(quantile(d.dps, .9).toFixed(2)) },
    optimisticTtkSec: { p10: Number(quantile(d.ttk, .1).toFixed(1)), p50: Number(quantile(d.ttk, .5).toFixed(1)), p90: Number(quantile(d.ttk, .9).toFixed(1)) },
    noOffenseProbability: Number((d.noOffense / TRIALS).toFixed(5)),
  };
});
console.log(JSON.stringify({ trials: TRIALS, assumptions: '全敵撃破・全戦利品回収。敵弾回避失敗、戦利品の画面外消失、最大40個上限は含まない楽観上限。DPS/TTKは全弾命中の理論値。', expectedXpByWave, summary, bossPrepSummary }, null, 2));
