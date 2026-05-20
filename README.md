<p align="center">
    <img alt="VSCode SysMon" title="VSCode SysMon" src="https://raw.githubusercontent.com/isontheline/vscode-sysmon/main/images/icon-no-background.png" width="256" />
    <br />
    <img src="https://img.shields.io/visual-studio-marketplace/v/isontheline.vscode-sysmon" />
    <img src="https://img.shields.io/visual-studio-marketplace/i/isontheline.vscode-sysmon" />
    <img src="https://img.shields.io/visual-studio-marketplace/r/isontheline.vscode-sysmon" />
    <img src="https://img.shields.io/visual-studio-marketplace/last-updated/isontheline.vscode-sysmon" />
</p>

# VSCode SysMon
Visual Studio Code Extension to show system stats inside the status bar (Forked from the awesome work of @njzydark)

![VSCode SysMon](https://raw.githubusercontent.com/isontheline/vscode-sysmon/main/images/vscode-sysmon-screenshot.png)

## Features
- Support show cpu load, loadavg, network speed, memory usage, uptime and remote latency
- Support custom display format, order and priority
- Support optional single aggregated status bar item mode (`sysMon.aggregateItem`)
- Support copy ip to clipboard
- Support change position and refresh interval

## Extension Settings
You can visit this extension page in vscode to see detail

When `sysMon.aggregateItem` is enabled, all enabled modules are rendered in one status bar item, and the display order still follows `sysMon.modules`.

## Display Format
You can use `$(icon-name)` to show icon, visit this site [https://microsoft.github.io/vscode-codicons/dist/codicon.html](https://microsoft.github.io/vscode-codicons/dist/codicon.html) to find icon name

### Cpu Load
* ${percent}

### Loadavg
* ${1}
* ${5}
* ${15}

### Uptime
* ${days}
* ${hours}
* ${minutes}

### Network Speed
* ${up}
* ${up-unit}
* ${down}
* ${down-unit}

### Memory Usage
* ${used}
* ${total}
* ${percent}
* ${pressurePercent}
* ${unit}

### Remote Latency
* ${latency}

> Note: remote latency is only displayed when VS Code is connected to a remote workspace.

## Development

### Running Tests
```bash
npm test
```

The test suite covers:
- Format template variable replacement (`formatRes()`)
- Module ordering preservation
- Aggregate mode filtering and rendering (e.g., hiding invalid `remoteLatency` in local mode)

Test files are located in `src/__tests__/` and can be run standalone or as part of the build process.

## Thanks
* [njzydark](https://github.com/njzydark/vscode-stats-bar)
* [systeminformation](https://systeminformation.io)