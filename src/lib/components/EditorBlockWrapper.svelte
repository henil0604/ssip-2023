<script lang="ts">
	import Editor from '$lib/components/Editor.svelte';
	import { Button } from '$lib/components/ui/button';
	import { DEFAULT_EDITOR_HEIGHT } from '$lib/const';
	import type { changesSchema } from '$lib/server/modules/postReplacerLayer';
	import Icon from '@iconify/svelte';
	import type { z } from 'zod';
	import * as Accordion from '$lib/components/ui/accordion';

	export let value = '';
	export let defaultHeight = DEFAULT_EDITOR_HEIGHT;
	export let height: number = defaultHeight;
	export let editor: Editor | null = null;
	export let readonly = true;
	export let allowEditButton = false;
	export let wrapperClass = '';
	export let changes: z.infer<typeof changesSchema> = [];

	let modes = ['Changes', 'Synonyms', 'Technical Terms'] as const;
	let mode: (typeof modes)[number] = 'Changes';
</script>

<div class="min-w-full grow-0 min-h-fit flex flex-col gap-0 border border-gray-400 rounded">
	<Editor
		bind:defaultHeight
		id="originalOutput"
		bind:readonly
		bind:wrapperClass
		bind:this={editor}
		bind:value
		bind:height
		allowClearButton={false}
	>
		<svelte:fragment slot="placeholder">
			<slot name="placeholder" />
		</svelte:fragment>
		<div class="absolute right-0 top-0 p-3 px-4 z-[2] flex flex-col h-full w-fit">
			<!--  -->
			{#if allowEditButton}
				<Button
					on:click={() => (readonly = !readonly)}
					variant="outline"
					class="w-fit h-fit p-2 rounded-full"
				>
					{#if readonly}
						<Icon class="text-lg" icon="mdi:pencil" />
					{:else}
						<Icon class="text-lg" icon="mdi:tick" />
					{/if}
				</Button>
			{/if}
		</div>
	</Editor>
	{#if changes.length > 0}
		<div class="border-t px-3 py-2">
			<div class="flex gap-2">
				{#each modes as cm}
					{@const isActive = mode === cm}
					<Button
						class="border rounded flex justify-center py-2 px-3 gap-2 items-center shadow transition-all cursor-pointer {isActive
							? 'border-2 border-theme-600 bg-white text-theme-700 hover:bg-white '
							: 'bg-white text-black hover:shadow-lg hover:bg-theme-100 hover:-translate-y-1'}"
						on:click={() => (mode = cm)}
					>
						<h1 class="h-fit p-0 {isActive ? 'font-semibold' : ''}">{cm}</h1>
					</Button>
				{/each}
			</div>
		</div>
	{/if}

	{#if changes.length > 0 && mode === 'Changes'}
		<div class="px-3 py-2 grid grid-cols-3">
			{#each changes as change}
				<div
					class="flex justify-center items-center gap-3 bg-white rounded-full max-w-fit p-2 px-4 border border-gray-400"
				>
					<p>{change.from}</p>
					<Icon icon="fluent:arrow-right-12-regular" />
					<p>{change.to}</p>
				</div>
			{/each}
		</div>
	{/if}

	<div class="p-3 flex justify-between items-end gap-2">
		<div class="flex gap-1">
			<slot name="footerLeft" />
		</div>
		<div class="flex justify-end gap-1">
			<slot name="footerRight" />
		</div>
	</div>
</div>
