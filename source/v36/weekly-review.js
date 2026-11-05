const weeklyReviewUI={week:null};
function weeklyReviewData(selectedWeek,player='',today=localDate()){
 const week=T.week(selectedWeek),end=T.addWeeks(week,1),matches=r=>!player||T.playerKey(r.player)===T.playerKey(player),within=date=>date>=week&&date<end&&date<=today;
 const sessions=db.trainingSessions.filter(s=>!s.deletedAt&&matches(s)&&within(s.date)),games=db.games.filter(g=>!g.deletedAt&&g.status==='completed'&&matches(g)&&within(g.date)),updates=db.goals.filter(g=>!g.deletedAt&&matches(g)).flatMap(g=>g.entries.filter(e=>!e.deletedAt&&within(e.date)).map(e=>({goal:g,entry:e}))).sort((a,b)=>b.entry.date.localeCompare(a.entry.date)||b.entry.updatedAt.localeCompare(a.entry.updatedAt)),awards=[...T.trophies(db.trainingSessions,db.goals,player,today),...customFamilyAwards(player)].filter(a=>within(a.date));
 return{week,end,sessions,games,updates,awards,minutes:sessions.reduce((n,s)=>n+s.minutes,0),skills:[...new Set(sessions.flatMap(s=>s.tags))]};
}
function appendWeeklyReview(root){
 const thisWeek=T.week(localDate());if(!weeklyReviewUI.week||weeklyReviewUI.week>thisWeek)weeklyReviewUI.week=thisWeek;
 const data=weeklyReviewData(weeklyReviewUI.week,playerContext.player),endDate=new Date(data.end+'T12:00:00');endDate.setDate(endDate.getDate()-1);const end=[endDate.getFullYear(),String(endDate.getMonth()+1).padStart(2,'0'),String(endDate.getDate()).padStart(2,'0')].join('-');
 const section=el('section',{class:'court-card weekly-review','data-weekly-review':''}),next=button('Next week →',()=>{weeklyReviewUI.week=T.addWeeks(data.week,1);renderHomeCourt()},'family-link');next.disabled=data.week>=thisWeek;
 section.append(el('h2',{},data.week===thisWeek?'This week’s work':'Weekly review'),el('div',{class:'weekly-navigation'},button('← Previous week',()=>{weeklyReviewUI.week=T.addWeeks(data.week,-1);renderHomeCourt()},'family-link'),el('span',{},friendlyDate(data.week)+' – '+friendlyDate(end)),next));
 section.append(el('p',{class:'training-help'},(playerContext.player||'All players · combined')+' · Completed records only · Mon–Sun'),el('div',{class:'training-metrics'},...[[trainingHours(data.minutes)+' hrs','Training and camps'],[data.sessions.length,'Sessions'],[data.games.length,'Games'],[data.updates.length,'Playbook updates']].map(([n,label])=>el('div',{},el('strong',{},n),el('small',{},label)))));
 if(!data.sessions.length&&!data.games.length&&!data.updates.length)section.append(el('p',{},'No completed work recorded for this week yet. Every session is a place to start.'));
 if(data.skills.length)section.append(el('p',{},'Worked on: '+data.skills.join(' · ')));
 const updates=data.updates.slice(0,3);if(updates.length)section.append(el('h3',{},'Progress in your own words'));
 for(const {goal,entry}of updates){section.append(button(goal.title+' · '+goal.player+' · Self-rating '+entry.rating+' of 5',()=>openPlaybookStep(goal.id),'family-link'));if(entry.note)section.append(el('p',{class:'feedback-answer'},entry.note))}
 for(const s of [...data.sessions].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,3))section.append(courtActivityRow(s.name,s.player+' · '+friendlyDate(s.date)+' · '+trainingDuration(s.minutes),()=>openSession(s.id,'court'),{'data-weekly-session':s.id}));
 for(const g of data.games.slice(0,2))section.append(courtActivityRow('vs '+g.opponent,g.player+' · '+friendlyDate(g.date),()=>chooseGame(g.id,'stats')));
 const reflection=[...data.sessions].sort((a,b)=>b.date.localeCompare(a.date)||b.updatedAt.localeCompare(a.updatedAt)).find(s=>s.feedback?.became);if(reflection)section.append(el('h3',{},'How did I become more?'),el('p',{class:'feedback-answer'},reflection.feedback.became),el('small',{},reflection.player+' · '+reflection.name));
 if(data.awards.length)section.append(el('p',{},'Recognized this week: '+data.awards.map(a=>a.name).join(' · ')));
 const anchor=root.querySelector('[data-court-section="work"]');if(anchor)anchor.before(section);else root.append(section);
}
