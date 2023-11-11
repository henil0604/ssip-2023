<script lang="ts">
	import tippy from 'svelte-tippy';
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';
	import { tesseractWorker } from '$lib/store';

	export let input: string;
	export let isFileBeingImported = false;
	export let loadingStatus = '';

	async function textExtractor(file: File): Promise<string> {
		if (file.type.startsWith('image')) {
			loadingStatus = 'Loading parser';
			let worker = $tesseractWorker!;
			if (!worker) {
				await new Promise((resolve) => {
					loadingStatus = 'Initializing parser';
					tesseractWorker.subscribe(() => {
						if ($tesseractWorker) {
							worker = $tesseractWorker;
							resolve(void 0);
						}
					});
				});
			}
			loadingStatus = 'Recognizing';
			const result = await worker.recognize(file);

			console.log('result?', result);

			loadingStatus = 'Parsing text';

			let text = result.data.text;

			text = text.replaceAll('\n', ' ').replaceAll('\n\n', '\n');

			return text;
		}

		return file.text();
	}

	function handleUpload() {
		const inputElement = document.createElement('input');
		inputElement.type = 'file';
		inputElement.style.position = 'absolute';
		inputElement.style.top = '0';
		inputElement.accept = 'text/*,image/*';
		inputElement.style.left = '0';
		inputElement.style.display = 'none';

		document.body.appendChild(inputElement);

		inputElement.oninput = async () => {
			if (!inputElement || !inputElement.files) return;

			const file = inputElement.files[0];

			if (!file) return;

			console.log('file?', file);

			isFileBeingImported = true;

			const text = await textExtractor(file);

			console.log('text?', text);

			input = text;

			isFileBeingImported = false;

			document.body.removeChild(inputElement);
		};

		inputElement.click();
	}
</script>

<div use:tippy={{ content: 'Upload txt file', placement: 'bottom' }}>
	<Button
		variant="ghost"
		class="flex justify-center items-center bg-transparent opacity-60 hover:opacity-100 transition-all p-1"
		on:click={handleUpload}
	>
		<Icon class="text-xl" icon="dashicons:upload" />
	</Button>
</div>
