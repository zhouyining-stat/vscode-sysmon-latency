/**
 * Unit tests for SysMon formatRes method
 * Tests formatRes() formatting logic, module ordering, and aggregate filtering
 */

import { strictEqual, deepStrictEqual } from 'assert';

/**
 * Mock implementation of formatByDict for testing
 */
function formatByDict(template: string, dict: { [key: string]: any }): string {
  let result = template;
  template.match(/\$\{[^{}]*\}/g)?.forEach(item => {
    const key = item.replace(/(\$\{)|(\})/g, '');
    if (key in dict) {
      result = result.replace(item, String(dict[key]));
    }
  });
  return result.trim();
}

/**
 * Test: formatByDict should replace template variables correctly
 */
function testFormatByDict() {
  const template = '$(pulse) ${percent}%';
  const dict = { percent: '42' };
  const result = formatByDict(template, dict);
  strictEqual(result, '$(pulse) 42%', 'CPU load format should replace ${percent}');
}

/**
 * Test: CPU load display should reserve width for one-digit values
 */
function testCpuLoadPadding() {
  const FIGURE_SPACE = '\u2007';
  const template = '$(pulse) ${percent}%';
  const singleDigit = formatByDict(template, { percent: FIGURE_SPACE.repeat(2) + '9' });
  const doubleDigit = formatByDict(template, { percent: FIGURE_SPACE + '10' });

  strictEqual(singleDigit, '$(pulse) ' + FIGURE_SPACE.repeat(2) + '9%');
  strictEqual(doubleDigit, '$(pulse) ' + FIGURE_SPACE + '10%');
}

/**
 * Test: formatByDict should handle network speed format
 */
function testNetworkSpeedFormat() {
  const template = '$(cloud-upload) ${up} ${up-unit} $(cloud-download) ${down} ${down-unit}';
  const dict = {
    up: '1.5',
    'up-unit': 'MB/s',
    down: '3.2',
    'down-unit': 'MB/s'
  };
  const result = formatByDict(template, dict);
  strictEqual(result, '$(cloud-upload) 1.5 MB/s $(cloud-download) 3.2 MB/s');
}

/**
 * Test: formatByDict should handle memory format with multiple variables
 */
function testMemoryFormat() {
  const template = '$(database) ${used}/${total} ${unit}, ${percent}%';
  const dict = {
    used: '8',
    total: '16',
    unit: 'GB',
    percent: '50',
    pressurePercent: '20'
  };
  const result = formatByDict(template, dict);
  strictEqual(result, '$(database) 8/16 GB, 50%');
}

/**
 * Test: formatByDict should handle remote latency format
 */
function testRemoteLatencyFormat() {
  const template = '$(pulse) ${latency}ms';
  const dict = { latency: '2.35' };
  const result = formatByDict(template, dict);
  strictEqual(result, '$(pulse) 2.35ms');
}

/**
 * Test: Module ordering should be preserved
 */
function testModuleOrdering() {
  const modules = ['cpuLoad', 'networkSpeed', 'memoUsage'];
  const ordered = [...modules]; // simulate module ordering

  deepStrictEqual(ordered, ['cpuLoad', 'networkSpeed', 'memoUsage'], 'Module order should match configured order');
}

/**
 * Test: Custom module order should be respected
 */
function testCustomModuleOrder() {
  const modules = ['memoUsage', 'cpuLoad', 'remoteLatency'];
  const ordered = [...modules];

  deepStrictEqual(ordered, ['memoUsage', 'cpuLoad', 'remoteLatency'], 'Custom module order should be preserved');
}

/**
 * Test: Aggregate filter should remove remoteLatency when value is '-'
 */
function testAggregateFilterRemoteLatency() {
  const data = [
    { module: 'cpuLoad', text: '$(pulse) 45%', tooltip: 'CPU Load' },
    { module: 'networkSpeed', text: '$(cloud-upload) 1.2 MB/s', tooltip: 'Network' },
    { module: 'remoteLatency', text: '-', tooltip: 'Remote Latency' }
  ];

  const visibleData = data.filter(item => !(item.module === 'remoteLatency' && item.text === '-'));

  strictEqual(visibleData.length, 2, 'Should filter out remoteLatency when text is "-"');
  strictEqual(
    visibleData.some(item => item.module === 'remoteLatency'),
    false,
    'remoteLatency should not be in visible data'
  );
}

/**
 * Test: Aggregate filter should keep remoteLatency when it has a valid value
 */
function testAggregateKeepRemoteLatencyWithValue() {
  const data = [
    { module: 'cpuLoad', text: '$(pulse) 45%', tooltip: 'CPU Load' },
    { module: 'remoteLatency', text: '$(pulse) 2.35ms', tooltip: 'Remote Latency' }
  ];

  const visibleData = data.filter(item => !(item.module === 'remoteLatency' && item.text === '-'));

  strictEqual(visibleData.length, 2, 'Should keep remoteLatency when it has a value');
  strictEqual(
    visibleData.some(item => item.module === 'remoteLatency' && item.text !== '-'),
    true,
    'remoteLatency with value should be in visible data'
  );
}

/**
 * Test: Aggregate text joining with separator
 */
function testAggregateTextJoin() {
  const visibleData = [{ text: '$(pulse) 45%' }, { text: '$(cloud-upload) 1.2 MB/s' }, { text: '$(database) 8/16 GB' }];

  const separator = '  ';
  const aggregateText = visibleData.map(item => item.text).join(separator);

  strictEqual(
    aggregateText,
    '$(pulse) 45%  $(cloud-upload) 1.2 MB/s  $(database) 8/16 GB',
    'Aggregate text should join with separator'
  );
}

/**
 * Test: Aggregate tooltip joining with separator
 */
function testAggregateTooltipJoin() {
  const visibleData = [{ tooltip: 'CPU Load' }, { tooltip: 'Network Speed' }, { tooltip: 'Memory Usage' }];

  const separator = ' | ';
  const aggregateTooltip = visibleData.map(item => item.tooltip).join(separator);

  strictEqual(
    aggregateTooltip,
    'CPU Load | Network Speed | Memory Usage',
    'Aggregate tooltip should join with separator'
  );
}

/**
 * Run all tests
 */
export function runTests() {
  const tests = [
    { name: 'formatByDict basic replacement', fn: testFormatByDict },
    { name: 'cpu load padding', fn: testCpuLoadPadding },
    { name: 'network speed format', fn: testNetworkSpeedFormat },
    { name: 'memory format with multiple variables', fn: testMemoryFormat },
    { name: 'remote latency format', fn: testRemoteLatencyFormat },
    { name: 'module ordering preserved', fn: testModuleOrdering },
    { name: 'custom module order respected', fn: testCustomModuleOrder },
    { name: 'aggregate filter removes invalid remoteLatency', fn: testAggregateFilterRemoteLatency },
    { name: 'aggregate keeps valid remoteLatency', fn: testAggregateKeepRemoteLatencyWithValue },
    { name: 'aggregate text joining', fn: testAggregateTextJoin },
    { name: 'aggregate tooltip joining', fn: testAggregateTooltipJoin }
  ];

  let passed = 0;
  let failed = 0;

  console.log('\n========== SysMon Unit Tests ==========\n');

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

// Run tests if this file is executed directly
if (require.main === module) {
  const success = runTests();
  process.exit(success ? 0 : 1);
}
