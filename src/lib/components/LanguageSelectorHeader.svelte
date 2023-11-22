<script lang="ts">
	import LanguageSelector from '$lib/components/LanguageSelector.svelte';
	import { Button } from '$lib/components/ui/button';
	import type { LanguagesInCodeKeys } from '$lib/const';
	import Icon from '@iconify/svelte';
	import { writable } from 'svelte/store';

	let sourceLanguageStore = writable<LanguagesInCodeKeys>('en');
	export let sourceLanguage = $sourceLanguageStore;

	export let targetLanguageStore = writable<LanguagesInCodeKeys>('gu');
	export let targetLanguage = $targetLanguageStore;

	let lastSourceLanguage = $sourceLanguageStore;
	let lastTargetLanguage = $targetLanguageStore;
	let sourceLanguageSelectorComponent: LanguageSelector;
	let targetLanguageSelectorComponent: LanguageSelector;

	function swapLanguages() {
		let t = $sourceLanguageStore;
		$sourceLanguageStore = $targetLanguageStore;
		$targetLanguageStore = t;
		return true;
	}

	sourceLanguageStore.subscribe(() => {
		if ($sourceLanguageStore === $targetLanguageStore) {
			$targetLanguageStore = lastSourceLanguage;
			targetLanguageSelectorComponent.handleSelect($targetLanguageStore);
		}
		lastSourceLanguage = $sourceLanguageStore;
	});
	targetLanguageStore.subscribe(() => {
		if ($sourceLanguageStore === $targetLanguageStore) {
			$sourceLanguageStore = lastTargetLanguage;
			sourceLanguageSelectorComponent.handleSelect($sourceLanguageStore);
		}
		lastTargetLanguage = $targetLanguageStore;
	});

	sourceLanguageStore.subscribe(() => {
		sourceLanguage = $sourceLanguageStore;
	});
	targetLanguageStore.subscribe(() => {
		targetLanguage = $targetLanguageStore;
	});

	export function selectSource(language: LanguagesInCodeKeys) {
		sourceLanguageSelectorComponent.handleSelect(language);
	}
	export function selectTarget(language: LanguagesInCodeKeys) {
		targetLanguageSelectorComponent.handleSelect(language);
	}
</script>

<div class="min-w-full bg-white flex">
	<div class="min-w-full flex justify-between items-center gap-3 px-0 pb-3 py-1 relative">
		<!-- input side -->
		<div class="">
			<LanguageSelector
				bind:this={sourceLanguageSelectorComponent}
				bind:value={$sourceLanguageStore}
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
				bind:value={$targetLanguageStore}
				className="flex-row-reverse"
			/>
		</div>
	</div>
</div>
