import { defineMDSveXConfig as defineConfig } from 'mdsvex';
import math from 'remark-math';
import rehype_katex from 'rehype-katex';
import katex from 'katex';


const correct_hast_tree = () => (tree) => {
	visit(tree, 'text', (node) => {
		if (node.value.trim().startsWith('<')) {
			node.type = 'raw';
		}
	});
};


const katex_blocks = () => (tree) => {
	visit(tree, 'code', (node) => {
		if (node.lang === 'math') {
			const str = katex.renderToString(node.value, {
				displayMode: true,
				leqno: false,
				fleqn: false,
				throwOnError: true,
				errorColor: '#cc0000',
				strict: 'warn',
				output: 'htmlAndMathml',
				trust: false,
				macros: { '\\f': '#1f(#2)' }
			});

			node.type = 'raw';
			node.value = '{@html `' + str + '`}';
		}
	});
};


const config = defineConfig({
	extensions: ['.svelte.md', '.md', '.svx'],

	smartypants: {
		dashes: 'oldschool',
	},

	highlight: {
		highlighter: (code, lang) => {
			if (lang && Prism.languages[lang]) {
				console.log(lang)
				const parsed = Prism.highlight(code, Prism.languages[lang]);
				const escaped = parsed
					.replace(/{/g, '&#123;')
					.replace(/}/g, '&#125;');
				const langTag = 'language-' + lang;
				const codeTag = `<code class=${langTag}>${escaped}</code>`;
				const pre = `<pre class=${langTag}>${codeTag}</pre>`;
				return `<Components.CodeBlock lang='${lang}'>${pre}</Components.CodeBlock>`;
			} else {
				const escaped = code.replace(/{/g, '&#123;').replace(/}/g, '&#125;');
				const pre = `<pre><code>${escaped}</code></pre>`;
				return `<Components.CodeBlock>${pre}</Components.CodeBlock>`;
			}
		},
	},
	remarkPlugins: [math, katex_blocks],
	rehypePlugins: [correct_hast_tree, rehype_katex]
});

export default config;
