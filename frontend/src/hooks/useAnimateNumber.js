import { useState, useEffect, useRef } from "react";

export function useAnimateNumber(start, end, duration) {
  const [value, setValue] = useState(start);
  const startTimeRef = useRef(null);

  useEffect(() => {
    let animationFrame;

    function animate(currentTime) {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime;
      }

      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      const currentValue = Math.floor(start + (end - start) * progress);
      setValue(currentValue);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    }

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
      startTimeRef.current = null;
    };
  }, [start, end, duration]);

  return value;
}
