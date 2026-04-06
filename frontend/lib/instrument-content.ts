export type FAQCategory = 'getting-started' | 'controls' | 'workflow' | 'sound-design' | 'troubleshooting'

export interface FAQ {
  id: string
  question: string
  answer: string
  category: FAQCategory
}

export interface SuggestedPrompt {
  label: string
  prompt: string
}

export interface InstrumentContent {
  tagline: string
  faqs: FAQ[]
  suggestedPrompts: SuggestedPrompt[]
}

export const CATEGORY_LABELS: Record<FAQCategory, string> = {
  'getting-started': 'Getting Started',
  'controls': 'Controls',
  'workflow': 'Workflow',
  'sound-design': 'Sound Design',
  'troubleshooting': 'Troubleshooting',
}

export const INSTRUMENT_CONTENT: Record<string, InstrumentContent> = {
  'moog-grandmother': {
    tagline: 'Semi-modular analog synthesis — no patch cables required, infinite possibilities when you do.',
    faqs: [
      {
        id: 'gm-1',
        question: 'How do I make my first sound without any patch cables?',
        answer: 'The Grandmother is pre-patched internally — just plug in a MIDI keyboard and play. Make sure the Master Volume is up, the Filter Cutoff is at noon, and Filter Resonance is low. The signal already flows from the oscillators through the filter to the output with no cabling required.',
        category: 'getting-started',
      },
      {
        id: 'gm-2',
        question: 'What is the patchbay and do I need to use it?',
        answer: 'The patchbay is a set of 41 patch points that let you rewire the internal signal flow or connect external gear. You absolutely do not need it — the Grandmother works great fully self-contained. When you do patch, inserting a cable into an input breaks the internal normalization, letting you create custom routings.',
        category: 'getting-started',
      },
      {
        id: 'gm-3',
        question: 'How does the arpeggiator work?',
        answer: 'Hold down a chord and press the ARP ON/OFF button. The arpeggiator will cycle through the held notes in the direction set by the MODE switch (Up, Down, Up/Down, or Random). Use the RATE knob to set speed and sync it to MIDI clock via the SYNC switch.',
        category: 'getting-started',
      },
      {
        id: 'gm-4',
        question: 'What do the VCO 1 and VCO 2 knobs actually control?',
        answer: 'Each VCO has a FREQUENCY knob (coarse pitch), a WAVE selector (sawtooth, triangle, square, or pulse), and a PWM knob for pulse-width modulation. VCO 2 also has a FINE TUNE knob so you can detune it slightly against VCO 1 for thick chorus-like sounds.',
        category: 'controls',
      },
      {
        id: 'gm-5',
        question: 'What does the Filter Cutoff and Resonance do?',
        answer: 'The Cutoff knob sweeps the Moog ladder filter frequency — turn it down to remove high-end frequencies, turn it up to let more through. Resonance adds a peak at the cutoff frequency; crank it high and the filter begins to self-oscillate, producing a sine wave tone even with no oscillator signal.',
        category: 'controls',
      },
      {
        id: 'gm-6',
        question: 'How do I use the spring reverb creatively?',
        answer: 'The built-in spring reverb can be physically struck or wobbled for classic splash effects. Patch the Spring Reverb Send and Return in the patchbay to insert it anywhere in the signal chain. Try running just the filter self-oscillation through the reverb for atmospheric textures.',
        category: 'sound-design',
      },
      {
        id: 'gm-7',
        question: 'How do I create a classic Moog bass patch?',
        answer: 'Set both VCOs to sawtooth wave, tune them in unison (VCO 2 slightly detuned). Set the Filter Cutoff low, Resonance around 9 o\'clock. Set the Filter Envelope Amount positive and give it a fast Attack and medium Decay. Hit low notes — the envelope will give you that punchy filter sweep.',
        category: 'sound-design',
      },
      {
        id: 'gm-8',
        question: 'The Grandmother has no patch memory — how do I save my sounds?',
        answer: 'It doesn\'t save patches. The best approach is to photograph your panel settings and note any patch cables used. Some users keep a patch sheet template. Document the key knob positions for each oscillator, filter, and envelope section.',
        category: 'workflow',
      },
      {
        id: 'gm-9',
        question: 'How do I sync the arpeggiator or sequencer to my DAW?',
        answer: 'Connect a MIDI cable from your DAW\'s MIDI output to the Grandmother\'s MIDI IN. Set the SYNC switch on the arp/sequencer section to EXT. Your DAW\'s MIDI clock will now drive the Grandmother\'s tempo.',
        category: 'workflow',
      },
      {
        id: 'gm-10',
        question: 'I\'m getting no sound — what should I check first?',
        answer: 'Check: (1) Master Volume is up. (2) Filter Cutoff isn\'t fully closed. (3) VCA ENV AMOUNT or VCA LEVEL is not at zero. (4) If using the patchbay, confirm you haven\'t accidentally broken an internal normalization. (5) Your MIDI channel matches your keyboard.',
        category: 'troubleshooting',
      },
    ],
    suggestedPrompts: [
      { label: 'First sound', prompt: 'Walk me through making my first sound on the Moog Grandmother without any patch cables.' },
      { label: 'Signal flow', prompt: 'Explain the complete signal flow of the Grandmother from oscillator to output.' },
      { label: 'Classic bass patch', prompt: 'How do I program a classic Moog bass sound on the Grandmother?' },
      { label: 'Filter deep dive', prompt: 'Walk me through the Moog ladder filter — how do Cutoff and Resonance interact, and what is filter self-oscillation?' },
      { label: 'Spring reverb tricks', prompt: 'What are some creative ways to use the spring reverb on the Grandmother?' },
      { label: 'Sync to DAW', prompt: 'How do I sync the Grandmother\'s arpeggiator and sequencer to my DAW?' },
    ],
  },

  'akai-mpc-one': {
    tagline: 'Standalone production powerhouse — sequence, sample, and record without touching a computer.',
    faqs: [
      {
        id: 'mpc-1',
        question: 'How do I load a sample and assign it to a pad?',
        answer: 'Press the BROWSE button, navigate to your sample file using the data wheel, and press Load (or tap the touchscreen). The sample loads into the current program. To assign it to a specific pad, hold the pad and select the sample from the program editor on the touchscreen.',
        category: 'getting-started',
      },
      {
        id: 'mpc-2',
        question: 'How do I record a beat using the pads?',
        answer: 'Press REC then PLAY START — the sequencer starts recording. Hit the pads to lay down your pattern in real time. Press STOP when done. You can overdub immediately by pressing OVER DUB, or trim and edit in the step sequencer afterward.',
        category: 'getting-started',
      },
      {
        id: 'mpc-3',
        question: 'What is the difference between a Program and a Sequence?',
        answer: 'A Program is a collection of samples and instruments mapped to pads — think of it as your kit or instrument. A Sequence is a recorded performance of pad hits, notes, and automation over time. Multiple sequences chain together in a Song. One program can be used across many sequences.',
        category: 'getting-started',
      },
      {
        id: 'mpc-4',
        question: 'What do the Q-Link knobs do?',
        answer: 'The four Q-Link knobs are assignable real-time controllers. In pad mode they can control filter, pitch, LFO rate, or any parameter you assign. Press the Q-LINK button to cycle through assignment banks A–D. You can also use them to scrub through menus and adjust values on the touchscreen.',
        category: 'controls',
      },
      {
        id: 'mpc-5',
        question: 'How does the step sequencer work?',
        answer: 'Press STEP SEQ to enter step sequencer mode. Each pad represents one step in the pattern. Press a pad to toggle it on or off. Use the touchscreen to adjust step length, velocity, and timing. This is the fastest way to program precise drum patterns without playing in real time.',
        category: 'controls',
      },
      {
        id: 'mpc-6',
        question: 'How do I chop a sample into slices?',
        answer: 'Load your sample, then go to SAMPLE EDIT. Tap Chop on the touchscreen and the MPC will automatically detect transients and slice the sample. You can manually adjust slice points by dragging them. Once chopped, press Convert and assign the slices to pads for chromatic or individual playback.',
        category: 'sound-design',
      },
      {
        id: 'mpc-7',
        question: 'How do I add effects like reverb or compression to a pad?',
        answer: 'In the Program editor, select a pad and navigate to its Insert FX slot. You can load up to four insert effects per pad. For bus-level effects, use the Channel Strip on the Master or individual tracks. The MPC has a full effects library including reverb, delay, EQ, and compression.',
        category: 'sound-design',
      },
      {
        id: 'mpc-8',
        question: 'How do I arrange multiple sequences into a full song?',
        answer: 'Press MAIN to see your sequences, then switch to Song mode on the touchscreen. Drag sequences into the song timeline in the order you want them to play. You can set each sequence to loop a number of times before advancing. Export the final song from the Export menu.',
        category: 'workflow',
      },
      {
        id: 'mpc-9',
        question: 'How do I export my finished track as a WAV file?',
        answer: 'Press MAIN, then go to Menu > Export > Export as Audio. Choose your format (WAV or MP3), bit depth, and sample rate. The MPC will bounce your entire song or selected sequence to the internal storage or a connected USB drive.',
        category: 'workflow',
      },
      {
        id: 'mpc-10',
        question: 'My pads aren\'t triggering sounds — what should I check?',
        answer: 'Check: (1) The correct Program is loaded on the active track. (2) The track is not muted (check TRACK MUTE). (3) The pad bank is correct — press A, B, C, or D to switch banks. (4) Sample is loaded and assigned. (5) Master Volume is up. (6) The pad sensitivity isn\'t set too low in Settings.',
        category: 'troubleshooting',
      },
    ],
    suggestedPrompts: [
      { label: 'Load first sample', prompt: 'Walk me through loading a sample and assigning it to a pad on the MPC One.' },
      { label: 'Record a beat', prompt: 'How do I record a drum beat in real time using the pads on the MPC One?' },
      { label: 'Chop a loop', prompt: 'How do I chop a sample loop into slices and play them on the pads?' },
      { label: 'Step sequencer', prompt: 'Walk me through programming a pattern using the step sequencer on the MPC One.' },
      { label: 'Build a full song', prompt: 'How do I arrange multiple sequences into a full song on the MPC One?' },
      { label: 'Export my track', prompt: 'How do I export my finished track as a stereo WAV from the MPC One?' },
    ],
  },
}
