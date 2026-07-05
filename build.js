/* =============================================================================
   Coburn Roofing — static site generator
   Run:  node build.js
   Produces a full multi-page SEO/GEO site (shared assets, per-page schema).
   ============================================================================= */
const fs = require("fs");
const path = require("path");
const OUT = __dirname;

/* ----------------------------------------------------------------------------
   Business / brand config  (edit SITE_URL to the final domain before deploy)
---------------------------------------------------------------------------- */
const BIZ = {
  name: "Coburn Roofing",
  legal: "Coburn Roofing",
  owner: "Zak",
  tagline: "Renew · Repair · Restore",
  SITE_URL: "https://innov8-workflows.github.io/coburn-roofing", // GitHub Pages project site
  phone: "07896 410119",
  phoneHref: "tel:07896410119",
  phoneE164: "+447896410119",
  landline: "0115 66 777 66",
  landlineHref: "tel:01156677766",
  wa: "447896410119",
  email: "zakcoburn91@hotmail.co.uk",
  fb: "https://www.facebook.com/profile.php?id=61572071525995",
  baseCity: "Nottingham",
  region: "the East Midlands",
  hours: "Mon–Sat, 7am–7pm",
};
const waHref = "https://wa.me/" + BIZ.wa;

/* ----------------------------------------------------------------------------
   Icons — inline SVG inner markup (no fill/stroke attrs; CSS context decides).
   Outline paths for stroke contexts, solid paths for fill contexts.
---------------------------------------------------------------------------- */
const P = {
  home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
  factory: '<path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M17 18h1"/><path d="M12 18h1"/><path d="M7 18h1"/>',
  droplet: '<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>',
  umbrella: '<path d="M23 12a11.05 11.05 0 0 0-22 0zm-5 7a3 3 0 0 1-6 0v-7"/>',
  tag: '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  mapPin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  checkC: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  mail: '<path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><polyline points="22,6 12,13 2,6"/>',
  message: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  /* solid (fill contexts) */
  checkSolid: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>',
  pinSolid: '<path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"/>',
  star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  phoneSolid: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  facebook: '<path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/>',
  whatsapp: '<path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm5.8 14.16c-.24.68-1.42 1.31-1.96 1.35-.5.04-.99.24-3.35-.72-2.84-1.15-4.65-4.06-4.79-4.25-.14-.19-1.15-1.53-1.15-2.92 0-1.39.73-2.07.99-2.35.26-.28.57-.35.76-.35.19 0 .38 0 .55.01.18.01.42-.07.65.5.24.58.81 2 .88 2.15.07.14.12.31.02.5-.09.19-.14.31-.28.48-.14.17-.29.36-.42.48-.14.14-.28.29-.12.57.17.28.74 1.22 1.59 1.98 1.1.98 2.02 1.29 2.3 1.43.28.14.45.12.61-.07.17-.19.71-.83.9-1.11.19-.28.38-.24.64-.14.26.09 1.67.79 1.96.93.28.14.47.21.54.33.07.12.07.68-.17 1.36z"/>',
};
const ic = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true">${P[name]}</svg>`;

/* ----------------------------------------------------------------------------
   Data — services
---------------------------------------------------------------------------- */
const AREA_LINE = "Nottingham, Derby &amp; Mansfield";

const SERVICES = [
  {
    key: "new-roofs",
    nav: "New Roofs & Re-Roofing",
    name: "New Roofs &amp; Re-Roofing",
    plain: "New roofs & re-roofing",
    icon: "home",
    title: "New Roofs & Re-Roofing in Nottingham & Derby | Coburn Roofing",
    desc: "Full re-roofs and new roof installations across Nottingham, Derby & Mansfield. Tiled, slate and pitched roofs built to last, with a tidy, professional finish.",
    card: "Complete tear-off and re-roof, new-build roofs, pitched roofs and dry-ridge systems — built properly and guaranteed to keep the weather out for decades.",
    answer:
      "Coburn Roofing installs new roofs and full re-roofs across Nottingham, Derby, Mansfield and the surrounding East Midlands. We strip the old covering, replace battens and felt, and re-lay tiles or slate with new ridge, valleys and flashings — leaving you a watertight roof that&rsquo;s built to last 40+ years.",
    intro: [
      "If your roof is leaking in more than one place, sagging, or losing tiles every time the wind picks up, patch repairs stop being economical. A full re-roof gives you a completely fresh, watertight covering &mdash; new underlay, battens, tiles or slate, ridge and flashings &mdash; that protects your home for decades.",
      "We install new roofs on extensions and new builds, and re-roof tired Victorian terraces, 1930s semis and modern homes right across the region. Every roof is finished to current standards, with a dry-ridge system that never needs re-pointing and a site left spotless.",
    ],
    includes: [
      "Full strip and disposal of the old roof covering",
      "New breathable membrane and treated battens",
      "Concrete or clay tiles, or natural &amp; fibre-cement slate",
      "Dry-ridge and dry-verge systems (no mortar to crack)",
      "New lead flashings, valleys and abutments",
      "Fascias, soffits and guttering renewed if needed",
    ],
    signs: {
      title: "Signs you need a new roof",
      items: [
        "Recurring leaks or damp patches on upstairs ceilings",
        "Widespread cracked, slipped or missing tiles",
        "A visibly sagging or dipping roofline",
        "Granules from the tiles collecting in the gutters",
        "A roof that&rsquo;s simply reached the end of its life (50+ years)",
      ],
    },
    faqs: [
      { q: "How long does a re-roof take?", a: "Most domestic re-roofs take 3&ndash;7 days depending on the size and complexity of the roof and the weather. We&rsquo;ll give you a clear timescale with your quote and keep you updated throughout." },
      { q: "How much does a new roof cost?", a: "It depends on the size of the roof, the materials you choose and access. We give free, no-obligation written quotes so you know exactly what you&rsquo;re paying before any work starts &mdash; with no pressure and no hidden extras." },
      { q: "Will you fit scaffolding?", a: "Yes. For safety and a proper finish, re-roofs are carried out from full scaffolding, which we arrange as part of the job." },
      { q: "Can you match my existing tiles?", a: "In most cases, yes &mdash; we can source tiles and slate to match neighbouring properties, which is often important in conservation areas around Belper and Nottingham." },
    ],
  },
  {
    key: "roof-repairs",
    nav: "Roof Repairs",
    name: "Roof Repairs",
    plain: "Roof repairs",
    icon: "wrench",
    title: "Roof Repairs in Nottingham, Derby & Mansfield | Coburn Roofing",
    desc: "Fast, reliable roof repairs across Nottingham, Derby & Mansfield — leaks, slipped tiles, storm damage and emergency call-outs. Free quotes, honest advice.",
    card: "Leaks, slipped or missing tiles, storm damage and ridge repairs — diagnosed properly and fixed right, from a single tile to a full section.",
    answer:
      "Coburn Roofing carries out all types of roof repair across Nottingham, Derby and Mansfield &mdash; from a single slipped tile to leaks, storm damage and ridge re-bedding. We find the actual cause of the problem (not just the symptom), give you an honest quote, and can often attend quickly for urgent leaks.",
    intro: [
      "A small roof problem rarely stays small. A slipped tile or cracked flashing lets water in, and by the time you see a damp patch on the ceiling the timbers and insulation are often already affected. Catching it early is almost always cheaper.",
      "We repair pitched and flat roofs of every type &mdash; replacing broken or slipped tiles and slates, re-bedding ridge and hip tiles, renewing lead flashings, clearing and sealing valleys, and tracing stubborn leaks back to their source. Whatever the issue, you&rsquo;ll get a straight answer and a fair price.",
    ],
    includes: [
      "Replacing slipped, cracked or missing tiles &amp; slates",
      "Re-bedding and re-pointing ridge and hip tiles",
      "New lead flashings around chimneys and abutments",
      "Leak detection and tracing to the true source",
      "Valley repairs and re-lining",
      "Emergency make-safe and temporary weatherproofing",
    ],
    signs: {
      title: "Common roof problems we fix",
      items: [
        "Water stains or damp on upstairs ceilings and walls",
        "Tiles or slates on the ground after high winds",
        "Daylight visible in the loft",
        "Loose, cracked or missing ridge tiles",
        "Damp around the chimney or where the roof meets a wall",
      ],
    },
    faqs: [
      { q: "Do you do emergency roof repairs?", a: "Yes. If you&rsquo;ve got water coming in, call us on " + BIZ.phone + " and we&rsquo;ll do our best to attend quickly, make the roof safe and stop further damage before arranging a permanent repair." },
      { q: "Can you find a leak if I don&rsquo;t know where it&rsquo;s coming from?", a: "Yes. Leaks often travel along timbers before they show inside, so the damp patch is rarely directly under the fault. We trace leaks back to the real source so the repair actually lasts." },
      { q: "Is it worth repairing or should I replace the roof?", a: "If the roof is generally sound and the problem is localised, a repair is the sensible option. If it&rsquo;s failing in several places, we&rsquo;ll tell you honestly and let you weigh up a re-roof &mdash; the choice is always yours." },
      { q: "Will you look at the roof for free?", a: "Yes &mdash; we provide free inspections and written quotes across " + AREA_LINE + " with no obligation." },
    ],
  },
  {
    key: "flat-roofing",
    nav: "Flat Roofing",
    name: "Flat Roofing",
    plain: "Flat roofing",
    icon: "layers",
    title: "Flat Roofing (EPDM & GRP) in Nottingham & Derby | Coburn Roofing",
    desc: "EPDM rubber and GRP fibreglass flat roofs across Nottingham, Derby & Mansfield. Long-life, seamless, watertight flat roofing for extensions, garages & dormers.",
    card: "Seamless EPDM rubber and GRP fibreglass flat roofs for extensions, garages, dormers and porches — warm, watertight and built to outlast old felt.",
    answer:
      "Coburn Roofing installs and replaces flat roofs across Nottingham, Derby and Mansfield using EPDM rubber and GRP fibreglass systems. These modern, seamless coverings last far longer than traditional felt &mdash; typically 25&ndash;40+ years &mdash; and are ideal for extensions, garages, dormers, porches and outbuildings.",
    intro: [
      "Old bitumen felt flat roofs crack, blister and split as they age, and once water gets in it spreads fast. Modern flat-roof systems solve that with a single, seamless membrane and no felt laps to fail.",
      "We fit EPDM rubber &mdash; a tough, single-piece membrane that flexes with the building &mdash; and GRP fibreglass, a hard-wearing, resin finish that&rsquo;s ideal for balconies and areas that take foot traffic. Both come with proper edge trims and outlets for a clean, permanent finish.",
    ],
    includes: [
      "EPDM rubber flat roofs (single-ply, seamless)",
      "GRP fibreglass flat roofs and balconies",
      "Full strip-off and re-deck where boards have rotted",
      "New insulation to build a warm-roof where required",
      "New trims, drips and outlets for proper drainage",
      "Flat-roof repairs and overlays where suitable",
    ],
    signs: {
      title: "Time to replace a flat roof if&hellip;",
      items: [
        "The felt is blistered, cracked or has splits",
        "Water is pooling and not draining away",
        "There are damp patches on the ceiling below",
        "The surface feels soft or the deck is spongy underfoot",
        "It&rsquo;s been patched more than once already",
      ],
    },
    faqs: [
      { q: "How long does an EPDM rubber roof last?", a: "A properly installed EPDM roof typically lasts 30&ndash;50 years. It&rsquo;s UV-stable, flexible in cold weather and has no seams across the main area, which is where old felt roofs usually fail." },
      { q: "EPDM or GRP fibreglass &mdash; which is better?", a: "Both are excellent. EPDM is flexible and ideal for larger, simple flat roofs; GRP gives a harder, walk-on finish that suits balconies and dormers. We&rsquo;ll recommend the right one for your roof." },
      { q: "Can you insulate my flat roof at the same time?", a: "Yes. When we strip and re-deck a flat roof we can build it up as a warm roof with insulation, which cuts heat loss and helps prevent condensation." },
    ],
  },
  {
    key: "chimney-repairs",
    nav: "Chimney Repairs",
    name: "Chimney Repairs &amp; Repointing",
    plain: "Chimney repairs & repointing",
    icon: "factory",
    title: "Chimney Repairs & Repointing in Nottingham & Derby | Coburn Roofing",
    desc: "Chimney repairs, repointing, re-flaunching and lead flashing across Nottingham, Derby & Mansfield. Stop chimney leaks and crumbling mortar for good.",
    card: "Repointing, re-flaunching, new flashings, rebuilds and removals — keeping older chimneys weathertight, safe and sound.",
    answer:
      "Coburn Roofing repairs, repoints and rebuilds chimneys across Nottingham, Derby and Mansfield. Chimneys take the worst of the weather, so we renew crumbling mortar, re-flaunch the pots, replace failed lead flashings and rebuild or remove stacks that are beyond repair &mdash; stopping leaks and keeping the stack safe.",
    intro: [
      "The chimney is the most exposed part of any roof, and it&rsquo;s where a lot of leaks begin. Weathered mortar joints, a cracked flaunching (the mortar bed the pots sit in) and tired lead flashings all let water track down into the property.",
      "We carry out the full range of chimney work &mdash; repointing eroded joints, re-flaunching and re-seating pots, renewing lead soakers and step flashings, fitting cowls, and rebuilding or safely removing redundant stacks. Older properties around Belper and Nottingham are a speciality.",
    ],
    includes: [
      "Repointing weathered and cracked mortar joints",
      "Re-flaunching and re-seating chimney pots",
      "New Code 4/5 lead flashings and soakers",
      "Cowls and caps fitted to stop rain and birds",
      "Full or partial chimney rebuilds",
      "Chimney removal and roofing-over",
    ],
    signs: {
      title: "Signs your chimney needs attention",
      items: [
        "Damp patches on the chimney breast inside",
        "Crumbling or missing mortar between the bricks",
        "Loose or leaning pots, or a cracked flaunching",
        "White staining (salts) on the brickwork",
        "Rusted or lifted lead flashing at the base",
      ],
    },
    faqs: [
      { q: "Why is my chimney leaking?", a: "Usually it&rsquo;s failed flashings, cracked flaunching or eroded pointing letting water in at the most exposed point of the roof. We identify exactly which and put it right, rather than just sealing over the symptom." },
      { q: "Do you repoint chimneys?", a: "Yes. We rake out the old, weathered mortar and repoint with a suitable mix so the joints shed water properly and match the look of the existing brickwork." },
      { q: "Can you remove a chimney we don&rsquo;t use?", a: "Yes. We can take a redundant stack down (to roof level or fully) and make the roof good and watertight where it was, often reducing future maintenance." },
    ],
  },
  {
    key: "lead-work",
    nav: "Lead Work",
    name: "Lead Work",
    plain: "Lead work",
    icon: "droplet",
    title: "Lead Work & Flashings in Nottingham & Derby | Coburn Roofing",
    desc: "Expert leadwork across Nottingham, Derby & Mansfield — chimney flashings, valleys, soakers, box gutters and bay roofs. Code 4/5 lead, correctly fitted.",
    card: "Chimney flashings, valleys, soakers, box gutters and bay-window roofs — traditional leadwork done to code for a weathertight, long-lasting seal.",
    answer:
      "Coburn Roofing carries out all types of leadwork across Nottingham, Derby and Mansfield. Lead is used wherever the roof meets a wall, chimney or valley, and when it&rsquo;s fitted correctly it lasts for generations. We use the correct Code 4 and Code 5 lead and dress it properly for a permanent, watertight seal.",
    intro: [
      "Lead is one of the oldest and best roofing materials there is &mdash; but only when it&rsquo;s installed correctly. Over-long sheets, poor dressing and the wrong code of lead all lead to splits, lifting and leaks.",
      "We carry out chimney flashings and soakers, valley linings, box and parapet gutters, bay-window roofs, dormer cheeks and hip and ridge details. Whether it&rsquo;s a repair to a failed flashing or full leadwork on a re-roof, it&rsquo;s done to the trade&rsquo;s standards.",
    ],
    includes: [
      "Chimney step flashings, soakers and aprons",
      "Lead valley linings and secret gutters",
      "Box gutters and parapet gutters",
      "Bay-window and porch roofs",
      "Dormer cheeks and abutment details",
      "Repairs to split, lifted or failed lead",
    ],
    signs: {
      title: "When leadwork needs replacing",
      items: [
        "Damp where the roof meets a wall or chimney",
        "Lead that has split, cracked or lifted at the edges",
        "Flashing that&rsquo;s been &lsquo;repaired&rsquo; with sealant or mortar",
        "Staining on internal walls below a valley",
        "Runs that are too long and have fatigued over time",
      ],
    },
    faqs: [
      { q: "Why use lead instead of a cheaper alternative?", a: "Correctly dressed lead moulds to the roof, copes with expansion and lasts for decades &mdash; far longer than mortar fillets or sealant, which crack and fail within a few years." },
      { q: "Can you replace flashing that keeps leaking?", a: "Yes. Persistent leaks at a chimney or wall abutment are almost always down to failed or poorly fitted flashing. We strip it out and re-form it correctly in the right code of lead." },
      { q: "Do you patch-repair lead or replace it?", a: "It depends on the condition. Small splits can sometimes be repaired, but if the lead is fatigued or was fitted wrong we&rsquo;ll recommend replacing that section so it doesn&rsquo;t keep failing." },
    ],
  },
  {
    key: "fascias-soffits-guttering",
    nav: "Fascias, Soffits & Guttering",
    name: "Fascias, Soffits &amp; Guttering",
    plain: "Fascias, soffits & guttering",
    icon: "umbrella",
    title: "Fascias, Soffits & Guttering in Nottingham & Derby | Coburn Roofing",
    desc: "New uPVC fascias, soffits and guttering across Nottingham, Derby & Mansfield. Protect your roofline from rot and damp with a clean, maintenance-free finish.",
    card: "New uPVC fascias, soffits and seamless guttering — protecting the roof edge from rot and damp with a smart, maintenance-free finish.",
    answer:
      "Coburn Roofing renews fascias, soffits and guttering (the &lsquo;roofline&rsquo;) across Nottingham, Derby and Mansfield. We replace tired timber and leaking gutters with low-maintenance uPVC that keeps rainwater away from the walls and stops the roof timbers rotting &mdash; finished neatly with the right ventilation built in.",
    intro: [
      "Your fascias, soffits and gutters do the unglamorous but vital job of carrying rainwater off the roof and away from the building. When they fail, water runs down the walls, timbers rot and damp gets into the eaves.",
      "We replace old, flaking timber fascias and soffits with maintenance-free uPVC in a choice of colours, and fit new seamless or sectional guttering and downpipes. We also build in eaves ventilation to keep the loft healthy and condensation-free.",
    ],
    includes: [
      "New uPVC fascias and soffits (white, black &amp; woodgrain)",
      "New guttering, downpipes and hoppers",
      "Eaves and over-fascia ventilation",
      "Capping-over or full replacement options",
      "Gutter clearing, realignment and repairs",
      "Bargeboards and dry-verge to gable ends",
    ],
    signs: {
      title: "Signs your roofline needs replacing",
      items: [
        "Gutters overflowing or sagging between brackets",
        "Peeling paint or visibly rotten timber fascias",
        "Water running down the external walls",
        "Damp or staining at the top of the walls inside",
        "Birds or pests getting into the eaves",
      ],
    },
    faqs: [
      { q: "Do I need to replace all the fascias or just repair them?", a: "If the timber is only slightly weathered, capping-over can work &mdash; but if it&rsquo;s rotten, full replacement in uPVC is the better long-term fix and means no more painting." },
      { q: "Can you fix guttering that overflows?", a: "Yes. Overflowing gutters are usually blocked, sagging or wrongly set. We clear, realign or replace them so water drains properly and doesn&rsquo;t soak the walls." },
      { q: "What colours are available?", a: "uPVC fascias, soffits and guttering come in white, black, anthracite grey and woodgrain finishes to suit your home." },
    ],
  },
];
const svcByKey = Object.fromEntries(SERVICES.map((s) => [s.key, s]));

/* ----------------------------------------------------------------------------
   Data — locations (real local geography for unique, non-thin content)
---------------------------------------------------------------------------- */
const LOCATIONS = [
  {
    key: "nottingham",
    name: "Nottingham",
    postcode: "NG",
    county: "Nottinghamshire",
    title: "Roofers in Nottingham | Coburn Roofing",
    desc: "Trusted local roofers in Nottingham. Re-roofs, roof repairs, flat roofing, chimneys and leadwork across the NG postcodes. Free quotes — call Coburn Roofing.",
    answer:
      "Coburn Roofing is a local roofing company based in and around Nottingham, covering the city and all NG postcodes. We handle everything from emergency roof repairs and re-roofs to flat roofing, chimney work, leadwork and guttering &mdash; with free, no-obligation quotes.",
    intro: [
      "Nottingham&rsquo;s housing stock is a real mix &mdash; rows of Victorian and Edwardian terraces in areas like Sherwood, Forest Fields and Lenton, 1930s bay-fronted semis across Wollaton, Mapperley and West Bridgford, and newer estates towards Clifton and Gedling. Each type of roof has its own quirks, and we work on them all.",
      "As a local team, we&rsquo;re never far away when a Nottingham homeowner needs us &mdash; whether that&rsquo;s a slipped tile after a windy night, a leak coming through a bedroom ceiling, or a full re-roof on a tired terrace. You&rsquo;ll get honest advice, a fair price and a tidy job.",
    ],
    nearby: ["Sherwood", "Mapperley", "Carlton", "West Bridgford", "Wollaton", "Bulwell", "Clifton", "Beeston", "Gedling"],
  },
  {
    key: "derby",
    name: "Derby",
    postcode: "DE",
    county: "Derbyshire",
    title: "Roofers in Derby | Coburn Roofing",
    desc: "Reliable roofers in Derby covering the DE postcodes. Re-roofing, roof repairs, flat roofs, chimneys, leadwork & guttering. Free quotes from Coburn Roofing.",
    answer:
      "Coburn Roofing provides roofing services across Derby and the surrounding DE postcodes. From roof repairs and leak-tracing to full re-roofs, flat roofing, chimney repointing and new fascias and guttering, we give Derby homeowners honest advice and free written quotes.",
    intro: [
      "Derby spans everything from Victorian terraces close to the city centre to interwar semis in Littleover, Allestree and Mickleover and modern housing out towards Oakwood and Chellaston. Whatever the age and style of your roof, we&rsquo;ve worked on plenty like it.",
      "We cover the whole of Derby and the wider Derbyshire area, so we can get to you quickly for urgent repairs and give you a proper, no-pressure quote for larger work. Our focus is simple: do the job properly, keep the site tidy and leave you with a roof you don&rsquo;t have to think about.",
    ],
    nearby: ["Mickleover", "Allestree", "Littleover", "Chaddesden", "Alvaston", "Spondon", "Oakwood", "Chellaston"],
  },
  {
    key: "mansfield",
    name: "Mansfield",
    postcode: "NG18–NG19",
    county: "Nottinghamshire",
    title: "Roofers in Mansfield | Coburn Roofing",
    desc: "Local roofers in Mansfield & Mansfield Woodhouse. Roof repairs, re-roofs, flat roofing, chimneys and leadwork across NG18–NG19. Free quotes — Coburn Roofing.",
    answer:
      "Coburn Roofing covers Mansfield, Mansfield Woodhouse and the surrounding NG18 and NG19 areas. We carry out roof repairs, full re-roofs, flat roofing, chimney work, leadwork and guttering for homeowners across the town, with free quotes and honest advice.",
    intro: [
      "Mansfield and the former Ashfield coalfield towns have a lot of solid interwar and post-war housing, along with older terraces and a good number of ex-local-authority homes &mdash; many now due for their first full re-roof. We repair and replace roofs across all of them.",
      "From Mansfield Woodhouse and Forest Town to Sutton-in-Ashfield and Kirkby, we&rsquo;re a local team you can rely on for anything from a quick repair to a complete new roof. Straight talking, fair pricing and a clean, careful finish every time.",
    ],
    nearby: ["Mansfield Woodhouse", "Forest Town", "Sutton-in-Ashfield", "Kirkby-in-Ashfield", "Rainworth", "Warsop", "Blidworth"],
  },
  {
    key: "arnold",
    name: "Arnold",
    postcode: "NG5",
    county: "Nottinghamshire",
    title: "Roofers in Arnold | Coburn Roofing",
    desc: "Trusted roofers in Arnold (NG5) & the Gedling area. Roof repairs, re-roofs, flat roofing, chimneys, leadwork & guttering. Free quotes from Coburn Roofing.",
    answer:
      "Coburn Roofing is a local roofer serving Arnold and the wider Gedling borough (NG5). We handle roof repairs, re-roofs, flat roofing, chimney repointing, leadwork and new guttering for Arnold homeowners, with free no-obligation quotes and quick response for leaks.",
    intro: [
      "Arnold is largely made up of comfortable interwar and post-war semis and terraces, with pockets of newer housing towards Redhill and Woodthorpe. It&rsquo;s exactly the kind of roofing we do day in, day out &mdash; from replacing slipped tiles and re-bedding ridges to full re-roofs.",
      "Being on the north-east side of Nottingham, Arnold is right on our doorstep, so we can get to you quickly for urgent repairs and give a prompt, honest quote for bigger jobs. Neighbouring Daybrook, Woodthorpe and Redhill are all covered too.",
    ],
    nearby: ["Daybrook", "Woodthorpe", "Redhill", "Carlton", "Mapperley", "Gedling", "Calverton"],
  },
  {
    key: "ilkeston",
    name: "Ilkeston",
    postcode: "DE7",
    county: "Derbyshire",
    title: "Roofers in Ilkeston | Coburn Roofing",
    desc: "Local roofers in Ilkeston (DE7) & the Erewash area. Roof repairs, re-roofing, flat roofs, chimneys, leadwork & guttering. Free quotes from Coburn Roofing.",
    answer:
      "Coburn Roofing serves Ilkeston and the Erewash area (DE7), sitting right between Nottingham and Derby. We carry out roof repairs, re-roofs, flat roofing, chimney work, leadwork and guttering for Ilkeston homeowners, with free quotes and honest, local advice.",
    intro: [
      "Ilkeston has plenty of Victorian and Edwardian terraces around the town centre and Cotmanhay, alongside interwar semis and newer estates in Kirk Hallam. Older terraced roofs in particular often need re-roofing or ridge and chimney work, all of which we handle.",
      "Because Ilkeston sits neatly between our Nottingham and Derby coverage, we&rsquo;re well placed to reach you fast &mdash; whether it&rsquo;s a storm-damaged roof or a planned re-roof. Long Eaton, Heanor and Sandiacre are all within our patch too.",
    ],
    nearby: ["Cotmanhay", "Kirk Hallam", "Long Eaton", "Heanor", "Sandiacre", "Stanton-by-Dale", "West Hallam"],
  },
  {
    key: "belper",
    name: "Belper",
    postcode: "DE56",
    county: "Derbyshire",
    title: "Roofers in Belper | Coburn Roofing",
    desc: "Roofers in Belper (DE56) & the Amber Valley. Sensitive re-roofs, repairs, chimney & leadwork on older and conservation-area properties. Free quotes — Coburn Roofing.",
    answer:
      "Coburn Roofing covers Belper and the Amber Valley (DE56). Belper has many older stone and brick properties, including homes within the Derwent Valley Mills conservation area, so we take particular care to match materials and keep roofs in keeping while making them fully watertight.",
    intro: [
      "Belper is a historic mill town with a lot of characterful older housing &mdash; stone and brick terraces, period cottages and properties within the Derwent Valley Mills World Heritage Site. Roofs here often call for reclaimed or matching materials and a careful, sympathetic approach.",
      "We&rsquo;re happy to work on these older roofs as well as the town&rsquo;s newer housing, from repointing weathered chimneys and renewing lead valleys to full re-roofs using tiles or slate that suit the property. Duffield, Milford, Ambergate and Ripley are covered too.",
    ],
    nearby: ["Duffield", "Milford", "Ambergate", "Ripley", "Heage", "Kilburn", "Little Eaton"],
  },
];
const locByKey = Object.fromEntries(LOCATIONS.map((l) => [l.key, l]));

/* ----------------------------------------------------------------------------
   Data — reviews & general FAQs
---------------------------------------------------------------------------- */
const REVIEWS = [
  { quote: "Zak and the team did a fantastic job on our re-roof. Turned up when they said they would, kept the site spotless and the finish is spot on. Couldn't recommend them more highly.", loc: "Re-roof · Facebook review" },
  { quote: "Called Coburn after a storm took some tiles off. Came out the next day, sorted the repair quickly and the price was fair. Proper professional outfit — would use again without hesitation.", loc: "Storm repair · Facebook review" },
  { quote: "Brilliant service from start to finish. Honest quote, no nasty surprises and the roof looks fantastic. You can tell they take real pride in their work.", loc: "New roof · Facebook review" },
];

const GENERAL_FAQS = [
  { q: "Do you offer free quotes?", a: "Yes &mdash; every quote is free and with no obligation. We&rsquo;ll inspect the roof, explain what needs doing in plain English and give you a clear written price with no pressure to go ahead." },
  { q: "Which areas do you cover?", a: "We cover " + AREA_LINE + ", Arnold, Ilkeston, Belper and the surrounding East Midlands. If you&rsquo;re nearby and not sure, just give us a call." },
  { q: "Are you local?", a: "Yes. Coburn Roofing is a local, owner-run team based around Nottingham. When you call, you deal with the people actually doing the work &mdash; not a call centre." },
  { q: "Do you do emergency repairs?", a: "Yes. If water&rsquo;s coming in, call " + BIZ.phone + " and we&rsquo;ll do our best to get to you quickly, make the roof safe and prevent further damage." },
  { q: "How do I get a quote?", a: "Call or WhatsApp us on " + BIZ.phone + ", or send a message through the contact page. We&rsquo;ll arrange a convenient time to take a look and get your quote over to you." },
  { q: "Do you clean up after the work?", a: "Always. We treat your property with respect, protect the areas we work around and leave the site clean and tidy when we&rsquo;re finished." },
];

/* ----------------------------------------------------------------------------
   Shared HTML partials
---------------------------------------------------------------------------- */
const REL = (depth) => (depth ? "" : ""); // all pages are flat (root) — assets at ./
const A = "assets";

function head(page) {
  const url = BIZ.SITE_URL + "/" + (page.path === "index.html" ? "" : page.path);
  const title = page.title;
  const desc = page.desc;
  const ld = (page.schema || []).map((s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join("\n");
  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="${url}">
<meta name="theme-color" content="#1E1E1E">
<meta name="robots" content="index,follow">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${BIZ.name}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${BIZ.SITE_URL}/${A}/og-image.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" href="${A}/logo-mark.png">
<link rel="apple-touch-icon" href="${A}/logo-mark.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${A}/site.css">
${ld}
</head>
<body>`;
}

function header(active) {
  const svc = SERVICES.map((s) => `<li><a href="${s.key}.html">${s.nav}</a></li>`).join("");
  const loc = LOCATIONS.map((l) => `<li><a href="roofers-${l.key}.html">${l.name}</a></li>`).join("");
  const on = (k) => (active === k ? ' class="active"' : "");
  return `
<header class="site-header">
  <div class="wrap">
    <nav class="nav" data-open="false">
      <a class="nav-logo" href="index.html" aria-label="${BIZ.name} home"><img src="${A}/logo.png" alt="${BIZ.name}"></a>
      <ul class="nav-links">
        <li><a href="index.html"${on("home")}>Home</a></li>
        <li class="nav-has-children"><a href="services.html"${on("services")}>Services</a>
          <ul class="nav-drop">${svc}</ul>
        </li>
        <li class="nav-has-children"><a href="areas.html"${on("areas")}>Areas</a>
          <ul class="nav-drop">${loc}</ul>
        </li>
        <li><a href="about.html"${on("about")}>About</a></li>
        <li><a href="reviews.html"${on("reviews")}>Reviews</a></li>
        <li><a href="contact.html"${on("contact")}>Contact</a></li>
      </ul>
      <a class="nav-cta" href="${BIZ.phoneHref}">${ic("phone")}${BIZ.phone}</a>
      <button class="nav-toggle" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>
    </nav>
  </div>
</header>`;
}

function trustBar() {
  const items = [
    ["checkSolid", "Free, no-obligation quotes"],
    ["checkSolid", "Local, owner-run team"],
    ["checkSolid", "Workmanship you can see"],
    ["checkSolid", "Fast response on leaks"],
  ];
  return `<div class="trustbar"><div class="wrap">${items
    .map(([i, t]) => `<div>${ic(i)}<span>${t}</span></div>`)
    .join("")}</div></div>`;
}

function ctaBand(headline, sub) {
  return `
<section class="section cta-band">
  <div class="wrap">
    <h2>${headline}</h2>
    <p>${sub}</p>
    <div class="btn-row" style="justify-content:center;margin-top:26px">
      <a class="btn btn-white btn-lg" href="${BIZ.phoneHref}">${ic("phone")}Call ${BIZ.phone}</a>
      <a class="btn btn-ghost btn-lg" href="${waHref}" target="_blank" rel="noopener">${ic("whatsapp")}WhatsApp us</a>
    </div>
  </div>
</section>`;
}

function floatCta() {
  return `
<div class="float-cta">
  <a class="float-call" href="${BIZ.phoneHref}" aria-label="Call ${BIZ.name}">${ic("phoneSolid")}</a>
  <a class="float-wa" href="${waHref}" target="_blank" rel="noopener" aria-label="WhatsApp ${BIZ.name}">${ic("whatsapp")}</a>
</div>`;
}

function footer() {
  const svc = SERVICES.map((s) => `<li><a href="${s.key}.html">${s.nav}</a></li>`).join("");
  const loc = LOCATIONS.map((l) => `<li><a href="roofers-${l.key}.html">Roofers in ${l.name}</a></li>`).join("");
  return `
<footer class="site-footer">
  <div class="wrap">
    <div class="footer-top">
      <div class="footer-col">
        <div class="footer-logo"><img src="${A}/logo.png" alt="${BIZ.name}"></div>
        <p>Local, owner-run roofers covering ${AREA_LINE} and the wider East Midlands. Re-roofs, repairs, flat roofing, chimneys, leadwork and guttering &mdash; done properly.</p>
        <div class="footer-social">
          <a href="${BIZ.fb}" target="_blank" rel="noopener" aria-label="Facebook">${ic("facebook")}</a>
          <a href="${waHref}" target="_blank" rel="noopener" aria-label="WhatsApp">${ic("whatsapp")}</a>
        </div>
      </div>
      <div class="footer-col"><h4>Services</h4><ul>${svc}</ul></div>
      <div class="footer-col"><h4>Areas We Cover</h4><ul>${loc}</ul></div>
      <div class="footer-col"><h4>Contact</h4><ul>
        <li><a href="${BIZ.phoneHref}">${BIZ.phone}</a> (mobile)</li>
        <li><a href="${BIZ.landlineHref}">${BIZ.landline}</a></li>
        <li><a href="${waHref}" target="_blank" rel="noopener">WhatsApp us</a></li>
        <li><a href="mailto:${BIZ.email}">Email us</a></li>
        <li>${BIZ.hours}</li>
      </ul></div>
    </div>
    <div class="footer-bottom">
      <span>&copy; <span id="year">2026</span> ${BIZ.legal}. All rights reserved.</span>
      <span>Roofers in ${AREA_LINE} &middot; <a href="faqs.html">FAQs</a> &middot; <a href="reviews.html">Reviews</a> &middot; <a href="sitemap.xml">Sitemap</a></span>
      <span>Website by <a href="https://innov8workflows.co.uk" target="_blank" rel="noopener">Innov8 Workflows</a></span>
    </div>
  </div>
</footer>
${floatCta()}
<script src="${A}/site.js" defer></script>
</body>
</html>`;
}

/* ---- reusable content blocks ---- */
function crumbs(items) {
  // items: [{label, href}] last has no href
  const parts = items
    .map((it, i) => (it.href && i < items.length - 1 ? `<a href="${it.href}">${it.label}</a>` : `<span>${it.label}</span>`))
    .join(" &rsaquo; ");
  return `<nav class="crumbs" aria-label="Breadcrumb">${parts}</nav>`;
}

function quickAnswer(text, heading) {
  return `<div class="quick-answer"><h2>${heading || "In short"}</h2><p>${text}</p></div>`;
}

function servicesGrid(heading, sub) {
  const cards = SERVICES.map(
    (s) => `
    <a class="svc-card" href="${s.key}.html">
      <div class="svc-ico">${ic(s.icon)}</div>
      <h3>${s.name}</h3>
      <p>${s.card}</p>
      <span class="more">Learn more ${ic("checkC") ? "&rarr;" : ""}</span>
    </a>`
  ).join("");
  return `
<section class="section" id="services">
  <div class="wrap">
    <div class="section-head center">
      <span class="eyebrow">What we do</span>
      <h2>${heading}</h2>
      ${sub ? `<p class="lead mx-auto maxw">${sub}</p>` : ""}
    </div>
    <div class="grid g-3">${cards}</div>
  </div>
</section>`;
}

function areasGrid(heading) {
  const cards = LOCATIONS.map(
    (l) => `<li><a href="roofers-${l.key}.html">${ic("pinSolid")}<span>Roofers in ${l.name}</span></a></li>`
  ).join("");
  return `
<section class="section bg-alt" id="areas">
  <div class="wrap">
    <div class="section-head center">
      <span class="eyebrow">Where we work</span>
      <h2>${heading}</h2>
      <p class="lead mx-auto maxw">Proudly serving homeowners across ${AREA_LINE}, Arnold, Ilkeston, Belper and the surrounding East Midlands.</p>
    </div>
    <ul class="area-links">${cards}</ul>
  </div>
</section>`;
}

function reviewsBlock(heading) {
  const cards = REVIEWS.map(
    (r) => `
    <div class="rev-card">
      <div class="rev-stars">${"&#9733;".repeat(5)}</div>
      <p class="rev-quote">&ldquo;${r.quote}&rdquo;</p>
      <div class="rev-who">
        <span class="rev-av">${ic("star")}</span>
        <span><span class="rev-name">Verified customer</span><span class="rev-loc">${r.loc}</span></span>
      </div>
    </div>`
  ).join("");
  return `
<section class="section" id="reviews">
  <div class="wrap">
    <div class="section-head center">
      <span class="eyebrow">Reviews</span>
      <h2>${heading || "What our customers say"}</h2>
      <p class="lead mx-auto maxw">Honest feedback from homeowners across the East Midlands.</p>
    </div>
    <div class="rev-grid">${cards}</div>
    <div class="center" style="margin-top:34px"><a class="btn btn-primary" href="reviews.html">Read more reviews</a></div>
  </div>
</section>`;
}

function faqBlock(faqs, heading) {
  const items = faqs
    .map(
      (f) => `<details><summary>${f.q}</summary><div class="faq-body"><p>${f.a}</p></div></details>`
    )
    .join("");
  return `
<section class="section bg-alt" id="faqs">
  <div class="wrap">
    <div class="section-head center">
      <span class="eyebrow">FAQs</span>
      <h2>${heading || "Frequently asked questions"}</h2>
    </div>
    <div class="faq">${items}</div>
  </div>
</section>`;
}

function ticks(items) {
  return `<ul class="ticks cols">${items.map((t) => `<li>${ic("checkSolid")}<span>${t}</span></li>`).join("")}</ul>`;
}

function processSteps(serviceName) {
  const steps = [
    ["Get in touch", `Call, WhatsApp or message us and tell us about your ${serviceName.toLowerCase()}. We&rsquo;ll arrange a convenient time to come and take a look.`],
    ["Free inspection &amp; quote", "We inspect the roof, explain what needs doing in plain English and send you a clear, written quote &mdash; free and with no obligation."],
    ["We do the work", "Once you&rsquo;re happy to go ahead, we get the job booked in and carried out properly, keeping you updated and protecting your property throughout."],
    ["Clean finish &amp; walk-round", "We clear away all waste, leave the site spotless and check you&rsquo;re completely happy with the finished job before we go."],
  ];
  return `
<section class="section">
  <div class="wrap">
    <div class="section-head center">
      <span class="eyebrow">How it works</span>
      <h2>Simple, straightforward, no pressure</h2>
    </div>
    <ol class="steps g-4">${steps.map(([h, p]) => `<li><h4>${h}</h4><p>${p}</p></li>`).join("")}</ol>
  </div>
</section>`;
}

/* ---- schema builders ---- */
function localBusinessSchema(extra) {
  return Object.assign(
    {
      "@context": "https://schema.org",
      "@type": "RoofingContractor",
      "@id": BIZ.SITE_URL + "/#business",
      name: BIZ.name,
      image: BIZ.SITE_URL + "/" + A + "/og-image.jpg",
      logo: BIZ.SITE_URL + "/" + A + "/logo-mark.png",
      url: BIZ.SITE_URL + "/",
      telephone: BIZ.phoneE164,
      email: BIZ.email,
      priceRange: "££",
      address: { "@type": "PostalAddress", addressLocality: "Nottingham", addressRegion: "Nottinghamshire", addressCountry: "GB" },
      areaServed: LOCATIONS.map((l) => ({ "@type": "City", name: l.name })),
      sameAs: [BIZ.fb],
      openingHoursSpecification: [
        { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], opens: "07:00", closes: "19:00" },
      ],
    },
    extra || {}
  );
}
function breadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.label, item: BIZ.SITE_URL + "/" + (it.path || "") })),
  };
}
function faqSchema(faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q.replace(/&[a-z]+;/g, ""), acceptedAnswer: { "@type": "Answer", text: f.a.replace(/<[^>]+>/g, "").replace(/&[a-z]+;/g, "") } })),
  };
}
function serviceSchema(s) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: s.plain,
    provider: { "@id": BIZ.SITE_URL + "/#business" },
    areaServed: LOCATIONS.map((l) => l.name),
    name: s.plain + " in " + BIZ.baseCity,
    description: s.desc,
    url: BIZ.SITE_URL + "/" + s.key + ".html",
  };
}

/* ----------------------------------------------------------------------------
   Page builders
---------------------------------------------------------------------------- */
function pageHero(opts) {
  // opts: {bg, cls, crumbsHtml, eyebrow, h1, sub, badges, ctas}
  return `
<section class="hero ${opts.cls || ""}">
  <img class="hero-bg" src="${A}/${opts.bg || "hero.jpg"}" alt="${opts.bgAlt || "Coburn Roofing work"}" ${opts.eager ? 'fetchpriority="high"' : 'loading="lazy"'}>
  <div class="hero-overlay"></div>
  <div class="wrap">
    <div class="hero-inner">
      ${opts.crumbsHtml || ""}
      ${opts.eyebrow ? `<span class="eyebrow">${opts.eyebrow}</span>` : ""}
      <h1>${opts.h1}</h1>
      ${opts.sub ? `<p class="hero-sub">${opts.sub}</p>` : ""}
      <div class="btn-row">
        <a class="btn btn-primary btn-lg" href="${BIZ.phoneHref}">${ic("phone")}Call ${BIZ.phone}</a>
        <a class="btn btn-ghost btn-lg" href="contact.html">Get a free quote</a>
      </div>
      ${opts.badges || ""}
    </div>
  </div>
</section>`;
}

function buildHome() {
  const badges = `<ul class="hero-badges">
    <li>${ic("checkSolid")}Free, no-obligation quotes</li>
    <li>${ic("checkSolid")}Local, owner-run team</li>
    <li>${ic("checkSolid")}Re-roofs, repairs &amp; more</li>
    <li>${ic("checkSolid")}Fast response on leaks</li>
  </ul>`;
  const schema = [
    localBusinessSchema(),
    { "@context": "https://schema.org", "@type": "WebSite", name: BIZ.name, url: BIZ.SITE_URL + "/" },
    faqSchema(GENERAL_FAQS),
  ];
  const body = `
${pageHero({
    bg: "hero.jpg",
    bgAlt: "Newly re-roofed home by Coburn Roofing",
    eager: true,
    eyebrow: AREA_LINE,
    h1: `Expert Roofers in <span class="accent">Nottingham, Derby &amp; Mansfield</span>`,
    sub: "Professional re-roofs, repairs, chimneys, flat roofing and leadwork across the East Midlands. Quality craftsmanship from a local team that takes pride in every job.",
    badges,
  })}
${trustBar()}

<section class="section">
  <div class="wrap">
    <div class="split">
      <div>
        <span class="eyebrow">Your local roofer</span>
        <h2>Roofing done properly, by people who care</h2>
        <div class="quick-answer" style="margin:18px 0 22px">
          <h3>Who are Coburn Roofing?</h3>
          <p>Coburn Roofing is a local, owner-run roofing company serving ${AREA_LINE} and the surrounding East Midlands. We install new roofs and carry out repairs, flat roofing, chimney work, leadwork and guttering &mdash; with free quotes, honest advice and a tidy, professional finish.</p>
        </div>
        <p>Whether you&rsquo;ve got a leak that needs sorting today or you&rsquo;re planning a full re-roof, you&rsquo;ll deal directly with the people doing the work. No call centres, no hard sell &mdash; just straight answers, fair prices and workmanship you can see.</p>
        <div class="btn-row" style="margin-top:8px">
          <a class="btn btn-primary" href="services.html">Our services</a>
          <a class="btn btn-ghost" href="about.html">About us</a>
        </div>
      </div>
      <div class="split-media">
        <img src="${A}/work-2.jpg" alt="Immaculate new tiled roof completed by Coburn Roofing" loading="lazy">
      </div>
    </div>
  </div>
</section>

${servicesGrid("Complete roofing services", "From a single slipped tile to a full re-roof, we handle every part of your roof &mdash; and everything is quoted free, with no obligation.")}

<section class="section bg-dark">
  <div class="wrap">
    <div class="split">
      <div class="split-media tall">
        <div class="video-wrap">
          <span class="video-badge">Real Coburn job</span>
          <video data-lazy muted loop playsinline preload="none" poster="${A}/transformation-poster.jpg">
            <source src="${A}/transformation.mp4" type="video/mp4">
          </video>
        </div>
      </div>
      <div>
        <span class="eyebrow">See the difference</span>
        <h2>From tired &amp; worn to watertight</h2>
        <p class="lead">This full re-roof took a stripped, failing roof back to a completely new, weathertight covering &mdash; new membrane, battens, tiles, ridge and flashings.</p>
        <p>It&rsquo;s the kind of transformation we carry out every week across the East Midlands. Every job gets the same care: proper preparation, quality materials and a genuinely tidy finish.</p>
        <div class="btn-row"><a class="btn btn-primary" href="new-roofs.html">New roofs &amp; re-roofing</a></div>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head center">
      <span class="eyebrow">Our work</span>
      <h2>Recent roofs across the East Midlands</h2>
      <p class="lead mx-auto maxw">A few examples of the roofs we&rsquo;ve repaired and replaced for local homeowners.</p>
    </div>
    <div class="gallery">
      <figure><img src="${A}/work-1.jpg" alt="New grey slate roof with valley detail" loading="lazy"><figcaption>Slate re-roof</figcaption></figure>
      <figure><img src="${A}/work-2.jpg" alt="Immaculate new dark tiled roof" loading="lazy"><figcaption>Full re-roof</figcaption></figure>
      <figure><img src="${A}/work-3.jpg" alt="Modern tiled roof with dry ridge" loading="lazy"><figcaption>Tiled roof &amp; ridge</figcaption></figure>
      <figure><img src="${A}/work-4.jpg" alt="Restored pitched tile roof and chimney" loading="lazy"><figcaption>Roof &amp; chimney</figcaption></figure>
      <figure><img src="${A}/work-5.jpg" alt="Coburn Roofing team stripping a roof for re-roofing" loading="lazy"><figcaption>Strip &amp; re-roof</figcaption></figure>
      <figure><img src="${A}/about.jpg" alt="Coburn Roofing branded van in a Nottingham street" loading="lazy"><figcaption>On the job locally</figcaption></figure>
    </div>
  </div>
</section>

<section class="section bg-alt">
  <div class="wrap">
    <div class="section-head center">
      <span class="eyebrow">Why Coburn Roofing</span>
      <h2>Local roofers you can rely on</h2>
    </div>
    <div class="grid g-4">
      <div class="feat"><div class="feat-ico">${ic("tag")}</div><div><h4>Honest, free quotes</h4><p>Clear written prices with no pressure and no hidden extras &mdash; you&rsquo;ll always know exactly where you stand.</p></div></div>
      <div class="feat"><div class="feat-ico">${ic("shield")}</div><div><h4>Quality materials</h4><p>We use trusted, quality tiles, slate, lead and membranes so your roof lasts &mdash; not the cheapest we can find.</p></div></div>
      <div class="feat"><div class="feat-ico">${ic("mapPin")}</div><div><h4>Local &amp; trusted</h4><p>An owner-run team from the East Midlands. You deal with the people on the roof, start to finish.</p></div></div>
      <div class="feat"><div class="feat-ico">${ic("checkC")}</div><div><h4>Clean &amp; tidy</h4><p>We respect your home, protect the areas around the work and leave the site spotless every time.</p></div></div>
    </div>
  </div>
</section>

${reviewsBlock()}
${areasGrid("Areas we cover")}
${faqBlock(GENERAL_FAQS)}
${ctaBand("Get a free roofing quote today", `Call, WhatsApp or message ${BIZ.name} for honest advice and a free, no-obligation quote anywhere across ${AREA_LINE} and the East Midlands.`)}
`;
  return page({ path: "index.html", title: "Coburn Roofing | Roofers in Nottingham, Derby & Mansfield", desc: "Local, trusted roofers in Nottingham, Derby & Mansfield. Re-roofs, roof repairs, flat roofing, chimneys, leadwork & guttering. Free, no-obligation quotes.", active: "home", schema, body });
}

function buildService(s) {
  const rel = SERVICES.filter((x) => x.key !== s.key).slice(0, 3);
  const relHtml = rel
    .map((x) => `<a class="svc-card" href="${x.key}.html"><div class="svc-ico">${ic(x.icon)}</div><h3>${x.name}</h3><p>${x.card}</p><span class="more">Learn more &rarr;</span></a>`)
    .join("");
  const schema = [
    localBusinessSchema(),
    serviceSchema(s),
    breadcrumbSchema([
      { label: "Home", path: "" },
      { label: "Services", path: "services.html" },
      { label: s.plain, path: s.key + ".html" },
    ]),
    faqSchema(s.faqs),
  ];
  const body = `
${pageHero({
    cls: "hero-page",
    bg: "hero.jpg",
    bgAlt: s.plain + " by Coburn Roofing",
    crumbsHtml: crumbs([{ label: "Home", href: "index.html" }, { label: "Services", href: "services.html" }, { label: s.nav }]),
    eyebrow: "Roofing services",
    h1: s.name,
    sub: "Serving " + AREA_LINE + ", Arnold, Ilkeston, Belper &amp; the East Midlands.",
  })}
${trustBar()}

<section class="section">
  <div class="wrap">
    <div style="max-width:820px;margin:0 auto 10px">${quickAnswer(s.answer, s.plain + " with Coburn Roofing")}</div>
    <div class="split" style="margin-top:44px">
      <div class="prose">
        ${s.intro.map((p) => `<p>${p}</p>`).join("")}
        <h2>What&rsquo;s included</h2>
        ${ticks(s.includes)}
      </div>
      <div class="split-media">
        <img src="${A}/work-1.jpg" alt="${s.plain} carried out by Coburn Roofing" loading="lazy">
        <div style="margin-top:24px" class="quick-answer">
          <h3>${s.signs.title}</h3>
          <ul class="ticks" style="margin:6px 0 0">${s.signs.items.map((i) => `<li>${ic("checkSolid")}<span>${i}</span></li>`).join("")}</ul>
        </div>
      </div>
    </div>
  </div>
</section>

${processSteps(s.plain)}

<section class="section bg-alt">
  <div class="wrap">
    <div class="section-head center"><span class="eyebrow">Where we work</span><h2>${s.plain} across the East Midlands</h2>
    <p class="lead mx-auto maxw">We provide ${s.plain.toLowerCase()} to homeowners throughout these areas &mdash; and everywhere in between.</p></div>
    <ul class="area-links">${LOCATIONS.map((l) => `<li><a href="roofers-${l.key}.html">${ic("pinSolid")}<span>${l.name}</span></a></li>`).join("")}</ul>
  </div>
</section>

${faqBlock(s.faqs, s.plain + " &mdash; your questions answered")}

<section class="section">
  <div class="wrap">
    <div class="section-head center"><span class="eyebrow">More services</span><h2>Other roofing services</h2></div>
    <div class="grid g-3">${relHtml}</div>
  </div>
</section>

${ctaBand("Need " + s.plain.toLowerCase() + "?", `Get a free, no-obligation quote for ${s.plain.toLowerCase()} anywhere across ${AREA_LINE} and the East Midlands.`)}
`;
  return page({ path: s.key + ".html", title: s.title, desc: s.desc, active: "services", schema, body });
}

function buildLocation(l) {
  const schema = [
    localBusinessSchema({ areaServed: { "@type": "City", name: l.name } }),
    breadcrumbSchema([
      { label: "Home", path: "" },
      { label: "Areas", path: "areas.html" },
      { label: l.name, path: "roofers-" + l.key + ".html" },
    ]),
    faqSchema(locFaqs(l)),
  ];
  const body = `
${pageHero({
    cls: "hero-page",
    bg: "hero.jpg",
    bgAlt: "Roofers working in " + l.name,
    crumbsHtml: crumbs([{ label: "Home", href: "index.html" }, { label: "Areas", href: "areas.html" }, { label: l.name }]),
    eyebrow: l.county + " &middot; " + l.postcode,
    h1: `Roofers in <span class="accent">${l.name}</span>`,
    sub: "Local re-roofs, roof repairs, flat roofing, chimneys, leadwork &amp; guttering in " + l.name + " and nearby.",
  })}
${trustBar()}

<section class="section">
  <div class="wrap">
    <div style="max-width:820px;margin:0 auto 10px">${quickAnswer(l.answer, "Roofers in " + l.name)}</div>
    <div class="split" style="margin-top:44px">
      <div class="prose">
        ${l.intro.map((p) => `<p>${p}</p>`).join("")}
        <h2>Areas we cover around ${l.name}</h2>
        <p>As well as ${l.name} itself, we regularly work in the surrounding areas:</p>
        <ul class="chips">${l.nearby.map((n) => `<li>${n}</li>`).join("")}</ul>
      </div>
      <div class="split-media">
        <img src="${A}/work-3.jpg" alt="Roof completed by Coburn Roofing near ${l.name}" loading="lazy">
        <div style="margin-top:24px" class="quick-answer">
          <h3>Why ${l.name} homeowners choose us</h3>
          <ul class="ticks" style="margin:6px 0 0">
            <li>${ic("checkSolid")}<span>Local team &mdash; quick to reach ${l.name}</span></li>
            <li>${ic("checkSolid")}<span>Free, no-obligation written quotes</span></li>
            <li>${ic("checkSolid")}<span>Honest advice, no hard sell</span></li>
            <li>${ic("checkSolid")}<span>Clean, tidy and reliable</span></li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section bg-alt">
  <div class="wrap">
    <div class="section-head center"><span class="eyebrow">What we do in ${l.name}</span><h2>Roofing services in ${l.name}</h2>
    <p class="lead mx-auto maxw">Every part of your roof covered &mdash; all quoted free, with no obligation.</p></div>
    <div class="grid g-3">
      ${SERVICES.map((s) => `<a class="svc-card" href="${s.key}.html"><div class="svc-ico">${ic(s.icon)}</div><h3>${s.name}</h3><p>${s.card}</p><span class="more">Learn more &rarr;</span></a>`).join("")}
    </div>
  </div>
</section>

${reviewsBlock("Trusted by homeowners near " + l.name)}
${faqBlock(locFaqs(l), "Roofers in " + l.name + " &mdash; FAQs")}
${ctaBand("Looking for a roofer in " + l.name + "?", `Call, WhatsApp or message ${BIZ.name} for a free, no-obligation quote in ${l.name} (${l.postcode}) and the surrounding area.`)}
`;
  return page({ path: "roofers-" + l.key + ".html", title: l.title, desc: l.desc, active: "areas", schema, body });
}

function locFaqs(l) {
  return [
    { q: "Do you cover " + l.name + "?", a: "Yes &mdash; " + l.name + " (" + l.postcode + ") is right in our patch. We cover the whole town and nearby areas including " + l.nearby.slice(0, 3).join(", ") + " and more." },
    { q: "Can you come out quickly for a leak in " + l.name + "?", a: "We&rsquo;re a local team, so we can usually get to " + l.name + " quickly for urgent leaks. Call " + BIZ.phone + " and we&rsquo;ll do our best to attend fast, make the roof safe and stop further damage." },
    { q: "Do you offer free roofing quotes in " + l.name + "?", a: "Yes. All our quotes are free and with no obligation. We&rsquo;ll inspect your roof in " + l.name + ", explain what&rsquo;s needed and give you a clear written price." },
    { q: "What roofing work do you do in " + l.name + "?", a: "Everything from roof repairs and re-roofs to flat roofing, chimney repairs, leadwork and new fascias, soffits and guttering &mdash; for all types of property in " + l.name + "." },
  ];
}

function buildServicesHub() {
  const schema = [
    localBusinessSchema(),
    breadcrumbSchema([{ label: "Home", path: "" }, { label: "Services", path: "services.html" }]),
  ];
  const body = `
${pageHero({
    cls: "hero-page",
    crumbsHtml: crumbs([{ label: "Home", href: "index.html" }, { label: "Services" }]),
    eyebrow: "What we do",
    h1: "Our Roofing Services",
    sub: "Complete roofing for homeowners across " + AREA_LINE + " and the East Midlands.",
  })}
${trustBar()}
<section class="section">
  <div class="wrap">
    <div style="max-width:820px;margin:0 auto 6px">${quickAnswer("Coburn Roofing offers a full range of roofing services across the East Midlands &mdash; new roofs and re-roofing, roof repairs, flat roofing, chimney repairs and repointing, leadwork, and fascias, soffits and guttering. Every job is quoted free, with no obligation.", "Our services at a glance")}</div>
  </div>
</section>
${servicesGrid("Everything your roof needs")}
${areasGrid("Where we work")}
${ctaBand("Not sure what you need?", "Tell us what&rsquo;s going on with your roof and we&rsquo;ll give you honest advice and a free quote &mdash; no pressure, no jargon.")}
`;
  return page({ path: "services.html", title: "Roofing Services in Nottingham, Derby & Mansfield | Coburn Roofing", desc: "Coburn Roofing services: new roofs & re-roofing, roof repairs, flat roofing (EPDM & GRP), chimney repairs, leadwork and guttering across the East Midlands. Free quotes.", active: "services", schema, body });
}

function buildAreasHub() {
  const schema = [
    localBusinessSchema(),
    breadcrumbSchema([{ label: "Home", path: "" }, { label: "Areas", path: "areas.html" }]),
  ];
  const body = `
${pageHero({
    cls: "hero-page",
    crumbsHtml: crumbs([{ label: "Home", href: "index.html" }, { label: "Areas" }]),
    eyebrow: "Where we work",
    h1: "Areas We Cover",
    sub: "Local roofers serving " + AREA_LINE + ", Arnold, Ilkeston, Belper and the surrounding East Midlands.",
  })}
${trustBar()}
<section class="section">
  <div class="wrap">
    <div style="max-width:820px;margin:0 auto 6px">${quickAnswer("Coburn Roofing covers Nottingham, Derby, Mansfield, Arnold, Ilkeston, Belper and the surrounding East Midlands. As a local, owner-run team we can reach most areas quickly for repairs, and we provide free quotes for all roofing work across the region.", "Our coverage")}</div>
  </div>
</section>
${areasGrid("Choose your area")}
${servicesGrid("What we do in your area")}
${ctaBand("Not sure if you&rsquo;re in our area?", `Just give us a call on ${BIZ.phone} &mdash; if you&rsquo;re in or near the East Midlands, we&rsquo;ll almost certainly be able to help.`)}
`;
  return page({ path: "areas.html", title: "Areas We Cover | Roofers Across the East Midlands | Coburn Roofing", desc: "Coburn Roofing covers Nottingham, Derby, Mansfield, Arnold, Ilkeston, Belper and the surrounding East Midlands. Local roofers, free quotes, fast response.", active: "areas", schema, body });
}

function buildAbout() {
  const schema = [localBusinessSchema(), breadcrumbSchema([{ label: "Home", path: "" }, { label: "About", path: "about.html" }])];
  const body = `
${pageHero({
    cls: "hero-page",
    crumbsHtml: crumbs([{ label: "Home", href: "index.html" }, { label: "About" }]),
    eyebrow: "About us",
    h1: "The People Behind Coburn Roofing",
    sub: "A local, owner-run roofing team that takes real pride in every job.",
  })}
${trustBar()}
<section class="section">
  <div class="wrap">
    <div class="split">
      <div class="prose">
        <span class="eyebrow">Our story</span>
        <h2>Local roofers who do it properly</h2>
        <p>Coburn Roofing is a local, owner-run roofing company covering ${AREA_LINE} and the wider East Midlands. Led by ${BIZ.owner}, we built the business on a simple idea: turn up when we say we will, do the job properly, and treat every customer&rsquo;s home like our own.</p>
        <p>Roofing has a reputation for cowboys and nasty surprises. We&rsquo;re the opposite &mdash; clear written quotes, honest advice about what does (and doesn&rsquo;t) need doing, quality materials, and a genuinely tidy finish. When you call us, you speak to the people who&rsquo;ll actually be on your roof.</p>
        <p>From single tile repairs to full re-roofs, flat roofing, chimneys and leadwork, we bring the same care to every job &mdash; big or small.</p>
        <div class="btn-row" style="margin-top:6px">
          <a class="btn btn-primary" href="contact.html">Get a free quote</a>
          <a class="btn btn-ghost" href="reviews.html">Read our reviews</a>
        </div>
      </div>
      <div class="split-media">
        <img src="${A}/about.jpg" alt="Coburn Roofing branded van and team on a job locally" loading="lazy">
      </div>
    </div>
  </div>
</section>

<section class="section bg-alt">
  <div class="wrap">
    <div class="section-head center"><span class="eyebrow">What we stand for</span><h2>What you can expect from us</h2></div>
    <div class="grid g-4">
      <div class="feat"><div class="feat-ico">${ic("tag")}</div><div><h4>Honest pricing</h4><p>Free, clear, written quotes with no hidden extras and no pressure to go ahead.</p></div></div>
      <div class="feat"><div class="feat-ico">${ic("shield")}</div><div><h4>Quality materials</h4><p>Trusted tiles, slate, lead and membranes, fitted to last &mdash; not cut corners.</p></div></div>
      <div class="feat"><div class="feat-ico">${ic("clock")}</div><div><h4>Reliable</h4><p>We turn up when we say we will and keep you updated from start to finish.</p></div></div>
      <div class="feat"><div class="feat-ico">${ic("checkC")}</div><div><h4>Tidy &amp; respectful</h4><p>We protect your property and leave the site spotless when the job&rsquo;s done.</p></div></div>
    </div>
  </div>
</section>
${servicesGrid("What we do")}
${reviewsBlock()}
${ctaBand("Ready to talk to a real local roofer?", `Call, WhatsApp or message ${BIZ.name} for honest advice and a free, no-obligation quote.`)}
`;
  return page({ path: "about.html", title: "About Coburn Roofing | Local Roofers in the East Midlands", desc: "Coburn Roofing is a local, owner-run roofing team covering Nottingham, Derby & Mansfield. Honest pricing, quality materials and a tidy finish on every job.", active: "about", schema, body });
}

function buildReviews() {
  const schema = [localBusinessSchema(), breadcrumbSchema([{ label: "Home", path: "" }, { label: "Reviews", path: "reviews.html" }])];
  const cards = REVIEWS.map(
    (r) => `<div class="rev-card"><div class="rev-stars">${"&#9733;".repeat(5)}</div><p class="rev-quote">&ldquo;${r.quote}&rdquo;</p><div class="rev-who"><span class="rev-av">${ic("star")}</span><span><span class="rev-name">Verified customer</span><span class="rev-loc">${r.loc}</span></span></div></div>`
  ).join("");
  const body = `
${pageHero({
    cls: "hero-page",
    crumbsHtml: crumbs([{ label: "Home", href: "index.html" }, { label: "Reviews" }]),
    eyebrow: "Reviews",
    h1: "What Our Customers Say",
    sub: "Honest feedback from homeowners across " + AREA_LINE + " and the East Midlands.",
  })}
${trustBar()}
<section class="section">
  <div class="wrap">
    <div class="rev-grid">${cards}</div>
    <div class="center" style="margin-top:40px">
      <div style="max-width:640px;margin:0 auto 26px" class="quick-answer"><h3>Had work done by us?</h3><p>We&rsquo;d really appreciate a quick review &mdash; it helps other local homeowners find a roofer they can trust. It only takes 30 seconds.</p></div>
      <div class="btn-row" style="justify-content:center">
        <a class="btn btn-primary btn-lg" href="${BIZ.fb}" target="_blank" rel="noopener">${ic("facebook")}Leave a review</a>
        <a class="btn btn-ghost btn-lg" href="contact.html">Get a quote</a>
      </div>
    </div>
  </div>
</section>
${ctaBand("Join our happy customers", `Get a free, no-obligation quote from ${BIZ.name} today &mdash; and see why local homeowners recommend us.`)}
`;
  return page({ path: "reviews.html", title: "Reviews | Coburn Roofing — Roofers in Nottingham, Derby & Mansfield", desc: "Read reviews for Coburn Roofing from homeowners across Nottingham, Derby & Mansfield. Honest, reliable, tidy roofing work — see what our customers say.", active: "reviews", schema, body });
}

function buildFaqs() {
  const all = GENERAL_FAQS.concat([
    { q: "How much does a new roof or repair cost?", a: "Every roof is different, so we don&rsquo;t do one-size-fits-all pricing. We give free written quotes based on the actual job, the materials you choose and access &mdash; so you know exactly what you&rsquo;re paying before anything starts." },
    { q: "Do you use scaffolding?", a: "For larger jobs and re-roofs, yes &mdash; it&rsquo;s safer and gives a better finish. We arrange it as part of the job. Smaller repairs may only need ladders or a tower." },
    { q: "Do you guarantee your work?", a: "We stand behind our workmanship and only use quality materials. We&rsquo;ll talk you through what&rsquo;s covered for your specific job when we quote." },
    { q: "How soon can you start?", a: "It depends on our current schedule and the type of work, but we&rsquo;ll always give you a realistic timescale. For emergency leaks we prioritise getting you made safe quickly." },
  ]);
  const schema = [localBusinessSchema(), breadcrumbSchema([{ label: "Home", path: "" }, { label: "FAQs", path: "faqs.html" }]), faqSchema(all)];
  const body = `
${pageHero({
    cls: "hero-page",
    crumbsHtml: crumbs([{ label: "Home", href: "index.html" }, { label: "FAQs" }]),
    eyebrow: "FAQs",
    h1: "Frequently Asked Questions",
    sub: "Everything you might want to know about working with Coburn Roofing.",
  })}
${trustBar()}
${faqBlock(all, "Your questions, answered")}
${ctaBand("Still got a question?", `Give us a call or a message &mdash; we&rsquo;re happy to help and quotes are always free.`)}
`;
  return page({ path: "faqs.html", title: "Roofing FAQs | Coburn Roofing — Nottingham, Derby & Mansfield", desc: "Common questions about roof repairs, re-roofs, flat roofing, quotes, guarantees and timescales — answered by Coburn Roofing, your local East Midlands roofer.", active: "faqs", schema, body });
}

function buildContact() {
  const schema = [localBusinessSchema(), breadcrumbSchema([{ label: "Home", path: "" }, { label: "Contact", path: "contact.html" }])];
  const body = `
${pageHero({
    cls: "hero-page",
    crumbsHtml: crumbs([{ label: "Home", href: "index.html" }, { label: "Contact" }]),
    eyebrow: "Get in touch",
    h1: "Contact Coburn Roofing",
    sub: "Free, no-obligation quotes across " + AREA_LINE + " and the East Midlands.",
  })}
${trustBar()}
<section class="section">
  <div class="wrap">
    <div class="contact-grid">
      <div>
        <span class="eyebrow">Talk to us</span>
        <h2>The quickest way to a quote</h2>
        <p class="lead">Call or WhatsApp for the fastest response &mdash; you&rsquo;ll get straight through to the team, not a call centre.</p>
        <div class="contact-item"><div class="contact-ico">${ic("phone")}</div><div><strong>Call (mobile)</strong><a href="${BIZ.phoneHref}">${BIZ.phone}</a></div></div>
        <div class="contact-item"><div class="contact-ico">${ic("phone")}</div><div><strong>Call (landline)</strong><a href="${BIZ.landlineHref}">${BIZ.landline}</a></div></div>
        <div class="contact-item"><div class="contact-ico">${ic("message")}</div><div><strong>WhatsApp</strong><a href="${waHref}" target="_blank" rel="noopener">Message us on WhatsApp</a></div></div>
        <div class="contact-item"><div class="contact-ico">${ic("mail")}</div><div><strong>Email</strong><a href="mailto:${BIZ.email}">${BIZ.email}</a></div></div>
        <div class="contact-item"><div class="contact-ico">${ic("clock")}</div><div><strong>Hours</strong>${BIZ.hours}</div></div>
        <div class="contact-item"><div class="contact-ico">${ic("mapPin")}</div><div><strong>Areas covered</strong>${AREA_LINE}, Arnold, Ilkeston, Belper &amp; the East Midlands</div></div>
      </div>
      <div>
        <span class="eyebrow">Send a message</span>
        <h2>Request a free quote</h2>
        <form class="form" action="https://api.web3forms.com/submit" method="POST">
          <input type="hidden" name="access_key" value="YOUR_WEB3FORMS_KEY">
          <input type="hidden" name="subject" value="New quote request — Coburn Roofing website">
          <input type="checkbox" name="botcheck" style="display:none">
          <div class="row"><label for="name">Your name</label><input id="name" name="name" required></div>
          <div class="row"><label for="phone">Phone</label><input id="phone" name="phone" type="tel" required></div>
          <div class="row"><label for="email">Email</label><input id="email" name="email" type="email"></div>
          <div class="row"><label for="area">Your area</label><input id="area" name="area" placeholder="e.g. Arnold, Nottingham"></div>
          <div class="row"><label for="service">What do you need?</label>
            <select id="service" name="service">
              <option>Roof repair</option><option>New roof / re-roof</option><option>Flat roofing</option>
              <option>Chimney repairs</option><option>Lead work</option><option>Fascias, soffits &amp; guttering</option>
              <option>Emergency / leak</option><option>Something else</option>
            </select>
          </div>
          <div class="row"><label for="message">Details</label><textarea id="message" name="message" placeholder="Tell us a bit about the job…"></textarea></div>
          <button class="btn btn-primary btn-block btn-lg" type="submit">Send my request</button>
          <p class="hint">Prefer to talk? Call or WhatsApp <a href="${BIZ.phoneHref}">${BIZ.phone}</a> for the fastest response.</p>
        </form>
      </div>
    </div>
  </div>
</section>
${ctaBand("Get your free quote today", `Honest advice and a no-obligation price anywhere across ${AREA_LINE} and the East Midlands.`)}
`;
  return page({ path: "contact.html", title: "Contact Coburn Roofing | Free Roofing Quotes — Nottingham & Derby", desc: "Contact Coburn Roofing for a free, no-obligation roofing quote in Nottingham, Derby, Mansfield and across the East Midlands. Call, WhatsApp or send a message.", active: "contact", schema, body });
}

function build404() {
  const body = `
<section class="hero hero-page" style="min-height:60vh;display:flex;align-items:center">
  <img class="hero-bg" src="${A}/hero.jpg" alt="">
  <div class="hero-overlay"></div>
  <div class="wrap"><div class="hero-inner">
    <span class="eyebrow">404</span>
    <h1>Page not found</h1>
    <p class="hero-sub">Sorry &mdash; that page doesn&rsquo;t exist. Let&rsquo;s get you back on track.</p>
    <div class="btn-row"><a class="btn btn-primary btn-lg" href="index.html">Back to home</a><a class="btn btn-ghost btn-lg" href="${BIZ.phoneHref}">${ic("phone")}Call ${BIZ.phone}</a></div>
  </div></div>
</section>`;
  return page({ path: "404.html", title: "Page Not Found | Coburn Roofing", desc: "The page you were looking for could not be found.", active: "", schema: [], body, noindex: true });
}

/* ----------------------------------------------------------------------------
   Page assembler + writer
---------------------------------------------------------------------------- */
function page(p) {
  if (p.noindex) {
    // build a head with noindex
    const url = BIZ.SITE_URL + "/" + p.path;
    const h = head(p).replace('content="index,follow"', 'content="noindex,follow"');
    return { path: p.path, html: h + header(p.active) + p.body + footer() };
  }
  return { path: p.path, html: head(p) + header(p.active) + p.body + footer() };
}

function write(f, content) {
  fs.writeFileSync(path.join(OUT, f), content);
  return f;
}

/* ----------------------------------------------------------------------------
   Generate everything
---------------------------------------------------------------------------- */
const pages = [];
pages.push(buildHome());
pages.push(buildServicesHub());
pages.push(buildAreasHub());
SERVICES.forEach((s) => pages.push(buildService(s)));
LOCATIONS.forEach((l) => pages.push(buildLocation(l)));
pages.push(buildAbout());
pages.push(buildReviews());
pages.push(buildFaqs());
pages.push(buildContact());
pages.push(build404());

const written = pages.map((pg) => write(pg.path, pg.html));

/* sitemap.xml (exclude 404) */
const indexable = pages.filter((p) => p.path !== "404.html");
const today = "2026-07-05";
const sitemap =
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  indexable
    .map((p) => {
      const loc = BIZ.SITE_URL + "/" + (p.path === "index.html" ? "" : p.path);
      const pri = p.path === "index.html" ? "1.0" : p.path.startsWith("roofers-") || SERVICES.some((s) => s.key + ".html" === p.path) ? "0.8" : "0.6";
      return `  <url><loc>${loc}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>${pri}</priority></url>`;
    })
    .join("\n") +
  `\n</urlset>\n`;
write("sitemap.xml", sitemap);

/* robots.txt */
write(
  "robots.txt",
  `User-agent: *\nAllow: /\n\nSitemap: ${BIZ.SITE_URL}/sitemap.xml\n`
);

console.log("Generated " + written.length + " pages + sitemap.xml + robots.txt");
written.forEach((f) => console.log("  " + f));
