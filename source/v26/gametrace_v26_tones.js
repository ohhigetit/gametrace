const SOUND_TONES=[{id:'soft-click',name:'Soft click'},{id:'digital-tick',name:'Digital tick'},{id:'basketball-bounce',name:'Basketball bounce'},{id:'court-tap',name:'Court tap'},{id:'net-swish',name:'Net swish'},{id:'scoreboard-beep',name:'Scoreboard beep'},{id:'sneaker-squeak',name:'Sneaker squeak'},{id:'soft-pop',name:'Soft pop'},{id:'double-tick',name:'Double tick'}];
let toneVoice=null;
async function sound(test=false){
 if(!db.prefs.sound&&!test)return false;
 try{
  const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)throw Error('Audio unavailable');
  if(!audio||audio.state==='closed')audio=new Audio();if(audio.state!=='running')await audio.resume();if(audio.state!=='running')throw Error('Audio blocked');
  if(toneVoice){for(const node of toneVoice){try{node.stop()}catch{}}toneVoice=null}
  const tone=db.prefs.soundTone||'digital-tick',at=audio.currentTime+.01,o=audio.createOscillator(),gain=audio.createGain();let duration;
  if(tone==='soft-click'){
   duration=.065;o.type='triangle';o.frequency.setValueAtTime(430,at);o.frequency.exponentialRampToValueAtTime(240,at+.05);gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(.10,at+.003);gain.gain.exponentialRampToValueAtTime(.001,at+.06);
  }else if(tone==='basketball-bounce'){
   duration=.21;o.type='sine';o.frequency.setValueAtTime(190,at);o.frequency.exponentialRampToValueAtTime(68,at+.11);gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(.24,at+.004);gain.gain.exponentialRampToValueAtTime(.001,at+.20);
  }else if(tone==='court-tap'){
   duration=.08;o.type='triangle';o.frequency.setValueAtTime(650,at);o.frequency.exponentialRampToValueAtTime(180,at+.065);gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(.14,at+.002);gain.gain.exponentialRampToValueAtTime(.001,at+.075);
  }else if(tone==='net-swish'){
   duration=.18;o.type='sine';o.frequency.value=100;gain.gain.setValueAtTime(0,at);
  }else if(tone==='scoreboard-beep'){
   duration=.115;o.type='square';o.frequency.setValueAtTime(880,at);gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(.035,at+.006);gain.gain.setValueAtTime(.035,at+.075);gain.gain.exponentialRampToValueAtTime(.001,at+.11);
  }else if(tone==='sneaker-squeak'){
   duration=.15;o.type='sine';o.frequency.setValueAtTime(1250,at);o.frequency.exponentialRampToValueAtTime(1950,at+.055);o.frequency.exponentialRampToValueAtTime(1100,at+.14);gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(.07,at+.013);gain.gain.exponentialRampToValueAtTime(.001,at+.145);
  }else if(tone==='soft-pop'){
   duration=.105;o.type='sine';o.frequency.setValueAtTime(540,at);o.frequency.exponentialRampToValueAtTime(180,at+.09);gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(.15,at+.008);gain.gain.exponentialRampToValueAtTime(.001,at+.10);
  }else if(tone==='double-tick'){
   duration=.18;o.type='sine';o.frequency.setValueAtTime(900,at);o.frequency.exponentialRampToValueAtTime(650,at+.045);o.frequency.setValueAtTime(900,at+.095);o.frequency.exponentialRampToValueAtTime(650,at+.155);gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(.12,at+.004);gain.gain.exponentialRampToValueAtTime(.0001,at+.055);gain.gain.setValueAtTime(0,at+.09);gain.gain.linearRampToValueAtTime(.12,at+.099);gain.gain.exponentialRampToValueAtTime(.001,at+.175);
  }else{
   duration=.14;o.type='sine';o.frequency.setValueAtTime(740,at);o.frequency.exponentialRampToValueAtTime(520,at+.11);gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(.16,at+.008);gain.gain.exponentialRampToValueAtTime(.001,at+.13);
  }
  o.connect(gain);gain.connect(audio.destination);const voice=[o];toneVoice=voice;o.start(at);o.stop(at+duration);o.onended=()=>{o.disconnect();gain.disconnect();if(toneVoice===voice)toneVoice=null};
  if(tone==='basketball-bounce'||tone==='net-swish'){
   const swish=tone==='net-swish',noiseDuration=swish?.17:.045;
   const length=Math.ceil(audio.sampleRate*noiseDuration),buffer=audio.createBuffer(1,length,audio.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<length;i++)data[i]=Math.random()*2-1;
   const hit=audio.createBufferSource(),filter=audio.createBiquadFilter(),hitGain=audio.createGain();hit.buffer=buffer;filter.type=swish?'bandpass':'lowpass';filter.frequency.value=swish?2400:1400;if(swish){filter.Q.value=.7;filter.frequency.setValueAtTime(3200,at);filter.frequency.exponentialRampToValueAtTime(1200,at+.16);hitGain.gain.setValueAtTime(0,at);hitGain.gain.linearRampToValueAtTime(.18,at+.035);hitGain.gain.exponentialRampToValueAtTime(.001,at+.165)}else{hitGain.gain.setValueAtTime(.055,at);hitGain.gain.exponentialRampToValueAtTime(.001,at+.04)}hit.connect(filter);filter.connect(hitGain);hitGain.connect(audio.destination);voice.push(hit);hit.start(at);hit.stop(at+noiseDuration);hit.onended=()=>{hit.disconnect();filter.disconnect();hitGain.disconnect()};
  }
  if(test)announce('Preview: '+(SOUND_TONES.find(t=>t.id===tone)?.name||'Digital tick'));return true;
 }catch{if(test)announce('Sound unavailable. Check device volume and browser audio settings.');return false}
}
function renderSettings(){
 renderSettingsV24();const root=$('settingsContent'),section=[...root.querySelectorAll('.settings-section')].find(s=>s.querySelector('h2')?.textContent==='Sound');if(!section)return;
 section.querySelector('[data-test-sound]')?.remove();section.querySelectorAll('p').forEach(p=>p.remove());
 const select=el('select',{id:'soundTone','aria-describedby':'soundToneHelp',onchange:()=>{
  const previous=C.clone(db),tone=select.value;db.prefs.soundTone=tone;
  if(!persist()){db=previous;render();announce('Tone was not saved. Try again.');return}render();$('soundTone')?.focus();
 }});
 for(const tone of SOUND_TONES)select.append(el('option',{value:tone.id},tone.name));select.value=db.prefs.soundTone||'digital-tick';
 section.append(el('label',{class:'ng-field sound-tone-field',for:'soundTone'},'Sound tone',select),button('Preview tone',()=>sound(true),'settings-row',{'data-test-sound':''}),el('p',{class:'view-note',id:'soundToneHelp'},'Preview works with Sound off. Saved actions use your selected tone when Sound is on. Check device sound and volume.'));
}
