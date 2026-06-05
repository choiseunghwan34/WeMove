import { useEffect, useState } from "react";

const INITIAL_POINT = { x: 0, y: 0, visible: false };

export default function AuthCursorGlow({ styles }) {
  const [pointer, setPointer] = useState(INITIAL_POINT);

  useEffect(() => {
    let frameId = 0;

    const updatePointer = (x, y, visible) => {
      cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        setPointer({ x, y, visible });
      });
    };

    const handleMove = (event) => {
      updatePointer(event.clientX, event.clientY, true);
    };

    const handleLeave = () => {
      setPointer((current) => ({ ...current, visible: false }));
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

  const sharedStyle = {
    "--cursor-x": `${pointer.x}px`,
    "--cursor-y": `${pointer.y}px`,
    opacity: pointer.visible ? 1 : 0,
  };

  return (
    <div className={styles.cursorGlowLayer} aria-hidden="true">
      <div className={styles.cursorAura} style={sharedStyle} />
      <div className={styles.cursorHalo} style={sharedStyle} />
      <div className={styles.cursorCore} style={sharedStyle} />
    </div>
  );
}
