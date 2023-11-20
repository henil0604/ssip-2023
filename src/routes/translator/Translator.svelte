<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import CopyButton from '$lib/components/CopyButton.svelte';
	import Editor from '$lib/components/Editor.svelte';
	import LanguageSelector from '$lib/components/LanguageSelector.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Switch } from '$lib/components/ui/switch';
	import { DEFAULT_EDITOR_HEIGHT, type LanguagesInCodeKeys } from '$lib/const';
	import { trpc } from '$lib/trpc/client';
	import Icon from '@iconify/svelte';
	import { debounce } from 'lodash-es';
	import { onDestroy, onMount } from 'svelte';
	import tippy from 'svelte-tippy';
	import { writable } from 'svelte/store';

	let sourceLanguage = writable<LanguagesInCodeKeys>('en');
	let targetLanguage = writable<LanguagesInCodeKeys>('gu');
	let lastSourceLanguage = $sourceLanguage;
	let lastTargetLanguage = $targetLanguage;
	let input = writable('');
	let output = writable('');
	let inputEditorHeight: number;
	let inputEditorRef: HTMLDivElement | null = null;
	let outputEditorRef: HTMLDivElement | null = null;
	let outputEditorHeight: number;
	let isBeingTranslated = false;
	let abortController: AbortController | null = null;
	let sourceLanguageSelectorComponent: LanguageSelector;
	let targetLanguageSelectorComponent: LanguageSelector;
	let editorResizerInterval: NodeJS.Timeout;
	let options = {
		pureGujarati: false,
		autoSummarize: false,
		autoBulletins: false
	};

	function setHash(
		input: string,
		sourceLanguage: LanguagesInCodeKeys,
		targetLanguage: LanguagesInCodeKeys
	) {
		goto(`#${$sourceLanguage}/${$targetLanguage}/${encodeURIComponent($input)}`, {
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
		let t = $sourceLanguage;
		$sourceLanguage = $targetLanguage;
		$targetLanguage = t;
		return true;
	}

	$: if ($input !== '' && browser) {
		debouncedTranslate();
	}

	$: if ($input.trim() === '' && browser) {
		// input is empty
		removeHash();
		if (abortController !== null && !abortController.signal.aborted) {
			abortController.abort();
		}
		isBeingTranslated = false;
		$output = '';
	}

	onMount(() => {
		let hash = $page.url.hash;

		if (hash) {
			hash = hash.slice(1);
			const [sourceLanguageFromHash, targetLanguageFromHash, content] = hash.split('/');

			$sourceLanguage = sourceLanguageFromHash as LanguagesInCodeKeys;
			$targetLanguage = targetLanguageFromHash as LanguagesInCodeKeys;

			$input = decodeURIComponent(content);

			resizeEditors();

			setHash(content, $sourceLanguage, $targetLanguage);

			sourceLanguageSelectorComponent.handleSelect($sourceLanguage);
			targetLanguageSelectorComponent.handleSelect($targetLanguage);
		}
	});

	async function translate() {
		console.log('translating...');

		if (abortController !== null) {
			console.log('aborting...');
			abortController?.abort();
		}

		if ($input.trim() === '') return;

		isBeingTranslated = true;

		abortController = new AbortController();

		const translationResponse = await trpc().translate.mutate(
			{
				input: $input,
				sourceLanguage: $sourceLanguage,
				targetLanguage: $targetLanguage,
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

		$output = translationResponse.data?.result || '';

		resizeEditors();

		setHash($input, $sourceLanguage, $targetLanguage);

		isBeingTranslated = false;
	}

	const debouncedTranslate = debounce(translate, 300);

	function resizeEditors() {
		if (!browser) return;

		console.log('resizing editors...');
		if ($input.trim() === '') {
			inputEditorHeight = DEFAULT_EDITOR_HEIGHT;
			outputEditorHeight = DEFAULT_EDITOR_HEIGHT;
		} else {
			let inputEditorScrollHeight = inputEditorRef?.scrollHeight || 0;
			let outputEditorScrollHeight = outputEditorRef?.scrollHeight || 0;

			let maxScrollHeight = Math.max(
				inputEditorScrollHeight,
				outputEditorScrollHeight,
				DEFAULT_EDITOR_HEIGHT
			);

			inputEditorHeight = maxScrollHeight;
			outputEditorHeight = maxScrollHeight;
		}
	}

	input.subscribe(resizeEditors);
	output.subscribe(resizeEditors);

	onMount(() => {
		editorResizerInterval = setInterval(() => {
			resizeEditors();
		}, 1000);
	});

	onDestroy(() => {
		if (editorResizerInterval) {
			clearInterval(editorResizerInterval);
		}
	});

	sourceLanguage.subscribe(() => {
		if ($sourceLanguage === $targetLanguage) {
			$targetLanguage = lastSourceLanguage;
		}
		lastSourceLanguage = $sourceLanguage;
		translate();
	});
	targetLanguage.subscribe(() => {
		if ($sourceLanguage === $targetLanguage) {
			$sourceLanguage = lastTargetLanguage;
		}
		lastTargetLanguage = $targetLanguage;
		translate();
	});
</script>

<div class="flex flex-col">
	<!-- header -->
	<div class="w-full bg-white flex">
		<div class="w-full flex justify-center items-center gap-3 px-0 pb-3 py-1">
			<!-- input side -->
			<div class="flex-grow flex justify-start">
				<LanguageSelector
					bind:this={sourceLanguageSelectorComponent}
					bind:value={$sourceLanguage}
				/>
			</div>
			<!-- middle -->
			<div class="">
				<Button variant="outline" class="h-fit p-0 border-none" on:click={swapLanguages}>
					<Icon class="text-4xl" icon="gg:swap" />
				</Button>
			</div>
			<!-- output side -->
			<div class="flex-grow flex justify-start">
				<LanguageSelector
					bind:this={targetLanguageSelectorComponent}
					bind:value={$targetLanguage}
				/>
			</div>
		</div>
	</div>

	<!-- body -->
	<div class="grid grid-cols-2 gap-7">
		<!-- left -->
		<div
			class="w-full flex-grow min-h-fit flex flex-col gap-0 transition-all border border-black rounded"
		>
			<Editor
				bind:value={$input}
				bind:editorRef={inputEditorRef}
				bind:height={inputEditorHeight}
				wrapperClass=""
				allowClearButton={true}
			>
				<div slot="placeholder" class="">
					<h1 class="text-xl">Type to translate...</h1>
				</div>
			</Editor>
			<div class="p-3 flex justify-end">
				<CopyButton bind:input={$input} />
			</div>
		</div>

		<!-- right -->
		<div
			class="w-full grow-0 min-h-fit flex flex-col gap-0 border border-black rounded bg-gray-100"
		>
			<Editor
				readonly={true}
				wrapperClass="bg-gray-100"
				bind:editorRef={outputEditorRef}
				bind:value={$output}
				bind:height={outputEditorHeight}
				allowClearButton={false}
			>
				<div slot="default">
					{#if $output !== ''}
						<div use:tippy={{ content: 'Edit', placement: 'bottom' }}>
							<Button
								class="outline-none absolute top-0 right-0 z-[2] hover:bg-transparent"
								variant="ghost"
							>
								<Icon class="text-lg" icon="mdi:pencil" />
							</Button>
						</div>
					{/if}
				</div>
				<div slot="placeholder" />
			</Editor>
			<!-- right -->
			<div class="p-3 flex justify-end items-center gap-1 bg-gray-100">
				{#if isBeingTranslated}
					<p class="text-lg">Translating...</p>
				{/if}
				{#if output}
					<CopyButton bind:input={$output} />
				{/if}
			</div>
		</div>
	</div>

	<div class="my-3" />
	<div class="grid grid-cols-2 gap-7">
		<!-- left -->
		<div class="p-4 px-4 border border-black rounded">
			<!-- translation mode -->
			<div class="flex justify-between items-center">
				<h1 class="font-semibold">Translation Mode</h1>
				<div class="flex gap-0 border border-gray-600 rounded overflow-hidden">
					<Button
						variant="ghost"
						class="w-[130px] h-fit rounded-none text-base flex-grow py-2 {options.pureGujarati ===
						false
							? 'bg-theme-600 text-white hover:bg-theme-600 hover:text-white dark:bg-background dark:border-none'
							: 'bg-white hover:bg-white dark:border-none dark:hover:bg-zinc-600'}"
						on:click={() => (options.pureGujarati = false)}
						size="sm">Educational</Button
					>
					<Button
						variant="ghost"
						class="w-[130px] h-fit rounded-none text-base flex-grow py-2 {options.pureGujarati ===
						true
							? 'bg-theme-600 text-white hover:bg-theme-600 hover:text-white dark:bg-background dark:border-none'
							: 'bg-white hover:bg-white dark:border-none dark:hover:bg-zinc-600'}"
						on:click={() => (options.pureGujarati = true)}
						size="sm">Pure</Button
					>
				</div>
			</div>

			<hr class="my-3" />

			<!-- auto summarize -->
			<div class="flex justify-between items-center">
				<div class="flex flex-col flex-grow gap-0.5">
					<h1 class="font-semibold tracking-wide">Auto Summarize</h1>
					<p class="text-muted-foreground text-sm font-medium">
						Tries to present given text in summarized format
					</p>
				</div>
				<Switch class="data-[state=checked]:bg-theme-600" bind:checked={options.autoSummarize} />
			</div>
			<hr class="my-3" />

			<!-- auto bulletins -->
			<div class="flex justify-between items-center">
				<div class="flex flex-col flex-grow gap-0.5">
					<h1 class="font-semibold tracking-wide">Auto Bulletins</h1>
					<p class="text-muted-foreground text-sm font-medium">
						Tries to present given text in bulletin format
					</p>
				</div>
				<Switch class="data-[state=checked]:bg-theme-600" bind:checked={options.autoBulletins} />
			</div>
		</div>
	</div>
</div>
