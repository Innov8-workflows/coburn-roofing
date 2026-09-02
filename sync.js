/* Copy the built site out of the generator folder and into ./_site.
 *
 *   node sync.js && npx wrangler deploy
 *
 * WHY THIS EXISTS
 * ---------------
 * This repo used to hold its own copy of build.js alongside the pages. The two
 * copies drifted: the copy here gained the innov8 CRM track.js snippet and the
 * generator on K: never did, so the next rebuild from source would silently
 * have deleted the tracking from every page. There is now exactly one build.js,
 * it lives at SRC below, and this script only ever copies its output.
 *
 * Do not hand-edit anything in _site. It is overwritten wholesale from here.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const SRC = 'K:/AI/innov8 Workflows/Claude v2/coburn-roofing-site';
const DST = path.join(__dirname, '_site');

/* Allowlist, not a denylist: build.js, build.js.bak, site.config.js and
   node_modules all live beside the output and none of them belong in a
   published asset directory. */
const FILES = ['robots.txt', 'sitemap.xml', '_headers'];
/* .well-known carries security.txt. It is a DIR entry rather than a FILES one
   because the allowlist is flat and would otherwise never reach the site. */
const DIRS = ['assets', 'media', '.well-known'];

if (!fs.existsSync(SRC)) {
  console.error('sync: generator folder not found: ' + SRC);
  console.error('sync: K: is a cloud drive and has gone missing before now.');
  process.exit(1);
}

/* Editor and tool leftovers must never reach a published asset directory.
   site.css.bak and site.js.bak were deployed once before this filter existed. */
const JUNK = /\.(bak|orig|rej|swp|tmp)$|~$|^\.DS_Store$|^Thumbs\.db$/i;
const copyDir = (from, to) => {
  fs.rmSync(to, { recursive: true, force: true });
  fs.cpSync(from, to, { recursive: true, filter: src => !JUNK.test(path.basename(src)) });
};

fs.mkdirSync(DST, { recursive: true });

const html = fs.readdirSync(SRC).filter(f => f.endsWith('.html'));
if (!html.length) {
  console.error('sync: no .html in ' + SRC + ' - run `node build.js` there first');
  process.exit(1);
}

/* Drop pages that no longer exist in the generator, so a renamed or deleted
   page cannot linger in _site and stay published. */
for (const f of fs.readdirSync(DST)) {
  if (f.endsWith('.html') && !html.includes(f)) {
    fs.rmSync(path.join(DST, f));
    console.log('  removed stale ' + f);
  }
}

for (const f of [...html, ...FILES]) {
  const from = path.join(SRC, f);
  if (!fs.existsSync(from)) { console.error('sync: missing ' + f); process.exit(1); }
  fs.copyFileSync(from, path.join(DST, f));
}
for (const d of DIRS) {
  const from = path.join(SRC, d);
  if (!fs.existsSync(from)) { console.error('sync: missing ' + d + '/'); process.exit(1); }
  copyDir(from, path.join(DST, d));
}

console.log('synced ' + html.length + ' pages + ' + FILES.length + ' files + ' + DIRS.join(', ') + ' -> _site');
