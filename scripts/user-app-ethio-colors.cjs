/**
 * Replace legacy cyan/purple “neon” accents with Ethio lemon + deep blue in trainee UI.
 * Scope: src/app/user, src/components/user (excludes *backup* paths).
 */
const fs = require('fs');
const path = require('path');

const roots = [
  path.join(__dirname, '../src/app/user'),
  path.join(__dirname, '../src/components/user'),
];

/** Longest / most specific first */
const REPLACEMENTS = [
  ['hover:from-cyan-600 hover:to-purple-700', 'hover:opacity-95'],
  ['hover:from-cyan-600 hover:to-blue-600', 'hover:opacity-95'],
  [
    'dark:from-cyan-500/10 dark:via-purple-500/10 dark:to-pink-500/10',
    'dark:from-[var(--ethio-lemon)]/12 dark:via-[var(--ethio-deep-blue)]/8 dark:to-transparent',
  ],
  [
    'from-cyan-500/10 via-purple-600/10 to-pink-500/10',
    'from-[var(--ethio-lemon)]/10 via-[var(--ethio-deep-blue)]/8 to-transparent',
  ],
  [
    'from-cyan-500/10 via-purple-500/10 to-pink-500/10',
    'from-[var(--ethio-lemon)]/10 via-[var(--ethio-deep-blue)]/8 to-transparent',
  ],
  [
    'from-cyan-500/10 via-purple-500/5 to-pink-500/10',
    'from-[var(--ethio-lemon)]/10 via-[var(--ethio-deep-blue)]/6 to-transparent',
  ],
  [
    'from-cyan-500/5 to-purple-600/5',
    'from-[var(--ethio-lemon)]/8 to-[var(--ethio-deep-blue)]/8',
  ],
  [
    'from-cyan-500/20 to-purple-600/20',
    'from-[var(--ethio-lemon)]/15 to-[var(--ethio-deep-blue)]/12',
  ],
  [
    'bg-gradient-to-r from-cyan-500/5 to-purple-600/5',
    'bg-gradient-to-r from-[var(--ethio-lemon)]/8 to-[var(--ethio-deep-blue)]/8',
  ],
  [
    'from-cyan-500/10 to-purple-500/10',
    'from-[var(--ethio-lemon)]/10 to-[var(--ethio-deep-blue)]/10',
  ],
  [
    'from-cyan-50/30 to-purple-50/30',
    'from-[var(--ethio-lemon)]/8 to-[var(--ethio-deep-blue)]/8',
  ],
  [
    'dark:from-cyan-900/10 dark:to-purple-900/10',
    'dark:from-[var(--ethio-lemon)]/8 dark:to-[var(--ethio-deep-blue)]/8',
  ],
  [
    'border-cyan-500/50 text-cyan-600 hover:bg-cyan-500/10',
    'border-[var(--ethio-deep-blue)]/40 text-[var(--ethio-lemon-dark)] hover:bg-[var(--ethio-lemon)]/10',
  ],
  [
    'bg-gradient-to-b from-cyan-500 via-purple-500 to-green-500',
    'bg-gradient-to-b from-[var(--ethio-lemon)] via-[var(--ethio-deep-blue)] to-[var(--ethio-lemon-dark)]',
  ],
  [
    'bg-gradient-to-b from-cyan-500 to-purple-500',
    'bg-gradient-to-b from-[var(--ethio-lemon)] to-[var(--ethio-deep-blue)]',
  ],
  [
    'bg-gradient-to-b from-green-500 to-cyan-500',
    'bg-gradient-to-b from-[var(--ethio-lemon)] to-[var(--ethio-deep-blue)]',
  ],
  [
    'bg-gradient-to-t from-cyan-500 via-purple-500 to-pink-500',
    'bg-gradient-to-t from-[var(--ethio-lemon)] via-[var(--ethio-deep-blue)] to-[var(--ethio-lemon-dark)]',
  ],
  [
    'hover:from-cyan-400 hover:via-purple-400 hover:to-pink-400',
    'hover:brightness-110',
  ],
  [
    'dark:from-cyan-500 dark:to-purple-600',
    'dark:from-[var(--ethio-lemon-dark)] dark:to-[var(--ethio-deep-blue)]',
  ],
  [
    'from-cyan-500 to-purple-600',
    'from-[var(--ethio-lemon)] to-[var(--ethio-deep-blue)]',
  ],
  [
    'from-cyan-500 to-blue-500',
    'from-[var(--ethio-lemon)] to-[var(--ethio-deep-blue)]',
  ],
  [
    'from-cyan-500 to-blue-600',
    'from-[var(--ethio-lemon)] to-[var(--ethio-deep-blue)]',
  ],
  [
    'from-cyan-400 to-purple-500',
    'from-[var(--ethio-lemon)] to-[var(--ethio-deep-blue)]',
  ],
  [
    'from-purple-500 to-blue-600',
    'from-[var(--ethio-lemon)] to-[var(--ethio-deep-blue)]',
  ],
  [
    'from-purple-600 to-blue-600',
    'from-[var(--ethio-lemon)] to-[var(--ethio-deep-blue)]',
  ],
  [
    'from-purple-500 to-pink-500',
    'from-[var(--ethio-lemon)] to-[var(--ethio-lemon-dark)]',
  ],
  [
    'from-cyan-500/10 via-purple-500/5 to-blue-500/10',
    'from-[var(--ethio-lemon)]/10 via-[var(--ethio-deep-blue)]/6 to-sky-500/5',
  ],
  [
    'from-cyan-500 to-purple-600',
    'from-[var(--ethio-lemon)] to-[var(--ethio-deep-blue)]',
  ],
  [
    'from-blue-500 to-cyan-600',
    'from-[var(--ethio-lemon)] to-[var(--ethio-deep-blue)]',
  ],
  ['group-hover:text-cyan-600', 'user-app-group-hover-text'],
  ['group-hover:text-cyan-500', 'user-app-group-hover-text'],
  ['hover:text-cyan-400', 'hover:text-[var(--ethio-lemon)]'],
  ['border-b-2 border-cyan-500', 'border-b-2 border-[var(--ethio-deep-blue)]'],
  [
    'border-purple-500 text-purple-500 hover:bg-purple-500/10',
    'border-[var(--ethio-deep-blue)]/45 text-[var(--ethio-lemon-dark)] hover:bg-[var(--ethio-lemon)]/10',
  ],
  [
    'border-cyan-500/50',
    'border-[var(--ethio-deep-blue)]/40',
  ],
  [
    'border-cyan-500/30',
    'border-[var(--ethio-deep-blue)]/30',
  ],
  [
    'border-cyan-500/20',
    'border-[var(--ethio-lemon)]/25',
  ],
  ['border-l-cyan-500', 'border-l-[var(--ethio-deep-blue)]'],
  ['text-cyan-600', 'text-[var(--ethio-lemon-dark)]'],
  ['text-cyan-500', 'text-[var(--ethio-lemon-dark)]'],
];

function walk(dir, acc) {
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    if (name.includes('backup')) continue;
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (/\.(tsx|ts|css)$/.test(name)) acc.push(p);
  }
  return acc;
}

let files = [];
for (const r of roots) walk(r, files);

let total = 0;
for (const file of files) {
  let s = fs.readFileSync(file, 'utf8');
  const orig = s;
  for (const [a, b] of REPLACEMENTS) {
    if (s.includes(a)) s = s.split(a).join(b);
  }
  if (s !== orig) {
    fs.writeFileSync(file, s, 'utf8');
    total++;
  }
}
console.log('Ethio color pass: %d files updated (of %d scanned)', total, files.length);
