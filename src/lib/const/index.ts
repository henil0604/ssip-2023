export let LanguagesMap = {
    'Auto Detect': 'auto',
    'English': 'eng',
    'Gujarati': 'guj'
} as const

export type LanguagesInHumanReadableKeys = keyof typeof LanguagesMap
export type LanguagesInCodeKeys = typeof LanguagesMap[LanguagesInHumanReadableKeys]