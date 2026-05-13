const iconProps = {
  fill: "none",
  viewBox: "0 0 24 24",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

export default function UiIcon({ name, className }) {
  const icons = {
    home: (
      <path d="M3 10.5 12 4l9 6.5M5.5 9.5V20h13V9.5" />
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 4.5 4.5" />
      </>
    ),
    activity: (
      <path d="M4 12h3l2.4-5 4.2 10 2.6-5H20" />
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 19c1.7-3.2 4-4.8 7-4.8s5.3 1.6 7 4.8" />
      </>
    ),
    chevronDown: (
      <path d="m7 10 5 5 5-5" />
    ),
    location: (
      <>
        <path d="M12 20s6-5.5 6-10a6 6 0 1 0-12 0c0 4.5 6 10 6 10Z" />
        <circle cx="12" cy="10" r="2.2" />
      </>
    ),
    calendar: (
      <>
        <path d="M7 3.8v3.4M17 3.8v3.4M4 8.5h16" />
        <rect x="4" y="5.5" width="16" height="14.5" rx="2.5" />
      </>
    ),
    spark: (
      <path d="M12 3.5 13.8 8l4.7 1.8-4.7 1.9-1.8 4.8-1.9-4.8L5.5 9.8 10.1 8 12 3.5Z" />
    ),
    heart: (
      <path d="M12 20.5s-7-4.3-7-10a4.2 4.2 0 0 1 7-3 4.2 4.2 0 0 1 7 3c0 5.7-7 10-7 10Z" />
    ),
    comment: (
      <path d="M5 18.2V6.8A1.8 1.8 0 0 1 6.8 5h10.4A1.8 1.8 0 0 1 19 6.8v7.4A1.8 1.8 0 0 1 17.2 16H9l-4 2.2Z" />
    ),
    share: (
      <>
        <circle cx="18" cy="5.5" r="2.5" />
        <circle cx="6" cy="12" r="2.5" />
        <circle cx="18" cy="18.5" r="2.5" />
        <path d="m8.2 11 7.4-4.2M8.2 13l7.4 4.2" />
      </>
    ),
    dumbbell: (
      <>
        <path d="M9 9v6M15 9v6M7 7v10M17 7v10M4.5 10v4M19.5 10v4M7 12h10" />
      </>
    ),
    soccer: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="m12 8.2 2.6 1.8-1 3h-3.2l-1-3L12 8.2Z" />
      </>
    ),
    basketball: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 3.5v17M3.5 12h17M6.8 6.8c2.4 2.4 2.4 8 0 10.4M17.2 6.8c-2.4 2.4-2.4 8 0 10.4" />
      </>
    ),
    badminton: (
      <>
        <path d="m7 8 6 6M14 7l3 3M8.5 16.5l-2 2" />
        <path d="M6.8 18.2c1.3-1.3 2-2.1 2.7-2.8M13 7l4.3-2" />
      </>
    ),
    mountain: (
      <path d="m3.5 18 5.4-8 3.2 4.6 2.5-3.6 5.9 7H3.5Z" />
    ),
    bike: (
      <>
        <circle cx="6.5" cy="16" r="3.2" />
        <circle cx="17.5" cy="16" r="3.2" />
        <path d="M10 16h4.5l-3.3-6H8.7M13.7 10H17l-1.5 2.5" />
      </>
    ),
    yoga: (
      <>
        <circle cx="12" cy="6.5" r="2.2" />
        <path d="M8.5 20c1.4-3.4 2.3-5.2 3.5-7.1M15.5 20c-1.1-3.2-1.8-5.1-3.5-7.1M7.5 12.5h9" />
      </>
    ),
    tennis: (
      <>
        <path d="M8 5.5a5.6 5.6 0 0 1 8 8" />
        <path d="M16 18.5a5.6 5.6 0 0 1-8-8" />
        <path d="m9 15 6-6" />
      </>
    ),
    running: (
      <>
        <circle cx="14" cy="5.5" r="2.2" />
        <path d="m10 20 2.2-5.2 2.8-2.3 2 2.4M9.5 12l3.4-1.3 2-3.2M12.2 9.8 9 9" />
      </>
    ),
    arrowRight: (
      <path d="M5 12h14M13 6l6 6-6 6" />
    ),
  };

  return (
    <svg className={className} {...iconProps}>
      {icons[name] ?? icons.spark}
    </svg>
  );
}
