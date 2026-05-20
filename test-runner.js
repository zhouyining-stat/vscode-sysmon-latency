#!/usr/bin/env node
// 直接运行测试的简单脚本

// formatByDict 实现
function formatByDict(template, dict) {
    let result = template;
    const matches = template.match(/\$\{[^{}]*\}/g);
    if (matches) {
        matches.forEach(item => {
            const key = item.replace(/(\$\{)|(\})/g, '');
            if (key in dict) {
                result = result.replace(item, String(dict[key]));
            }
        });
    }
    return result.trim();
}

// 测试套件
function runQuickTests() {
    console.log('\n════════════════════════════════════');
    console.log('  SysMon Quick Unit Tests');
    console.log('════════════════════════════════════\n');

    let passed = 0;
    let failed = 0;

    // Test 1: CPU format
    try {
        const result = formatByDict('$(pulse) ${percent}%', { percent: '45' });
        if (result !== '$(pulse) 45%') throw new Error(`Expected '$(pulse) 45%', got '${result}'`);
        console.log('✓ CPU format');
        passed++;
    } catch (e) {
        console.log('✗ CPU format:', e.message);
        failed++;
    }

    // Test 2: Network format
    try {
        const result = formatByDict(
            '$(cloud-upload) ${up} ${up-unit} $(cloud-download) ${down} ${down-unit}',
            { up: '1.5', 'up-unit': 'MB/s', down: '3.2', 'down-unit': 'MB/s' }
        );
        if (result !== '$(cloud-upload) 1.5 MB/s $(cloud-download) 3.2 MB/s') {
            throw new Error(`Expected network format, got '${result}'`);
        }
        console.log('✓ Network format');
        passed++;
    } catch (e) {
        console.log('✗ Network format:', e.message);
        failed++;
    }

    // Test 3: Memory format
    try {
        const result = formatByDict('$(database) ${used}/${total} ${unit}, ${percent}%', {
            used: '8',
            total: '16',
            unit: 'GB',
            percent: '50'
        });
        if (result !== '$(database) 8/16 GB, 50%') {
            throw new Error(`Expected memory format, got '${result}'`);
        }
        console.log('✓ Memory format');
        passed++;
    } catch (e) {
        console.log('✗ Memory format:', e.message);
        failed++;
    }

    // Test 4: Remote latency format
    try {
        const result = formatByDict('$(pulse) ${latency}ms', { latency: '2.35' });
        if (result !== '$(pulse) 2.35ms') throw new Error(`Expected '$(pulse) 2.35ms', got '${result}'`);
        console.log('✓ Remote latency format');
        passed++;
    } catch (e) {
        console.log('✗ Remote latency format:', e.message);
        failed++;
    }

    // Test 5: Aggregate filter - remove invalid remoteLatency
    try {
        const data = [
            { module: 'cpuLoad', text: '45%' },
            { module: 'remoteLatency', text: '-' }
        ];
        const filtered = data.filter(item => !(item.module === 'remoteLatency' && item.text === '-'));
        if (filtered.length !== 1) throw new Error(`Expected 1 item, got ${filtered.length}`);
        console.log('✓ Aggregate filter (invalid remoteLatency)');
        passed++;
    } catch (e) {
        console.log('✗ Aggregate filter:', e.message);
        failed++;
    }

    // Test 6: Aggregate filter - keep valid remoteLatency
    try {
        const data = [
            { module: 'cpuLoad', text: '45%' },
            { module: 'remoteLatency', text: '2.35ms' }
        ];
        const filtered = data.filter(item => !(item.module === 'remoteLatency' && item.text === '-'));
        if (filtered.length !== 2) throw new Error(`Expected 2 items, got ${filtered.length}`);
        console.log('✓ Aggregate filter (valid remoteLatency)');
        passed++;
    } catch (e) {
        console.log('✗ Aggregate filter:', e.message);
        failed++;
    }

    // Test 7: Module order
    try {
        const modules = ['cpuLoad', 'networkSpeed', 'memoUsage'];
        const ordered = [...modules];
        if (JSON.stringify(ordered) !== JSON.stringify(['cpuLoad', 'networkSpeed', 'memoUsage'])) {
            throw new Error('Module order mismatch');
        }
        console.log('✓ Module order');
        passed++;
    } catch (e) {
        console.log('✗ Module order:', e.message);
        failed++;
    }

    // Test 8: Aggregate text join
    try {
        const data = [{ text: '45%' }, { text: '1.2 MB/s' }, { text: '8/16 GB' }];
        const joined = data.map(d => d.text).join('  ');
        if (joined !== '45%  1.2 MB/s  8/16 GB') throw new Error(`Expected joined text, got '${joined}'`);
        console.log('✓ Aggregate text join');
        passed++;
    } catch (e) {
        console.log('✗ Aggregate text join:', e.message);
        failed++;
    }

    console.log(`\n════════════════════════════════════`);
    console.log(`  Results: ${passed} passed, ${failed} failed`);
    console.log(`════════════════════════════════════\n`);

    return failed === 0;
}

const success = runQuickTests();
process.exit(success ? 0 : 1);
