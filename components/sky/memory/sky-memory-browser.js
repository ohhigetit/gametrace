'use strict';
/** Sky Memory & Discovery V1 — testable in-memory domain model, no cloud or AI writes. */
const randomUUID=()=>globalThis.crypto.randomUUID();
const deep=v=>JSON.parse(JSON.stringify(v));
const validCategory=new Set(['I SEE','I AM','I WILL BECOME']);
const validSourceKind=new Set(['game','training','personal','goal','family_award','schedule']);
const normalized=s=>typeof s==='string'?s.trim():'';
const safeText=(value,max=6000)=>{const s=normalized(value);if(!s||s.length>max)throw Error('Invalid text');return s};
const key=(player)=>normalized(player).toLowerCase();
function createSkyMemoryV1({player,now=()=>new Date().toISOString(),id=randomUUID,authorize=()=>false}={}){
 player=safeText(player,100);
 if(typeof authorize!=='function'||authorize(player)!==true)throw Error('Player authorization required');
 const conversations=new Map(),messages=new Map(),discoveries=new Map(),dna=new Map(),links=[];
 const allowed=(p)=>{if(key(p)!==key(player)||authorize(player)!==true)throw Error('Player access denied')};
 const get=(map,itemId)=>{const item=map.get(itemId);if(!item||item.deletedAt)throw Error('Record not found');allowed(item.player);return item};
 const copy=v=>deep(v);
 const sourceRef=source=>{if(!source||!validSourceKind.has(source.kind)||!normalized(source.id)||source.kind==='personal'&&['prayer','commitment'].includes(source.type))throw Error('Invalid or private source');return {kind:source.kind,id:safeText(source.id,120),field:normalized(source.field).slice(0,120)}};
 function createConversation({title='New Conversation',sourceRefs=[]}={}){allowed(player);const at=now(),r={id:id(),player,title:safeText(title,120),status:'active',createdAt:at,updatedAt:at,deletedAt:null,version:1};conversations.set(r.id,r);sourceRefs.forEach(source=>linkSource({targetType:'conversation',targetId:r.id,source}));return copy(r)}
 function listConversations({limit=30}={}){allowed(player);return [...conversations.values()].filter(c=>!c.deletedAt).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)).slice(0,Math.min(100,Math.max(1,limit))).map(copy)}
 function appendMessage({conversationId,role,text}={}){const thread=get(conversations,conversationId);if(!['player','sky','system'].includes(role))throw Error('Invalid role');const at=now(),m={id:id(),player,conversationId,role,text:safeText(text,10000),createdAt:at};messages.set(m.id,m);thread.updatedAt=at;thread.version++;return copy(m)}
 function listMessages(conversationId){get(conversations,conversationId);return [...messages.values()].filter(m=>m.conversationId===conversationId).sort((a,b)=>a.createdAt.localeCompare(b.createdAt)).map(copy)}
 function linkSource({targetType,targetId,source}={}){if(targetType==='conversation')get(conversations,targetId);else if(targetType==='discovery')get(discoveries,targetId);else if(targetType==='dna')get(dna,targetId);else throw Error('Invalid target type');const s=sourceRef(source),link={player,targetType,targetId,source:s};if(!links.some(l=>l.targetType===targetType&&l.targetId===targetId&&JSON.stringify(l.source)===JSON.stringify(s)))links.push(link);return copy(link)}
 function listSources(targetType,targetId){allowed(player);return links.filter(l=>l.targetType===targetType&&l.targetId===targetId).map(copy)}
 function proposeDiscovery({conversationId,category,statement,sourceRefs=[]}={}){get(conversations,conversationId);if(!validCategory.has(category))throw Error('Invalid category');const at=now(),d={id:id(),conversationId,player,category,statement:safeText(statement,1200),status:'proposed',createdAt:at,updatedAt:at,approvedAt:null,linkedRecordId:null};discoveries.set(d.id,d);sourceRefs.forEach(source=>linkSource({targetType:'discovery',targetId:d.id,source}));return copy(d)}
 function listDiscoveries({conversationId}={}){allowed(player);return [...discoveries.values()].filter(d=>!conversationId||d.conversationId===conversationId).map(copy)}
 function reviseDiscovery({discoveryId,statement}={}){const d=get(discoveries,discoveryId);if(d.status!=='proposed')throw Error('Approved discoveries must not be edited in place');d.statement=safeText(statement,1200);d.updatedAt=now();return copy(d)}
 function dismissDiscovery(discoveryId){const d=get(discoveries,discoveryId);if(d.status!=='proposed')throw Error('Only proposals can be dismissed');d.status='dismissed';d.updatedAt=now();return copy(d)}
 /** Simulated approval boundary. Real app needs server-enforced authenticated action + auditable approval. */
 function approveDiscovery({discoveryId,approval}={}){const d=get(discoveries,discoveryId);if(d.status!=='proposed')throw Error('Not an active proposal');if(!approval||approval.player!==player||approval.discoveryId!==discoveryId||approval.accepted!==true||approval.statement!==d.statement)throw Error('Explicit approval for exact statement required');d.status='approved';d.approvedAt=now();d.updatedAt=d.approvedAt;return copy(d)}
 function fileApprovedDiscovery({discoveryId}={}){const d=get(discoveries,discoveryId);if(d.status!=='approved')throw Error('Approval required before filing');if(d.linkedRecordId)throw Error('Discovery already filed');if(d.category==='I WILL BECOME')return {status:'requires-playbook-confirmation',proposal:copy(d),note:'Must use real Playbook goal workflow with SMART validation and separate server approval'};
 const at=now(),entry={id:id(),player,category:d.category,statement:d.statement,evidenceLevel:'unassessed',sourceDiscoveryId:d.id,createdAt:at,updatedAt:at,deletedAt:null};dna.set(entry.id,entry);for(const l of listSources('discovery',d.id))linkSource({targetType:'dna',targetId:entry.id,source:l.source});d.status='filed';d.linkedRecordId=entry.id;d.updatedAt=at;return {status:'filed-in-local-preview',entry:copy(entry)};}
 function listDNA(){allowed(player);return [...dna.values()].filter(x=>!x.deletedAt).map(copy)}
 function completeConversation(conversationId){const c=get(conversations,conversationId);c.status='completed';c.updatedAt=now();return copy(c)}
 function deleteConversation(conversationId,{confirm}={}){const c=get(conversations,conversationId);if(confirm!==`DELETE ${conversationId}`)throw Error('Separate deletion confirmation required');c.deletedAt=now();c.updatedAt=c.deletedAt;return copy(c)}
 function exportSnapshot(){allowed(player);return copy({schema:'sky-memory-v1-local',player,conversations:[...conversations.values()],messages:[...messages.values()],discoveries:[...discoveries.values()],dna:[...dna.values()],links});}
 return Object.freeze({createConversation,listConversations,appendMessage,listMessages,linkSource,listSources,proposeDiscovery,listDiscoveries,reviseDiscovery,dismissDiscovery,approveDiscovery,fileApprovedDiscovery,listDNA,completeConversation,deleteConversation,exportSnapshot,capabilities:()=>({mode:'local-in-memory',cloud:false,authoritativeApproval:false,playbookWrites:false})});
}
window.GameTraceSkyMemoryV1={createSkyMemoryV1};
