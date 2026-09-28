import { useSyncExternalStore } from "react";
import { lagosTime } from "../utils/time";

/* One shared Lagos clock for every [data-clock] on the page, updated every 10 seconds
   while at least one of them is mounted. */
let current = lagosTime();
let timer = 0;
const listeners = new Set();

function tick() {
  current = lagosTime();
  listeners.forEach((fn) => fn());
}

function subscribe(fn) {
  listeners.add(fn);
  if (!timer) {
    current = lagosTime();
    timer = setInterval(tick, 10000);
  }
  return () => {
    listeners.delete(fn);
    if (!listeners.size) {
      clearInterval(timer);
      timer = 0;
    }
  };
}

function getSnapshot() {
  return current;
}

export default function useLagosTime() {
  return useSyncExternalStore(subscribe, getSnapshot);
}
