
/**
 * GameTrace Timeline V1 — reusable content component (review candidate).
 *
 * Renders the existing, unmodified GameTrace timeline DOM/graph through a
 * supplied renderTimeline(game) adapter. The legacy renderer creates the
 * View and score/event checkboxes; we DETACH those intact native controls
 * and return them to TimelineSection V1. Their original event listeners and
 * state survive moving the nodes. The Timeline V1 DOM itself contains no
 * filters, view selector, or section header.
 *
 * No game data or analytics calculations are modified.
 */
(function(global){
 'use strict';
 if(global.GameTraceTimelineV1) return;
 function create(options){
   if(!options || typeof options.renderTimeline !== 'function'){
     throw new TypeError('Timeline V1 needs a renderTimeline(game) adapter');
   }
   const native = options.renderTimeline(options.game);
   if(!(native instanceof global.HTMLElement)){
     throw new TypeError('Timeline V1 renderer must return an HTMLElement');
   }
   const view = native.querySelector('.timeline-focus');
   const filters = native.querySelector('.score-journey-filters');
   // Preserve original DOM elements and attached listeners; don't clone.
   view?.remove();
   filters?.remove();
   const host = global.document.createElement('div');
   host.className = 'gt-tlc-v1';
   host.dataset.component = 'TimelineV1';
   host.dataset.slot = 'timeline';
   native.classList.add('gt-tls-timeline');
   // Timeline V1 is always visible. Keep native <details> wrapper only for
   // renderer compatibility; its summary is hidden and disclosure is locked open.
   native.open = true;
   const toggle = native.querySelector(':scope > summary');
   if(toggle) toggle.hidden = true;
   native.addEventListener('toggle',()=>{ if(!native.open) native.open = true; });
   host.append(native);
   return {element:host, native, view, filters};
 }
 global.GameTraceTimelineV1=Object.freeze({create});
})(window);
