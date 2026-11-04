const GameTraceAwards=(()=>{
 const text=(v,max,required=true)=>{if(typeof v!=='string'||v.length>max||required&&!v.trim())throw Error('Invalid family trophy text.');return v.trim()};
 const stamp=v=>{if(!v||!Number.isFinite(Date.parse(v)))throw Error('Invalid trophy date.');return new Date(v).toISOString()};
 function definition(x){return{id:text(x.id,120),familyId:text(x.familyId,120),name:text(x.name,100),description:text(x.description||'',500,false),createdBy:text(x.createdBy,120),createdByName:text(x.createdByName||'Family admin',100),createdAt:stamp(x.createdAt),updatedAt:stamp(x.updatedAt),deletedAt:x.deletedAt?stamp(x.deletedAt):null}}
 function award(x){return{id:text(x.id,120),familyId:text(x.familyId,120),definitionId:text(x.definitionId,120),name:text(x.name,100),reason:text(x.reason,1000),player:text(x.player,100),awardedBy:text(x.awardedBy,120),awardedByName:text(x.awardedByName||'Family admin',100),awardedAt:stamp(x.awardedAt),revokedAt:x.revokedAt?stamp(x.revokedAt):null,revokedBy:x.revokedBy?text(x.revokedBy,120):null}}
 function list(xs,fn){if(xs==null)return[];if(!Array.isArray(xs)||xs.length>10000)throw Error('Invalid trophy records.');const out=xs.map(fn);if(new Set(out.map(x=>x.id)).size!==out.length)throw Error('Duplicate trophy records.');return out}
 function reset(x){const count=v=>Number.isInteger(v)&&v>=0?v:0;return{id:text(x.id,120),familyId:text(x.familyId,120),cutoff:stamp(x.cutoff),createdBy:text(x.createdBy,120),trainingCount:count(x.trainingCount),awardCount:count(x.awardCount)}}
 return Object.freeze({reset,resets:xs=>list(xs,reset),definition,award,definitions:xs=>list(xs,definition),awards:xs=>list(xs,award)});
})();
if(typeof module!=='undefined'&&module.exports)module.exports=GameTraceAwards;
