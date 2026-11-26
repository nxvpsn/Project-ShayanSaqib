#!/usr/bin/env python3
"""Writes voice_lines.json for voices_chatterbox.py: every voiced line in ../index.html with its key, speaker, text and
per-line acting settings (ex = how hard the line is acted, cfg = pacing), plus one existing clip per speaker to use as
that speaker's voice reference. Run after dialogue changes:  python3 build.py --write && python3 voice_export.py"""
import re, sys, json, os, importlib.util
HERE = os.path.dirname(os.path.abspath(__file__)); sys.argv = ['x']
spec = importlib.util.spec_from_file_location('bv', os.path.join(HERE, 'build_voices.py')); bv = importlib.util.module_from_spec(spec); spec.loader.exec_module(bv)
src = open(os.path.join(HERE, '..', 'index.html'), encoding='utf8').read(); vm = re.search(r'^const VOICES=(\{.*?\});$', src, re.M)
code = src[:vm.start()] + src[vm.end():] if vm else src
L = sorted(set(bv.scan(code))); have = set(f[:-4] for f in os.listdir(os.path.join(HERE, '..', 'audio', 'v')) if f.endswith('.mp3'))
BASE = {'caotan': .78, 'grimmaw': .8, 'nathan': .65, 'nathanraw': .6, 'nathanirl': .75, 'mira': .6, 'shayan': .55, 'hamza': .6, 'paul': .4, 'omar': .36, 'ali': .3, '': .4}
KEEP = {'GG', 'EZ', 'OK', 'HTML', 'AI', 'HP', 'DLC', 'JRPG', 'RTS', 'TV', 'PC', 'ASMR', 'VIP', 'UI', 'NPC', 'DPS', 'LV'}
def say_text(w, t):
    """The text handed to Chatterbox. It reads a word in capitals letter by letter ("W. A. I. T."), so shouted words go
    in lower case (the shout is in the line's `ex` setting) and stage marks are dropped."""
    t = bv.speak_text(w, t).replace('*', '').replace('~', '').replace('☆', '')
    t = re.sub(r"\b[A-Z][A-Z']+\b", lambda m: m.group(0) if m.group(0) in KEEP else m.group(0).lower(), t)
    t = re.sub(r"(^|[.!?…]\s+|\.\.\.\s*)([a-z])", lambda m: m.group(1) + m.group(2).upper(), t)
    return re.sub(r'\s+', ' ', t).strip() or t
out, refs = [], {}
for w, t in L:
    k = bv.vhash(w + '|' + t); ex = BASE.get(w, .5)
    ex += min(.2, .07 * t.count('!')) + min(.2, .06 * len(re.findall(r"\b[A-Z]{3,}\b", t))) - (.08 if '...' in t else 0) + (.05 if '?!' in t else 0)
    ex = round(max(.2, min(1.1, ex)), 2); cfg = round(max(.25, min(.5, .5 - (ex - .5) * .5)), 2)
    out.append({'k': k, 'w': w, 't': say_text(w, t), 'ex': ex, 'cfg': cfg, 'new': 0 if k in have else 1})
    if k in have and 60 <= len(t) <= 160 and (w not in refs or abs(len(t) - 110) < abs(len(refs[w][1]) - 110)): refs[w] = (k, t)
R = {w: v[0] for w, v in refs.items()}
if 'nathanraw' in R: R.setdefault('nathanirl', R['nathanraw'])   # real-life Nathan: Nathan's own voice
json.dump({'lines': out, 'refs': R}, open(os.path.join(HERE, 'voice_lines.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
print(len(out), 'lines;', sum(o['new'] for o in out), 'never voiced; no reference for:', sorted(set(o['w'] for o in out) - set(R)))
