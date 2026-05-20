import * as os from 'os';

export const platform = os.platform();
export const isWin32 = platform === 'win32';
export const isDarwin = platform === 'darwin';

export function formatBytes(data: number, fixedNumber = 0, customSize = 0) {
  const KB = 1024;
  const MB = 1024 * 1024;
  const GB = 1024 * 1024 * 1024;

  let formatRes: { data: number; unit: 'KB' | 'MB' | 'GB' | 'CUSTOM' };

  if (customSize > 0) {
    formatRes = {
      data: data / customSize,
      unit: 'CUSTOM'
    };
  } else if (data < KB) {
    formatRes = {
      data: 0,
      unit: 'KB'
    };
  } else if (data < MB) {
    formatRes = {
      data: data / KB,
      unit: 'KB'
    };
  } else if (data < GB) {
    formatRes = {
      data: data / MB,
      unit: 'MB'
    };
  } else {
    formatRes = {
      data: data / GB,
      unit: 'GB'
    };
  }

  return { ...formatRes, data: formatRes.data.toFixed(fixedNumber) };
}

export function padNumber(num: number | string, width: number, decimal = 0): string {
  const str = typeof num === 'number' ? num.toFixed(decimal) : String(num);
  const [intPart, decPart] = str.split('.');
  const paddedInt = intPart.padStart(width, ' ');
  return decPart !== undefined ? `${paddedInt}.${decPart}` : paddedInt;
}

export function formatNetworkSpeed(value: number, unit: string): string {
  // 网速：KB 无小数，MB/GB 有小数，最多3位有效数字
  if (unit === 'KB') {
    // KB: 无小数点，最多3位整数
    return Math.round(value).toString().padStart(3, ' ');
  } else {
    // MB/GB: 有小数点，最多3位有效数字
    let decimals = 2;
    if (value >= 100) {
      decimals = 0; // 100+: 无小数
    } else if (value >= 10) {
      decimals = 1; // 10-99: 1位小数
    }
    // 0-9: 2位小数
    return value.toFixed(decimals).padStart(5, ' ');
  }
}

export function formatLatency(value: number): string {
  // 延时：无小数点，最多3位整数
  return Math.round(value).toString().padStart(3, ' ');
}

export async function withTimeout<T>(
  promise: Promise<T> | Thenable<T>,
  timeoutMs: number,
  defaultValue: T
): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>(resolve => setTimeout(() => resolve(defaultValue), timeoutMs))
  ]);
}

export function formatTimes(data: number) {
  const minute = 60;
  const hour = 60 * 60;
  const day = 24 * 60 * 60;

  const formatRes: [number, number, number] = [0, 0, 0];

  const curDays = Math.floor(data / day);
  const curHours = Math.floor((data - curDays * day) / hour);
  const curMinutes = Math.floor((data - curDays * day - curHours * hour) / minute);

  formatRes[0] = curDays;
  formatRes[1] = curHours;
  formatRes[2] = curMinutes;

  return formatRes;
}

export function formatByDict<T extends { [prop: string]: any }>(raw = '', dict: T): string {
  let res = raw;
  raw.match(/\$\{[^{}]*\}/g)?.forEach(item => {
    const key = item.replace(/(\$\{)|(\})/g, '');
    if (key in dict) {
      res = res.replace(item, dict[key]);
    }
  });

  return res.trim();
}
