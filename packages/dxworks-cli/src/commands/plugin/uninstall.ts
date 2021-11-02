import {Command} from 'commander'
import {npm} from '../../npm'

export const pluginUninstall = new Command()
  .name('uninstall')
  .aliases(['remove', 'rm'])
  .argument('<plugin>', 'npm module name for the plugin you want to uninstall')
  .description('uninstalls a plugin from the dxw cli')
  .action(uninstallPlugin)

async function uninstallPlugin(plugin: string) {
  npm.uninstall(plugin)
}
