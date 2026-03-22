// app.js — Screen navigation, app init

const App = {
  currentScreen: 'home',

  async init() {
    // Init audio context on first user interaction
    document.addEventListener('click', () => AudioFX._ensureCtx(), { once: true });
    document.addEventListener('keydown', () => AudioFX._ensureCtx(), { once: true });

    // Init MIDI
    await MidiManager.init();

    // Init computer keyboard fallback
    KeyboardInput.init();

    // Build song list
    this.buildSongList();

    // Wire up buttons
    document.getElementById('btn-back').addEventListener('click', () => {
      Game.stop();
      this.showScreen('home');
    });

    document.getElementById('btn-pause').addEventListener('click', () => {
      const paused = Game.togglePause();
      document.getElementById('btn-pause').textContent = paused ? '▶ Resume' : '⏸ Pause';
    });

    document.getElementById('btn-beat').addEventListener('click', () => {
      Game.beatEnabled = !Game.beatEnabled;
      document.getElementById('btn-beat').textContent = Game.beatEnabled ? '🥁 Beat: On' : '🥁 Beat: Off';
    });

    document.getElementById('btn-home').addEventListener('click', () => {
      this.showScreen('home');
    });

    document.getElementById('btn-retry').addEventListener('click', () => {
      const songId = document.getElementById('btn-retry').dataset.songId;
      const song = SONGS.find(s => s.id === songId);
      if (song) this.playSong(song);
    });

    // Show home
    this.showScreen('home');
  },

  buildSongList() {
    const container = document.getElementById('song-list');
    container.innerHTML = '';

    SONGS.forEach(song => {
      const card = document.createElement('div');
      card.className = 'song-card';
      card.style.borderColor = song.color;

      const stars = '⭐'.repeat(song.difficulty);
      card.innerHTML = `
        <div class="song-color-bar" style="background: ${song.color}"></div>
        <div class="song-info">
          <h3 class="song-title">${song.title}</h3>
          <div class="song-difficulty">${stars}</div>
          <p class="song-desc">${song.description}</p>
        </div>
      `;
      card.addEventListener('click', () => this.playSong(song));
      container.appendChild(card);
    });
  },

  playSong(song) {
    this.showScreen('play');
    document.getElementById('btn-pause').textContent = '⏸ Pause';
    document.getElementById('btn-beat').textContent = Game.beatEnabled ? '🥁 Beat: On' : '🥁 Beat: Off';

    // Init renderer with canvas
    const canvas = document.getElementById('game-canvas');
    Renderer.init(canvas);

    // Start game
    Game.onComplete = (stats) => this.showResults(song, stats);
    Game.onScoreUpdate = null; // score drawn by game loop
    Game.start(song);
  },

  showResults(song, stats) {
    this.showScreen('results');

    // Stars
    const starsEl = document.getElementById('result-stars');
    starsEl.innerHTML = '';
    for (let i = 0; i < 3; i++) {
      const star = document.createElement('span');
      star.className = 'result-star' + (i < stats.stars ? ' earned' : '');
      star.textContent = '⭐';
      starsEl.appendChild(star);
    }

    // Stats
    document.getElementById('result-score').textContent = stats.score;
    document.getElementById('result-accuracy').textContent = stats.accuracy + '%';
    document.getElementById('result-streak').textContent = stats.bestStreak;
    document.getElementById('result-hit').textContent = `${stats.notesHit} / ${stats.totalNotes}`;

    // Message
    const msgEl = document.getElementById('result-message');
    if (stats.stars === 3) {
      msgEl.textContent = 'AMAZING! You are a piano star!';
      msgEl.style.color = '#FFD700';
      // Confetti on results screen
      setTimeout(() => this._resultConfetti(), 200);
    } else if (stats.stars === 2) {
      msgEl.textContent = 'Great job! Almost perfect!';
      msgEl.style.color = '#44ff88';
    } else if (stats.stars === 1) {
      msgEl.textContent = 'Good try! Keep practicing!';
      msgEl.style.color = '#88ccff';
    } else {
      msgEl.textContent = 'Keep going, you can do it!';
      msgEl.style.color = '#ffaa88';
    }

    // Song title
    document.getElementById('result-song-title').textContent = song.title;
    document.getElementById('btn-retry').dataset.songId = song.id;
  },

  _resultConfetti() {
    const container = document.getElementById('results-screen');
    for (let i = 0; i < 60; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = Math.random() * 100 + '%';
      piece.style.animationDelay = Math.random() * 2 + 's';
      piece.style.backgroundColor = ['#FF4444', '#FF8C00', '#FFD700', '#44BB44', '#00CED1', '#4488FF', '#9944FF'][Math.floor(Math.random() * 7)];
      container.appendChild(piece);
      setTimeout(() => piece.remove(), 3000);
    }
  },

  showScreen(name) {
    document.querySelectorAll('.screen').forEach(el => {
      el.classList.toggle('active', el.id === name + '-screen');
    });
    this.currentScreen = name;
  }
};

// Boot
window.addEventListener('DOMContentLoaded', () => App.init());
