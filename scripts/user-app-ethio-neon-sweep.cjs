const fs = require('fs');
const path = require('path');

const roots = [
  path.join(__dirname, '../src/app/user'),
  path.join(__dirname, '../src/components/user'),
];

const REPLACEMENTS = [
  [
    'from-[var(--color-cyber-blue)]/20 to-[var(--color-neon-magenta)]/20',
    'from-[var(--ethio-lemon)]/20 to-[var(--ethio-deep-blue)]/20',
  ],
  [
    'from-[var(--color-cyber-blue)]/10 to-[var(--color-neon-magenta)]/10',
    'from-[var(--ethio-lemon)]/10 to-[var(--ethio-deep-blue)]/10',
  ],
  [
    'from-[var(--color-cyber-blue)] to-[var(--color-neon-magenta)]',
    'from-[var(--ethio-lemon)] to-[var(--ethio-deep-blue)]',
  ],
  [
    'from-[var(--color-neon-magenta)] to-[var(--color-cyber-blue)]',
    'from-[var(--ethio-lemon)] to-[var(--ethio-deep-blue)]',
  ],
  [
    'from-[var(--color-cyber-blue)]/10 to-blue-600',
    'from-[var(--ethio-lemon)]/10 to-[var(--ethio-deep-blue)]',
  ],
  [
    'from-[var(--color-cyber-blue)] to-blue-600',
    'from-[var(--ethio-lemon)] to-[var(--ethio-deep-blue)]',
  ],
  [
    'from-[var(--color-neon-magenta)] to-pink-600',
    'from-[var(--ethio-lemon)] to-[var(--ethio-deep-blue)]',
  ],
  [
    'from-[var(--color-neon-magenta)] to-purple-600',
    'from-[var(--ethio-lemon)] to-[var(--ethio-deep-blue)]',
  ],
  [
    'from-[var(--color-cyber-blue)] to-[var(--color-neon-magenta)]',
    'from-[var(--ethio-lemon)] to-[var(--ethio-deep-blue)]',
  ],
  ['text-[var(--color-cyber-blue)]', 'text-[var(--ethio-deep-blue)]'],
  ['text-[var(--color-neon-magenta)]', 'text-[var(--ethio-lemon-dark)]'],
  ['border-[var(--color-cyber-blue)]', 'border-[var(--ethio-deep-blue)]'],
  [
    'focus:ring-[var(--color-cyber-blue)]/50',
    'focus:ring-[var(--ethio-deep-blue)]/50',
  ],
  [
    'border-b-2 border-[var(--color-cyber-blue)]',
    'border-b-2 border-[var(--ethio-deep-blue)]',
  ],
  [
    'bg-gradient-to-br from-[var(--color-cyber-blue)] to-[var(--color-neon-magenta)]',
    'bg-gradient-to-br from-[var(--ethio-lemon)] to-[var(--ethio-deep-blue)]',
  ],
  [
    'group-hover:text-[var(--color-cyber-blue)]',
    'group-hover:text-[var(--ethio-lemon-dark)]',
  ],
  [
    'stopColor="var(--color-neon-magenta)"',
    'stopColor="var(--ethio-lemon)"',
  ],
  [
    'stopColor="var(--color-cyber-blue)"',
    'stopColor="var(--ethio-deep-blue)"',
  ],
  [
    "stopColor='var(--color-neon-magenta)'",
    "stopColor='var(--ethio-lemon)'",
  ],
  [
    "stopColor='var(--color-cyber-blue)'",
    "stopColor='var(--ethio-deep-blue)'",
  ],
  [
    "stroke: 'var(--color-neon-magenta)'",
    "stroke: 'var(--ethio-lemon)'",
  ],
  [
    "stroke: 'var(--color-cyber-blue)'",
    "stroke: 'var(--ethio-deep-blue)'",
  ],
  ['stroke="var(--color-neon-magenta)"', 'stroke="var(--ethio-lemon)"'],
  ['stroke="var(--color-cyber-blue)"', 'stroke="var(--ethio-deep-blue)"'],
  ['fill: \'var(--color-cyber-blue)\'', "fill: 'var(--ethio-deep-blue)'"],
  [
    "dot={{ fill: 'var(--color-cyber-blue)', r: 4 }}",
    "dot={{ fill: 'var(--ethio-deep-blue)', r: 4 }}",
  ],
  [
    'shadow-[0_0_20px_rgba(0,230,255,0.3)]',
    'shadow-[0_0_20px_rgba(142,198,63,0.28)]',
  ],
  [
    'shadow-[0_0_15px_rgba(0,230,255,0.2)]',
    'shadow-[0_0_12px_rgba(142,198,63,0.2)]',
  ],
];

function walk(dir, acc) {
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    if (name.includes('backup')) continue;
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (/\.(tsx|ts)$/.test(name)) acc.push(p);
  }
}

let files = [];
for (const r of roots) walk(r, files);

let n = 0;
for (const file of files) {
  let s = fs.readFileSync(file, 'utf8');
  const o = s;
  for (const [a, b] of REPLACEMENTS) {
    if (s.includes(a)) s = s.split(a).join(b);
  }
  if (s !== o) {
    fs.writeFileSync(file, s, 'utf8');
    n++;
  }
}
console.log('Neon → Ethio sweep: %d files', n);
