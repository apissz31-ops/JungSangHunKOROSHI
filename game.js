'use strict';
const $ = s => document.querySelector(s);
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = a => a[rnd(0, a.length - 1)];
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ---------- 사운드 (WebAudio 칩튠) ---------- */
let ac = null, sndOn = true, bgmTimer = null;
function tone(f, d = 0.1, type = 'square', vol = 0.06, f2 = f, when = 0) {
  if (!ac || !sndOn) return;
  const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + when;
  o.type = type; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(Math.max(f2, 20), t + d);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(g).connect(ac.destination); o.start(t); o.stop(t + d);
}
const sfx = {
  tick: () => tone(880, 0.02, 'square', 0.015),
  ok: () => tone(660, 0.06, 'square', 0.05, 990),
  hit: () => tone(220, 0.15, 'sawtooth', 0.08, 60),
  crit: () => { tone(500, 0.08, 'square', 0.08, 1200); tone(180, 0.2, 'sawtooth', 0.09, 50, 0.06); },
  heal: () => [523, 659, 784].forEach((f, i) => tone(f, 0.12, 'triangle', 0.07, f, i * 0.09)),
  buff: () => tone(300, 0.3, 'square', 0.05, 900),
  dark: () => tone(90, 0.9, 'sawtooth', 0.1, 30),
  down: () => tone(400, 0.5, 'square', 0.06, 60),
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.2, 'square', 0.07, f, i * 0.15)),
};
const BGM = [196, 0, 233, 196, 262, 0, 233, 196, 175, 0, 208, 175, 233, 0, 208, 175];
function bgm(fast) {
  clearInterval(bgmTimer); let i = 0;
  bgmTimer = setInterval(() => {
    const f = BGM[i++ % BGM.length];
    if (f) { tone(f, 0.12, 'square', 0.022); if (i % 4 === 1) tone(f / 2, 0.2, 'triangle', 0.05); }
  }, fast ? 130 : 190);
}

/* ---------- 스프라이트 ---------- */
const INK = '#3a2a2e';
function drawChar(cv, id) {
  const c = cv.getContext('2d'); c.clearRect(0, 0, 32, 32);
  const px = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const inBody = (x, y) => ((x + .5 - 16) / 11) ** 2 + ((y + .5 - 18) / 10) ** 2 <= 1;
  const ell = (cx, cy, rx, ry, col, mask) => {
    c.fillStyle = col;
    for (let y = Math.floor(cy - ry); y <= cy + ry; y++) for (let x = Math.floor(cx - rx); x <= cx + rx; x++)
      if (((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy) / ry) ** 2 <= 1 && (!mask || mask(x, y))) c.fillRect(x, y, 1, 1);
  };
  const blob = (cx, cy, rx, ry, col) => { ell(cx, cy, rx + 1, ry + 1, INK); ell(cx, cy, rx, ry, col); };
  const body = id === 'usagi' ? '#f4de8e' : '#fffaf2';
  // 귀
  if (id === 'chiikawa') { blob(8, 8, 3, 3, body); blob(24, 8, 3, 3, body); }
  if (id === 'hachiware') for (let k = 0; k < 7; k++) {
    px(8 - (k >> 1) - 1, 2 + k, k + 3, 1, INK); px(32 - (8 - (k >> 1) - 1) - (k + 3), 2 + k, k + 3, 1, INK);
    if (k) { px(8 - (k >> 1), 2 + k, k + 1, 1, '#4f6fb5'); px(32 - (8 - (k >> 1)) - (k + 1), 2 + k, k + 1, 1, '#4f6fb5'); }
  }
  if (id === 'usagi') { blob(11, 6, 2, 6, body); blob(21, 6, 2, 6, body); ell(11, 6, 1, 4, '#f7b6c2'); ell(21, 6, 1, 4, '#f7b6c2'); }
  // 발, 팔, 몸
  blob(11, 28, 3, 2, body); blob(21, 28, 3, 2, body);
  blob(4, 21, 2, 2, body); blob(28, 21, 2, 2, body);
  blob(16, 18, 11, 10, body);
  if (id === 'hachiware') { ell(7, 11, 7, 6, '#4f6fb5', inBody); ell(25, 11, 7, 6, '#4f6fb5', inBody); }
  // 얼굴
  px(10, 16, 2, 3, '#1a1418'); px(20, 16, 2, 3, '#1a1418'); px(10, 16, 1, 1, '#fff'); px(20, 16, 1, 1, '#fff');
  ell(7.5, 21, 2, 1.2, '#f7a8b8'); ell(24.5, 21, 2, 1.2, '#f7a8b8');
  if (id === 'chiikawa') { px(9, 13, 3, 1, INK); px(20, 13, 3, 1, INK); px(15, 20, 1, 1, INK); px(16, 21, 1, 1, INK); px(14, 21, 1, 1, INK);
    px(30, 9, 1, 14, '#e86aa0'); px(28, 8, 5, 1, '#e86aa0'); px(28, 5, 1, 3, '#e86aa0'); px(31, 5, 1, 3, '#e86aa0'); px(32, 5, 0, 0, INK); }
  if (id === 'hachiware') { px(14, 20, 4, 1, INK); px(15, 21, 2, 2, '#e0607a'); }
  if (id === 'usagi') { px(9, 13, 3, 1, INK); px(20, 13, 3, 1, INK); px(14, 20, 4, 3, INK); px(15, 21, 2, 2, '#e0607a'); }
}

const BOSS_IMG = ['assets/boss/sprite_base.png', 'assets/boss/sprite_awake.png']; // Runway로 만든 픽셀 캐릭터 (기본 / 각성)
BOSS_IMG.forEach(u => { new Image().src = u; });
let bossForm = 0;
function drawBoss() { $('#boss').src = BOSS_IMG[bossForm]; }

// 캐릭터 모션: assets/chars/{id}_{idle|attack}.webp 가 있으면 사용, 없으면 직접 그린 픽셀 스프라이트
const hasPose = {};
['chiikawa', 'hachiware', 'usagi', 'momonga'].forEach(id => {   // 정지 그림 assets/chars/{id}.png 가 있으면 최우선
  const i = new Image(); i.onload = () => { hasPose[id] = true; if (party && me().id === id) setPc(); const t = document.querySelector(`#heroes [data-id=${id}]`); if (t) t.src = i.src; }; i.src = `assets/chars/${id}.png`;
});
['chiikawa', 'hachiware', 'usagi', 'momonga'].forEach(id => ['idle', 'attack'].forEach(pose => {
  const i = new Image(); i.onload = () => { hasPose[`${id}_${pose}`] = true; if (party && me().id === id) setPc(); const t = document.querySelector(`#heroes [data-id=${id}]`); if (t && pose === 'idle' && !hasPose[id]) t.src = i.src; }; i.src = `assets/chars/${id}_${pose}.webp`;
}));
// 동영상 모션: 로딩할 때 프레임을 뽑아, 테두리에서 이어진 배경색을 지우고 가운데 캐릭터만 남긴다
const CLIPS = {
  // 예: chiikawa: { src: 'assets/pokemon/파일.mp4', flip: true, crop: [0.04, 1], bg: (r, g, b) => g - r > 10 && g - b > 22 },
};
const clipFrames = {}; let pcTimer = null;
function flood(mask, w, h, seeds) {
  const out = new Uint8Array(w * h), st = seeds.slice();
  while (st.length) {
    const i = st.pop(); if (out[i] || !mask[i]) continue; out[i] = 1; const x = i % w;
    if (x > 0) st.push(i - 1); if (x < w - 1) st.push(i + 1); if (i >= w) st.push(i - w); if (i < w * (h - 1)) st.push(i + w);
  }
  return out;
}
async function loadClip(id, cfg) {
  const v = document.createElement('video'); v.muted = true; v.playsInline = true; v.preload = 'auto'; v.src = cfg.src;
  await new Promise((r, j) => { v.onloadeddata = r; v.onerror = j; });
  const [c0, c1] = cfg.crop || [0, 1], sw = v.videoWidth * (c1 - c0), h = 200, w = Math.round(sw * h / v.videoHeight), n = 10, raw = [], frames = [];
  let x0 = w, y0 = h, x1 = 0, y1 = 0;
  const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d', { willReadFrequently: true });
  for (let k = 0; k < n; k++) {
    v.currentTime = (k + 0.5) / n * v.duration; await new Promise(r => { v.onseeked = r; });
    x.setTransform(cfg.flip ? -1 : 1, 0, 0, 1, cfg.flip ? w : 0, 0); x.drawImage(v, v.videoWidth * c0, 0, sw, v.videoHeight, 0, 0, w, h); x.setTransform(1, 0, 0, 1, 0, 0);
    const d = x.getImageData(0, 0, w, h), a = d.data, m = new Uint8Array(w * h), seeds = [];
    for (let i = 0; i < w * h; i++) m[i] = cfg.bg(a[i * 4], a[i * 4 + 1], a[i * 4 + 2]) ? 1 : 0;
    for (let i = 0; i < w; i++) seeds.push(i, w * (h - 1) + i); for (let j = 0; j < h; j++) seeds.push(j * w, j * w + w - 1);
    const bg = flood(m, w, h, seeds), body = flood(bg.map(q => 1 - q), w, h, [Math.round(h * 0.5) * w + Math.round(w * 0.5)]);
    for (let i = 0; i < w * h; i++) {
      if (!body[i]) { a[i * 4 + 3] = 0; continue; }
      const px = i % w, py = (i - px) / w; if (px < x0) x0 = px; if (px > x1) x1 = px; if (py < y0) y0 = py; if (py > y1) y1 = py;
    }
    raw.push(d);
  }
  const o = document.createElement('canvas'); o.width = x1 - x0 + 1; o.height = y1 - y0 + 1; const ox = o.getContext('2d');
  for (const d of raw) { x.putImageData(d, 0, 0); ox.clearRect(0, 0, o.width, o.height); ox.drawImage(c, -x0, -y0); frames.push(o.toDataURL()); }
  clipFrames[id] = frames; if (party && me().id === id) setPc();
}
Object.entries(CLIPS).forEach(([id, cfg]) => loadClip(id, cfg).catch(() => {}));

const drawn = {};
function setPc(pose = 'idle') {
  const id = me().id, el = $('#pc'); clearInterval(pcTimer);
  if (clipFrames[id]) {
    const f = clipFrames[id]; let i = 0; el.style.imageRendering = 'pixelated'; el.src = f[0];
    pcTimer = setInterval(() => { el.src = f[++i % f.length]; }, pose === 'attack' ? 45 : 100); return;
  }
  if (hasPose[id]) { el.style.imageRendering = 'pixelated'; el.src = `assets/chars/${id}.png`; return; }
  const key = hasPose[`${id}_${pose}`] ? `${id}_${pose}` : hasPose[`${id}_idle`] ? `${id}_idle` : null;
  if (key) { el.style.imageRendering = 'pixelated'; el.src = `assets/chars/${key}.webp`; return; }
  if (!drawn[id]) { const c = document.createElement('canvas'); c.width = c.height = 32; drawChar(c, id); drawn[id] = c.toDataURL(); }
  el.style.imageRendering = 'pixelated'; el.src = drawn[id];
}

/* ---------- 데이터 ---------- */
const CHARS = [
  { id: 'chiikawa', name: '치이카와', max: 160, moves: [
    { n: '토벌 막대기', d: '위력 26', pow: 26 },
    { n: '울면서 돌진', d: '위력 38 · 반동 8', pow: 38, recoil: 8, cry: '와, 와아아아…!' },
    { n: '응원', d: 'HP 45 회복 · 다음 공격 1.5배', heal: 45, boost: true, cry: '후, 훗…!' } ] },
  { id: 'hachiware', name: '하치와레', max: 140, moves: [
    { n: '사스마타 찌르기', d: '위력 28', pow: 28 },
    { n: '어떻게든 되겠지', d: '위력 10~60 랜덤', pow: [10, 60], cry: '어떻게든 되겠지!' },
    { n: '기타 연주', d: '3턴간 보스 공격 -30%', weak: 3, cry: '♪ 혼자서도~ 잘 살 수 있어~' } ] },
  { id: 'usagi', name: '우사기', max: 130, moves: [
    { n: '우라!', d: '위력 32 · 급소 잘 남', pow: 32, crit: 0.3, cry: '우라!!' },
    { n: '야하! 연타', d: '위력 12 × 2~4회', pow: 12, multi: [2, 4], cry: '야하! 야하!' },
    { n: '푸루루루', d: '3턴간 보스가 받는 피해 +40%', vuln: 3, cry: '푸루루루루루!' } ] },
  // 모몽가: 정상훈이 극도로 싫어해서 등장하자마자 흑염룡에게 당한다. 대신 정상훈이 3턴 동안 빌빌거린다 = 주는 대미지 절반, 받는 대미지 1.5배 (희생 카드)
  { id: 'momonga', name: '모몽가', max: 100, hated: true, moves: [{ n: '귀여운 척', d: '위력 20', pow: 20, cry: '나를 봐!' }] },
];
const Q = {
  nonsense: [
    '그 말 하려고 지금까지 기다린거야..?', '아 형 진짜 자꾸 이러면 나 너무 힘들어', '구자 ㅋㅋ 구자동차 ㅋㅋ 구자알생긴척 ㅋㅋ', '언제부터????',
    '구자친구는 원래 이름이 구자친구인데 마침 구자민을 만나서 운좋게 구자친구가 됐네', '바로말하면 적군이 알아들을 수 있어서 일부로 못알아듣게 말하는거야',
    '구자친구는 거꾸로 해도 구자친구', '엄마~준식이한테 엄마가 준식이한테 준비한 식사 해줘',
    '당신 여자친구는 사실 요원이야 당신은 세상을 바꿀 사람이라 그걸 못하게 막으려고 온거야', '카리나는 내 와이프임', '자꾸하염없이눈물이나~',
    '동북아로 삼행시 해보겠습니다 동북아~북딱북딱~아 기분좋다~', '나를 왜 상훈상이라고 하는거야 그럼 너는 미카미야', '공포갈증황혼절망',
  ],
  charge: ['크큭… 오른팔에 봉인된 흑염룡이… 날뛰고 있어…!', '큭… 진정해라, 나의 오른팔이여…!'],
  fire: ['깨어나라, 흑염룡이여!!', '더는… 억누를 수 없다…!!'],
  shake: ['어이, 악수나 한번 하자고~', '반갑다 친구야! 악수!'],
};

/* ---------- 상태 ---------- */
let party, boss, cur, turn, menuState = null, advance = null, over = false, attacked = false;
let hardMode = false;
function reset() {
  party = CHARS.map(c => ({ ...c, hp: c.max, conf: 0, bleed: 0, boost: false }));
  const hp = hardMode ? 800 : 650;
  boss = { hp, max: hp, atkUp: 0, weak: 0, vuln: 0, stun: 0, charge: false, phase: 1, cm: 190 };
  cur = 0; turn = 1; over = false; bossForm = 0;
  $('#stage').className = ''; $('#boss').className = ''; $('#aura').className = ''; drawBoss(); setPc(); render();
}
const me = () => party[cur];
const alive = () => party.filter(p => p.hp > 0);

function render() {
  const p = me(), col = r => r > .5 ? '#39c06b' : r > .2 ? '#e8b930' : '#e5484d';
  $('#hpB').style.width = boss.hp / boss.max * 100 + '%'; $('#hpB').style.background = col(boss.hp / boss.max);
  $('#hpP').style.width = p.hp / p.max * 100 + '%'; $('#hpP').style.background = col(p.hp / p.max);
  $('#nmP').textContent = p.name; $('#numP').textContent = `${p.hp} / ${p.max}`;
  $('#ptP').textContent = party.map(x => x.hp > 0 ? '●' : '○').join('');
  $('#cm').textContent = `(${boss.cm}cm)`;
  $('#turn').textContent = turn + '턴';
  const b = [];
  if (hardMode) b.push('<b class="bad">하드</b>');
  if (boss.phase === 2) b.push('<b class="bad">광폭화</b>'); if (boss.phase === 3) b.push('<b class="bad">각성</b>');
  if (boss.atkUp) b.push(`<b class="bad">공격↑${boss.atkUp}</b>`); if (boss.charge) b.push('<b class="bad">흑염룡 준비</b>');
  if (boss.weak) b.push(`<b class="good">공격↓${boss.weak}</b>`); if (boss.vuln) b.push(`<b class="good">빈틈${boss.vuln}</b>`);
  if (boss.stun) b.push(`<b class="good">빌빌${boss.stun}</b>`);
  $('#bdB').innerHTML = b.join('');
  $('#bdP').innerHTML = (p.conf ? '<b class="bad">혼란</b>' : '') + (p.bleed ? '<b class="bad">출혈</b>' : '') + (p.boost ? '<b class="good">응원</b>' : '');
  $('#boss').style.transform = `scale(${Math.min(1.4, 1 + (boss.cm - 190) * 0.02)})`;
}

/* ---------- 연출 ---------- */
function fx(el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); setTimeout(() => el.classList.remove(cls), 600); }
function flash(red) { const f = $('#flash'); f.className = red ? 'red' : ''; void f.offsetWidth; f.classList.add('on'); }
function floatNum(text, onBoss, color = '#fff') {
  const d = document.createElement('div'); d.className = 'dmg'; d.textContent = text; d.style.color = color;
  d.style.left = (onBoss ? 62 + rnd(0, 14) : 16 + rnd(0, 12)) + '%'; d.style.top = (onBoss ? 22 + rnd(0, 10) : 52 + rnd(0, 8)) + '%';
  $('#stage').appendChild(d); setTimeout(() => d.remove(), 1000);
}
async function say(text) {
  const t = $('#txt'); $('#more').style.visibility = 'hidden'; t.textContent = '';
  let skip = false; advance = () => { skip = true; };
  for (let i = 0; i < text.length && !skip; i++) { t.textContent += text[i]; if (i % 2 === 0) sfx.tick(); await sleep(22); }
  t.textContent = text; $('#more').style.visibility = 'visible';
  await new Promise(r => { const id = setTimeout(done, 1500); function done() { clearTimeout(id); advance = null; r(); } advance = done; });
  $('#more').style.visibility = 'hidden';
}

/* ---------- 메뉴 ---------- */
function menu(q, opts, back) {
  return new Promise(res => {
    $('#q').textContent = q; const m = $('#menu'); m.innerHTML = '';
    const btns = [], done = v => { menuState = null; m.innerHTML = ''; $('#q').textContent = ''; sfx.ok(); res(v); };
    opts.forEach((o, i) => {
      const b = document.createElement('button'); b.innerHTML = `${o.n}${o.d ? `<small>${o.d}</small>` : ''}`;
      b.disabled = !!o.off; b.onclick = () => done(i); b.onmouseenter = () => sel(i); m.appendChild(b); btns.push(b);
    });
    if (back) { const b = document.createElement('button'); b.className = 'back'; b.textContent = '◀ 돌아가기 (X)'; b.onclick = () => done(-1); m.appendChild(b); }
    let s = Math.max(0, opts.findIndex(o => !o.off));
    function sel(i) { if (btns[i].disabled) return; s = i; btns.forEach((b, j) => b.classList.toggle('sel', j === s)); }
    sel(s);
    menuState = { move(dx, dy) { let n = s + dx + dy * 2; if (n >= 0 && n < btns.length && !btns[n].disabled) { sel(n); sfx.tick(); } },
      ok() { done(s); }, back() { if (back) done(-1); } };
  });
}
addEventListener('keydown', e => {
  const k = e.key.toLowerCase(); if (!$('#title').hidden || !$('#result').hidden) { if (k === 'z' || k === 'enter') ($('#title').hidden ? $('#btnRetry') : $('#btnStart')).click(); return; }
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
  if (menuState) {
    if (k === 'arrowleft') menuState.move(-1, 0); else if (k === 'arrowright') menuState.move(1, 0);
    else if (k === 'arrowup') menuState.move(0, -1); else if (k === 'arrowdown') menuState.move(0, 1);
    else if (k === 'z' || k === 'enter' || k === ' ') menuState.ok(); else if (k === 'x' || k === 'escape') menuState.back();
  } else if ((k === 'z' || k === 'enter' || k === ' ') && advance) advance();
});
$('#msg').onclick = $('#stage').onclick = () => advance && advance();

/* ---------- 전투 ---------- */
async function hitBoss(base, critRate = 0.1) {
  const p = me(), crit = Math.random() < critRate;
  let d = base * (p.boost ? 1.5 : 1) * (boss.vuln ? 1.4 : 1) * (boss.stun ? 1.5 : 1) * (crit ? 1.5 : 1) * (0.9 + Math.random() * 0.2);
  d = Math.max(1, Math.round(d)); boss.hp = Math.max(0, boss.hp - d);
  setPc('attack'); fx($('#pc'), 'lunge'); await sleep(120); fx($('#boss'), 'blink'); fx($('#stage'), 'shake'); crit ? sfx.crit() : sfx.hit();
  floatNum('-' + d, true, crit ? '#ffd23f' : '#fff'); render(); await sleep(450); setPc();
  if (crit) await say('급소에 맞았다!');
}
async function hitMe(base, label) {
  const p = me(), mult = (boss.atkUp ? 1.5 : 1) * (boss.weak ? 0.7 : 1) * [1, 1, 1.15, 1.3][boss.phase] * (hardMode ? 1.3 : 1) * (boss.stun ? 0.5 : 1);
  const d = Math.max(1, Math.round(base * mult * (0.9 + Math.random() * 0.2))); p.hp = Math.max(0, p.hp - d);
  fx($('#boss'), 'blunge'); await sleep(120); fx($('#pc'), 'blink'); fx($('#stage'), 'shake'); sfx.hit();
  floatNum('-' + d, false, '#ff8a8a'); render(); await sleep(450);
  if (label) await say(label);
}
async function playerMove(mv) {
  const p = me();
  if (p.conf && Math.random() < 0.33) {
    await say(`${p.name}는(은) 개소리에 넋이 나갔다!`); p.hp = Math.max(0, p.hp - 10); fx($('#pc'), 'blink'); sfx.hit(); floatNum('-10', false, '#ff8a8a'); render();
    await say('영문도 모른 채 자신을 때렸다!'); return;
  }
  await say(`${p.name}의 ${mv.n}!${mv.cry ? `\n「${mv.cry}」` : ''}`);
  if (mv.pow) {
    attacked = true;
    const n = mv.multi ? rnd(...mv.multi) : 1;
    for (let i = 0; i < n && boss.hp > 0; i++) await hitBoss(Array.isArray(mv.pow) ? rnd(...mv.pow) : mv.pow, mv.crit);
    if (mv.multi) await say(`${n}번 맞았다!`);
    p.boost = false;
    if (mv.recoil && boss.hp > 0) { p.hp = Math.max(1, p.hp - mv.recoil); render(); await say(`${p.name}는(은) 반동으로 넘어졌다!`); }
  }
  if (mv.heal) { p.hp = Math.min(p.max, p.hp + mv.heal); p.boost = true; sfx.heal(); floatNum('+' + mv.heal, false, '#8dffb0'); render(); await say(`${p.name}는(은) 기운을 냈다! 다음 공격이 강해진다!`); }
  if (mv.weak) { boss.weak = mv.weak; sfx.buff(); render(); await say('정상훈은 노래에 기가 죽었다! 공격이 떨어졌다!'); }
  if (mv.vuln) { boss.vuln = mv.vuln; sfx.buff(); render(); await say('정상훈은 정신이 사나워졌다! 빈틈이 생겼다!'); }
  render();
}
async function checkPhase() {
  const r = boss.hp / boss.max;
  if (boss.phase === 1 && r <= 0.5 && boss.hp > 0) {
    boss.phase = 2; $('#stage').classList.add('rage'); flash(true); sfx.down(); bgm(true); render();
    await say('정상훈 「슬슬 진심으로 가볼까.」'); await say('정상훈이 광폭화했다! 공격이 강해졌다!');
  }
  if (boss.phase === 2 && r <= 0.25 && boss.hp > 0) {
    boss.phase = 3; $('#stage').classList.add('awake'); $('#aura').classList.add('on'); sfx.dark(); await sleep(700);
    bossForm = 1; drawBoss(); if (hardMode) { $('#boss').classList.add('crimson'); $('#stage').classList.add('blood'); }
    flash(hardMode); fx($('#stage'), 'shake'); $('#aura').classList.remove('on'); render();
    await say('정상훈 「으아아아아아아아악!!!!」'); await say(hardMode ? '정상훈의 몸이 시뻘겋게 달아올랐다…! 정상훈이 각성했다!!' : '머리가 덮수룩해졌다…! 정상훈이 각성했다!!');
  }
}
async function bossTurn() {
  if (boss.stun) await say(pick(['정상훈은 숨을 헐떡이며 빌빌거리고 있다…', '정상훈 「허억… 허억… 모몽가…」', '정상훈의 다리가 후들거린다…']));
  await bossAct();
  if (boss.stun) { boss.stun--; render(); if (!boss.stun) await say('정상훈이 기운을 되찾았다!'); }
}
async function bossAct() {
  const p = me();
  if (boss.charge) {
    boss.charge = false; $('#aura').classList.add('on'); sfx.dark(); await say(`정상훈 「${pick(Q.fire)}」`);
    flash(); await hitMe(40, '흑염룡이 덮쳤다!'); $('#aura').classList.remove('on'); return;
  }
  const pool = ['nonsense', 'nonsense', 'nonsense', 'shake', 'shake', 'shake', 'dragon', 'dragon'];
  if (!boss.atkUp) pool.push('grow', 'grow');
  const a = pick(pool);
  if (a === 'nonsense') {
    await say('정상훈의 개소리하기!'); await say(`정상훈 「${pick(Q.nonsense)}」`); await hitMe(14);
    if (me().hp > 0) { me().conf = 2; render(); await say(`${p.name}는(은) 혼란에 빠졌다!`); }
  } else if (a === 'shake') {
    await say('정상훈의 빌딩만악수!'); await say(`정상훈 「${pick(Q.shake)}」`); 
    if (!attacked) { await say(`${p.name}는(은) 손을 내밀지 않았다!`); await say('정상훈의 손이 허공을 갈랐다… 빌딩만악수는 실패했다!'); return; }
    flash(true); await hitMe(16, '…는 훼이크였다! 손목을 베였다!');
    if (me().hp > 0) { me().bleed = 3; render(); await say(`${p.name}는(은) 피를 흘리고 있다!`); }
  } else if (a === 'dragon') {
    boss.charge = true; $('#aura').classList.add('on'); sfx.dark(); render();
    await say('정상훈의 흑염룡 꺼내기!'); await say(`정상훈 「${pick(Q.charge)}」`); $('#aura').classList.remove('on');
    await say('불길한 기운이 모이고 있다… 다음 턴에 온다!');
  } else {
    const n = rnd(2, 4); boss.atkUp = n + 1; boss.cm += n; sfx.buff(); render();
    await say('정상훈의 키크기!'); await say(`정상훈 「방금 ${n}cm 컸다.」`); await say(`정상훈의 공격이 ${n}턴 동안 올랐다! (현재 ${boss.cm}cm)`);
  }
}
async function endTurn() {
  const p = me();
  if (p.hp > 0 && p.bleed) { p.bleed--; p.hp = Math.max(0, p.hp - 5); fx($('#pc'), 'blink'); floatNum('-5', false, '#ff8a8a'); render(); await say(`${p.name}는(은) 출혈로 대미지를 입었다!`); }
  if (p.conf) p.conf--;
  for (const k of ['atkUp', 'weak', 'vuln']) if (boss[k]) boss[k]--;
  turn++; render();
}
async function swapTo(i, forced) {
  if (!forced) await say(`${me().name}, 돌아와!`);
  cur = i; setPc(); render(); sfx.ok(); await say(`가랏, ${me().name}!`);
  if (me().hated) await momongaRage();
}
async function momongaRage() {
  const p = me();
  await say('정상훈 「……모몽가?」');
  flash(true); fx($('#stage'), 'shake'); sfx.crit(); fx($('#boss'), 'blunge');
  await say('정상훈은 모몽가를 보자마자 격노했다!!'); await say('정상훈 「흑염룡!!! 저것부터 치워!!!」');
  $('#aura').classList.add('on'); sfx.dark();
  const d = document.createElement('img'); d.src = BOSS_IMG[1]; d.id = 'dragon'; $('#stage').appendChild(d); await sleep(850);   // 흑염룡이 보스 쪽에서 모몽가에게 날아든다
  d.remove(); flash(); fx($('#stage'), 'shake'); fx($('#pc'), 'blink'); sfx.hit(); floatNum('-999', false, '#c77dff');
  p.hp = 0; render(); $('#aura').classList.remove('on');
  await say('흑염룡이 모몽가를 덮쳤다!');
  boss.stun = 3; render();
  await say('정상훈은 너무 격노한 나머지 기운이 빠졌다!'); await say('3턴 동안 정상훈의 공격과 방어가 크게 떨어진다!');
}
async function chooseSwap(forced) {
  const i = await menu(forced ? '누구를 내보낼까?' : '누구와 교체할까?', party.map((p, j) => ({ n: p.name, d: p.hated ? `HP ${p.hp}/${p.max} · 정상훈이 싫어함` : `HP ${p.hp}/${p.max}`, off: p.hp <= 0 || j === cur })), !forced);
  return i;
}
async function enterHard(mid) {   // mid: 일반 모드 전투 도중에 도발해서 넘어온 경우
  await say('나 「아일릿 그거 완전 뉴진스 짭 아님?」'); await say('정상훈 「…………뭐?」');
  if (mid) { hardMode = true; boss.max += 150; boss.hp += 150; }
  if (boss.phase < 2) boss.phase = 2;
  boss.cm += 20;
  bossForm = 1; drawBoss(); $('#stage').classList.add('rage');
  if (boss.phase === 3) { $('#boss').classList.add('crimson'); $('#stage').classList.add('blood'); }
  flash(true); fx($('#stage'), 'shake'); sfx.down(); bgm(true); render();
  await say('정상훈 「방금 뭐라고 했냐.」'); await say(`정상훈의 키가 단숨에 20cm 컸다! (현재 ${boss.cm}cm)`); await say('정상훈이 즉시 광폭화했다! 하드모드 돌입!!');
}
async function battle() {
  reset(); bgm(false);
  await say('앗! 야생의 정상훈이 나타났다!'); await say(`가랏, ${me().name}!`);
  if (hardMode) await enterHard(false);
  while (!over) {
    // 플레이어 턴
    let acted = false;
    while (!acted) {
      attacked = false;
      const c = await menu(`${me().name}는(은) 무엇을 할까?`, [{ n: '싸운다' }, { n: '교체', off: alive().length < 2 }, { n: '도망친다' }, { n: '도발한다', d: '하드모드 돌입', off: hardMode }]);
      if (c === 0) { const m = await menu('어떤 기술을 쓸까?', me().moves, true); if (m >= 0) { await playerMove(me().moves[m]); acted = true; } }
      else if (c === 1) { const i = await chooseSwap(false); if (i >= 0) { await swapTo(i); acted = true; } }
      else if (c === 3) await enterHard(true);
      else await say('정상훈에게서는 도망칠 수 없다!');
    }
    if (boss.hp <= 0) return finish(true);
    await checkPhase();
    if (me().hp > 0) await bossTurn();
    await endTurn();
    while (me().hp <= 0) {
      sfx.down(); await say(`${me().name}는(은) 쓰러졌다!`);
      if (!alive().length) return finish(false);
      await swapTo(await chooseSwap(true), true);
    }
  }
}
let record = '';
async function finish(win) {
  over = true; clearInterval(bgmTimer);
  if (win) { fx($('#boss'), 'blink'); sfx.win(); await say('정상훈은 쓰러졌다!'); await say('정상훈 「…오늘은 컨디션이 안 좋았어.」'); }
  else await say('토벌대는 눈앞이 캄캄해졌다…');
  const left = alive().length;
  $('#resT').textContent = (hardMode ? '[하드] ' : '') + (win ? '토벌 성공!' : '토벌 실패…');
  $('#resS').textContent = win ? `${turn}턴 만에 정상훈을 때려잡았다 · 생존 ${left}/${party.length} · 정상훈 최종 키 ${boss.cm}cm` : `정상훈의 남은 HP ${boss.hp}/${boss.max} · ${turn}턴 버팀`;
  record = `[정상훈 레이드] ${$('#resT').textContent} ${$('#resS').textContent}`;
  $('#result').hidden = false;
}

/* ---------- 시작 ---------- */
CHARS.forEach(c => {
  const cv = document.createElement('canvas'); cv.width = cv.height = 32; drawChar(cv, c.id);
  const im = new Image(); im.dataset.id = c.id; im.src = hasPose[c.id] ? `assets/chars/${c.id}.png` : cv.toDataURL(); $('#heroes').appendChild(im);
});
reset();
function start(hard) { if (typeof hard === 'boolean') hardMode = hard; if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)(); $('#title').hidden = true; $('#result').hidden = true; battle(); }
$('#btnStart').onclick = () => start(false); $('#btnHard').onclick = () => start(true); $('#btnRetry').onclick = () => start();
$('#btnTitle').onclick = () => { $('#result').hidden = true; $('#title').hidden = false; };
$('#btnCopy').onclick = () => navigator.clipboard.writeText(record).then(() => { $('#btnCopy').textContent = '복사됨!'; setTimeout(() => $('#btnCopy').textContent = '기록 복사', 1200); });
$('#btnSnd').onclick = e => { e.stopPropagation(); sndOn = !sndOn; $('#btnSnd').textContent = sndOn ? '♪ 켜짐' : '♪ 꺼짐'; };
