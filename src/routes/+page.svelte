<script>
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { trpc } from '$lib/trpc/client';

	let input = '';
	let output = '';

	async function translate() {
		const response = await trpc().translate.query({
			text: input
		});

		console.log(response);
		output = response;
	}
</script>

<div class="w-full h-screen flex justify-center items-center flex-col gap-6">
	<Input bind:value={input} class="border-black w-fit" />
	<Button on:click={translate}>Translate</Button>
	<div class="my-4">{output}</div>
</div>
