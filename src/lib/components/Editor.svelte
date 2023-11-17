<script lang="ts">
	import { cn } from '$lib/utils';
	import { onMount } from 'svelte';

	let DEFAULT_HEIGHT = 170;

	export let value = '';
	export let height = DEFAULT_HEIGHT;

	export let wrapperClass = '';
	export let inputClass = '';
	export let readonly = false;

	let editorRef: HTMLDivElement;

	onMount(() => {
		if (readonly) {
			editorRef.contentEditable = 'false';
		}
	});

	// if the value is empty
	$: if (value.trim() === '') {
		height = DEFAULT_HEIGHT;
	} else {
		height = Math.max(DEFAULT_HEIGHT, editorRef.scrollHeight);
	}
</script>

<div class={cn('relative', wrapperClass)} style="height: {height}px;">
	<div
		bind:this={editorRef}
		contenteditable="plaintext-only"
		class={cn(
			'w-full h-fit flex-grow outline-none px-4 py-3 z-[2] absolute top-0 left-0 bg-transparent',
			inputClass
		)}
		bind:innerText={value}
	/>

	{#if $$slots.placeholder && value === ''}
		<div class="w-full h-full text-muted-foreground absolute top-0 z-[1] left-0 px-4 py-3">
			<slot name="placeholder" />
		</div>
	{/if}
</div>
