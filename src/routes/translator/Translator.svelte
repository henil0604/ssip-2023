<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import CopyButton from '$lib/components/CopyButton.svelte';
	import Editor from '$lib/components/Editor.svelte';
	import LanguageSelector from '$lib/components/LanguageSelector.svelte';
	import { Button } from '$lib/components/ui/button';
	import type { LanguagesInCodeKeys } from '$lib/const';
	import { trpc } from '$lib/trpc/client';
	import Icon from '@iconify/svelte';
	import { debounce } from 'lodash-es';
	import { onMount } from 'svelte';

	let sourceLanguage: LanguagesInCodeKeys = 'en';
	let targetLanguage: LanguagesInCodeKeys = 'gu';

	let input = '';
	let output = '';
	let editorHeight: number;
	let isBeingTranslated = false;
	let abortController: AbortController | null = null;

	function setHash(
		input: string,
		sourceLanguage: LanguagesInCodeKeys,
		targetLanguage: LanguagesInCodeKeys
	) {
		goto(`#${sourceLanguage}/${targetLanguage}/${encodeURIComponent(input)}`, {
			replaceState: true,
			noScroll: true,
			keepFocus: true
		});
	}

	function removeHash() {
		goto('', {
			replaceState: true,
			noScroll: true,
			keepFocus: true
		});
	}

	function swapLanguages() {
		let t = sourceLanguage;
		sourceLanguage = targetLanguage;
		targetLanguage = t;
		return true;
	}

	$: if (input !== '' && browser) {
		debouncedTranslate();
	}

	$: if (input.trim() === '' && browser) {
		// input is empty
		removeHash();
		if (abortController !== null && !abortController.signal.aborted) {
			abortController.abort();
		}
		isBeingTranslated = false;
		output = '';
	}

	onMount(() => {
		let hash = $page.url.hash;

		if (hash) {
			hash = hash.slice(1);
			const [sourceLanguageFromHash, targetLanguageFromHash, content] = hash.split('/');

			sourceLanguage = sourceLanguageFromHash as LanguagesInCodeKeys;
			targetLanguage = targetLanguageFromHash as LanguagesInCodeKeys;

			input = decodeURIComponent(content);
		}
	});

	async function translate() {
		console.log('translating...');

		if (abortController !== null) {
			console.log('aborting...');
			abortController?.abort();
		}

		if (input.trim() === '') return;

		isBeingTranslated = true;

		abortController = new AbortController();

		const translationResponse = await trpc().translate.mutate(
			{
				input,
				sourceLanguage,
				targetLanguage,
				features: {
					autoSummarize: false,
					autoBulletins: false,
					pureGujarati: false
				}
			},
			{
				signal: abortController.signal
			}
		);

		abortController = null;

		console.log('translationResponse?', translationResponse);

		output = translationResponse.data?.result || '';

		setHash(input, sourceLanguage, targetLanguage);

		isBeingTranslated = false;
	}

	const debouncedTranslate = debounce(translate, 300);
</script>

<!-- translate box wrapper -->
<div
	class="bg-white rounded transition-all shadow focus-within:shadow-md min-h-fit p-0 flex flex-col overflow-auto"
>
	<!-- head -->
	<div class="w-full flex justify-center items-center gap-3 px-4 py-1 border-b">
		<!-- input side -->
		<div class="flex-grow">
			<LanguageSelector bind:value={sourceLanguage} />
		</div>
		<!-- middle -->
		<div class="">
			<Button variant="outline" class="h-fit p-2" on:click={swapLanguages}>
				<Icon icon="eva:swap-fill" />
			</Button>
		</div>
		<!-- output side -->
		<div class="flex-grow">
			<LanguageSelector bind:value={targetLanguage} />
		</div>
	</div>

	<!-- body -->
	<div class="w-full flex-grow min-h-fit grid grid-cols-2 gap-0">
		<Editor
			bind:value={input}
			bind:height={editorHeight}
			wrapperClass="border border-t-0 border-l-0 border-b-0 border-r border-r-gray-300"
		>
			<div slot="placeholder" class="">
				<h1 class="text-xl">Type to translate...</h1>
			</div>
		</Editor>
		<Editor
			readonly={true}
			wrapperClass="bg-gray-50"
			bind:value={output}
			bind:height={editorHeight}
		>
			<div slot="placeholder" />
		</Editor>
	</div>

	<!-- footer -->
	<div class="w-full grow-0 min-h-fit grid grid-cols-2 gap-0 transition">
		<!-- left -->
		<div
			class="border border-t-0 border-l-0 border-b-0 border-r border-r-gray-300 p-3 flex justify-end"
		>
			<!--  -->
		</div>
		<!-- right -->
		<div class="p-3 flex justify-end items-center gap-1 bg-gray-50">
			{#if isBeingTranslated}
				<p class="text-muted-foreground text-sm">Translating...</p>
			{/if}
			{#if output}
				<CopyButton bind:input={output} />
			{/if}
		</div>
	</div>
</div>
