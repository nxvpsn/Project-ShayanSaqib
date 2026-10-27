#!/usr/bin/env python3
"""Voice builder for The Moonsinger's Bell (Kokoro TTS), per KOKORO_TTS_HANDOFF.md.
Scans index.html for voiced lines, renders the ones missing from VOICES with Kokoro,
and writes them to audio/v/<key>.mp3 + audio/v/manifest.json (existing clips are kept; nothing already voiced is re-rendered).

  python3 build_voices.py index.html --dry-run      # list lines that would be rendered
  python3 build_voices.py index.html [--jobs N]     # render missing lines and embed
  python3 build_voices.py index.html --only 'a|b'  # only the missing lines whose text contains a or b
  python3 build_voices.py index.html --recast nathan,nathanraw  # re-render every line of these speakers (new voice)
"""
import re, sys, os, json, base64, subprocess, tempfile, concurrent.futures as cf

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, 'voice_cache')
MODEL = os.environ.get('KOKORO_MODEL', os.path.join(HERE, 'tts', 'kokoro-v1.0.onnx'))
VOICESBIN = os.environ.get('KOKORO_VOICES', os.path.join(HERE, 'tts', 'voices-v1.0.bin'))
SR = 24000
# lines re-rendered even if already embedded (cache suffix marks the new take)
FORCE = {('shayan', 'Above me no sky remains, below me no ground holds, before me, no God stands, heavenly drill of eternal annihilation!'): '_x2'}
CAST = {  # id: (voice, speed, pitch, extra filter)
  'shayan': ('am_michael', 1.0, 1.0, None), 'mira': ('af_heart', 1.02, 1.0, None), 'miraold': ('af_heart', .96, .94, None),
  'ali': ('am_onyx', .98, .94, 'aecho=0.8:0.3:30:0.12'), 'aliold': ('am_onyx', .9, .86, None), 'hamza': ('am_puck', 1.0, 1.32, None),
  'hamzadeep': ('am_onyx', .72, .58, 'aecho=0.8:0.75:140:0.45,aecho=0.6:0.5:400:0.3'),
  'nathan': ('am_fenrir', .97, .88, 'bass=g=4:f=110,acompressor=threshold=-20dB:ratio=3:attack=5:release=90,aecho=0.8:0.45:55:0.22'), 'nathanraw': ('am_fenrir', .94, .88, 'bass=g=4:f=110,acompressor=threshold=-20dB:ratio=2.5:attack=5:release=90'),  # a heroic, dramatic anime lead
  'grimmaw': ('bm_fable', 1.04, 1.22, None), 'hound': ('am_fenrir', .98, .8, 'highpass=f=300,lowpass=f=3400'),  # He's Day Old Kojima (a posh baby) and his soldiers (over the codec)
  'caotan': ('am_liam', 1.06, 1.0, None), 'omar': ('bm_lewis', .9, .86, 'aecho=0.8:0.4:60:0.25'),
  'caomar': ('bm_lewis', 1.0, .92, 'aecho=0.8:0.5:25:0.35,aecho=0.7:0.4:60:0.2'),
  'elder': ('bm_george', .9, .96, None), 'baker': ('bf_isabella', 1.0, 1.0, None), 'kid': ('am_puck', 1.05, 1.28, None),
  'kid14': ('am_puck', 1.05, 1.3, None), 'kids': ('am_puck', 1.08, 1.34, 'aecho=0.8:0.7:23:0.6,aecho=0.8:0.6:47:0.5'),
  'babies': ('am_puck', 1.1, 1.45, 'aecho=0.8:0.7:19:0.6,aecho=0.8:0.6:41:0.5,aecho=0.7:0.5:67:0.4'),
  'villagerm': ('am_eric', 1.0, 1.0, None), 'trainer': ('am_puck', 1.08, 1.08, None), 'villagerf': ('af_sarah', 1.0, 1.0, None), 'paul': ('am_liam', .95, .9, 'lowpass=f=6000'),
  'operator': ('af_nicole', .95, 1.0, 'highpass=f=200,lowpass=f=7500,chorus=0.6:0.9:50|60:0.4|0.32:0.25|0.4:2|1.3,aecho=0.8:0.6:45:0.25'),  # Aire, Nathan's operator (calm, synthetic)
  '': ('bf_emma', .95, 1.0, None)}
FIXES = [('Itadakimasu.', 'Ee-tah-dah-kee-mahss.'), ('GG fucking EZ.', 'G. G. Fucking. E. Z.'), ('Getsuga Tenshou', 'Get-sue-gah. Ten-show'),
  ('Getsuga... Jujishou', 'Get-sue-gah. Joo-jee-show'), ('Getsuga... TENSHOU', 'Get-sue-gah. TEN-SHOW'), ('GETSUGA', 'GET-SUE-GAH'), ('TENSHOU', 'TEN-SHOW'), ('Jujishou', 'Joo-jee-show'), ('...', ', '),
  ('Za Warudo', 'Zah Wah-roo-doh'), ('Judgement Cut', 'Judgement. Cut'), ('GG', 'G. G.'), ('Shayan Saqib', 'Shayaan Saakib'), ('Shayan', 'Shayaan'),
  ('Yoshi-P', 'Yoshi P'), ('HTML', 'H T M L'), ('AFK', 'A F K'), ('DPS', 'D P S'), ('Uwu', 'Oo-woo'), ('uwu', 'oo-woo'), ('Ara ara', 'Ah-rah ah-rah'),
  ('>///<', ''), ('♡', ''), ('✦', ''), ('☆', ''), ('♥', ''), ('*', ''), ('Kyaa', 'Kyah'), ('KYUN', 'kyoon'), ('Moe moe', 'Moh-eh moh-eh'), ('Senpai', 'Sen-pie'), ('senpai', 'sen-pie')]

def vhash(s):
    h = 5381
    for ch in s:
        h = ((h * 33) ^ ord(ch)) & 0xffffffff
    if h == 0: return '0'
    d = '0123456789abcdefghijklmnopqrstuvwxyz'; o = ''
    while h: h, r = divmod(h, 36); o = d[r] + o
    return o

STR = r'"((?:[^"\\]|\\.)*)"'
def unesc(s): return re.sub(r'\\(.)', lambda m: {'n': '\n', 't': '\t'}.get(m.group(1), m.group(1)), s)
def call_args(src, i):
    """src[i] == '(' ; return the text up to the matching ')'."""
    depth, j, q = 0, i, None
    while j < len(src):
        c = src[j]
        if q:
            if c == '\\': j += 2; continue
            if c == q: q = None
        elif c in '"\'`': q = c
        elif c in '([{': depth += 1
        elif c in ')]}':
            depth -= 1
            if depth == 0: return src[i + 1:j]
        j += 1
    return ''
def split_first(a):
    depth, q = 0, None
    for k, c in enumerate(a):
        if q:
            if c == '\\': continue
            if c == q: q = None
        elif c in '"\'`': q = c
        elif c in '([{': depth += 1
        elif c in ')]}': depth -= 1
        elif c == ',' and depth == 0: return a[:k].strip(), a[k + 1:]
    return a.strip(), ''
def who_list(expr):
    m = re.fullmatch(r"""['"](\w*)['"]""", expr)
    if m: return [m.group(1)]
    if expr in ('H', 'HERO()'): return ['shayan', 'ali']
    if expr in ('A.who',): return ['caotan', 'omar', 'ali']
    if expr.endswith('.who') or expr.startswith('lines['): return ['caotan', 'omar']
    return []

def scan(code):
    out = set()
    for m in re.finditer(r'(?<![\w.$])(say|twBark)\(', code):
        args = call_args(code, m.end() - 1); w, rest = split_first(args)
        for who in who_list(w):
            for s in re.findall(STR, rest): out.add((who, unesc(s)))
    for m in re.finditer(r'(?<![\w.$])choose\(', code):
        for s in re.findall(r't:' + STR, call_args(code, m.end() - 1)):
            out.add(('shayan', unesc(s))); out.add(('ali', unesc(s)))
    for m in re.finditer(r"""\[\s*['"](\w*)['"]\s*,\s*""" + STR + r'\s*\]', code):
        out.add((m.group(1), unesc(m.group(2))))
    m = re.search(r'const CAO_VN=\{(.*?)\]\]\]\};', code, re.S)
    if m:
        for s in re.findall(r'\[' + STR + r',\[', m.group(1)): out.add(('caotan', unesc(s)))
    for name in ('ALLY_BARK', 'ALLY_HURT'):
        m = re.search(r'const ' + name + r'=\{(.*?)\]\};', code, re.S)
        if m:
            for who, body in re.findall(r'(\w+):\[(.*?)\]', m.group(1) + ']', re.S):
                for s in re.findall(STR, body): out.add((who, unesc(s)))
    m = re.search(r'const lines=\[("When I was seven.*?)\];', code, re.S)
    if m:
        for s in re.findall(STR, m.group(1)): out.add(('omar', unesc(s)))
    m = re.search(r'const rant=\[(.*?)\];', code, re.S)
    if m:
        for s in re.findall(STR, m.group(1)): out.add(('paul', unesc(s)))
    return {(w, t) for (w, t) in out if w in CAST and re.search(r'[A-Za-z]', t)}

def speak_text(who, text):
    t = text
    for a, b in FIXES: t = t.replace(a, b)
    return re.sub(r'\s+', ' ', t).strip(' ,') or text

_K = None
def render(job):
    global _K
    who, text, key = job
    path = os.path.join(CACHE, key + FORCE.get((who, text), '') + '.mp3')
    if os.path.exists(path): return key
    if _K is None:
        from kokoro_onnx import Kokoro
        _K = Kokoro(MODEL, VOICESBIN)
    import soundfile as sf
    voice, speed, pitch, extra = CAST[who]
    if text.startswith('Above me no sky') or (who == 'hamza' and text.startswith('Heavenly drill')): speed = 1.5
    lang = 'en-gb' if voice.startswith('b') else 'en-us'
    samples, sr = _K.create(speak_text(who, text), voice=voice, speed=speed, lang=lang)
    with tempfile.TemporaryDirectory() as td:
        wav = os.path.join(td, 'a.wav'); sf.write(wav, samples, sr)
        flt = []
        if pitch != 1: flt.append(f'asetrate={SR}*{pitch},aresample={SR},atempo={1 / pitch:.5f}')
        if extra: flt.append(extra)
        if (who, text) in FORCE: flt.append('atempo=2.0')
        flt += ['silenceremove=start_periods=1:start_threshold=-50dB', 'loudnorm=I=-17:TP=-2']
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', wav, '-af', ','.join(flt), '-ac', '1', '-ar', '24000', '-c:a', 'libmp3lame', '-b:a', '40k', path + '.tmp.mp3'], check=True)
        os.replace(path + '.tmp.mp3', path)
    return key

def main():
    html = sys.argv[1]; dry = '--dry-run' in sys.argv
    jobs = int(sys.argv[sys.argv.index('--jobs') + 1]) if '--jobs' in sys.argv else 1
    # clips live in audio/v/<key>.mp3 next to the page; audio/v/manifest.json lists them (build.py embeds that list)
    vdir = os.path.join(os.path.dirname(os.path.abspath(html)), 'audio', 'v'); mf = os.path.join(vdir, 'manifest.json')
    existing = json.load(open(mf)) if os.path.exists(mf) else {}
    src = open(html, encoding='utf8').read()
    vm = re.search(r'^const VOICES=(\{.*?\});$', src, re.M)
    code = src[:vm.start()] + src[vm.end():] if vm else src
    lines = scan(code)
    want = {vhash(w + '|' + t): (w, t) for (w, t) in lines}
    missing = [(w, t, k) for k, (w, t) in want.items() if k not in existing or (w, t) in FORCE and existing.get(k + '#') is None]
    if '--recast' in sys.argv:  # --recast who1,who2: re-render every line of these speakers (a new voice for them)
        who = set(sys.argv[sys.argv.index('--recast') + 1].split(','))
        missing = [(w, t, k) for k, (w, t) in want.items() if w in who]  # only these speakers
        if not dry:
            for w, t, k in missing:
                if w in who:
                    p = os.path.join(CACHE, k + FORCE.get((w, t), '') + '.mp3')
                    if os.path.exists(p): os.remove(p)
    if '--only' in sys.argv:  # --only "text a|text b": render just the lines whose text contains one of these
        keys = sys.argv[sys.argv.index('--only') + 1].split('|'); missing = [m for m in missing if any(q in m[1] for q in keys)]
    print(f'{len(lines)} voiced lines found, {len(existing)} clips in audio/v, {len(missing)} to render')
    if dry:
        for w, t, k in sorted(missing): print(f'{w:10s} {k:8s} {t}')
        return
    os.makedirs(CACHE, exist_ok=True); os.makedirs(vdir, exist_ok=True)
    done = 0
    with cf.ProcessPoolExecutor(max_workers=jobs) as ex:
        for k in ex.map(render, missing, chunksize=4):
            done += 1
            if done % 25 == 0: print(f'  rendered {done}/{len(missing)}', flush=True)
    merged = dict(existing); added = 0
    for w, t, k in missing:
        p = os.path.join(CACHE, k + FORCE.get((w, t), '') + '.mp3')
        if os.path.exists(p): open(os.path.join(vdir, k + '.mp3'), 'wb').write(open(p, 'rb').read()); merged[k] = 1; added += 1
        if (w, t) in FORCE: merged[k + '#'] = 1
    json.dump(merged, open(mf, 'w'), separators=(',', ':'), sort_keys=True)
    print(f'added {added} clips to audio/v ({len(merged)} listed). Now run: python3 build.py --write')

if __name__ == '__main__': main()
