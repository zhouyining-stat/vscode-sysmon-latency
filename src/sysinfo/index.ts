import * as si from 'systeminformation';
import * as os from 'os';
import { env, Uri, workspace } from 'vscode';
import { getMacOsMemoryUsageInfo } from './memory';
import { isDarwin, isWin32, withTimeout } from '../utils';

const REMOTE_LATENCY_BATCHING_LOOP = 10;
const REMOTE_LATENCY_STAT_TIMEOUT = 3000;

export function siInit() {
  if (isWin32) {
    si.powerShellStart();
  }
}

export function siRelease() {
  if (isWin32) {
    si.powerShellRelease();
  }
}

export async function getCpuSpeed() {
  try {
    const res = await si.cpuCurrentSpeed();
    return res.avg;
  } catch (err) { }
}

export async function getCpuLoad() {
  try {
    const res = await si.currentLoad();
    return res.currentLoad;
  } catch (err) { }
}

export async function getLoadavg() {
  try {
    const res = os.loadavg();
    return res;
  } catch (err) { }
}

export async function getIP() {
  const defaultInterface = await si.networkInterfaceDefault();
  const res = await si.networkInterfaces();
  if (!Array.isArray(res)) {
    return (res as any).ip4;
  }
  for (const item of res) {
    if (item.iface === defaultInterface) {
      return item.ip4;
    }
  }
  return null;
}

export async function getNetworkSpeed() {
  try {
    const defaultInterface = await si.networkInterfaceDefault();
    const res = await si.networkStats(defaultInterface);
    const cur = res[0];
    return {
      up: cur.tx_sec,
      down: cur.rx_sec
    };
  } catch (err) { }
}

export async function getUpTime() {
  try {
    return os.uptime();
  } catch (err) { }
}

export async function getRemoteLatency() {
  try {
    if (!env.remoteName) {
      return null;
    }

    let uri: Uri;
    if (workspace.workspaceFolders?.length) {
      uri = workspace.workspaceFolders[0].uri;
    } else {
      uri = Uri.file('/dev/null').with({
        scheme: 'vscode-remote',
        authority: env.remoteName
      });
    }

    const startTime = performance.now();
    let completedCalls = 0;

    for (let i = 0; i < REMOTE_LATENCY_BATCHING_LOOP; i++) {
      try {
        await withTimeout(workspace.fs.stat(uri), REMOTE_LATENCY_STAT_TIMEOUT);
        completedCalls++;
      } catch (err) {
        // Silently ignore individual stat failures
      }
    }

    const endTime = performance.now();

    if (completedCalls === 0) {
      return null;
    }

    return (endTime - startTime) / completedCalls;
  } catch (err) {
    // If latency measurement fails entirely, return null to display "-"
    return null;
  }
}

export async function getMemoryUsage() {
  try {
    if (isDarwin) {
      const res = await getMacOsMemoryUsageInfo();
      return {
        total: res.total,
        used: res.used,
        active: res.active,
        pressurePercent: res.pressurePercent,
        usagePercent: res.usagePercent
      };
    } else {
      const res = await si.mem();
      return {
        total: res.total,
        used: res.used,
        active: res.active
      };
    }
  } catch (err) { }
}

export const sysinfoData = {
  cpuLoad: getCpuLoad,
  loadavg: getLoadavg,
  networkSpeed: getNetworkSpeed,
  memoUsage: getMemoryUsage,
  uptime: getUpTime,
  remoteLatency: getRemoteLatency
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const AllSysModules = Object.keys(sysinfoData) as StatsModule[];

export type SysinfoData = typeof sysinfoData;

export type StatsModule = keyof typeof sysinfoData;

// eslint-disable-next-line @typescript-eslint/naming-convention
export const StatsModuleNameMap: { [key in StatsModule]: string } = {
  cpuLoad: 'CpuLoad',
  loadavg: 'Loadavg',
  networkSpeed: 'NetworkSpeed',
  memoUsage: 'MemoryUsage',
  uptime: 'Uptime',
  remoteLatency: 'RemoteLatency'
};
