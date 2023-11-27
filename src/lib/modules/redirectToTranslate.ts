import { goto } from "$app/navigation";
import type { LanguagesInCodeKeys } from "$lib/const";

export function redirectToTranslate(
    input: string,
    sourceLanguage: LanguagesInCodeKeys,
    targetLanguage: LanguagesInCodeKeys
) {
    goto(`/translator/#${sourceLanguage}/${targetLanguage}/${encodeURIComponent(input)}`, {
        replaceState: true,
        noScroll: true,
        keepFocus: true
    });
}