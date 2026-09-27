"use client";

import { useEffect, useState } from "react";
import { loadStats, type StatsResult } from "@/lib/stats";

/** The live stats file, as the panels read it. "loading" on the server and on
 *  first paint, so the static HTML carries the loading state and hydration
 *  matches; the fetch happens after mount. */
export function useStats(): StatsResult {
  const [result, setResult] = useState<StatsResult>({ status: "loading" });
  useEffect(() => {
    let live = true;
    void loadStats().then((next) => {
      if (live) setResult(next);
    });
    return () => {
      live = false;
    };
  }, []);
  return result;
}
