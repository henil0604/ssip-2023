<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';
	import { tippy } from 'svelte-tippy';
	import type { Writable } from 'svelte/store';

	export let file: Writable<File | null>;

	function getFile() {
		var inputElement = document.createElement('input');
		inputElement.type = 'file';
		inputElement.style.display = 'none';
		inputElement.style.position = 'absolute';
		inputElement.style.top = '0';
		inputElement.style.left = '0';
		document.body.appendChild(inputElement);
		inputElement.addEventListener('change', (e) => {
			$file = inputElement.files![0];
			inputElement.remove();
		});
		inputElement.click();
	}
</script>

<div use:tippy={{ content: 'Upload', placement: 'bottom' }}>
	<Button
		variant="ghost"
		class="w-fit h-fit rounded-full flex justify-center items-center bg-transparent opacity-90 hover:opacity-100 transition-all p-1"
		on:click={() => {
			getFile();
		}}
	>
		<Icon class="text-2xl" icon="iconoir:upload" />
	</Button>
</div>
