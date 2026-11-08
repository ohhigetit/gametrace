/* Home Court ActivityList integration: source-only / feature branch.
 * Reuses original rendered rows, icons and click handlers; no data writes.
 * Fails closed when the page does not expose two distinct recent-activity lists.
 */
(function () {
  'use strict';
  const priorRender = renderHomeCourt;
  const rootId = 'courtContent';
  const isHeading = node => node && /^H[2-5]$/.test(node.tagName);
  const normalize = value => String(value || '').replace(/\s+/g, ' ').trim().toLowerCase();
  const isGames = s => /^recent games?$/.test(normalize(s));
  const isSessions = s => /^recent (trainings?|sessions?|training(?:s)?\s*(?:&|and)\s*camps?)$/.test(normalize(s));
  const rowSelector = '.gt-list-row';
  function findBlock(root, heading, otherHeading) {
    // Find the smallest section-like ancestor, including documented empty states.
    // and never select a shared ancestor containing the other list.
    for (let node = heading.parentElement; node && node !== root; node = node.parentElement) {
      if (node.contains(otherHeading)) continue;
      if (node.matches('section,article,.gt-section,.court-section,.home-court-section,[data-section]')) return node;
    }
    for (let node = heading.parentElement; node && node !== root; node = node.parentElement) {
      if (!node.contains(otherHeading) && node.querySelector(rowSelector)) return node;
    }
    return null;
  }
  function leaves(block) {
    return [...block.querySelectorAll(rowSelector)]
      .filter(row => !row.querySelector(rowSelector));
  }
  function parsedDay(row) {
    // Prefer authoritative date data already rendered in each record.
    const attr = row.getAttribute('data-date') || row.querySelector('time[datetime]')?.getAttribute('datetime');
    const text = attr || row.textContent;
    const iso = String(text).match(/\b(20\d\d)-(0[1-9]|1[0-2])-([0-2]\d|3[01])\b/);
    if (iso) { const date = Date.parse(iso[0] + 'T12:00:00Z'); return Number.isFinite(date) ? date : null; }
    const named = String(text).match(/\b(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|SEPT|OCT|NOV|DEC)[A-Z]*\s+\d{1,2},?\s+20\d{2}\b/i);
    if (named) { const date = Date.parse(named[0]); return Number.isFinite(date) ? date : null; }
    return null;
  }
  function enhance(row, type) {
    row.classList.add('gtc-existing-activity', 'gtc-existing-' + type);
    row.dataset.activityType = type;
    // Preserve approved, already-rendered icon markup and event handlers.
    for (const leaf of row.querySelectorAll('small,span')) {
      if (leaf.children.length) continue;
      if (/^(GAME|TRAINING|SKILLS TRAINING|PERFORMANCE TRAINING|CAMP)$/i.test(leaf.textContent.trim()))
        leaf.classList.add('gtc-legacy-category');
    }
    return row;
  }
  function integrate() {
    const C = window.GameTraceComponents, root = document.getElementById(rootId);
    if (!C || !root || root.querySelector('[data-gtc-home-activity]')) return;
    const headings = [...root.querySelectorAll('h2,h3,h4,h5')].filter(isHeading);
    const gamesHeading = headings.find(n => isGames(n.textContent));
    const sessionsHeading = headings.find(n => isSessions(n.textContent));
    if (!gamesHeading || !sessionsHeading) return;
    const gamesBlock = findBlock(root,gamesHeading,sessionsHeading);
    const sessionsBlock = findBlock(root,sessionsHeading,gamesHeading);
    if (!gamesBlock || !sessionsBlock || gamesBlock === sessionsBlock ||
        gamesBlock.contains(sessionsBlock) || sessionsBlock.contains(gamesBlock)) return;
    const gamesRows = leaves(gamesBlock), sessionRows = leaves(sessionsBlock);
    // Zero-activity states are valid: show the unified empty message.
    // Keep original row nodes so navigation, details, source icons and
    // existing on-click handlers remain fully intact.
    const records = [...gamesRows.map(row => ({row,type:'game'})),
                     ...sessionRows.map(row => ({row,type:'training'}))];
    const allDates = records.map(({row}) => parsedDay(row));
    if (allDates.every(date => date !== null)) {
      records.forEach((record,index) => {record.date = allDates[index];record.index=index;});
      records.sort((a,b)=>b.date-a.date||a.index-b.index);
    }
    // Do not silently remove existing section actions. Retain original
    // buttons/links using their live nodes and handlers.
    const actions = [...gamesBlock.querySelectorAll('button,a'),...sessionsBlock.querySelectorAll('button,a')]
      .filter(el => !el.closest(rowSelector) && (/view all|see all|all games|^gym$/i.test(el.textContent.trim()) || /view.all/i.test(el.getAttribute('aria-label') || '')));
    const list = C.ActivityList({existingRows:records.map(item => enhance(item.row,item.type))});
    const section = C.Section({title:'Recent Activity',subtitle:'The work behind your journey.',content:list,kind:'gtc-home-activity'});
    section.dataset.gtcHomeActivity = 'true';
    if (actions.length) {
      const actionArea = document.createElement('div');
      actionArea.className = 'gtc-original-actions';
      actions.forEach(button => actionArea.appendChild(button));
      section.querySelector('.gtc-section-header')?.appendChild(actionArea);
    }
    // Insert where the first of the original groups appeared.
    const first = gamesBlock.compareDocumentPosition(sessionsBlock) & Node.DOCUMENT_POSITION_FOLLOWING
      ? gamesBlock : sessionsBlock;
    first.before(section);
    gamesBlock.remove();
    sessionsBlock.remove();
  }
  renderHomeCourt = function (...args) {
    const result = priorRender.apply(this,args);
    try { integrate(); }
    catch (error) { console.warn('Home Court ActivityList integration skipped:', error); }
    return result;
  };
})();
