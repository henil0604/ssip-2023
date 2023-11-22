import { GoogleLanguageCodeToInternationalLanguageCode, type LanguagesInCodeKeys } from "$lib/const";
import { tesseractWorker } from "$lib/store";
import { get } from "svelte/store";
import { createWorker } from "tesseract.js";

function getInternationalCode(lang: keyof typeof GoogleLanguageCodeToInternationalLanguageCode) {
    return GoogleLanguageCodeToInternationalLanguageCode[lang]
}

type ProgressCodes = 'CHECKING_FILE' | 'GETTING_WORKER' | 'CREATING_WORKER' | 'INITIALIZING_WORKER' | 'RECOGNIZING' | "PARSING"
export async function extractTextFromImageFile(file: File, lang: LanguagesInCodeKeys, onProgress?: (data: { code: ProgressCodes }) => unknown) {
    console.log("file?", file);

    onProgress?.({
        code: 'CHECKING_FILE'
    })

    let ocrLanguage = getInternationalCode(lang as keyof typeof GoogleLanguageCodeToInternationalLanguageCode)

    if (!file.type.startsWith('image')) {
        return {
            code: "UNSUPPORTED_FILE"
        } as const
    }

    onProgress?.({
        code: 'GETTING_WORKER'
    })

    let worker = get(tesseractWorker);


    if (!worker) {
        onProgress?.({
            code: 'CREATING_WORKER'
        })
        worker = await createWorker(ocrLanguage)
    }


    onProgress?.({
        code: 'INITIALIZING_WORKER'
    })
    await worker.reinitialize(ocrLanguage);


    onProgress?.({
        code: 'RECOGNIZING'
    })
    const response = await worker.recognize(file)

    return {
        code: 'DONE',
        data: response.data.text,
    } as const
}