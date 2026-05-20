/* eslint-disable @typescript-eslint/naming-convention */
export enum Commands {
  'CopyIp' = 'SysMon.CopyIp',
  'EnableAll' = 'SysMon.EnableAll',
  'DisableAll' = 'SysMon.DisableAll',
  'EnableCpuLoad' = 'SysMon.EnableCpuLoad',
  'DisableCpuLoad' = 'SysMon.DisableCpuLoad',
  'EnableNetworkSpeed' = 'SysMon.EnableNetworkSpeed',
  'DisableNetworkSpeed' = 'SysMon.DisableNetworkSpeed',
  'EnableLoadavg' = 'SysMon.EnableLoadavg',
  'DisableLoadavg' = 'SysMon.DisableLoadavg',
  'EnableMemoUsage' = 'SysMon.EnableMemoUsage',
  'DisableMemoUsage' = 'SysMon.DisableMemoUsage',
  'EnableUptime' = 'SysMon.EnableUptime',
  'DisableUptime' = 'SysMon.DisableUptime',
  'EnableRemoteLatency' = 'SysMon.EnableRemoteLatency',
  'DisableRemoteLatency' = 'SysMon.DisableRemoteLatency'
}

export enum ConfigurationKeys {
  RefreshInterval = 'refreshInterval',
  Location = 'location',
  Priority = 'priority',
  AggregateItem = 'aggregateItem',
  Modules = 'modules',
  AllEnabled = 'enabled',
  CpuLoadFormat = 'cpuLoad.format',
  LoadavgFormat = 'loadavg.format',
  NetworkSpeedFormat = 'networkSpeed.format',
  MemoUsageFormat = 'memoUsage.format',
  UptimeFormat = 'uptime.format',
  RemoteLatencyFormat = 'remoteLatency.format'
}
