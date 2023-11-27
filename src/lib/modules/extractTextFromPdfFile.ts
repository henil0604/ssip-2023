import { GoogleLanguageCodeToInternationalLanguageCode, type LanguagesInCodeKeys } from "$lib/const";
import type { PDFDocumentProxy } from 'pdfjs-dist'
import { extractTextFromImageFile, type ProgressCodes as ImageExtractorProgressCodes } from "./extractTextFromImageFile";

type ProgressCodes = 'CHECKING_FILE' | 'READING_PDF' | 'LOADING_PDF' | 'TRANSFORMING_PDF' | 'RECOGNIZING' | ImageExtractorProgressCodes
type OnProgress = (data: { code: ProgressCodes, index?: number }) => unknown

export function readAsPdfFile(file: File): Promise<Uint8Array> {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.addEventListener("loadend", (event) =>
            resolve(new Uint8Array((event.target as FileReader).result as ArrayBuffer))
        );
        reader.readAsArrayBuffer(file);
    });
};

export async function loadAsPdfFile(file: ArrayBuffer): Promise<PDFDocumentProxy> {
    return window.pdfjsLib.getDocument({ data: file }).promise as Promise<PDFDocumentProxy>;
}

export async function convertToImage(pdf: any, onProgress?: OnProgress): Promise<string[]> {
    const container = document.getElementById("container");
    const images: string[] = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        onProgress?.({
            code: 'TRANSFORMING_PDF',
            index: pageNumber
        })
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 5 });

        const canvas = document.createElement("canvas");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (container) {
            container.appendChild(canvas);
        }

        await page.render({
            canvasContext: canvas.getContext("2d"),
            viewport: viewport,
        }).promise;

        images.push(canvas.toDataURL("image/png"));
    }

    return images;
};

function blobToFile(theBlob: Blob, fileName: string): File {
    const b: any = theBlob;
    //A Blob() is almost a File() - it's just missing the two properties below which we will add
    b.lastModifiedDate = new Date();
    b.name = fileName;

    //Cast to a File() type
    return theBlob as File;
}

export async function extractTextFromPdfFile(file: File, lang: LanguagesInCodeKeys, onProgress?: OnProgress) {
    console.log("file?", file);

    onProgress?.({
        code: 'CHECKING_FILE'
    })

    let ocrLanguage = GoogleLanguageCodeToInternationalLanguageCode[lang as keyof typeof GoogleLanguageCodeToInternationalLanguageCode]

    if (!file.type.includes('pdf')) {
        return {
            code: "UNSUPPORTED_FILE"
        } as const
    }

    let text: string[] = [];

    onProgress?.({
        code: 'READING_PDF'
    })
    const pdfRead = await readAsPdfFile(file)
    onProgress?.({
        code: 'LOADING_PDF'
    })
    const pdf = await loadAsPdfFile(pdfRead);
    onProgress?.({
        code: 'TRANSFORMING_PDF'
    })
    const images = await convertToImage(pdf, onProgress);

    for (let i = 0; i < images.length; i++) {
        const image = images[i];

        const blob = await (await fetch(image)).blob();
        const url = URL.createObjectURL(blob)
        console.log("url?", url)
        const imgFile = blobToFile(blob, `page-${i}-${file.name}`)

        const response = await extractTextFromImageFile(imgFile, lang, ({ code }) => {
            onProgress?.({
                code,
                index: i + 1
            })
        })

        text.push(response.data || '');
    }

    return {
        code: 'DONE',
        data: text
    } as const
}