# 弦理論 (String Theory) Portfolio Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the portfolio's visual shell around three interactive "strings" (程式碼/網球/音樂) on a dark stage — pluckable, audible, scroll-linked — while keeping the entire data/content layer untouched.

**Architecture:** A fixed full-viewport SVG layer (`StringStage`) renders 3 vertical strings with spring physics driven by one rAF loop; pointer proximity bends them, release vibrates them and triggers Web-Audio-synthesized sounds; plucking navigates to the string's home section. Content stays a normal scrolling page (Lenis smooth scroll + GSAP ScrollTrigger kinetic reveals). The dark restyle is achieved by redefining the existing Tailwind color tokens (`bg`, `ink`, `seal`, …) in the CDN config so most components go dark without touching their classNames.

**Tech Stack:** React 19, TypeScript, Vite 5, Tailwind CDN (runtime config in `index.html`), GSAP 3 + ScrollTrigger, Lenis, Web Audio API (synthesized — no audio files), GitHub Pages.

## Global Constraints

- Keep: React 19, Vite, `base: '/'`, `data/` layer, `utils/markdownLoader.ts`, `contexts/LanguageContext.tsx`, `components/MarkdownRenderer.tsx`, `components/SEO.tsx` structure, bilingual zh-TW/en, KaTeX blog pipeline, `.github/workflows/deploy.yml`.
- New dependencies: **only** `gsap` and `lenis`. No Three.js, no Framer Motion, no Tailwind build migration, no audio asset files (all sounds synthesized).
- Keep existing Tailwind **token names** (`bg`, `surface`, `ink`, `sub`, `accent`, `seal`, `line`, `highlight`) — only their values change to dark-stage values. New tokens: `str-code`, `str-tennis`, `str-music`.
- String identity map (used everywhere): code = `#7DB5FF` → `#projects`, tennis = `#C8F542` → `#about`, music = `#F0B45C` → `#contact`.
- `prefers-reduced-motion: reduce` must disable: Lenis, string physics loop, GSAP reveals (content simply visible). Pluck-to-navigate must still work via click.
- Sound: only plays after browser-permitted user gesture; mute toggle persisted in `localStorage` key `sound-muted`.
- This repo has no test framework — **do not add one**. Every task's verify step is `npm run build` (must exit 0) plus listed manual checks in `npm run dev`. Non-trivial pure logic (audio synth, physics constants) carries inline self-checks described in its task.
- Text contrast on `bg` must stay ≥ 4.5:1 (values chosen below satisfy this).
- Commit after every task. Do not push.

---

### Task 1: Dark-stage theme flip + `index.html` cleanup + dead file removal

**Files:**
- Modify: `index.html`
- Modify: `metadata.json`
- Delete: `components/AcademicWorkSection.tsx` (not imported by `App.tsx`), `data/blog.ts` (empty), `data/projects.ts` (empty)

**Interfaces:**
- Produces: Tailwind tokens `bg #0A0A0C`, `surface #141417`, `ink #ECECE8`, `sub #98988F`, `accent #B8E05A`, `seal #F4635E`, `line #232328`, `highlight #EBD863`, `str-code #7DB5FF`, `str-tennis #C8F542`, `str-music #F0B45C`; keyframe/animation `string-tighten`. All later tasks rely on these exact names.

- [ ] **Step 1: Verify the dead files are actually dead**

Run: `grep -rn "AcademicWorkSection\|data/blog\|data/projects" --include="*.tsx" --include="*.ts" . | grep -v node_modules | grep -v dist`
Expected: only the files' own definitions and `components/AcademicWorkSection.tsx` self-references — no imports from `App.tsx` or other components. If anything imports them, keep that file and note it; otherwise delete all three:

```bash
rm components/AcademicWorkSection.tsx data/blog.ts data/projects.ts
```

- [ ] **Step 2: Replace the Tailwind config colors and add the preloader keyframe in `index.html`**

In the `tailwind.config` inline script, replace the `colors` block with:

```js
colors: {
  bg: '#0A0A0C',        // Stage black
  surface: '#141417',   // Lifted panel
  ink: '#ECECE8',       // Chalk white (text)
  sub: '#98988F',       // Dimmed text
  accent: '#B8E05A',    // Lime accent
  seal: '#F4635E',      // Hot cinnabar (kept name, dark-tuned)
  line: '#232328',      // Hairline border
  highlight: '#EBD863', // Yellow pop (unchanged)
  'str-code': '#7DB5FF',
  'str-tennis': '#C8F542',
  'str-music': '#F0B45C',
},
```

Add to the existing `animation` object:

```js
'string-tighten': 'stringTighten 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards',
```

Add to the existing `keyframes` object:

```js
stringTighten: {
  '0%': { transform: 'scaleY(0)', opacity: '0' },
  '100%': { transform: 'scaleY(1)', opacity: '1' }
},
```

- [ ] **Step 3: Clean up `index.html` head/body**

- Delete the entire `<script type="importmap">…</script>` block (leftover scaffolding; Vite bundles everything — the esm.sh map is a latent version-conflict bug).
- Remove `class="scroll-smooth"` from `<html>` (conflicts with Lenis).
- In the inline `<style>`: change `body { background-color: #F9F8F4; color: #2C2C2C; cursor: crosshair; }` to `body { background-color: #0A0A0C; color: #ECECE8; cursor: crosshair; }` and change the scrollbar thumb to `::-webkit-scrollbar-thumb { background: #232328; border-radius: 10px; }`.
- Update SEO copy (keep URLs/structure): `<title>Yen-Chia Chen | 弦理論 String Theory</title>`; meta description and both og:/twitter: descriptions to `"Portfolio of Yen-Chia Chen — ML engineer, tennis player, musician. Three strings, one stage: an interactive string-theory portfolio."`; og:/twitter: titles to `"Yen-Chia Chen | String Theory"`.

- [ ] **Step 4: Update `metadata.json`**

```json
{
  "name": "Yen-Chia Chen | String Theory Portfolio",
  "description": "A dark-stage interactive portfolio built on the 弦理論 metaphor: three pluckable strings — code, tennis, music — with spring physics, synthesized sound, and scroll-linked kinetic reveals.",
  "requestFramePermissions": []
}
```

- [ ] **Step 5: Verify build + visual smoke test**

Run: `npm run build`
Expected: exit 0.
Run: `npm run dev` → open the page.
Expected: site renders dark. Contrast will be broken in spots (`bg-white` cards, `text-white` on light) — that is expected; section tasks fix it. Confirm no console errors about the removed importmap/files.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: dark stage theme tokens, index.html cleanup, remove dead files"
```

---

### Task 2: Install gsap + lenis, wire smooth scroll and the scroll utility

**Files:**
- Modify: `package.json` (via npm install)
- Create: `utils/scroll.ts`
- Modify: `App.tsx`

**Interfaces:**
- Produces: `setLenis(lenis)` and `scrollToSection(selector: string): void` from `utils/scroll.ts`; `gsap.registerPlugin(ScrollTrigger)` done once in `App.tsx`. Tasks 4, 6, 7 rely on `scrollToSection` and on ScrollTrigger being registered.

- [ ] **Step 1: Install dependencies**

Run: `npm install gsap lenis`
Expected: both added to `dependencies`, install succeeds.

- [ ] **Step 2: Create `utils/scroll.ts`**

```ts
import type Lenis from 'lenis';

let lenis: Lenis | null = null;

export const setLenis = (l: Lenis | null) => { lenis = l; };

export const scrollToSection = (selector: string) => {
  if (lenis) {
    lenis.scrollTo(selector, { offset: -72, duration: 1.4 });
  } else {
    // reduced-motion / fallback path
    document.querySelector(selector)?.scrollIntoView({ behavior: 'auto', block: 'start' });
  }
};
```

- [ ] **Step 3: Wire Lenis + ScrollTrigger in `App.tsx`**

Add imports at top:

```tsx
import { useEffect } from 'react'; // merge into existing react import
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { setLenis } from './utils/scroll';

gsap.registerPlugin(ScrollTrigger);
```

Inside `function App()` add:

```tsx
useEffect(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const lenis = new Lenis();
  setLenis(lenis);
  lenis.on('scroll', ScrollTrigger.update);
  const tick = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  return () => {
    gsap.ticker.remove(tick);
    lenis.destroy();
    setLenis(null);
  };
}, []);
```

- [ ] **Step 4: Verify**

Run: `npm run build` → exit 0.
Run: `npm run dev` → scrolling feels inertial/smooth (clearly different from native). With macOS "Reduce Motion" enabled (System Settings → Accessibility → Display), scrolling is native.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json utils/scroll.ts App.tsx
git commit -m "feat: add gsap + lenis smooth scroll infrastructure"
```

---

### Task 3: Synthesized string audio module

**Files:**
- Create: `utils/stringAudio.ts`

**Interfaces:**
- Produces: `playSound(kind: 'key' | 'ball' | 'pluck', intensity?: number): void`, `toggleMute(): boolean`, `isMuted(): boolean`, `armAudio(): void`. Task 4 calls `playSound`/`armAudio`; Task 7's Navbar calls `toggleMute`/`isMuted`.

- [ ] **Step 1: Create `utils/stringAudio.ts`**

```ts
// Synthesized sounds for the three strings — no audio assets.
// 'pluck' = Karplus-Strong guitar string, 'ball' = tennis thump, 'key' = keyboard click.

export type SoundKind = 'key' | 'ball' | 'pluck';

let ctx: AudioContext | null = null;
let muted = typeof localStorage !== 'undefined' && localStorage.getItem('sound-muted') === '1';
let pluckBuf: AudioBuffer | null = null;
let noiseBuf: AudioBuffer | null = null;
const lastPlayed: Record<SoundKind, number> = { key: 0, ball: 0, pluck: 0 };

// Browsers only allow AudioContext creation/resume inside a user gesture
// (click/touch/keydown — NOT pointermove). Call this from a gesture handler.
export const armAudio = () => {
  if (!ctx) {
    try { ctx = new AudioContext(); } catch { return; }
  }
  if (ctx.state === 'suspended') void ctx.resume();
};

export const isMuted = () => muted;
export const toggleMute = (): boolean => {
  muted = !muted;
  localStorage.setItem('sound-muted', muted ? '1' : '0');
  return muted;
};

// Karplus-Strong plucked string synthesis
const makePluck = (ac: AudioContext, freq: number, dur = 1.2): AudioBuffer => {
  const sr = ac.sampleRate;
  const N = Math.round(sr / freq);
  const len = Math.round(sr * dur);
  const buf = ac.createBuffer(1, len, sr);
  const out = buf.getChannelData(0);
  const ring = new Float32Array(N);
  for (let i = 0; i < N; i++) ring[i] = Math.random() * 2 - 1;
  let idx = 0;
  for (let i = 0; i < len; i++) {
    const next = (idx + 1) % N;
    ring[idx] = (ring[idx] + ring[next]) * 0.498;
    out[i] = ring[idx];
    idx = next;
  }
  return buf;
};

const makeNoise = (ac: AudioContext, dur: number): AudioBuffer => {
  const len = Math.round(ac.sampleRate * dur);
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  return buf;
};

export const playSound = (kind: SoundKind, intensity = 1) => {
  if (muted || !ctx || ctx.state !== 'running') return;
  const now = performance.now();
  if (now - lastPlayed[kind] < 120) return; // rate limit
  lastPlayed[kind] = now;

  const t = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.value = 0.22 * Math.min(1, Math.max(0.15, intensity));
  master.connect(ctx.destination);

  if (kind === 'pluck') {
    pluckBuf ||= makePluck(ctx, 196); // G3
    const src = ctx.createBufferSource();
    src.buffer = pluckBuf;
    src.connect(master);
    src.start(t);
  } else if (kind === 'ball') {
    const osc = ctx.createOscillator();
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.12);
    const env = ctx.createGain();
    env.gain.setValueAtTime(1, t);
    env.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
    osc.connect(env).connect(master);
    osc.start(t); osc.stop(t + 0.18);
    noiseBuf ||= makeNoise(ctx, 0.05);
    const snap = ctx.createBufferSource();
    snap.buffer = noiseBuf;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 1800;
    const snapEnv = ctx.createGain();
    snapEnv.gain.value = 0.5;
    snap.connect(hp).connect(snapEnv).connect(master);
    snap.start(t);
  } else { // 'key'
    noiseBuf ||= makeNoise(ctx, 0.05);
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 2600; bp.Q.value = 2;
    src.connect(bp).connect(master);
    src.start(t);
  }
};
```

- [ ] **Step 2: Verify build and audible self-check**

Run: `npm run build` → exit 0.
Temporary check in `npm run dev`: in the browser console run:

```js
const m = await import('/utils/stringAudio.ts');
m.armAudio(); m.playSound('pluck'); 
setTimeout(() => m.playSound('ball'), 800);
setTimeout(() => m.playSound('key'), 1600);
```

Expected: guitar pluck, then a thump+snap, then a short click. (Console execution counts as a gesture.) No code changes needed for this check.

- [ ] **Step 3: Commit**

```bash
git add utils/stringAudio.ts
git commit -m "feat: web-audio synthesized string sounds (karplus-strong, thump, click)"
```

---

### Task 4: StringStage — the interactive string layer

**Files:**
- Create: `components/StringStage.tsx`
- Modify: `App.tsx` (mount it)

**Interfaces:**
- Consumes: `playSound`, `armAudio` (Task 3); `scrollToSection` (Task 2).
- Produces: `<StringStage />` component and exported `STRINGS: StringDef[]` where `StringDef = { id: 'code'|'tennis'|'music'; x: number; color: string; target: string; sound: 'key'|'ball'|'pluck' }`. Task 6 (StageIntro labels) imports `STRINGS`.

- [ ] **Step 1: Create `components/StringStage.tsx`**

```tsx
import React, { useEffect, useRef } from 'react';
import { playSound, armAudio, SoundKind } from '../utils/stringAudio';
import { scrollToSection } from '../utils/scroll';

export interface StringDef {
  id: 'code' | 'tennis' | 'music';
  x: number;          // fraction of viewport width
  color: string;
  target: string;     // home section anchor
  sound: SoundKind;
}

export const STRINGS: StringDef[] = [
  { id: 'code',   x: 0.08, color: '#7DB5FF', target: '#projects', sound: 'key' },
  { id: 'tennis', x: 0.50, color: '#C8F542', target: '#about',    sound: 'ball' },
  { id: 'music',  x: 0.92, color: '#F0B45C', target: '#contact',  sound: 'pluck' },
];

const GRAB_RADIUS = 48;   // px — pointer capture distance
const MAX_PULL = 90;      // px — max bend
const SPRING_K = 4000;    // 1/s² → ~10 Hz visible vibration
const DAMPING = 4;        // 1/s  → ~0.5 s decay
const SOUND_MIN = 12;     // px — min displacement to make sound on release

type SState = {
  disp: number;     // control-point x offset from rest
  vel: number;
  grabY: number;    // y where the pointer bends the string
  inZone: boolean;
  active: boolean;  // current scroll section belongs to this string
};

export const StringStage: React.FC = () => {
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const glowRefs = useRef<(SVGPathElement | null)[]>([]);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const states: SState[] = STRINGS.map(() => ({
      disp: 0, vel: 0, grabY: window.innerHeight / 2, inZone: false, active: false,
    }));
    let vw = window.innerWidth;
    let vh = window.innerHeight;
    const onResize = () => { vw = window.innerWidth; vh = window.innerHeight; drawAll(); };

    const draw = (i: number) => {
      const sx = STRINGS[i].x * vw;
      const s = states[i];
      const d = `M ${sx} 0 Q ${sx + s.disp} ${s.grabY} ${sx} ${vh}`;
      pathRefs.current[i]?.setAttribute('d', d);
      const glow = glowRefs.current[i];
      if (glow) {
        glow.setAttribute('d', d);
        glow.style.opacity = String(Math.min(0.7, Math.abs(s.disp) / MAX_PULL));
      }
      const base = pathRefs.current[i];
      if (base) base.style.opacity = s.active ? '0.9' : '0.4';
    };
    const drawAll = () => STRINGS.forEach((_, i) => draw(i));

    // --- physics loop (single rAF, early-out when idle) ---
    let last = performance.now();
    let raf = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.032, (now - last) / 1000);
      last = now;
      for (let i = 0; i < states.length; i++) {
        const s = states[i];
        if (s.inZone) continue; // pointer is holding the bend
        if (Math.abs(s.disp) < 0.15 && Math.abs(s.vel) < 2) {
          if (s.disp !== 0) { s.disp = 0; s.vel = 0; draw(i); }
          continue; // ponytail: loop always on, ~free when idle
        }
        // semi-implicit Euler (stable for ω·dt < 2)
        s.vel += (-SPRING_K * s.disp - DAMPING * s.vel) * dt;
        s.disp += s.vel * dt;
        draw(i);
      }
    };

    const release = (i: number) => {
      const s = states[i];
      s.inZone = false;
      if (Math.abs(s.disp) >= SOUND_MIN) {
        playSound(STRINGS[i].sound, Math.abs(s.disp) / MAX_PULL);
      }
    };

    const onMove = (e: PointerEvent) => {
      for (let i = 0; i < STRINGS.length; i++) {
        const sx = STRINGS[i].x * vw;
        const s = states[i];
        const dist = e.clientX - sx;
        if (Math.abs(dist) < GRAB_RADIUS) {
          s.inZone = true;
          s.vel = 0;
          s.disp = Math.max(-MAX_PULL, Math.min(MAX_PULL, dist));
          s.grabY = e.clientY;
          draw(i);
        } else if (s.inZone) {
          release(i);
        }
      }
    };

    const isInteractive = (t: EventTarget | null) =>
      t instanceof Element && !!t.closest('a, button, input, textarea, select, [role="button"]');

    const onDown = (e: PointerEvent) => {
      armAudio(); // gesture: safe to create/resume AudioContext
      if (isInteractive(e.target)) return;
      for (let i = 0; i < STRINGS.length; i++) {
        const sx = STRINGS[i].x * vw;
        if (Math.abs(e.clientX - sx) < GRAB_RADIUS / 2) {
          const s = states[i];
          s.grabY = e.clientY;
          s.inZone = false;
          s.vel = (e.clientX >= sx ? 1 : -1) * 3000; // hard pluck
          playSound(STRINGS[i].sound, 1);
          window.setTimeout(() => scrollToSection(STRINGS[i].target), 250);
          break;
        }
      }
    };

    // Active-section highlight + gentle impulse when a section scrolls in
    const observers: IntersectionObserver[] = [];
    STRINGS.forEach((def, i) => {
      const el = document.querySelector(def.target);
      if (!el) return;
      const io = new IntersectionObserver(
        (entries) => entries.forEach((en) => {
          const s = states[i];
          const was = s.active;
          s.active = en.isIntersecting;
          if (!was && en.isIntersecting && !reduced) s.vel += 800;
          draw(i);
        }),
        { rootMargin: '-40% 0px -40% 0px' }
      );
      io.observe(el);
      observers.push(io);
    });

    window.addEventListener('resize', onResize);
    window.addEventListener('pointerdown', onDown);
    if (!reduced) {
      window.addEventListener('pointermove', onMove);
      raf = requestAnimationFrame(loop);
    }
    drawAll();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      observers.forEach((o) => o.disconnect());
    };
  }, []);

  return (
    <svg
      className="fixed inset-0 w-full h-full z-[60] pointer-events-none"
      aria-hidden="true"
    >
      {STRINGS.map((s, i) => (
        <g key={s.id}>
          <path
            ref={(el) => { glowRefs.current[i] = el; }}
            stroke={s.color} strokeWidth={6} fill="none"
            style={{ filter: 'blur(6px)', opacity: 0 }}
          />
          <path
            ref={(el) => { pathRefs.current[i] = el; }}
            stroke={s.color} strokeWidth={1.25} fill="none"
            style={{ opacity: 0.4, transition: 'opacity 0.6s' }}
          />
        </g>
      ))}
    </svg>
  );
};
```

- [ ] **Step 2: Mount in `App.tsx`**

Import `StringStage` and render it as the first child inside the main content `<div>` (the one with `min-h-screen`), before `<Navbar />`:

```tsx
import { StringStage } from './components/StringStage';
// inside the main div:
<StringStage />
```

- [ ] **Step 3: Verify**

Run: `npm run build` → exit 0.
In `npm run dev`:
- Three vertical colored lines (blue left, chartreuse center, amber right) span the viewport at 40% opacity.
- Moving the cursor across a string bends it, and leaving the capture zone makes it vibrate visibly (~10Hz, ~0.5s decay) with a glow flash.
- After clicking anywhere once (audio armed), crossing a string produces its sound; center string thumps, left clicks, right plucks.
- Clicking directly on a string hard-plucks it and smooth-scrolls to its section.
- Clicking a nav link that overlaps a string does NOT pluck (interactive-element guard).
- With Reduce Motion on: static lines, no bend; click on string still navigates.

- [ ] **Step 4: Commit**

```bash
git add components/StringStage.tsx App.tsx
git commit -m "feat: StringStage interactive string layer with physics, sound, pluck navigation"
```

---

### Task 5: StageIntro (replaces HeroSection) + Preloader redesign + locale keys

**Files:**
- Create: `components/StageIntro.tsx`
- Delete: `components/HeroSection.tsx`
- Modify: `App.tsx` (swap component)
- Modify: `components/Preloader.tsx` (full replace)
- Modify: `data/locales.ts` (add `stage` keys to both languages)

**Interfaces:**
- Consumes: `STRINGS` (Task 4), `useLanguage` (existing), `string-tighten` animation (Task 1).
- Produces: `<StageIntro />` rendered at `id="hero"`. Preloader keeps its existing prop contract: `{ onComplete: () => void }`.

- [ ] **Step 1: Add locale keys**

In `data/locales.ts`, inside the `zhTW` object add (top level, after `nav`):

```ts
stage: {
  name: '陳彥家',
  name_latin: 'Yen-Chia Chen',
  tagline: '機器學習 × 網球 × 音樂',
  hint: '撥動琴弦，或向下捲動',
  labels: { code: '程式碼', tennis: '網球', music: '音樂' },
},
```

In the `en` object add the mirror:

```ts
stage: {
  name: 'Yen-Chia Chen',
  name_latin: '陳彥家',
  tagline: 'Machine Learning × Tennis × Music',
  hint: 'Pluck a string, or scroll',
  labels: { code: 'CODE', tennis: 'TENNIS', music: 'MUSIC' },
},
```

- [ ] **Step 2: Create `components/StageIntro.tsx`**

```tsx
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { STRINGS } from './StringStage';

// Deliberately no hero banner: a dark stage, three labeled strings, a small nameplate.
export const StageIntro: React.FC = () => {
  const { t } = useLanguage();
  const stage = t('stage');

  return (
    <section id="hero" className="relative h-screen">
      {/* String labels, aligned to StringStage x positions */}
      {STRINGS.map((s) => (
        <div
          key={s.id}
          className="absolute top-[68%] -translate-x-1/2 flex flex-col items-center gap-3"
          style={{ left: `${s.x * 100}%` }}
        >
          <span
            className="font-mono text-[10px] uppercase tracking-[0.4em]"
            style={{ color: s.color }}
          >
            {stage.labels[s.id]}
          </span>
        </div>
      ))}

      {/* Nameplate — small, bottom-left, like a plaque on a stage */}
      <div className="absolute bottom-16 left-6 md:left-12">
        <p className="font-serif text-lg text-ink">{stage.name}</p>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-sub mt-1">
          {stage.name_latin} — {stage.tagline}
        </p>
      </div>

      {/* Hint — bottom-center, breathing */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2">
        <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-sub animate-pulse">
          {stage.hint}
        </p>
      </div>
    </section>
  );
};
```

- [ ] **Step 3: Replace `components/Preloader.tsx` entirely**

```tsx
import React, { useEffect, useState } from 'react';

// Three strings tighten into place, then the stage lights come up.
export const Preloader: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const t1 = window.setTimeout(() => setLeaving(true), 1300);
    const t2 = window.setTimeout(onComplete, 1900);
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[300] bg-bg flex items-center justify-center gap-20 md:gap-32 transition-opacity duration-500 ${leaving ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      {['#7DB5FF', '#C8F542', '#F0B45C'].map((c, i) => (
        <div
          key={c}
          className="w-px h-48 origin-center animate-string-tighten opacity-0"
          style={{ backgroundColor: c, animationDelay: `${i * 180}ms` }}
        />
      ))}
    </div>
  );
};
```

- [ ] **Step 4: Swap in `App.tsx`**

Replace the `HeroSection` import with `import { StageIntro } from './components/StageIntro';` and replace `<HeroSection />` with `<StageIntro />`. Then:

```bash
rm components/HeroSection.tsx
```

Run: `grep -rn "HeroSection" --include="*.tsx" . | grep -v node_modules | grep -v dist`
Expected: no matches.

- [ ] **Step 5: Verify**

Run: `npm run build` → exit 0.
In `npm run dev`:
- Preloader: three colored vertical lines scale in staggered on black, page fades in ~1.9s.
- First screen: no banner — labels sit under each string at the correct x positions, nameplate bottom-left, pulsing hint bottom-center.
- Toggling language (nav button) switches labels/hint between zh-TW and EN.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: StageIntro replaces hero banner, string-tighten preloader, stage locales"
```

---

### Task 6: Kinetic reveal system — `useReveal` hook + `KineticHeading`

**Files:**
- Create: `hooks/useReveal.ts`
- Create: `components/KineticHeading.tsx`

**Interfaces:**
- Consumes: gsap + ScrollTrigger registered in `App.tsx` (Task 2).
- Produces: `useReveal<T extends HTMLElement>(dir?: 'left'|'right'|'up', delay?: number): React.RefObject<T | null>` and `<KineticHeading text={string} className?={string} />`. Task 7 and Task 8/9 use both. Reveal direction convention: sections visually "pulled in" from their string — content left of center reveals from `'left'`, right of center from `'right'`, default `'up'`.

- [ ] **Step 1: Create `hooks/useReveal.ts`**

```ts
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export const useReveal = <T extends HTMLElement = HTMLDivElement>(
  dir: 'left' | 'right' | 'up' = 'up',
  delay = 0,
) => {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const x = dir === 'left' ? -60 : dir === 'right' ? 60 : 0;
    const y = dir === 'up' ? 40 : 0;
    const tween = gsap.fromTo(
      el,
      { opacity: 0, x, y },
      {
        opacity: 1, x: 0, y: 0,
        duration: 1, ease: 'power3.out', delay,
        scrollTrigger: { trigger: el, start: 'top 88%' },
      },
    );
    return () => { tween.scrollTrigger?.kill(); tween.kill(); };
  }, [dir, delay]);
  return ref;
};
```

- [ ] **Step 2: Create `components/KineticHeading.tsx`**

```tsx
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

// Character-cascade heading. Splits text into spans and staggers them in on scroll.
export const KineticHeading: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const chars = Array.from(el.children);
    const tween = gsap.fromTo(
      chars,
      { opacity: 0, y: '0.6em' },
      {
        opacity: 1, y: 0,
        duration: 0.7, ease: 'power3.out', stagger: 0.03,
        scrollTrigger: { trigger: el, start: 'top 88%' },
      },
    );
    return () => { tween.scrollTrigger?.kill(); tween.kill(); };
  }, [text]);

  return (
    <h2 ref={ref} className={className} aria-label={text}>
      {Array.from(text).map((ch, i) => (
        <span key={i} aria-hidden="true" className="inline-block">
          {ch === ' ' ? ' ' : ch}
        </span>
      ))}
    </h2>
  );
};
```

- [ ] **Step 3: Verify**

Run: `npm run build` → exit 0. (Visual verification happens in Tasks 7–9 where these are first used; nothing renders them yet.)

- [ ] **Step 4: Commit**

```bash
git add hooks/useReveal.ts components/KineticHeading.tsx
git commit -m "feat: useReveal hook and KineticHeading character-cascade component"
```

---

### Task 7: Navbar redesign (slim mono nav + sound toggle)

**Files:**
- Modify: `components/Navbar.tsx` (full replace)

**Interfaces:**
- Consumes: `toggleMute`/`isMuted`/`armAudio` (Task 3), `scrollToSection` (Task 2), `useLanguage` (existing), `STRINGS` colors (Task 4).
- Produces: same mount contract as before (`<Navbar />`, no props).

- [ ] **Step 1: Replace `components/Navbar.tsx` entirely**

```tsx
import React, { useState, useEffect } from 'react';
import { Menu, X, Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { scrollToSection } from '../utils/scroll';
import { toggleMute, isMuted, armAudio } from '../utils/stringAudio';

export const Navbar: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [muted, setMuted] = useState(isMuted());

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: t('nav.about'), href: '#about' },
    { label: t('nav.projects'), href: '#projects' },
    { label: t('nav.blog'), href: '#blog' },
    { label: t('nav.awards'), href: '#awards' },
    { label: t('nav.contact'), href: '#contact' },
  ];

  const go = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    setIsMenuOpen(false);
    scrollToSection(href);
  };

  const onToggleSound = () => {
    armAudio();
    setMuted(toggleMute());
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-[100] transition-all duration-700 ${
          isScrolled ? 'bg-bg/80 backdrop-blur-xl py-4 border-b border-line' : 'bg-transparent py-8 border-b border-transparent'
        }`}
      >
        <div className="container mx-auto px-6 md:px-12 flex justify-between items-center">
          <a href="#hero" onClick={(e) => go(e, '#hero')} className="flex items-center gap-3 group">
            {/* three-string glyph */}
            <div className="flex gap-[5px] h-6 items-stretch" aria-hidden="true">
              <span className="w-px bg-str-code group-hover:scale-y-75 transition-transform origin-center" />
              <span className="w-px bg-str-tennis group-hover:scale-y-125 transition-transform origin-center" />
              <span className="w-px bg-str-music group-hover:scale-y-75 transition-transform origin-center" />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink">Yen-Chia Chen</span>
          </a>

          <div className="hidden md:flex items-center gap-10">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => go(e, item.href)}
                className="font-mono text-[10px] uppercase tracking-[0.35em] text-sub hover:text-ink transition-colors duration-300 relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-1/2 w-0 h-px bg-accent transition-all duration-300 group-hover:w-full group-hover:left-0" />
              </a>
            ))}

            <button
              onClick={onToggleSound}
              aria-label={muted ? 'Unmute' : 'Mute'}
              className="w-9 h-9 rounded-full border border-line flex items-center justify-center text-sub hover:text-ink hover:border-sub transition-colors"
            >
              {muted ? <VolumeX size={14} strokeWidth={1.5} /> : <Volume2 size={14} strokeWidth={1.5} />}
            </button>

            <button
              onClick={() => setLanguage(language === 'zh-TW' ? 'en' : 'zh-TW')}
              className="w-9 h-9 rounded-full border border-line flex items-center justify-center text-[10px] font-mono text-sub hover:text-ink hover:border-sub transition-colors"
            >
              {language === 'zh-TW' ? 'EN' : '繁'}
            </button>
          </div>

          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(true)} aria-label="Open menu">
            <Menu size={24} strokeWidth={1} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 bg-bg z-[200] flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${isMenuOpen ? 'translate-y-0' : '-translate-y-full'}`}>
        <button className="absolute top-10 right-10" onClick={() => setIsMenuOpen(false)} aria-label="Close menu">
          <X size={32} strokeWidth={1} />
        </button>
        <div className="flex flex-col items-center gap-10">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => go(e, item.href)}
              className="font-serif text-4xl text-ink hover:text-accent transition-colors"
            >
              {item.label}
            </a>
          ))}
          <div className="flex gap-6 mt-4">
            <button
              onClick={onToggleSound}
              aria-label={muted ? 'Unmute' : 'Mute'}
              className="w-10 h-10 rounded-full border border-line flex items-center justify-center text-sub"
            >
              {muted ? <VolumeX size={16} strokeWidth={1.5} /> : <Volume2 size={16} strokeWidth={1.5} />}
            </button>
            <button
              onClick={() => { setLanguage(language === 'zh-TW' ? 'en' : 'zh-TW'); setIsMenuOpen(false); }}
              className="w-10 h-10 rounded-full border border-line flex items-center justify-center text-[10px] font-mono text-sub"
            >
              {language === 'zh-TW' ? 'EN' : '繁'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
```

- [ ] **Step 2: Verify**

Run: `npm run build` → exit 0.
In `npm run dev`:
- Slim nav: three-string glyph logo, mono links, no red blob button.
- Nav links smooth-scroll via Lenis (no instant jump).
- Sound toggle flips icon and persists across reload (`localStorage['sound-muted']`); when muted, plucking strings is silent but still animates.
- Mobile menu (narrow window) opens dark, links work, has sound + language buttons.

- [ ] **Step 3: Commit**

```bash
git add components/Navbar.tsx
git commit -m "feat: slim dark navbar with string glyph, sound toggle, lenis navigation"
```

---

### Task 8: Section restyle A — App shell, About, Skills, Experience, Awards

**Files:**
- Modify: `App.tsx`, `components/AboutSection.tsx`, `components/SkillsSection.tsx`, `components/ExperienceSection.tsx`, `components/AwardsSection.tsx`

**Interfaces:**
- Consumes: `useReveal`, `KineticHeading` (Task 6). Dark tokens (Task 1).
- Produces: nothing new — same section ids (`#about`, `#awards`) must remain for StringStage/Navbar targets.

**The restyle rules (apply to every file in this task and Task 9):**

| Old (light theme) | New (dark stage) |
|---|---|
| `bg-white` | `bg-surface` |
| `bg-surface/50` | `bg-transparent` |
| `hover:bg-ink hover:text-white` | `hover:bg-ink hover:text-bg` |
| `text-white` (on `bg-seal`/`bg-ink` fills) | `text-bg` |
| `bg-white/20` (shine overlays) | `bg-ink/10` |
| `shadow-lg`, `shadow-xl`, `shadow-2xl`, `shadow-md` (invisible on dark) | delete the class; where it was a hover affordance, replace with `hover:border-accent/40` |
| `border-ink` (logo boxes etc.) | `border-line` |

- [ ] **Step 1: App shell cleanup in `App.tsx`**

- Delete the paper-texture overlay div (`<div className="fixed inset-0 bg-paper-texture … mix-blend-multiply"></div>`) — the dark stage is clean.
- In the `Footer` component, no class changes needed (uses tokens), but confirm it contains no rules-table classes.

- [ ] **Step 2: Apply the rules table to the four section files**

For each of `AboutSection.tsx`, `SkillsSection.tsx`, `ExperienceSection.tsx`, `AwardsSection.tsx`:

1. Apply every row of the rules table (exact string replace).
2. Replace the section's main `<h2 …>{title}</h2>` element with `<KineticHeading text={…} className={same classes} />` — when the existing title comes from `t(...)` and contains HTML markup (e.g. `dangerouslySetInnerHTML` or `<span>` children), leave that heading as-is and skip KineticHeading for it (plain-string titles only).
3. Wrap the section's top-level content container(s) with reveals: add `const revealRef = useReveal<HTMLDivElement>('up');` and attach `ref={revealRef}` to the primary content wrapper `div` inside the section. For two-column layouts, use `'left'` on the left column and `'right'` on the right column with a second `useReveal` call.
4. Add the section's string accent: About and Awards belong to the **tennis** string — on the section's index/label span (e.g. `{t('about.index')}`), replace `text-accent` with `text-str-tennis`. Experience belongs to **code** — use `text-str-code`. Skills keeps `text-accent`.

- [ ] **Step 3: Verify no light-theme leftovers in these files**

Run: `grep -n "bg-white\|text-white\|shadow-lg\|shadow-xl\|shadow-2xl\|shadow-md\|bg-paper-texture" App.tsx components/AboutSection.tsx components/SkillsSection.tsx components/ExperienceSection.tsx components/AwardsSection.tsx`
Expected: no matches.

- [ ] **Step 4: Verify build + visuals**

Run: `npm run build` → exit 0.
In `npm run dev`: scroll through About → Skills → Experience → Awards:
- All text readable (no dark-on-dark / light-on-light).
- Headings cascade in character-by-character; content blocks slide in as you scroll.
- Entering About makes the center (tennis) string brighten and shiver; entering Experience does the same to the left (code) string.
- With Reduce Motion on: everything simply visible, no animation.

- [ ] **Step 5: Commit**

```bash
git add App.tsx components/AboutSection.tsx components/SkillsSection.tsx components/ExperienceSection.tsx components/AwardsSection.tsx
git commit -m "feat: dark restyle + kinetic reveals for about/skills/experience/awards"
```

---

### Task 9: Section restyle B — Projects, Blog (incl. readers), Contact

**Files:**
- Modify: `components/ProjectsSection.tsx`, `components/BlogSection.tsx`, `components/ContactSection.tsx`

**Interfaces:**
- Consumes: rules table from Task 8, `useReveal`, `KineticHeading`.
- Produces: same section ids (`#projects`, `#blog`, `#contact`); all filtering/pagination/reader logic byte-for-byte unchanged — this task touches classNames and adds reveals only.

- [ ] **Step 1: Apply the Task 8 rules table to all three files**

Known concrete spots in `BlogSection.tsx` (same patterns exist in `ProjectsSection.tsx` — find them with the grep in Step 3):
- Section wrapper: `bg-surface/50` → `bg-transparent`.
- Card buttons: `bg-white border border-line hover:border-accent/40 hover:shadow-lg` → `bg-surface border border-line hover:border-accent/40` (drop shadow).
- Category pills: `bg-seal text-white border-seal shadow-md` → `bg-seal text-bg border-seal`; `bg-white text-sub` → `bg-surface text-sub`.
- Reader close button: `hover:bg-ink hover:text-white` → `hover:bg-ink hover:text-bg`.
- Reader overlay `bg-ink/40 backdrop-blur-sm` → `bg-black/60 backdrop-blur-sm` (ink is now light — it would flash-bang).
- Reader panel `bg-bg … shadow-2xl` → `bg-surface …` (drop shadow, panel must sit above page black).
- Reader sticky header `bg-bg/90` → `bg-surface/90`.
- Mobile floating close `bg-bg/90` → `bg-surface/90`.

- [ ] **Step 2: Section accents + reveals**

- Projects and Blog belong to the **code** string: replace `text-accent` on their index labels with `text-str-code`. Contact belongs to **music**: use `text-str-music`.
- Add `useReveal` to each section's header block and to the grid container (one `useReveal<HTMLDivElement>('up')` per block; card-level stagger is already handled by grid entrance).
- Replace plain-string `<h2>` titles with `KineticHeading` per the Task 8 rule (skip titles containing HTML from locales — Projects' title contains a `<span>`, so it stays as-is).

- [ ] **Step 3: Verify no leftovers**

Run: `grep -n "bg-white\|text-white\|shadow-lg\|shadow-xl\|shadow-2xl\|shadow-md\|bg-ink/40" components/ProjectsSection.tsx components/BlogSection.tsx components/ContactSection.tsx`
Expected: no matches.

- [ ] **Step 4: Verify build + full content flows**

Run: `npm run build` → exit 0.
In `npm run dev`:
- Projects: category filter, card open/close, markdown + KaTeX render legibly on dark (KaTeX inherits `text-ink` — formulas visible).
- Blog: filter pills, pagination, open a post: dark reader panel, readable long-form text, cover image renders, close works (desktop + mobile floating button).
- Contact renders with music-string amber accent.
- Language toggle: reload content in EN and re-check one post.

- [ ] **Step 5: Commit**

```bash
git add components/ProjectsSection.tsx components/BlogSection.tsx components/ContactSection.tsx
git commit -m "feat: dark restyle + kinetic reveals for projects/blog/contact and readers"
```

---

### Task 10: SEO component copy, final audit, production verify

**Files:**
- Modify: `components/SEO.tsx` (description/title strings only)
- Modify: whatever the audit greps surface

**Interfaces:**
- Consumes: everything.

- [ ] **Step 1: Update `components/SEO.tsx` default strings**

Open the file; update any hardcoded default `title` to `Yen-Chia Chen | 弦理論 String Theory` and default `description` to `Portfolio of Yen-Chia Chen — ML engineer, tennis player, musician. Three strings, one stage: an interactive string-theory portfolio.` Keep the component's structure and props untouched.

- [ ] **Step 2: Whole-repo light-theme audit**

Run: `grep -rn "bg-white\|text-white\|bg-paper-texture\|shadow-lg\|shadow-xl\|shadow-2xl" --include="*.tsx" components/ App.tsx`
Expected: no matches (fix any stragglers using the Task 8 rules table — `MarkdownRenderer.tsx` and `SEO.tsx` included).

- [ ] **Step 3: Reduced-motion + a11y pass**

With OS Reduce Motion ON, in `npm run dev`:
- No smooth scroll, no string physics, no reveals; all content visible; string-click navigation works.
- Keyboard: Tab reaches nav links, sound toggle, language toggle, cards; Enter activates them.

- [ ] **Step 4: Production build + preview**

Run: `npm run build && npm run preview`
Expected: build exit 0; on the preview URL, full pass: preloader → stage intro → pluck each string (sound after first click, navigation lands on the right sections) → open a project and a blog post → toggle language → toggle mute → mobile-width check (strings visible, tap on string navigates, menu works).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: string-theory redesign — seo copy, a11y audit, final polish"
```

---

## Self-review notes

- **Spec coverage:** dark stage ✓ (T1), strings + physics + sound + pluck-nav ✓ (T3/T4), hybrid navigation ✓ (T4 + scroll untouched), no name banner ✓ (T5), kinetic reveals + scroll triggers ✓ (T6/T8/T9), Lenis ✓ (T2), sections/data/bilingual/KaTeX kept ✓ (T8/T9 rules-only), reduced-motion + mute ✓ (T3/T4/T10).
- **Known ceilings (deliberate):** sounds are synthesized approximations (`// ponytail:` swap in sampled audio files if realism matters); strings render on mobile but hover-bend needs a pointer — tap-to-navigate is the mobile interaction; Tailwind stays on CDN (build-time migration is a separate project).
