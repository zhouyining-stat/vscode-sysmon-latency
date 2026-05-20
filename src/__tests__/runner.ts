/**
 * Main test runner for SysMon unit tests
 */

// Import test suites
import { runTests } from './formatRes.test';
import { runAggregateTests } from './aggregate.test';

async function main() {
  console.log('\n╔════════════════════════════════════╗');
  console.log('║     SysMon Unit Test Suite         ║');
  console.log('╚════════════════════════════════════╝');

  const results: { name: string; success: boolean }[] = [];

  // Run format tests
  try {
    const success = runTests();
    results.push({ name: 'Format Tests', success });
  } catch (err) {
    console.error('Format tests error:', err);
    results.push({ name: 'Format Tests', success: false });
  }

  // Run aggregate tests
  try {
    const success = runAggregateTests();
    results.push({ name: 'Aggregate Mode Tests', success });
  } catch (err) {
    console.error('Aggregate tests error:', err);
    results.push({ name: 'Aggregate Mode Tests', success: false });
  }

  // Summary
  console.log('\n╔════════════════════════════════════╗');
  console.log('║          Test Summary              ║');
  console.log('╚════════════════════════════════════╝\n');

  let allPassed = true;
  results.forEach(result => {
    const status = result.success ? '✓ PASSED' : '✗ FAILED';
    console.log(`${status}: ${result.name}`);
    if (!result.success) {
      allPassed = false;
    }
  });

  console.log('\n');

  process.exit(allPassed ? 0 : 1);
}

main().catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});
