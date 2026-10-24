import os

icons = {
    'python.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <defs>
    <linearGradient id="pyBlue" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#387EB8"/>
      <stop offset="100%" stop-color="#275E8C"/>
    </linearGradient>
    <linearGradient id="pyYellow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE052"/>
      <stop offset="100%" stop-color="#FFC324"/>
    </linearGradient>
  </defs>
  <path fill="url(#pyBlue)" d="M63.6 5.8c-26.6 0-25 11.5-25 11.5l.1 11.9h25.6v3.6H29.1c-16.1 0-23.3 9.4-23.3 23.3 0 13.9 6.8 23.4 20.9 23.4h7.5V67.8c0-9.8 8.4-17.9 18.2-17.9h25.4V31c0-14.7-12.7-25.2-34.2-25.2zm-12.7 7.6c2.5 0 4.5 2 4.5 4.5s-2 4.5-4.5 4.5-4.5-2-4.5-4.5 2-4.5 4.5-4.5z"/>
  <path fill="url(#pyYellow)" d="M64.4 122.2c26.6 0 25-11.5 25-11.5l-.1-11.9H63.7v-3.6h35.2c16.1 0 23.3-9.4 23.3-23.3 0-13.9-6.8-23.4-20.9-23.4h-7.5v11.7c0 9.8-8.4 17.9-18.2 17.9H30.2V97c0 14.7 12.7 25.2 34.2 25.2zm12.7-7.6c-2.5 0-4.5-2-4.5-4.5s2-4.5 4.5-4.5 4.5 2 4.5 4.5-2 4.5-4.5 4.5z"/>
</svg>''',

    'antigravity.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <defs>
    <linearGradient id="agGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8B5CF6"/>
      <stop offset="50%" stop-color="#06B6D4"/>
      <stop offset="100%" stop-color="#3B82F6"/>
    </linearGradient>
    <radialGradient id="agCore" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="40%" stop-color="#38BDF8"/>
      <stop offset="100%" stop-color="#1E1B4B"/>
    </radialGradient>
    <filter id="agGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <circle cx="64" cy="64" r="56" fill="#0B0F19" stroke="url(#agGrad)" stroke-width="4"/>
  <ellipse cx="64" cy="64" rx="44" ry="16" fill="none" stroke="#06B6D4" stroke-width="3" transform="rotate(-30 64 64)" stroke-dasharray="8 4" opacity="0.9"/>
  <ellipse cx="64" cy="64" rx="44" ry="16" fill="none" stroke="#8B5CF6" stroke-width="3" transform="rotate(35 64 64)" stroke-dasharray="8 4" opacity="0.9"/>
  <circle cx="64" cy="64" r="22" fill="url(#agCore)" filter="url(#agGlow)"/>
  <polygon points="64,48 76,72 52,72" fill="#FFFFFF" opacity="0.9"/>
</svg>''',

    'fastapi.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <defs>
    <linearGradient id="fastGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#009688"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>
  </defs>
  <circle cx="64" cy="64" r="56" fill="url(#fastGrad)"/>
  <path d="M68 22 L32 72 L62 72 L60 106 L96 56 L66 56 Z" fill="#FFFFFF"/>
</svg>''',

    'supabase.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <defs>
    <linearGradient id="supaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3ECF8E"/>
      <stop offset="100%" stop-color="#10B981"/>
    </linearGradient>
  </defs>
  <path d="M69.8 11.2C67.4 8.2 62.6 9.8 62.4 13.7L59.6 62.4H24.3C19.7 62.4 17.2 67.8 20.3 70.9L58.2 116.8C60.6 119.8 65.4 118.2 65.6 114.3L68.4 65.6H103.7C108.3 65.6 110.8 60.2 107.7 57.1L69.8 11.2Z" fill="url(#supaGrad)"/>
</svg>''',

    'render.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <defs>
    <linearGradient id="renderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00E599"/>
      <stop offset="100%" stop-color="#00A3FF"/>
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="28" fill="#14151a"/>
  <path d="M38 30 C38 30 60 30 74 30 C88 30 96 38 96 52 C96 64 88 70 76 72 L98 98 H78 L60 74 H52 V98 H38 Z M52 46 V60 H72 C78 60 82 57 82 53 C82 49 78 46 72 46 Z" fill="url(#renderGrad)"/>
</svg>''',

    'vercel.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <rect width="128" height="128" rx="28" fill="#000000"/>
  <polygon points="64,28 104,98 24,98" fill="#FFFFFF"/>
</svg>''',

    'railway.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <rect width="128" height="128" rx="28" fill="#0B0D0E"/>
  <path d="M32 36 H96 V52 H32 Z M32 58 H96 V74 H32 Z M32 80 H96 V92 H32 Z" fill="#E93D82" opacity="0.3"/>
  <path d="M34 38 C34 38 60 38 74 38 C86 38 94 46 94 56 C94 66 86 72 74 74 L96 94 H78 L60 76 H48 V94 H34 Z M48 50 V62 H68 C74 62 78 59 78 56 C78 53 74 50 68 50 Z" fill="#FFFFFF"/>
  <circle cx="96" cy="34" r="7" fill="#E93D82"/>
</svg>''',

    'whisper.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <defs>
    <linearGradient id="whisperGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10A37F"/>
      <stop offset="100%" stop-color="#6EE7B7"/>
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="28" fill="#061E17" stroke="#10A37F" stroke-width="3"/>
  <line x1="28" y1="52" x2="28" y2="76" stroke="url(#whisperGrad)" stroke-width="8" stroke-linecap="round"/>
  <line x1="46" y1="36" x2="46" y2="92" stroke="url(#whisperGrad)" stroke-width="8" stroke-linecap="round"/>
  <line x1="64" y1="20" x2="64" y2="108" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round"/>
  <line x1="82" y1="36" x2="82" y2="92" stroke="url(#whisperGrad)" stroke-width="8" stroke-linecap="round"/>
  <line x1="100" y1="52" x2="100" y2="76" stroke="url(#whisperGrad)" stroke-width="8" stroke-linecap="round"/>
</svg>''',

    'pytorch.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <circle cx="64" cy="64" r="56" fill="#1C1917"/>
  <path d="M68 28 L78 38 C60 52 50 68 50 82 C50 96 62 104 74 104 C88 104 98 94 98 80 C98 62 82 46 68 28 Z" fill="#EE4C2C"/>
  <circle cx="86" cy="44" r="6" fill="#EE4C2C"/>
</svg>'''
}

out_dir = r'frontend\assets\icons'
os.makedirs(out_dir, exist_ok=True)
for name, content in icons.items():
    with open(os.path.join(out_dir, name), 'w', encoding='utf-8') as f:
        f.write(content.strip())

print(f'Successfully generated {len(icons)} SVG icons!')
