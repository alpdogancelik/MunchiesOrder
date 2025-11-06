import { useState, useCallback } from 'react';

export type Language = 'tr' | 'en';

export function useLanguage(initial: Language = 'tr') {
    const [lang, setLang] = useState<Language>(initial);
    const toggle = useCallback(() => setLang((l) => (l === 'tr' ? 'en' : 'tr')), []);
    return { lang, setLang, toggle } as const;
}
