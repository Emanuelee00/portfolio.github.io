let _lang = 'en';
const _listeners = [];

const STRINGS = {
  en: {
    hint_navigate:  'Arrow keys = sail · get close to an island',
    hint_dock:      name => `SPACE = land on ${name}`,
    hint_island:    'Arrow keys = walk · SPACE = back to boat',
    panel_tag:      'PROJECT',
    btn_github:     'Open on GitHub',
    lang_btn:       'IT',
  },
  it: {
    hint_navigate:  'Frecce = naviga · avvicinati a un\'isola',
    hint_dock:      name => `SPAZIO = sbarca su ${name}`,
    hint_island:    'Frecce = cammina · SPAZIO = risali in barca',
    panel_tag:      'PROGETTO',
    btn_github:     'Apri su GitHub',
    lang_btn:       'EN',
  },
};

export function t(key, ...args) {
  const val = (STRINGS[_lang] ?? STRINGS.en)[key] ?? STRINGS.en[key];
  return typeof val === 'function' ? val(...args) : (val ?? key);
}

export function getLang()     { return _lang; }
export function onLangChange(fn) { _listeners.push(fn); }

export function setLang(lang) {
  _lang = lang;
  _listeners.forEach(fn => fn(lang));
}

export function toggleLang() {
  setLang(_lang === 'en' ? 'it' : 'en');
}
