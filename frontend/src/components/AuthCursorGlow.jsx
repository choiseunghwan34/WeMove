import { useEffect, useState } from "react";

const INITIAL_POINT = { x: 0, y: 0, visible: false };
const TRAIL_COUNT = 3;

const LEAF_ROTATIONS = [-18, 9, -6];

function LeafIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M19.4 4.6c-4.5-.8-8.2.4-10.9 3.1-3.8 3.8-3.5 8.9-3.1 11 .2.9 1 1.6 1.9 1.8 2 .4 7.2.7 11-3.1 2.7-2.7 3.8-6.4 3.1-10.9-.1-.9-.8-1.6-1.7-1.9l-.3-.1Zm-9.7 11.9 5.9-5.9 1.4 1.4-5.9 5.9-1.4-1.4Z" />
    </svg>
  );
}

export default function AuthCursorGlow({ styles }) {
  const [trail, setTrail] = useState(
    Array.from({ length: TRAIL_COUNT }, () => INITIAL_POINT),
  );

  useEffect(() => {
    let frameId = 0;

    const updateTrail = (x, y, visible) => {
      cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        setTrail((current) => {
          const head = { x, y, visible };
          return [head, ...current.slice(0, TRAIL_COUNT - 1)];
        });
      });
    };

    const handleMove = (event) => {
      updateTrail(event.clientX, event.clientY, true);
    };

    const handleLeave = () => {
      setTrail((current) => current.map((item) => ({ ...item, visible: false })));
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerdown", handleMove);
    window.addEventListener("pointerleave", handleLeave);
    window.addEventListener("blur", handleLeave);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerdown", handleMove);
      window.removeEventListener("pointerleave", handleLeave);
      window.removeEventListener("blur", handleLeave);
    };
  }, []);

  return (
    <div className={styles.cursorGlowLayer} aria-hidden="true">
      {trail.map((point, index) => (
        <div
          key={`leaf-${index}`}
          className={styles.cursorLeaf}
          style={{
            "--cursor-x": `${point.x}px`,
            "--cursor-y": `${point.y}px`,
            "--leaf-rotation": `${LEAF_ROTATIONS[index] || 0}deg`,
            opacity: point.visible ? 1 - index * 0.22 : 0,
          }}
        >
          <LeafIcon className={styles.cursorLeafIcon} />
        </div>
      ))}
    </div>
  );
}
