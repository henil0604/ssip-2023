<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import Icon from '@iconify/svelte';
	import { Button } from '$lib/components/ui/button';
	import { signIn } from '@auth/sveltekit/client';
	import { page } from '$app/stores';

	export let open = false;

	let providers = [
		{
			name: 'Google',
			id: 'google',
			icon: 'devicon:google'
		}
	];

	function handleSignIn(id: string) {
		return signIn(id, {
			callbackUrl: '/'
		});
	}
</script>

<Dialog.Root preventScroll={false} bind:open forceVisible={true}>
	<Dialog.Content class="min-w-[400px] w-fit max-w-fit max-h-[60%] overflow-auto">
		<h1 class="font-semibold">Continue with...</h1>
		<div class="flex flex-col">
			{#each providers as provider}
				<Button
					variant="outline"
					class="flex gap-4 py-3 h-fit text-lg justify-center items-center"
					on:click={() => handleSignIn(provider.id)}
				>
					<Icon class="text-xl" icon={provider.icon} />
					{provider.name}
				</Button>
			{/each}
		</div>
	</Dialog.Content>
</Dialog.Root>
