/**
 * Senara's Birthday Website - Interactive Scripts
 */

// --- AUDIO SYNTHESIZER ENGINE (Web Audio API) ---
class AudioSynth {
  constructor() {
    this.ctx = null;
    this.musicInterval = null;
    this.isPlayingMusic = false;
    this.tempo = 140; // BPM
    this.melodyIndex = 0;

    // Happy Birthday Melody Notes & Durations (Music Box style)
    // format: [noteName, octave, duration (beats)]
    this.birthdaySong = [
      ['C', 4, 0.75], ['C', 4, 0.25], ['D', 4, 1], ['C', 4, 1], ['F', 4, 1], ['E', 4, 2],
      ['C', 4, 0.75], ['C', 4, 0.25], ['D', 4, 1], ['C', 4, 1], ['G', 4, 1], ['F', 4, 2],
      ['C', 4, 0.75], ['C', 4, 0.25], ['C', 5, 1], ['A', 4, 1], ['F', 4, 1], ['E', 4, 1], ['D', 4, 2],
      ['A#', 4, 0.75], ['A#', 4, 0.25], ['A', 4, 1], ['F', 4, 1], ['G', 4, 1], ['F', 4, 2],
      [null, 0, 1] // rest at the end
    ];

    // Note to Frequency mapping
    this.notes = {
      'C': 261.63, 'C#': 277.18, 'D': 293.66, 'D#': 311.13, 'E': 329.63,
      'F': 349.23, 'F#': 369.99, 'G': 392.00, 'G#': 415.30, 'A': 440.00,
      'A#': 466.16, 'B': 493.88
    };
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  getFrequency(noteName, octave) {
    if (!noteName) return 0;
    const baseFreq = this.notes[noteName];
    // Standard notes are octave 4. Scale up or down.
    return baseFreq * Math.pow(2, octave - 4);
  }

  // Plays a beautiful chime (Arpeggio)
  playChime() {
    this.init();
    const now = this.ctx.currentTime;
    const notesToPlay = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

    notesToPlay.forEach((freq, index) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0, now + index * 0.08);
      gain.gain.linearRampToValueAtTime(0.15, now + index * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + index * 0.08);
      osc.stop(now + index * 0.08 + 0.6);
    });
  }

  // Plays a short balloon pop sound
  playPop() {
    this.init();
    const now = this.ctx.currentTime;

    // High-to-low sweep oscillator for the pop sound
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);

    // Add a quick white-noise puff for texture
    const bufferSize = this.ctx.sampleRate * 0.02; // 20ms of noise
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 1000;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.15, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

    noiseNode.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    noiseNode.start(now);
    noiseNode.stop(now + 0.03);
  }

  // Play candle blowing sound (soft wind blow)
  playBlow() {
    this.init();
    const now = this.ctx.currentTime;

    const bufferSize = this.ctx.sampleRate * 0.25; // 250ms of blow noise
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.exponentialRampToValueAtTime(100, now + 0.25);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    noiseNode.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noiseNode.start(now);
    noiseNode.stop(now + 0.26);
  }

  // Victory celebration tune
  playVictory() {
    this.init();
    const now = this.ctx.currentTime;
    const notes = [
      ['C', 5, 0.25], ['E', 5, 0.25], ['G', 5, 0.25], ['C', 6, 0.5]
    ];

    let timeAcc = 0;
    notes.forEach(([noteName, octave, dur]) => {
      const playTime = now + timeAcc;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.value = this.getFrequency(noteName, octave);

      gain.gain.setValueAtTime(0, playTime);
      gain.gain.linearRampToValueAtTime(0.18, playTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, playTime + dur - 0.02);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(playTime);
      osc.stop(playTime + dur);

      timeAcc += dur * 0.8;
    });
  }

  // Start background music loop
  startMusic() {
    this.init();
    if (this.isPlayingMusic) return;
    this.isPlayingMusic = true;
    this.melodyIndex = 0;
    this.playNextMusicNote();
  }

  // Play next note in the sequence loop
  playNextMusicNote() {
    if (!this.isPlayingMusic) return;

    const noteInfo = this.birthdaySong[this.melodyIndex];
    const [noteName, octave, duration] = noteInfo;
    const now = this.ctx.currentTime;
    const beatDuration = 60 / this.tempo; // beat duration in seconds
    const soundDuration = duration * beatDuration;

    if (noteName) {
      // Main music box note (high triangle)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(this.getFrequency(noteName, octave), now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + soundDuration - 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + soundDuration);

      // Soft harmony / accompaniment note (lower sine wave)
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(this.getFrequency(noteName, octave - 1), now);

      subGain.gain.setValueAtTime(0, now);
      subGain.gain.linearRampToValueAtTime(0.04, now + 0.05);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + soundDuration - 0.05);

      subOsc.connect(subGain);
      subGain.connect(this.ctx.destination);

      subOsc.start(now);
      subOsc.stop(now + soundDuration);
    }

    // Schedule next note
    this.melodyIndex = (this.melodyIndex + 1) % this.birthdaySong.length;
    this.musicInterval = setTimeout(() => {
      this.playNextMusicNote();
    }, soundDuration * 1000);
  }

  // Stop background music
  stopMusic() {
    this.isPlayingMusic = false;
    clearTimeout(this.musicInterval);
  }

  toggleMusic() {
    if (this.isPlayingMusic) {
      this.stopMusic();
      return false;
    } else {
      this.startMusic();
      return true;
    }
  }
}

const synth = new AudioSynth();


// --- HTML5 CANVAS CONFETTI PARTICLE SYSTEM ---
class ConfettiEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.active = true;

    this.colors = [
      '#e5b3a3', // Rose Gold
      '#ff8fa3', // Accent Pink
      '#ffd700', // Gold
      '#8a2be2', // Purple
      '#00f5ff', // Cyan
      '#ff3b3f'  // Crimson
    ];

    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.loop();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  spawnBurst(x, y, count = 80) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 8;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (1 + Math.random() * 5), // dynamic upward boost
        size: 5 + Math.random() * 8,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: -0.1 + Math.random() * 0.2,
        decay: 0.96 + Math.random() * 0.03, // slow slowdown
        opacity: 1
      });
    }
  }

  spawnContinuousStream() {
    // Left edge rocket
    if (Math.random() < 0.15) {
      this.particles.push({
        x: 0,
        y: this.canvas.height - 20,
        vx: 3 + Math.random() * 5,
        vy: -8 - Math.random() * 12,
        size: 6 + Math.random() * 8,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: -0.1 + Math.random() * 0.2,
        decay: 0.98,
        opacity: 1
      });
    }
    // Right edge rocket
    if (Math.random() < 0.15) {
      this.particles.push({
        x: this.canvas.width,
        y: this.canvas.height - 20,
        vx: -3 - Math.random() * 5,
        vy: -8 - Math.random() * 12,
        size: 6 + Math.random() * 8,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: -0.1 + Math.random() * 0.2,
        decay: 0.98,
        opacity: 1
      });
    }
  }

  loop() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw and update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.18; // gravity
      p.vx *= p.decay;
      p.vy *= p.decay;
      p.rotation += p.rotationSpeed;
      p.opacity -= 0.008; // fade out

      if (p.opacity <= 0 || p.y > this.canvas.height) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.opacity;

      // Draw rectangular confetti piece
      this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      this.ctx.restore();
    }

    requestAnimationFrame(() => this.loop());
  }
}

let confetti = null;


// --- STARFIELD BACKGROUND GENERATION ---
function generateBackgroundStars() {
  const container = document.body;
  const starCount = 50;

  for (let i = 0; i < starCount; i++) {
    const star = document.createElement('div');
    star.className = 'star';

    const size = 1 + Math.random() * 3;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;

    star.style.left = `${Math.random() * 100}vw`;
    star.style.top = `${Math.random() * 100}vh`;

    star.style.setProperty('--duration', `${2 + Math.random() * 5}s`);

    container.appendChild(star);
  }
}


// --- 3D PERSPECTIVE PHOTO CARD TILT ---
function initPhotoTilt() {
  const card = document.getElementById('hero-card');
  const portrait = document.getElementById('hero-portrait');
  if (!card) return;

  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // x coordinate inside the card
    const y = e.clientY - rect.top;  // y coordinate inside the card

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Tilt calculations (-15deg to +15deg max)
    const rotateY = ((x - centerX) / centerX) * 15;
    const rotateX = ((centerY - y) / centerY) * 15;

    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

    // Slight counter parallax for the person photo inside for a depth feel
    portrait.style.transform = `translateX(${rotateY * -0.3}px) translateY(${rotateX * 0.3}px) scale(1.05)`;
  });

  card.addEventListener('mouseleave', () => {
    // Smooth reset
    card.style.transform = 'rotateX(0deg) rotateY(0deg)';
    portrait.style.transform = 'translateX(0) translateY(0) scale(1)';
    card.style.transition = 'transform 0.5s ease';
    portrait.style.transition = 'transform 0.5s ease';
  });

  card.addEventListener('mouseenter', () => {
    card.style.transition = 'none';
    portrait.style.transition = 'none';
  });
}


// --- FLIP COMPLIMENT CARDS CONTROLLER ---
function initComplimentCards() {
  const cards = document.querySelectorAll('.flip-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      synth.playPop(); // click feedback
      card.classList.toggle('flipped');
    });
  });
}


// --- VIRTUAL CAKE Extinguish CANDLES ---
function initVirtualCake() {
  const candles = document.querySelectorAll('.candle-container');
  let blownCount = 0;

  candles.forEach(candle => {
    candle.addEventListener('click', () => {
      if (candle.classList.contains('extinguished')) return;

      // Play soft blow sound
      synth.playBlow();

      // Extinguish
      candle.classList.add('extinguished');
      blownCount++;

      // Trigger local smoke animation
      const smoke = candle.querySelector('.smoke-puff');
      if (smoke) {
        smoke.classList.add('puff-anim');
        smoke.addEventListener('animationend', () => {
          smoke.classList.remove('puff-anim');
        });
      }

      // Small local confetti spray from top of candle
      if (confetti) {
        const rect = candle.getBoundingClientRect();
        confetti.spawnBurst(rect.left + rect.width / 2, rect.top, 15);
      }

      // Check if all blown out
      if (blownCount === candles.length) {
        setTimeout(() => {
          celebrateCakeSuccess();
        }, 500);
      }
    });
  });
}

function celebrateCakeSuccess() {
  // Play happy win sound
  synth.playVictory();

  // Massive confetti explosion
  if (confetti) {
    const wWidth = window.innerWidth;
    const wHeight = window.innerHeight;
    confetti.spawnBurst(wWidth / 2, wHeight / 2, 150);

    // Continue streaming confetti for 4 seconds
    let streamTimer = setInterval(() => {
      confetti.spawnContinuousStream();
    }, 50);

    setTimeout(() => {
      clearInterval(streamTimer);
    }, 4000);
  }

  // Update header text to glowing effect
  const mainTitle = document.getElementById('main-title');
  if (mainTitle) {
    mainTitle.style.animation = 'pulseGlow 1s infinite alternate';
    mainTitle.textContent = "Make a Wish, Senara! 🎂";
  }
}


// --- BALLOON POP CHALLENGE GAME ---
class BalloonGame {
  constructor() {
    this.viewport = document.getElementById('game-viewport');
    this.scoreSpan = document.getElementById('game-score');
    this.startBtn = document.getElementById('game-start-btn');
    this.score = 0;
    this.maxScore = 22; // "HAPPY BIRTHDAY SENARA !" - length is 22 with spacers/exclamation
    this.gameInterval = null;
    this.isGaming = false;

    // Spaced out letters
    this.letters = "HAPPY BIRTHDAY SENARA!".split('');
    this.balloonColors = [
      'rgba(255, 143, 163, 0.85)', // rose pink
      'rgba(229, 179, 163, 0.85)', // rose gold
      'rgba(255, 215, 0, 0.85)',   // gold
      'rgba(138, 43, 226, 0.85)',  // purple
      'rgba(0, 245, 255, 0.85)'    // cyan
    ];

    this.startBtn.addEventListener('click', () => this.startGame());
  }

  startGame() {
    synth.init();
    this.score = 0;
    this.scoreSpan.textContent = '0';
    this.isGaming = true;
    this.viewport.innerHTML = ''; // Clear viewport

    // Hide startup overlay overlay, but keep game-score-board
    this.startBtn.style.display = 'none';

    // Start generating balloons
    let letterPointer = 0;

    this.gameInterval = setInterval(() => {
      if (letterPointer >= this.letters.length) {
        clearInterval(this.gameInterval);
        return;
      }

      const char = this.letters[letterPointer];
      // Skip empty space characters but still count them towards score
      if (char === ' ') {
        this.score++;
        this.scoreSpan.textContent = this.score;
        letterPointer++;
        return;
      }

      this.spawnGameBalloon(char);
      letterPointer++;
    }, 1200);
  }

  spawnGameBalloon(char) {
    if (!this.isGaming) return;

    const balloon = document.createElement('div');
    balloon.className = 'game-balloon';
    balloon.textContent = char;

    // Color & Position
    const color = this.balloonColors[Math.floor(Math.random() * this.balloonColors.length)];
    balloon.style.backgroundColor = color;
    balloon.style.left = `${10 + Math.random() * 80}%`;

    // String decoration
    const string = document.createElement('div');
    string.className = 'game-balloon-string';
    balloon.appendChild(string);

    this.viewport.appendChild(balloon);

    // Physics - Rise Up
    let bottomVal = -100;
    const speed = 1.2 + Math.random() * 1.5;
    const swayRange = 10 + Math.random() * 20;
    const swaySpeed = 0.02 + Math.random() * 0.03;
    let time = 0;
    const initialLeft = parseFloat(balloon.style.left);

    const animate = () => {
      if (!balloon.parentNode || !this.isGaming) return;

      bottomVal += speed;
      time += swaySpeed;

      balloon.style.bottom = `${bottomVal}px`;
      balloon.style.left = `${initialLeft + Math.sin(time) * 4}%`;

      // If misses and goes out of top of viewport
      if (bottomVal > this.viewport.clientHeight + 100) {
        balloon.remove();
        this.checkGameOver();
      } else {
        requestAnimationFrame(animate);
      }
    };

    // Pop trigger
    balloon.addEventListener('mousedown', (e) => this.popBalloon(balloon, e));
    balloon.addEventListener('touchstart', (e) => {
      e.preventDefault(); // stop double clicks
      this.popBalloon(balloon, e.touches[0]);
    });

    requestAnimationFrame(animate);
  }

  popBalloon(balloon, clickEvent) {
    // Play synthesis pop sound
    synth.playPop();

    // Spawn local confetti spray
    if (confetti) {
      confetti.spawnBurst(clickEvent.clientX, clickEvent.clientY, 25);
    }

    balloon.remove();
    this.score++;
    this.scoreSpan.textContent = this.score;

    this.checkGameOver();
  }

  checkGameOver() {
    // If all letter balloons are popped/cleared
    const currentBalloons = this.viewport.querySelectorAll('.game-balloon');
    if (this.score >= this.maxScore && currentBalloons.length === 0) {
      this.isGaming = false;
      clearInterval(this.gameInterval);

      // Show success container overlay
      setTimeout(() => {
        this.viewport.innerHTML = `
          <div class="game-canvas-overlay" style="display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 20px;">
            <h3 style="font-family: var(--font-heading); color: var(--rose-gold); font-size: 2rem; margin-bottom: 10px;">Fantastic Job!</h3>
            <p class="hero-para" style="margin-bottom: 20px;">You popped all of Senara's birthday balloons!</p>
            <button class="game-start-btn" id="game-restart-btn">Play Again</button>
          </div>
        `;
        document.getElementById('game-restart-btn').addEventListener('click', () => this.startGame());
        synth.playVictory();
      }, 800);
    }
  }
}


// --- INTERACTIVE WISH BOARD (LocalStorage) ---
class WishBoard {
  constructor() {
    this.displayArea = document.getElementById('wishes-display-area');
    this.form = document.getElementById('wish-form');
    this.wisherName = document.getElementById('wisher-name');
    this.wisherMessage = document.getElementById('wisher-message');

    // Modal selectors
    this.modal = document.getElementById('wish-modal');
    this.modalText = document.getElementById('wish-modal-text');
    this.modalAuthor = document.getElementById('wish-modal-author');
    this.modalClose = document.getElementById('wish-modal-close');

    this.balloonColors = [
      '#ff8fa3', // Pink
      '#e5b3a3', // Rose Gold
      '#ffd700', // Gold
      '#8a2be2', // Violet
      '#ffc0cb'  // Pastel Pink
    ];

    // Default pre-populated wishes
    this.defaultWishes = [
     
    ];

    this.init();
  }

  init() {
    // Form submit listener
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleNewWish();
    });

    // Close modal listener
    this.modalClose.addEventListener('click', () => this.closeModal());
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.closeModal();
    });

    this.loadAndRenderWishes();
  }

  loadAndRenderWishes() {
    this.displayArea.innerHTML = ''; // clear
    let wishes = JSON.parse(localStorage.getItem('senara_bday_wishes'));

    if (!wishes || wishes.length === 0) {
      wishes = this.defaultWishes;
      localStorage.setItem('senara_bday_wishes', JSON.stringify(wishes));
    }

    wishes.forEach((wish, idx) => {
      this.spawnWishBalloon(wish, idx);
    });
  }

  spawnWishBalloon(wish, idx) {
    const balloon = document.createElement('div');
    balloon.className = 'wish-balloon';

    // Visual Setup
    const color = this.balloonColors[idx % this.balloonColors.length];
    balloon.style.backgroundColor = color;
    balloon.style.color = '#fff';
    balloon.style.fontWeight = 'bold';

    // Abbreviated letter as center of balloon
    balloon.textContent = wish.name.charAt(0).toUpperCase();

    // Placement positions inside display container
    // Keep them spaced out so they don't overlap completely
    const boundaryX = this.displayArea.clientWidth - 60;
    const boundaryY = this.displayArea.clientHeight - 80;

    const randomX = 30 + Math.random() * (boundaryX - 40);
    const randomY = 30 + Math.random() * (boundaryY - 40);

    balloon.style.left = `${randomX}px`;
    balloon.style.top = `${randomY}px`;

    // Slight motion animations
    balloon.style.setProperty('--float-duration', `${4 + Math.random() * 5}s`);
    balloon.style.setProperty('--float-x', `${-15 + Math.random() * 30}px`);

    // Click listener to read the wish
    balloon.addEventListener('click', (e) => {
      synth.playPop();
      if (confetti) {
        confetti.spawnBurst(e.clientX, e.clientY, 15);
      }
      this.openModal(wish);
    });

    this.displayArea.appendChild(balloon);
  }

  handleNewWish() {
    const name = this.wisherName.value.trim();
    const msg = this.wisherMessage.value.trim();

    if (!name || !msg) return;

    const newWish = { name, msg };

    // Save to LocalStorage
    let wishes = JSON.parse(localStorage.getItem('senara_bday_wishes')) || [];
    wishes.push(newWish);
    localStorage.setItem('senara_bday_wishes', JSON.stringify(wishes));

    // UI Update
    this.spawnWishBalloon(newWish, wishes.length - 1);

    // Synth sound
    synth.playChime();

    // Reset Form
    this.form.reset();
  }

  openModal(wish) {
    this.modalText.textContent = `"${wish.msg}"`;
    this.modalAuthor.textContent = `— ${wish.name}`;
    this.modal.classList.add('active');
  }

  closeModal() {
    this.modal.classList.remove('active');
  }
}


// --- MUSIC PLAYER AUDIO CONTROLLER ---
function initMusicPlayer() {
  const controller = document.getElementById('music-controller');
  const statusText = document.getElementById('music-status');
  if (!controller) return;

  controller.addEventListener('click', () => {
    const isPlaying = synth.toggleMusic();
    if (isPlaying) {
      controller.classList.add('playing');
      statusText.textContent = "Playing Vibes";
    } else {
      controller.classList.remove('playing');
      statusText.textContent = "Sound Muted";
    }
  });
}


// --- INITIALIZATION GATE ---
window.addEventListener('DOMContentLoaded', () => {
  // 1. Generate floating star background
  generateBackgroundStars();

  // 2. Initialize Confetti Engine
  confetti = new ConfettiEngine('confetti-canvas');

  // 3. Initialize Card Tilt Effect
  initPhotoTilt();

  // 4. Initialize Compliment flip badges
  initComplimentCards();

  // 5. Initialize Virtual Cake Candles
  initVirtualCake();

  // 6. Initialize Wish Board System
  const wishBoard = new WishBoard();

  // 7. Initialize Balloon popping game
  const balloonGame = new BalloonGame();

  // 8. Initialize Music Player
  initMusicPlayer();

  // 9. Envelope Reveal Handler
  const envelope = document.getElementById('envelope');
  const introCover = document.getElementById('intro-cover');

  if (envelope && introCover) {
    envelope.addEventListener('click', () => {
      // 1. Open Envelope animations
      envelope.classList.add('open');

      // 2. Trigger chime sound immediately
      synth.playChime();

      // 3. Spurt high-volume confetti bursts after opening flap
      setTimeout(() => {
        const wWidth = window.innerWidth;
        const wHeight = window.innerHeight;
        confetti.spawnBurst(wWidth / 2, wHeight / 2, 100);
      }, 400);

      // 4. Fade envelope out and reveal the site
      setTimeout(() => {
        introCover.classList.add('fade-out');

        // Auto-start soft bg music on envelope unlock
        synth.startMusic();
        const musicController = document.getElementById('music-controller');
        const statusText = document.getElementById('music-status');
        if (musicController) {
          musicController.classList.add('playing');
          statusText.textContent = "Playing Vibes";
        }
      }, 1500);

      // 5. Cleanup DOM
      setTimeout(() => {
        introCover.style.display = 'none';
      }, 2300);
    });
  }
});
