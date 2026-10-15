const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];

/* 1. Boot sequence kiểu hệ thống */
const lines = ['> khởi động hệ thống...', '> tải hồ sơ: HUỲNH THÀNH ĐẠT', '> lớp 10T2 ........ OK', '> kích hoạt giao diện ........ OK', '> chào mừng!'];
let li = 0;
(function boot() {
  $('#bootText').textContent = lines.slice(0, ++li).join('\n') + '\n█';
  if (li < lines.length) setTimeout(boot, 380);
  else setTimeout(() => $('#boot').classList.add('done'), 600);
})();

/* 2. Gõ chữ vai trò */
const roles = ['Học sinh lớp 10T2', 'Năng động & sáng tạo', 'Chăm chỉ, cầu tiến', 'Thích khám phá công nghệ'];
let r = 0, c = 0, del = false;
(function type() {
  const w = roles[r];
  $('#typed').textContent = '> ' + w.slice(0, c);
  if (!del && c === w.length) { del = true; return setTimeout(type, 1500); }
  if (del && c === 0) { del = false; r = (r + 1) % roles.length; }
  c += del ? -1 : 1;
  setTimeout(type, del ? 35 : 70);
})();

/* 3. Tiến trình cuộn + vầng sáng theo chuột */
addEventListener('scroll', () => {
  const h = document.documentElement;
  $('#progress').style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100 + '%';
}, { passive: true });
const glow = $('#glow');
addEventListener('pointermove', e => glow.style.transform = `translate(${e.clientX}px,${e.clientY}px)`);

/* 4. Hiện khi lướt tới */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  const el = e.target;
  el.classList.add('show');
  $$('.bar u', el).forEach(b => b.style.width = b.dataset.w + '%');
  [...$$('.count', el), ...(el.classList.contains('count') ? [el] : [])].forEach(countUp);
  io.unobserve(el);
}), { threshold: .2 });
$$('.reveal').forEach(el => io.observe(el));

function countUp(el) {
  if (el.dataset.done) return;
  el.dataset.done = 1;
  const to = +el.dataset.to, suf = el.dataset.suffix || '', t0 = performance.now();
  (function step(t) {
    const p = Math.min((t - t0) / 1600, 1);
    el.textContent = Math.round(to * (1 - Math.pow(1 - p, 4))) + suf;
    if (p < 1) requestAnimationFrame(step);
  })(t0);
}

/* 5. Nghiêng 3D */
[...$$('.tilt'), $('#hud')].forEach(el => {
  const k = el.id === 'hud' ? 10 : 12;
  el.addEventListener('pointermove', e => {
    if (e.pointerType === 'touch') return;
    const b = el.getBoundingClientRect();
    const x = (e.clientX - b.left) / b.width - .5, y = (e.clientY - b.top) / b.height - .5;
    el.style.transform = `perspective(800px) rotateY(${x * k}deg) rotateX(${-y * k}deg)`;
  });
  el.addEventListener('pointerleave', () => el.style.transform = '');
});

/* 6. Mạng lưới hạt công nghệ (tương tác với chuột) */
const cv = $('#net'), ctx = cv.getContext('2d');
let W, H, pts = [], mouse = { x: -999, y: -999 };
function init() {
  W = cv.width = innerWidth; H = cv.height = innerHeight;
  pts = Array.from({ length: Math.min(90, W * H / 14000 | 0) }, () => ({
    x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .5, vy: (Math.random() - .5) * .5
  }));
}
addEventListener('resize', init); init();
addEventListener('pointermove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
(function draw() {
  ctx.clearRect(0, 0, W, H);
  for (const p of pts) {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > W) p.vx *= -1;
    if (p.y < 0 || p.y > H) p.vy *= -1;
    const dm = Math.hypot(p.x - mouse.x, p.y - mouse.y);
    if (dm < 140) { p.x += (p.x - mouse.x) * .015; p.y += (p.y - mouse.y) * .015; }
    ctx.fillStyle = 'rgba(0,229,255,.8)';
    ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
  }
  for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
    const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
    if (d < 120) {
      ctx.strokeStyle = `rgba(0,229,255,${.22 * (1 - d / 120)})`;
      ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke();
    }
  }
  requestAnimationFrame(draw);
})();