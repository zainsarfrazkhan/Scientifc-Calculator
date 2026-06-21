let audioCtx: AudioContext | null = null;

/**
 * Plays a high-fidelity synthesized click sound using the Web Audio API.
 * Uses rapid exponential ramp-down envelopes to mimic tactile dome switches.
 */
export function playHapticClick(type: 'standard' | 'delete' | 'success' | 'error' | 'tab' = 'standard') {
  try {
    // Lazy-initialize AudioContext on user interaction
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;
      audioCtx = new AudioCtxClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const ctx = audioCtx;
    const now = ctx.currentTime;

    switch (type) {
      case 'standard': {
        // High-pitch, crisp, very short tactile micro-switch tick
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.012);

        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.012);

        osc.start(now);
        osc.stop(now + 0.015);
        break;
      }

      case 'tab': {
        // Soft, warm, low-frequency subtle transition click
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.02);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

        osc.start(now);
        osc.stop(now + 0.022);
        break;
      }

      case 'delete': {
        // Lower, heavier springy switch contact sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(480, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.025);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

        osc.start(now);
        osc.stop(now + 0.03);
        break;
      }

      case 'success': {
        // Dual-tone high-fidelity affirmative confirmation bell
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(1400, now);
        osc1.frequency.exponentialRampToValueAtTime(1800, now + 0.04);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(2100, now);
        osc2.frequency.exponentialRampToValueAtTime(2400, now + 0.04);

        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.06);
        osc2.stop(now + 0.06);
        break;
      }

      case 'error': {
        // Dual flat low pitch "buzz" pulse to represent a mathematical boundary error
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(180, now);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(185, now);

        // Quick ramp to zero
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.08);
        osc2.stop(now + 0.08);
        break;
      }
    }
  } catch (error) {
    // Silence browser audio initialization blocks
    console.debug('Haptic feedback audio blocked or unsupported:', error);
  }
}
