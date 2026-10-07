import { useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

export function useStoredSimulationState<T>(
  name: string,
  fallback: T,
  enabled = true,
): [T, Dispatch<SetStateAction<T>>] {
  const key = `math1729.simulation.v1.${name}`;
  const [value, setValue] = useState<T>(() => {
    if (!enabled) return fallback;
    try {
      const savedValue = window.sessionStorage.getItem(key);
      return savedValue === null ? fallback : (JSON.parse(savedValue) as T);
    } catch {
      return fallback;
    }
  });
  const valueRef = useRef(value);
  valueRef.current = value;

  useEffect(() => {
    if (!enabled) return;
    const timeoutId = window.setTimeout(() => {
      try {
        window.sessionStorage.setItem(key, JSON.stringify(value));
      } catch {}
    }, 150);
    return () => window.clearTimeout(timeoutId);
  }, [enabled, key, value]);

  useEffect(() => {
    if (!enabled) return;
    const persistLatestValue = () => {
      try {
        window.sessionStorage.setItem(key, JSON.stringify(valueRef.current));
      } catch {}
    };
    window.addEventListener("pagehide", persistLatestValue);
    return () => {
      window.removeEventListener("pagehide", persistLatestValue);
      persistLatestValue();
    };
  }, [enabled, key]);

  return [value, setValue];
}
