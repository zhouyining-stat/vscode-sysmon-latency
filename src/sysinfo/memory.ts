import * as os from 'os';
import { exec } from 'child_process';

type FormatedVmStat = {
  total: number;
  pageSize: number;
  pagesActive: number;
  pagesInactive: number;
  pagesWiredDown: number;
  pagesSpeculative: number;
  pagesOccupiedByCompressor: number;
  fileBackedPages: number;
  pagesPurgeable: number;
  [prop: string]: number;
};

/**
 * Get formated data from `vm_stat` command
 * @description man vm_stat
 */
function getFormatedVmStat(): Promise<FormatedVmStat> {
  return new Promise((resolve, reject) => {
    exec('vm_stat', (error, stdout) => {
      if (error) {
        reject(error);
        return;
      }

      const rawVmStat = stdout;

      const data: FormatedVmStat = {
        total: os.totalmem(),
        pageSize: 4096,
        pagesActive: 0,
        pagesInactive: 0,
        pagesWiredDown: 0,
        pagesSpeculative: 0,
        pagesOccupiedByCompressor: 0,
        fileBackedPages: 0,
        pagesPurgeable: 0
      };

      rawVmStat.split('\n').forEach((line, index) => {
        if (index === 0) {
          /**
           * Mach Virtual Memory Statistics: (page size of 16384 bytes)
           */

          const pageSize = /page\ssize\sof\s(\d*)\sbytes/i.exec(line)?.[1];
          if (pageSize) {
            data.pageSize = parseInt(pageSize);
          }
        } else {
          /**
           * Pages free:                               20567.
           * Pages active:                            353728.
           * Pages inactive:                          352540.
           * Pages speculative:                         1366.
           * Pages throttled:                              0.
           * Pages wired down:                        125484.
           * Pages purgeable:                          13220.
           */

          const [rawKey, rawValue] = line.split(':');
          if (rawKey && rawValue) {
            const key = rawKey
              .trim()
              .toLowerCase()
              .replace(/"/g, '')
              .replace(/(_|-)/g, ' ')
              .split(' ')
              .map((word, index) => `${index === 0 ? word[0] : word.charAt(0).toUpperCase()}${word.slice(1)}`)
              .join('');
            const value = rawValue.trim().replace(/\./g, '');
            data[key] = parseInt(value);
          }
        }
      });

      resolve(data);
    });
  });
}

type MacOsMemoryUsageInfo = {
  total: number;
  used: number;
  free: number;
  active: number;
  inactive: number;
  wired: number;
  compressed: number;
  app: number;
  cache: number;
  vmStat: FormatedVmStat;
  pressurePercent: number;
  usagePercent: number;
};

export async function getMacOsMemoryUsageInfo() {
  const vmStat = await getFormatedVmStat();

  const active = vmStat.pagesActive * vmStat.pageSize;
  const inactive = vmStat.pagesInactive * vmStat.pageSize;
  const speculative = vmStat.pagesSpeculative * vmStat.pageSize;
  const wired = vmStat.pagesWiredDown * vmStat.pageSize;
  const compressed = vmStat.pagesOccupiedByCompressor * vmStat.pageSize;
  const fileBacked = vmStat.fileBackedPages * vmStat.pageSize;
  const purgeable = vmStat.pagesPurgeable * vmStat.pageSize;

  // https://github.com/exelban/stats/blob/master/Modules/RAM/readers.swift#L56 fileBacked=external
  const used = active + inactive + speculative + wired + compressed - purgeable - fileBacked;
  const free = vmStat.total - used;

  const app = used - wired - compressed;
  const cache = purgeable + fileBacked;

  const pressurePercent = (wired + compressed) / vmStat.total;
  const usagePercent = used / vmStat.total;

  return {
    total: vmStat.total,
    used,
    free,
    active,
    inactive,
    wired,
    compressed,
    app,
    cache,
    vmStat,
    pressurePercent,
    usagePercent
  } as MacOsMemoryUsageInfo;
}
