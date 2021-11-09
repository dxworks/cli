import {Command} from 'commander'
import {npm} from '../../npm'

export const pluginUninstall = new Command()
  .name('uninstall')
  .aliases(['remove', 'rm'])
  .argument('<plugins...>', 'npm module name for the plugin you want to uninstall')
  .description('uninstalls a plugin from the dxw cli')
  .action(uninstallPlugin)

async function uninstallPlugin(plugins: string[]) {
  npm.uninstall(plugins.join(' '))
}
