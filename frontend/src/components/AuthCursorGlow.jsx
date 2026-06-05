import { useEffect, useState } from "react";

const INITIAL_POINT = { x: 0, y: 0, visible: false };

function LeafIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M19.4 4.6c-4.5-.8-8.2.4-10.9 3.1-3.8 3.8-3.5 8.9-3.1 11 .2.9 1 1.6 1.9 1.8 2 .4 7.2.7 11-3.1 2.7-2.7 3.8-6.4 3.1-10.9-.1-.9-.8-1.6-1.7-1.9l-.3-.1Zm-9.7 11.9 5.9-5.9 1.4 1.4-5.9 5.9-1.4-1.4Z" />
    </svg>
  );
}

export default function AuthCursorGlow({ styles }) {
  const [pointer, setPointer] = useState(INITIAL_POINT);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    let frameId = 0;

    const updatePointer = (x, y, visible) => {
      cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        setPointer({ x, y, visible });
      });
    };

    const updateHoverState = (target) => {
      if (!(target instanceof Element)) {
        setIsHovering(false);
        return;
      }

      const interactiveTarget = target.closest(
        'a, button, [role="button"], input, select, textarea, summary, label',
      );

      if (interactiveTarget) {
        setIsHovering(true);
        return;
      }

      const computedStyle = window.getComputedStyle(target);
      setIsHovering(computedStyle.cursor === "pointer");
    };

    const handleMove = (event) => {
      updatePointer(event.clientX, event.clientY, true);
      updateHoverState(event.target);
    };

    const handleLeave = () => {
      setPointer((current) => ({ ...current, visible: false }));
      setIsHovering(false);
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
      <div
        className={styles.cursorLeaf}
        style={{
          "--cursor-x": `${pointer.x}px`,
          "--cursor-y": `${pointer.y}px`,
          "--leaf-scale": isHovering ? 1.18 : 1,
          opacity: pointer.visible ? 0.92 : 0,
        }}
      >
        <LeafIcon className={styles.cursorLeafIcon} />
      </div>
    </div>
  );
}
