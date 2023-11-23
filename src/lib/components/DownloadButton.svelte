<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';
	import { tippy } from 'svelte-tippy';

	export let text = '';

	function downloadTxtFile(text: string) {
		if (!text.trim()) return;

		var downloadAnchor = document.createElement('a');
		downloadAnchor.setAttribute(
			'href',
			'data:text/plain;charset=utf-8,' + encodeURIComponent(text)
		);
		downloadAnchor.setAttribute('download', `varnantar-${(Date.now() / 1000).toFixed(0)}.txt`);

		downloadAnchor.style.display = 'none';
		document.body.appendChild(downloadAnchor);

		downloadAnchor.click();

		document.body.removeChild(downloadAnchor);
	}
</script>

<div use:tippy={{ content: 'Download', placement: 'bottom' }}>
	<Button
		variant="ghost"
		class="w-fit h-fit rounded-full flex justify-center items-center bg-transparent opacity-90 hover:opacity-100 transition-all p-1"
		on:click={() => {
			downloadTxtFile(text);
		}}
	>
		<Icon class="text-2xl" icon="iconoir:download" />
	</Button>
</div>
