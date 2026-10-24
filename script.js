/* ==========================================================
   Nova Blaster: Quiz Edition - script.js
   ========================================================== */
(() => {
  'use strict';

  /* ---------- Util ---------- */
  const $ = (id) => document.getElementById(id);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand = (a, b) => a + Math.random() * (b - a);
  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  /* ---------- Elemen ---------- */
  const canvas = $('arena');
  const ctx = canvas.getContext('2d');
  const gameEl = $('game');
  canvas.style.touchAction = 'none';

  const el = {
    hud: $('hud'),
    score: $('hud-score'),
    stage: $('hud-stage'),
    lives: $('hud-lives'),
    combo: $('hud-combo'),
    powerBar: $('powerup-bar'),
    progress: $('stage-progress'),
    progressFill: $('stage-progress-fill'),
    banner: $('stage-banner'),
    bannerText: $('stage-banner-text'),
    touch: $('touch-controls'),
    toolbar: $('toolbar'),
    menuHigh: $('menu-highscore'),
    quizStage: $('quiz-stage'),
    quizTime: $('quiz-time'),
    timerFill: $('timer-fill'),
    quizQuestion: $('quiz-question'),
    quizFeedback: $('quiz-feedback'),
    options: Array.from(document.querySelectorAll('#quiz-options .option')),
    powerStreak: $('powerup-streak'),
    powerChoices: Array.from(document.querySelectorAll('#powerup-choices .powerup')),
    resScore: $('result-score'),
    resStage: $('result-stage'),
    resCorrect: $('result-correct'),
    resHigh: $('result-highscore'),
    resNew: $('result-newrecord'),
    btnSound: $('btn-sound')
  };

  const screens = {
    menu: $('screen-menu'),
    howto: $('screen-howto'),
    quiz: $('screen-quiz'),
    powerup: $('screen-powerup'),
    pause: $('screen-pause'),
    gameover: $('screen-gameover')
  };

  /* ---------- Konstanta ---------- */
  const QUIZ_TIME = 15;
  const START_LIVES = 3;
  const MAX_LIVES = 5;
  const STORAGE_KEY = 'novaBlasterQuizHighScore';

  /* ---------- Bank soal: [pertanyaan, [opsi], indeks benar, level] ---------- */
  const QUESTIONS = [
    // Level 1
    ['Planet apa yang paling dekat dengan Matahari?', ['Merkurius', 'Venus', 'Bumi', 'Mars'], 0, 1],
    ['Hewan darat apa yang paling cepat larinya?', ['Singa', 'Cheetah', 'Kuda', 'Macan tutul'], 1, 1],
    ['Apa ibu kota Jepang?', ['Osaka', 'Kyoto', 'Tokyo', 'Nagoya'], 2, 1],
    ['Berapa jumlah warna pada pelangi?', ['5', '6', '7', '8'], 2, 1],
    ['Gas apa yang kita hirup untuk bernapas?', ['Oksigen', 'Nitrogen', 'Hidrogen', 'Helium'], 0, 1],
    ['Benua apa yang paling luas?', ['Afrika', 'Amerika', 'Eropa', 'Asia'], 3, 1],
    ['Samudra apa yang paling luas?', ['Atlantik', 'Hindia', 'Pasifik', 'Arktik'], 2, 1],
    ['Siapa proklamator kemerdekaan Indonesia bersama Mohammad Hatta?', ['Soekarno', 'Soeharto', 'Sutan Sjahrir', 'Ki Hajar Dewantara'], 0, 1],
    ['Apa rumus kimia air?', ['CO2', 'H2O', 'O2', 'NaCl'], 1, 1],
    ['Apa bahasa resmi Brasil?', ['Spanyol', 'Inggris', 'Portugis', 'Prancis'], 2, 1],
    ['Hewan apa yang dijuluki raja hutan?', ['Harimau', 'Gajah', 'Beruang', 'Singa'], 3, 1],
    ['Alat musik bambu tradisional dari Jawa Barat adalah?', ['Angklung', 'Sasando', 'Gamelan', 'Tifa'], 0, 1],

    // Level 2
    ['Gunung tertinggi di dunia adalah?', ['K2', 'Everest', 'Kilimanjaro', 'Elbrus'], 1, 2],
    ['Pada tahun berapa Indonesia memproklamasikan kemerdekaan?', ['1942', '1945', '1949', '1950'], 1, 2],
    ['Siapa yang mempopulerkan bola lampu pijar?', ['Nikola Tesla', 'Isaac Newton', 'Thomas Edison', 'Alexander Bell'], 2, 2],
    ['Unsur kimia dengan simbol Fe adalah?', ['Fosfor', 'Besi', 'Fluorin', 'Perak'], 1, 2],
    ['Apa mata uang Jepang?', ['Won', 'Yuan', 'Ringgit', 'Yen'], 3, 2],
    ['Candi Buddha terbesar di dunia yang berada di Magelang adalah?', ['Prambanan', 'Mendut', 'Borobudur', 'Sewu'], 2, 2],
    ['Organ apa yang menghasilkan insulin?', ['Hati', 'Pankreas', 'Ginjal', 'Lambung'], 1, 2],
    ['Siapa pelukis Mona Lisa?', ['Leonardo da Vinci', 'Pablo Picasso', 'Vincent van Gogh', 'Michelangelo'], 0, 2],
    ['Apa ibu kota Australia?', ['Sydney', 'Melbourne', 'Canberra', 'Perth'], 2, 2],
    ['Planet mana yang dijuluki Planet Merah?', ['Jupiter', 'Mars', 'Saturnus', 'Merkurius'], 1, 2],
    ['Siapa penulis novel Laskar Pelangi?', ['Tere Liye', 'Pramoedya Ananta Toer', 'Andrea Hirata', 'Habiburrahman El Shirazy'], 2, 2],
    ['Selat apa yang memisahkan Pulau Jawa dan Pulau Sumatra?', ['Selat Sunda', 'Selat Bali', 'Selat Malaka', 'Selat Makassar'], 0, 2],

    // Level 3
    ['Pada tahun berapa Perang Dunia II berakhir?', ['1943', '1944', '1945', '1946'], 2, 3],
    ['Kecepatan cahaya dalam ruang hampa sekitar berapa?', ['3.000 km/detik', '30.000 km/detik', '300.000 km/detik', '3.000.000 km/detik'], 2, 3],
    ['Siapa pencipta World Wide Web?', ['Bill Gates', 'Tim Berners-Lee', 'Steve Jobs', 'Linus Torvalds'], 1, 3],
    ['Negara terkecil di dunia berdasarkan luas wilayah adalah?', ['Monako', 'San Marino', 'Vatikan', 'Liechtenstein'], 2, 3],
    ['Bagian sel yang berfungsi sebagai pembangkit energi adalah?', ['Ribosom', 'Mitokondria', 'Nukleus', 'Lisosom'], 1, 3],
    ['Konferensi Asia Afrika tahun 1955 diadakan di kota?', ['Jakarta', 'Surabaya', 'Yogyakarta', 'Bandung'], 3, 3],
    ['Siapa yang mengemukakan teori relativitas?', ['Albert Einstein', 'Niels Bohr', 'Galileo Galilei', 'Stephen Hawking'], 0, 3],
    ['Bilangan prima terkecil adalah?', ['0', '1', '2', '3'], 2, 3],
    ['Apa ibu kota Turki?', ['Istanbul', 'Ankara', 'Izmir', 'Bursa'], 1, 3],
    ['Gas apa yang paling banyak terdapat di atmosfer Bumi?', ['Oksigen', 'Karbon dioksida', 'Argon', 'Nitrogen'], 3, 3],
    ['Siapa yang memimpin ekspedisi pelayaran pertama mengelilingi dunia?', ['Christopher Columbus', 'Ferdinand Magellan', 'Vasco da Gama', 'James Cook'], 1, 3],
    ['Apa satuan tekanan dalam Sistem Internasional (SI)?', ['Joule', 'Newton', 'Pascal', 'Watt'], 2, 3]
  ];

  /* ---------- Status global ---------- */
  let W = 0;
  let H = 0;
  let state = 'menu'; // menu | playing | paused | quiz | powerup | gameover
  let g = null;       // data permainan aktif
  let lastTime = 0;
  let highScore = loadHighScore();
  let stars = [];
  let usedQuestions = new Set();
  let quiz = { q: null, timer: null, endAt: 0, lastSec: 0, locked: false, correctIndex: 0 };
  let bannerTimeout = null;
  let audioCtx = null;
  let soundOn = true;
  let hudCache = {};
  let barKey = '';

  const keys = { left: false, right: false, fire: false };
  const touch = { left: false, right: false, fire: false };

  /* ---------- Penyimpanan ---------- */
  function loadHighScore() {
    try {
      return parseInt(localStorage.getItem(STORAGE_KEY), 10) || 0;
    } catch (e) {
      return 0;
    }
  }

  function saveHighScore(v) {
    try {
      localStorage.setItem(STORAGE_KEY, String(v));
    } catch (e) { /* abaikan */ }
  }

  /* ---------- Audio ---------- */
  function ensureAudio() {
    if (audioCtx) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    } catch (e) {
      audioCtx = null;
    }
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  }

  function beep(freq, dur = 0.08, type = 'square', vol = 0.04, slide = 0) {
    if (!soundOn || !audioCtx) return;
    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t + dur);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  const sfx = {
    shoot: () => beep(880, 0.05, 'square', 0.015, -400),
    boom: () => beep(160, 0.18, 'sawtooth', 0.05, -110),
    hit: () => beep(120, 0.3, 'sawtooth', 0.07, -80),
    tick: () => beep(1000, 0.05, 'square', 0.04),
    correct: () => {
      beep(523, 0.1, 'triangle', 0.06);
      setTimeout(() => beep(659, 0.1, 'triangle', 0.06), 100);
      setTimeout(() => beep(784, 0.18, 'triangle', 0.06), 200);
    },
    wrong: () => {
      beep(300, 0.15, 'sawtooth', 0.06, -100);
      setTimeout(() => beep(200, 0.25, 'sawtooth', 0.06, -80), 150);
    },
    nova: () => beep(90, 0.6, 'sawtooth', 0.09, 600),
    pick: () => beep(740, 0.1, 'triangle', 0.05, 200)
  };

  /* ---------- Layar & UI ---------- */
  function showScreen(name) {
    Object.keys(screens).forEach((k) => {
      screens[k].classList.toggle('hidden', k !== name);
    });
  }

  function setPlayingUI(on) {
    [el.hud, el.powerBar, el.progress, el.toolbar, el.touch].forEach((node) => {
      node.classList.toggle('hidden', !on);
    });
  }

  function releaseInputs() {
    keys.left = keys.right = keys.fire = false;
    touch.left = touch.right = touch.fire = false;
    if (g) g.dragX = null;
  }

  function setText(node, key, val) {
    if (hudCache[key] !== val) {
      hudCache[key] = val;
      node.textContent = val;
    }
  }

  function comboMult() {
    return 1 + Math.min(4, Math.floor(g.combo / 5));
  }

  function updateHud() {
    setText(el.score, 'score', String(g.score));
    setText(el.stage, 'stage', String(g.stage));
    setText(el.lives, 'lives', '\u2665 ' + g.lives);
    setText(el.combo, 'combo', 'x' + comboMult());

    // Power-up aktif
    const items = [];
    if (g.shield > 0) items.push('Perisai x' + g.shield);
    if (g.tripleTime > 0) items.push('Triple Shot ' + Math.ceil(g.tripleTime) + ' dtk');
    if (g.slowTime > 0) items.push('Slow Motion ' + Math.ceil(g.slowTime) + ' dtk');
    if (g.novaCharges > 0) items.push('Bom Nova x' + g.novaCharges + ' (tekan B)');
    const key = items.join('|');
    if (key !== barKey) {
      barKey = key;
      el.powerBar.innerHTML = items.map((t) => '<li>' + t + '</li>').join('');
    }

    // Progres stage
    let pct;
    if (g.phase === 'wave') {
      pct = (g.done / g.target) * 100;
    } else if (g.phase === 'boss' && g.boss) {
      pct = (g.boss.hp / g.boss.maxHp) * 100;
    } else {
      pct = 0;
    }
    pct = clamp(Math.round(pct), 0, 100);
    if (hudCache.pct !== pct) {
      hudCache.pct = pct;
      el.progressFill.style.width = pct + '%';
      el.progress.setAttribute('aria-valuenow', String(pct));
    }
  }

  function showBanner(text) {
    el.bannerText.textContent = text;
    el.banner.classList.add('hidden');
    void el.banner.offsetWidth;
    el.banner.classList.remove('hidden');
    clearTimeout(bannerTimeout);
    bannerTimeout = setTimeout(() => el.banner.classList.add('hidden'), 1800);
  }

  function shake() {
    gameEl.classList.remove('shake');
    void gameEl.offsetWidth;
    gameEl.classList.add('shake');
    setTimeout(() => gameEl.classList.remove('shake'), 300);
  }

  function flash() {
    gameEl.classList.remove('flash');
    void gameEl.offsetWidth;
    gameEl.classList.add('flash');
    setTimeout(() => gameEl.classList.remove('flash'), 400);
  }

  /* ---------- Ukuran canvas & bintang ---------- */
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    W = gameEl.clientWidth;
    H = gameEl.clientHeight;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    stars = [];
    const count = Math.round((W * H) / 9000) + 30;
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        s: rand(0.6, 2.2),
        v: rand(14, 70)
      });
    }

    if (g) {
      g.player.y = H - 120;
      g.player.x = clamp(g.player.x, g.player.r + 8, W - g.player.r - 8);
    }
  }

  function updateStars(dt) {
    const boost = g && state === 'playing' ? 1 + g.stage * 0.06 : 1;
    for (const s of stars) {
      s.y += s.v * boost * dt;
      if (s.y > H) {
        s.y = -2;
        s.x = Math.random() * W;
      }
    }
  }

  /* ---------- Inisialisasi permainan ---------- */
  function newGame() {
    g = {
      stage: 1,
      score: 0,
      lives: START_LIVES,
      combo: 0,
      correct: 0,
      streak: 0,
      time: 0,
      phase: 'wave', // wave | boss | clear
      kills: 0,
      done: 0,
      spawned: 0,
      target: 0,
      spawnCd: 1,
      meteorCd: 4,
      clearTimer: 0,
      boss: null,
      dragX: null,
      shield: 0,
      tripleTime: 0,
      tripleWide: false,
      slowTime: 0,
      novaCharges: 0,
      novaPower: 0.2,
      bullets: [],
      enemyBullets: [],
      enemies: [],
      particles: [],
      player: { x: W / 2, y: H - 120, r: 16, speed: 360, cd: 0, invuln: 0 }
    };
    usedQuestions = new Set();
    hudCache = {};
    barKey = '';
    beginStage();
  }

  function beginStage() {
    g.phase = 'wave';
    g.kills = 0;
    g.done = 0;
    g.spawned = 0;
    g.target = 8 + g.stage * 3;
    g.spawnCd = 1.2;
    g.meteorCd = rand(3, 6);
    g.boss = null;
    g.enemies = [];
    g.enemyBullets = [];
    g.bullets = [];
    showBanner('Stage ' + g.stage);
  }

  function startGame() {
    ensureAudio();
    releaseInputs();
    newGame();
    state = 'playing';
    showScreen(null);
    setPlayingUI(true);
    updateHud();
  }

  function goMenu() {
    state = 'menu';
    releaseInputs();
    clearInterval(quiz.timer);
    setPlayingUI(false);
    el.banner.classList.add('hidden');
    el.menuHigh.textContent = String(highScore);
    showScreen('menu');
  }

  /* ---------- Spawn ---------- */
  function enemyPool() {
    const s = g.stage;
    const pool = ['drone', 'drone'];
    if (s >= 2) pool.push('zigzag');
    if (s >= 3) pool.push('shooter', 'zigzag');
    if (s >= 5) pool.push('homing', 'shooter');
    if (s >= 7) pool.push('elite', 'homing');
    return pool;
  }

  function spawnEnemy() {
    const type = enemyPool()[Math.floor(Math.random() * enemyPool().length)];
    const s = g.stage;
    const margin = 40;
    const x = rand(margin, W - margin);
    const e = {
      type, x, baseX: clamp(x, margin + 55, W - margin - 55), y: -30,
      r: 15, hp: 1, vy: 70 + s * 11, vx: 0, t: Math.random() * 6,
      shoots: false, cd: 0, rate: 2, counted: true, rot: 0, dead: false
    };

    if (type === 'zigzag') {
      e.vy = 80 + s * 10;
    } else if (type === 'shooter') {
      e.hp = 2;
      e.r = 17;
      e.vy = 48 + s * 4;
      e.shoots = true;
      e.rate = Math.max(0.9, 2.1 - s * 0.1);
      e.cd = rand(0.6, 1.4);
    } else if (type === 'homing') {
      e.hp = 2;
      e.r = 17;
      e.vy = 45 + s * 4;
      e.shoots = true;
      e.rate = Math.max(1, 2.4 - s * 0.1);
      e.cd = rand(0.8, 1.6);
    } else if (type === 'elite') {
      e.hp = 5;
      e.r = 22;
      e.vy = 40 + s * 3;
      e.shoots = true;
      e.rate = Math.max(1.1, 2.6 - s * 0.1);
      e.cd = 1;
    }
    g.enemies.push(e);
    g.spawned++;
  }

  function spawnMeteor() {
    g.enemies.push({
      type: 'meteor', x: rand(20, W - 20), baseX: 0, y: -30,
      r: rand(16, 26), hp: 3, vy: rand(110, 170) + g.stage * 6, vx: rand(-40, 40),
      t: 0, shoots: false, cd: 0, rate: 0, counted: false, rot: 0, dead: false
    });
  }

  function spawnBoss() {
    const hp = 20 + g.stage * 10;
    g.boss = {
      x: W / 2, y: -70, r: 44, hp, maxHp: hp,
      t: 0, cd: 1.4, ringCd: 3, flash: 0
    };
    g.phase = 'boss';
    showBanner('Boss!');
  }

  /* ---------- Tembakan ---------- */
  function playerShoot() {
    const p = g.player;
    const angles = g.tripleTime > 0
      ? (g.tripleWide ? [-0.28, -0.14, 0, 0.14, 0.28] : [-0.18, 0, 0.18])
      : [0];
    p.cd = 0.2;
    angles.forEach((a) => {
      g.bullets.push({
        x: p.x, y: p.y - p.r,
        vx: Math.sin(a) * 540, vy: -Math.cos(a) * 540, r: 4
      });
    });
    sfx.shoot();
  }

  function enemyBullet(x, y, angle, speed) {
    const sp = speed * (1 + g.stage * 0.03);
    g.enemyBullets.push({ x, y, vx: Math.cos(angle) * sp, vy: Math.sin(angle) * sp, r: 5 });
  }

  function enemyFire(e) {
    const p = g.player;
    const aim = Math.atan2(p.y - e.y, p.x - e.x);
    if (e.type === 'shooter') {
      enemyBullet(e.x, e.y + e.r, Math.PI / 2, 200);
    } else if (e.type === 'homing') {
      enemyBullet(e.x, e.y + e.r, aim, 175);
    } else if (e.type === 'elite') {
      [-0.25, 0, 0.25].forEach((o) => enemyBullet(e.x, e.y + e.r, aim + o, 185));
    }
  }

  function bossFire(b) {
    const p = g.player;
    const aim = Math.atan2(p.y - b.y, p.x - b.x);
    const count = Math.min(9, 3 + Math.floor(g.stage / 2));
    const arc = 0.9;
    for (let i = 0; i < count; i++) {
      const off = count === 1 ? 0 : -arc / 2 + (arc * i) / (count - 1);
      enemyBullet(b.x, b.y + b.r * 0.6, aim + off, 190 + g.stage * 6);
    }
  }

  function bossRing(b) {
    const n = 12 + Math.min(10, g.stage);
    const base = Math.random() * Math.PI;
    for (let i = 0; i < n; i++) {
      enemyBullet(b.x, b.y, base + (i * Math.PI * 2) / n, 130);
    }
  }

  /* ---------- Efek partikel ---------- */
  function burst(x, y, color, n = 12, speed = 160) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = rand(speed * 0.3, speed);
      g.particles.push({
        x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
        life: rand(0.3, 0.7), max: 0.7, color, size: rand(1.5, 3.5)
      });
    }
  }

  /* ---------- Logika kerusakan ---------- */
  const POINTS = { drone: 10, zigzag: 15, shooter: 25, homing: 30, elite: 60, meteor: 5 };
  const COLORS = {
    drone: '#ff7a90', zigzag: '#ffb547', shooter: '#c28bff',
    homing: '#ff5d73', elite: '#52e08a', meteor: '#7b83b8'
  };

  function destroyEnemy(e, byPlayer) {
    if (e.dead) return;
    e.dead = true;
    burst(e.x, e.y, COLORS[e.type] || '#fff', 14);
    sfx.boom();
    if (e.counted) g.done++;
    if (byPlayer) {
      if (e.counted) g.kills++;
      g.combo++;
      g.score += (POINTS[e.type] || 10) * comboMult();
    } else if (e.counted) {
      g.combo = 0;
    }
  }

  function triggerNova() {
    if (g.novaCharges <= 0) return;
    g.novaCharges--;
    sfx.nova();
    flash();
    shake();
    g.enemies.forEach((e) => destroyEnemy(e, true));
    g.enemyBullets = [];
    if (g.boss) {
      g.boss.hp = Math.max(1, g.boss.hp - g.boss.maxHp * g.novaPower);
      g.boss.flash = 0.3;
      burst(g.boss.x, g.boss.y, '#ffffff', 30, 260);
    }
  }

  function hitPlayer() {
    const p = g.player;
    if (p.invuln > 0) return;

    if (g.shield > 0) {
      g.shield--;
      p.invuln = 0.8;
      burst(p.x, p.y, '#5cf2d6', 14);
      beep(500, 0.12, 'triangle', 0.05, -200);
      return;
    }
    if (g.novaCharges > 0) {
      triggerNova();
      p.invuln = 1;
      return;
    }

    g.lives--;
    g.combo = 0;
    p.invuln = 1.6;
    burst(p.x, p.y, '#ff5d73', 22, 220);
    sfx.hit();
    shake();
    flash();
    if (g.lives <= 0) endGame();
  }

  function bossDefeated() {
    const b = g.boss;
    burst(b.x, b.y, '#ff5d73', 40, 320);
    burst(b.x, b.y, '#ffb547', 30, 240);
    sfx.boom();
    shake();
    g.score += 500 * g.stage;
    g.boss = null;
    g.enemyBullets = [];
    g.enemies.forEach((e) => destroyEnemy(e, true));
    g.phase = 'clear';
    g.clearTimer = 1.5;
    showBanner('Boss kalah!');
  }

  /* ---------- Update ---------- */
  function circleHit(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const rr = a.r + b.r;
    return dx * dx + dy * dy < rr * rr;
  }

  function update(dt) {
    g.time += dt;
    const p = g.player;
    const f = g.slowTime > 0 ? 0.45 : 1;

    // Timer power-up & kekebalan
    g.tripleTime = Math.max(0, g.tripleTime - dt);
    g.slowTime = Math.max(0, g.slowTime - dt);
    p.invuln = Math.max(0, p.invuln - dt);
    p.cd -= dt;

    // Gerak pemain
    let dir = 0;
    if (keys.left || touch.left) dir -= 1;
    if (keys.right || touch.right) dir += 1;
    if (dir !== 0) {
      p.x += dir * p.speed * dt;
      g.dragX = null;
    } else if (g.dragX !== null) {
      const dx = g.dragX - p.x;
      const step = p.speed * 1.4 * dt;
      p.x += Math.abs(dx) < step ? dx : Math.sign(dx) * step;
    }
    p.x = clamp(p.x, p.r + 8, W - p.r - 8);

    // Tembak
    if ((keys.fire || touch.fire) && p.cd <= 0) playerShoot();

    // Spawn musuh
    if (g.phase === 'wave') {
      g.spawnCd -= dt;
      if (g.spawned < g.target && g.spawnCd <= 0) {
        spawnEnemy();
        g.spawnCd = Math.max(0.35, 1.25 - g.stage * 0.08);
      }
      if (g.stage >= 3) {
        g.meteorCd -= dt;
        if (g.meteorCd <= 0) {
          spawnMeteor();
          g.meteorCd = Math.max(2, rand(3, 6) - g.stage * 0.2);
        }
      }
      const liveEnemies = g.enemies.some((e) => e.type !== 'meteor' && !e.dead);
      if (g.spawned >= g.target && !liveEnemies) spawnBoss();
    }

    // Update musuh
    for (const e of g.enemies) {
      e.t += dt;
      e.y += e.vy * f * dt;
      if (e.type === 'zigzag') e.x = e.baseX + Math.sin(e.t * 3) * 55;
      if (e.type === 'meteor') {
        e.x += e.vx * f * dt;
        e.rot += dt * 1.5;
      }
      if (e.shoots) {
        e.cd -= dt * f;
        if (e.cd <= 0 && e.y > 20 && e.y < H * 0.7) {
          enemyFire(e);
          e.cd = e.rate;
        }
      }
      if (e.y > H + 40 || e.x < -60 || e.x > W + 60) {
        e.dead = true;
        if (e.counted) {
          g.done++;
          g.combo = 0;
        }
      }
    }

    // Update boss
    const b = g.boss;
    if (b) {
      b.t += dt * f;
      b.flash = Math.max(0, b.flash - dt);
      b.y = Math.min(b.y + 60 * dt, 100);
      const amp = Math.max(0, W / 2 - b.r - 10) * 0.9;
      b.x = W / 2 + Math.sin(b.t * 0.9) * amp;
      b.cd -= dt * f;
      if (b.cd <= 0 && b.y >= 90) {
        bossFire(b);
        b.cd = Math.max(0.7, 1.7 - g.stage * 0.08);
      }
      b.ringCd -= dt * f;
      if (g.stage >= 4 && b.ringCd <= 0 && b.y >= 90) {
        bossRing(b);
        b.ringCd = 4.5;
      }
    }

    // Peluru pemain
    for (const bl of g.bullets) {
      bl.x += bl.vx * dt;
      bl.y += bl.vy * dt;
      if (bl.y < -20 || bl.x < -20 || bl.x > W + 20) bl.dead = true;
    }

    // Peluru pemain vs musuh & boss
    for (const bl of g.bullets) {
      if (bl.dead) continue;
      for (const e of g.enemies) {
        if (e.dead) continue;
        if (circleHit(bl, e)) {
          bl.dead = true;
          e.hp--;
          burst(bl.x, bl.y, '#ffffff', 3, 90);
          if (e.hp <= 0) destroyEnemy(e, true);
          break;
        }
      }
      if (!bl.dead && g.boss && circleHit(bl, g.boss)) {
        bl.dead = true;
        g.boss.hp--;
        g.boss.flash = 0.08;
        g.score += 2;
        burst(bl.x, bl.y, '#ffffff', 3, 90);
        if (g.boss.hp <= 0) {
          bossDefeated();
        }
      }
    }

    // Peluru musuh
    for (const eb of g.enemyBullets) {
      eb.x += eb.vx * f * dt;
      eb.y += eb.vy * f * dt;
      if (eb.y < -30 || eb.y > H + 30 || eb.x < -30 || eb.x > W + 30) eb.dead = true;
      else if (circleHit(eb, { x: p.x, y: p.y, r: p.r * 0.7 })) {
        eb.dead = true;
        hitPlayer();
        if (state !== 'playing') return;
      }
    }

    // Musuh & boss menabrak pemain
    for (const e of g.enemies) {
      if (!e.dead && circleHit(e, { x: p.x, y: p.y, r: p.r * 0.8 })) {
        destroyEnemy(e, false);
        hitPlayer();
        if (state !== 'playing') return;
      }
    }
    if (g.boss && circleHit(g.boss, { x: p.x, y: p.y, r: p.r * 0.8 })) {
      hitPlayer();
      if (state !== 'playing') return;
    }

    // Partikel
    for (const pt of g.particles) {
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.vx *= 0.96;
      pt.vy *= 0.96;
      pt.life -= dt;
    }

    // Bersihkan objek mati
    g.bullets = g.bullets.filter((o) => !o.dead);
    g.enemyBullets = g.enemyBullets.filter((o) => !o.dead);
    g.enemies = g.enemies.filter((o) => !o.dead);
    g.particles = g.particles.filter((o) => o.life > 0);

    // Selesai stage -> Quiz Gate
    if (g.phase === 'clear') {
      g.clearTimer -= dt;
      if (g.clearTimer <= 0) openQuiz();
    }

    updateHud();
  }

  /* ---------- Gambar ---------- */
  function poly(x, y, r, n, rot = 0) {
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const a = rot + (i * Math.PI * 2) / n;
      const px = x + Math.cos(a) * r;
      const py = y + Math.sin(a) * r;
      if (i) ctx.lineTo(px, py);
      else ctx.moveTo(px, py);
    }
    ctx.closePath();
  }

  function drawStars() {
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    for (const s of stars) ctx.fillRect(s.x, s.y, s.s, s.s);
  }

  function drawPlayer() {
    const p = g.player;
    if (p.invuln > 0 && Math.floor(p.invuln * 12) % 2 === 0) return;

    // api mesin
    ctx.fillStyle = '#ffb547';
    ctx.beginPath();
    ctx.moveTo(p.x - 6, p.y + p.r * 0.7);
    ctx.lineTo(p.x + 6, p.y + p.r * 0.7);
    ctx.lineTo(p.x, p.y + p.r * 0.7 + rand(8, 16));
    ctx.closePath();
    ctx.fill();

    // badan pesawat
    ctx.fillStyle = '#5cf2d6';
    ctx.beginPath();
    ctx.moveTo(p.x, p.y - p.r);
    ctx.lineTo(p.x - p.r * 0.9, p.y + p.r * 0.8);
    ctx.lineTo(p.x, p.y + p.r * 0.4);
    ctx.lineTo(p.x + p.r * 0.9, p.y + p.r * 0.8);
    ctx.closePath();
    ctx.fill();

    // perisai
    if (g.shield > 0) {
      ctx.strokeStyle = 'rgba(92, 242, 214, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r + 9, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function drawEnemy(e) {
    ctx.fillStyle = COLORS[e.type] || '#fff';
    if (e.type === 'meteor') {
      poly(e.x, e.y, e.r, 7, e.rot);
    } else if (e.type === 'elite') {
      poly(e.x, e.y, e.r, 6, Math.PI / 6);
    } else if (e.type === 'drone') {
      poly(e.x, e.y, e.r, 4, Math.PI / 4);
    } else if (e.type === 'zigzag') {
      poly(e.x, e.y, e.r, 3, Math.PI / 2);
    } else {
      poly(e.x, e.y, e.r, 5, Math.PI / 2);
    }
    ctx.fill();

    // inti musuh
    ctx.fillStyle = 'rgba(11, 16, 48, 0.75)';
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.r * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawBoss(b) {
    ctx.fillStyle = b.flash > 0 ? '#ffffff' : '#ff5d73';
    poly(b.x, b.y, b.r, 8, Math.PI / 8);
    ctx.fill();
    ctx.fillStyle = '#7a1730';
    poly(b.x, b.y, b.r * 0.6, 8, 0);
    ctx.fill();
    ctx.fillStyle = '#ffb547';
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r * 0.22, 0, Math.PI * 2);
    ctx.fill();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    drawStars();
    if (!g || state === 'menu') return;

    // peluru pemain
    ctx.fillStyle = '#9ffcec';
    for (const bl of g.bullets) {
      ctx.save();
      ctx.translate(bl.x, bl.y);
      ctx.rotate(Math.atan2(bl.vy, bl.vx) + Math.PI / 2);
      ctx.fillRect(-2, -8, 4, 16);
      ctx.restore();
    }

    // peluru musuh
    ctx.fillStyle = '#ffb547';
    for (const eb of g.enemyBullets) {
      ctx.beginPath();
      ctx.arc(eb.x, eb.y, eb.r, 0, Math.PI * 2);
      ctx.fill();
    }

    g.enemies.forEach(drawEnemy);
    if (g.boss) drawBoss(g.boss);
    drawPlayer();

    // partikel
    for (const pt of g.particles) {
      ctx.globalAlpha = clamp(pt.life / pt.max, 0, 1);
      ctx.fillStyle = pt.color;
      ctx.fillRect(pt.x, pt.y, pt.size, pt.size);
    }
    ctx.globalAlpha = 1;
  }

  /* ---------- Loop utama ---------- */
  function frame(ts) {
    const dt = Math.min(0.033, (ts - lastTime) / 1000 || 0);
    lastTime = ts;

    if (state === 'playing' && g) {
      updateStars(dt);
      update(dt);
    } else {
      updateStars(dt);
    }
    draw();
    requestAnimationFrame(frame);
  }

  /* ---------- Quiz Gate ---------- */
  function pickQuestion() {
    const level = g.stage <= 2 ? 1 : g.stage <= 5 ? 2 : 3;
    let pool = QUESTIONS.map((q, i) => ({ q, i })).filter((o) => o.q[3] === level && !usedQuestions.has(o.i));
    if (!pool.length) pool = QUESTIONS.map((q, i) => ({ q, i })).filter((o) => !usedQuestions.has(o.i));
    if (!pool.length) {
      usedQuestions.clear();
      pool = QUESTIONS.map((q, i) => ({ q, i })).filter((o) => o.q[3] === level);
    }
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    usedQuestions.add(chosen.i);
    return chosen.q;
  }

  function openQuiz() {
    state = 'quiz';
    releaseInputs();
    el.banner.classList.add('hidden');

    const q = pickQuestion();
    const answerText = q[1][q[2]];
    const opts = shuffle(q[1]);
    quiz.q = q;
    quiz.correctIndex = opts.indexOf(answerText);
    quiz.locked = false;

    el.quizStage.textContent = String(g.stage);
    el.quizQuestion.textContent = q[0];
    el.quizFeedback.textContent = '';
    el.quizFeedback.className = 'quiz-feedback';
    el.options.forEach((btn, i) => {
      btn.textContent = opts[i];
      btn.disabled = false;
      btn.className = 'option';
    });

    showScreen('quiz');
    startQuizTimer();
  }

  function startQuizTimer() {
    clearInterval(quiz.timer);
    quiz.lastSec = QUIZ_TIME;
    el.quizTime.textContent = String(QUIZ_TIME);
    el.timerFill.style.transition = 'none';
    el.timerFill.style.width = '100%';
    el.timerFill.className = 'timer-fill';
    void el.timerFill.offsetWidth;
    el.timerFill.style.transition = '';

    quiz.endAt = performance.now() + QUIZ_TIME * 1000;
    quiz.timer = setInterval(() => {
      const remain = Math.max(0, (quiz.endAt - performance.now()) / 1000);
      const sec = Math.ceil(remain);
      if (sec !== quiz.lastSec) {
        quiz.lastSec = sec;
        el.quizTime.textContent = String(sec);
        if (sec <= 5 && sec > 0) sfx.tick();
      }
      el.timerFill.style.width = (remain / QUIZ_TIME) * 100 + '%';
      el.timerFill.className =
        'timer-fill' + (remain <= 5 ? ' danger' : remain <= 8 ? ' warning' : '');
      if (remain <= 0) answerQuiz(-1);
    }, 100);
  }

  function answerQuiz(index) {
    if (quiz.locked || state !== 'quiz') return;
    quiz.locked = true;
    clearInterval(quiz.timer);

    const remain = Math.max(0, (quiz.endAt - performance.now()) / 1000);
    const isCorrect = index === quiz.correctIndex;

    el.options.forEach((btn, i) => {
      btn.disabled = true;
      if (i === quiz.correctIndex) btn.classList.add('correct');
      else if (i === index) btn.classList.add('wrong');
    });

    if (isCorrect) {
      sfx.correct();
      el.quizFeedback.textContent = 'Benar!';
      el.quizFeedback.className = 'quiz-feedback good';
    } else {
      sfx.wrong();
      el.quizFeedback.textContent =
        index === -1 ? 'Waktu habis! Nyawa berkurang satu.' : 'Salah! Nyawa berkurang satu.';
      el.quizFeedback.className = 'quiz-feedback bad';
    }

    setTimeout(() => {
      if (state !== 'quiz') return;
      if (isCorrect) onCorrect(remain);
      else onWrong();
    }, 1400);
  }

  function onCorrect(remain) {
    g.correct++;
    g.streak++;
    g.score += 200 * g.stage + Math.round(remain) * 10;
    const upgraded = g.streak % 3 === 0;

    el.powerStreak.textContent =
      'Streak jawaban benar: ' + g.streak + (upgraded ? ' - power-up kamu di-upgrade!' : '');
    el.powerChoices.forEach((btn) => btn.classList.toggle('upgraded', upgraded));
    g.pendingUpgrade = upgraded;

    state = 'powerup';
    showScreen('powerup');
  }

  function onWrong() {
    g.streak = 0;
    g.lives--;
    if (g.lives <= 0) {
      endGame();
      return;
    }
    nextStage();
  }

  function pickPowerup(type) {
    const up = !!g.pendingUpgrade;
    sfx.pick();
    if (type === 'shield') {
      g.shield = up ? 5 : 3;
    } else if (type === 'triple') {
      g.tripleTime = up ? 15 : 10;
      g.tripleWide = up;
    } else if (type === 'nova') {
      g.novaCharges++;
      g.novaPower = up ? 0.4 : 0.2;
    } else if (type === 'slow') {
      g.slowTime = up ? 9 : 6;
    }
    if (g.lives < MAX_LIVES && g.streak > 0 && g.streak % 5 === 0) g.lives++;
    nextStage();
  }

  function nextStage() {
    g.stage++;
    g.pendingUpgrade = false;
    beginStage();
    state = 'playing';
    showScreen(null);
    setPlayingUI(true);
    updateHud();
  }

  /* ---------- Jeda & game over ---------- */
  function pauseGame() {
    if (state !== 'playing') return;
    state = 'paused';
    releaseInputs();
    showScreen('pause');
  }

  function resumeGame() {
    if (state !== 'paused') return;
    state = 'playing';
    showScreen(null);
  }

  function endGame() {
    state = 'gameover';
    releaseInputs();
    clearInterval(quiz.timer);
    setPlayingUI(false);
    el.banner.classList.add('hidden');

    const isRecord = g.score > highScore;
    if (isRecord) {
      highScore = g.score;
      saveHighScore(highScore);
    }
    el.resScore.textContent = String(g.score);
    el.resStage.textContent = String(g.stage);
    el.resCorrect.textContent = String(g.correct);
    el.resHigh.textContent = String(highScore);
    el.resNew.classList.toggle('hidden', !isRecord);
    el.menuHigh.textContent = String(highScore);
    showScreen('gameover');
  }

  /* ---------- Input ---------- */
  document.addEventListener('keydown', (e) => {
    const code = e.code;

    if (state === 'quiz') {
      const map = { Digit1: 0, Digit2: 1, Digit3: 2, Digit4: 3, Numpad1: 0, Numpad2: 1, Numpad3: 2, Numpad4: 3 };
      if (code in map) {
        e.preventDefault();
        answerQuiz(map[code]);
      }
      return;
    }

    if (code === 'KeyP' || code === 'Escape') {
      if (state === 'playing') pauseGame();
      else if (state === 'paused') resumeGame();
      return;
    }

    if (state !== 'playing') return;

    if (code === 'ArrowLeft' || code === 'KeyA') {
      keys.left = true;
      e.preventDefault();
    } else if (code === 'ArrowRight' || code === 'KeyD') {
      keys.right = true;
      e.preventDefault();
    } else if (code === 'Space') {
      keys.fire = true;
      e.preventDefault();
    } else if (code === 'KeyB' || code === 'ArrowUp') {
      triggerNova();
      e.preventDefault();
    }
  });

  document.addEventListener('keyup', (e) => {
    const code = e.code;
    if (code === 'ArrowLeft' || code === 'KeyA') keys.left = false;
    else if (code === 'ArrowRight' || code === 'KeyD') keys.right = false;
    else if (code === 'Space') keys.fire = false;
  });

  function bindHold(id, prop) {
    const btn = $(id);
    const on = (e) => {
      e.preventDefault();
      touch[prop] = true;
      if (btn.setPointerCapture && e.pointerId !== undefined) {
        try { btn.setPointerCapture(e.pointerId); } catch (err) { /* abaikan */ }
      }
    };
    const off = () => { touch[prop] = false; };
    btn.addEventListener('pointerdown', on);
    btn.addEventListener('pointerup', off);
    btn.addEventListener('pointercancel', off);
    btn.addEventListener('lostpointercapture', off);
    btn.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  bindHold('btn-left', 'left');
  bindHold('btn-right', 'right');
  bindHold('btn-fire', 'fire');

  // Geser jari di layar untuk menggerakkan pesawat
  function dragMove(e) {
    if (state !== 'playing' || !g) return;
    if (e.pointerType === 'mouse' && !(e.buttons & 1)) return;
    g.dragX = e.clientX - canvas.getBoundingClientRect().left;
  }
  canvas.addEventListener('pointerdown', dragMove);
  canvas.addEventListener('pointermove', dragMove);

  /* ---------- Tombol UI ---------- */
  $('btn-start').addEventListener('click', startGame);
  $('btn-howto').addEventListener('click', () => showScreen('howto'));
  $('btn-howto-back').addEventListener('click', () => showScreen('menu'));
  $('btn-retry').addEventListener('click', startGame);
  $('btn-menu').addEventListener('click', goMenu);
  $('btn-resume').addEventListener('click', resumeGame);
  $('btn-quit').addEventListener('click', goMenu);
  $('btn-pause').addEventListener('click', pauseGame);

  el.btnSound.addEventListener('click', () => {
    soundOn = !soundOn;
    el.btnSound.textContent = soundOn ? 'Suara: nyala' : 'Suara: mati';
    el.btnSound.setAttribute('aria-pressed', String(soundOn));
  });

  el.options.forEach((btn, i) => btn.addEventListener('click', () => answerQuiz(i)));
  el.powerChoices.forEach((btn) =>
    btn.addEventListener('click', () => {
      if (state === 'powerup') pickPowerup(btn.dataset.type);
    })
  );

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pauseGame();
  });
  window.addEventListener('blur', pauseGame);
  window.addEventListener('resize', resize);

  /* ---------- Mulai ---------- */
  resize();
  el.menuHigh.textContent = String(highScore);
  showScreen('menu');
  requestAnimationFrame(frame);
})();
