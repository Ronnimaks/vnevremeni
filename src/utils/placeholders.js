export const getSvgPlaceholder = (title = "ВНЕ ВРЕМЕНИ", subtitle = "Литературный Клуб", width = 800, height = 600) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#141416"/>
        <stop offset="100%" stop-color="#1f1f24"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#bg)"/>
    <circle cx="${width/2}" cy="${height/2}" r="${Math.min(width, height)/3}" fill="#c8a97e" opacity="0.06"/>
    <rect x="20" y="20" width="${width-40}" height="${height-40}" fill="none" stroke="#c8a97e" stroke-opacity="0.15" stroke-width="2" rx="10"/>
    <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" fill="#c8a97e" font-family="Georgia, serif" font-size="${Math.max(16, width/25)}" font-weight="bold" letter-spacing="3">${title}</text>
    <text x="50%" y="58%" dominant-baseline="middle" text-anchor="middle" fill="#888888" font-family="sans-serif" font-size="${Math.max(12, width/40)}" letter-spacing="2">${subtitle}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};
