<script lang="ts">
	import LanguageSelectorHeader from '$lib/components/LanguageSelectorHeader.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import type { LanguagesInCodeKeys } from '$lib/const';
	import { extractTextFromPdfFile } from '$lib/modules/extractTextFromPdfFile';
	import { fileSelector } from '$lib/modules/fileSelector';
	import { redirectToTranslate } from '$lib/modules/redirectToTranslate';
	import Icon from '@iconify/svelte';
	import { toasts } from 'svelte-toasts';
	import { writable } from 'svelte/store';

	let sourceLanguage = writable<LanguagesInCodeKeys>('en');
	let targetLanguage = writable<LanguagesInCodeKeys>('gu');

	let processing = false;
	let processingStatus = '';

	async function handlePDF(file: File) {
		const ocrResponse = await extractTextFromPdfFile(file, $sourceLanguage, ({ code, index }) => {
			if (!index) {
				switch (code) {
					case 'CHECKING_FILE':
						processingStatus = 'Checking file';
						break;
					case 'READING_PDF':
						processingStatus = 'Reading PDF';
						break;
					case 'LOADING_PDF':
						processingStatus = 'Loading PDF';
						break;
					case 'TRANSFORMING_PDF':
						processingStatus = 'Transforming PDF';
						break;

					default:
						break;
				}
			}

			if (index) {
				switch (code) {
					case 'TRANSFORMING_PDF':
						processingStatus = `Transforming PDF (Page ${index})`;
						break;
					case 'CHECKING_FILE':
					case 'CREATING_WORKER':
					case 'INITIALIZING_WORKER':
					case 'GETTING_WORKER':
					case 'RECOGNIZING':
					case 'PARSING':
						processingStatus = `Recognizing (Page ${index})`;
						break;

					default:
						break;
				}
			}
		});

		console.log('ocrResponse?', ocrResponse);

		if (ocrResponse.code === 'UNSUPPORTED_FILE') {
			toasts.add({
				title: 'Oops!',
				description: 'Unsupported File',
				duration: 3000,
				type: 'error',
				theme: 'light'
			});
			processing = false;
			return;
		}

		if (ocrResponse.code === 'DONE') {
			processingStatus = 'Parsing...';
			let text = '';
			for (let i = 0; i < ocrResponse.data.length; i++) {
				let pageText = ocrResponse.data[i];
				pageText = pageText
					.replaceAll('\n\n', '[|[[ENTER]]|]')
					.replaceAll('\n', ' ')
					.replaceAll('[|[[ENTER]]|]', '\n\n');
				text += `[PAGE ${i + 1}]\n${pageText}\n\n`;
			}
			text = text.trimEnd();

			processingStatus = 'Redirecting...';
			redirectToTranslate(text, $sourceLanguage, $targetLanguage);
		}
	}

	async function handleText(file: File) {
		processingStatus = 'Extracting...';
		const fileText = await file.text();

		processingStatus = 'Redirecting...';
		redirectToTranslate(fileText, $sourceLanguage, $targetLanguage);
	}

	async function handleUpload() {
		const file = (await fileSelector({
			multiple: false
		})) as File | null;

		if (!file) {
			return;
		}
		console.log('file?', file);

		processing = true;

		if (file.type.includes('pdf')) {
			await handlePDF(file);
		}

		if (file.type.startsWith('text')) {
			await handleText(file);
		}

		processing = false;
	}
</script>

<div class="flex flex-col">
	<!-- header -->
	<LanguageSelectorHeader
		bind:sourceLanguage={$sourceLanguage}
		bind:targetLanguage={$targetLanguage}
	/>

	<div class="border shadow-md rounded p-4 py-32 flex justify-center items-center">
		<!--  -->
		<div class="flex flex-col items-center gap-2">
			{#if !processing}
				<div class="flex justify-center items-center gap-4">
					<Icon
						icon="grommet-icons:document-txt"
						class="text-theme-600 w-[60px] h-[60px] hover:scale-[1.2] transition-all"
					/>
					<Icon
						icon="carbon:document-pdf"
						class="text-theme-600 w-[70px] h-[70px] hover:scale-[1.2] transition-all"
					/>
				</div>
				<h1 class="text-2xl">Select file here</h1>
				<Button on:click={handleUpload} variant="default" size="lg" class="text-lg"
					>Upload from your computer</Button
				>
			{:else}
				<Icon icon="svg-spinners:blocks-wave" class="text-theme-600" width={100} />
				<h1 class="text-2xl">{processingStatus}</h1>
			{/if}
		</div>
	</div>
</div>
