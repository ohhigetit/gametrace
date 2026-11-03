const SOUND_TONES=[{id:'soft-click',name:'Soft click'},{id:'digital-tick',name:'Digital tick'},{id:'basketball-bounce',name:'Basketball bounce'}];
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
  }else{
   duration=.14;o.type='sine';o.frequency.setValueAtTime(740,at);o.frequency.exponentialRampToValueAtTime(520,at+.11);gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(.16,at+.008);gain.gain.exponentialRampToValueAtTime(.001,at+.13);
  }
  o.connect(gain);gain.connect(audio.destination);const voice=[o];toneVoice=voice;o.start(at);o.stop(at+duration);o.onended=()=>{o.disconnect();gain.disconnect();if(toneVoice===voice)toneVoice=null};
  if(tone==='basketball-bounce'){
   const length=Math.ceil(audio.sampleRate*.045),buffer=audio.createBuffer(1,length,audio.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<length;i++)data[i]=Math.random()*2-1;
   const hit=audio.createBufferSource(),filter=audio.createBiquadFilter(),hitGain=audio.createGain();hit.buffer=buffer;filter.type='lowpass';filter.frequency.value=1400;hitGain.gain.setValueAtTime(.055,at);hitGain.gain.exponentialRampToValueAtTime(.001,at+.04);hit.connect(filter);filter.connect(hitGain);hitGain.connect(audio.destination);voice.push(hit);hit.start(at);hit.stop(at+.045);hit.onended=()=>{hit.disconnect();filter.disconnect();hitGain.disconnect()};
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
