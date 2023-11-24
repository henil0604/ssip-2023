<script>
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import '../app.postcss';
	import Header from './Header.svelte';
	import 'tippy.js/dist/tippy.css';
	import { tesseractWorker } from '$lib/store';
	import { createWorker } from 'tesseract.js';
	import { ToastContainer, FlatToast } from 'svelte-toasts';
	import { browser } from '$app/environment';

	onMount(async () => {
		console.log('creating tesseract worker...');
		$tesseractWorker = await createWorker('eng');
		console.log('tesseract worker created...');
	});
</script>

<svelte:head>
	<script src="https://cdn.jsdelivr.net/npm/pdfjs-dist@3.6.172/build/pdf.min.js"></script>
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link href="/prism.css" />
	<script src="/prism.js" defer></script>
	<link
		href="https://fonts.googleapis.com/css2?family=Noto+Sans+Gujarati:wght@300;400&display=swap"
		rel="stylesheet"
	/>
	<link
		href="https://fonts.googleapis.com/css2?family=Noto+Sans+Gujarati:wght@300;400&family=Poppins&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

{#if browser}
	<ToastContainer placement="bottom-right" let:data>
		<FlatToast {data} />
		<!-- Provider template for your toasts -->
	</ToastContainer>
{/if}

<div class="flex flex-col min-h-full">
	<Header />
	<slot />
</div>
