<script>
	import '../app.postcss';
	import Header from './Header.svelte';
	import 'tippy.js/dist/tippy.css';
</script>

<div class="flex flex-col min-h-full">
	<Header />
	<slot />
</div>
