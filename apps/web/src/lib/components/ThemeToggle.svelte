<script lang="ts">
	import { browser } from '$app/environment';

	let isDark = $state(false);

	// Initialize from localStorage or system preference
	if (browser) {
		const stored = localStorage.getItem('theme');
		if (stored) {
			isDark = stored === 'dark';
		} else {
			isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		}
		updateTheme();
	}

	function updateTheme() {
		if (!browser) return;
		
		// Use View Transition API if available for smooth theme switching
		const doc = document as any;
		if (doc.startViewTransition) {
			doc.startViewTransition(() => {
				document.documentElement.classList.toggle('dark', isDark);
			});
		} else {
			document.documentElement.classList.toggle('dark', isDark);
		}
		localStorage.setItem('theme', isDark ? 'dark' : 'light');
	}

	function toggle() {
		isDark = !isDark;
		updateTheme();
	}
</script>

<button
	onclick={toggle}
	class="m-2 flex items-center justify-center focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ring"
	aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
>
	<div class="relative size-4 md:size-7" style="view-transition-name: none;">
		<!-- Sun icon (shows when dark mode is active) -->
		<svg
			class="absolute inset-0 text-gray-500 will-change-[opacity,transform] {isDark
				? 'scale-100 rotate-0 opacity-60 hover:opacity-100'
				: 'scale-60 rotate-30 opacity-0'}"
			style="transition: opacity 300ms ease, transform 300ms ease;"
			width="28"
			height="28"
			viewBox="0 0 24 24"
			fill="currentColor"
		>
			<circle cx="12" cy="12" r="5" />
			<rect x="11" y="1" width="2" height="4" rx="1" />
			<rect x="11" y="19" width="2" height="4" rx="1" />
			<rect x="19" y="11" width="4" height="2" rx="1" />
			<rect x="1" y="11" width="4" height="2" rx="1" />
			<rect x="17.3" y="4.1" width="2" height="4" rx="1" transform="rotate(45 18.3 6.1)" />
			<rect x="4.7" y="15.9" width="2" height="4" rx="1" transform="rotate(45 5.7 17.9)" />
			<rect x="15.9" y="17.3" width="4" height="2" rx="1" transform="rotate(45 17.9 18.3)" />
			<rect x="4.1" y="4.7" width="4" height="2" rx="1" transform="rotate(45 6.1 5.7)" />
		</svg>
		<!-- Moon icon (shows when light mode is active) -->
		<svg
			class="absolute inset-0 text-gray-500 will-change-[opacity,transform] {!isDark
				? 'scale-100 rotate-0 opacity-60 hover:opacity-100'
				: 'scale-60 rotate-30 opacity-0'}"
			style="transition: opacity 300ms ease, transform 300ms ease;"
			width="28"
			height="28"
			viewBox="0 0 24 24"
			fill="currentColor"
		>
			<path
				d="M21.752 15.002A9.718 9.718 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
			/>
		</svg>
	</div>
</button>
