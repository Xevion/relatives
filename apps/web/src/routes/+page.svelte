<script lang="ts">
  import { compare, dimensions, type ComparisonResponse } from '@relatives/core';

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

  function runComparison() {
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
  }

  function formatRatio(ratio: number): string {
    if (ratio === 1) return 'exactly equal to';
    if (ratio > 1) {
      if (ratio >= 1000000) return `${(ratio / 1000000).toFixed(1)} million times`;
      if (ratio >= 1000) return `${(ratio / 1000).toFixed(1)} thousand times`;
      if (ratio >= 100) return `${ratio.toFixed(0)}x`;
      if (ratio >= 10) return `${ratio.toFixed(1)}x`;
      return `${ratio.toFixed(2)}x`;
    } else {
      const inverse = 1 / ratio;
      if (inverse >= 1000000) return `1/${(inverse / 1000000).toFixed(1)} millionth of`;
      if (inverse >= 1000) return `1/${(inverse / 1000).toFixed(1)} thousandth of`;
      if (inverse >= 100) return `1/${inverse.toFixed(0)}th of`;
      if (inverse >= 10) return `1/${inverse.toFixed(1)}th of`;
      return `${ratio.toFixed(2)}x (${inverse.toFixed(2)}x smaller)`;
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

<main>
  <h1>Relatives</h1>
  <p class="subtitle">Find relatable comparisons for any quantity</p>

  <section class="input-section">
    <div class="input-row">
      <label>
        Value
        <input type="number" bind:value step="any" />
      </label>

      <label>
        Dimension
        <select bind:value={selectedDimension}>
          {#each Object.entries(dimensions) as [id, dim] (id)}
            <option value={id}>{dim.name}</option>
          {/each}
        </select>
      </label>

      <label>
        Unit
        <select bind:value={selectedUnit}>
          {#each availableUnits as unit (unit.id)}
            <option value={unit.id}>{unit.symbol} ({unit.id})</option>
          {/each}
        </select>
      </label>
    </div>

    <div class="options-row">
      <label class="checkbox">
        <input type="checkbox" bind:checked={excludeAmerican} />
        Exclude American-specific references
      </label>

      <label>
        Results limit
        <input type="number" bind:value={limit} min="1" max="50" />
      </label>
    </div>

    <div class="weights-section">
      <h3>Scoring Weights</h3>
      <div class="weights-row">
        <label>
          Closeness ({(closenessWeight * 100).toFixed(0)}%)
          <input type="range" bind:value={closenessWeight} min="0" max="1" step="0.05" />
        </label>
        <label>
          Relatability ({(relatabilityWeight * 100).toFixed(0)}%)
          <input type="range" bind:value={relatabilityWeight} min="0" max="1" step="0.05" />
        </label>
        <label>
          Accuracy ({(accuracyWeight * 100).toFixed(0)}%)
          <input type="range" bind:value={accuracyWeight} min="0" max="1" step="0.05" />
        </label>
      </div>
    </div>

    <button onclick={runComparison}>Find Comparisons</button>
  </section>

  {#if error}
    <section class="error">
      <p>{error}</p>
    </section>
  {/if}

  {#if results}
    <section class="results">
      <h2>
        Comparisons for {value}
        {getUnitSymbol(selectedUnit)}
      </h2>

      <div class="results-list">
        {#each results.results as result, i (result.measurable.id)}
          <div class="result-card">
            <div class="result-rank">#{i + 1}</div>
            <div class="result-content">
              <h3>{result.measurable.name}</h3>
              {#if result.measurable.description}
                <p class="description">{result.measurable.description}</p>
              {/if}
              <p class="comparison">
                <strong>{formatRatio(result.ratio)}</strong> a {result.measurable.name.toLowerCase()}
              </p>
              <div class="meta">
                <span class="score" title="Composite score">
                  Score: {(result.compositeScore * 100).toFixed(1)}%
                </span>
                <span class="tags">
                  {#each result.measurable.tags as tag (tag)}
                    <span class="tag">{tag}</span>
                  {/each}
                </span>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </section>
  {/if}
</main>

<style>
  :global(body) {
    font-family:
      system-ui,
      -apple-system,
      sans-serif;
    margin: 0;
    padding: 0;
    background: #f5f5f5;
    color: #333;
  }

  main {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }

  h1 {
    margin: 0;
    font-size: 2.5rem;
    color: #222;
  }

  .subtitle {
    color: #666;
    margin-top: 0.5rem;
    margin-bottom: 2rem;
  }

  .input-section {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .input-row {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .input-row label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    flex: 1;
    min-width: 150px;
  }

  input[type='number'],
  select {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
  }

  .options-row {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
    flex-wrap: wrap;
    align-items: center;
  }

  .checkbox {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
  }

  .weights-section {
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid #eee;
  }

  .weights-section h3 {
    margin: 0 0 0.75rem 0;
    font-size: 0.9rem;
    color: #666;
  }

  .weights-row {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .weights-row label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    flex: 1;
    min-width: 120px;
    font-size: 0.85rem;
  }

  button {
    margin-top: 1.5rem;
    padding: 0.75rem 1.5rem;
    background: #0066cc;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
  }

  button:hover {
    background: #0055aa;
  }

  .error {
    background: #ffebee;
    color: #c62828;
    padding: 1rem;
    border-radius: 8px;
    margin-top: 1rem;
  }

  .results {
    margin-top: 2rem;
  }

  .results h2 {
    margin: 0 0 1rem 0;
  }

  .results-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .result-card {
    display: flex;
    gap: 1rem;
    background: white;
    padding: 1rem;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .result-rank {
    font-size: 1.25rem;
    font-weight: bold;
    color: #999;
    min-width: 2rem;
  }

  .result-content {
    flex: 1;
  }

  .result-content h3 {
    margin: 0;
    font-size: 1.1rem;
  }

  .description {
    margin: 0.25rem 0;
    color: #666;
    font-size: 0.9rem;
  }

  .comparison {
    margin: 0.5rem 0;
    font-size: 1rem;
  }

  .meta {
    display: flex;
    gap: 1rem;
    align-items: center;
    margin-top: 0.5rem;
    font-size: 0.8rem;
  }

  .score {
    color: #0066cc;
    font-weight: 500;
  }

  .tags {
    display: flex;
    gap: 0.25rem;
    flex-wrap: wrap;
  }

  .tag {
    background: #e0e0e0;
    padding: 0.1rem 0.4rem;
    border-radius: 4px;
    font-size: 0.75rem;
    color: #666;
  }
</style>
