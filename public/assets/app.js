const btnArea = document.getElementById('btnArea');
const noBtn = document.getElementById('noBtn');
const yesBtn = document.getElementById('yesBtn');
const overlay = document.getElementById('overlay');
const overlayText = document.getElementById('overlayText');
const closeOverlay = document.getElementById('closeOverlay');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const state = {
  tries: 0,
  lastMove: 0,
  accepted: false,
};

const motion = {
  pos: { x: 44, y: 0 },
  target: { x: 44, y: 0 },
  bounds: { minX: 8, maxX: 200, minY: 8, maxY: 40 },
  btnW: 0,
  btnH: 0,
  areaRect: null,
  easing: 0.26,
};

function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }

function pointerOf(e){
  if(e?.touches && e.touches[0]) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  if(e?.changedTouches && e.changedTouches[0]) return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
  return { x: e?.clientX ?? innerWidth/2, y: e?.clientY ?? innerHeight/2 };
}

function measure(){
  motion.areaRect = btnArea.getBoundingClientRect();
  motion.btnW = noBtn.offsetWidth;
  motion.btnH = noBtn.offsetHeight;
  const w = motion.areaRect.width;
  const h = motion.areaRect.height;
  motion.bounds.minX = 8;
  motion.bounds.maxX = Math.max(8, w - motion.btnW - 8);
  motion.bounds.minY = 8;
  motion.bounds.maxY = Math.max(8, h - motion.btnH - 8);
}

function applyNoTransform(){
  noBtn.style.transform = `translate3d(${motion.pos.x}px, ${motion.pos.y}px, 0)`;
}

function initNoPosition(){
  measure();
  const startX = clamp(44, motion.bounds.minX, motion.bounds.maxX);
  const startY = clamp((btnArea.clientHeight/2 - motion.btnH/2), motion.bounds.minY, motion.bounds.maxY);
  motion.pos.x = startX;
  motion.pos.y = startY;
  motion.target.x = startX;
  motion.target.y = startY;
  applyNoTransform();
}

initNoPosition();
window.addEventListener('resize', initNoPosition);

(function animate(){
  if(prefersReducedMotion.matches){
    motion.pos.x = motion.target.x;
    motion.pos.y = motion.target.y;
    applyNoTransform();
    return;
  }
  const ex = (motion.target.x - motion.pos.x) * motion.easing;
  const ey = (motion.target.y - motion.pos.y) * motion.easing;
  motion.pos.x += ex;
  motion.pos.y += ey;

  if(Math.abs(motion.target.x - motion.pos.x) < 0.12) motion.pos.x = motion.target.x;
  if(Math.abs(motion.target.y - motion.pos.y) < 0.12) motion.pos.y = motion.target.y;

  applyNoTransform();
  requestAnimationFrame(animate);
})();

function growYes(){
  const scale = 1 + Math.min(1.2, state.tries * 0.12);
  yesBtn.style.transform = `scale(${scale})`;
  yesBtn.style.filter = `brightness(${1 + Math.min(0.12, state.tries*0.02)})`;
  yesBtn.style.animation = 'none';
  void yesBtn.offsetWidth;
  yesBtn.style.animation = 'pop 180ms ease-out';
}

function setNoTarget(x, y){
  motion.target.x = clamp(x, motion.bounds.minX, motion.bounds.maxX);
  motion.target.y = clamp(y, motion.bounds.minY, motion.bounds.maxY);
}

function dodgeTowardAway(pointerX, pointerY){
  measure();

  const px = pointerX - motion.areaRect.left;
  const py = pointerY - motion.areaRect.top;

  const bx = motion.pos.x + motion.btnW / 2;
  const by = motion.pos.y + motion.btnH / 2;

  let vx = bx - px;
  let vy = by - py;
  const len = Math.hypot(vx, vy) || 1;
  vx /= len;
  vy /= len;

  const push = 120 + Math.min(140, state.tries * 9);
  const rx = (Math.random()*2 - 1) * 42;
  const ry = (Math.random()*2 - 1) * 22;

  const targetX = (bx + vx * push + rx) - motion.btnW/2;
  const targetY = (by + vy * push + ry) - motion.btnH/2;

  setNoTarget(targetX, targetY);
}

function dodge(e, force=false){
  if(state.accepted) return;

  const now = performance.now();
  const minGap = force ? 0 : 35;
  if(now - state.lastMove < minGap) return;
  state.lastMove = now;

  state.tries += 1;
  const p = pointerOf(e);
  dodgeTowardAway(p.x, p.y);
  growYes();
}

function proximityHandler(clientX, clientY, e){
  if(state.accepted) return;
  measure();

  const btnCenterX = motion.areaRect.left + motion.pos.x + motion.btnW/2;
  const btnCenterY = motion.areaRect.top + motion.pos.y + motion.btnH/2;
  const dist = Math.hypot(clientX - btnCenterX, clientY - btnCenterY);

  const threshold = 95 + Math.min(150, state.tries * 13);
  if(dist < threshold) dodge(e, false);
}

btnArea.addEventListener('pointermove', (e) => proximityHandler(e.clientX, e.clientY, e));
btnArea.addEventListener('mousemove', (e) => proximityHandler(e.clientX, e.clientY, e));

btnArea.addEventListener('touchmove', (e) => {
  const t = e.touches && e.touches[0];
  if(!t) return;
  proximityHandler(t.clientX, t.clientY, e);
}, {passive:true});

noBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); dodge(e, true); });
noBtn.addEventListener('touchstart', (e) => { e.preventDefault(); e.stopPropagation(); dodge(e, true); }, {passive:false});
noBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); dodge(e, true); });

noBtn.addEventListener('pointerenter', (e) => dodge(e, true));
noBtn.addEventListener('mouseover', (e) => dodge(e, true));
noBtn.addEventListener('focus', (e) => dodge(e, true));

function accept(){
  state.accepted = true;
  yesBtn.disabled = true;
  noBtn.style.display = 'none';

  overlayText.textContent = "Ola, you’re officially my Valentine. ❤️";
  overlay.classList.add('show');
}

yesBtn.addEventListener('click', accept);
overlay.addEventListener('click', () => overlay.classList.remove('show'));
closeOverlay.addEventListener('click', (e) => {
  e.stopPropagation();
  overlay.classList.remove('show');
});
window.addEventListener('keydown', (e) => {
  if(e.key !== 'Escape') return;
  overlay.classList.remove('show');
});

const RUN_TESTS = new URLSearchParams(location.search).get('test') === '1';

(function runTests(){
  if(!RUN_TESTS) return;
  try{
    console.assert(!!btnArea, 'btnArea exists');
    console.assert(!!noBtn && !!yesBtn, 'buttons exist');

    const prev = state.tries;
    dodge({ clientX: 0, clientY: 0 }, true);
    console.assert(state.tries === prev + 1, 'tries increments after dodge');

    measure();
    console.assert(motion.bounds.maxX >= motion.bounds.minX, 'bounds X sane');
    console.assert(motion.bounds.maxY >= motion.bounds.minY, 'bounds Y sane');

    accept();
    console.assert(state.accepted === true, 'accepted true after accept');
  } catch (e){
    console.warn('Tests failed:', e);
  }
})();
