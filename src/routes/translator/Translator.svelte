<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import CopyButton from '$lib/components/CopyButton.svelte';
	import Editor from '$lib/components/Editor.svelte';
	import FeedbackBlock from '$lib/components/FeedbackBlock.svelte';
	import TextToSpeechButton from '$lib/components/TextToSpeechButton.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Switch } from '$lib/components/ui/switch';
	import { DEFAULT_EDITOR_HEIGHT, type LanguagesInCodeKeys } from '$lib/const';
	import { trpc } from '$lib/trpc/client';
	import Icon from '@iconify/svelte';
	import { debounce } from 'lodash-es';
	import { onDestroy, onMount } from 'svelte';
	import tippy from 'svelte-tippy';
	import { writable } from 'svelte/store';
	import EditorBlockWrapper from '$lib/components/EditorBlockWrapper.svelte';
	import LanguageSelectorHeader from '$lib/components/LanguageSelectorHeader.svelte';
	import { redirectToTranslate } from '$lib/modules/redirectToTranslate';
	import DownloadButton from '$lib/components/DownloadButton.svelte';

	let sourceLanguage = writable<LanguagesInCodeKeys>('en');
	let targetLanguage = writable<LanguagesInCodeKeys>('gu');
	let input = writable('');
	let isBeingTranslated = false;
	let abortController: AbortController | null = null;
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
	let languageSelectorHeaderComponent: LanguageSelectorHeader;

	function removeHash() {
		goto('', {
			replaceState: true,
			noScroll: true,
			keepFocus: true
		});
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

			redirectToTranslate($input, $sourceLanguage, $targetLanguage);

			languageSelectorHeaderComponent.selectSource($sourceLanguage);
			languageSelectorHeaderComponent.selectTarget($targetLanguage);

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

		redirectToTranslate($input, $sourceLanguage, $targetLanguage);

		isBeingTranslated = false;
	}

	const debouncedTranslate = debounce(translate, 400);

	sourceLanguage.subscribe(() => {
		debouncedTranslate();
	});
	targetLanguage.subscribe(() => {
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
	<LanguageSelectorHeader
		bind:sourceLanguage={$sourceLanguage}
		bind:targetLanguage={$targetLanguage}
		bind:this={languageSelectorHeaderComponent}
	/>

	<!-- body -->
	<div class="grid grid-cols-2 gap-7">
		<!-- left -->
		<div class="flex flex-col max-h-fit">
			<!-- top -->
			<div
				class="w-full max-h-fit flex flex-col gap-0 transition-all border border-gray-400 rounded"
			>
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
				<div class="p-3 flex justify-end gap-1">
					<TextToSpeechButton bind:input={$input} />
					<CopyButton bind:input={$input} />
				</div>
			</div>

			<div class="my-3" />

			<!-- options -->
			<div class="p-4 px-4 border border-gray-400 rounded">
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
			<EditorBlockWrapper
				bind:editor={$editorRefs.originalOutput}
				bind:height={$editorHeights.originalOutput}
				bind:value={$output.original}
				allowEditButton={true}
			>
				<svelte:fragment slot="footerLeft">
					{#if isBeingTranslated}
						<div
							class="rounded-full transition-all flex justify-center items-center gap-2 p-1 px-3 text-base text-theme-600"
						>
							Translating <Icon icon="svg-spinners:270-ring-with-bg" />
						</div>
					{:else if $options.autoSummarize || $options.autoBulletins}
						<div
							class="rounded-full transition-all flex justify-center items-center gap-2 p-1 px-3 text-sm bg-theme-600 text-white"
						>
							Original
						</div>
					{/if}
				</svelte:fragment>
				<svelte:fragment slot="footerRight">
					<DownloadButton bind:text={$output.original} />
					<TextToSpeechButton bind:input={$output.original} />
					<CopyButton bind:input={$output.original} />
				</svelte:fragment>
			</EditorBlockWrapper>

			{#if $options.autoSummarize && ($output.summarized || ($options.autoSummarize && isBeingTranslated))}
				<EditorBlockWrapper
					bind:editor={$editorRefs.summarizedOutput}
					bind:height={$editorHeights.summarizedOutput}
					bind:value={$output.summarized}
					allowEditButton={true}
				>
					<svelte:fragment slot="footerLeft">
						{#if isBeingTranslated}
							<div
								class="rounded-full transition-all flex justify-center items-center gap-2 p-1 px-3 text-base text-theme-600"
							>
								Summarizing <Icon icon="svg-spinners:270-ring-with-bg" />
							</div>
						{:else}
							<div
								class="rounded-full transition-all flex justify-center items-center gap-2 p-1 px-3 text-sm bg-theme-600 text-white"
							>
								Summarized
							</div>
						{/if}
					</svelte:fragment>
					<svelte:fragment slot="footerRight">
						<DownloadButton bind:text={$output.summarized} />
						<TextToSpeechButton bind:input={$output.summarized} />
						<CopyButton bind:input={$output.summarized} />
					</svelte:fragment>
				</EditorBlockWrapper>
			{/if}

			{#if $options.autoBulletins && ($output.bulletined || ($options.autoBulletins && isBeingTranslated))}
				<EditorBlockWrapper
					bind:editor={$editorRefs.bulletinedOutput}
					bind:height={$editorHeights.bulletinedOutput}
					bind:value={$output.bulletined}
					allowEditButton={true}
				>
					<svelte:fragment slot="footerLeft">
						{#if isBeingTranslated}
							<div
								class="rounded-full transition-all flex justify-center items-center gap-2 p-1 px-3 text-base text-theme-600"
							>
								Bulletizing <Icon icon="svg-spinners:270-ring-with-bg" />
							</div>
						{:else}
							<div
								class="rounded-full transition-all flex justify-center items-center gap-2 p-1 px-3 text-sm bg-theme-600 text-white"
							>
								Bulletined
							</div>
						{/if}
					</svelte:fragment>
					<svelte:fragment slot="footerRight">
						<DownloadButton bind:text={$output.bulletined} />
						<TextToSpeechButton bind:input={$output.bulletined} />
						<CopyButton bind:input={$output.bulletined} />
					</svelte:fragment>
				</EditorBlockWrapper>
			{/if}

			<!-- feedback -->
			{#if $referenceId}
				<FeedbackBlock refId={$referenceId} />
			{/if}
		</div>
	</div>
</div>
