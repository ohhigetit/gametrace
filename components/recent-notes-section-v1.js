/* RecentNotesSectionV1 — adapter for the pre-existing approved SectionV1.
   Do not add another header or copy SectionV1 styles. The application must
   inject its actual approved SectionV1 renderer through renderSection.
   No new SectionV1 implementation is fabricated here. */
(function(global){
 'use strict';
 function recentNotesSectionV1(notes,config){
   const cfg=config||{},parent=cfg.renderSection;
   if(typeof parent!=='function')throw new Error('RecentNotesSectionV1 requires approved SectionV1 renderer');
   if(!global.GameTraceRecentNotesV1)throw new Error('Load RecentNotesV1 first');
   const content=global.GameTraceRecentNotesV1.render(notes,cfg);
   return parent({title:'Recent Notes',subtitle:'Thoughts worth remembering',actionLabel:'View All',onAction:cfg.onViewAll,content});
 }
 global.GameTraceRecentNotesSectionV1={render:recentNotesSectionV1};
})(typeof window!=='undefined'?window:globalThis);