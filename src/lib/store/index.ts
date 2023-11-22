import { writable } from "svelte/store";
import type Tesseract from "tesseract.js";

export const tesseractWorker = writable<Tesseract.Worker | null>(null);