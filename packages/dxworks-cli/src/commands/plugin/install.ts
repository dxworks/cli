import {Command} from 'commander'
import {npm} from '../../npm'
import {getAllAvailablePlugins} from './list'
import {log} from '@dxworks/cli-common'

export const pluginInstall = new Command()
    .name('install')
    .aliases(['i', 'add'])
    .description('installs a dxworks cli plugin')
    .argument('[plugins...]', 'npm module name for the plugin you want to install')
    .option('-a --all', 'whether to install all available plugins; ignores any plugins added as arguments', false)
    .action(installPlugins)

async function installPlugins(plugins: string[], options: { all: boolean }) {
    if (options.all) {
        const allPlugins = getAllAvailablePlugins()
        const allPluginNames = Object.keys(allPlugins)
        log.info(`Installing plugins ${allPluginNames.join(', ')}`)
        npm.install(allPluginNames.join(' '))
    } else {
        npm.install(plugins.join(' '))
    }
}
