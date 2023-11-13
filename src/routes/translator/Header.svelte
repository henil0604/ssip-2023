<script>
	import { page } from '$app/stores';
	import Icon from '@iconify/svelte';

	const modes = [
		{
			name: 'Translate Text',
			href: '/translator',
			icon: 'solar:text-bold',
			description: '60+ Languages'
		},
		{
			name: 'Translate File',
			href: '/translator/file',
			icon: 'bx:file',
			description: '.png, .jpg, URL'
		}
	];
</script>

<div class="flex gap-1">
	<!--  -->
	{#each modes as mode}
		{@const isActive = mode.href === $page.url.pathname}
		<a
			class="rounded flex justify-center p-2 gap-2 items-center shadow transition-all cursor-pointer {isActive
				? 'bg-orange-600 text-white'
				: 'bg-white hover:shadow-lg hover:-translate-y-1'}"
			href={mode.href}
		>
			<Icon icon={mode.icon} class={isActive ? 'text-white' : 'text-orange-700'} width="30" />
			<div class="flex flex-col">
				<h1 class="text-sm">{mode.name}</h1>
				<p class="text-muted-foreground text-[10px]" class:text-white={isActive}>
					{mode.description}
				</p>
			</div>
		</a>
	{/each}
</div>
