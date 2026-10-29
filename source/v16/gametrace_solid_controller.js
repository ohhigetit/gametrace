
(()=>{const sheet=document.getElementById('sheet');
const clear=()=>document.querySelectorAll('.controller-selected').forEach(b=>b.classList.remove('controller-selected'));
sheet.addEventListener('close',clear);
for(const b of document.querySelectorAll('.visual .action'))b.addEventListener('click',()=>{
 if(b.getAttribute('aria-disabled')!=='false'||sheet.open)return;
 clear();b.classList.add('controller-selected');
 setTimeout(()=>{if(!sheet.open)clear()},0);
},true);
})();
