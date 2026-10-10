# Parker — Adobe Analytics Build Guide

> Analytics implementation guide for the Parker Edge Delivery (EDS) site
> `main--parker--ynaka-adobe`. Models the measurement design on the **3M TEBG**
> report suite so Parker reporting lines up 1:1 with TEBG.
>
> **Scope note:** The report suite and a validation Workspace have now been
> created in Adobe Analytics as report suite **`acsmarketingparker`** (Site
> Title "Parker"). Section 2 remains the target spec — use it to verify the new
> suite's variables/events match before you wire up tracking.

---

## 1. Architecture overview

Parker runs on **AEM Edge Delivery Services** and is **Adobe Analytics-only**
(no AEP, no Target). A lightweight client dataLayer emits **block-level
engagement events** that are sent to Adobe Analytics via **AppMeasurement +
Tags**. The unit of measurement is the **block** (EDS calls it a block;
Analytics calls it a *Component*). The measurement *model* mirrors the 3M TEBG
report suite so reporting lines up; the *block set* is Parker's own (Section 4).

```
EDS page  ──▶  block decorate()  ──▶  pushes to window.adobeDataLayer
                                        │
          IntersectionObserver ─────────┤  component impression
          click listener ───────────────┤  component / CTA click
                                        ▼
                  AppMeasurement (s.tl / s.t)  ──▶  Adobe Analytics (acsmarketingparker)
```

Every event carries a **Component ID** (`eVar3`/`prop3`) and **Block Name**
(`eVar4`/`prop4`), plus **Position** and **Section Index** — matching the live
report-suite schema (Section 2). These are the join keys between the DOM, the
dataLayer, and the Analytics variable map.

---

## 2. Report suite schema (`acsmarketingparker` — copied from `acsmarketingtebg`)

This is the **live, configured schema** of the suite (per the Engagement &
Conversion Workspace build guide). Instrument to populate exactly these — do not
invent new variable numbers.

### 2.1 Success Events (Counter, polarity Up)
| Event | Name |
|---|---|
| event1 | Component Impression |
| event2 | CTA Click |
| event3 | Download |
| event4 | Form Start |
| event5 | Form Submit |
| event6 | Scroll Milestone |

### 2.2 Conversion Variables (eVars) — allocation Most Recent (Last)
| Var | Name | Expiration |
|---|---|---|
| eVar1 | Template | Visit |
| eVar2 | Locale | Visit |
| eVar3 | Component ID | Hit |
| eVar4 | Block Name | Hit |
| eVar5 | Position | Hit |
| eVar6 | Section Index | Hit |
| eVar10 | Link Text | Hit |
| eVar11 | Link URL | Hit |
| eVar12 | Download File | Hit |
| eVar13 | Scroll Depth | Hit |
| eVar14 | Form Name | Hit |

### 2.3 Traffic Variables (props)
| Prop | Name |
|---|---|
| prop1 | Page Path |
| prop3 | Component ID |
| prop4 | Block Name |
| prop10 | Region : Link Type |

### 2.4 Calculated metrics (Components > Calculated Metrics)
| Metric | Formula |
|---|---|
| Component CTR (%) | CTA Click ÷ Component Impression |
| Form Completion Rate (%) | Form Submit ÷ Form Start |
| Form Abandonment Rate (%) | 1 − (Form Submit ÷ Form Start) |
| Downloads per Visit | Download ÷ Visits |
| CTA Clicks per Visit | CTA Click ÷ Visits |
| Impression-to-Submit Rate (%) | Form Submit ÷ Component Impression |

> **Parker reality check:** `Download`, `Form Start/Submit`, and `Scroll
> Milestone` exist in the suite but only populate once Parker emits them.
> Parker's current templates have no on-page forms, so the form funnel (event4/
> event5, eVar14) stays empty until a form block ships. Component Impression,
> CTA Click, Scroll Milestone, and Download apply to Parker today.

---

## 3. Data collection path (Analytics-only — AppMeasurement + Tags)

> **Decision:** Parker is an **Adobe Analytics-only** org (no Adobe Experience
> Platform). The recommended path is **classic AppMeasurement + Tags (Launch)**,
> which sends hits straight to the report suite — **no datastream, no Edge
> Network, no AEP required**. The measurement design (Sections 2, 4, 5) is
> identical regardless of transport; only this section changes.

### 3.1 Recommended — AppMeasurement + Tags (Launch)
1. In **Data Collection > Tags**, create a property `Parker` with your site
   domain(s). (Tags/Launch is included with Adobe Analytics.)
2. Add the **Adobe Analytics** extension; set the report suite to `acsmarketingparker`
   (and a dev/validation suite for non-prod environments) and the tracking
   server (your 1st-party CNAME, e.g. `metrics.parker.com`).
3. Create data elements for each dataLayer key in Section 5, then a rule that
   maps them to `s.eVarN` / `s.events` and fires:
   - `s.t()` on page view (page metrics).
   - `s.tl()` on component impression / CTA click / form events.
4. Build + publish the Tags library and load it from the EDS `head.html`.

```js
// in a Tags rule, per adobeDataLayer event (component impression):
s.linkTrackVars = 'eVar1,eVar2,eVar3,eVar4,eVar5,eVar6,prop1,prop3,prop4,events';
s.linkTrackEvents = 'event1';
s.eVar1 = ev.page.template;   // Template
s.eVar2 = ev.page.locale;     // Locale
s.eVar3 = ev.component.id;    // Component ID        (also prop3)
s.eVar4 = ev.component.block; // Block Name          (also prop4)
s.eVar5 = ev.component.position;      // Position
s.eVar6 = ev.component.sectionIndex;  // Section Index
s.prop1 = ev.page.path; s.prop3 = s.eVar3; s.prop4 = s.eVar4;
s.events = 'event1';          // Component Impression
s.tl(true, 'o', 'component-impression');
```

### 3.2 Alternative — Web SDK + datastream (only if provisioned)
Web SDK does **not** require AEP — Analytics includes Data Collection and
datastreams. Use this path only if your admin grants **Manage Datastreams** +
sandbox access. Then create a datastream with an **Adobe Analytics** service
pointing at `acsmarketingparker`, and configure `alloy` with that `datastreamId` +
`orgId`. The Section 5 variable map is unchanged.

---

## 4. Block inventory (from live Parker templates)

Enumerated from the home, product-category, market, and Parker-World templates.
Each block emits a **Block Name** (eVar4/prop4 — the first EDS class) and a
**Component ID** (eVar3/prop3 — block name plus any variant class). Variant = the
parenthetical/table-cell modifier EDS applies as a CSS class.

| Block (EDS) | Block Name | Observed variants | Instrument |
|---|---|---|---|
| Hero Banner | `hero-banner` | `banner`, `default` | impression + CTA click |
| Columns Media | `columns-media` | `compact`, `full-bleed` | impression + CTA click |
| Carousel Hero | `carousel-hero` | — | impression + CTA click + slide change |
| Banner Cta | `banner-cta` | — | impression + CTA click |
| Banner Inline | `banner-inline` | — | impression + CTA click |
| Cards Category | `cards-category` | — | impression + card click |
| Cards News | `cards-news` | — | impression + card click |
| Cards Teaser | `cards-teaser` | — | impression + CTA click |
| Fragment | `fragment` | — | impression (container) |
| Embed App | `embed-app` | — | impression + interaction |
| Header | `header` | — | nav click |
| Footer | `footer` | — | footer link click |

> **Parker's block set only.** The 3M TEBG blocks (`visualizer`, `locator`,
> `industry-navigator`, `target-offer`, `contact-cta`, `cards|features`) are
> **not** present on Parker and are intentionally excluded. If you port or add a
> new block later, add a row here — the generic instrumentation in §6 picks it
> up automatically from the class list, no code change needed.

**Section style** (`sky-blue`, `gold`, `grey`, `charcoal`) and the block's
ordinal within the page map to **Position** (eVar5) and **Section Index**
(eVar6). The suite has no dedicated "section style" variable, so fold styling
analysis into Section Index or add a classification later if needed.

---

## 5. DataLayer contract (the join key)

Push to `window.adobeDataLayer`. Keep key names stable — they are the contract
between blocks and the Analytics mapping.

```js
// component impression
{
  event: 'component-impression',
  component: { id: 'hero-banner', block: 'hero-banner', position: 1, sectionIndex: 1 },
  page: { path: location.pathname, template: 'home', locale: '/us/en' }
}

// CTA click
{
  event: 'cta-click',
  component: { id: 'cards-category', block: 'cards-category', position: 5, sectionIndex: 4 },
  link: { text: 'View all', url: '/us/en/category', type: 'exit' }
}

// download (asset link)
{ event: 'download', link: { file: 'parker-cybersecurity-whitepaper.pdf', url: '/content/dam/...' } }

// scroll milestone
{ event: 'scroll', depth: 75 }

// form funnel (future — no forms on Parker today)
{ event: 'form-start',  form: { name: 'contact' } }
{ event: 'form-submit', form: { name: 'contact' } }
```

### Mapping table (dataLayer → Analytics)
| dataLayer key | Analytics |
|---|---|
| `page.template` | eVar1 |
| `page.locale` | eVar2 |
| `component.id` | eVar3 + prop3 (+ event1 on impression) |
| `component.block` | eVar4 + prop4 |
| `component.position` | eVar5 |
| `component.sectionIndex` | eVar6 |
| `link.text` | eVar10 (+ event2 on cta-click) |
| `link.url` | eVar11 |
| `link.file` | eVar12 (+ event3 download) |
| `depth` | eVar13 (+ event6 scroll milestone) |
| `form.name` | eVar14 (+ event4 start / event5 submit) |
| `page.path` | prop1 |
| link type / region | prop10 |

---

## 6. Instrumentation pattern (what to add to the repo)

Add a single plugin `scripts/martech/instrument.js`, loaded lazily after LCP,
that wires every block generically — no per-block edits needed.

```js
// scripts/martech/instrument.js
window.adobeDataLayer = window.adobeDataLayer || [];
const push = (o) => window.adobeDataLayer.push(o);

const locale = () => '/' + location.pathname.split('/').slice(1, 3).join('/'); // /us/en
const template = () => document.body.dataset.template || document.querySelector('main')?.dataset.template || '';

// Component ID + Block Name from the EDS class list. First class = block name;
// extra classes (variants) refine the Component ID.
function ids(block) {
  const parts = [...block.classList].filter((c) => c !== 'block');
  return { id: parts.join('--') || 'unknown', block: parts[0] || 'unknown' };
}
// Position = ordinal of the block within <main>; Section Index = its section ordinal
function coords(block) {
  const blocks = [...document.querySelectorAll('main .block')];
  const sections = [...document.querySelectorAll('main > .section')];
  return { position: blocks.indexOf(block) + 1,
           sectionIndex: sections.indexOf(block.closest('.section')) + 1 };
}

// 1) Impressions — once per block at 50% visibility  → event1
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting && !e.target.dataset.impressed) {
      e.target.dataset.impressed = '1';
      const { id, block } = ids(e.target);
      push({ event: 'component-impression',
             component: { id, block, ...coords(e.target) },
             page: { path: location.pathname, template: template(), locale: locale() } });
    }
  });
}, { threshold: 0.5 });

// 2) Link clicks inside blocks → CTA click (event2) or Download (event3)
document.addEventListener('click', (ev) => {
  const a = ev.target.closest('main .block a, main .block button');
  if (!a) return;
  const block = a.closest('.block');
  const { id, block: name } = ids(block);
  const url = a.getAttribute('href') || '';
  const isDownload = /\.(pdf|docx?|xlsx?|pptx?|zip|csv)(\?|$)/i.test(url) || url.includes('/content/dam/');
  if (isDownload) {
    push({ event: 'download',
           component: { id, block: name, ...coords(block) },
           link: { file: url.split('/').pop(), url } });
  } else {
    push({ event: 'cta-click',
           component: { id, block: name, ...coords(block) },
           link: { text: a.textContent.trim(), url,
                   type: a.hostname && a.hostname !== location.hostname ? 'exit' : 'internal' } });
  }
});

// 3) Scroll milestones → event6 (25/50/75/100)
const seen = new Set();
window.addEventListener('scroll', () => {
  const pct = Math.round(((scrollY + innerHeight) / document.body.scrollHeight) * 100);
  [25, 50, 75, 100].forEach((m) => {
    if (pct >= m && !seen.has(m)) { seen.add(m); push({ event: 'scroll', depth: m }); }
  });
}, { passive: true });

// 4) Observe every decorated block
export default function instrument() {
  document.querySelectorAll('main .block').forEach((b) => io.observe(b));
}
```

Wire it in `scripts/scripts.js` after `loadLazy()`:

```js
import instrument from './martech/instrument.js';
// ... after page is decorated / lazy phase:
instrument();
```

### Form funnel *(future — not on Parker today)*
Parker's current templates have no embedded forms, so this is dormant. **When** a
form block ships (e.g. a contact or Marketo form), push `form-start` on first
field focus and `form-submit` on successful submit, with `form.name` from the
form's data attribute — reproducing the TEBG Form Start → Form Submit funnel.

---

## 7. Validation checklist

- [ ] `acsmarketingparker` schema confirmed against Section 2 (events, eVars, props).
- [ ] Tags property + Adobe Analytics extension live; hits visible in the
      Adobe Experience Cloud debugger / Analytics real-time.
- [ ] Every block in Section 4 fires exactly **one** impression (event1) per view.
- [ ] Component ID (eVar3/prop3) + Block Name (eVar4/prop4) + Position (eVar5) +
      Section Index (eVar6) populate on every hit.
- [ ] CTA clicks set Link Text/URL (eVar10/11) and increment event2; asset links
      fire Download (event3) with Download File (eVar12).
- [ ] Scroll milestones fire event6 with Scroll Depth (eVar13).
- [ ] Calculated metrics (Component CTR, CTA Clicks per Visit, Downloads per
      Visit) resolve in the Parker Workspace project.
- [ ] Panels 1–6 of the Engagement & Conversion Workspace render as expected.
      *(Form funnel panel is N/A until Parker ships a form block.)*

---

*Generated from the 3M TEBG workspace export and the live Parker EDS templates
(home, category, market, Parker World). Add newly-ported blocks to Section 4 as
they ship.*
