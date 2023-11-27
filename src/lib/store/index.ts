import { browser } from "$app/environment";
import { trpc } from "$lib/trpc/client";
import { writable } from "svelte/store";
import type Tesseract from "tesseract.js";

export const tesseractWorker = writable<Tesseract.Worker | null>(null);


interface Bookmark {
    input: string;
    output: string;
    sourceLanguage: string;
    targetLanguage: string;
    id: string;
    historyId: string;
}
export const bookmarks = writable<Bookmark[]>([]);
export async function fetchBookmarks() {
    if (!browser) return;

    const bookmarksResponse = await trpc().getUserBookmarks.query();

    bookmarks.set(bookmarksResponse.map((e) => {
        return {
            id: e.id,
            input: e.input,
            output: e.output,
            sourceLanguage: e.sourceLanguage,
            targetLanguage: e.targetLanguage,
            historyId: e.historyId
        };
    }));
}

export const input = writable("");