<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import CopyButton from '$lib/components/CopyButton.svelte';
	import Editor from '$lib/components/Editor.svelte';
	import FeedbackBlock from '$lib/components/FeedbackBlock.svelte';
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
	let isBeingTranslated = false;
	let abortController: AbortController | null = null;
	let sourceLanguageSelectorComponent: LanguageSelector;
	let targetLanguageSelectorComponent: LanguageSelector;
	let options = writable({
		pureGujarati: false,
		autoSummarize: false,
		autoBulletins: false
	});
	let output = writable<{
		original?: string;
		summarized?: string;
		bulletined?: string;
	}>({
		original: undefined
	});
	let editorHeights = writable({
		input: DEFAULT_EDITOR_HEIGHT,
		originalOutput: DEFAULT_EDITOR_HEIGHT,
		summarizedOutput: DEFAULT_EDITOR_HEIGHT,
		bulletinedOutput: DEFAULT_EDITOR_HEIGHT
	});
	type EditorRef = Editor;
	let editorRefs = writable<{
		input: EditorRef | null;
		originalOutput: EditorRef | null;
		summarizedOutput: EditorRef | null;
		bulletinedOutput: EditorRef | null;
	}>({
		input: null,
		originalOutput: null,
		summarizedOutput: null,
		bulletinedOutput: null
	});
	let resizerInterval: NodeJS.Timeout;
	let referenceId = writable<string | null>(null);

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

	// input is empty
	$: if ($input.trim() === '' && browser) {
		removeHash();
		if (abortController !== null && !abortController.signal.aborted) {
			abortController.abort();
		}
		isBeingTranslated = false;
		$referenceId = null;
		$output = {
			original: '',
			summarized: undefined,
			bulletined: undefined
		};
	}

	onMount(() => {
		let hash = $page.url.hash;

		if (hash) {
			hash = hash.slice(1);
			const [sourceLanguageFromHash, targetLanguageFromHash, content] = hash.split('/');

			$sourceLanguage = sourceLanguageFromHash as LanguagesInCodeKeys;
			$targetLanguage = targetLanguageFromHash as LanguagesInCodeKeys;

			$input = decodeURIComponent(content);

			setHash(content, $sourceLanguage, $targetLanguage);

			sourceLanguageSelectorComponent.handleSelect($sourceLanguage);
			targetLanguageSelectorComponent.handleSelect($targetLanguage);

			resizeEditors();
		}
	});

	function resizeEditors() {
		$editorRefs.input?.resize();
		$editorRefs.originalOutput?.resize();
		$editorRefs.summarizedOutput?.resize();
		$editorRefs.bulletinedOutput?.resize();
	}

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
					autoSummarize: $options.autoSummarize,
					autoBulletins: $options.autoBulletins,
					pureGujarati: $options.pureGujarati
				}
			},
			{
				signal: abortController.signal
			}
		);

		abortController = null;

		console.log('translationResponse?', translationResponse);

		$output.original = translationResponse.data?.output.original || '';
		$output.summarized = translationResponse.data?.output.summarized;
		$output.bulletined = translationResponse.data?.output.bulletined;

		$referenceId = translationResponse.data?.referenceId || null;

		setHash($input, $sourceLanguage, $targetLanguage);

		isBeingTranslated = false;
	}

	const debouncedTranslate = debounce(translate, 300);

	sourceLanguage.subscribe(() => {
		if ($sourceLanguage === $targetLanguage) {
			$targetLanguage = lastSourceLanguage;
			targetLanguageSelectorComponent.handleSelect($targetLanguage);
		}
		lastSourceLanguage = $sourceLanguage;
		debouncedTranslate();
	});
	targetLanguage.subscribe(() => {
		if ($sourceLanguage === $targetLanguage) {
			$sourceLanguage = lastTargetLanguage;
			sourceLanguageSelectorComponent.handleSelect($sourceLanguage);
		}
		lastTargetLanguage = $targetLanguage;
		debouncedTranslate();
	});

	options.subscribe(() => {
		debouncedTranslate();
	});

	input.subscribe(resizeEditors);
	output.subscribe(resizeEditors);

	onMount(() => {
		resizerInterval = setInterval(() => {
			resizeEditors();
		}, 100);
	});

	onDestroy(() => {
		if (resizerInterval) {
			clearInterval(resizerInterval);
		}
	});

	$: console.log($output);
</script>

<div class="flex flex-col">
	<!-- header -->
	<div class="min-w-full bg-white flex">
		<div class="min-w-full flex justify-between items-center gap-3 px-0 pb-3 py-1 relative">
			<!-- input side -->
			<div class="">
				<LanguageSelector
					bind:this={sourceLanguageSelectorComponent}
					bind:value={$sourceLanguage}
				/>
			</div>
			<!-- middle -->
			<div
				class="max-w-fit flex items-center absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2"
			>
				<Button variant="outline" class="h-fit p-0 border-none" on:click={swapLanguages}>
					<Icon class="text-4xl" icon="gg:swap" />
				</Button>
			</div>
			<!-- output side -->
			<div class="flex justify-start">
				<LanguageSelector
					bind:this={targetLanguageSelectorComponent}
					bind:value={$targetLanguage}
					className="flex-row-reverse"
				/>
			</div>
		</div>
	</div>

	<!-- body -->
	<div class="grid grid-cols-2 gap-7">
		<div class="flex flex-col max-h-fit">
			<!-- left -->
			<div class="w-full max-h-fit flex flex-col gap-0 transition-all border border-black rounded">
				<Editor
					id="input"
					bind:this={$editorRefs.input}
					bind:value={$input}
					bind:height={$editorHeights.input}
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

			<div class="my-3" />

			<div class="p-4 px-4 border border-black rounded">
				<!-- translation mode -->
				<div class="flex justify-between items-center">
					<h1 class="font-semibold">Translation Mode</h1>
					<div class="flex gap-0 border border-gray-600 rounded overflow-hidden">
						<Button
							variant="ghost"
							class="w-[130px] h-fit rounded-none text-base flex-grow py-2 {$options.pureGujarati ===
							false
								? 'bg-theme-600 text-white hover:bg-theme-600 hover:text-white dark:bg-background dark:border-none'
								: 'bg-white hover:bg-white dark:border-none dark:hover:bg-zinc-600'}"
							on:click={() => ($options.pureGujarati = false)}
							size="sm">Educational</Button
						>
						<Button
							variant="ghost"
							class="w-[130px] h-fit rounded-none text-base flex-grow py-2 {$options.pureGujarati ===
							true
								? 'bg-theme-600 text-white hover:bg-theme-600 hover:text-white dark:bg-background dark:border-none'
								: 'bg-white hover:bg-white dark:border-none dark:hover:bg-zinc-600'}"
							on:click={() => ($options.pureGujarati = true)}
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
					<Switch class="data-[state=checked]:bg-theme-600" bind:checked={$options.autoSummarize} />
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
					<Switch class="data-[state=checked]:bg-theme-600" bind:checked={$options.autoBulletins} />
				</div>
			</div>
		</div>

		<!-- right -->
		<div class="flex flex-col gap-5 max-h-fit">
			<div class="w-full grow-0 min-h-fit flex flex-col gap-0 border border-black rounded">
				<Editor
					id="originalOutput"
					readonly={true}
					wrapperClass=""
					bind:this={$editorRefs.originalOutput}
					bind:value={$output.original}
					bind:height={$editorHeights.originalOutput}
					allowClearButton={false}
				>
					<div slot="placeholder" />
				</Editor>
				<div class="p-3 flex justify-end items-center gap-2">
					<div
						class="rounded-full flex justify-center items-center gap-2 bg-theme-600 text-white p-1 px-3 text-sm"
					>
						{#if isBeingTranslated}
							Translating <Icon icon="svg-spinners:270-ring-with-bg" />
						{:else}
							Original
						{/if}
					</div>
					{#if output}
						<CopyButton bind:input={$output.original} />
					{/if}
				</div>
			</div>

			{#if $options.autoSummarize && ($output.summarized || ($options.autoSummarize && isBeingTranslated))}
				<div class="w-full grow-0 min-h-fit flex flex-col gap-0 border border-black rounded">
					<Editor
						id="summarizedOutput"
						readonly={true}
						wrapperClass=""
						bind:this={$editorRefs.summarizedOutput}
						bind:value={$output.summarized}
						bind:height={$editorHeights.summarizedOutput}
						allowClearButton={false}
					>
						<div slot="placeholder" />
					</Editor>
					<div class="p-3 flex justify-end items-center gap-2">
						<div
							class="rounded-full flex justify-center items-center gap-2 bg-theme-600 text-white p-1 px-3 text-sm"
						>
							{#if isBeingTranslated}
								Summarizing <Icon icon="svg-spinners:270-ring-with-bg" />
							{:else}
								Summarized
							{/if}
						</div>
						{#if output}
							<CopyButton bind:input={$output.summarized} />
						{/if}
					</div>
				</div>
			{/if}

			{#if $options.autoBulletins && ($output.bulletined || ($options.autoBulletins && isBeingTranslated))}
				<div class="w-full grow-0 min-h-fit flex flex-col gap-0 border border-black rounded">
					<Editor
						id="bulletinedOutput"
						readonly={true}
						wrapperClass=""
						bind:this={$editorRefs.bulletinedOutput}
						bind:value={$output.bulletined}
						bind:height={$editorHeights.bulletinedOutput}
						allowClearButton={false}
					>
						<div slot="placeholder" />
					</Editor>
					<div class="p-3 flex justify-end items-center gap-2">
						<div
							class="rounded-full flex justify-center items-center gap-2 bg-theme-600 text-white p-1 px-3 text-sm"
						>
							{#if isBeingTranslated}
								Processing <Icon icon="svg-spinners:270-ring-with-bg" />
							{:else}
								Bulletined
							{/if}
						</div>
						{#if output}
							<CopyButton bind:input={$output.bulletined} />
						{/if}
					</div>
				</div>
			{/if}

			<!-- feedback -->
			{#if $referenceId}
				<FeedbackBlock refId={$referenceId} />
			{/if}
		</div>
	</div>
</div>
