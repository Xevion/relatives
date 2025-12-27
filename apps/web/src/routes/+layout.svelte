<script lang="ts">
	import '@fontsource/inter/400.css';
	import '@fontsource/inter/500.css';
	import '@fontsource/inter/600.css';
	import '@fontsource/inter/700.css';
	import 'overlayscrollbars/overlayscrollbars.css';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { OverlayScrollbarsComponent } from 'overlayscrollbars-svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<!-- Prevent flash of wrong theme -->
	{@html `<script>
		(function() {
			const stored = localStorage.getItem('theme');
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			if (stored === 'dark' || (!stored && prefersDark)) {
				document.documentElement.classList.add('dark');
			}
		})();
	</script>`}
</svelte:head>

<div class="fixed top-3 right-3 z-50 md:top-4 md:right-4">
	<ThemeToggle />
</div>

<OverlayScrollbarsComponent
	options={{
		scrollbars: {
			autoHide: 'leave',
			autoHideDelay: 800,
			theme: 'os-theme-light'
		}
	}}
	class="h-screen"
>
	{@render children()}
</OverlayScrollbarsComponent>
