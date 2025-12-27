<script lang="ts">
  import { compare, dimensions, type ComparisonResponse } from '@relatives/core';
  import { autoAnimate } from '@formkit/auto-animate';

  let value = $state(70);
  let selectedDimension = $state('length');
  let selectedUnit = $state('micrometer');
  let excludeAmerican = $state(false);
  let limit = $state(10);

  // Weight sliders
  let closenessWeight = $state(0.4);
  let relatabilityWeight = $state(0.35);
  let accuracyWeight = $state(0.25);

  // Get units for selected dimension
  let availableUnits = $derived(dimensions[selectedDimension]?.units ?? []);

  // Reset unit when dimension changes
  $effect(() => {
    const dim = dimensions[selectedDimension];
    if (dim) {
      selectedUnit = dim.baseUnit;
    }
  });

  let results: ComparisonResponse | null = $state(null);
  let error: string | null = $state(null);
  let searching = $state(false);

  function runComparison() {
    searching = true;
    error = null;
    try {
      results = compare({
        value,
        unit: selectedUnit,
        dimension: selectedDimension,
        filters: excludeAmerican ? { excludeTags: ['american'] } : undefined,
        weights: {
          closeness: closenessWeight,
          relatability: relatabilityWeight,
          accuracy: accuracyWeight,
        },
        limit,
      });
    } catch (e) {
      error = e instanceof Error ? e.message : 'Unknown error';
      results = null;
    }
    setTimeout(() => searching = false, 50);
  }

  // Debounced reactive search on any input change
  let debounceTimeout: ReturnType<typeof setTimeout> | undefined;
  
  $effect(() => {
    // Track all input dependencies
    value; selectedDimension; selectedUnit; excludeAmerican; limit;
    closenessWeight; relatabilityWeight; accuracyWeight;
    
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => runComparison(), 100);
    
    return () => clearTimeout(debounceTimeout);
  });

  interface NumberScale {
    threshold: number;
    name: string;
    decimals: number;
  }

  const NUMBER_SCALES: NumberScale[] = [
    { threshold: 1e100, name: 'googol', decimals: 0 },
    { threshold: 1e63, name: 'vigintillion', decimals: 0 },
    { threshold: 1e60, name: 'novemdecillion', decimals: 0 },
    { threshold: 1e57, name: 'octodecillion', decimals: 0 },
    { threshold: 1e54, name: 'septendecillion', decimals: 0 },
    { threshold: 1e51, name: 'sexdecillion', decimals: 0 },
    { threshold: 1e48, name: 'quindecillion', decimals: 0 },
    { threshold: 1e45, name: 'quattuordecillion', decimals: 0 },
    { threshold: 1e42, name: 'tredecillion', decimals: 1 },
    { threshold: 1e39, name: 'duodecillion', decimals: 1 },
    { threshold: 1e36, name: 'undecillion', decimals: 1 },
    { threshold: 1e33, name: 'decillion', decimals: 1 },
    { threshold: 1e30, name: 'nonillion', decimals: 1 },
    { threshold: 1e27, name: 'octillion', decimals: 1 },
    { threshold: 1e24, name: 'septillion', decimals: 1 },
    { threshold: 1e21, name: 'sextillion', decimals: 1 },
    { threshold: 1e18, name: 'quintillion', decimals: 1 },
    { threshold: 1e15, name: 'quadrillion', decimals: 1 },
    { threshold: 1e12, name: 'trillion', decimals: 1 },
    { threshold: 1e9, name: 'billion', decimals: 1 },
    { threshold: 1e6, name: 'million', decimals: 1 },
    { threshold: 1e3, name: 'thousand', decimals: 1 },
  ];

  function formatLargeNumber(value: number, decimals: number = 1): string {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals
    });
  }

  function findScale(value: number): NumberScale | undefined {
    return NUMBER_SCALES.find(scale => value >= scale.threshold);
  }

  function formatRatio(ratio: number): string {
    if (ratio === 1) return 'exactly equal to';
    
    if (ratio > 1) {
      const scale = findScale(ratio);
      
      if (scale) {
        const scaled = ratio / scale.threshold;
        return `${formatLargeNumber(scaled, scale.decimals)} ${scale.name} times`;
      }
      
      // No named scale found - use multiplier notation
      if (ratio >= 100) return `${formatLargeNumber(ratio, 0)}x`;
      if (ratio >= 10) return `${formatLargeNumber(ratio, 1)}x`;
      return `${formatLargeNumber(ratio, 2)}x`;
    } else {
      const inverse = 1 / ratio;
      const scale = findScale(inverse);
      
      if (scale) {
        const scaled = inverse / scale.threshold;
        return `1/${formatLargeNumber(scaled, scale.decimals)} ${scale.name}th of`;
      }
      
      // No named scale found - use fractional notation
      if (inverse >= 100) return `1/${formatLargeNumber(inverse, 0)}th of`;
      if (inverse >= 10) return `1/${formatLargeNumber(inverse, 1)}th of`;
      return `${formatLargeNumber(ratio, 2)}x (${formatLargeNumber(inverse, 2)}x smaller)`;
    }
  }

  function getUnitSymbol(unitId: string): string {
    const unit = availableUnits.find((u) => u.id === unitId);
    return unit?.symbol ?? unitId;
  }
</script>

<svelte:head>
  <title>Relatives - Quantity Comparison Engine</title>
</svelte:head>

<main class="mx-auto max-w-3xl px-8 py-8">
  <h1 class="m-0 text-4xl font-normal text-gray-950 dark:text-gray-50">Relatives</h1>
  <p class="mb-8 mt-2 text-gray-600 dark:text-gray-400">Find relatable comparisons for any quantity</p>

  <section class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-900">
    <div class="flex flex-wrap gap-4">
      <label class="flex min-w-[150px] flex-1 flex-col gap-1">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Value</span>
        <input 
          type="number" 
          bind:value 
          step="any" 
          class="form-input dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" 
        />
      </label>

      <label class="flex min-w-[150px] flex-1 flex-col gap-1">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Dimension</span>
        <select 
          bind:value={selectedDimension}
          class="form-select dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
        >
          {#each Object.entries(dimensions) as [id, dim] (id)}
            <option value={id}>{dim.name}</option>
          {/each}
        </select>
      </label>

      <label class="flex min-w-[150px] flex-1 flex-col gap-1">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Unit</span>
        <select 
          bind:value={selectedUnit}
          class="form-select dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
        >
          {#each availableUnits as unit (unit.id)}
            <option value={unit.id}>{unit.symbol} ({unit.id})</option>
          {/each}
        </select>
      </label>
    </div>

    <div class="mt-4 flex flex-wrap items-center gap-4">
      <label class="flex cursor-pointer items-center gap-2">
        <input 
          type="checkbox" 
          bind:checked={excludeAmerican}
          class="form-checkbox rounded text-blue-600 dark:bg-gray-800 dark:border-gray-700"
        />
        <span class="text-sm text-gray-700 dark:text-gray-300">Exclude American-specific references</span>
      </label>

      <label class="flex min-w-[120px] flex-col gap-1">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Results limit</span>
        <input 
          type="number" 
          bind:value={limit} 
          min="1" 
          max="50"
          class="form-input dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
        />
      </label>
    </div>

    <div class="mt-6 border-t border-gray-200 pt-4 dark:border-gray-800">
      <h3 class="mb-3 text-sm font-medium text-gray-600 dark:text-gray-400">Scoring Weights</h3>
      <div class="flex flex-wrap gap-4">
        <label class="flex min-w-[120px] flex-1 flex-col gap-1 text-sm">
          <span class="text-gray-700 dark:text-gray-300">Closeness ({(closenessWeight * 100).toFixed(0)}%)</span>
          <input 
            type="range" 
            bind:value={closenessWeight} 
            min="0" 
            max="1" 
            step="0.05"
            class="form-range"
          />
        </label>
        <label class="flex min-w-[120px] flex-1 flex-col gap-1 text-sm">
          <span class="text-gray-700 dark:text-gray-300">Relatability ({(relatabilityWeight * 100).toFixed(0)}%)</span>
          <input 
            type="range" 
            bind:value={relatabilityWeight} 
            min="0" 
            max="1" 
            step="0.05"
            class="form-range"
          />
        </label>
        <label class="flex min-w-[120px] flex-1 flex-col gap-1 text-sm">
          <span class="text-gray-700 dark:text-gray-300">Accuracy ({(accuracyWeight * 100).toFixed(0)}%)</span>
          <input 
            type="range" 
            bind:value={accuracyWeight} 
            min="0" 
            max="1" 
            step="0.05"
            class="form-range"
          />
        </label>
      </div>
    </div>
  </section>

  {#if error}
    <section class="mt-4 rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-950 dark:text-red-200">
      <p class="m-0">{error}</p>
    </section>
  {/if}

  {#if results}
    <section class="mt-8">
      <h2 class="mb-4 mt-0 text-2xl font-semibold text-gray-950 dark:text-gray-50">
        Comparisons for {value}
        {getUnitSymbol(selectedUnit)}
      </h2>

      <div class="flex flex-col gap-3" use:autoAnimate>
        {#each results.results as result, i (result.measurable.id)}
          <div class="flex gap-4 rounded-lg bg-white p-4 shadow-sm dark:bg-gray-900">
            <div class="min-w-[2rem] text-xl font-bold text-gray-400 dark:text-gray-600">#{i + 1}</div>
            <div class="flex-1">
              <h3 class="m-0 text-lg font-semibold text-gray-950 dark:text-gray-50">{result.measurable.name}</h3>
              {#if result.measurable.description}
                <p class="my-1 text-sm text-gray-600 dark:text-gray-400">{result.measurable.description}</p>
              {/if}
              <p class="my-2 text-base text-gray-900 dark:text-gray-100">
                <strong class="font-semibold">{formatRatio(result.ratio)}</strong> a {result.measurable.name.toLowerCase()}
              </p>
              <div class="mt-2 flex flex-wrap items-center gap-4 text-xs">
                <span class="font-medium text-blue-600 dark:text-blue-400" title="Composite score">
                  Score: {(result.compositeScore * 100).toFixed(1)}%
                </span>
                <div class="flex flex-wrap gap-1">
                  {#each result.measurable.tags as tag (tag)}
                    <span class="rounded bg-gray-200 px-2 py-0.5 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-400">{tag}</span>
                  {/each}
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </section>
  {/if}
</main>
