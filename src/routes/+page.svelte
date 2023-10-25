<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { trpc } from '$lib/trpc/client';
	import Icon from '@iconify/svelte';

	let input = '';
	let output = '';
	let loading = false;

	let textareaHeight = 100;

	function autoResize(event: Event) {
		const target = event.target as HTMLTextAreaElement;

		textareaHeight = target.scrollHeight;
	}

	async function translate() {
		loading = true;
		const response = await trpc().translate.query({
			text: input
		});

		output = response;
		loading = false;
	}
</script>

<div class="w-full h-screen flex justify-center gap-6">
	<div class="container py-20">
		<!-- translator wrapper -->
		<div class="flex max-md:flex-col gap-3">
			<!-- english -->
			<div class="flex-grow grid w-full min-h-full gap-1.5">
				<Label>English</Label>
				<Textarea
					on:input={autoResize}
					on:keydown={(e) => {
						if (e.keyCode === 13 && !e.shiftKey) {
							e.preventDefault();
							translate();
						}
					}}
					disabled={loading}
					bind:value={input}
					style="height: {textareaHeight}px;"
					class="min-h-[200px] border-black text-xl"
				/>
			</div>

			<div
				class="flex flex-col w-fit max-md:w-full min-h-full max-md:min-h-[auto] justify-center items-center"
			>
				<Button {loading} on:click={translate} size="sm">Translate</Button>
			</div>

			<!-- gujarati -->
			<div class="flex-grow grid w-full min-h-full gap-1.5">
				<Label>Gujarati</Label>
				<Textarea
					on:input={autoResize}
					readonly
					bind:value={output}
					disabled
					style="height: {textareaHeight}px;"
					class="min-h-[200px] border-black text-xl bg-gray-300"
				/>
			</div>
		</div>
	</div>
</div>
