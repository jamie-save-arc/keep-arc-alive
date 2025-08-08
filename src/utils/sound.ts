let sharedAudioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  const AnyWindow = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
  const Ctor = AnyWindow.AudioContext || AnyWindow.webkitAudioContext;
  if (!Ctor) return null;
  if (!sharedAudioContext) {
    sharedAudioContext = new Ctor();
  }
  if (sharedAudioContext.state === 'suspended') {
    void sharedAudioContext.resume().catch(() => {});
  }
  return sharedAudioContext;
}

function createReverbImpulse(ctx: AudioContext, duration = 1.3, decay = 2.2): AudioBuffer {
  const rate = ctx.sampleRate;
  const length = Math.max(1, Math.floor(rate * duration));
  const impulse = ctx.createBuffer(2, length, rate);
  for (let channel = 0; channel < 2; channel += 1) {
    const data = impulse.getChannelData(channel);
    for (let i = 0; i < length; i += 1) {
      // Exponential decay impulse
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }
  return impulse;
}

function scheduleTone(
  ctx: AudioContext,
  destination: AudioNode,
  frequency: number,
  startTime: number,
  duration: number,
  type: OscillatorType,
  peakGain: number,
  pan = 0,
  bendCents = 15,
): void {
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, startTime);
  // Gentle upward bend for a more organic feel
  const endFreq = frequency * Math.pow(2, bendCents / 1200);
  osc.frequency.linearRampToValueAtTime(endFreq, startTime + Math.min(duration, 0.18));

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  const panNode = ctx.createStereoPanner();
  panNode.pan.setValueAtTime(pan, startTime);

  const highpass = ctx.createBiquadFilter();
  highpass.type = 'highpass';
  highpass.frequency.value = 180;

  osc.connect(gain);
  gain.connect(panNode);
  panNode.connect(highpass);
  highpass.connect(destination);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}

export function playSuccessSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Master chain: gain -> filter -> compressor -> destination
  const master = ctx.createGain();
  master.gain.value = 0.32;

  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.setValueAtTime(12000, now);
  lowpass.frequency.linearRampToValueAtTime(8000, now + 2.0);

  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = -20;
  compressor.knee.value = 30;
  compressor.ratio.value = 6;
  compressor.attack.value = 0.003;
  compressor.release.value = 0.25;

  // Rich reverb
  const convolver = ctx.createConvolver();
  convolver.buffer = createReverbImpulse(ctx, 2.2, 3.0);
  const reverbSend = ctx.createGain();
  reverbSend.gain.value = 0.3;

  // Dual delays for rhythmic complexity
  const delay1 = ctx.createDelay(1.0);
  delay1.delayTime.value = 0.375; // Dotted eighth
  const feedback1 = ctx.createGain();
  feedback1.gain.value = 0.35;
  const delayFilter1 = ctx.createBiquadFilter();
  delayFilter1.type = 'lowpass';
  delayFilter1.frequency.value = 5000;

  const delay2 = ctx.createDelay(1.0);
  delay2.delayTime.value = 0.25; // Quarter note
  const feedback2 = ctx.createGain();
  feedback2.gain.value = 0.25;
  const delayFilter2 = ctx.createBiquadFilter();
  delayFilter2.type = 'highpass';
  delayFilter2.frequency.value = 1000;

  // Wire master chain
  master.connect(lowpass);
  lowpass.connect(compressor);
  compressor.connect(ctx.destination);

  // Parallel effects
  lowpass.connect(reverbSend);
  reverbSend.connect(convolver);
  convolver.connect(compressor);

  lowpass.connect(delay1);
  delay1.connect(delayFilter1);
  delayFilter1.connect(feedback1);
  feedback1.connect(delay1);
  delayFilter1.connect(compressor);

  lowpass.connect(delay2);
  delay2.connect(delayFilter2);
  delayFilter2.connect(feedback2);
  feedback2.connect(delay2);
  delayFilter2.connect(compressor);

  // Extended musical content - 2.5 seconds total
  // Rhythmic progression with Arc-style sophistication
  const events: Array<{ f: number; t: number; d: number; type: OscillatorType; g: number; pan?: number; bend?: number }> = [
    // Opening: Warm pad foundation (0-0.8s)
    { f: 164.81, t: 0.00, d: 0.80, type: 'sine', g: 0.08, pan: 0, bend: 5 },      // E3
    { f: 246.94, t: 0.00, d: 0.80, type: 'sine', g: 0.07, pan: -0.2, bend: 5 },   // B3
    { f: 329.63, t: 0.00, d: 0.80, type: 'sine', g: 0.06, pan: 0.2, bend: 5 },    // E4
    
    // Act 1: Initial rhythmic phrase (0-0.6s)
    { f: 659.25, t: 0.00, d: 0.15, type: 'triangle', g: 0.20, pan: -0.3, bend: 12 },  // E5
    { f: 830.61, t: 0.125, d: 0.15, type: 'triangle', g: 0.18, pan: 0, bend: 12 },    // G#5
    { f: 987.77, t: 0.25, d: 0.20, type: 'triangle', g: 0.17, pan: 0.3, bend: 15 },   // B5
    { f: 1318.51, t: 0.375, d: 0.22, type: 'sine', g: 0.15, pan: -0.2, bend: 18 },    // E6
    
    // Act 2: Syncopated response (0.5-1.1s)
    { f: 739.99, t: 0.50, d: 0.12, type: 'triangle', g: 0.16, pan: 0.2, bend: 10 },   // F#5
    { f: 987.77, t: 0.625, d: 0.12, type: 'triangle', g: 0.15, pan: -0.1, bend: 10 },  // B5
    { f: 659.25, t: 0.75, d: 0.18, type: 'triangle', g: 0.14, pan: 0.1, bend: 12 },   // E5
    { f: 1108.73, t: 0.875, d: 0.22, type: 'sine', g: 0.13, pan: -0.3, bend: 15 },    // C#6
    
    // Act 3: Climactic phrase (1.0-1.6s)
    { f: 493.88, t: 1.00, d: 0.25, type: 'sine', g: 0.12, pan: 0, bend: 8 },          // B4
    { f: 659.25, t: 1.125, d: 0.20, type: 'triangle', g: 0.18, pan: -0.2, bend: 12 }, // E5
    { f: 830.61, t: 1.25, d: 0.20, type: 'triangle', g: 0.17, pan: 0.2, bend: 12 },   // G#5
    { f: 1108.73, t: 1.375, d: 0.22, type: 'sine', g: 0.15, pan: 0, bend: 15 },       // C#6
    { f: 1318.51, t: 1.50, d: 0.30, type: 'sine', g: 0.14, pan: -0.1, bend: 20 },     // E6
    
    // Act 4: Resolution cascade (1.5-2.2s)
    { f: 1661.22, t: 1.625, d: 0.18, type: 'sine', g: 0.10, pan: 0.3, bend: 22 },     // G#6
    { f: 1975.53, t: 1.75, d: 0.20, type: 'sine', g: 0.08, pan: -0.3, bend: 25 },     // B6
    { f: 1318.51, t: 1.875, d: 0.25, type: 'sine', g: 0.09, pan: 0.1, bend: 18 },     // E6
    { f: 987.77, t: 2.00, d: 0.35, type: 'triangle', g: 0.10, pan: -0.1, bend: 12 },  // B5
    { f: 659.25, t: 2.125, d: 0.40, type: 'sine', g: 0.08, pan: 0, bend: 8 },         // E5
    
    // Subtle low-end punctuation
    { f: 82.41, t: 0.25, d: 0.15, type: 'sine', g: 0.05, pan: 0, bend: 3 },          // E2
    { f: 82.41, t: 0.75, d: 0.15, type: 'sine', g: 0.04, pan: 0, bend: 3 },          // E2
    { f: 82.41, t: 1.25, d: 0.20, type: 'sine', g: 0.05, pan: 0, bend: 3 },          // E2
    { f: 82.41, t: 1.75, d: 0.30, type: 'sine', g: 0.04, pan: 0, bend: 3 },          // E2
  ];

  events.forEach((e) => {
    scheduleTone(ctx, master, e.f, now + e.t, e.d, e.type, e.g, e.pan ?? 0, e.bend ?? 12);
  });

  // Enhanced noise layers for texture
  // Layer 1: Bright shimmer
  const noise1 = ctx.createBufferSource();
  const noiseBuf1 = ctx.createBuffer(1, ctx.sampleRate * 0.8, ctx.sampleRate);
  const ch1 = noiseBuf1.getChannelData(0);
  for (let i = 0; i < ch1.length; i += 1) {
    ch1[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / ch1.length, 2.5);
  }
  noise1.buffer = noiseBuf1;
  const noiseFilter1 = ctx.createBiquadFilter();
  noiseFilter1.type = 'bandpass';
  noiseFilter1.frequency.value = 4500;
  noiseFilter1.Q.value = 4;
  const noiseGain1 = ctx.createGain();
  noiseGain1.gain.setValueAtTime(0.0001, now + 0.3);
  noiseGain1.gain.linearRampToValueAtTime(0.08, now + 0.35);
  noiseGain1.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);
  noise1.connect(noiseFilter1);
  noiseFilter1.connect(noiseGain1);
  noiseGain1.connect(master);
  noise1.start(now + 0.3);
  noise1.stop(now + 2.5);

  // Layer 2: Mid-range texture
  const noise2 = ctx.createBufferSource();
  const noiseBuf2 = ctx.createBuffer(1, ctx.sampleRate * 1.0, ctx.sampleRate);
  const ch2 = noiseBuf2.getChannelData(0);
  for (let i = 0; i < ch2.length; i += 1) {
    ch2[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / ch2.length, 3.5);
  }
  noise2.buffer = noiseBuf2;
  const noiseFilter2 = ctx.createBiquadFilter();
  noiseFilter2.type = 'bandpass';
  noiseFilter2.frequency.value = 2000;
  noiseFilter2.Q.value = 2;
  const noiseGain2 = ctx.createGain();
  noiseGain2.gain.setValueAtTime(0.0001, now + 0.8);
  noiseGain2.gain.linearRampToValueAtTime(0.05, now + 0.85);
  noiseGain2.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);
  noise2.connect(noiseFilter2);
  noiseFilter2.connect(noiseGain2);
  noiseGain2.connect(master);
  noise2.start(now + 0.8);
  noise2.stop(now + 2.5);

  // Automated filter sweep for movement
  lowpass.frequency.setValueAtTime(12000, now);
  lowpass.frequency.linearRampToValueAtTime(8000, now + 0.5);
  lowpass.frequency.linearRampToValueAtTime(15000, now + 1.0);
  lowpass.frequency.exponentialRampToValueAtTime(6000, now + 2.5);
}


