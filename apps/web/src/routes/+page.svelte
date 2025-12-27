<script lang="ts">
  import { compare, dimensions, type ComparisonResponse, type Dimension, type Unit } from '@relatives/core';
  import { autoAnimate } from '@formkit/auto-animate';
  import { NumericInput } from '$lib/components/ui/numeric-input';
  import { Label } from '$lib/components/ui/label';
  import { Slider } from '$lib/components/ui/slider';

  let value = $state(70);
  let selectedDimension = $state('length');
  let selectedUnit = $state('micrometer');

  // Element refs for keyboard shortcuts
  let dimensionSelectRef: HTMLSelectElement | null = $state(null);
  let unitSelectRef: HTMLSelectElement | null = $state(null);

  // Weight sliders
  let closenessWeight = $state(0.4);
  let relatabilityWeight = $state(0.35);
  let accuracyWeight = $state(0.25);

  // Infinite scroll state
  let displayCount = $state(10); // Initially show 10
  let loadMoreTrigger: HTMLDivElement | null = $state(null);
  let isLoadingMore = $state(false);

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

  // Pagination
  let allResults = $derived(results?.results ?? []);
  let visibleResults = $derived(allResults.slice(0, displayCount));
  let hasMoreResults = $derived(displayCount < allResults.length);

  function runComparison() {
    searching = true;
    error = null;
    displayCount = 10; // Reset pagination on new search
    try {
      results = compare({
        value,
        unit: selectedUnit,
        dimension: selectedDimension,
        weights: {
          closeness: closenessWeight,
          relatability: relatabilityWeight,
          accuracy: accuracyWeight,
        },
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
    value; selectedDimension; selectedUnit;
    closenessWeight; relatabilityWeight; accuracyWeight;
    
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => runComparison(), 100);
    
    return () => clearTimeout(debounceTimeout);
  });

  // Intersection observer for infinite scroll with delay
  let loadMoreTimeout: ReturnType<typeof setTimeout> | undefined;

  $effect(() => {
    if (!loadMoreTrigger || !hasMoreResults) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !isLoadingMore) {
          isLoadingMore = true;
          
          // Delay before loading (predictability)
          loadMoreTimeout = setTimeout(() => {
            displayCount += 10; // Load 10 more
            isLoadingMore = false;
          }, 500); // 500ms delay
        }
      },
      { threshold: 0.1 } // Trigger when 10% visible
    );

    observer.observe(loadMoreTrigger);

    return () => {
      observer.disconnect();
      clearTimeout(loadMoreTimeout);
    };
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
    const unit = availableUnits.find((u: Unit) => u.id === unitId);
    return unit?.symbol ?? unitId;
  }

  // Global keyboard shortcuts
  function handleKeyboard(e: KeyboardEvent) {
    // Ctrl/Cmd + K to focus dimension selector
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      dimensionSelectRef?.focus();
    }
    // Ctrl/Cmd + U to focus unit selector
    if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
      e.preventDefault();
      unitSelectRef?.focus();
    }
  }
</script>

<svelte:head>
  <title>Relatives - Quantity Comparison Engine</title>
</svelte:head>

<svelte:window onkeydown={handleKeyboard} />

<main class="mx-auto max-w-3xl px-8 py-8">
  <h1 class="m-0 text-4xl font-normal text-gray-950 dark:text-gray-50">Relatives</h1>
  <p class="mb-8 mt-2 text-gray-600 dark:text-gray-400">Find relatable comparisons for any quantity</p>

  <section class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-900">
    <div class="flex flex-wrap gap-4">
      <div class="flex min-w-[150px] flex-1 flex-col gap-1">
        <Label class="text-sm font-medium text-gray-700 dark:text-gray-300">Value</Label>
        <NumericInput 
          bind:value
          placeholder="Enter value (e.g., 1e6, 5k, 2^10)"
        />
      </div>

      <div class="flex min-w-[150px] flex-1 flex-col gap-1">
        <Label class="text-sm font-medium text-gray-700 dark:text-gray-300">Dimension <span class="text-xs text-gray-500">(Ctrl+K)</span></Label>
        <select 
          bind:this={dimensionSelectRef}
          bind:value={selectedDimension}
          class="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:border-gray-700"
        >
          {#each Object.entries(dimensions) as [id, dim] (id)}
            <option value={id}>{(dim as Dimension).name}</option>
          {/each}
        </select>
      </div>

      <div class="flex min-w-[150px] flex-1 flex-col gap-1">
        <Label class="text-sm font-medium text-gray-700 dark:text-gray-300">Unit <span class="text-xs text-gray-500">(Ctrl+U)</span></Label>
        <select 
          bind:this={unitSelectRef}
          bind:value={selectedUnit}
          class="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:border-gray-700"
        >
          {#each availableUnits as unit (unit.id)}
            <option value={unit.id}>{unit.symbol} ({unit.id})</option>
          {/each}
        </select>
      </div>
    </div>



    <div class="mt-6 border-t border-gray-200 pt-4 dark:border-gray-800">
      <h3 class="mb-3 text-sm font-medium text-gray-600 dark:text-gray-400">Scoring Weights</h3>
      <div class="flex flex-wrap gap-4">
        <div class="flex min-w-[120px] flex-1 flex-col gap-2 text-sm">
          <Label class="text-gray-700 dark:text-gray-300">Closeness ({(closenessWeight * 100).toFixed(0)}%)</Label>
          <Slider 
            type="single"
            bind:value={closenessWeight} 
            min={0} 
            max={1} 
            step={0.05}
          />
        </div>
        <div class="flex min-w-[120px] flex-1 flex-col gap-2 text-sm">
          <Label class="text-gray-700 dark:text-gray-300">Relatability ({(relatabilityWeight * 100).toFixed(0)}%)</Label>
          <Slider 
            type="single"
            bind:value={relatabilityWeight} 
            min={0} 
            max={1} 
            step={0.05}
          />
        </div>
        <div class="flex min-w-[120px] flex-1 flex-col gap-2 text-sm">
          <Label class="text-gray-700 dark:text-gray-300">Accuracy ({(accuracyWeight * 100).toFixed(0)}%)</Label>
          <Slider 
            type="single"
            bind:value={accuracyWeight} 
            min={0} 
            max={1} 
            step={0.05}
          />
        </div>
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
        {#each visibleResults as result, i (result.measurable.id)}
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

        <!-- Infinite scroll trigger -->
        {#if hasMoreResults}
          <div bind:this={loadMoreTrigger} class="flex justify-center py-4">
            {#if isLoadingMore}
              <div class="text-sm text-gray-500 dark:text-gray-400">
                Loading more results...
              </div>
            {:else}
              <div class="text-sm text-gray-400 dark:text-gray-600">
                Scroll for more
              </div>
            {/if}
          </div>
        {:else if allResults.length > 0}
          <div class="py-4 text-center text-sm text-gray-400 dark:text-gray-600">
            No more results (showing {allResults.length} total)
          </div>
        {/if}
      </div>
    </section>
  {/if}
</main>
