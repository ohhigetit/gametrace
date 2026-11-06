#!/usr/bin/env python3
"""Build a single-file V46 Games test app from the V45 development baseline.
No user data and no deployed branches are changed by this script.
"""
from pathlib import Path
import re

root=Path(__file__).resolve().parents[2]
source=root/"index.html"
js=(root/"source/v46/games.js").read_text(encoding="utf-8")
css=(root/"source/v46/games.css").read_text(encoding="utf-8")
text=source.read_text(encoding="utf-8")
start_marker="function renderHome(){const root=$('homeContent');root.replaceChildren(el('div',{class:'view-title'},el('h1',{},'Games'))"
start=text.rfind(start_marker)
if start<0: raise RuntimeError("V45 Games function marker is missing; refusing unsafe integration")
end=text.find("\nasync function sound(",start)
if end<0 or end-start>10000: raise RuntimeError("V45 Games end marker mismatch; refusing unsafe integration")
if "function renderHome()" not in js or "function gt46OpenFilters()" not in js: raise RuntimeError("V46 module incomplete")
text=text[:start]+js+"\n"+text[end:]
if text.count("</head>")!=1: raise RuntimeError("Unexpected HTML head structure")
text=text.replace("</head>","<style id=\"gametrace-v46-games\">\n"+css+"\n</style>\n</head>",1)
if len(text)<1000000 or "V45" not in text or "gt46OpenFilters" not in text: raise RuntimeError("Output fails integration assertions")
output=root/"GameTrace_V46_Integrated_TEST.html"
output.write_text(text,encoding="utf-8")
print("Built",output.name,"bytes",output.stat().st_size,"from",source.name)
