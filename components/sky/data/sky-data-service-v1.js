/* Sky Data Service V1 — read-only journey retrieval, no database access or mutation.
 * Compatible with GameTrace backup v12 and in-memory db shapes from V37/V42.
 * SECURITY: the embedding application MUST supply a verified player authorization function.
 * This is an app-local adapter, not an authenticated server API.
 */
(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.GameTraceSkyDataV1 = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';
  const TYPES = Object.freeze(['note','training','game','playbook','achievement','schedule']);
  const FEEDBACK = Object.freeze([['see','I See'],['became','I Am'],['more','I Will Become'],['well','What went well'],['challenge','Challenge'],['next','Next'],['additional','Additional']]);
  const FIELDS = Object.freeze({game:'games',training:'trainingSessions',playbook:'goals',achievement:'familyAwards',schedule:'personalRecords',note:'personalRecords'});
  const clean = v => typeof v === 'string' ? v.trim() : '';
  const pk = v => clean(v).toLocaleLowerCase('en-US');
  const safeArray = v => Array.isArray(v) ? v : [];
  const clip = (value, length) => clean(value).slice(0,length);
  const freezeCopy = value => JSON.parse(JSON.stringify(value));
  function words(query){return [...new Set(clean(query).toLocaleLowerCase('en-US').match(/[\p{L}\p{N}]+/gu)||[])].filter(w=>w.length>=2).slice(0,24)}
  function matchesPlayer(row,player){return pk(row?.player) === pk(player)}
  function sourceRef(kind,id,field=''){return {kind,id,field}}
  function factory({getSnapshot,authorizePlayer}={}) {
    if (typeof getSnapshot !== 'function') throw new TypeError('getSnapshot is required');
    if (typeof authorizePlayer !== 'function') throw new TypeError('authorizePlayer is required');
    function check(player) {
      if (!clean(player)) throw new Error('A player is required');
      // Explicit trusted app authorization, never trust caller-provided player alone.
      if (authorizePlayer(player) !== true) throw new Error('Not authorized for this player');
      const snapshot = getSnapshot();
      if (!snapshot || typeof snapshot !== 'object') throw new Error('GameTrace records unavailable');
      return snapshot;
    }
    function normalize(player) {
      const db = check(player), out=[];
      function put(record){
        if (!record.recordId || !record.text) return;
        // fixed, explicit allowlisted fields only; no raw object/secret leaks
        out.push(Object.freeze(record));
      }
      for (const type of ['training','game']) {
        const rows = safeArray(db[FIELDS[type]]);
        for (const r of rows) {
          if (!r || r.deletedAt || !matchesPlayer(r,player)) continue;
          const id=clip(String(r.id??''),120),date=clip(r.date,24),title=clip(type==='game'?`${clean(r.team)||'Team'} vs ${clean(r.opponent)||'Opponent'}`:r.name,160);
          const feedback = r.feedback && typeof r.feedback === 'object' ? r.feedback : {};
          for (const [field,label] of FEEDBACK) {
            const value=clip(feedback[field],6000);
            if (value) put({key:`${type}:${id}:feedback.${field}`,kind:type,recordId:id,field:`feedback.${field}`,category:label,title,date,text:value,source:sourceRef(type,id,`feedback.${field}`)});
          }
          for(const [field,label] of [[type==='game'?'progressNotes':'notes','Progress Notes']]) {
            const value=clip(r[field],6000);
            if (value) put({key:`${type}:${id}:${field}`,kind:type,recordId:id,field,category:label,title,date,text:value,source:sourceRef(type,id,field)});
          }
          // Non-text summaries are safe to retrieve, but not blanket event data or footage.
          if(type==='game'){
            const score=r.finalScore && typeof r.finalScore==='object' ? r.finalScore : null;
            const scoreSummary=score ? Object.entries(score).filter(([k,v])=>/score|home|away|team|opponent/i.test(k)&&['string','number'].includes(typeof v)).slice(0,6).map(([k,v])=>`${k}: ${v}`).join(' · ') : '';
            if(scoreSummary)put({key:`game:${id}:finalScore`,kind:'game',recordId:id,field:'finalScore',category:'Recorded Score',title,date,text:scoreSummary,source:sourceRef('game',id,'finalScore')});
          }
        }
      }
      for(const r of safeArray(db.personalRecords)){
        if(!r||r.deletedAt||!matchesPlayer(r,player))continue;
        const type=clean(r.type).toLowerCase();
        // Prayer, Commitment, and unknown personal types are *never* selected.
        if(type==='note'){
          const id=clip(String(r.id??''),120),text=clip(r.body||r.notes,6000);
          put({key:`note:${id}:body`,kind:'note',recordId:id,field:'body',category:'Notebook Note',title:clip(r.title,160)||'Notebook Note',date:clip(r.date||r.createdAt,24),text,source:sourceRef('personal',id,'body')});
        } else if(type==='schedule'){
          const id=clip(String(r.id??''),120),title=clip(r.title,160),date=clip(r.start||r.localStart,24),text=[title,clip(r.activity,80),clip(r.location,150)].filter(Boolean).join(' · ');
          put({key:`schedule:${id}:summary`,kind:'schedule',recordId:id,field:'summary',category:'Schedule',title,date,text,source:sourceRef('personal',id,'summary')});
        }
      }
      for(const r of safeArray(db.goals)){
        if(!r||r.deletedAt||!matchesPlayer(r,player))continue;
        const id=clip(String(r.id??''),120),text=clip(r.title,160),status=clip(r.status,24),date=clip(r.targetDate,24);
        put({key:`playbook:${id}:title`,kind:'playbook',recordId:id,field:'title',category:`Playbook · ${status||'Unspecified'}`,title:text,date,text,source:sourceRef('goal',id,'title')});
      }
      for(const r of safeArray(db.familyAwards)){
        if(!r||r.revokedAt||r.deletedAt||!matchesPlayer(r,player))continue;
        const id=clip(String(r.id??''),120),title=clip(r.name,160),text=[title,clip(r.reason,1000)].filter(Boolean).join(' — ');
        put({key:`achievement:${id}:reason`,kind:'achievement',recordId:id,field:'reason',category:'Achievement',title,date:clip(r.awardedAt,24),text,source:sourceRef('family_award',id,'reason')});
      }
      // My DNA and Sky messages have no confirmed existing schema in the inspected code.
      // They must be added through a verified, independently authorized adapter later.
      return out;
    }
    function search({player,query='',kinds=TYPES,limit=20,offset=0}={}) {
      const chosen=new Set(safeArray(kinds).filter(t=>TYPES.includes(t)));
      const terms=words(query);
      const rows=normalize(player).filter(r=>chosen.has(r.kind)).map(r=>{
        const hay=`${r.title} ${r.category} ${r.text}`.toLocaleLowerCase('en-US');
        if(terms.length&&!terms.some(term=>hay.includes(term)))return null;
        const score=terms.reduce((s,t)=>s+(hay.includes(t)?1:0)+(r.text.toLocaleLowerCase('en-US').includes(t)?1:0),0);
        return {...r,score};
      }).filter(Boolean).sort((a,b)=>b.score-a.score||String(b.date).localeCompare(String(a.date))||a.key.localeCompare(b.key));
      const start=Math.max(0,Math.floor(Number(offset)||0)),size=Math.min(50,Math.max(1,Math.floor(Number(limit)||20)));
      return freezeCopy({player,total:rows.length,items:rows.slice(start,start+size).map(({score,...r})=>({...r,relevance:score}))});
    }
    function getSources({player,refs=[]}={}){
      const refsAllowed=new Set(safeArray(refs).slice(0,50).map(r=>typeof r==='string'?r:r?.key));
      return freezeCopy(normalize(player).filter(r=>refsAllowed.has(r.key)));
    }
    function context({player,query='',selectedKeys=[],maxItems=12,maxChars=12000}={}){
      const selected=getSources({player,refs:selectedKeys});
      const related=search({player,query,limit:50}).items;
      const uniq=new Map();
      for(const record of [...selected,...related])if(!uniq.has(record.key))uniq.set(record.key,record);
      const count=Math.min(20,Math.max(1,Math.floor(Number(maxItems)||12)));
      const budget=Math.min(24000,Math.max(200,Math.floor(Number(maxChars)||12000)));
      const result=[];let used=0;
      for(const entry of uniq.values()){
        if(result.length>=count)break;
        const excerpt=entry.text.slice(0,Math.max(0,budget-used));
        if(!excerpt)break;
        result.push({...entry,text:excerpt});used+=excerpt.length;
      }
      return freezeCopy({player,records:result,sourceCount:result.length,characters:used,excludedByDefault:['prayer','commitment'],missingAdapters:['myDNA','skyConversations']});
    }
    function prepareProposal({player,category,statement,sourceKeys=[]}={}){
      check(player);
      if(!['I SEE','I AM','I WILL BECOME'].includes(category))throw new Error('Unknown discovery category');
      if(!clean(statement)||clean(statement).length>1200)throw new Error('Statement required (up to 1200 characters)');
      const sources=getSources({player,refs:sourceKeys});
      if(sources.length!==new Set(sourceKeys).size)throw new Error('One or more referenced sources are unavailable');
      return freezeCopy({category,statement:clean(statement),player,sourceRefs:sources.map(r=>r.source),destination:category==='I WILL BECOME'?'playbook':'myDNA',status:'PROPOSED_NOT_SAVED',requiresPlayerApproval:true});
    }
    return Object.freeze({search,getSources,context,prepareProposal,capabilities:()=>({readOnly:true,authorization:'host-enforced',availableKinds:[...TYPES],requiresServerAuthorizationForCloud:true,privateContentExcluded:['prayer','commitment'],myDNAAdapterReady:false,skyConversationAdapterReady:false,liveAI:false})});
  }
  return Object.freeze({createSkyDataService:factory});
});
