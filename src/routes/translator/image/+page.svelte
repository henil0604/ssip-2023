<script lang="ts">
	import Dropzone from '$lib/components/Dropzone.svelte';
	import LanguageSelectorHeader from '$lib/components/LanguageSelectorHeader.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import type { LanguagesInCodeKeys } from '$lib/const';
	import { extractTextFromImageFile } from '$lib/modules/extractTextFromImageFile';
	import { fileSelector } from '$lib/modules/fileSelector';
	import { redirectToTranslate } from '$lib/modules/redirectToTranslate';
	import Icon from '@iconify/svelte';
	import { onDestroy } from 'svelte';
	import { toasts } from 'svelte-toasts';
	import { writable } from 'svelte/store';

	let sourceLanguage = writable<LanguagesInCodeKeys>('en');
	let targetLanguage = writable<LanguagesInCodeKeys>('gu');

	let processing = false;
	let processingStatus = '';

	async function handleUpload() {
		const file = (await fileSelector({
			multiple: false
		})) as File | null;

		console.log('file?', file);

		if (!file) {
			return;
		}

		processing = true;

		const ocrResponse = await extractTextFromImageFile(file, $sourceLanguage, (data) => {
			switch (data.code) {
				case 'CHECKING_FILE':
					processingStatus = 'Checking file';
					break;
				case 'GETTING_WORKER':
					processingStatus = 'Getting worker';
					break;
				case 'CREATING_WORKER':
					processingStatus = 'Creating worker';
					break;
				case 'INITIALIZING_WORKER':
					processingStatus = 'Initializing worker';
					break;
				case 'RECOGNIZING':
					processingStatus = 'Recognizing';
					break;
				case 'PARSING':
					processingStatus = 'Parsing output';
					break;
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
			const text = ocrResponse.data;
			processingStatus = 'Redirecting...';
			redirectToTranslate(text, $sourceLanguage, $targetLanguage);
		}
	}

	onDestroy(() => {
		processing = false;
		processingStatus = '';
	});
</script>

<div class="flex flex-col">
	<!-- header -->
	<LanguageSelectorHeader
		bind:sourceLanguage={$sourceLanguage}
		bind:targetLanguage={$targetLanguage}
	/>

	<!-- <Dropzone on:drop> -->
	<div class="border shadow-md rounded p-4 py-32 flex justify-center items-center">
		<!--  -->
		<div class="flex flex-col items-center gap-2">
			{#if processing === false}
				<div class="flex justify-center items-center gap-0">
					<Icon
						icon="ant-design:file-gif-outlined"
						class="text-theme-600 mr-2 w-[55px] h-[55px] hover:scale-[1.2] transition-all"
					/>
					<Icon
						icon="uiw:file-jpg"
						class="text-theme-600 w-[50px] h-[50px] hover:scale-[1.2] transition-all"
					/>
					<Icon
						icon="iwwa:file-png"
						class="text-theme-600 w-[70px] h-[70px] hover:scale-[1.2] transition-all"
					/>
				</div>
				<h1 class="text-2xl">Supports .PNG, .JPG, .GIF and .WEBP files</h1>
				<Button on:click={handleUpload} variant="default" size="lg" class="text-lg"
					>Select files</Button
				>
			{:else}
				<Icon icon="svg-spinners:blocks-wave" class="text-theme-600" width={100} />
				<h1 class="text-2xl">{processingStatus}</h1>
			{/if}
		</div>
	</div>
	<!-- </Dropzone> -->
</div>
