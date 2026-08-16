import json
from pathlib import Path
import matplotlib.pyplot as plt

base = Path(__file__).resolve().parent.parent
with (base / 'data' / 'audit-growth-distribution.json').open(encoding='utf-8') as f:
    audit = json.load(f)

boss = audit['bossPrepSummary']
waves = [row['wave'] for row in boss]
p10 = [row['optimisticTtkSec']['p10'] for row in boss]
p50 = [row['optimisticTtkSec']['p50'] for row in boss]
p90 = [row['optimisticTtkSec']['p90'] for row in boss]

plt.style.use('seaborn-v0_8-whitegrid')
fig, ax = plt.subplots(figsize=(10, 5.8), constrained_layout=True)
ax.fill_between(waves, p10, p90, color='#f6bd60', alpha=0.45, label='P10–P90 range')
ax.plot(waves, p50, color='#d1495b', marker='o', linewidth=2.8, label='Median')
ax.plot(waves, p10, color='#f4a261', linestyle=':', linewidth=1.5)
ax.plot(waves, p90, color='#f4a261', linestyle=':', linewidth=1.5)
ax.set_xticks(waves)
ax.set_xlabel('Boss wave')
ax.set_ylabel('Theoretical kill time (seconds)')
ax.set_title('Maron Hikou — boss time-to-kill spread')
ax.legend(loc='upper left')
ax.text(
    0.02,
    0.02,
    '100,000 full-kill/full-collection trials.\nEvery shot is assumed to hit; real exposure is longer.',
    transform=ax.transAxes,
    fontsize=9,
    bbox={'facecolor': 'white', 'alpha': 0.85, 'edgecolor': 'none'},
)
fig.savefig(base / 'assets' / 'maron_balance_audit_chart.png', dpi=200, bbox_inches='tight')
