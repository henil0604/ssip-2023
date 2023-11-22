<script lang="ts">
	import Editor from '$lib/components/Editor.svelte';
	import LanguageSelectorHeader from '$lib/components/LanguageSelectorHeader.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import type { LanguagesInCodeKeys } from '$lib/const';
	import Icon from '@iconify/svelte';
	import { writable } from 'svelte/store';
	import { trpc } from '$lib/trpc/client';
	import ISO6391 from 'iso-639-1';
	import { toasts } from 'svelte-toasts';
	import { redirectToTranslate } from '$lib/modules/redirectToTranslate';

	export let input = '';

	let sourceLanguage = writable<LanguagesInCodeKeys>('en');
	let targetLanguage = writable<LanguagesInCodeKeys>('gu');

	let isListening = false;
	let isProcessing = false;

	let mediaRecorder: MediaRecorder | null = null;

	async function startListening() {
		isListening = true;
		navigator.mediaDevices
			.getUserMedia({ audio: true })
			.then((stream) => {
				mediaRecorder = new MediaRecorder(stream);
				let chunks: Blob[] = [];

				let startTime: number;

				mediaRecorder.ondataavailable = (e) => {
					if (e.data.size > 0) {
						chunks.push(e.data);
					}
				};

				mediaRecorder.onstart = () => {
					startTime = Date.now();
				};

				mediaRecorder.onstop = () => {
					const elapsedTime = Date.now() - startTime;
					if (elapsedTime < 600) {
						toasts.add({
							title: 'Too Short',
							description: 'Recording is too short (< 1 second)',
							type: 'warning',
							duration: 2000
						});
						return;
					}
					const audioBlob = new Blob(chunks, { type: 'audio/wav' });
					chunks = [];
					transcribe(audioBlob);
				};

				mediaRecorder.start();
			})
			.catch(console.error);
	}

	async function stopListening() {
		isListening = false;
		if (!mediaRecorder) return;

		mediaRecorder.stop();
		mediaRecorder.stream.getTracks().forEach((track) => track.stop());
	}

	async function transcribe(blob: Blob) {
		isProcessing = true;
		console.log('blob?', blob);

		const speechToTextResponse = await trpc().speechToText.mutate({
			arrayBuffer: [...new Uint8Array(await blob.arrayBuffer())],
			type: blob.type,
			language: $sourceLanguage
		});

		if (speechToTextResponse.code !== 'DONE') {
			toasts.add({
				title: speechToTextResponse.message,
				type: 'error',
				description: speechToTextResponse.code,
				duration: 3000
			});
		}

		if (speechToTextResponse.code === 'DONE' && speechToTextResponse.response) {
			input += ' ' + speechToTextResponse.response;
		}

		isProcessing = false;
	}

	function handleTranslate() {
		redirectToTranslate(input, $sourceLanguage, $targetLanguage);
	}
</script>

<div class="flex flex-col">
	<!-- header -->
	<LanguageSelectorHeader
		bind:sourceLanguage={$sourceLanguage}
		bind:targetLanguage={$targetLanguage}
	/>
	<div class="border shadow-md rounded p-4 py-0 flex">
		<div class="py-28 px-28 flex flex-col justify-center items-center border-r-2">
			<!-- icon -->
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			{#if isListening}
				<div
					on:click={stopListening}
					class="cursor-pointer relative w-[200px] h-[200px] rounded-full overflow-hidden flex justify-center items-center"
				>
					<div
						class="absolute top-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-theme-400 animate-pulse rounded-full"
					/>
					<div
						class="absolute top-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-theme-500 animate-pulse rounded-full"
					/>
					<div
						class="absolute top-0 left-0 w-full h-full bg-theme-300 animate-pulse rounded-full"
					/>
					<Icon icon="bi:mic" class="w-[30%] h-[30%] absolute top-1/2 -translate-y-1/2" />
				</div>
			{:else}
				<div
					on:click={startListening}
					class="cursor-pointer relative w-[200px] h-[200px] rounded-full overflow-hidden bg-theme-300 hover:bg-theme-400 transition text-black"
				>
					<Icon
						icon="bi:mic"
						class="w-[30%] h-[30%] absolute top-1/2 -translate-y-1/2 right-1/2 translate-x-1/2"
					/>
				</div>
			{/if}
			<div class="my-3" />
			<div class="text-xl text-center tracking-wide">
				<span
					class="text-lg opacity-0"
					class:animate-pulse={isListening}
					class:opacity-100={isListening}>Listening...</span
				>
				<br />
				{#if isListening}
					Press to stop
				{:else}
					Press to start
				{/if}
			</div>
		</div>
		<div class="grow flex flex-col">
			<Editor bind:value={input} wrapperClass="!h-full">
				<div slot="placeholder">
					<h1 class="text-xl">Speak to transcribe</h1>
				</div>
			</Editor>
			<div class="w-full flex justify-end p-3">
				{#if isProcessing}
					<div
						class="rounded-full transition-all flex justify-center items-center gap-2 p-1 px-3 text-base text-theme-600"
					>
						Transcribing <Icon icon="svg-spinners:270-ring-with-bg" />
					</div>
				{:else if input.trim() !== '' && !isProcessing}
					<Button
						on:click={handleTranslate}
						bind:disabled={isProcessing}
						on:click
						size="lg"
						class="text-lg"
						variant="default">Translate</Button
					>
				{/if}
			</div>
		</div>
	</div>
</div>
