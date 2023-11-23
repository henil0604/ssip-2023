<script lang="ts">
	import { DEFAULT_EDITOR_HEIGHT } from '$lib/const';
	import { cn } from '$lib/utils';
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';
	import tippy from 'svelte-tippy';
	import { uniqueId } from 'lodash-es';
	import generateId from '$lib/modules/generateId';

	export let value = '';
	export let defaultHeight = DEFAULT_EDITOR_HEIGHT;
	export let height: number = defaultHeight;

	export let wrapperClass = '';
	export let inputClass = '';
	export let readonly = false;

	export let editorRef: HTMLDivElement | null = null;

	export let allowClearButton = true;
	export let autoExpand = true;
	export let id = generateId();

	onMount(() => {
		if (readonly && editorRef) {
			editorRef.contentEditable = 'false';
		}
	});

	$: if (readonly && editorRef) {
		editorRef!.contentEditable = 'false';
	} else if (!readonly && editorRef) {
		editorRef!.contentEditable = 'true';
	}

	export function resize() {
		if (value.trim() === '') {
			height = defaultHeight;
		} else {
			if (autoExpand) {
				height = Math.max(editorRef?.scrollHeight || 0, defaultHeight);
			}
		}
	}

	$: value && resize();
</script>

<div class={cn('relative', wrapperClass)} style="height: {height}px;">
	<div
		id="editArea-{id}"
		bind:this={editorRef}
		contenteditable="plaintext-only"
		class={cn(
			'w-full min-h-fit max-h-fitt break-words flex-grow outline-none px-4 py-3 pr-16 z-[2] absolute top-0 left-0 bg-transparent text-xl',
			inputClass
		)}
		bind:innerText={value}
	/>

	{#if value !== '' && allowClearButton}
		<Button
			class="outline-none absolute top-0 right-0 z-[2] hover:bg-transparent"
			on:click={() => (value = '')}
			variant="ghost"
		>
			<Icon class="text-lg" icon="mdi:close" />
		</Button>
	{/if}

	<slot />

	{#if $$slots.placeholder && value === ''}
		<div class="w-full h-full text-muted-foreground absolute top-0 z-[1] left-0 px-4 py-3">
			<slot name="placeholder" />
		</div>
	{/if}
</div>
