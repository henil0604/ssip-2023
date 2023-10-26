<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { trpc } from '$lib/trpc/client';
	import Icon from '@iconify/svelte';
	import * as Card from '$lib/components/ui/card';
	import { debounce } from 'lodash-es';
	import { Switch } from '$lib/components/ui/switch';

	let input = '';
	let output = '';
	let responseOutput = '';
	let loading = false;

	let textareaHeight = 100;

	function autoResize(event: Event) {
		const target = event.target as HTMLTextAreaElement;

		textareaHeight = target.scrollHeight;
	}

	async function translate() {
		deboundedTranslate.cancel();
		responseOutput = '';
		loading = true;
		const response = await trpc().translate.query({
			text: input
		});

		loading = false;
		responseOutput = response;
	}

	$: output = loading === true ? 'Translating...' : responseOutput;

	const deboundedTranslate = debounce(translate, 1000);
</script>

<div class="w-full h-screen flex justify-center gap-6">
	<div class="container py-20">
		<!-- translator wrapper -->

		<div class="flex max-md:flex-col gap-3 items-stretch">
			<!-- english -->
			<div class="flex-grow flex flex-col w-full min-h-full h-full gap-1.5">
				<Label>English</Label>
				<Textarea
					on:input={autoResize}
					on:keydown={(e) => {
						if (e.keyCode === 13) {
							e.preventDefault();
							translate();
						}
					}}
					on:input={() => deboundedTranslate()}
					bind:value={input}
					style="height: {textareaHeight}px;"
					class="min-h-[200px] border-black text-xl resize-none"
					placeholder="Start typing..."
				/>
				<Card.Root class="border-black p-0">
					<Card.Content class="py-5">
						<!-- auto bulletins -->
						<div class="flex justify-between items-center">
							<div class="flex flex-col flex-grow gap-0.5">
								<h1>Educational Translation</h1>
							</div>
							<Switch class="!bg-black" checked={false} />
							<div class="flex flex-col flex-grow items-end gap-0.5">
								<h1>Pure Gujarati Translation</h1>
							</div>
						</div>
						<hr class="my-3" />
						<!-- auto summarize -->
						<div class="flex justify-between items-center">
							<div class="flex flex-col flex-grow gap-0.5">
								<h1>Auto Summarize</h1>
								<p class="text-muted-foreground text-sm">
									Tries to present given text in summarized format
								</p>
							</div>
							<Switch checked={true} />
						</div>

						<hr class="my-3" />
						<!-- auto bulletins -->
						<div class="flex justify-between items-center">
							<div class="flex flex-col flex-grow gap-0.5">
								<h1>Auto Bulletins</h1>
								<p class="text-muted-foreground text-sm">
									Tries to present given text in bulletin format
								</p>
							</div>
							<Switch checked={true} />
						</div>

						<hr class="my-3" />
					</Card.Content>
				</Card.Root>
			</div>

			<!-- gujarati -->
			<div class="flex-grow flex flex-col w-full min-h-full h-full gap-1.5">
				<Label>Gujarati</Label>
				<Textarea
					on:input={autoResize}
					readonly
					bind:value={output}
					style="height: {textareaHeight}px; color: #000;"
					class="min-h-[200px] border-black text-xl bg-gray-100 resize-none"
				/>
				{#if false}
					<Card.Root class="py-0 border-black">
						<Card.Content class="py-3">
							<!--  -->
						</Card.Content>
					</Card.Root>
				{/if}
			</div>
		</div>
	</div>
</div>
