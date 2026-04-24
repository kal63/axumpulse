const fs = require('fs')
const path = require('path')
const root = path.join(__dirname, '../src/app/user')
function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name)
    if (fs.statSync(p).isDirectory()) walk(p, files)
    else if (name.endsWith('.tsx')) files.push(p)
  }
  return files
}
const reps = [
  ['border-[var(--neumorphic-muted)]/20', 'border-slate-200/50 dark:border-slate-600/40'],
  [
    'bg-[var(--neumorphic-bg)] hover:bg-[var(--neumorphic-inset)] user-app-ink',
    'bg-slate-100 user-app-ink hover:bg-slate-200/90 dark:bg-slate-800 dark:hover:bg-slate-700/80',
  ],
  [
    'user-app-paper user-app-ink border border-[var(--neumorphic-muted)]/20',
    'user-app-paper user-app-ink border border-slate-200/60 dark:border-slate-600/50',
  ],
  ['user-app-paper hover:bg-[var(--neumorphic-bg)]', 'user-app-paper user-app-hover'],
  ['stroke="var(--neumorphic-border)"', 'stroke="#e2e8f0"'],
  ['bg-[var(--neumorphic-border)] opacity-30', 'bg-slate-200 opacity-30 dark:bg-slate-600'],
  ['hover:text-[var(--neumorphic-accent-hover)]', 'hover:opacity-90'],
  ['p-8 rounded-2xl bg-[var(--neumorphic-bg)] shadow-sm', 'user-app-surface p-8 shadow-sm'],
  ['bg-[var(--neumorphic-accent)]', 'bg-[var(--ethio-deep-blue)]'],
  ['px-3 py-1 bg-[var(--neumorphic-bg)] border', 'px-3 py-1 border bg-slate-100 dark:bg-slate-800'],
  [
    'w-full bg-[var(--neumorphic-bg)] rounded-full h-3 mb-2',
    'mb-2 h-3 w-full rounded-full bg-slate-200 dark:bg-slate-700',
  ],
  [
    'w-full bg-[var(--neumorphic-bg)] rounded-full h-3',
    'h-3 w-full rounded-full bg-slate-200 dark:bg-slate-700',
  ],
]
let n = 0
for (const file of walk(root)) {
  let s = fs.readFileSync(file, 'utf8')
  const o = s
  for (const [a, b] of reps) s = s.split(a).join(b)
  if (s !== o) {
    fs.writeFileSync(file, s)
    n++
  }
}
console.log('Patched', n, 'files')
