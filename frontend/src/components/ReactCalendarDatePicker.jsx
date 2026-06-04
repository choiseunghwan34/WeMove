import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import styles from "../styles/ReactCalendarDatePicker.module.css";

const WEEKDAY_LABELS = [
  "\uC77C",
  "\uC6D4",
  "\uD654",
  "\uC218",
  "\uBAA9",
  "\uAE08",
  "\uD1A0",
];

const pad2 = (value) => String(value).padStart(2, "0");

const toDateKey = (date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

const parseDateKey = (value) => {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};

export default function ReactCalendarDatePicker({
  value = "",
  onChange,
  name,
  min,
  max,
  placeholder = "\uB0A0\uC9DC \uC120\uD0DD",
  className = "",
  buttonClassName = "",
  inputRef,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [popoverStyle, setPopoverStyle] = useState({});
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const selectedDate = parseDateKey(value);

  const setRefs = (node) => {
    triggerRef.current = node;
    if (typeof inputRef === "function") {
      inputRef(node);
    } else if (inputRef) {
      inputRef.current = node;
    }
  };

  const updatePopoverPosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const width = Math.min(300, window.innerWidth - 24);
    const left = Math.min(
      Math.max(12, rect.left),
      Math.max(12, window.innerWidth - width - 12),
    );
    const top = Math.min(rect.bottom + 8, window.innerHeight - 340);

    setPopoverStyle({
      top: `${Math.max(12, top)}px`,
      left: `${left}px`,
      width: `${width}px`,
    });
  };

  useEffect(() => {
    if (!open) return undefined;

    const handleMouseDown = (event) => {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target) &&
        !event.target.closest("[data-calendar-popover='true']")
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", updatePopoverPosition);
    window.addEventListener("scroll", updatePopoverPosition, true);
    updatePopoverPosition();

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", updatePopoverPosition);
      window.removeEventListener("scroll", updatePopoverPosition, true);
    };
  }, [open]);

  const emitChange = (date) => {
    const nextValue = toDateKey(date);
    onChange?.({
      target: { name, value: nextValue },
      currentTarget: { name, value: nextValue },
    });
    setOpen(false);
  };

  return (
    <div
      ref={rootRef}
      className={[styles.root, className].filter(Boolean).join(" ")}
    >
      <button
        ref={setRefs}
        type="button"
        className={[styles.trigger, buttonClassName].filter(Boolean).join(" ")}
        onClick={() => !disabled && setOpen((current) => !current)}
        disabled={disabled}
      >
        <span className={value ? styles.valueText : styles.placeholderText}>
          {value || placeholder}
        </span>
      </button>

      {open &&
        createPortal(
          <div
            className={styles.popover}
            data-calendar-popover="true"
            style={popoverStyle}
          >
            <Calendar
              value={selectedDate}
              onChange={emitChange}
              locale="ko-KR"
              calendarType="gregory"
              minDate={parseDateKey(min)}
              maxDate={parseDateKey(max)}
              formatDay={(_, date) => String(date.getDate())}
              formatShortWeekday={(_, date) => WEEKDAY_LABELS[date.getDay()]}
            />
          </div>,
          document.body,
        )}
    </div>
  );
}
