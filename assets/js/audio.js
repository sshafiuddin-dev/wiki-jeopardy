// ── Audio / SFX ──
import { audioEnabled } from './state.js';

let _audioCtx = null;

function getAudioCtx() {
  if (!_audioCtx || _audioCtx.state === 'closed') {
    _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return _audioCtx;
}

function playTone(freq, dur, type = 'sine') {
  try {
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') ctx.resume();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0.3, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    o.start(); o.stop(ctx.currentTime + dur);
  } catch (e) { /* silent fail */ }
}

export const SFX = {
  correct()  { if (!audioEnabled) return; playTone(523,.1); setTimeout(()=>playTone(659,.1),100); setTimeout(()=>playTone(784,.2),200); },
  wrong()    { if (!audioEnabled) return; playTone(200,.3,'sawtooth'); },
  pass()     { if (!audioEnabled) return; playTone(400,.15); setTimeout(()=>playTone(300,.15),150); },
  roundEnd() { if (!audioEnabled) return; [523,659,784,1047].forEach((f,i)=>setTimeout(()=>playTone(f,.2),i*120)); }
};
