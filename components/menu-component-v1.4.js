/* GameTrace Menu V1.4 — presentation-only child of existing App Navigation.
 * Actual page-header icons are supplied by the integration layer.
 * Approved standalone component; not integrated into the full app.
 */
(function(global){
 'use strict';
 const routes={home:'court',games:'home',training:'training',schedule:'schedule',scoreboard:'reports',playbook:'goals',wall:'trophies',notebook:'notebook',huddle:'family',settings:'settings',cloud:'family',signout:'signout'};
 const groups=[
  ['YOUR GAME',[['home','Home Court'],['games','Games'],['training','Training'],['schedule','Schedule']]],
  ['YOUR PROGRESS',[['scoreboard','Scoreboard'],['playbook','Playbook'],['wall','The Wall'],['notebook','Notebook']]],
  ['YOUR TEAM',[['huddle','Family Huddle']]],
  ['ACCOUNT & SETTINGS',[['settings','Settings'],['cloud','Family Cloud'],['signout','Sign Out']]]
 ];
 const elt=(tag,cls,value)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(value!=null)n.textContent=value;return n};
 function iconFor(screen,iconFactory){
  let node=null;
  if(typeof iconFactory==='function')node=iconFactory(screen);
  else if(typeof global.menuIcon==='function'&&global.pageIcons43?.[screen])node=global.menuIcon(global.pageIcons43[screen]);
  if(!(node instanceof global.Node)){
   node=elt('span','gtm-icon-missing','?');node.title='Missing approved page-header icon: '+screen;
  }
  node.classList.add('gtm-icon');node.setAttribute('aria-hidden','true');return node;
 }
 function MenuComponentV1({active='home',onNavigate=()=>{},onClose=()=>{},onQuickAction=()=>{},iconFactory=null,logo=null,canCreateGame=true}={}){
  const root=elt('aside','gtm-root');root.dataset.component='MenuComponent';root.dataset.version='V1.4';root.setAttribute('aria-label','GameTrace menu');
  const header=elt('header','gtm-header'),brand=elt('div','gtm-brand');
  if(logo instanceof global.Node)brand.append(logo);
  else{
   const mark=elt('img','gtm-logo');mark.src='https://raw.githubusercontent.com/ohhigetit/gametrace/development/icons/gametrace-official-192.png';mark.alt='GameTrace official mark';mark.loading='eager';brand.append(mark);
   mark.addEventListener('error',()=>{mark.alt='GameTrace logo unavailable offline';mark.classList.add('gtm-logo-unavailable')});
  }
  const name=elt('div','gtm-brand-name');name.append(elt('strong','gtm-wordmark','GameTrace'),elt('span','gtm-tagline','Follow the Play. The Game. The Journey.'));brand.append(name);
  const close=elt('button','gtm-close','×');close.type='button';close.setAttribute('aria-label','Close menu');close.addEventListener('click',onClose);
  header.append(brand,close);root.append(header);
  const actions=elt('div','gtm-actions');actions.setAttribute('aria-label','Quick actions');actions.setAttribute('role','group');
  for(const [id,label,screen] of [['newGame','New Game','setup'],['newTraining','New Training','training']]){
   const b=elt('button','gtm-action');b.type='button';b.dataset.action=id;b.append(iconFor(screen,iconFactory),elt('span','',label));
   if(id==='newGame'&&!canCreateGame){b.disabled=true;b.title='An unfinished game is already active';}
   b.addEventListener('click',()=>onQuickAction(id));actions.append(b);
  }
  root.append(actions);
  const scroll=elt('div','gtm-scroll'),nav=elt('nav','gtm-nav');nav.setAttribute('aria-label','Main navigation');
  for(const [heading,items] of groups){
   const section=elt('section','gtm-group'),title=elt('h2','gtm-group-heading',heading);section.append(title);
   for(const [id,label] of items){
    const b=elt('button','gtm-item');b.type='button';b.dataset.nav=id;b.append(iconFor(routes[id],iconFactory),elt('span','gtm-item-label',label));
    if(id===active){b.classList.add('is-active');b.setAttribute('aria-current','page');}
    if(id==='signout')b.classList.add('gtm-signout');
    b.addEventListener('click',()=>onNavigate(id));section.append(b);
   }
   nav.append(section);
  }
  scroll.append(nav);root.append(scroll);
  root.setActive=function(next){root.querySelectorAll('.gtm-item').forEach(b=>{const selected=b.dataset.nav===next;b.classList.toggle('is-active',selected);if(selected)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')})};
  return root;
 }
 global.GameTraceMenuComponentV1=MenuComponentV1;
})(window);
