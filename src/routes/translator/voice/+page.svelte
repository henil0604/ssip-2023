<script lang="ts">
	import Editor from '$lib/components/Editor.svelte';
	import LanguageSelectorHeader from '$lib/components/LanguageSelectorHeader.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import type { LanguagesInCodeKeys } from '$lib/const';
	import Icon from '@iconify/svelte';
	import { writable } from 'svelte/store';
	import { scale, slide } from 'svelte/transition';

	let sourceLanguage = writable<LanguagesInCodeKeys>('en');
	let targetLanguage = writable<LanguagesInCodeKeys>('gu');

	let isListening = false;

	function startListening() {
		isListening = true;
	}

	function stopListening() {
		isListening = false;
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
					class="cursor-pointer relative w-[200px] h-[200px] rounded-full overflow-hidden bg-theme-300 transition text-black"
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
			<Editor wrapperClass="!h-full" />
			<div class="w-full flex justify-end p-3">
				<Button on:click size="lg" class="text-lg" variant="default">Translate</Button>
			</div>
		</div>
	</div>
</div>
