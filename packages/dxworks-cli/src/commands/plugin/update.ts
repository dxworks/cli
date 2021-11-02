import {Command} from 'commander'
import {npm} from '../../npm'
import {execSync} from 'child_process'
import {ncuPath} from '../../utils'

export const pluginUpdate = new Command()
  .name('update')
  .description('update dxworks cli plugins')
  .argument('[plugins...]', 'npm module name for the plugin you want to install')
  .option('-l --latest')
  .action(updatePlugins)

async function updatePlugins(plugins: string[], options: any) {
  if (!plugins || plugins.length == 0) {
    if (options.latest) {
      execSync(`${ncuPath} -u`)
      npm.install()
    } else {
      npm.update()
    }
  } else {
    if (options.latest) {
      npm.install(`${plugins.map(plugin => `${plugin.removeSuffix('@latest')}@latest`).join(' ')}`)
    } else {
      npm.update(`${plugins.map(plugin => plugin.removeSuffix('@latest')).join(' ')}`)
    }
  }
}
