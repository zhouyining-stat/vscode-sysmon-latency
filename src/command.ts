import { ExtensionContext, commands, window, env, ConfigurationTarget } from 'vscode';
import { Commands, ConfigurationKeys } from './types';
import { setting } from './setting';
import { getIP } from './sysinfo';

class Command {
  init(context: ExtensionContext) {
    this.registerCommand(context);
    this.changeContext();
  }

  changeContext() {
    const modules = setting.curModules;
    setting.allModules.forEach(moduleName => {
      commands.executeCommand('setContext', `sysMon.${moduleName}`, modules.includes(moduleName));
    });
  }

  registerCommand(context: ExtensionContext) {
    context.subscriptions.push(
      commands.registerCommand(
        Commands.CopyIp,
        async () => {
          try {
            const ip = await getIP();
            if (ip) {
              env.clipboard.writeText(ip);
              window.showInformationMessage(`The IP ${ip} was copied successfully`);
            } else {
              window.showInformationMessage(`IP Not Found`);
            }
          } catch (err) {
            if (err instanceof Error) {
              window.showErrorMessage(`IP get error: ${err.message}`);
            }
          }
        },
        this
      )
    );

    context.subscriptions.push(
      commands.registerCommand(
        Commands.EnableAll,
        () => {
          setting.cfg?.update(ConfigurationKeys.AllEnabled, true, ConfigurationTarget.Global);
        },
        this
      )
    );

    context.subscriptions.push(
      commands.registerCommand(
        Commands.DisableAll,
        () => {
          setting.cfg?.update(ConfigurationKeys.AllEnabled, false, ConfigurationTarget.Global);
        },
        this
      )
    );

    context.subscriptions.push(
      commands.registerCommand(
        Commands.EnableCpuLoad,
        () => {
          setting.enableModule('cpuLoad');
        },
        this
      )
    );

    context.subscriptions.push(
      commands.registerCommand(
        Commands.DisableCpuLoad,
        () => {
          setting.disableModule('cpuLoad');
        },
        this
      )
    );

    context.subscriptions.push(
      commands.registerCommand(
        Commands.EnableLoadavg,
        () => {
          setting.enableModule('loadavg');
        },
        this
      )
    );

    context.subscriptions.push(
      commands.registerCommand(
        Commands.DisableLoadavg,
        () => {
          setting.disableModule('loadavg');
        },
        this
      )
    );

    context.subscriptions.push(
      commands.registerCommand(
        Commands.EnableNetworkSpeed,
        () => {
          setting.enableModule('networkSpeed');
        },
        this
      )
    );

    context.subscriptions.push(
      commands.registerCommand(
        Commands.DisableNetworkSpeed,
        () => {
          setting.disableModule('networkSpeed');
        },
        this
      )
    );

    context.subscriptions.push(
      commands.registerCommand(
        Commands.EnableMemoUsage,
        () => {
          setting.enableModule('memoUsage');
        },
        this
      )
    );

    context.subscriptions.push(
      commands.registerCommand(
        Commands.DisableMemoUsage,
        () => {
          setting.disableModule('memoUsage');
        },
        this
      )
    );

    context.subscriptions.push(
      commands.registerCommand(
        Commands.EnableUptime,
        () => {
          setting.enableModule('uptime');
        },
        this
      )
    );

    context.subscriptions.push(
      commands.registerCommand(
        Commands.DisableUptime,
        () => {
          setting.disableModule('uptime');
        },
        this
      )
    );

    context.subscriptions.push(
      commands.registerCommand(
        Commands.EnableRemoteLatency,
        () => {
          setting.enableModule('remoteLatency');
        },
        this
      )
    );

    context.subscriptions.push(
      commands.registerCommand(
        Commands.DisableRemoteLatency,
        () => {
          setting.disableModule('remoteLatency');
        },
        this
      )
    );
  }
}

export const command = new Command();
