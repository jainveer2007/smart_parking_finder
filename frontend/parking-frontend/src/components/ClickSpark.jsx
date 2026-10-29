import React, { useRef, useEffect, useCallback } from 'react';

const ClickSpark = ({
  sparkColor = '#75CDB5',
  sparkSize = 10,
  sparkRadius = 50,
  sparkCount = 8,
  duration = 400,
  easing = 'ease-out',
  extraScale = 1.0,
  children,
}) => {
  const canvasRef = useRef(null);
  const sparksRef = useRef([]);
  const startTimeRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    let resizeTimeout;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
    };

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resizeCanvas, 100);
    };

    window.addEventListener('resize', handleResize);
    resizeCanvas();

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  const easeFuncs = {
    linear: (t) => t,
    'ease-in': (t) => t * t,
    'ease-in-out': (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
    'ease-out': (t) => t * (2 - t),
  };

  const draw = useCallback(
    (timestamp) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(dpr, dpr);

      sparksRef.current = sparksRef.current.filter((spark) => {
        const elapsed = timestamp - spark.startTime;
        if (elapsed >= duration) {
          return false;
        }

        const progress = elapsed / duration;
        const normalized = easeFuncs[easing] ? easeFuncs[easing](progress) : easeFuncs['ease-out'](progress);

        const distance = normalized * sparkRadius * extraScale;
        const lineLength = sparkSize * (1 - normalized);

        const x1 = spark.x + distance * Math.cos(spark.angle);
        const y1 = spark.y + distance * Math.sin(spark.angle);
        const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
        const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);

        ctx.strokeStyle = spark.color || sparkColor || '#75CDB5';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        return true;
      });

      ctx.restore();

      if (sparksRef.current.length > 0) {
        requestAnimationFrame(draw);
      }
    },
    [duration, easing, extraScale, sparkColor, sparkRadius, sparkSize]
  );

  const handleClick = useCallback(
    (e) => {
      // Exclude designated areas (Vehicle Information area and Booking/Release selection box)
      if (
        e.target?.closest?.(
          '[data-no-spark], [data-no-spark="true"], input, textarea, select, [role="radiogroup"], [role="radio"], #vehicleNumber'
        )
      ) {
        return;
      }

      // Respect reduced-motion preference
      if (
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) {
        return;
      }

      let x = e.clientX;
      let y = e.clientY;

      // Support keyboard-activated clicks where clientX/Y are 0
      if ((!x && !y) || (x === 0 && y === 0)) {
        if (e.target && typeof e.target.getBoundingClientRect === 'function') {
          const rect = e.target.getBoundingClientRect();
          x = rect.left + rect.width / 2;
          y = rect.top + rect.height / 2;
        } else {
          x = window.innerWidth / 2;
          y = window.innerHeight / 2;
        }
      }

      const now = performance.now();
      const newSparks = Array.from({ length: sparkCount }, (_, i) => ({
        x,
        y,
        angle: (2 * Math.PI * i) / sparkCount,
        startTime: now,
        color: sparkColor,
      }));

      const wasEmpty = sparksRef.current.length === 0;
      sparksRef.current.push(...newSparks);

      if (wasEmpty) {
        requestAnimationFrame(draw);
      }
    },
    [draw, sparkColor, sparkCount]
  );

  useEffect(() => {
    window.addEventListener('click', handleClick, { capture: true, passive: true });
    return () => {
      window.removeEventListener('click', handleClick, { capture: true });
    };
  }, [handleClick]);

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh' }}>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 9999,
        }}
      />
      {children}
    </div>
  );
};

export default ClickSpark;
