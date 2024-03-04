<script>
	import { page } from '$app/stores';
	import Icon from '@iconify/svelte';

	const modes = [
		{
			name: 'Feedbacks',
			href: '/admin/feedbacks',
			icon: 'uil:feedback',
			description: ''
		}
	];

	$: selectedDescription = modes.find((e) => e.href === $page.url.pathname)?.description || '';

	$: user = $page.data.session?.user;
</script>

<div class="w-full flex justify-between items-center">
	<div class="flex gap-2 max-md:max-w-[150px] overflow-x-auto">
		{#each modes as mode}
			{@const isActive = mode.href === $page.url.pathname}
			<a
				class="min-w-[100px] border rounded flex justify-center py-2 px-3 gap-2 items-center shadow transition-all cursor-pointer {isActive
					? 'bg-theme-600 text-white'
					: 'bg-white hover:shadow-lg hover:-translate-y-1'}"
				href={mode.href}
			>
				<Icon
					icon={mode.icon}
					class="min-w-fit min-h-fit text-xl {isActive ? 'text-white' : 'text-theme-700'}"
				/>
				<h1 class="h-fit p-0 {isActive ? 'font-semibold' : ''}">{mode.name}</h1>
			</a>
		{/each}
	</div>
</div>
