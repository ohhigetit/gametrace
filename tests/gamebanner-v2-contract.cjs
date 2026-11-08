#!/usr/bin/env node
/* GameTrace GameBanner V2 approval/contract regression.
   Usage:
     node tests/gamebanner-v2-contract.cjs
     node tests/gamebanner-v2-contract.cjs /path/to/approved-dev-index.html

   First command validates the version-locked CSS reference.
   Second also checks the actual full-app implementation.
   This is a static contract check, not a substitute for visual/iPhone QA.
*/
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const css = fs.readFileSync(path.join(root,'components/approved/GameBanner_V2_Compact_APPROVED.css'),'utf8');
function has(source,pattern,description) {
  assert.match(source,pattern,description);
}
has(css,/gt-gamebanner-v2-compact-preview/,'Missing base compact CSS');
has(css,/gt-gamebanner-v2-centered-match-score/,'Missing centered match CSS');
has(css,/gt-gamebanner-v2-top-aligned-teams-action-parity/,'Missing top-aligned team CSS');
has(css,/gt-gamebanner-v2-summary-centered-except-teams/,'Missing final approved centering CSS');
has(css,/grid-template-columns:minmax\(0,2fr\) minmax\(0,1fr\)/,'Missing 2:1 primary columns');
has(css,/\.gtcompact-stats-grid\s*\{[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/s,'Missing 2x2 quick stats');
has(css,/\.gtcompact-team:first-child\s*\{[^}]*text-align:right/s,'Team must align right');
has(css,/\.gtcompact-team:last-child\s*\{[^}]*text-align:left/s,'Opponent must align left');
has(css,/\.gtcompact-vs\s*\{[^}]*text-align:center/s,'VS must align center');
has(css,/\.gtcompact-score\s*\{[^}]*text-align:center/s,'Score must align center');
has(css,/\.gtgames-featured-heading\s+\.gtgames-header-action/,'Games Open Game action must be in heading');
console.log('PASS: approved GameBanner V2 CSS design contract');
if (process.argv[2]) {
  const filename=path.resolve(process.argv[2]);
  const html=fs.readFileSync(filename,'utf8');
  has(html,/<html[\s>]/i,'Not a full HTML application');
  has(html,/gtcompact-row/,'Home Court compact banner adapter missing');
  has(html,/gtgames-compact-primary/,'Games compact banner adapter missing');
  has(html,/gtcompact-game-summary/,'Game Summary cell missing');
  has(html,/gtcompact-quick-stats/,'Top Stats cell missing');
  has(html,/gtcompact-match/,'Matchup row missing');
  has(html,/gtcompact-vs/,'VS marker missing');
  has(html,/Show Details/,'Disclosure control missing');
  has(html,/Hide Details/,'Disclosure toggle missing');
  has(html,/gtgames-header-action/,'Games header Open Game action missing');
  has(html,/gtgbv1-secondary/,'Home Court details content missing');
  has(html,/gtgames-details/,'Games details content missing');
  for (const field of ['PTS','REB','AST','STL']) {
    assert.ok(html.includes("'"+field+"'") || html.includes('>'+field+'<'),field+' stat missing');
  }
  console.log('PASS: full-app GameBanner V2 adapter contract: '+filename);
}
