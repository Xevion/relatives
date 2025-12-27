<script lang="ts">
	import { parseNumericExpression } from '$lib/utils/parse-numeric.js';
	import Input from '../input/input.svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLInputAttributes, 'value' | 'type' | 'files'> {
		value?: number;
	}

	let {
		value = $bindable(0),
		class: className,
		...restProps
	}: Props = $props();

	let displayValue = $state(String(value));
	let isValid = $state(true);
	let inputElement: HTMLInputElement | null = $state(null);

	// Update display when value changes externally
	$effect(() => {
		if (document.activeElement !== inputElement) {
			displayValue = String(value);
			isValid = true;
		}
	});

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		displayValue = target.value;

		const parsed = parseNumericExpression(displayValue);
		
		if (parsed !== null) {
			value = parsed;
			isValid = true;
		} else {
			isValid = displayValue.trim() === '';
		}
	}

	function handleBlur() {
		// On blur, format to the actual value if valid
		const parsed = parseNumericExpression(displayValue);
		if (parsed !== null) {
			value = parsed;
			displayValue = String(parsed);
			isValid = true;
		} else if (displayValue.trim() === '') {
			displayValue = String(value);
			isValid = true;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		const step = e.shiftKey ? 10 : e.altKey ? 0.1 : 1;

		if (e.key === 'ArrowUp') {
			e.preventDefault();
			value = value + step;
			displayValue = String(value);
			isValid = true;
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			value = value - step;
			displayValue = String(value);
			isValid = true;
		} else if (e.key === 'PageUp') {
			e.preventDefault();
			value = value + 100;
			displayValue = String(value);
			isValid = true;
		} else if (e.key === 'PageDown') {
			e.preventDefault();
			value = value - 100;
			displayValue = String(value);
			isValid = true;
		}
	}
</script>

<Input
	bind:ref={inputElement}
	type="text"
	inputmode="decimal"
	value={displayValue}
	oninput={handleInput}
	onblur={handleBlur}
	onkeydown={handleKeydown}
	class={`${className || ''} ${!isValid ? 'border-destructive focus-visible:ring-destructive' : ''}`}
	{...restProps}
/>
