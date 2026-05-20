import { ExtensionContext, StatusBarAlignment, StatusBarItem, window } from 'vscode';
import { ConfigurationKeys } from './types';
import { sysinfoData, SysinfoData, StatsModule, StatsModuleNameMap, siInit, siRelease } from './sysinfo';
import { setting } from './setting';
import { formatBytes, formatTimes, formatByDict, isDarwin, formatNetworkSpeed, formatLatency } from './utils';

type Await<T extends () => unknown> = T extends () => PromiseLike<infer U> ? U : ReturnType<T>;

class SysMon {
  statusItems: StatusBarItem[] = [];
  timer: NodeJS.Timeout | null = null;
  _context: ExtensionContext | null = null;
  private isUpdating = false;

  private getStatusBarAlignment() {
    const rawLocation = setting?.cfg?.get(ConfigurationKeys.Location) || 'Left';
    return String(rawLocation).toLowerCase() === 'right' ? StatusBarAlignment.Right : StatusBarAlignment.Left;
  }

  private isAggregateMode() {
    return Boolean(setting?.cfg?.get(ConfigurationKeys.AggregateItem));
  }

  init(context: ExtensionContext) {
    this._context = context;
    siInit();
    this.start();
  }

  private start() {
    if (!this._context) {
      return;
    }
    this.cancelUpdate();

    if (this.statusItems.length > 0) {
      this.statusItems.forEach(statusItem => {
        statusItem.dispose();
      });
    }
    const curModules = setting.curModules;
    if (!setting?.cfg?.get(ConfigurationKeys.AllEnabled) || curModules.length === 0) {
      return;
    }
    const location = this.getStatusBarAlignment();
    const priority: number =
      (setting?.cfg?.get(ConfigurationKeys.Priority) as number | undefined) ?? setting.default.priority;
    if (this.isAggregateMode()) {
      const item = window.createStatusBarItem('sysMon.aggregate', location, priority);
      item.text = '-';
      item.show();
      this.statusItems = [item];
    } else {
      this.statusItems = curModules.map((module, index) => {
        const item = window.createStatusBarItem(`sysMon.${module}`, location, priority - index);
        item.text = '-';
        item.show();
        return item;
      });
    }
    this._context.subscriptions.push(...this.statusItems);
    this.update();
  }

  private async update() {
    this.getSysInfo();
    this.timer = setInterval(() => {
      this.getSysInfo();
    }, setting?.cfg?.get(ConfigurationKeys.RefreshInterval) || setting.default.refreshInterval);
  }

  private async getSysInfo() {
    if (this.isUpdating) {
      return;
    }
    this.isUpdating = true;

    const modules = setting.curModules;

    // 使用 allSettled 代替 all，这样即使某个模块失败也不会影响其他模块
    const promises = modules.map(async module => {
      try {
        const res = await sysinfoData[module]();
        return { status: 'fulfilled' as const, value: this.formatRes(module, res) };
      } catch (err) {
        // 失败的模块返回默认值
        return { status: 'rejected' as const, value: this.formatRes(module, null) };
      }
    });

    try {
      const results = await Promise.allSettled(promises);

      const formattedData = results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value.value;
        } else {
          // 如果 promise 本身失败，返回默认格式
          return this.formatRes(modules[index], null);
        }
      });

      if (this.isAggregateMode()) {
        const aggregateItem = this.statusItems[0];
        if (!aggregateItem) {
          return;
        }

        const visibleData = formattedData.filter(item => !(item.module === 'remoteLatency' && item.text === '-'));
        if (visibleData.length === 0) {
          aggregateItem.hide();
          return;
        }

        aggregateItem.text = visibleData.map(item => item.text).join('  ');
        aggregateItem.tooltip = visibleData.map(item => item.tooltip || StatsModuleNameMap[item.module]).join(' | ');
        aggregateItem.show();
        return;
      }

      formattedData.forEach((data, index) => {
        const curStatusItem = this.statusItems[index];
        if (!curStatusItem) {
          return;
        }

        if (data.module === 'remoteLatency' && data.text === '-') {
          curStatusItem.hide();
          return;
        }

        curStatusItem.text = data.text;
        curStatusItem.tooltip = data.tooltip || StatsModuleNameMap[data.module];
        curStatusItem.show();
      });
    } finally {
      this.isUpdating = false;
    }
  }

  private formatRes(module: StatsModule, rawRes: unknown) {
    const formatedData = {
      module,
      text: '-',
      tooltip: ''
    };
    if (module === 'cpuLoad') {
      const res = rawRes as Await<SysinfoData['cpuLoad']>;
      if (res) {
        const dict = {
          percent: res.toFixed(0)
        };
        formatedData.text = formatByDict(setting.cfg?.get(ConfigurationKeys.CpuLoadFormat), dict);
      }
    } else if (module === 'loadavg') {
      const res = rawRes as Await<SysinfoData['loadavg']>;
      if (res) {
        const dict = {
          '1': res[0]?.toFixed(2) || 0,
          '5': res[1]?.toFixed(2) || 0,
          '15': res[2]?.toFixed(2) || 0
        };
        formatedData.text = formatByDict(setting.cfg?.get(ConfigurationKeys.LoadavgFormat), dict);
      }
    } else if (module === 'memoUsage') {
      const res = rawRes as Await<SysinfoData['memoUsage']>;
      if (res) {
        const customSize = 1024 * 1024 * 1024;
        const used = formatBytes(isDarwin ? res.used : res.active, 2, customSize);
        const total = formatBytes(res.total, 2, customSize);
        const percent = ((Number(used.data) / Number(total.data)) * 100).toFixed(0);
        const pressurePercent = Number((res.pressurePercent || 0) * 100).toFixed(0);

        const dict = {
          used: used.data,
          total: total.data,
          unit: 'GB',
          percent,
          pressurePercent
        };

        formatedData.text = formatByDict(setting.cfg?.get(ConfigurationKeys.MemoUsageFormat), dict);
      }
    } else if (module === 'networkSpeed') {
      const res = rawRes as Await<SysinfoData['networkSpeed']>;
      if (res) {
        const up = formatBytes(res.up, 2);
        const down = formatBytes(res.down, 2);

        const dict = {
          up: formatNetworkSpeed(Number(up.data), up.unit),
          'up-unit': up.unit + '/s',
          down: formatNetworkSpeed(Number(down.data), down.unit),
          'down-unit': down.unit + '/s'
        };

        formatedData.text = formatByDict(setting.cfg?.get(ConfigurationKeys.NetworkSpeedFormat), dict);
      }
    } else if (module === 'uptime') {
      const res = rawRes as Await<SysinfoData['uptime']>;
      if (res) {
        const data = formatTimes(res);

        const dict = {
          days: data[0],
          hours: data[1],
          minutes: data[2]
        };

        formatedData.text = formatByDict(setting.cfg?.get(ConfigurationKeys.UptimeFormat), dict);
      }
    } else if (module === 'remoteLatency') {
      const res = rawRes as Await<SysinfoData['remoteLatency']>;
      if (typeof res === 'number') {
        const dict = {
          latency: formatLatency(res)
        };
        formatedData.text = formatByDict(setting.cfg?.get(ConfigurationKeys.RemoteLatencyFormat), dict);
      } else {
        formatedData.text = '-';
      }
    }
    return formatedData;
  }

  onSettingUpdate() {
    this.cancelUpdate();
    this.start();
  }

  cancelUpdate(isDeactivate = false) {
    if (isDeactivate) {
      siRelease();
    }
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}

export const sysMon = new SysMon();
