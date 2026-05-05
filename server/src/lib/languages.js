export const LANGUAGE_NAMES = {
  en: 'English',
  de: 'German',
  fr: 'French',
  es: 'Spanish',
  tr: 'Turkish',
  ja: 'Japanese',
  pt: 'Portuguese',
  hi: 'Hindi',
  ko: 'Korean',
  it: 'Italian',
  nl: 'Dutch',
  sv: 'Swedish',
  ar: 'Arabic',
};

export function getLanguageName(code) {
  return LANGUAGE_NAMES[code] || 'English';
}
