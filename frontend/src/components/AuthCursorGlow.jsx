import { useEffect, useState } from "react";

const LEAF_SYMBOL = "\uD83C\uDF3F";
const TRAIL_COUNT = 3;

const buildTrail = () =>
  Array.from({ length: TRAIL_COUNT }, (_, index) => ({
    id: index,
    x: 0,
    y: 0,
    scale: 1 - index * 0.12,
    rotation: -10 + index * 8,
    opacity: 0,
  }));

const isInteractiveTarget = (target) => {
  if (!(target instanceof Element)) {
    return false;
  }

  const clickable = target.closest(
    'a, button, [role="button"], input, select, textarea, summary, label',
  );

  if (clickable) {
    return true;
  }

  return window.getComputedStyle(target).cursor === "pointer";
};

export default function AuthCursorGlow({ styles, leaf = LEAF_SYMBOL }) {
  const [trail, setTrail] = useState(buildTrail);

  useEffect(() => {
    let frameId = 0;
    let hoverScale = 1;
    let visible = false;
    const target = { x: 0, y: 0 };
    let nodes = buildTrail();

    const animate = () => {
      let leadX = target.x;
      let leadY = target.y;

      nodes = nodes.map((item, index) => {
        const followStrength = index === 0 ? 0.19 : 0.16 - index * 0.02;
        const nextX = item.x + (leadX - item.x) * followStrength;
        const nextY = item.y + (leadY - item.y) * followStrength;

        leadX = nextX - 6;
        leadY = nextY + 6;

        return {
          ...item,
          x: nextX,
          y: nextY,
          scale: (1 - index * 0.12) * hoverScale,
          rotation:
            -16 + index * 9 + Math.sin((nextX + nextY) * 0.012 + index) * 8,
          opacity: visible ? 0.9 - index * 0.22 : 0,
        };
      });

      setTrail(nodes);
      frameId = window.requestAnimationFrame(animate);
    };

    const handlePointerMove = (event) => {
      target.x = event.clientX + 10;
      target.y = event.clientY + 12;
      hoverScale = isInteractiveTarget(event.target) ? 1.12 : 1;
      visible = true;
    };

    const hideTrail = () => {
      visible = false;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerdown", handlePointerMove);
    window.addEventListener("pointerleave", hideTrail);
    window.addEventListener("blur", hideTrail);

    frameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerMove);
      window.removeEventListener("pointerleave", hideTrail);
      window.removeEventListener("blur", hideTrail);
    };
  }, []);

  return (
    <div className={styles.cursorGlowLayer} aria-hidden="true">
      {trail.map((item, index) => (
        <span
          key={item.id}
          className={styles.cursorLeaf}
          style={{
            "--leaf-x": `${item.x}px`,
            "--leaf-y": `${item.y}px`,
            "--leaf-rotation": `${item.rotation}deg`,
            "--leaf-scale": item.scale,
            opacity: item.opacity,
            zIndex: TRAIL_COUNT - index,
          }}
        >
          <span className={styles.cursorLeafIcon}>{leaf}</span>
        </span>
      ))}
    </div>
  );
}
