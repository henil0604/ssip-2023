<script lang="ts">
	import type { LanguagesInCodeKeys } from '$lib/const';
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';
	import { bookmarks, fetchBookmarks } from '$lib/store';
	import { trpc } from '$lib/trpc/client';

	export let historyId: string | null = null;
	export let input: string;
	export let output: string;
	export let sourceLanguage: LanguagesInCodeKeys;
	export let targetLanguage: LanguagesInCodeKeys;

	let loading = false;

	$: isBookmarked = $bookmarks.find((e) => e.historyId === historyId) === undefined ? false : true;

	$: console.log(isBookmarked);

	async function handleAdd() {
		if (!historyId || isBookmarked) return;

		loading = true;
		await trpc().addToBookmark.mutate({
			historyId,
			input,
			output,
			sourceLanguage,
			targetLanguage
		});
		await fetchBookmarks();
		loading = false;
	}

	async function handleRemove() {
		if (!historyId || !isBookmarked) return;

		loading = true;

		let response = await trpc().deleteBookmark.query({
			historyId
		});

		console.log(response);

		await fetchBookmarks();
		loading = false;
	}

	function handleSubmit() {
		if (!historyId) return;
		if (isBookmarked) {
			handleRemove();
		} else {
			handleAdd();
		}
	}
</script>

<Button
	size="sm"
	variant="ghost"
	class="w-fit h-fit rounded-full text-xl text-theme-600 hover:text-theme-500 bg-transparent opacity-90 hover:opacity-100 transition-all flex justify-center items-center p-2"
	on:click={handleSubmit}
>
	{#if loading}
		<Icon icon="svg-spinners:270-ring-with-bg" />
	{:else}
		<!--  -->
		{#if historyId && isBookmarked}
			<Icon icon="material-symbols:bookmark" />
		{:else}
			<Icon icon="material-symbols:bookmark-outline" />
		{/if}
		<!--  -->
	{/if}
</Button>
