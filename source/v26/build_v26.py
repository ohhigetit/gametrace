from pathlib import Path
p=Path(__file__).parent
s=(p.parent/'v24/GameTrace_V24_Cinematic_Cover.html').read_text()
s=s.replace('sound:d.prefs?.sound===true,nudge:',"sound:d.prefs?.sound===true,soundTone:['soft-click','digital-tick','basketball-bounce','court-tap','net-swish','scoreboard-beep','sneaker-squeak','soft-pop','double-tick'].includes(d.prefs?.soundTone)?d.prefs.soundTone:'digital-tick',nudge:",1)
s=s.replace('prefs:{sound:false,nudge:false,','prefs:{sound:false,soundTone:\'digital-tick\',nudge:false,')
needle='function renderSettings(){renderSettingsOriginal();'
assert s.count(needle)==1
s=s.replace(needle,'function renderSettingsV24(){renderSettingsOriginal();',1)
needle='\nload();\nsetInterval'
assert s.count(needle)==1
s=s.replace(needle,'\n'+(p/'gametrace_v26_tones.js').read_text()+'\nload();\nsetInterval',1)
s=s.replace('</head>','<style>html[data-theme] #app.gt-app .sound-tone-field{display:block;margin-top:18px}html[data-theme] #app.gt-app .sound-tone-field select{width:100%;min-width:0;max-width:100%}</style></head>',1)
s=s.replace('GameTrace V24 — Cinematic Cover','GameTrace V26 — Nine Sound Tones')
(p/'GameTrace_V26_Nine_Sound_Tones.html').write_text(s)
print('Built V26 nine sound tones from approved V24')
