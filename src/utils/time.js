/* Dates and times the page shows, ported from the design's app.js. */

const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];

/* Years freelancing, counted from 2024, written as a word. */
export function yearsWord() {
  const n = new Date().getFullYear() - 2024;
  return WORDS[n] || String(n);
}

/* The real moon phase, from the mean synodic month and a known new moon (6 Jan 2000, 18:14 UTC). */
export function moonInfo(date) {
  var syn = 29.530588853, ref = Date.UTC(2000, 0, 6, 18, 14);
  var p = ((((date.getTime() - ref) / 86400000) % syn) + syn) % syn / syn;
  var names = ["New moon", "Waxing crescent", "First quarter", "Waxing gibbous", "Full moon", "Waning gibbous", "Last quarter", "Waning crescent"];
  return { p: p, illum: (1 - Math.cos(2 * Math.PI * p)) / 2, name: names[Math.floor(p * 8 + 0.5) % 8] };
}

/* Lagos seasons: rain from April to October, harmattan from December to February. */
export function seasonNow() {
  var m = new Date(Date.now() + 3600000).getUTCMonth();
  return m >= 3 && m <= 9 ? "rain" : (m === 11 || m <= 1) ? "harmattan" : "dry";
}

var fmt = null;
try { fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Africa/Lagos" }); } catch (e) { fmt = null; }

export function lagosTime() {
  var now = new Date();
  if (fmt) return fmt.format(now);
  var u = new Date(now.getTime() + 3600000);
  return ("0" + u.getUTCHours()).slice(-2) + ":" + ("0" + u.getUTCMinutes()).slice(-2);
}
