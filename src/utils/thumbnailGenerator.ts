/**
 * High-Impact YouTube Thumbnail Generator
 * Generates hermetic, 16:9 4K HDR YouTube clickbait thumbnails as pure SVG Data URIs.
 * Zero external network requests, zero rate-limit/quota errors, works seamlessly offline and in sandboxes.
 */

export interface ThumbnailOptions {
  topic: string;
  hook?: string;
  niche?: string;
  prompt?: string;
  viralScore?: number;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function splitIntoLines(text: string, maxCharsPerLine = 24): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
    if (lines.length >= 2) break;
  }
  if (currentLine && lines.length < 3) {
    lines.push(currentLine);
  }

  return lines.length > 0 ? lines : [text.slice(0, 30)];
}

export function generateThumbnailSvg(options: ThumbnailOptions): string {
  const {
    topic = 'Viral Breakthrough',
    hook = 'You won\'t believe this happened...',
    niche = 'AI & Robotics',
    viralScore = 96
  } = options;

  const cleanTopic = topic.replace(/#Shorts/gi, '').trim();
  const lines = splitIntoLines(cleanTopic, 22);
  const escapedHook = escapeXml(hook.slice(0, 65));

  // Determine theme styling based on niche
  let bgGradientStart = '#080d1a';
  let bgGradientEnd = '#020617';
  let accentColor1 = '#06b6d4'; // Cyan
  let accentColor2 = '#8b5cf6'; // Violet
  let accentColor3 = '#3b82f6'; // Blue
  let highlightWordColor = '#facc15'; // Electric Yellow
  let graphicTheme = 'tech';

  if (niche.toLowerCase().includes('space') || niche.toLowerCase().includes('astronomy')) {
    bgGradientStart = '#110c24';
    bgGradientEnd = '#02020a';
    accentColor1 = '#ec4899'; // Magenta
    accentColor2 = '#6366f1'; // Indigo
    accentColor3 = '#38bdf8'; // Sky Blue
    highlightWordColor = '#38bdf8';
    graphicTheme = 'space';
  } else if (niche.toLowerCase().includes('philosophy') || niche.toLowerCase().includes('stoic')) {
    bgGradientStart = '#1c1308';
    bgGradientEnd = '#0a0703';
    accentColor1 = '#f59e0b'; // Amber Gold
    accentColor2 = '#ea580c'; // Bronze
    accentColor3 = '#d97706'; // Ochre
    highlightWordColor = '#fbbf24';
    graphicTheme = 'stoic';
  } else if (niche.toLowerCase().includes('science') || niche.toLowerCase().includes('bio')) {
    bgGradientStart = '#031a14';
    bgGradientEnd = '#010a08';
    accentColor1 = '#10b981'; // Emerald
    accentColor2 = '#06b6d4'; // Cyan
    accentColor3 = '#14b8a6'; // Teal
    highlightWordColor = '#34d399';
    graphicTheme = 'bio';
  }

  // Generate SVG Graphic Element
  let visualElementsSvg = '';
  if (graphicTheme === 'space') {
    visualElementsSvg = `
      <!-- Deep Cosmic Nebula & Planetary Artwork -->
      <circle cx="1020" cy="360" r="280" fill="url(#orbGrad)" opacity="0.3" />
      <!-- Gas Giant Planet -->
      <circle cx="1020" cy="360" r="160" fill="url(#planetGrad)" filter="url(#dropGlow)" />
      <!-- Planetary Ring System -->
      <ellipse cx="1020" cy="360" rx="270" ry="60" fill="none" stroke="${accentColor1}" stroke-width="8" opacity="0.85" transform="rotate(-25 1020 360)" />
      <ellipse cx="1020" cy="360" rx="240" ry="45" fill="none" stroke="${accentColor3}" stroke-width="3" opacity="0.6" transform="rotate(-25 1020 360)" />
      <!-- Star Flares -->
      <path d="M 850 200 L 860 210 L 850 220 L 840 210 Z" fill="#ffffff" filter="url(#dropGlow)" />
      <path d="M 1150 480 L 1156 486 L 1150 492 L 1144 486 Z" fill="#ffffff" />
      <circle cx="780" cy="140" r="2.5" fill="#fff" opacity="0.8" />
      <circle cx="890" cy="110" r="1.5" fill="#fff" opacity="0.6" />
      <circle cx="940" cy="560" r="2" fill="#fff" opacity="0.9" />
      <circle cx="1180" cy="180" r="3" fill="#fff" opacity="0.9" />
      <circle cx="720" cy="460" r="2" fill="#fff" opacity="0.5" />
    `;
  } else if (graphicTheme === 'stoic') {
    visualElementsSvg = `
      <!-- Classical Geometry & Radiant Light Rays -->
      <circle cx="1020" cy="360" r="260" fill="url(#orbGrad)" opacity="0.35" />
      <!-- Radiating Sunburst Triangles -->
      <polygon points="1020,360 880,140 940,120" fill="${accentColor1}" opacity="0.25" />
      <polygon points="1020,360 1160,130 1100,110" fill="${accentColor1}" opacity="0.25" />
      <polygon points="1020,360 1240,320 1240,260" fill="${accentColor2}" opacity="0.2" />
      <polygon points="1020,360 800,320 800,260" fill="${accentColor2}" opacity="0.2" />
      <!-- Golden Sacred Arch / Monolith -->
      <rect x="940" y="210" width="160" height="300" rx="80" fill="url(#planetGrad)" stroke="${accentColor1}" stroke-width="4" filter="url(#dropGlow)" />
      <!-- Golden Core -->
      <circle cx="1020" cy="330" r="45" fill="${accentColor1}" opacity="0.9" filter="url(#dropGlow)" />
    `;
  } else if (graphicTheme === 'bio') {
    visualElementsSvg = `
      <!-- Bioluminescent Helix & Quantum Core -->
      <circle cx="1020" cy="360" r="260" fill="url(#orbGrad)" opacity="0.3" />
      <!-- Glowing Molecule Nodes -->
      <circle cx="1020" cy="240" r="32" fill="${accentColor1}" filter="url(#dropGlow)" />
      <circle cx="1120" cy="340" r="28" fill="${accentColor2}" filter="url(#dropGlow)" />
      <circle cx="920" cy="340" r="28" fill="${accentColor3}" filter="url(#dropGlow)" />
      <circle cx="1020" cy="460" r="36" fill="${accentColor1}" filter="url(#dropGlow)" />
      <!-- Connecting Energy Lattice -->
      <line x1="1020" y1="240" x2="1120" y2="340" stroke="#fff" stroke-width="4" opacity="0.8" />
      <line x1="1020" y1="240" x2="920" y2="340" stroke="#fff" stroke-width="4" opacity="0.8" />
      <line x1="1120" y1="340" x2="1020" y2="460" stroke="#fff" stroke-width="4" opacity="0.8" />
      <line x1="920" y1="340" x2="1020" y2="460" stroke="#fff" stroke-width="4" opacity="0.8" />
    `;
  } else {
    // Tech & AI (Default)
    visualElementsSvg = `
      <!-- Cybernetic Neural Processor Core -->
      <circle cx="1020" cy="360" r="260" fill="url(#orbGrad)" opacity="0.3" />
      <!-- Outer Hexagon Armor Ring -->
      <polygon points="1020,180 1170,270 1170,450 1020,540 870,450 870,270" fill="none" stroke="${accentColor1}" stroke-width="5" opacity="0.8" filter="url(#dropGlow)" />
      <!-- Concentric Tech Rings -->
      <circle cx="1020" cy="360" r="120" fill="none" stroke="${accentColor2}" stroke-width="3" stroke-dasharray="16, 8" opacity="0.7" />
      <circle cx="1020" cy="360" r="75" fill="url(#planetGrad)" filter="url(#dropGlow)" />
      <!-- Glowing Chip Core -->
      <rect x="990" y="330" width="60" height="60" rx="8" fill="#ffffff" filter="url(#dropGlow)" />
      <!-- Laser Data Conduits -->
      <line x1="780" y1="270" x2="870" y2="270" stroke="${accentColor1}" stroke-width="4" />
      <line x1="750" y1="450" x2="870" y2="450" stroke="${accentColor2}" stroke-width="4" />
      <line x1="1170" y1="270" x2="1240" y2="270" stroke="${accentColor1}" stroke-width="4" />
      <line x1="1170" y1="450" x2="1240" y2="450" stroke="${accentColor2}" stroke-width="4" />
    `;
  }

  // Build headline lines with impact
  let headlineSvg = '';
  lines.forEach((line, index) => {
    const yPos = 280 + index * 85;
    const isHighlight = index === 0 || index === lines.length - 1;
    const fill = isHighlight ? highlightWordColor : '#ffffff';
    headlineSvg += `
      <text 
        x="80" 
        y="${yPos}" 
        fill="${fill}" 
        font-family="system-ui, -apple-system, 'Impact', 'Montserrat', 'Arial Black', sans-serif" 
        font-size="74" 
        font-weight="900" 
        letter-spacing="-1px"
        filter="url(#heavyShadow)"
      >
        ${escapeXml(line.toUpperCase())}
      </text>
    `;
  });

  const rawSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720">
      <defs>
        <!-- Background Gradient -->
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${bgGradientStart}" />
          <stop offset="60%" stop-color="${bgGradientEnd}" />
          <stop offset="100%" stop-color="#000000" />
        </linearGradient>

        <!-- Accent Ambient Orb Gradient -->
        <radialGradient id="orbGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${accentColor1}" stop-opacity="0.9" />
          <stop offset="50%" stop-color="${accentColor2}" stop-opacity="0.5" />
          <stop offset="100%" stop-color="${bgGradientEnd}" stop-opacity="0" />
        </radialGradient>

        <!-- Planet/Core Gradient -->
        <linearGradient id="planetGrad" x1="20%" y1="20%" x2="80%" y2="80%">
          <stop offset="0%" stop-color="${accentColor1}" />
          <stop offset="70%" stop-color="${accentColor2}" />
          <stop offset="100%" stop-color="#020617" />
        </linearGradient>

        <!-- Flare Filter -->
        <filter id="dropGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="10" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <!-- Heavy Drop Shadow for YouTube CTR Text -->
        <filter id="heavyShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="4" dy="6" stdDeviation="6" flood-color="#000000" flood-opacity="0.95" />
        </filter>

        <!-- Subtitle Pill Shadow -->
        <filter id="pillShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="2" dy="4" stdDeviation="4" flood-color="#000000" flood-opacity="0.7" />
        </filter>

        <!-- Subtle Dot Grid Matrix -->
        <pattern id="dotGrid" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.5" fill="#ffffff" opacity="0.08" />
        </pattern>
      </defs>

      <!-- 1. Background Rect -->
      <rect width="1280" height="720" fill="url(#bgGrad)" />
      
      <!-- 2. Dot Matrix Texture -->
      <rect width="1280" height="720" fill="url(#dotGrid)" />

      <!-- 3. Ambient Lighting Beams -->
      <circle cx="200" cy="100" r="350" fill="${accentColor1}" opacity="0.12" filter="url(#dropGlow)" />
      <circle cx="1100" cy="600" r="400" fill="${accentColor2}" opacity="0.15" filter="url(#dropGlow)" />

      <!-- 4. Visual Graphic Elements on Right 50% -->
      ${visualElementsSvg}

      <!-- 5. Top Bar Badges -->
      <!-- Left: Virality Surge Badge -->
      <g filter="url(#pillShadow)">
        <rect x="80" y="70" width="230" height="52" rx="26" fill="#dc2626" />
        <rect x="82" y="72" width="226" height="48" rx="24" fill="#991b1b" stroke="#f87171" stroke-width="2" />
        <text x="110" y="104" fill="#ffffff" font-family="system-ui, sans-serif" font-size="19" font-weight="900" letter-spacing="1px">
          🔥 VIRAL ${viralScore}%
        </text>
      </g>

      <!-- Center: Niche Pill -->
      <g filter="url(#pillShadow)">
        <rect x="330" y="72" width="210" height="48" rx="24" fill="#0f172a" stroke="#334155" stroke-width="1.5" />
        <text x="355" y="103" fill="#cbd5e1" font-family="system-ui, sans-serif" font-size="16" font-weight="700">
          ${escapeXml(niche.toUpperCase().slice(0, 16))}
        </text>
      </g>

      <!-- Right: 4K UHD Quality Badge -->
      <g filter="url(#pillShadow)">
        <rect x="1050" y="70" width="150" height="50" rx="10" fill="#000000" stroke="${accentColor1}" stroke-width="2" />
        <text x="1075" y="102" fill="#ffffff" font-family="system-ui, sans-serif" font-size="18" font-weight="900" letter-spacing="0.5px">
          4K UHD
        </text>
      </g>

      <!-- 6. Main YouTube Clickbait Headline -->
      ${headlineSvg}

      <!-- 7. Bottom Viral Hook Pill (Under Headline) -->
      <g filter="url(#pillShadow)">
        <rect x="80" y="540" width="700" height="64" rx="16" fill="#000000" stroke="#facc15" stroke-width="2.5" opacity="0.9" />
        <text x="110" y="580" fill="#facc15" font-family="system-ui, sans-serif" font-size="22" font-weight="700" font-style="italic">
          "${escapedHook}"
        </text>
      </g>

      <!-- 8. Bottom-Right Duration & Channel Branding Pill -->
      <g filter="url(#pillShadow)">
        <rect x="1110" y="630" width="90" height="42" rx="8" fill="#000000" opacity="0.9" stroke="#ffffff" stroke-width="1.5" />
        <text x="1126" y="658" fill="#ffffff" font-family="system-ui, sans-serif" font-size="18" font-weight="800">
          0:58
        </text>
      </g>

      <!-- 9. Cinematic Vignette Border -->
      <rect width="1280" height="720" fill="none" stroke="#000000" stroke-width="14" opacity="0.6" />
    </svg>
  `;

  const minified = rawSvg.replace(/\s+/g, ' ').trim();
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(minified)}`;
}
