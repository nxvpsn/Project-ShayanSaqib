#!/usr/bin/env python3
"""Re-voice the game with Chatterbox (free, MIT, runs on your own NVIDIA GPU; no Claude usage while it runs).

Each character keeps their own voice: the reference clip for a speaker is one of their existing Kokoro lines, and
Chatterbox re-acts every line in that voice with a per-line "exaggeration" (how hard the line is acted) from
dev/voice_lines.json. Nothing in the game changes until you run --apply.

  one-time setup (Python 3.11, in the repo's dev folder):
      py -3.11 -m venv .tts
      .tts\\Scripts\\pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu121
      .tts\\Scripts\\pip install chatterbox-tts soundfile
  a ten-line taste (one per main character), into audio/v_new/:
      .tts\\Scripts\\python voices_chatterbox.py --sample
  everything (resumes if stopped; skips what is already rendered):
      .tts\\Scripts\\python voices_chatterbox.py --all
  only some speakers:      --who caotan,omar
  put the new clips live:  --apply   (copies audio/v_new/*.mp3 over audio/v/; then commit and push audio/v)
"""
import json, os, shutil, sys, time
HERE = os.path.dirname(os.path.abspath(__file__)); V = os.path.join(HERE, '..', 'audio', 'v'); NEW = os.path.join(HERE, '..', 'audio', 'v_new')
D = json.load(open(os.path.join(HERE, 'voice_lines.json'), encoding='utf8')); LINES, REFS = D['lines'], D['refs']
MAIN = ['ali', 'caotan', 'omar', 'shayan', 'mira', 'nathan', 'grimmaw', 'paul', 'nathanraw', 'hamza']
def arg(k): return sys.argv[sys.argv.index(k) + 1] if k in sys.argv else None

def main():
    if '--apply' in sys.argv:
        n = 0
        for f in os.listdir(NEW):
            if f.endswith('.mp3'): shutil.copyfile(os.path.join(NEW, f), os.path.join(V, f)); n += 1
        print(f'copied {n} clips into audio/v. Now: git add audio/v && git commit -m "new voices" && git push'); return
    todo = [l for l in LINES if l['w'] in REFS]          # speakers without a reference clip keep their Kokoro voice
    if arg('--who'): todo = [l for l in todo if l['w'] in arg('--who').split(',')]
    if '--sample' in sys.argv:
        pick = []
        for w in MAIN:
            c = [l for l in todo if l['w'] == w and 50 <= len(l['t']) <= 140]
            if c: pick.append(max(c, key=lambda l: l['ex']))
        todo = pick
    elif '--all' not in sys.argv and not arg('--who'): print(__doc__); return
    os.makedirs(NEW, exist_ok=True); todo = [l for l in todo if not os.path.exists(os.path.join(NEW, l['k'] + '.mp3'))]
    print(f'{len(todo)} lines to render'); 
    if not todo: return
    import torch, soundfile as sf
    from chatterbox.tts import ChatterboxTTS
    dev = 'cuda' if torch.cuda.is_available() else 'cpu'
    if dev == 'cpu': print('WARNING: no CUDA GPU found by torch; this will be very slow')
    model = ChatterboxTTS.from_pretrained(device=dev); t0 = time.time()
    for i, l in enumerate(sorted(todo, key=lambda l: l['w'])):       # grouped by speaker
        ref = os.path.join(V, REFS[l['w']] + '.mp3'); out = os.path.join(NEW, l['k'] + '.mp3')
        try:
            wav = model.generate(l['t'], audio_prompt_path=ref, exaggeration=l['ex'], cfg_weight=l['cfg'])
            sf.write(out, wav.squeeze(0).cpu().numpy(), model.sr, format='MP3')
        except Exception as e:
            print('  FAILED', l['k'], l['w'], repr(e)[:160]); continue
        if i % 10 == 0:
            el = time.time() - t0; print(f"  {i + 1}/{len(todo)}  {l['w']:10s} ex {l['ex']}  {el / 60:.1f} min in, about {el / (i + 1) * (len(todo) - i - 1) / 60:.0f} min left", flush=True)
    print('done. Listen to the files in audio/v_new/, then run with --apply.')
if __name__ == '__main__': main()
