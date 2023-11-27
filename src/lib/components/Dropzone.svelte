<script lang="ts">
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import { fade, scale } from 'svelte/transition';

	export let ref: HTMLDivElement | null = null;
	export let isBeingDropped = false;

	const dispatcher = createEventDispatcher();

	onMount(() => {
		['dragenter', 'dragover', 'dragleave', 'drop'].forEach((eventName) => {
			ref!.addEventListener(eventName, preventDefaults, false);
		});

		['dragenter', 'dragover'].forEach((eventName) => {
			ref!.addEventListener(eventName, highlight, false);
		});

		['dragleave', 'drop'].forEach((eventName) => {
			ref!.addEventListener(eventName, unhighlight, false);
		});

		ref!.addEventListener('drop', handleDrop, false);
	});

	onDestroy(() => {
		if (!ref) return;

		['dragenter', 'dragover', 'dragleave', 'drop'].forEach((eventName) => {
			ref!.removeEventListener(eventName, preventDefaults, false);
		});

		['dragenter', 'dragover'].forEach((eventName) => {
			ref!.removeEventListener(eventName, highlight, false);
		});

		['dragleave', 'drop'].forEach((eventName) => {
			ref!.removeEventListener(eventName, unhighlight, false);
		});

		ref!.removeEventListener('drop', handleDrop, false);
	});

	export function preventDefaults(event: Event) {
		event.preventDefault();
		event.stopPropagation();
	}

	export function highlight(event: Event) {
		isBeingDropped = true;
	}

	export function unhighlight(event: Event) {
		isBeingDropped = false;
	}

	export function handleDrop(event: DragEvent) {
		isBeingDropped = false;
		let dt = event.dataTransfer;
		let files = dt?.files;

		if (!files) {
			return;
		}

		if (files.length > 2) {
			console.error('Only accepts one file');
		}

		dispatcher('drop', {
			file: files.item(0)
		});
	}

	$: console.log('isBeingDropped?', isBeingDropped);
</script>

<div bind:this={ref} class="min-w-fit min-h-fit relative" class:dropzone={isBeingDropped}>
	{#if isBeingDropped}
		<div class="w-full h-full p-4 transition absolute z-[2] top-0 left-0 bg-transparent">
			<div class="relative w-full h-full bg-transparent">
				<div
					class="absolute w-full h-full top-0 left-0 z-[1] bg-theme-500 border-4 border-white border-dotted opacity-80"
				/>
				<div
					class="absolute top-0 left-0 w-full h-full flex justify-center items-center z-[3] bg-transparent text-white"
				>
					<h1 class="text-4xl">Drop files here</h1>
				</div>
			</div>
		</div>
	{/if}
	<div class:dropzone={isBeingDropped}>
		<slot />
	</div>
</div>

<style lang="postcss" scoped>
	.dropzone * {
		pointer-events: none;
	}
</style>
