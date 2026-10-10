# Parker — Adobe Analytics Build Guide

> Analytics implementation guide for the Parker Edge Delivery (EDS) site
> `main--parker--ynaka-adobe`. Models the measurement design on the **3M TEBG**
> report suite so Parker reporting lines up 1:1 with TEBG.
>
> **Scope note:** The report suite itself must be created by an Adobe Analytics
> admin (Analytics Admin Console / Admin API) — it cannot be provisioned from
> this repo. Section 2 is the exact spec to recreate the TEBG suite as
> `parker-prod`. Everything else (datastream, blocks, dataLayer, events) is
> developer-implementable from this repo.

---

## 1. Architecture overview

Parker runs on **AEM Edge Delivery Services**. Analytics is collected the same
way TEBG collects it: a lightweight client dataLayer emits **block-level
engagement events** that are forwarded to Adobe Analytics (via Web SDK →
Datastream → Adobe Analytics, or AppMeasurement). The unit of measurement is
the **block** (EDS calls it a block; Analytics calls it a *Component*).

```
EDS page  ──▶  block decorate()  ──▶  pushes to window.adobeDataLayer
                                        │
          IntersectionObserver ─────────┤  component impression
          click listener ───────────────┤  component / CTA click
          form listeners ────────────────┤  form start / submit
                                        ▼
                            Web SDK (alloy)  ──▶  Datastream  ──▶  Adobe Analytics (parker-prod)
```

Every event carries a **Component ID** in the form `block|variant`
(e.g. `hero|banner`, `cards|duo`). This is the join key between the DOM, the
dataLayer, and the Analytics variable map — identical to TEBG.

---

## 2. Report suite build spec (recreate "3M TEBG" as `parker-prod`)

Derived from the TEBG workspace export (`3M TEBG - Sep 28, 2026.csv`). Create
this in **Analytics > Admin > Report Suites** (or clone the `3M TEBG` suite and
re-apply the settings below).

### 2.1 General settings
| Setting | Value |
|---|---|
| Report suite ID | `parkerprod` (or your naming convention) |
| Site title | Parker US — Prod |
| Time zone | Match TEBG |
| Default page | Home |
| Currency | USD |

### 2.2 eVars (conversion variables)
| Var | Name | Allocation | Expiration | Type |
|---|---|---|---|---|
| eVar1 | Component ID (`block\|variant`) | Most Recent | Hit | Text |
| eVar2 | Block Name (block only) | Most Recent | Hit | Text |
| eVar3 | Block Variant | Most Recent | Hit | Text |
| eVar4 | Page Path | Most Recent | Visit | Text |
| eVar5 | Page Template | Most Recent | Visit | Text |
| eVar6 | CTA Text / Label | Most Recent | Hit | Text |
| eVar7 | CTA Destination URL | Most Recent | Hit | Text |
| eVar8 | Section Style (e.g. sky-blue/gold/grey) | Most Recent | Hit | Text |
| eVar9 | Form Name | Most Recent | Visit | Text |
| eVar10 | Personalization / Offer ID (target-offer) | Most Recent | Visit | Text |

### 2.3 Events
| Event | Name | Type | Polarity |
|---|---|---|---|
| event1 | Component Impression | Counter | — |
| event2 | Content CTA Click | Counter | — |
| event3 | Form Start | Counter | — |
| event4 | Form Submit | Counter | up is good |
| event5 | Page Event (any tracked interaction) | Counter | — |

> **Component CTR** and **Page Velocity** in TEBG are **calculated metrics**,
> not stored events — see 2.5.

### 2.4 Props / classifications
- **Component ID (eVar1)** classified into: `Block Name`, `Variant`.
- **Page Path (eVar4)** classified into: `Locale` (`/us/en`, `/de`, `/jp`),
  `Section` (markets / category / about-parker / newsroom), `Template`.

### 2.5 Calculated metrics
| Metric | Formula |
|---|---|
| **Component CTR** | `Content CTA Click (event2) / Component Impression (event1)` |
| **Page Velocity** | `Page Events (event5) / Page Views` |
| **Form Completion Rate** | `Form Submit (event4) / Form Start (event3)` |

### 2.6 Processing / mapping rules
- Set `eVar2`/`eVar3` from `eVar1` by splitting on the `|` delimiter (either in
  a processing rule or client-side before send).
- Bind `event1` to component-impression hits, `event2` to CTA-click hits.

---

## 3. Datastream + Web SDK config

1. In **Adobe Experience Platform > Datastreams**, create `Parker Prod` with an
   **Adobe Analytics** service pointing at report suite `parkerprod`.
2. Configure Web SDK (`alloy`) in the EDS `head.html` / `scripts.js`:
   - `edgeConfigId` = the datastream ID
   - `orgId` = `21BD487E5F2280130A495ECC@AdobeOrg`
3. Forward the XDM/dataLayer `_experience.analytics` mappings so each dataLayer
   event lands on the right eVar/event (mapping table in Section 5).

> If you are staying on legacy AppMeasurement + Launch instead of Web SDK, map
> the same dataLayer keys to `s.eVarN` / `s.events` in a Launch rule; the
> variable map in Section 5 is identical either way.

---

## 4. Block inventory (from live Parker templates)

Enumerated from the home, product-category, market, and Parker-World templates.
Each block must emit a Component ID of `block|variant`. Variant = the
parenthetical/table-cell modifier EDS applies as a CSS class.

| Block (EDS) | Component ID base | Observed variants | Instrument |
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

> TEBG also tracks `visualizer|rs-visualizer`, `locator|rs-locator`,
> `industry-navigator`, `target-offer|target-offer--decorated`,
> `contact-cta|center`, `columns|two-up`, `cards|features|*`. Add these to the
> table above as those blocks are ported to Parker — the same instrumentation
> pattern applies.

**Section style** (`sky-blue`, `gold`, `grey`, `charcoal`) comes from Section
Metadata — capture into eVar8 so personalization/styling can be analyzed, as
TEBG does.

---

## 5. DataLayer contract (the join key)

Push to `window.adobeDataLayer`. Keep key names stable — they are the contract
between blocks and the Analytics mapping.

```js
// component impression
{
  event: 'component-impression',
  component: { id: 'hero-banner|banner', name: 'hero-banner', variant: 'banner' },
  page: { path: location.pathname, template: 'home' }
}

// content CTA click
{
  event: 'cta-click',
  component: { id: 'cards-category', name: 'cards-category', variant: '' },
  cta: { text: 'View all', href: '/us/en/category' }
}

// form funnel
{ event: 'form-start',  form: { name: 'contact' } }
{ event: 'form-submit', form: { name: 'contact' } }
```

### Mapping table (dataLayer → Analytics)
| dataLayer key | Analytics | 
|---|---|
| `component.id` | eVar1 + event1 (on impression) |
| `component.name` | eVar2 |
| `component.variant` | eVar3 |
| `page.path` | eVar4 |
| `page.template` | eVar5 |
| `cta.text` | eVar6 + event2 |
| `cta.href` | eVar7 |
| section style | eVar8 |
| `form.name` | eVar9 + event3 (start) / event4 (submit) |

---

## 6. Instrumentation pattern (what to add to the repo)

Add a single plugin `scripts/martech/instrument.js`, loaded lazily after LCP,
that wires every block generically — no per-block edits needed.

```js
// scripts/martech/instrument.js
window.adobeDataLayer = window.adobeDataLayer || [];
const push = (o) => window.adobeDataLayer.push(o);

function componentId(block) {
  // EDS class list = [block, ...variants]; join with "|" to match TEBG
  const parts = [...block.classList].filter(c => c !== 'block');
  return parts.join('|');
}

// 1) Impressions — fire once per block when 50% visible
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting && !e.target.dataset.impressed) {
      e.target.dataset.impressed = '1';
      const id = componentId(e.target);
      push({ event: 'component-impression',
             component: { id, name: id.split('|')[0], variant: id.split('|').slice(1).join('|') },
             page: { path: location.pathname, template: document.body.dataset.template || '' } });
    }
  });
}, { threshold: 0.5 });

// 2) CTA clicks — delegate on links/buttons inside blocks
document.addEventListener('click', (ev) => {
  const a = ev.target.closest('.block a, .block button');
  if (!a) return;
  const block = a.closest('.block');
  const id = componentId(block);
  push({ event: 'cta-click',
         component: { id, name: id.split('|')[0], variant: id.split('|').slice(1).join('|') },
         cta: { text: a.textContent.trim(), href: a.getAttribute('href') || '' } });
});

// 3) Observe every decorated block
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

### Form funnel
In `blocks/form/form.js` (or wherever the AF/marketo form renders), push
`form-start` on first field focus and `form-submit` on successful submit, with
`form.name` from the form's data attribute. This reproduces the TEBG
Form Start → Form Submit → Component Impression fallout funnel.

---

## 7. Validation checklist

- [ ] `parkerprod` report suite created with the vars/events in Section 2.
- [ ] Datastream + Web SDK live; hits visible in Adobe Analytics debugger.
- [ ] Every block in Section 4 fires exactly **one** impression per view.
- [ ] Component ID uses `|` delimiter and matches `block|variant` class order.
- [ ] CTA clicks carry text + href and increment event2.
- [ ] Form funnel fires start + submit with a stable form name.
- [ ] Calculated metrics (Component CTR, Page Velocity, Form Completion Rate)
      resolve in a Workspace project.
- [ ] Build a Workspace that mirrors the TEBG export tabs (Fallout, Content
      Engagement, Personalization proof, Dead Weight, Page Views) to confirm
      parity.

---

*Generated from the 3M TEBG workspace export and the live Parker EDS templates
(home, category, market, Parker World). Add newly-ported blocks to Section 4 as
they ship.*
