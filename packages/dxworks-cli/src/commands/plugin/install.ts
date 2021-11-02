import {Command} from 'commander'
import {npm} from '../../npm'

export const pluginInstall = new Command()
  .name('install')
  .description('installs a dxworks cli plugin')
  .argument('<plugin>', 'npm module name for the plugin you want to install')
  .action(listPlugins)

async function listPlugins(plugin: string) {
  npm.install(plugin)
}
