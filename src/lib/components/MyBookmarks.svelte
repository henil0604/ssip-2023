<script lang="ts">
	import * as Sheet from '$lib/components/ui/sheet';
	import { Button } from '$lib/components/ui/button';
	import { page } from '$app/stores';
	import Icon from '@iconify/svelte';
	import { trpc } from '$lib/trpc/client';
	import { onDestroy, onMount } from 'svelte';
	import { bookmarks, fetchBookmarks, input } from '$lib/store';
	import { redirectToTranslate } from '$lib/modules/redirectToTranslate';
	import type { LanguagesInCodeKeys } from '$lib/const';

	let syncInterval: NodeJS.Timeout;

	let loading = false;
	let loadingStatus = '';
	let open = false;

	async function fetchBookmarksWrapper() {
		loading = true;
		loadingStatus = 'Sync';
		await fetchBookmarks();
		loading = false;
		loadingStatus = '';
	}

	async function handleDelete(historyId: string) {
		console.log('Deleting...');
		loading = true;
		loadingStatus = 'Delete';

		$bookmarks = $bookmarks.filter((e) => e.historyId !== historyId);

		await trpc().deleteBookmark.query({
			historyId
		});

		await fetchBookmarksWrapper();

		loading = false;
		loadingStatus = '';
	}

	$: console.log('bookmarks?', $bookmarks);

	onMount(() => {
		syncInterval = setInterval(() => {
			fetchBookmarksWrapper();
		}, 5000);
	});

	onDestroy(() => {
		if (syncInterval) {
			clearInterval(syncInterval);
		}
	});

	function redirectWrapper(inp: string, src: string, target: string) {
		$input = inp;
		redirectToTranslate(inp, src as LanguagesInCodeKeys, target as LanguagesInCodeKeys);
		open = false;
	}
</script>

<Sheet.Root bind:open>
	<Sheet.Trigger>
		{#if $page.data.session?.user}
			<Button variant="outline" class="gap-2 p-2">
				<Icon class="text-xl text-theme-600" icon="mdi:bookmark" />
			</Button>
		{/if}
	</Sheet.Trigger>
	<Sheet.Content class="min-w-[25%]">
		<div class="my-4" />
		<div class="w-full flex justify-between items-end gap-3">
			<h1 class="font-semibold text-lg">Bookmarks</h1>
			{#if loading}
				<div
					class="rounded-full transition-all flex justify-center items-center gap-2 p-1 px-3 text-sm bg-theme-600 text-white"
				>
					<Icon icon="svg-spinners:270-ring-with-bg" />
					{loadingStatus}
				</div>
			{/if}
		</div>
		<hr class="my-2" />
		<dir class="flex flex-col min-w-full p-0 gap-4">
			{#each $bookmarks as bookmark}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<div
					on:click={() => {
						redirectWrapper(bookmark.input, bookmark.sourceLanguage, bookmark.targetLanguage);
					}}
					class="border rounded hover:shadow bg-theme-50 hover:bg-theme-200 transition flex p-3 min-w-full cursor-pointer"
				>
					{bookmark.input.slice(0, 201) + (bookmark.input.length > 200 ? '...' : '')}
				</div>
			{/each}
		</dir>
	</Sheet.Content>
</Sheet.Root>
