import { useRef, useState, useCallback, useEffect } from "react";
import { colors } from "../theme";

const THRESHOLD  = 72;  // px of pull needed to trigger refresh
const MAX_PULL   = 96;  // max visual travel

export default function PullToRefresh({ children, onRefresh, scrollRef }) {
  const [pullY,      setPullY]      = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const touchStartY  = useRef(0);
  const pulling      = useRef(false);

  const onTouchStart = useCallback((e) => {
    // Only begin tracking when the scroll container is at the very top
    if (scrollRef.current?.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
      pulling.current = true;
    }
  }, [scrollRef]);

  const onTouchMove = useCallback((e) => {
    if (!pulling.current || refreshing) return;
    const dy = e.touches[0].clientY - touchStartY.current;
    if (dy > 0) {
      // Rubber-band resistance: pull distance is dampened
      setPullY(Math.min(dy * 0.45, MAX_PULL));
    } else {
      setPullY(0);
    }
  }, [refreshing]);

  const onTouchEnd = useCallback(async () => {
    if (!pulling.current) return;
    pulling.current = false;

    if (pullY >= THRESHOLD * 0.45) {
      setRefreshing(true);
      setPullY(THRESHOLD * 0.45); // snap to spinner position
      try {
        await onRefresh?.();
      } finally {
        // Brief pause so user sees the spinner
        setTimeout(() => {
          setRefreshing(false);
          setPullY(0);
        }, 700);
      }
    } else {
      setPullY(0);
    }
  }, [pullY, onRefresh]);

  // Attach to the outer wrapper so we catch events even over child elements
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove",  onTouchMove,  { passive: true });
    el.addEventListener("touchend",   onTouchEnd,   { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove",  onTouchMove);
      el.removeEventListener("touchend",   onTouchEnd);
    };
  }, [scrollRef, onTouchStart, onTouchMove, onTouchEnd]);

  const indicatorOpacity = Math.min(pullY / (THRESHOLD * 0.45), 1);
  const spinnerAngle     = (pullY / MAX_PULL) * 360;

  return (
    <div style={{ position: "relative", flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* Pull indicator */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: 44,
        transform: `translateY(${pullY - 44}px)`,
        transition: refreshing || pullY === 0 ? "transform 0.3s ease" : "none",
        zIndex: 10,
        opacity: indicatorOpacity,
        pointerEvents: "none",
      }}>
        <div style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          border: `2px solid ${colors.border}`,
          borderTopColor: colors.accent,
          transform: refreshing
            ? undefined
            : `rotate(${spinnerAngle}deg)`,
          animation: refreshing ? "spin 0.7s linear infinite" : "none",
        }} />
      </div>

      {/* Page content — shifts down as user pulls */}
      <div style={{
        flex: 1,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transform: `translateY(${pullY}px)`,
        transition: refreshing || pullY === 0 ? "transform 0.3s ease" : "none",
      }}>
        {children}
      </div>
    </div>
  );
}
