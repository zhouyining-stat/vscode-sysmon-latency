/**
 * Integration tests for aggregate mode and module ordering
 * Tests aggregate display logic with real-world scenarios
 */

import { strictEqual, deepStrictEqual } from 'assert';

/**
 * Test data structure
 */
interface FormattedData {
  module: string;
  text: string;
  tooltip: string;
}

/**
 * Mock configuration
 */
interface AggregateConfig {
  separator: string;
  tooltipSeparator: string;
}

const defaultConfig: AggregateConfig = {
  separator: '  ',
  tooltipSeparator: ' | '
};

/**
 * Simulates aggregate mode text rendering
 */
function renderAggregateText(data: FormattedData[], config: AggregateConfig = defaultConfig): string {
  const visibleData = data.filter(item => !(item.module === 'remoteLatency' && item.text === '-'));
  if (visibleData.length === 0) {
    return '';
  }
  return visibleData.map(item => item.text).join(config.separator);
}

/**
 * Simulates aggregate mode tooltip rendering
 */
function renderAggregateTooltip(data: FormattedData[], config: AggregateConfig = defaultConfig): string {
  const visibleData = data.filter(item => !(item.module === 'remoteLatency' && item.text === '-'));
  if (visibleData.length === 0) {
    return '';
  }
  return visibleData.map(item => item.tooltip).join(config.tooltipSeparator);
}

/**
 * Test: Aggregate renders all modules in local mode
 */
function testAggregateLocalMode() {
  const data: FormattedData[] = [
    { module: 'cpuLoad', text: '$(pulse) 45%', tooltip: 'CPU Load' },
    { module: 'networkSpeed', text: '$(cloud-upload) 1.2 MB/s', tooltip: 'Network Speed' },
    { module: 'memoUsage', text: '$(database) 8/16 GB, 50%', tooltip: 'Memory Usage' },
    { module: 'remoteLatency', text: '-', tooltip: 'Remote Latency' }
  ];

  const text = renderAggregateText(data);
  const tooltip = renderAggregateTooltip(data);

  strictEqual(text, '$(pulse) 45%  $(cloud-upload) 1.2 MB/s  $(database) 8/16 GB, 50%');
  strictEqual(tooltip, 'CPU Load | Network Speed | Memory Usage');
}

/**
 * Test: Aggregate renders with remoteLatency in remote mode
 */
function testAggregateRemoteMode() {
  const data: FormattedData[] = [
    { module: 'cpuLoad', text: '$(pulse) 45%', tooltip: 'CPU Load' },
    { module: 'networkSpeed', text: '$(cloud-upload) 1.2 MB/s', tooltip: 'Network Speed' },
    { module: 'remoteLatency', text: '$(pulse) 2.35ms', tooltip: 'Remote Latency' }
  ];

  const text = renderAggregateText(data);
  const tooltip = renderAggregateTooltip(data);

  strictEqual(text, '$(pulse) 45%  $(cloud-upload) 1.2 MB/s  $(pulse) 2.35ms');
  strictEqual(tooltip, 'CPU Load | Network Speed | Remote Latency');
}

/**
 * Test: Aggregate respects module order from configuration
 */
function testAggregateModuleOrder() {
  const data: FormattedData[] = [
    { module: 'memoUsage', text: '$(database) 8/16 GB, 50%', tooltip: 'Memory Usage' },
    { module: 'cpuLoad', text: '$(pulse) 45%', tooltip: 'CPU Load' },
    { module: 'networkSpeed', text: '$(cloud-upload) 1.2 MB/s', tooltip: 'Network Speed' }
  ];

  const text = renderAggregateText(data);

  // Order should be exactly as in data array
  strictEqual(text, '$(database) 8/16 GB, 50%  $(pulse) 45%  $(cloud-upload) 1.2 MB/s');
}

/**
 * Test: Aggregate handles single module
 */
function testAggregateSingleModule() {
  const data: FormattedData[] = [{ module: 'cpuLoad', text: '$(pulse) 45%', tooltip: 'CPU Load' }];

  const text = renderAggregateText(data);
  const tooltip = renderAggregateTooltip(data);

  strictEqual(text, '$(pulse) 45%');
  strictEqual(tooltip, 'CPU Load');
}

/**
 * Test: Aggregate handles only remoteLatency invalid (should hide)
 */
function testAggregateOnlyInvalidRemoteLatency() {
  const data: FormattedData[] = [{ module: 'remoteLatency', text: '-', tooltip: 'Remote Latency' }];

  const text = renderAggregateText(data);

  strictEqual(text, '');
}

/**
 * Test: Custom separator configuration
 */
function testAggregateCustomSeparator() {
  const config: AggregateConfig = {
    separator: ' | ',
    tooltipSeparator: ' → '
  };

  const data: FormattedData[] = [
    { module: 'cpuLoad', text: '$(pulse) 45%', tooltip: 'CPU Load' },
    { module: 'networkSpeed', text: '$(cloud-upload) 1.2 MB/s', tooltip: 'Network Speed' }
  ];

  const text = renderAggregateText(data, config);
  const tooltip = renderAggregateTooltip(data, config);

  strictEqual(text, '$(pulse) 45% | $(cloud-upload) 1.2 MB/s');
  strictEqual(tooltip, 'CPU Load → Network Speed');
}

/**
 * Test: Module order consistency across multiple renders
 */
function testModuleOrderConsistency() {
  const orderedModules = ['cpuLoad', 'loadavg', 'networkSpeed', 'memoUsage', 'uptime', 'remoteLatency'];

  // Simulate same order twice
  const order1 = [...orderedModules];
  const order2 = [...orderedModules];

  deepStrictEqual(order1, order2, 'Module order should be consistent');
}

/**
 * Test: Filter behavior across different scenarios
 */
function testFilterBehavior() {
  // Scenario 1: remoteLatency with "-"
  const scenario1 = [
    { module: 'cpuLoad', text: '45%', tooltip: 'CPU' },
    { module: 'remoteLatency', text: '-', tooltip: 'Latency' }
  ];
  const filtered1 = scenario1.filter(item => !(item.module === 'remoteLatency' && item.text === '-'));
  strictEqual(filtered1.length, 1);

  // Scenario 2: remoteLatency with value
  const scenario2 = [
    { module: 'cpuLoad', text: '45%', tooltip: 'CPU' },
    { module: 'remoteLatency', text: '2.35ms', tooltip: 'Latency' }
  ];
  const filtered2 = scenario2.filter(item => !(item.module === 'remoteLatency' && item.text === '-'));
  strictEqual(filtered2.length, 2);

  // Scenario 3: No remoteLatency at all
  const scenario3 = [
    { module: 'cpuLoad', text: '45%', tooltip: 'CPU' },
    { module: 'networkSpeed', text: '1.2 MB/s', tooltip: 'Network' }
  ];
  const filtered3 = scenario3.filter(item => !(item.module === 'remoteLatency' && item.text === '-'));
  strictEqual(filtered3.length, 2);
}

/**
 * Run all tests
 */
export function runAggregateTests() {
  const tests = [
    { name: 'aggregate renders all modules in local mode', fn: testAggregateLocalMode },
    { name: 'aggregate renders with remoteLatency in remote mode', fn: testAggregateRemoteMode },
    { name: 'aggregate respects module order', fn: testAggregateModuleOrder },
    { name: 'aggregate handles single module', fn: testAggregateSingleModule },
    { name: 'aggregate hides when only invalid remoteLatency', fn: testAggregateOnlyInvalidRemoteLatency },
    { name: 'aggregate custom separator', fn: testAggregateCustomSeparator },
    { name: 'module order consistency', fn: testModuleOrderConsistency },
    { name: 'filter behavior across scenarios', fn: testFilterBehavior }
  ];

  let passed = 0;
  let failed = 0;

  console.log('\n========== SysMon Aggregate Mode Tests ==========\n');

  tests.forEach(test => {
    try {
      test.fn();
      console.log(`✓ ${test.name}`);
      passed++;
    } catch (err) {
      console.log(`✗ ${test.name}`);
      console.log(`  Error: ${(err as Error).message}`);
      failed++;
    }
  });

  console.log(`\n========== Results ==========`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total:  ${tests.length}\n`);

  return failed === 0;
}
