import _ from 'lodash-es';

export const LanguageMap = {
	English: 'en',
	Gujarati: 'gu'
} as const;

export type LanguagesInHumanReadableKeys = keyof typeof LanguageMap;
export type LanguagesInCodeKeys = (typeof LanguageMap)[LanguagesInHumanReadableKeys];

export const ResponseCodeMap = {
	SUCCESS: 'B001',
	UNKNOWN_ERROR: 'B002'
} as const;
