# SubTracker — Design System

نظام تصميم واحد لكل الابليكيشن. الملف ده هو الـ source of truth لأي لون/فونت/radius/shadow. ممنوع أي hex أو px يتكتب مباشرة جوه component — استخدم التوكنز الموجودة في [`tokens.css`](./tokens.css) أو Tailwind theme (`tailwind.config.js`) اللي بيتربط بيها.

## الهوية

SubTracker = أداة إدارة اشتراكات ومصاريف شخصية. الهوية بصرية **واضحة، هادية، موثوقة** — مش براند تجميل أو فخامة، لازم تدي إحساس بالتحكم في الفلوس (كليريتي + تركيز على الأرقام)، مع لمسة عصرية (glass cards, soft shadows, gradient accents).

ثنائي اللغة (AR/EN) بدعم RTL كامل، ودارك مود كامل (كل توكن عنده نسخة light و dark).

## الألوان

| دور | Light token | قيمة | استخدام |
|---|---|---|---|
| Primary | `--brand-primary-500` | `#6366F1` (Indigo) | أزرار أساسية، لينكات نشطة، highlights |
| Primary dark | `--brand-primary-600` | `#4F46E5` | hover على primary |
| Accent | `--brand-accent-500` | `#EC4899` (Pink) | gradients، تمييز ثانوي، charts |
| Success | `--success-500` | `#10B981` | دخل، اشتراك نشط |
| Warning | `--warning-500` | `#F59E0B` | اشتراك قرب يخلص، تنبيهات |
| Danger | `--danger-500` | `#EF4444` | مصروف، حذف، اشتراك متأخر |
| Ink (neutral) | `--ink-900` → `--ink-000` | Slate scale | نصوص وحدود |

كل لون عنده scale كامل جوه `tokens.css` (900 → 050) — استخدم الدرجة المناسبة بدل ما تخترع hex جديد.

Gradient الهوية: `linear-gradient(135deg, var(--brand-primary-500) 0%, var(--brand-accent-500) 100%)` — دي بتتستخدم في `.gradient-primary` و `.gradient-text`.

## التيبوجرافي

- English / أرقام: **Inter**
- عربي: **Cairo** — بيتفعل تلقائي على `html[lang="ar"]`
- Scale: `--text-display` (40px, أرقام الداشبورد) → `--text-h1..h4` → `--text-body` (16px) → `--text-body-sm` (14px) → `--text-caption` (12px)
- Line-height: عربي دايمًا `--leading-relaxed` (1.65)، إنجليزي `--leading-normal` (1.5)

## Radius

`sm` 8px (chips) · `md` 12px (inputs) · `lg` 16px (cards) · `xl` 24px (modals/hero) · `pill` 999px (buttons/badges)

## Shadow

`--shadow-card` للكروت العادية، `--shadow-card-hover` عند hover، `--shadow-glass` / `--shadow-glass-dark` للـ glass cards، `--shadow-glow-primary` / `--shadow-glow-accent` لأي CTA محتاج تبرز.

## Spacing & Layout

`--sidebar-width` 260px / `--sidebar-collapsed` 72px / `--header-height` 64px. باقي الـ spacing يتبع Tailwind scale العادي (4px base).

## Motion

`--duration-fast` 140ms (micro-interactions) · `--duration-base` 220ms (defaults) · `--duration-slow` 380ms (modals/page transitions). Easing: `--ease-standard` لأي حركة عندها bounce خفيف، `--ease-out` للظهور/الاختفاء البسيط. احترم `prefers-reduced-motion`.

## Component classes (`globals.scss @layer components`)

جاهزين ومستخدمين بالفعل: `.glass-card` `.gradient-primary` `.gradient-text` `.btn-primary` `.btn-secondary` `.btn-danger` `.input-field` `.select-field` `.label-text` `.page-container` `.page-title`

قاعدة: أي component جديد يحتاج نفس الشكل (زرار، كارت، إنبت) **يستخدم الكلاس الموجود** بدل ما يعمل واحد جديد بنفس الوظيفة.

## قواعد صارمة

1. ممنوع hex/px مباشر جوه أي `.tsx` — استخدم Tailwind token classes (`bg-primary`, `text-danger`, `rounded-2xl`, `shadow-glass`) أو `var(--token)` لو SCSS.
2. أي لون جديد يتضاف هنا في `tokens.css` + `tailwind.config.js` الاتنين مع بعض، مش في مكان واحد بس.
3. دعم RTL و dark mode إلزامي لأي component جديد — جرب الاتنين قبل ما تعتبر الشغل خلص.
4. لو محتاج نفس شكل موجود في `design_system/preview/`، دور هناك الأول قبل ما تعمل تصميم جديد من الصفر.

## Preview

`design_system/preview/` فيه HTML swatches مستقلة (ألوان، أزرار، كروت، إنبوتس) لمعاينة التوكنز بدون ما تشغل الابليكيشن — نفس فكرة Lumière-Orders.
