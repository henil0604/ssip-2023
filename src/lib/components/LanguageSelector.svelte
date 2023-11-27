<script lang="ts">
	import {
		LanguageMap,
		type LanguagesInCodeKeys,
		type LanguagesInHumanReadableKeys
	} from '$lib/const';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import Icon, { iconExists } from '@iconify/svelte';
	import { Input } from '$lib/components/ui/input';
	import { cn } from '$lib/utils';

	const LanguageCodes = Object.values(LanguageMap) as LanguagesInCodeKeys[];
	const LanguageNames = Object.keys(LanguageMap) as LanguagesInHumanReadableKeys[];

	export let isDialogOpen = false;
	export let className = '';

	export let alwaysVisibleLanguages: LanguagesInHumanReadableKeys[] = ['English', 'Gujarati'];
	export let maxNumberOfAlwaysVisibleLanguages = 4;

	export let value: LanguagesInCodeKeys = LanguageMap[alwaysVisibleLanguages[0]];

	$: valueInHumanReadableForm = Object.keys(LanguageMap).find(
		(key) => LanguageMap[key as LanguagesInHumanReadableKeys] === value
	) as LanguagesInHumanReadableKeys;

	let searchTerm = '';

	export function prependToAlwaysVisibleLanguage(language: LanguagesInHumanReadableKeys) {
		alwaysVisibleLanguages = [language, ...alwaysVisibleLanguages];
		if (alwaysVisibleLanguages.length >= maxNumberOfAlwaysVisibleLanguages) {
			alwaysVisibleLanguages = alwaysVisibleLanguages.slice(0, maxNumberOfAlwaysVisibleLanguages);
		}
	}

	export function handleSelect(language: LanguagesInCodeKeys) {
		isDialogOpen = false;
		value = language;

		const languageName = Object.keys(LanguageMap).find(
			(key) => LanguageMap[key as LanguagesInHumanReadableKeys] === value
		) as LanguagesInHumanReadableKeys;

		if (!alwaysVisibleLanguages.includes(languageName)) {
			if (alwaysVisibleLanguages.includes(languageName)) {
				alwaysVisibleLanguages = alwaysVisibleLanguages.filter((e) => e !== languageName);
			}

			prependToAlwaysVisibleLanguage(languageName);
		}

		searchTerm = '';
	}

	$: if (alwaysVisibleLanguages.includes(valueInHumanReadableForm) === false) {
		prependToAlwaysVisibleLanguage(valueInHumanReadableForm);
	}
</script>

<div class={cn('max-w-fit h-full flex items-center gap-2', className)}>
	{#each alwaysVisibleLanguages as language}
		{@const LanguageCode = LanguageMap[language]}
		{@const isSelected = LanguageCode === value}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div
			on:click={() => handleSelect(LanguageCode)}
			class="w-fit h-full px-1 py-2 pb-1 cursor-pointer transition-all hover:bg-gray-100 border-t-0 border-l-0 border-r-0 border-b-2 border-transparent"
			class:text-theme-600={isSelected}
			class:border-b-theme-600={isSelected}
		>
			{language}
		</div>
	{/each}

	{#if alwaysVisibleLanguages.length < LanguageNames.length}
		<Dialog.Root preventScroll={false} bind:open={isDialogOpen}>
			<Dialog.Trigger class={buttonVariants({ variant: 'ghost', class: 'outline-none' })}
				><Icon class="text-xl" icon="ep:arrow-down" /></Dialog.Trigger
			>
			<Dialog.Content class="min-w-[400px] w-fit max-w-fit max-h-[60%] overflow-auto">
				<h1 class="font-semibold text-lg">Language Selector</h1>
				<div class="relative">
					<Input bind:value={searchTerm} type="text" placeholder="Search Language" class="w-full" />
					<div class="absolute top-1/2 -translate-y-1/2 right-2">
						<Icon icon="mdi:search" class="text-xl" />
					</div>
				</div>
				<div class="mt-1" />
				<div class="grid grid-cols-5 gap-3 overflow-auto">
					{#each LanguageNames as language}
						{@const LanguageCode = LanguageMap[language]}
						{@const isSelected = LanguageCode === value}
						{@const toBeIncluded =
							searchTerm === '' ? true : language.toLowerCase().includes(searchTerm.toLowerCase())}
						<!-- svelte-ignore a11y-no-static-element-interactions -->
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						{#if toBeIncluded}
							<div
								class="w-fit h-fit flex gap-2 rounded p-2 cursor-pointer hover:bg-gray-100 transition"
								class:text-theme-600={isSelected}
								class:bg-theme-100={isSelected}
								on:click={() => handleSelect(LanguageCode)}
							>
								{#if isSelected}
									<Icon class="text-xl" icon="mdi:tick" />
								{/if}
								{language}
							</div>
						{/if}
					{/each}
				</div>
			</Dialog.Content>
		</Dialog.Root>
	{/if}
</div>
