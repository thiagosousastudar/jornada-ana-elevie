// Ícones de traço no estilo SF Symbols (24×24, herdam a cor do texto) — mesmos do protótipo.
export const ICONS = {
  house: '<path d="M3.5 10.5 12 3.5l8.5 7"/><path d="M5.5 9v10.5a1 1 0 0 0 1 1H10v-6h4v6h3.5a1 1 0 0 0 1-1V9"/>',
  chart: '<path d="M5 20v-6"/><path d="M10 20V9"/><path d="M15 20v-9"/><path d="M20 20V5"/>',
  bubble: '<path d="M20.5 11.5a8 8 0 0 1-11.7 7.1L4 20l1.4-4.3A8 8 0 1 1 20.5 11.5Z"/>',
  tray: '<rect x="3.5" y="5" width="17" height="14" rx="3"/><path d="m4 7 8 6 8-6"/>',
  bell: '<path d="M18 15.5V11a6 6 0 1 0-12 0v4.5L4.5 17.5h15Z"/><path d="M10 20.5a2.2 2.2 0 0 0 4 0"/>',
  fork: '<path d="M7 3v7.5"/><path d="M4.5 3v4.5a2.5 2.5 0 0 0 5 0V3"/><path d="M7 10.5V21"/><path d="M17.5 21V3c-2.5 1.2-3.5 4-3.5 7.5 0 1.5.8 2.5 2 2.5h1.5"/>',
  walk: '<circle cx="13.5" cy="4.5" r="1.8"/><path d="m9.5 21 2.3-6.2 2.7 2.7V21"/><path d="M7 12.5 9.5 9l4-.5 2 3 2.5 1"/><path d="m11.8 14.8-.8-5.8"/>',
  leaf: '<path d="M5 19.5C5 10.5 10.5 5 19.5 4.5 19.5 13.5 14 19 5 19.5Z"/><path d="M5 19.5 13 11.5"/>',
  share: '<path d="M12 3.5v11"/><path d="m8 7.5 4-4 4 4"/><path d="M8.5 10.5H7a2 2 0 0 0-2 2V19a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6.5a2 2 0 0 0-2-2h-1.5"/>',
  camera: '<path d="M4 8.5A2 2 0 0 1 6 6.5h1.8l1.5-2h5.4l1.5 2H18a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"/><circle cx="12" cy="12.5" r="3.5"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
  chevron: '<path d="m9.5 5.5 6.5 6.5-6.5 6.5"/>',
  back: '<path d="M15 5.5 8.5 12l6.5 6.5"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  play: '<path d="M8 5.5v13l10.5-6.5Z" fill="currentColor"/>',
  grid: '<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>',
  photo: '<rect x="3.5" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m4 17 5-4.5 3.5 3 3-2.5 4.5 4"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 9.5h17"/><path d="M8 3v4"/><path d="M16 3v4"/>',
  download: '<path d="M12 4v11"/><path d="m7.5 10.5 4.5 4.5 4.5-4.5"/><path d="M5 19.5h14"/>',
  sparkle: '<path d="M12 3.5c.6 4.4 2.6 6.4 7 7-4.4.6-6.4 2.6-7 7-.6-4.4-2.6-6.4-7-7 4.4-.6 6.4-2.6 7-7Z"/>',
  eyeoff: '<path d="M3.5 3.5 20.5 20.5"/><path d="M10 6.2A9 9 0 0 1 21 12a12 12 0 0 1-2.4 3.2M6.2 7.4A11.5 11.5 0 0 0 3 12s3.3 6 9 6a8.5 8.5 0 0 0 3.6-.8"/>',
  warn: '<path d="M12 4 21 19.5H3Z"/><path d="M12 10v4"/><path d="M12 17v.01"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  person: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>',
};

export const ic = (name, cls) => `<svg class="i${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;

// Logo do Google, usado só no botão de entrar (guia de marca do Google).
export const GOOGLE_G = '<svg class="g-logo" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.9 6.1C12.5 13.6 17.8 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.6c0-1.6-.1-3.1-.4-4.6H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.7c4.3-4 6.9-9.9 6.9-17z"/><path fill="#FBBC05" d="M10.6 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.1.8-4.6l-7.9-6.1C1 16.6 0 20.2 0 24s1 7.4 2.7 10.7l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.3-8.5 2.3-6.2 0-11.5-4.1-13.4-9.9l-7.9 6.1C6.6 42.6 14.6 48 24 48z"/></svg>';
