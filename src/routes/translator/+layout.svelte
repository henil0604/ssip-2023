<script>
	import Header from './Header.svelte';
</script>

<div class="min-w-fit min-h-fit flex flex-col py-6 px-32">
	<Header />
	<div class="my-2" />
	<slot />
</div>
