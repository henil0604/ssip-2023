<script lang="ts">
	import { Button as ButtonPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils';
	import { buttonVariants, type Props, type Events } from '.';
	import Icon from '@iconify/svelte';

	type $$Props = Props & {
		loading?: boolean;
	};
	type $$Events = Events;

	let className: $$Props['class'] = undefined;
	export let variant: $$Props['variant'] = 'default';
	export let size: $$Props['size'] = 'default';
	export let builders: $$Props['builders'] = [];
	export let loading: boolean = false;
	export { className as class };
</script>

<ButtonPrimitive.Root
	{builders}
	class={cn(buttonVariants({ variant, size, className }))}
	on:click
	on:keydown
	disabled={loading || $$restProps.disabled}
	{...$$restProps}
>
	{#if loading}
		<Icon class="text-xl" icon="line-md:loading-loop" />
	{:else}
		<slot />
	{/if}
</ButtonPrimitive.Root>
