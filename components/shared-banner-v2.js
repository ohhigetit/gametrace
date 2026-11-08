/** GameTrace SharedBanner V2 — approved 2026-11-08.
 * Layout-only composition: Section V1 owns all titles, subtitles, actions.
 * SharedBanner V2: rows (1–N), each 1–3 BannerCells; optional secondary details.
 * See approved/SharedBanner_V2_BannerCell_Content_Variants_APPROVED.html.
 * This module is additive; not wired into app builds until integration approval.
 */
(function(global){
'use strict';
const doc=global.document;
if(!doc)return;
const ns='gtv2-';
function el(tag,klass,text){
  const node=doc.createElement(tag);
  if(klass)node.className=ns+klass;
  if(text!==undefined&&text!==null)node.textContent=String(text);
  return node;
}
function add(parent,child){
  if(child===undefined||child===null||child===false)return;
  if(Array.isArray(child)){child.forEach(item=>add(parent,item));return;}
  if(child instanceof global.Node)parent.appendChild(child);
  else parent.appendChild(doc.createTextNode(String(child)));
}
function setAttributes(node,obj){
  if(!obj)return;
  Object.entries(obj).forEach(([name,value])=>{
    if(value!==undefined&&value!==null)node.setAttribute(name,String(value));
  });
}
function Content({type='custom',label,value,subtext,text,progress,max=5,steps,badge,content}={}){
  const root=el('div','content');
  root.dataset.type=type;
  if(label!==undefined)add(root,el('span','cell-label',label));
  switch(type){
    case 'stat':
      if(value!==undefined)add(root,el('strong','cell-value',value));
      break;
    case 'info':
      if(value!==undefined)add(root,el('strong','cell-info',value));
      break;
    case 'status':
      if(value!==undefined)add(root,el('span','badge',value));
      break;
    case 'summary':
      add(root,el('div','summary-text',text??value??''));
      break;
    case 'progress':{
      if(value!==undefined)add(root,el('strong','cell-value is-medium',value));
      if(steps!==undefined){
        const count=Math.max(0,Math.min(20,Math.round(Number(max)||5)));
        const done=Math.max(0,Math.min(count,Math.round(Number(steps)||0)));
        const row=el('div','progress-dots');
        row.setAttribute('role','img');
        row.setAttribute('aria-label',done+' of '+count+' complete');
        for(let i=0;i<count;i++){
          const dot=el('span','progress-dot');
          if(i<done)dot.classList.add('is-filled');
          row.appendChild(dot);
        }
        add(root,row);
      }else if(progress!==undefined){
        const pct=Math.max(0,Math.min(100,Number(progress)||0));
        const bar=el('div','progress-bar');
        bar.setAttribute('role','progressbar');
        setAttributes(bar,{'aria-valuemin':0,'aria-valuemax':100,'aria-valuenow':pct});
        const fill=el('span','progress-fill');
        fill.style.width=pct+'%';
        add(bar,fill);add(root,bar);
      }
      break;
    }
    case 'custom':
      add(root,content??text??value);
      break;
    default:throw new TypeError('Unsupported BannerCell content type: '+type);
  }
  if(badge!==undefined&&type!=='status')add(root,el('span','badge',badge));
  if(subtext!==undefined)add(root,el('span','cell-sub',subtext));
  return root;
}
function BannerCell({align='left',compact=false,content,items}={}){
  if(!['left','center','right'].includes(align))throw new TypeError('Invalid cell alignment');
  const node=el('div','banner-cell');
  node.classList.add(ns+'align-'+align);
  if(compact)node.classList.add(ns+'compact');
  const group=items??content;
  if(Array.isArray(group))group.forEach(part=>add(node,part instanceof global.Node?part:Content(part)));
  else if(group instanceof global.Node)add(node,group);
  else if(group&&typeof group==='object')add(node,Content(group));
  else if(group!==undefined)add(node,group);
  return node;
}
function BannerRow({cells=[],divider=false,rowDivider=false,widths}={}){
  if(!Array.isArray(cells)||cells.length<1||cells.length>3)
    throw new TypeError('BannerRow needs 1–3 cells');
  const node=el('div','banner-row');
  node.classList.add(ns+'cols-'+cells.length);
  if(divider&&cells.length>1)node.classList.add(ns+'dividers');
  if(rowDivider)node.classList.add(ns+'row-line');
  if(widths!==undefined){
    if(!Array.isArray(widths)||widths.length!==cells.length||widths.some(x=>!(Number(x)>0)))
      throw new TypeError('widths must contain one positive number per cell');
    node.style.gridTemplateColumns=widths.map(x=>'minmax(0,'+Number(x)+'fr)').join(' ');
  }
  cells.forEach(cell=>add(node,cell instanceof global.Node?cell:BannerCell(cell)));
  return node;
}
function rowArea(rows,secondary=false){
  const area=el('div','banner-area');
  if(secondary)area.classList.add(ns+'secondary');
  rows.forEach((row,i)=>{
    const cfg=row instanceof global.Node?row:{...row,rowDivider:row?.rowDivider??(i>0)};
    add(area,row instanceof global.Node?row:BannerRow(cfg));
  });
  return area;
}
function SharedBannerV2({primaryRows,secondaryRows=[],expanded=false}={}){
  if(!Array.isArray(primaryRows)||primaryRows.length<1)
    throw new TypeError('SharedBanner V2 requires at least one primary row');
  if(!Array.isArray(secondaryRows))throw new TypeError('secondaryRows must be an array');
  const box=el('div','banner');
  add(box,rowArea(primaryRows));
  if(secondaryRows.length){
    const details=el('details','more');
    details.open=Boolean(expanded);
    const summary=el('summary','toggle');
    const label=el('span','toggle-label',expanded?'Hide Details':'Show Details');
    add(summary,label);
    const arrow=el('span','arrow','⌄');
    arrow.setAttribute('aria-hidden','true');
    add(summary,arrow);
    details.addEventListener('toggle',()=>{
      label.textContent=details.open?'Hide Details':'Show Details';
    });
    add(details,summary);
    add(details,rowArea(secondaryRows,true));
    add(box,details);
  }
  return box;
}
global.GameTraceSharedBannerV2=Object.freeze({
  version:'2.0.0',SharedBannerV2,BannerRow,BannerCell,Content
});
})(window);
