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
	export let height: number = DEFAULT_EDITOR_HEIGHT;

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

	export function resize() {
		if (value.trim() === '') {
			height = DEFAULT_EDITOR_HEIGHT;
		} else {
			if (autoExpand) {
				height = Math.max(editorRef?.scrollHeight || 0, DEFAULT_EDITOR_HEIGHT);
			}
		}
	}
</script>

<div class={cn('relative', wrapperClass)} style="height: {height}px;">
	<div
		bind:this={editorRef}
		contenteditable="plaintext-only"
		class={cn(
			'w-full h-full flex-grow outline-none px-4 py-3 pr-10 z-[2] absolute top-0 left-0 bg-transparent text-xl',
			inputClass
		)}
		bind:innerText={value}
	/>

	{#if value !== '' && allowClearButton}
		<div use:tippy={{ content: 'Clear', placement: 'bottom' }}>
			<Button
				class="outline-none absolute top-0 right-0 z-[2] hover:bg-transparent"
				on:click={() => (value = '')}
				variant="ghost"
			>
				<Icon class="text-lg" icon="mdi:close" />
			</Button>
		</div>
	{/if}

	<slot />

	{#if $$slots.placeholder && value === ''}
		<div class="w-full h-full text-muted-foreground absolute top-0 z-[1] left-0 px-4 py-3">
			<slot name="placeholder" />
		</div>
	{/if}
</div>
