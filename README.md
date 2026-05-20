<!-- <p align="center">
    <img alt="VSCode SysMon" title="VSCode SysMon" src="https://raw.githubusercontent.com/isontheline/vscode-sysmon/main/images/icon-no-background.png" width="256" />
    <br />
    <img src="https://img.shields.io/visual-studio-marketplace/v/isontheline.vscode-sysmon" />
    <img src="https://img.shields.io/visual-studio-marketplace/i/isontheline.vscode-sysmon" />
    <img src="https://img.shields.io/visual-studio-marketplace/r/isontheline.vscode-sysmon" />
    <img src="https://img.shields.io/visual-studio-marketplace/last-updated/isontheline.vscode-sysmon" />
</p> -->

<!-- # VSCode SysMon
Visual Studio Code Extension to show system stats inside the status bar (Forked from the awesome work of @njzydark)

![VSCode SysMon](https://raw.githubusercontent.com/isontheline/vscode-sysmon/main/images/vscode-sysmon-screenshot.png) -->
# VSCode SysMon with Latency

VSCode SysMon displays system statistics in the Visual Studio Code status bar. It shows CPU, memory, network, load average, uptime, and remote latency for remote development scenarios.

<p align="center">
    <img alt="VSCode SysMon" src="images/icon-no-background.png" width="160" />
</p>

## Key Features

- Status bar widgets for: CPU Load, Loadavg, Network Speed, Memory Usage, Uptime, Remote Latency
- Customizable display templates, module order, and priority
- Aggregate mode: combine multiple modules into a single status bar item (`sysMon.aggregateItem`)
- `SysMon.CopyIp` command to copy the current IP to clipboard

## Remote Latency

Remote Latency is a core feature targeted at remote development (Remote - SSH / Containers / Codespaces / WSL):

- Purpose: measure the average time taken to interact with the remote workspace file system, helping you spot network or remote performance issues quickly
- When it appears: only shown when VS Code is connected to a remote workspace; otherwise it displays `-` and can be hidden in aggregate mode
- How it measures: performs a small batch of `stat` operations on the remote filesystem and takes the average to reduce single-sample noise
- Display format (default, customizable): milliseconds as an integer, e.g. `73ms`, `123ms`

Configuration example:

- `sysMon.remoteLatency.format`: default `$(pulse) ${latency}ms` (supports `${latency}` placeholder and icons)

## Stable display formatting

To avoid status bar jitter when numbers change length, the extension formats values to keep width stable:

- Network speed:
    - KB/s shown as integers (e.g. `3KB/s`, `123KB/s`)
    - MB/GB shown with appropriate decimals to preserve up to 3 significant digits (e.g. `0.23MB/s`, `1.23MB/s`, `12.3MB/s`)
- Remote latency: shown as integer milliseconds up to 3 digits (e.g. `73ms`, `123ms`)

These formats are configurable via `sysMon.networkSpeed.format` and `sysMon.remoteLatency.format`.

## Packaging

Create a `.vsix` package:

```bash
npm run package
# or
npx vsce package
```