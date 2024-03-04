<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import Icon from '@iconify/svelte';
	import LanguageSelector from './LanguageSelector.svelte';
	import Input from './ui/input/input.svelte';
	import { writable } from 'svelte/store';
	import type { LanguagesInCodeKeys } from '$lib/const';
	import { trpc } from '$lib/trpc/client';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { onDestroy, onMount } from 'svelte';

	let selectedLanguage = writable<LanguagesInCodeKeys>('en');
	let replaceValue = writable('');
	let replaceWithValue = writable('');
	let map: Record<string, string> = {};
	let syncInterval: NodeJS.Timeout;

	let loading = false;
	let loadingStatus = '';

	async function fetchCustomReplacerMap(touchLoading = true) {
		if (!browser) return;

		if (touchLoading) {
			loading = true;
			loadingStatus = 'Sync';
		}

		const customReplacerResponse = await trpc().getUserCustomReplacer.query({
			language: $selectedLanguage
		});

		// @ts-ignore
		map = customReplacerResponse.map as Record<string, string>;

		if (touchLoading) {
			loading = false;
		}
	}

	selectedLanguage.subscribe(() => {
		fetchCustomReplacerMap(true);
	});

	async function handleAdd() {
		if (!$replaceValue.trim() || !$replaceWithValue.trim()) {
			return;
		}

		console.log('Adding...');
		loading = true;
		loadingStatus = 'Adding';

		map[$replaceValue] = $replaceWithValue;
		let key = $replaceValue;
		let value = $replaceWithValue;

		$replaceValue = '';
		$replaceWithValue = '';

		await trpc().addToCustomReplacer.query({
			language: $selectedLanguage,
			key: key,
			value: value
		});

		await fetchCustomReplacerMap();

		loading = false;
		loadingStatus = '';
	}

	async function handleDelete(key: string) {
		console.log('Deleting...');
		loading = true;
		loadingStatus = 'Delete';

		delete map[key];
		map = map;

		await trpc().deleteInCustomReplacer.query({
			language: $selectedLanguage,
			key: key
		});

		await fetchCustomReplacerMap();

		loading = false;
		loadingStatus = '';
	}

	$: console.log(map);

	onMount(() => {
		syncInterval = setInterval(() => {
			fetchCustomReplacerMap(true);
		}, 10000);
	});

	onDestroy(() => {
		if (syncInterval) {
			clearInterval(syncInterval);
		}
	});
</script>

<Dialog.Root>
	<Dialog.Trigger>
		{#if $page.data.session?.user}
			<Button variant="outline" class="gap-2">
				<Icon class="text-xl text-theme-600" icon="clarity:library-solid" />
				Custom Replacer
			</Button>
		{/if}
	</Dialog.Trigger>
	<Dialog.Content class="min-w-[40%] max-w-[40%] min-h-fit max-h-[70%]">
		<h1 class="font-semibold text-lg">Custom Replacer</h1>
		<hr />
		<div class="w-full flex justify-between items-end gap-3">
			<LanguageSelector bind:value={$selectedLanguage} maxNumberOfAlwaysVisibleLanguages={2} />
			{#if loading}
				<div
					class="rounded-full transition-all flex justify-center items-center gap-2 p-1 px-3 text-sm bg-theme-600 text-white"
				>
					<Icon icon="svg-spinners:270-ring-with-bg" />
					{loadingStatus}
				</div>
			{/if}
		</div>
		<div class="min-w-full flex justify-between items-end gap-2">
			<div class="grow flex gap-2">
				<div class="grow flex flex-col gap-0">
					<div>Replace:</div>
					<Input
						on:keydown={(e) => {
							if (e.keyCode === 13) {
								handleAdd();
							}
						}}
						bind:value={$replaceValue}
						class="border-gray-500"
						placeholder="eg. Hello"
					/>
				</div>
				<div class="grow flex flex-col gap-0">
					<div>With:</div>
					<Input
						on:keydown={(e) => {
							if (e.keyCode === 13) {
								handleAdd();
							}
						}}
						bind:value={$replaceWithValue}
						class="border-gray-500"
						placeholder="eg. Hi"
					/>
				</div>
			</div>

			<Button
				on:click={handleAdd}
				disabled={!$replaceValue.trim() || !$replaceWithValue.trim()}
				variant="theme"
				class="p-2 px-4"><Icon class="text-xl" icon="mdi:plus" /> Add</Button
			>
		</div>
		<hr />
		<div class="mt-2 w-full h-fit flex flex-col gap-2">
			{#if Object.keys(map).length === 0}
				<div class="text-center text-muted-foreground italic">This list is empty!</div>
			{/if}
			{#each Object.keys(map) as key}
				{@const value = map[key]}
				<div class="w-full flex justify-between items-center gap-2">
					<div class="grow flex items-center gap-2">
						<div class="w-[46%] flex flex-col gap-0 border-gray-300 border rounded p-2">
							<p>{key}</p>
						</div>
						<p class="w-[3%]"><Icon icon="cil:arrow-right" /></p>
						<div class="w-[46%] flex flex-col gap-0 border-gray-300 border rounded p-2">
							<p>{value}</p>
						</div>
					</div>

					<Button variant="theme" class="p-2 px-3" on:click={() => handleDelete(key)}
						><Icon class="text-xl" icon="mdi:bin" /></Button
					>
				</div>
			{/each}
		</div>
	</Dialog.Content>
</Dialog.Root>
