const fs = require('fs')
const path = require('path')
const root = path.join(__dirname, '../src/components/user')
function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name)
    if (fs.statSync(p).isDirectory()) walk(p, files)
    else if (name.endsWith('.tsx')) files.push(p)
  }
  return files
}
const reps = [
  ['text-[var(--neumorphic-muted)]', 'user-app-muted'],
  ['text-[var(--neumorphic-text)]', 'user-app-ink'],
  ['border-[var(--neumorphic-border)]', 'user-app-border'],
  ['hover:bg-[var(--neumorphic-hover)]', 'user-app-hover'],
  ['hover:text-[var(--neumorphic-accent)]', 'hover:opacity-90 dark:hover:text-cyan-300'],
  ['text-[var(--neumorphic-accent)]', 'user-app-link'],
  ['dark:text-[var(--neumorphic-accent)]', 'dark:text-cyan-400'],
  ['bg-[var(--neumorphic-surface)]', 'user-app-paper'],
  ['bg-[var(--neumorphic-bg)]', 'bg-slate-100 dark:bg-slate-800/70'],
  [
    "bg-[var(--neumorphic-surface)] hover:bg-[var(--neumorphic-hover)] text-[var(--neumorphic-text)]",
    'user-app-paper user-app-ink user-app-hover',
  ],
  [
    "bg-[var(--neumorphic-surface)] hover:bg-[var(--neumorphic-hover)] text-[var(--neumorphic-text)] shadow-",
    'user-app-paper user-app-ink user-app-hover shadow-',
  ],
  [
    "bg-[var(--neumorphic-surface)] shadow-[2px_2px_4px",
    'user-app-paper shadow-[2px_2px_4px',
  ],
  [
    "hover:bg-[var(--neumorphic-surface)]",
    'hover:user-app-paper',
  ],
  [
    "bg-[var(--neumorphic-bg)] hover:bg-[var(--neumorphic-surface)]",
    'bg-slate-100 user-app-hover dark:bg-slate-800/50 dark:hover:bg-slate-800',
  ],
]
let n = 0
for (const f of walk(root)) {
  let s = fs.readFileSync(f, 'utf8')
  const o = s
  for (const [a, b] of reps) s = s.split(a).join(b)
  if (s !== o) {
    fs.writeFileSync(f, s)
    n++
  }
}
console.log('User components updated:', n, 'files')
