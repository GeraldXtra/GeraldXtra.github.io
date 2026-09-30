import { useEffect, useRef } from "react";
import { clamp, debounce, fineMQ, offMQ, onMQ, reduceMQ, reduced } from "../utils/motion";
import { moonInfo, seasonNow } from "../utils/time";

/* The map: real Lagos roads from OpenStreetMap, the city lighting up on load,
   a torch that follows the mouse, place names, and traffic on the main roads. */
function createMap(els, DATA) {
  var root = document.documentElement;
  var mapEl = els.map;
  var roadsCv = els.roads;
  var glowCv = els.glow;
  var trafficCv = els.traffic;
  var portraitEl = document.querySelector(".portrait");
  var labelsEl = els.labels;
  var heroEl = document.getElementById("top");
  var heroMain = document.querySelector(".hero__main");
  var legendEl = document.querySelector(".legend");
  if (!DATA || !mapEl || !roadsCv || !trafficCv) return null;
  var MOON = moonInfo(new Date()), SEASON = seasonNow();
  var rctx = roadsCv.getContext("2d");
  var pulseCv = document.createElement("canvas"), pctx = pulseCv.getContext("2d");
  var tctx = trafficCv.getContext("2d");
  var gctx = glowCv ? glowCv.getContext("2d") : null;
  if (!rctx || !tctx) return null;

  function reader(b64) {
    var bin = atob(b64), n = bin.length, bytes = new Uint8Array(n), pos = 0;
    for (var i = 0; i < n; i++) bytes[i] = bin.charCodeAt(i);
    return {
      next: function () { var r = 0, s = 0, b; do { b = bytes[pos++]; r |= (b & 127) << s; s += 7; } while (b & 128); return r; },
      more: function () { return pos < n; }
    };
  }
  function unzz(v) { return (v >>> 1) ^ -(v & 1); }
  function bbox(p) {
    var a = Infinity, b = Infinity, c = -Infinity, d = -Infinity;
    for (var i = 0; i < p.length; i += 2) {
      var x = p[i], y = p[i + 1];
      if (x < a) a = x; if (x > c) c = x; if (y < b) b = y; if (y > d) d = y;
    }
    return [a, b, c, d];
  }

  /* Decode. Main roads are stored in 5 m units, small streets in 10 m units. */
  var MAJ = [], MIN = [], MINB = [];
  (function () {
    var rd = reader(DATA.major), x = 0, y = 0;
    while (rd.more()) {
      var cls = rd.next(), n = rd.next(), p = new Float32Array(n * 2);
      for (var i = 0; i < n; i++) { x += unzz(rd.next()); y += unzz(rd.next()); p[2 * i] = x; p[2 * i + 1] = y; }
      var cum = new Float32Array(n);
      for (var j = 1; j < n; j++) cum[j] = cum[j - 1] + Math.hypot(p[2 * j] - p[2 * j - 2], p[2 * j + 1] - p[2 * j - 1]);
      MAJ.push({ c: cls, p: p, cum: cum, len: cum[n - 1], b: bbox(p) });
    }
    rd = reader(DATA.minor); x = 0; y = 0;
    while (rd.more()) {
      var m = rd.next(), q = new Float32Array(m * 2);
      for (var k = 0; k < m; k++) { x += unzz(rd.next()); y += unzz(rd.next()); q[2 * k] = x * 2; q[2 * k + 1] = y * 2; }
      MIN.push(q);
      MINB.push(bbox(q));
    }
  })();
  /* Water outlines, sparkle points on open water, and ferry routes between real jetties. */
  var WATER = [], GLINTS = null, ROUTES = [];
  if (DATA.water) {
    var rw = reader(DATA.water), rings = rw.next(), wx = 0, wy = 0;
    for (var q = 0; q < rings; q++) {
      var wn = rw.next(), ring = new Float32Array(wn * 2);
      for (var wi = 0; wi < wn; wi++) { wx += unzz(rw.next()); wy += unzz(rw.next()); ring[2 * wi] = wx * 2; ring[2 * wi + 1] = wy * 2; }
      WATER.push(ring);
    }
  }
  if (DATA.glints) {
    var rg = reader(DATA.glints), gx = 0, gy = 0, gl = [];
    while (rg.more()) { gx += unzz(rg.next()); gy += unzz(rg.next()); gl.push(gx * 2, gy * 2); }
    GLINTS = new Float32Array(gl);
  }
  if (DATA.ferries) {
    var rf = reader(DATA.ferries), nf = rf.next();
    for (var fi = 0; fi < nf; fi++) {
      var fm = rf.next(), fx = 0, fy = 0, fp = new Float32Array(fm * 2);
      for (var fj = 0; fj < fm; fj++) { fx += unzz(rf.next()); fy += unzz(rf.next()); fp[2 * fj] = fx * 2; fp[2 * fj + 1] = fy * 2; }
      var fc = new Float32Array(fm);
      for (var fk = 1; fk < fm; fk++) fc[fk] = fc[fk - 1] + Math.hypot(fp[2 * fk] - fp[2 * fk - 2], fp[2 * fk + 1] - fp[2 * fk - 1]);
      ROUTES.push({ p: fp, cum: fc, len: fc[fm - 1] });
    }
  }

  /* Lamps along the real bridges, and the real rail lines, two of them with trains. */
  var LAMPS = [], RAILS = [];
  if (DATA.lamps) {
    var rl = reader(DATA.lamps), ng = rl.next();
    for (var li = 0; li < ng; li++) {
      var ln = rl.next(), lx = 0, ly = 0, ld = 0, arr = new Float32Array(ln * 3);
      for (var lj = 0; lj < ln; lj++) {
        var nx = lx + unzz(rl.next()), ny = ly + unzz(rl.next());
        if (lj) ld += Math.hypot(nx - lx, ny - ly);
        lx = nx; ly = ny;
        arr[3 * lj] = lx; arr[3 * lj + 1] = ly; arr[3 * lj + 2] = ld;
      }
      LAMPS.push(arr);
    }
  }
  /* Real driving routes between Lagos places, worked out along the main road network. */
  var NAV = [];
  if (DATA.routes) {
    var rnav = reader(DATA.routes), nn = rnav.next();
    for (var ni = 0; ni < nn; ni++) {
      var km = rnav.next() / 10, nm = rnav.next(), nx0 = 0, ny0 = 0, np = new Float32Array(nm * 2);
      for (var nj = 0; nj < nm; nj++) { nx0 += unzz(rnav.next()); ny0 += unzz(rnav.next()); np[2 * nj] = nx0; np[2 * nj + 1] = ny0; }
      var nc = new Float32Array(nm);
      for (var nk = 1; nk < nm; nk++) nc[nk] = nc[nk - 1] + Math.hypot(np[2 * nk] - np[2 * nk - 2], np[2 * nk + 1] - np[2 * nk - 1]);
      var nms = (DATA.routeNames && DATA.routeNames[ni]) || ["", ""];
      NAV.push({ p: np, cum: nc, len: nc[nm - 1], km: km, from: nms[0], to: nms[1] });
    }
  }
  /* Tall buildings and radio masts (for aviation lights), and the Atlantic coastline (for the surf). */
  var TALL = [], COAST = null;
  if (DATA.beacons) {
    var rb = reader(DATA.beacons), bx0 = 0, by0 = 0;
    while (rb.more()) { bx0 += unzz(rb.next()); by0 += unzz(rb.next()); TALL.push(bx0, by0, rb.next()); }
  }
  if (DATA.coast) {
    var rcst = reader(DATA.coast), cn = rcst.next(), cxs = 0, cys = 0, cp = new Float32Array(cn * 2), cnrm = new Float32Array(cn * 2);
    for (var ci = 0; ci < cn; ci++) { cxs += unzz(rcst.next()); cys += unzz(rcst.next()); cp[2 * ci] = cxs; cp[2 * ci + 1] = cys; }
    for (var cj = 0; cj < cn; cj++) {
      var a0 = Math.max(0, cj - 1), a1 = Math.min(cn - 1, cj + 1), ddx = cp[2 * a1] - cp[2 * a0], ddy = cp[2 * a1 + 1] - cp[2 * a0 + 1], dl = Math.hypot(ddx, ddy) || 1;
      cnrm[2 * cj] = -ddy / dl; cnrm[2 * cj + 1] = ddx / dl;
    }
    COAST = { p: cp, n: cnrm, b: bbox(cp) };
  }
  if (DATA.rails) {
    var rr = reader(DATA.rails), nrl = rr.next();
    for (var ri = 0; ri < nrl; ri++) {
      var flag = rr.next(), rn = rr.next(), rx = 0, ry = 0, rp = new Float32Array(rn * 2);
      for (var rj = 0; rj < rn; rj++) { rx += unzz(rr.next()); ry += unzz(rr.next()); rp[2 * rj] = rx; rp[2 * rj + 1] = ry; }
      var rc = new Float32Array(rn);
      for (var rk = 1; rk < rn; rk++) rc[rk] = rc[rk - 1] + Math.hypot(rp[2 * rk] - rp[2 * rk - 2], rp[2 * rk + 1] - rp[2 * rk - 1]);
      RAILS.push({ p: rp, cum: rc, len: rc[rn - 1], train: flag === 1 });
    }
  }

  var MAJ_MID = MAJ.filter(function (r) { return r.c >= 3; });
  var MAJ_MAIN = MAJ.filter(function (r) { return r.c === 1 || r.c === 2; });
  var MAJ_TOP = MAJ.filter(function (r) { return r.c === 0; });

  /* Road ends, so cars can turn onto connected roads. */
  var ends = new Map();
  function key(x, y) { return x * 100000 + y; }
  MAJ.forEach(function (r, i) {
    var p = r.p, n = p.length / 2;
    var k0 = key(p[0], p[1]), k1 = key(p[2 * n - 2], p[2 * n - 1]);
    if (!ends.has(k0)) ends.set(k0, []);
    if (!ends.has(k1)) ends.set(k1, []);
    ends.get(k0).push({ i: i, s: true });
    ends.get(k1).push({ i: i, s: false });
  });

  /* Same projection the data was built with. */
  var KX = Math.cos(6.53 * Math.PI / 180) * 111320 / 5, KY = 111320 / 5;
  function mapX(lon) { return (lon - 3.24) * KX; }
  function mapY(lat) { return (6.67 - lat) * KY; }

  /* Classes: 0 motorway and trunk, 1 primary, 2 slip roads, 3 secondary, 4 tertiary */
  var SPEED = [210, 150, 105, 120, 95];
  var WEIGHT = [6, 3.4, 1, 2, 1];

  var W = DATA.W, H = DATA.H;
  var vw = 0, vh = 0, s = 1, ox = 0, oy = 0, dprR = 1, dprT = 1;
  var styles = {};
  var cars = [], spawnList = [], spawnCum = [], spawnTotal = 0;
  var running = false, last = 0, acc = 0, dim = 0, checkT = 0, lowPower = false, perfN = 0, perfT = 0;
  var raf = 0, introRaf = 0, disposed = false;
  var tmp = [0, 0];
  var torchAllowed = !!gctx && fineMQ.matches && !reduced();

  function readStyles() {
    var cs = getComputedStyle(root);
    function v(n) { return cs.getPropertyValue(n).trim(); }
    styles.minor = v("--map-minor"); styles.mid = v("--map-mid"); styles.major = v("--map-major"); styles.top = v("--map-top");
    styles.gMinor = v("--glow-minor"); styles.gMajor = v("--glow-major");
    styles.a = v("--car-a") || "255 243 223"; styles.b = v("--car-b") || "255 77 61"; styles.c = v("--car-c") || "247 182 62";
    styles.ferry = v("--ferry") || "150 222 232"; styles.glint = v("--glint") || "255 243 223";
    styles.waterFill = v("--water-fill"); styles.waterEdge = v("--water-edge");
    styles.pulseMinor = v("--pulse-minor"); styles.pulseMajor = v("--pulse-major");
    styles.lighter = v("--car-blend") === "lighter";
    styles.glow = v("--car-glow") === "1";
    styles.veilMax = parseFloat(v("--veil-max")) || 0.85;
    styles.cased = v("--map-style") === "light";
    styles.midCase = v("--map-mid-case"); styles.majorCase = v("--map-major-case"); styles.topCase = v("--map-top-case"); styles.rail = v("--rail");
    styles.keke = v("--keke") || "182 214 92";
    styles.wind = SEASON === "harmattan" ? (v("--dust") || "214 168 104") : (v("--wind") || "236 230 219");
    styles.windA = parseFloat(v("--wind-alpha")) || 0.09;
    styles.cloud = v("--cloud") || "9 12 15"; styles.cloudA = parseFloat(v("--cloud-alpha")) || 0.4;
    styles.flash = v("--flash") || "220 230 255"; styles.dust = v("--dust") || "214 168 104";
    styles.bird = v("--bird") || "236 230 219"; styles.birdA = parseFloat(v("--bird-alpha")) || 0.7;
    styles.navCase = v("--nav-case") || "rgba(12,15,18,.85)"; styles.navFlow = v("--nav-flow") || "rgba(255,255,255,.9)";
    styles.mist = v("--mist") || "200 214 226"; styles.mistA = parseFloat(v("--mist-alpha")) || 0.16;
    styles.tagBg = v("--tag-bg") || "rgba(15,19,22,.86)"; styles.tagEdge = v("--tag-edge") || "rgba(236,230,219,.28)"; styles.tagInk = v("--tag-ink") || "#ECE6DB";
  }

  function layout() {
    vw = window.innerWidth; vh = window.innerHeight;
    var narrow = vw < 720;
    /* Framed on central Lagos: the mainland, Third Mainland Bridge, the islands and Lekki. */
    s = Math.max(vw / W, vh / H) * (narrow ? 1.9 : 1.6);
    var fx = 3700, fy = narrow ? 4600 : 4300, ax = narrow ? 0.5 : 0.62, ay = narrow ? 0.42 : 0.5;
    ox = clamp(vw * ax - fx * s, vw - W * s, 0);
    oy = clamp(vh * ay - fy * s, vh - H * s, 0);
    var dpr = window.devicePixelRatio || 1;
    dprR = Math.min(dpr, 2); dprT = Math.min(dpr, 1.5);
    roadsCv.width = Math.round(vw * dprR); roadsCv.height = Math.round(vh * dprR);
    trafficCv.width = Math.round(vw * dprT); trafficCv.height = Math.round(vh * dprT);
    pulseCv.width = reduced() ? 1 : Math.round(vw * dprT); pulseCv.height = reduced() ? 1 : Math.round(vh * dprT);
    if (gctx) {
      glowCv.width = 1;
      glowCv.height = 1;
    }
  }

  function inView(b, m) {
    return b[2] * s + ox >= -m && b[0] * s + ox <= vw + m && b[3] * s + oy >= -m && b[1] * s + oy <= vh + m;
  }
  function strokeLines(ctx, list, boxes, color, width) {
    ctx.beginPath();
    for (var i = 0; i < list.length; i++) {
      if (!inView(boxes ? boxes[i] : list[i].b, 4)) continue;
      var p = boxes ? list[i] : list[i].p;
      ctx.moveTo(p[0] * s + ox, p[1] * s + oy);
      for (var j = 2; j < p.length; j += 2) ctx.lineTo(p[j] * s + ox, p[j + 1] * s + oy);
    }
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke();
  }
  function drawWater(ctx) {
    if (!WATER.length) return;
    ctx.beginPath();
    for (var i = 0; i < WATER.length; i++) {
      var r = WATER[i];
      ctx.moveTo(r[0] * s + ox, r[1] * s + oy);
      for (var j = 2; j < r.length; j += 2) ctx.lineTo(r[j] * s + ox, r[j + 1] * s + oy);
      ctx.closePath();
    }
    ctx.fillStyle = styles.waterFill; ctx.fill("evenodd");
    ctx.strokeStyle = styles.waterEdge; ctx.lineWidth = 0.8; ctx.stroke();
  }
  function drawRails(ctx, color) {
    if (!RAILS.length) return;
    ctx.beginPath();
    RAILS.forEach(function (r) {
      var p = r.p;
      ctx.moveTo(p[0] * s + ox, p[1] * s + oy);
      for (var j = 2; j < p.length; j += 2) ctx.lineTo(p[j] * s + ox, p[j + 1] * s + oy);
    });
    ctx.save();
    ctx.strokeStyle = color; ctx.lineCap = "butt";
    ctx.lineWidth = 0.9; ctx.stroke();
    ctx.setLineDash([1.2, 5]); ctx.lineWidth = 3.4; ctx.stroke();
    ctx.restore();
  }
  function drawSet(ctx, colors, withWater, dpr) {
    ctx.setTransform(dpr || dprR, 0, 0, dpr || dprR, 0, 0);
    ctx.clearRect(0, 0, vw, vh);
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    if (withWater) drawWater(ctx);
    if (withWater) drawBloom(ctx);
    if (withWater && styles.cased) {
      strokeLines(ctx, MIN, MINB, styles.minor, 0.8);
      drawRails(ctx, styles.rail);
      strokeLines(ctx, MAJ_MID, null, styles.midCase, 2.5);
      strokeLines(ctx, MAJ_MAIN, null, styles.majorCase, 3.4);
      strokeLines(ctx, MAJ_TOP, null, styles.topCase, 4.4);
      strokeLines(ctx, MAJ_MID, null, styles.mid, 1.3);
      strokeLines(ctx, MAJ_MAIN, null, styles.major, 2);
      strokeLines(ctx, MAJ_TOP, null, styles.top, 2.8);
      return;
    }
    strokeLines(ctx, MIN, MINB, colors[0], 0.6);
    strokeLines(ctx, MAJ_MID, null, colors[1], 0.85);
    strokeLines(ctx, MAJ_MAIN, null, colors[2], 1.1);
    strokeLines(ctx, MAJ_TOP, null, colors[3], 1.6);
    if (withWater) drawRails(ctx, colors[1]);
  }
  function drawBloom(bctx) {
    if (!styles.glow) return;
    /* A soft glow built from wide, faint strokes, so no blur filter or blend mode is needed. */
    bctx.lineCap = "round"; bctx.lineJoin = "round";
    [[9, 0.05], [5.5, 0.09], [3, 0.16]].forEach(function (pass) {
      strokeLines(bctx, MAJ_MID, null, "rgba(255,200,150," + (pass[1] * 0.45).toFixed(3) + ")", pass[0] * 0.6);
      strokeLines(bctx, MAJ_MAIN, null, "rgba(255,170,110," + (pass[1] * 0.8).toFixed(3) + ")", pass[0] * 0.8);
      strokeLines(bctx, MAJ_TOP, null, "rgba(255,110,76," + pass[1].toFixed(3) + ")", pass[0]);
    });
  }
  function drawRoads() {
    drawSet(rctx, [styles.minor, styles.mid, styles.major, styles.top], true);

    if (!reduced()) drawSet(pctx, [styles.pulseMinor, styles.pulseMajor, styles.pulseMajor, styles.pulseMajor], false, dprT);
  }

  /* Place names, positioned from real coordinates. Hidden where they would sit under the hero text. */
  var LABELS = [
    { t: "Lagos Lagoon", lon: 3.462, lat: 6.515, k: "water" },
    { t: "Third Mainland Bridge", lon: 3.4025, lat: 6.5212, k: "road", r: -97, dx: 19 },
    { t: "Yaba", lon: 3.378, lat: 6.512 },
    { t: "Lagos Island", lon: 3.388, lat: 6.453 },
    { t: "Ikoyi", lon: 3.437, lat: 6.452 },
    { t: "Victoria Island", lon: 3.418, lat: 6.428 },
    { t: "Lekki", lon: 3.478, lat: 6.444 },
    { t: "Apapa", lon: 3.36, lat: 6.445 }
  ];
  var labelEls = labelsEl ? LABELS.map(function (L, i) {
    var el = document.createElement("span");
    el.className = "mlabel" + (L.k ? " mlabel--" + L.k : "");
    el.textContent = L.t;
    el.style.setProperty("--i", String(i));
    labelsEl.appendChild(el);
    return el;
  }) : [];
  var avoidRects = [];
  function blocked(x, y) {
    var sy = window.scrollY || 0;
    for (var i = 0; i < avoidRects.length; i++) {
      var a = avoidRects[i];
      if (x > a.l && x < a.r && y + sy > a.t && y + sy < a.b) return true;
    }
    return false;
  }
  function placeLabels() {
    var sy = window.scrollY || window.pageYOffset || 0, avoid = [];
    avoidRects = avoid;
    [heroMain, legendEl, portraitEl].forEach(function (el) {
      if (!el) return;
      var r = el.getBoundingClientRect();
      avoid.push({ l: r.left - 18, t: r.top + sy - 18, r: r.right + 18, b: r.bottom + sy + 18 });
    });
    if (!labelEls.length) return;
    LABELS.forEach(function (L, i) {
      var el = labelEls[i], x = mapX(L.lon) * s + ox + (L.dx || 0), y = mapY(L.lat) * s + oy;
      el.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px) translate(-50%,-50%)" + (L.r ? " rotate(" + L.r + "deg)" : "");
      var w = el.offsetWidth, h = el.offsetHeight;
      var hw = L.r ? h / 2 + 4 : w / 2, hh = L.r ? w / 2 : h / 2;
      var box = { l: x - hw, r: x + hw, t: y - hh, b: y + hh };
      var hide = box.l < 8 || box.r > vw - 8 || box.t < 92 || box.b > vh - 8;
      for (var j = 0; j < avoid.length && !hide; j++) {
        var a = avoid[j];
        if (box.l < a.r && box.r > a.l && box.t < a.b && box.b > a.t) hide = true;
      }
      el.classList.toggle("is-hidden", hide);
    });
  }

  function buildSpawn() {
    spawnList = []; spawnCum = []; spawnTotal = 0;
    for (var i = 0; i < MAJ.length; i++) {
      var r = MAJ[i];
      if (r.len <= 0 || !inView(r.b, 40)) continue;
      spawnTotal += WEIGHT[r.c] * r.len;
      spawnList.push(i); spawnCum.push(spawnTotal);
    }
  }
  function pickRoad() {
    var t = Math.random() * spawnTotal, lo = 0, hi = spawnCum.length - 1;
    while (lo < hi) { var mid = (lo + hi) >> 1; if (spawnCum[mid] < t) lo = mid + 1; else hi = mid; }
    return spawnList[lo];
  }
  function speedFor(c) { return SPEED[c] * (0.8 + Math.random() * 0.4); }
  function segAt(r, d) {
    var c = r.cum, lo = 0, hi = c.length - 2;
    while (lo < hi) { var mid = (lo + hi + 1) >> 1; if (c[mid] <= d) lo = mid; else hi = mid - 1; }
    return lo;
  }
  function seek(r, d, k) {
    var c = r.cum, lastSeg = c.length - 2;
    if (k > lastSeg) k = lastSeg; if (k < 0) k = 0;
    while (k < lastSeg && c[k + 1] <= d) k++;
    while (k > 0 && c[k] > d) k--;
    return k;
  }
  function spawn(car) {
    if (!spawnList.length) return car;
    var i = pickRoad(), r = MAJ[i];
    car.i = i; car.d = Math.random() * r.len; car.dir = Math.random() < 0.5 ? 1 : -1;
    var pick = Math.random();
    car.k = segAt(r, car.d); car.col = pick < 0.6 ? 0 : pick < 0.86 ? 1 : 2; car.out = 0;
    car.v = speedFor(r.c) * (car.col === 2 ? 0.85 : 1);
    return car;
  }
  function choose(opts, cls) {
    var total = 0, w = [];
    for (var j = 0; j < opts.length; j++) {
      var dc = Math.abs(MAJ[opts[j].i].c - cls);
      var wt = dc === 0 ? 3 : dc === 1 ? 2 : 1;
      w.push(wt); total += wt;
    }
    var t = Math.random() * total;
    for (var q = 0; q < opts.length; q++) { t -= w[q]; if (t <= 0) return opts[q]; }
    return opts[opts.length - 1];
  }
  function advance(car, dt) {
    var r = MAJ[car.i];
    car.d += car.dir * car.v * dt;
    var guard = 0;
    while ((car.d > r.len || car.d < 0) && guard++ < 4) {
      var atEnd = car.d > r.len, over = atEnd ? car.d - r.len : -car.d;
      var p = r.p, n = p.length / 2;
      var list = ends.get(atEnd ? key(p[2 * n - 2], p[2 * n - 1]) : key(p[0], p[1])) || [];
      var opts = [];
      for (var j = 0; j < list.length; j++) if (list[j].i !== car.i) opts.push(list[j]);
      if (!opts.length) { spawn(car); return; }
      var pick = choose(opts, r.c);
      r = MAJ[pick.i]; car.i = pick.i;
      if (pick.s) { car.dir = 1; car.d = Math.min(over, r.len); car.k = 0; }
      else { car.dir = -1; car.d = Math.max(r.len - over, 0); car.k = r.cum.length - 2; }
      car.v += (speedFor(r.c) - car.v) * 0.5;
    }
    car.k = seek(r, car.d, car.k);
  }
  function posAt(r, k, d) {
    var p = r.p, c = r.cum, seg = c[k + 1] - c[k], t = seg > 0 ? (d - c[k]) / seg : 0;
    tmp[0] = p[2 * k] + (p[2 * k + 2] - p[2 * k]) * t;
    tmp[1] = p[2 * k + 1] + (p[2 * k + 3] - p[2 * k + 1]) * t;
  }
  /* Adds the streak behind a car to the path and returns its head position on screen. */
  function streak(car, L, path) {
    var r = MAJ[car.i], p = r.p, c = r.cum, k = car.k, d = car.d, kk;
    posAt(r, k, d);
    var hx = tmp[0] * s + ox, hy = tmp[1] * s + oy;
    path.moveTo(hx, hy);
    if (car.dir > 0) {
      var target = Math.max(0, d - L);
      kk = k;
      while (kk > 0 && c[kk] > target) { path.lineTo(p[2 * kk] * s + ox, p[2 * kk + 1] * s + oy); kk--; }
      posAt(r, kk, target);
    } else {
      var target2 = Math.min(r.len, d + L), lastV = c.length - 1;
      kk = k + 1;
      while (kk < lastV && c[kk] < target2) { path.lineTo(p[2 * kk] * s + ox, p[2 * kk + 1] * s + oy); kk++; }
      posAt(r, Math.min(kk - 1, c.length - 2), target2);
    }
    path.lineTo(tmp[0] * s + ox, tmp[1] * s + oy);
    return [hx, hy];
  }

  var clock = 0;
  function rgba(rgb, a) { return "rgb(" + rgb + " / " + a.toFixed(3) + ")"; }
  function dot(x, y, r, color) { tctx.beginPath(); tctx.arc(x, y, r, 0, 6.2832); tctx.fillStyle = color; tctx.fill(); }

  /* Light catching the water: short sparkles that come and go on the lagoon and the sea. */
  var glints = [];
  function buildGlints() {
    glints = [];
    if (!GLINTS) return;
    var cand = [];
    for (var i = 0; i < GLINTS.length; i += 2) {
      var x = GLINTS[i] * s + ox, y = GLINTS[i + 1] * s + oy;
      if (x > -4 && x < vw + 4 && y > -4 && y < vh + 4) cand.push(i);
    }
    for (var k = cand.length - 1; k > 0; k--) { var j = Math.floor(Math.random() * (k + 1)), t = cand[k]; cand[k] = cand[j]; cand[j] = t; }
    glintVis = cand.slice();
    var mx1 = 0, my1 = 0;
    cand.forEach(function (i) { mx1 += GLINTS[i] * s + ox; my1 += GLINTS[i + 1] * s + oy; });
    if (cand.length) { mx1 /= cand.length; my1 /= cand.length; }
    var ca = Math.cos(-0.62), sa = Math.sin(-0.62), moonOn = styles.glow ? MOON.illum : 0;
    function band(i) { var dx = GLINTS[i] * s + ox - mx1, dy = GLINTS[i + 1] * s + oy - my1, d = -dx * sa + dy * ca; return Math.exp(-(d * d) / (2 * 42 * 42)) * moonOn; }
    var inBand = cand.filter(function (i) { return band(i) > 0.35; }).slice(0, Math.round(90 * moonOn));
    cand = inBand.concat(cand.filter(function (i) { return inBand.indexOf(i) < 0; }));
    cand.length = Math.min(cand.length, Math.round(clamp(vw * vh / 5000, 40, 260)) + inBand.length);
    glints = cand.map(function (i) { var m = band(i); return { i: i, m: m, ph: Math.random() * 6.2832, sp: 0.5 + Math.random() * 1.3 + m * 2.2, w: 1.6 + Math.random() * 2.2 + m * 1.6 }; });
  }
  function drawGlints() {
    if (!glints.length) return;
    var buckets = [new Path2D(), new Path2D(), new Path2D()];
    for (var g = 0; g < glints.length; g++) {
      var G = glints[g], v = Math.sin(clock * G.sp + G.ph) + G.m * 0.45;
      if (v < 0.4) continue;
      var x = GLINTS[G.i] * s + ox, y = GLINTS[G.i + 1] * s + oy;
      buckets[v > 0.9 ? 2 : v > 0.7 ? 1 : 0].rect(x - G.w / 2, y - 0.45, G.w, 0.9);
    }
    var alpha = [0.14, 0.3, 0.55];
    for (var b = 0; b < 3; b++) { tctx.fillStyle = rgba(styles.glint, alpha[b]); tctx.fill(buckets[b]); }
  }

  /* Ferries crossing the lagoon on real routes, each leaving a soft wake. */
  var glintVis = [];
  var ferries = [], fpos = [0, 0];
  var FERRY_NAMES = [["Ikorodu", "Falomo"], ["Ebute Ero", "Ikorodu"], ["Osborne", "Badore"], ["CMS", "Tarkwa Bay"]];
  function buildFerries() {
    ferries = [];
    ROUTES.forEach(function (r, i) {
      var n = i === 0 ? 2 : 1;
      for (var k = 0; k < n; k++) ferries.push({ r: r, d: Math.random() * r.len, dir: Math.random() < 0.5 ? 1 : -1, v: 34 + Math.random() * 14, wait: 0, wake: 1 });
    });
  }
  function routeAt(r, d) {
    var c = r.cum, lo = 0, hi = c.length - 2;
    while (lo < hi) { var mid = (lo + hi + 1) >> 1; if (c[mid] <= d) lo = mid; else hi = mid - 1; }
    var seg = c[lo + 1] - c[lo], t = seg > 0 ? (d - c[lo]) / seg : 0, p = r.p;
    fpos[0] = (p[2 * lo] + (p[2 * lo + 2] - p[2 * lo]) * t) * s + ox;
    fpos[1] = (p[2 * lo + 1] + (p[2 * lo + 3] - p[2 * lo + 1]) * t) * s + oy;
  }
  function drawFerries(dt) {
    for (var i = 0; i < ferries.length; i++) {
      var f = ferries[i];
      if (dt > 0) {
        if (f.wait > 0) { f.wait -= dt; f.wake = Math.max(0, f.wake - dt / 1.2); }
        else {
          f.d += f.dir * f.v * dt; f.wake = Math.min(1, f.wake + dt / 2);
          if (f.d >= f.r.len) { f.d = f.r.len; f.dir = -1; f.wait = 2.5 + Math.random() * 3; }
          else if (f.d <= 0) { f.d = 0; f.dir = 1; f.wait = 2.5 + Math.random() * 3; }
        }
      }
      routeAt(f.r, f.d);
      var hx = fpos[0], hy = fpos[1];
      if (hx < -120 || hx > vw + 120 || hy < -120 || hy > vh + 120) continue;
      var wl = 300 * f.wake;
      if (wl > 4) {
        var wake = new Path2D(), near = new Path2D();
        wake.moveTo(hx, hy); near.moveTo(hx, hy);
        for (var k = 1; k <= 12; k++) {
          routeAt(f.r, clamp(f.d - f.dir * wl * k / 12, 0, f.r.len));
          wake.lineTo(fpos[0], fpos[1]);
          if (k <= 5) near.lineTo(fpos[0], fpos[1]);
        }
        tctx.lineWidth = 3.4; tctx.strokeStyle = rgba(styles.ferry, 0.09); tctx.stroke(wake);
        tctx.lineWidth = 1.4; tctx.strokeStyle = rgba(styles.ferry, 0.3); tctx.stroke(near);
        /* the V of the wake opening out behind the boat */
        routeAt(f.r, clamp(f.d - f.dir * 40, 0, f.r.len));
        var bx = hx - fpos[0], by = hy - fpos[1], bl = Math.hypot(bx, by);
        if (bl > 0.5) {
          bx /= bl; by /= bl;
          var arm = 30 * f.wake, ca = Math.cos(0.32), sa = Math.sin(0.32), vee = new Path2D();
          vee.moveTo(hx - (bx * ca - by * sa) * arm, hy - (bx * sa + by * ca) * arm); vee.lineTo(hx, hy);
          vee.lineTo(hx - (bx * ca + by * sa) * arm, hy - (-bx * sa + by * ca) * arm);
          tctx.lineWidth = 1; tctx.strokeStyle = rgba(styles.ferry, 0.2); tctx.stroke(vee);
        }
      }
      if (styles.glow) dot(hx, hy, 5.5, rgba(styles.ferry, 0.16));
      dot(hx, hy, 1.9, rgba(styles.ferry, 0.95));
      var fr = FERRY_NAMES[ROUTES.indexOf(f.r)];
      if (fr && f.wait <= 0) tagAt("ferry" + i, hx, hy, "Ferry to " + (f.dir > 0 ? fr[1] : fr[0]));
    }
  }

  /* A marker on the coordinates in the legend, sending out slow rings. */
  function drawBeacon() {
    var x = mapX(3.3792) * s + ox, y = mapY(6.5244) * s + oy;
    if (x < -60 || x > vw + 60 || y < -60 || y > vh + 60) return;
    tctx.lineWidth = 1.2;
    for (var k = 0; k < 2; k++) {
      var p = (clock / 3.2 + k * 0.5) % 1;
      tctx.beginPath(); tctx.arc(x, y, 5 + p * 46, 0, 6.2832);
      tctx.strokeStyle = rgba(styles.b, 0.5 * (1 - p) * (1 - p)); tctx.stroke();
    }
    tctx.beginPath(); tctx.arc(x, y, 7.5, 0, 6.2832); tctx.lineWidth = 1; tctx.strokeStyle = rgba(styles.b, 0.55); tctx.stroke();
    dot(x, y, 3.2, rgba(styles.b, 0.95));
  }

  /* Now and then a plane comes in over the city towards the airport in Ikeja, strobes flashing. */
  var PLANE_FROM = [3.56, 6.36], PLANE_TO = [3.3212, 6.5774];
  var plane = { t: -5, dur: 48, off: 0 };
  function drawPlane(dt) {
    if (dt > 0) {
      plane.t += dt;
      if (plane.t > plane.dur) { plane.t = -(10 + Math.random() * 14); plane.off = (Math.random() - 0.5) * 900; }
    }
    if (plane.t < 0) return;
    var ax = mapX(PLANE_FROM[0]), ay = mapY(PLANE_FROM[1]), bx = mapX(PLANE_TO[0]), by = mapY(PLANE_TO[1]);
    var dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
    var p = plane.t / plane.dur, o = plane.off * (1 - p);
    var x = (ax + dx * p - uy * o) * s + ox, y = (ay + dy * p + ux * o) * s + oy;
    if (x < -80 || x > vw + 80 || y < -80 || y > vh + 80) return;
    var trail = new Path2D();
    trail.moveTo(x, y); trail.lineTo(x - ux * 90, y - uy * 90);
    tctx.lineWidth = 1; tctx.strokeStyle = rgba(styles.a, 0.1); tctx.stroke(trail);
    var lx = uy, ly = -ux;
    dot(x + lx * 4.5 - ux * 2, y + ly * 4.5 - uy * 2, 1, rgba(styles.b, 0.9));
    dot(x - lx * 4.5 - ux * 2, y - ly * 4.5 - uy * 2, 1, "rgb(74 222 128 / 0.9)");
    if (clock % 1.2 < 0.45) dot(x - ux * 3, y - uy * 3, 1.3, rgba(styles.b, 0.95));
    if (styles.glow) dot(x, y, 7, rgba(styles.a, 0.16));
    dot(x, y, 1.8, rgba(styles.a, 0.95));
    tagAt("plane", x, y, "Landing at LOS, Ikeja");
    var ph = clock % 1.6;
    if (ph < 0.06 || (ph > 0.2 && ph < 0.26)) {
      if (styles.glow) dot(x, y, 11, rgba(styles.a, 0.28));
      dot(x, y, 2.4, rgba(styles.a, 1));
    }
  }

  function shuffle(a) { for (var k = a.length - 1; k > 0; k--) { var j = Math.floor(Math.random() * (k + 1)), t = a[k]; a[k] = a[j]; a[j] = t; } return a; }
  function onScreen(x, y, m) { return x > -m && x < vw + m && y > -m && y < vh + m; }

  /* Every nine seconds a wave of light runs out through the streets from the marker. */
  var PULSE_EVERY = 9, PULSE_LEN = 5.4;
  function pulseRing(x, y, r1, r0, a) {
    if (a <= 0.01 || r1 <= 0) return;
    tctx.save();
    tctx.beginPath();
    tctx.arc(x, y, r1, 0, 6.2832);
    if (r0 > 0) tctx.arc(x, y, r0, 6.2832, 0, true);
    tctx.clip();
    tctx.globalAlpha = a;
    tctx.drawImage(pulseCv, 0, 0, vw, vh);
    tctx.restore();
  }
  var userPulses = [], ambientT = 3;
  function pulseAt(px, py, small) {
    if (reduced() || pulseCv.width < 2) return;
    userPulses.push({ x: px, y: py, t: 0, small: !!small });
    if (userPulses.length > 4) userPulses.shift();
  }
  function drawUserPulses(dt) {
    for (var u = userPulses.length - 1; u >= 0; u--) {
      var P = userPulses[u];
      P.t += dt;
      var dur = P.small ? 2.2 : 2.8;
      if (P.t > dur) { userPulses.splice(u, 1); continue; }
      var pp = P.t / dur, ee = 1 - Math.pow(1 - pp, 1.8), RR = 6 + ee * (P.small ? 240 : 560), bb = 50 + 80 * pp, ff = Math.pow(1 - pp, 1.2) * (P.small ? 0.75 : 1);
      pulseRing(P.x, P.y, RR, RR - bb, 0.55 * ff);
      pulseRing(P.x, P.y, RR, RR - bb * 0.3, ff);
      if (P.small) continue;
      /* rings spreading from the spot, like a stone dropped in water, so a click on the lagoon shows too */
      var rip = Math.max(0, 1 - P.t / 1.9);
      tctx.lineWidth = 1.2;
      for (var k = 0; k < 3; k++) {
        var rk = P.t * 85 - k * 16;
        if (rk <= 0) continue;
        tctx.beginPath(); tctx.arc(P.x, P.y, rk, 0, 6.2832);
        tctx.strokeStyle = rgba(styles.b, 0.55 * rip * (1 - k * 0.25)); tctx.stroke();
      }
      if (P.t < 1.2) dot(P.x, P.y, 2.4, rgba(styles.b, 1 - P.t / 1.2));
    }
  }
  function drawPulse(dt) {
    if (reduced() || pulseCv.width < 2) return;
    drawUserPulses(dt);
    ambientT += dt;
    if (ambientT > 6.5) {
      ambientT = 0;
      for (var tries = 0; tries < 10 && spawnList.length; tries++) {
        var rd = MAJ[spawnList[Math.floor(Math.random() * spawnList.length)]], vi = Math.floor(Math.random() * rd.p.length / 2);
        var ax = rd.p[2 * vi] * s + ox, ay = rd.p[2 * vi + 1] * s + oy;
        if (onScreen(ax, ay, -40) && !blocked(ax, ay)) { pulseAt(ax, ay, true); break; }
      }
    }
    var t = clock % PULSE_EVERY;
    if (t > PULSE_LEN) return;
    var x = mapX(3.3792) * s + ox, y = mapY(6.5244) * s + oy;
    var maxR = Math.hypot(Math.max(x, vw - x), Math.max(y, vh - y));
    var p = t / PULSE_LEN, e = 1 - Math.pow(1 - p, 1.8), R = 8 + e * maxR, band = 70 + 110 * p, fade = Math.pow(1 - p, 1.2);
    if (!lowPower) pulseRing(x, y, R, R - band, 0.5 * fade);
    pulseRing(x, y, R, R - band * 0.3, fade);
  }

  /* Street lamps along the bridges, with pulses of light running along them. */
  function drawLamps() {
    if (!LAMPS.length) return;
    var dim = new Path2D(), mid = new Path2D(), hot = new Path2D(), halo = new Path2D();
    for (var g = 0; g < LAMPS.length; g++) {
      var arr = LAMPS[g];
      for (var j = 0; j < arr.length; j += 3) {
        var x = arr[j] * s + ox, y = arr[j + 1] * s + oy;
        if (!onScreen(x, y, 6)) continue;
        var w = Math.sin(arr[j + 2] * 0.0065 - clock * 2.4), v = w > 0 ? Math.pow(w, 9) : 0;
        if (v > 0.45) { hot.moveTo(x + 1.7, y); hot.arc(x, y, 1.7, 0, 6.2832); halo.moveTo(x + 6, y); halo.arc(x, y, 6, 0, 6.2832); }
        else if (v > 0.1) { mid.moveTo(x + 1.3, y); mid.arc(x, y, 1.3, 0, 6.2832); }
        else { dim.moveTo(x + 0.95, y); dim.arc(x, y, 0.95, 0, 6.2832); }
      }
    }
    if (styles.glow) { tctx.fillStyle = rgba(styles.c, 0.16); tctx.fill(halo); }
    tctx.fillStyle = rgba(styles.c, 0.42); tctx.fill(dim);
    tctx.fillStyle = rgba(styles.c, 0.7); tctx.fill(mid);
    tctx.fillStyle = rgba(styles.c, 1); tctx.fill(hot);
  }

  /* Canoe lanterns drifting on the lagoon, most of them near Makoko. */
  var lanterns = [];
  function buildLanterns() {
    lanterns = [];
    if (!GLINTS) return;
    var mx0 = mapX(3.395), my0 = mapY(6.497), near = [], far = [];
    for (var i = 0; i < GLINTS.length; i += 2) {
      if (!onScreen(GLINTS[i] * s + ox, GLINTS[i + 1] * s + oy, 10)) continue;
      (Math.hypot(GLINTS[i] - mx0, GLINTS[i + 1] - my0) < 330 ? near : far).push(i);
    }
    shuffle(near).slice(0, 12).concat(shuffle(far).slice(0, 7)).forEach(function (i) {
      lanterns.push({ i: i, a: Math.random() * 6.2832, b: Math.random() * 6.2832, sp: 0.12 + Math.random() * 0.2 });
    });
  }
  function drawLanterns() {
    for (var k = 0; k < lanterns.length; k++) {
      var L = lanterns[k];
      var gx = GLINTS[L.i] + Math.sin(clock * L.sp + L.a) * 6, gy = GLINTS[L.i + 1] + Math.cos(clock * L.sp * 0.8 + L.b) * 5;
      var x = gx * s + ox, y = gy * s + oy;
      var f = 0.62 + 0.38 * Math.sin(clock * 5.1 + L.a) * Math.sin(clock * 2.3 + L.b);
      if (styles.glow) dot(x, y, 4.6, rgba(styles.c, 0.14 * f));
      dot(x, y, 1.25, rgba(styles.c, 0.5 + 0.45 * f));
    }
  }

  /* Trains on the standard gauge line through Ebute Metta and on the Blue Line. */
  var trains = [], tpos = [0, 0], TRAIN_SPEED = 120, TRAIN_LEN = 150;
  function buildTrains() {
    trains = [];
    RAILS.forEach(function (r) { if (r.train) trains.push({ r: r, t: -(2 + Math.random() * 8), dir: Math.random() < 0.5 ? 1 : -1 }); });
  }
  function railAt(r, d) {
    var c = r.cum, lo = 0, hi = c.length - 2;
    while (lo < hi) { var mid = (lo + hi + 1) >> 1; if (c[mid] <= d) lo = mid; else hi = mid - 1; }
    var seg = c[lo + 1] - c[lo], t = seg > 0 ? (d - c[lo]) / seg : 0, p = r.p;
    tpos[0] = (p[2 * lo] + (p[2 * lo + 2] - p[2 * lo]) * t) * s + ox;
    tpos[1] = (p[2 * lo + 1] + (p[2 * lo + 3] - p[2 * lo + 1]) * t) * s + oy;
    return lo;
  }
  function drawTrains(dt) {
    for (var i = 0; i < trains.length; i++) {
      var tr = trains[i], r = tr.r;
      if (dt > 0) {
        tr.t += dt;
        if (tr.t * TRAIN_SPEED > r.len + TRAIN_LEN) { tr.t = -(10 + Math.random() * 16); tr.dir = -tr.dir; }
      }
      if (tr.t < 0) continue;
      var run = tr.t * TRAIN_SPEED, head = tr.dir > 0 ? run : r.len - run, tail = head - tr.dir * TRAIN_LEN;
      var a = clamp(Math.min(head, tail), 0, r.len), b = clamp(Math.max(head, tail), 0, r.len);
      if (b - a < 2) continue;
      var body = new Path2D(), k0 = railAt(r, a);
      body.moveTo(tpos[0], tpos[1]);
      for (var k = k0 + 1; k < r.cum.length - 1 && r.cum[k] < b; k++) body.lineTo(r.p[2 * k] * s + ox, r.p[2 * k + 1] * s + oy);
      railAt(r, b); body.lineTo(tpos[0], tpos[1]);
      tctx.save();
      tctx.lineCap = "butt"; tctx.setLineDash([5, 1.6]);
      tctx.lineWidth = 2.6; tctx.strokeStyle = rgba(styles.a, 0.6); tctx.stroke(body);
      tctx.restore();
      if (head >= 0 && head <= r.len) {
        railAt(r, head);
        if (styles.glow) dot(tpos[0], tpos[1], 6, rgba(styles.a, 0.2));
        dot(tpos[0], tpos[1], 1.9, rgba(styles.a, 1));
        var tn = RAILS.indexOf(r) === 0 ? (tr.dir > 0 ? "Train to Ebute Metta" : "Train to Ibadan") : (tr.dir > 0 ? "Blue Line to Mile 2" : "Blue Line to Marina");
        tagAt("train" + i, tpos[0], tpos[1], tn);
      }
      if (tail >= 0 && tail <= r.len) { railAt(r, tail); dot(tpos[0], tpos[1], 1.4, rgba(styles.b, 0.95)); }
    }
  }

  /* Okadas and kekes buzzing along the side streets. */
  var bikes = [], bpos = [0, 0], MINCUM = [], minVisible = [];
  function minCum(i) {
    if (MINCUM[i]) return MINCUM[i];
    var p = MIN[i], n = p.length / 2, c = new Float32Array(n);
    for (var j = 1; j < n; j++) c[j] = c[j - 1] + Math.hypot(p[2 * j] - p[2 * j - 2], p[2 * j + 1] - p[2 * j - 1]);
    MINCUM[i] = c;
    return c;
  }
  function spawnBike(b) {
    for (var tries = 0; tries < 6 && minVisible.length; tries++) {
      var i = minVisible[Math.floor(Math.random() * minVisible.length)], c = minCum(i), len = c[c.length - 1];
      if (len < 30) continue;
      b.i = i; b.len = len; b.d = Math.random() * len; b.dir = Math.random() < 0.5 ? 1 : -1;
      b.keke = Math.random() < 0.3; b.v = (45 + Math.random() * 55) * (b.keke ? 0.7 : 1);
      return b;
    }
    b.i = -1;
    return b;
  }
  function buildBikes() {
    minVisible = []; bikes = [];
    for (var i = 0; i < MIN.length; i++) if (inView(MINB[i], 10)) minVisible.push(i);
    var n = Math.round(clamp(vw * vh / 6000, 40, 240) / (lowPower ? 2 : 1));
    for (var k = 0; k < n; k++) bikes.push(spawnBike({}));
  }
  function bikeAt(i, d, c) {
    var p = MIN[i], lo = 0, hi = c.length - 2;
    while (lo < hi) { var mid = (lo + hi + 1) >> 1; if (c[mid] <= d) lo = mid; else hi = mid - 1; }
    var seg = c[lo + 1] - c[lo], t = seg > 0 ? (d - c[lo]) / seg : 0;
    bpos[0] = (p[2 * lo] + (p[2 * lo + 2] - p[2 * lo]) * t) * s + ox;
    bpos[1] = (p[2 * lo + 1] + (p[2 * lo + 3] - p[2 * lo + 1]) * t) * s + oy;
  }
  function drawBikes(dt) {
    if (!bikes.length) return;
    var tails = [new Path2D(), new Path2D()], heads = [new Path2D(), new Path2D()];
    for (var k = 0; k < bikes.length; k++) {
      var b = bikes[k];
      if (b.i < 0) { spawnBike(b); continue; }
      if (dt > 0) {
        b.d += b.dir * b.v * dt;
        if (b.d > b.len || b.d < 0) {
          if (Math.random() < 0.5) { b.dir = -b.dir; b.d = clamp(b.d, 0, b.len); } else { spawnBike(b); continue; }
        }
      }
      var c = minCum(b.i), col = b.keke ? 1 : 0;
      bikeAt(b.i, b.d, c);
      var hx = bpos[0], hy = bpos[1];
      bikeAt(b.i, clamp(b.d - b.dir * 24, 0, b.len), c);
      tails[col].moveTo(hx, hy); tails[col].lineTo(bpos[0], bpos[1]);
      heads[col].moveTo(hx + 1.1, hy); heads[col].arc(hx, hy, 1.1, 0, 6.2832);
      if (hexLive) liveHeads.push(hx, hy);
    }
    tctx.lineWidth = 1;
    tctx.strokeStyle = rgba(styles.a, 0.32); tctx.stroke(tails[0]);
    tctx.fillStyle = rgba(styles.a, 0.95); tctx.fill(heads[0]);
    tctx.strokeStyle = rgba(styles.keke, 0.36); tctx.stroke(tails[1]);
    tctx.fillStyle = rgba(styles.keke, 0.9); tctx.fill(heads[1]);
  }

  /* The breeze: faint streamlines drifting over the city, the way wind maps draw it.
     In the rainy season it is the sea breeze from the south west, in the harmattan it blows in from the north east. */
  var windP = [], windClock = 0, WIND_PTS = 14, WIND_BASE = SEASON === "harmattan" ? Math.PI * 0.75 : -Math.PI * 0.24;
  function newParticle(p, anyAge) {
    p.x = Math.random() * vw; p.y = Math.random() * vh;
    p.life = 3 + Math.random() * 4; p.age = anyAge ? Math.random() * p.life : 0;
    p.tr = p.tr || new Float32Array(WIND_PTS * 2);
    for (var k = 0; k < WIND_PTS; k++) { p.tr[2 * k] = p.x; p.tr[2 * k + 1] = p.y; }
    p.n = 1;
    return p;
  }
  function buildWind() {
    windP = [];
    var n = Math.round(clamp(vw * vh / 4200, 50, 320) / (lowPower ? 2 : 1));
    for (var i = 0; i < n; i++) windP.push(newParticle({}, true));
  }
  function drawWind(dt) {
    if (!windP.length) return;
    windClock += dt;
    var sample = windClock > 0.07;
    if (sample) windClock = 0;
    var fresh = new Path2D(), faint = new Path2D();
    for (var i = 0; i < windP.length; i++) {
      var p = windP[i];
      if (dt > 0) {
        var a = WIND_BASE + 0.85 * Math.sin(p.x * 0.0042 + clock * 0.11) * Math.cos(p.y * 0.0051 - clock * 0.08) + 0.4 * Math.sin((p.x - p.y) * 0.0019 + clock * 0.05);
        var sp = 26 + 14 * Math.sin(p.x * 0.003 + p.y * 0.002 + clock * 0.2);
        p.x += Math.cos(a) * sp * dt; p.y += Math.sin(a) * sp * dt; p.age += dt;
        if (sample) { p.tr.copyWithin(2, 0, (WIND_PTS - 1) * 2); if (p.n < WIND_PTS) p.n++; }
        p.tr[0] = p.x; p.tr[1] = p.y;
        if (p.age > p.life || p.x < -40 || p.x > vw + 40 || p.y < -40 || p.y > vh + 40) { newParticle(p, false); continue; }
      }
      if (p.n < 2) continue;
      var path = (p.age < 0.9 || p.life - p.age < 0.9) ? faint : fresh;
      path.moveTo(p.tr[0], p.tr[1]);
      for (var k = 1; k < p.n; k++) path.lineTo(p.tr[2 * k], p.tr[2 * k + 1]);
    }
    tctx.lineWidth = 1;
    tctx.strokeStyle = rgba(styles.wind, styles.windA * 0.45); tctx.stroke(faint);
    tctx.strokeStyle = rgba(styles.wind, styles.windA); tctx.stroke(fresh);
  }

  /* Aviation lights: masts burn a steady red, tall buildings flash red together at 30 flashes a minute. */
  function drawAviation() {
    if (!TALL.length) return;
    var ph = clock % 2, f = Math.max(0, 1 - Math.abs(ph - 0.18) / 0.18);
    var steady = new Path2D(), flash = new Path2D(), halo = new Path2D();
    for (var i = 0; i < TALL.length; i += 3) {
      var x = TALL[i] * s + ox, y = TALL[i + 1] * s + oy;
      if (!onScreen(x, y, 8)) continue;
      if (TALL[i + 2] === 0) { flash.moveTo(x + 1.5, y); flash.arc(x, y, 1.5, 0, 6.2832); halo.moveTo(x + 6, y); halo.arc(x, y, 6, 0, 6.2832); }
      else { steady.moveTo(x + 1, y); steady.arc(x, y, 1, 0, 6.2832); }
    }
    tctx.fillStyle = rgba(styles.b, 0.5); tctx.fill(steady);
    tctx.fillStyle = rgba(styles.b, 0.2 + 0.8 * f); tctx.fill(flash);
    if (styles.glow && f > 0.02) { tctx.fillStyle = rgba(styles.b, 0.22 * f); tctx.fill(halo); }
  }

  /* Surf rolling in on the Atlantic coast, from Bar Beach along to Lekki. */
  function drawSurf() {
    if (!COAST || !inView(COAST.b, 80)) return;
    var p = COAST.p, nrm = COAST.n, N = p.length / 2;
    for (var w = 0; w < 4; w++) {
      var q = (clock / 7 + w / 4) % 1, off = 8 + (1 - q) * 80, a = Math.sin(Math.PI * q) * 0.45;
      var path = new Path2D();
      for (var i = 0; i < N; i++) {
        var x = (p[2 * i] + nrm[2 * i] * off) * s + ox, y = (p[2 * i + 1] + nrm[2 * i + 1] * off) * s + oy;
        if (i) path.lineTo(x, y); else path.moveTo(x, y);
      }
      tctx.lineWidth = 1; tctx.strokeStyle = rgba(styles.glint, a); tctx.stroke(path);
    }
    var foam = new Path2D();
    for (var j = 0; j < N; j++) {
      var fx = (p[2 * j] + nrm[2 * j] * 3) * s + ox, fy = (p[2 * j + 1] + nrm[2 * j + 1] * 3) * s + oy;
      if (j) foam.lineTo(fx, fy); else foam.moveTo(fx, fy);
    }
    tctx.lineWidth = 1.4; tctx.strokeStyle = rgba(styles.glint, 0.3 + 0.12 * Math.sin(clock * 2.2)); tctx.stroke(foam);
  }

  /* The season, from the real calendar: passing rain showers with ripples and the odd flash of lightning
     from April to October, a warm dust haze in the harmattan. */
  var ripples = [], flashAt = -9, RAIN_CYCLE = 42, RAIN_SPAN = 28;
  function drawWeather(dt) {
    if (SEASON === "harmattan") {
      tctx.globalCompositeOperation = "source-over";
      var hx = vw * (0.5 + 0.3 * Math.sin(clock * 0.02)), hy = vh * (0.4 + 0.2 * Math.cos(clock * 0.017)), hr = Math.max(vw, vh);
      var hg = tctx.createRadialGradient(hx, hy, 0, hx, hy, hr);
      hg.addColorStop(0, rgba(styles.dust, 0.1)); hg.addColorStop(1, rgba(styles.dust, 0.03));
      tctx.fillStyle = hg; tctx.fillRect(0, 0, vw, vh);
      return;
    }
    if (SEASON !== "rain") return;
    var t = clock % RAIN_CYCLE;
    if (t > RAIN_SPAN) { ripples.length = 0; return; }
    var q = t / RAIN_SPAN, str = Math.sin(Math.PI * q);
    var cx = -0.25 * vw + q * 1.5 * vw, cy = 1.15 * vh - q * 1.3 * vh, R = 0.3 * Math.max(vw, vh);
    if (dt > 0 && glintVis.length) {
      for (var want = dt * 45 * str; want > 0; want -= 1) {
        if (Math.random() > want) continue;
        var gi = glintVis[Math.floor(Math.random() * glintVis.length)], gx = GLINTS[gi] * s + ox, gy = GLINTS[gi + 1] * s + oy;
        if (Math.hypot(gx - cx, gy - cy) < R * 0.8) ripples.push({ x: gx, y: gy, t: 0 });
      }
    }
    var near = new Path2D(), far = new Path2D();
    for (var r = ripples.length - 1; r >= 0; r--) {
      var rp = ripples[r];
      rp.t += dt;
      if (rp.t > 1.2) { ripples.splice(r, 1); continue; }
      var rr = 1 + rp.t * 7, path = rp.t < 0.5 ? near : far;
      path.moveTo(rp.x + rr, rp.y); path.arc(rp.x, rp.y, rr, 0, 6.2832);
    }
    tctx.lineWidth = 0.8;
    tctx.strokeStyle = rgba(styles.glint, 0.45); tctx.stroke(near);
    tctx.strokeStyle = rgba(styles.glint, 0.18); tctx.stroke(far);
    var specks = new Path2D(), n = Math.round(70 * str);
    for (var k = 0; k < n; k++) {
      var ang = Math.random() * 6.2832, rad = Math.sqrt(Math.random()) * R * 0.85;
      specks.rect(cx + Math.cos(ang) * rad, cy + Math.sin(ang) * rad, 1, 1);
    }
    tctx.fillStyle = rgba(styles.glint, 0.22); tctx.fill(specks);
    if (lowPower) return;
    tctx.globalCompositeOperation = "source-over";
    var cg = tctx.createRadialGradient(cx, cy, 0, cx, cy, R);
    cg.addColorStop(0, rgba(styles.cloud, styles.cloudA * str));
    cg.addColorStop(0.6, rgba(styles.cloud, styles.cloudA * 0.55 * str));
    cg.addColorStop(1, rgba(styles.cloud, 0));
    tctx.fillStyle = cg; tctx.fillRect(cx - R, cy - R, R * 2, R * 2);
    if (dt > 0 && str > 0.6 && Math.random() < dt * 0.05) flashAt = clock;
    var since = clock - flashAt;
    if (since >= 0 && since < 0.45) {
      var fl = since < 0.08 ? 1 : since < 0.16 ? 0.2 : since < 0.24 ? 0.7 : Math.max(0, 1 - (since - 0.24) / 0.2) * 0.4;
      tctx.globalCompositeOperation = styles.lighter ? "lighter" : "source-over";
      var lg = tctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.9);
      lg.addColorStop(0, rgba(styles.flash, 0.2 * fl)); lg.addColorStop(1, rgba(styles.flash, 0));
      tctx.fillStyle = lg; tctx.fillRect(cx - R, cy - R, R * 2, R * 2);
    }
  }

  function box(x, y, lines, a) {
    tctx.save();
    tctx.globalCompositeOperation = "source-over"; tctx.globalAlpha = a;
    tctx.font = "600 11px Archivo, 'Segoe UI', sans-serif"; tctx.textBaseline = "middle";
    var w = 0; lines.forEach(function (l) { w = Math.max(w, tctx.measureText(l).width); });
    w += 16; var h = 8 + lines.length * 15, bx = Math.round(x - w / 2), by = Math.round(y);
    bx = clamp(bx, 8, vw - w - 8);
    tctx.fillStyle = styles.tagBg; tctx.fillRect(bx, by, w, h);
    tctx.strokeStyle = styles.tagEdge; tctx.lineWidth = 1; tctx.strokeRect(bx + 0.5, by + 0.5, w - 1, h - 1);
    tctx.fillStyle = styles.tagInk;
    lines.forEach(function (l, i) { tctx.fillText(l, bx + 8, by + 11.5 + i * 15); });
    tctx.restore();
  }

  /* 1. Navigation: a real route draws itself across the city, a pin drops at the end, then the next route. */
  var navI = 0, navT = -3, NAV_CYCLE = 10;
  function bounce(p) { var n = 7.5625, d = 2.75; if (p < 1 / d) return n * p * p; if (p < 2 / d) return n * (p -= 1.5 / d) * p + 0.75; if (p < 2.5 / d) return n * (p -= 2.25 / d) * p + 0.9375; return n * (p -= 2.625 / d) * p + 0.984375; }
  function pin(x, y, a) {
    tctx.beginPath();
    tctx.moveTo(x, y);
    tctx.bezierCurveTo(x - 3, y - 7, x - 9, y - 10, x - 9, y - 17);
    tctx.arc(x, y - 17, 9, Math.PI, 0);
    tctx.bezierCurveTo(x + 9, y - 10, x + 3, y - 7, x, y);
    tctx.closePath();
    tctx.fillStyle = rgba(styles.b, a); tctx.fill();
    tctx.lineWidth = 1.5; tctx.strokeStyle = styles.navCase; tctx.stroke();
    dot(x, y - 17, 3.4, "rgba(255,255,255," + a.toFixed(2) + ")");
  }
  function drawNav(dt) {
    if (!NAV.length || reduced()) return;
    navT += dt;
    if (navT > NAV_CYCLE) { navT = 0; navI = (navI + 1) % NAV.length; }
    if (navT < 0) return;
    var R = NAV[navI], t = navT, p = R.p, c = R.cum;
    var dp = clamp((t - 0.5) / 3.2, 0, 1), e = dp < 0.5 ? 2 * dp * dp : 1 - Math.pow(-2 * dp + 2, 2) / 2;
    var fade = t < 8.8 ? 1 : Math.max(0, 1 - (t - 8.8) / 0.9);
    if (fade <= 0) return;
    var dist = e * R.len, path = new Path2D(), k = 1, hx, hy;
    path.moveTo(p[0] * s + ox, p[1] * s + oy);
    for (; k < c.length && c[k] <= dist; k++) path.lineTo(p[2 * k] * s + ox, p[2 * k + 1] * s + oy);
    if (k < c.length) {
      var seg = c[k] - c[k - 1], f = seg > 0 ? (dist - c[k - 1]) / seg : 0;
      hx = (p[2 * k - 2] + (p[2 * k] - p[2 * k - 2]) * f) * s + ox; hy = (p[2 * k - 1] + (p[2 * k + 1] - p[2 * k - 1]) * f) * s + oy;
      path.lineTo(hx, hy);
    } else { hx = p[p.length - 2] * s + ox; hy = p[p.length - 1] * s + oy; }
    tctx.save();
    tctx.globalCompositeOperation = "source-over"; tctx.globalAlpha = fade;
    tctx.lineCap = "round"; tctx.lineJoin = "round";
    tctx.lineWidth = 7.5; tctx.strokeStyle = styles.navCase; tctx.stroke(path);
    tctx.lineWidth = 3.4; tctx.strokeStyle = rgba(styles.b, 1); tctx.stroke(path);
    if (dp >= 1) { tctx.setLineDash([2, 11]); tctx.lineDashOffset = -clock * 28; tctx.lineWidth = 1.8; tctx.strokeStyle = styles.navFlow; tctx.stroke(path); tctx.setLineDash([]); }
    var sx0 = p[0] * s + ox, sy0 = p[1] * s + oy, grow = clamp(t / 0.5, 0, 1);
    tctx.beginPath(); tctx.arc(sx0, sy0, 7 * grow, 0, 6.2832); tctx.fillStyle = styles.navCase; tctx.fill();
    tctx.lineWidth = 2.4; tctx.strokeStyle = rgba(styles.b, 1); tctx.stroke();
    dot(sx0, sy0, 2.4 * grow, "#fff");
    if (dp > 0 && dp < 1) { dot(hx, hy, 9, rgba(styles.b, 0.28)); dot(hx, hy, 4.6, "#fff"); tctx.beginPath(); tctx.arc(hx, hy, 4.6, 0, 6.2832); tctx.lineWidth = 2; tctx.strokeStyle = rgba(styles.b, 1); tctx.stroke(); }
    if (dp >= 1) {
      var drop = bounce(clamp((t - 3.7) / 0.6, 0, 1));
      tctx.beginPath(); tctx.ellipse(hx, hy, 6 * drop, 2.2 * drop, 0, 0, 6.2832); tctx.fillStyle = "rgba(0,0,0,.35)"; tctx.fill();
      pin(hx, hy - (1 - drop) * 36, 1);
    }
    tctx.restore();
    /* labels go below the marker, or above it when the page text or the portrait sits there */
    function spot(x, y, below, above) { return !blocked(x, y + below + 12) ? y + below : !blocked(x, y - above + 12) ? y - above : null; }
    var oyL = spot(sx0, sy0, 12, 40);
    if (grow >= 1 && oyL !== null) box(sx0, oyL, [R.from], fade);
    var dyL = spot(hx, hy, 10, 90);
    if (dp >= 1 && t > 4.1 && dyL !== null) box(hx, dyL, [R.to, R.km.toFixed(1) + " km by road"], fade * Math.min(1, (t - 4.1) / 0.4));
  }

  /* 2. A flock of birds over the lagoon, flying by Craig Reynolds' boids rules. */
  var birds = [], flockT = 0;
  function buildBirds() {
    birds = [];
    if (reduced()) return;
    var n = Math.round(clamp(vw * vh / 36000, 14, 38) / (lowPower ? 2 : 1)), cx = vw * 0.66, cy = vh * 0.3;
    for (var i = 0; i < n; i++) birds.push({ x: cx + (Math.random() - 0.5) * 140, y: cy + (Math.random() - 0.5) * 90, vx: 40 + Math.random() * 20, vy: (Math.random() - 0.5) * 30, ph: Math.random() * 6.3, fr: 8 + Math.random() * 5 });
  }
  function drawBirds(dt) {
    if (!birds.length) return;
    if (dt > 0) {
      flockT += dt;
      var tx = vw * (0.62 + 0.3 * Math.sin(flockT * 0.075)), ty = vh * (0.24 + 0.17 * Math.sin(flockT * 0.12 + 1.1));
      for (var i = 0; i < birds.length; i++) {
        var b = birds[i], sx = 0, sy = 0, ax = 0, ay = 0, cx = 0, cy = 0, n = 0;
        for (var j = 0; j < birds.length; j++) {
          if (i === j) continue;
          var o = birds[j], dx = o.x - b.x, dy = o.y - b.y, d2 = dx * dx + dy * dy;
          if (d2 < 260 && d2 > 0.01) { sx -= dx / d2; sy -= dy / d2; }
          if (d2 < 3600) { ax += o.vx; ay += o.vy; cx += o.x; cy += o.y; n++; }
        }
        if (n) { ax = ax / n - b.vx; ay = ay / n - b.vy; cx = cx / n - b.x; cy = cy / n - b.y; }
        var gx = tx - b.x, gy = ty - b.y, gd = Math.hypot(gx, gy) || 1;
        b.vx += (sx * 1100 + ax * 0.9 + cx * 0.55 + gx / gd * 28) * dt;
        b.vy += (sy * 1100 + ay * 0.9 + cy * 0.55 + gy / gd * 28) * dt;
        var sp = Math.hypot(b.vx, b.vy) || 1;
        if (sp > 80) { b.vx *= 80 / sp; b.vy *= 80 / sp; } else if (sp < 38) { b.vx *= 38 / sp; b.vy *= 38 / sp; }
        b.x += b.vx * dt; b.y += b.vy * dt; b.ph += b.fr * dt;
      }
    }
    var path = new Path2D();
    for (var k = 0; k < birds.length; k++) {
      var B = birds[k], a = Math.atan2(B.vy, B.vx), sw = 2.25 + 0.5 * Math.sin(B.ph), L = 5.8;
      path.moveTo(B.x + Math.cos(a + sw) * L, B.y + Math.sin(a + sw) * L);
      path.lineTo(B.x, B.y);
      path.lineTo(B.x + Math.cos(a - sw) * L, B.y + Math.sin(a - sw) * L);
    }
    tctx.save();
    tctx.globalCompositeOperation = "source-over";
    tctx.lineWidth = 1.5; tctx.lineCap = "round"; tctx.lineJoin = "round";
    tctx.strokeStyle = rgba(styles.bird, styles.birdA); tctx.stroke(path);
    tctx.restore();
  }

  /* 3. Traffic density in hexagons, the way Uber's H3 grid shows demand. It comes and goes every half minute. */
  var HEX_R = 15, hexMap = new Map(), hexClock = 0, hexLive = false, liveHeads = [], lastHeads = [];
  function hexPath(path, cx, cy, r) {
    for (var i = 0; i < 6; i++) {
      var an = Math.PI / 180 * (60 * i - 30), x = cx + r * Math.cos(an), y = cy + r * Math.sin(an);
      if (i) path.lineTo(x, y); else path.moveTo(x, y);
    }
    path.closePath();
  }
  function drawHexes(dt) {
    lastHeads = liveHeads; liveHeads = [];
    var t = clock - 14, cyc = 34, on = 11;
    if (t < 0 || reduced()) { hexLive = false; return; }
    t = t % cyc;
    var mode = t < on ? (t < 1.5 ? t / 1.5 : t > on - 1.5 ? (on - t) / 1.5 : 1) : 0;
    hexLive = t < on + 0.5 || t > cyc - 0.5;
    if (mode <= 0) { if (hexMap.size) hexMap.clear(); return; }
    hexClock += dt;
    if (hexClock > 0.25 && lastHeads.length) {
      hexClock = 0;
      var counts = new Map(), max = 1;
      for (var i = 0; i < lastHeads.length; i += 2) {
        var x = lastHeads[i], y = lastHeads[i + 1];
        if (!onScreen(x, y, 0)) continue;
        var q = (0.57735 * x - y / 3) / HEX_R, r = (2 / 3) * y / HEX_R, cz = -q - r;
        var rq = Math.round(q), rr = Math.round(r), rz = Math.round(cz), dq = Math.abs(rq - q), dr = Math.abs(rr - r), dz = Math.abs(rz - cz);
        if (dq > dr && dq > dz) rq = -rr - rz; else if (dr > dz) rr = -rq - rz;
        var key2 = rq + "," + rr, cnt = (counts.get(key2) || 0) + 1;
        counts.set(key2, cnt); if (cnt > max) max = cnt;
      }
      hexMap.forEach(function (e, k) { if (!counts.has(k)) e.t = 0; });
      counts.forEach(function (cnt, k) { var e2 = hexMap.get(k) || { t: 0, v: 0 }; e2.t = Math.min(1, cnt / Math.max(3, max * 0.7)); hexMap.set(k, e2); });
    }
    var lo = new Path2D(), mid = new Path2D(), hi = new Path2D();
    hexMap.forEach(function (e, k) {
      e.v += (e.t - e.v) * Math.min(1, dt * 4);
      if (e.v < 0.03 && e.t === 0) { hexMap.delete(k); return; }
      var qr = k.split(","), q2 = +qr[0], r2 = +qr[1];
      hexPath(e.v > 0.66 ? hi : e.v > 0.33 ? mid : lo, HEX_R * 1.7320508 * (q2 + r2 / 2), HEX_R * 1.5 * r2, HEX_R * 0.9);
    });
    tctx.lineWidth = 1;
    [[lo, 0.06, 0.16], [mid, 0.13, 0.3], [hi, 0.22, 0.5]].forEach(function (L) {
      tctx.fillStyle = rgba(styles.b, L[1] * mode); tctx.fill(L[0]);
      tctx.strokeStyle = rgba(styles.b, L[2] * mode); tctx.stroke(L[0]);
    });
    box(vw * 0.6, 96, ["Traffic density, live"], mode);
  }

  /* 4. Mist drifting over the water: soft noise, masked to the real lagoon and sea. */
  var mistCv = document.createElement("canvas"), mctx = mistCv.getContext("2d"), MW = 120, MH = 75, mistMask = null, mistImg = null, mistTick = 0;
  mistCv.width = MW; mistCv.height = MH;
  var PERM = new Uint8Array(512);
  (function () { var pp = []; for (var i = 0; i < 256; i++) pp.push(i); for (i = 255; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = pp[i]; pp[i] = pp[j]; pp[j] = t; } for (i = 0; i < 512; i++) PERM[i] = pp[i & 255]; })();
  function vnoise(x, y) {
    var xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    var a = PERM[(PERM[xi & 255] + yi) & 511], b = PERM[(PERM[(xi + 1) & 255] + yi) & 511];
    var c = PERM[(PERM[xi & 255] + yi + 1) & 511], d = PERM[(PERM[(xi + 1) & 255] + yi + 1) & 511];
    var u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    return (a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v) / 255;
  }
  function buildMist() {
    mistMask = null;
    if (!WATER.length || reduced()) return;
    var m = document.createElement("canvas"); m.width = MW; m.height = MH;
    var g = m.getContext("2d"); g.setTransform(MW / vw, 0, 0, MH / vh, 0, 0);
    g.beginPath();
    for (var i = 0; i < WATER.length; i++) { var r = WATER[i]; g.moveTo(r[0] * s + ox, r[1] * s + oy); for (var j = 2; j < r.length; j += 2) g.lineTo(r[j] * s + ox, r[j + 1] * s + oy); g.closePath(); }
    g.fillStyle = "#000"; g.fill("evenodd");
    var px = g.getImageData(0, 0, MW, MH).data; mistMask = new Float32Array(MW * MH);
    for (var k = 0; k < MW * MH; k++) mistMask[k] = px[4 * k + 3] / 255;
    mistImg = mctx.createImageData(MW, MH);
  }
  function drawMist() {
    if (!mistMask) return;
    if (mistTick++ % 3 === 0) {
      var d = mistImg.data, rgb = styles.mist.split(" "), R = +rgb[0], G = +rgb[1], Bc = +rgb[2], t = clock;
      for (var y = 0; y < MH; y++) for (var x = 0; x < MW; x++) {
        var i = y * MW + x, mk = mistMask[i];
        var n = 0.62 * vnoise(x * 0.07 + t * 0.05, y * 0.1 + t * 0.018) + 0.38 * vnoise(x * 0.16 - t * 0.03 + 9, y * 0.2 + 4);
        var a = mk > 0 ? Math.max(0, Math.min(1, (n - 0.44) * 2.4)) * mk : 0;
        d[4 * i] = R; d[4 * i + 1] = G; d[4 * i + 2] = Bc; d[4 * i + 3] = a * 255;
      }
      mctx.putImageData(mistImg, 0, 0);
    }
    tctx.save();
    tctx.globalCompositeOperation = "source-over"; tctx.globalAlpha = styles.mistA;
    tctx.imageSmoothingEnabled = true; tctx.imageSmoothingQuality = "high";
    tctx.drawImage(mistCv, 0, 0, vw, vh);
    tctx.restore();
  }

  var tagQueue = [];
  function tagAt(id, x, y, text) { if (onScreen(x, y, -20) && !blocked(x, y)) tagQueue.push({ id: id, x: x, y: y, text: text }); }
  function drawTags() {
    if (!tagQueue.length) return;
    tctx.save();
    tctx.globalCompositeOperation = "source-over";
    tctx.font = "600 11px Archivo, 'Segoe UI', sans-serif";
    tctx.textBaseline = "middle";
    var shown = 0;
    for (var i = 0; i < tagQueue.length && shown < 3; i++) {
      var T = tagQueue[i], h = 0;
      for (var k = 0; k < T.id.length; k++) h = (h * 31 + T.id.charCodeAt(k)) % 997;
      var c = (clock + h * 0.37) % 15, a = c < 0.6 ? c / 0.6 : c < 7 ? 1 : c < 7.6 ? 1 - (c - 7) / 0.6 : 0;
      if (a <= 0.02) continue;
      shown++;
      var w = tctx.measureText(T.text).width + 16, hh = 22, tx = T.x + 14, ty = T.y - 34;
      if (tx + w > vw - 10) tx = T.x - 14 - w;
      if (ty < 86) ty = T.y + 12;
      tctx.globalAlpha = a;
      tctx.beginPath(); tctx.moveTo(T.x, T.y); tctx.lineTo(tx > T.x ? tx : tx + w, ty + hh / 2);
      tctx.lineWidth = 1; tctx.strokeStyle = styles.tagEdge; tctx.stroke();
      tctx.fillStyle = styles.tagBg; tctx.fillRect(tx, ty, w, hh);
      tctx.strokeRect(tx + 0.5, ty + 0.5, w - 1, hh - 1);
      tctx.fillStyle = styles.tagInk; tctx.fillText(T.text, tx + 8, ty + hh / 2 + 0.5);
    }
    tctx.restore();
    tagQueue.length = 0;
  }

  function targetCount() { return clamp(Math.round(vw * vh / 7000), 64, 260); }
  function fillCars() {
    var n = targetCount();
    cars.length = 0;
    for (var i = 0; i < n; i++) cars.push(spawn({}));
  }

  function render(dt) {
    tctx.setTransform(dprT, 0, 0, dprT, 0, 0);
    tctx.clearRect(0, 0, vw, vh);
    var full = [new Path2D(), new Path2D(), new Path2D()], front = [new Path2D(), new Path2D(), new Path2D()];
    var heads = [new Path2D(), new Path2D(), new Path2D()], glows = [new Path2D(), new Path2D(), new Path2D()];
    clock += dt;
    tctx.globalCompositeOperation = styles.lighter ? "lighter" : "source-over";
    drawGlints();
    drawMist();
    drawSurf();
    drawWind(dt);
    drawPulse(dt);
    drawLamps();
    drawLanterns();
    drawHexes(dt);
    checkT += dt;
    var check = checkT > 1;
    if (check) checkT = 0;
    for (var i = 0; i < cars.length; i++) {
      var car = cars[i];
      if (car.i === undefined) continue;
      if (dt > 0) advance(car, dt);
      var L = 40 + car.v * 0.3;
      var h = streak(car, L, full[car.col]);
      if (hexLive) liveHeads.push(h[0], h[1]);
      streak(car, L * 0.35, front[car.col]);
      heads[car.col].moveTo(h[0] + 1.35, h[1]); heads[car.col].arc(h[0], h[1], 1.35, 0, 6.2832);
      if (styles.glow) { glows[car.col].moveTo(h[0] + 4, h[1]); glows[car.col].arc(h[0], h[1], 4, 0, 6.2832); }
      if (check) {
        if (h[0] < -80 || h[0] > vw + 80 || h[1] < -80 || h[1] > vh + 80) { if (++car.out > 1) spawn(car); }
        else car.out = 0;
      }
    }
    tctx.lineCap = "round"; tctx.lineJoin = "round";
    for (var c = 0; c < 3; c++) {
      var rgb = c === 0 ? styles.a : c === 1 ? styles.b : styles.c;
      tctx.lineWidth = 1.6; tctx.strokeStyle = "rgb(" + rgb + " / 0.3)"; tctx.stroke(full[c]);
      tctx.lineWidth = 1.9; tctx.strokeStyle = "rgb(" + rgb + " / 0.62)"; tctx.stroke(front[c]);
      if (styles.glow) { tctx.fillStyle = "rgb(" + rgb + " / 0.12)"; tctx.fill(glows[c]); }
      tctx.fillStyle = "rgb(" + rgb + " / 0.95)"; tctx.fill(heads[c]);
    }
    drawBikes(dt);
    drawNav(dt);
    drawTrains(dt);
    drawFerries(dt);
    drawBeacon();
    drawAviation();
    drawPlane(dt);
    drawBirds(dt);
    drawWeather(dt);
    drawTags();
    tctx.globalCompositeOperation = "source-over";
  }

  function frame(now) {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    var dt = last ? (now - last) / 1000 : 0;
    last = now;
    acc += dt;
    /* Once the page covers the map, half the frame rate is plenty. */
    if (acc < (dim > 0.7 ? 1 / 30 : 0)) return;
    /* If the first four seconds run slowly on this device, drop to a lighter mix. */
    if (!lowPower && dim < 0.5 && perfN < 240) {
      perfN++; perfT += acc;
      if (perfN === 240 && perfT / 240 > 1 / 30) {
        lowPower = true;
        windP.length = Math.floor(windP.length / 2);
        bikes.length = Math.floor(bikes.length / 2);
      }
    }
    render(Math.min(acc, 0.05));
    acc = 0;
  }
  function start() {
    if (reduced()) { running = false; render(0); return; }
    if (running) return;
    running = true; last = 0; acc = 0;
    raf = requestAnimationFrame(frame);
  }
  function stop() { running = false; }

  /* The city switches on, spreading out from Lagos Island, then the place names fade in. */
  function intro() {
    if (reduced() || (window.scrollY || 0) > vh * 0.5) { mapEl.classList.add("labels-on"); return; }
    var ix = mapX(3.39) * s + ox, iy = mapY(6.455) * s + oy;
    var maxR = Math.hypot(Math.max(ix, vw - ix), Math.max(iy, vh - iy)), t0 = 0;
    mapEl.style.setProperty("--ix", ix.toFixed(0) + "px");
    mapEl.style.setProperty("--iy", iy.toFixed(0) + "px");
    mapEl.style.setProperty("--ir", "0");
    mapEl.classList.add("is-intro");
    function step(now) {
      if (!t0) t0 = now;
      var p = Math.min(1, (now - t0) / 2800), e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      mapEl.style.setProperty("--ir", (e * maxR).toFixed(1));
      if (p < 1) introRaf = requestAnimationFrame(step);
      else { mapEl.classList.remove("is-intro"); mapEl.classList.add("labels-on"); }
    }
    introRaf = requestAnimationFrame(step);
  }

  function rebuild() {
    layout(); readStyles(); drawRoads(); buildSpawn(); fillCars(); buildGlints(); buildFerries(); buildLanterns(); buildTrains(); buildBikes(); buildWind(); buildBirds(); buildMist(); placeLabels();
    if (!running) render(0);
  }
  var lastW = 0, lastH = 0;
  var onResize = debounce(function () {
    /* Mobile browsers fire resize when the address bar slides; ignore small height changes. */
    if (window.innerWidth === lastW && Math.abs(window.innerHeight - lastH) < 120) return;
    lastW = window.innerWidth; lastH = window.innerHeight;
    rebuild();
  }, 160);
  function onVisibility() { if (document.hidden) stop(); else start(); }
  function onReduce() { if (reduced()) { stop(); render(0); } else start(); }
  window.addEventListener("resize", onResize);
  document.addEventListener("visibilitychange", onVisibility);
  onMQ(reduceMQ, onReduce);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (!disposed) placeLabels(); });

  rebuild();
  lastW = window.innerWidth; lastH = window.innerHeight;
  intro();
  start();

  /* Undoes everything above, so a remount starts from a clean map. */
  function destroy() {
    disposed = true;
    running = false;
    cancelAnimationFrame(raf);
    cancelAnimationFrame(introRaf);
    window.removeEventListener("resize", onResize);
    onResize.cancel();
    document.removeEventListener("visibilitychange", onVisibility);
    offMQ(reduceMQ, onReduce);
    labelEls.forEach(function (el) { el.remove(); });
    mapEl.classList.remove("is-intro", "labels-on");
    mapEl.style.removeProperty("--ix");
    mapEl.style.removeProperty("--iy");
    mapEl.style.removeProperty("--ir");
  }

  return {
    restyle: function () { readStyles(); drawRoads(); if (!running) render(0); },
    setDim: function (d) { dim = d; },
    veilMax: function () { return styles.veilMax || 0.85; },
    pulseAt: pulseAt,
    destroy: destroy
  };
}

export default function LagosMap({ apiRef, veilRef, onData, onReady }) {
  const mapRef = useRef(null);
  const roadsRef = useRef(null);
  const glowRef = useRef(null);
  const trafficRef = useRef(null);
  const labelsRef = useRef(null);
  const onDataRef = useRef(onData);
  const onReadyRef = useRef(onReady);

  useEffect(() => {
    onDataRef.current = onData;
    onReadyRef.current = onReady;
  });

  /* The road data is fetched after mount; without it the page simply has no map. */
  useEffect(() => {
    const ctrl = new AbortController();
    let map = null;
    let timer = 0;
    let raf = 0;
    fetch(`${import.meta.env.BASE_URL}lagos-roads.json`, { signal: ctrl.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then(
        (DATA) => {
          if (!DATA || ctrl.signal.aborted) return;
          /* The first draw is heavy, so while the loading screen is drawing its wordmark it waits.
             onData fires a frame before it, so "Drawing the streets" can be shown; then onReady. */
          const loader = window.__loader;
          const quiet = loader && loader.quiet ? Math.max(0, loader.quiet - performance.now()) : 0;
          timer = setTimeout(() => {
            if (ctrl.signal.aborted) return;
            if (onDataRef.current) onDataRef.current();
            raf = requestAnimationFrame(() => {
              if (ctrl.signal.aborted) return;
              map = createMap(
                {
                  map: mapRef.current,
                  roads: roadsRef.current,
                  glow: glowRef.current,
                  traffic: trafficRef.current,
                  labels: labelsRef.current,
                },
                DATA,
              );
              if (!map) return;
              apiRef.current = map;
              if (onReadyRef.current) onReadyRef.current();
            });
          }, quiet);
        },
        () => {},
      );
    return () => {
      ctrl.abort();
      clearTimeout(timer);
      cancelAnimationFrame(raf);
      if (map) {
        map.destroy();
        map = null;
      }
      apiRef.current = null;
    };
  }, [apiRef]);

  return (
    <div className="map" id="map" aria-hidden="true" ref={mapRef}>
      <canvas id="roads" ref={roadsRef} />
      <canvas id="glow" ref={glowRef} />
      <canvas id="traffic" ref={trafficRef} />
      <div className="map__labels" id="labels" ref={labelsRef} />
      <div className="map__veil" id="veil" ref={veilRef} />
    </div>
  );
}
