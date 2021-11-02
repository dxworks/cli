import {Command} from 'commander'
import chalk from 'chalk'
import {dxworksHubDir, log, updateDxworksHub} from '@dxworks/cli-common'
import path from 'path'
import * as fs from 'fs'
import * as npm from '../../npm'

export const pluginList = new Command()
  .name('list')
  .description('lists the installed packages')
  .option('-a --available', 'list all officially available dxworks cli plugins')
  .action(listPlugins)

async function listPlugins(options: any) {
  if (!options.available) {
    const installedPlugins = npm.list().dependencies

    if (!installedPlugins)
      log.info('No plugins are installed!')
    else {
      log.info('The following plugins are installed on your system:')
      console.table(installedPlugins)
    }
    log.info(`Run ${chalk.yellow('dxw plugin list -a')} for a list of all officially supported plugins.`)
  } else {
    await updateDxworksHub()
    const pluginsFile = path.resolve(dxworksHubDir, 'cli-plugins.json')
    const cliPluginsJSON = JSON.parse(fs.readFileSync(pluginsFile).toString()) as CliPluginsJSON
    log.info('These are all officially supported dxw plugins:')

    console.table(cliPluginsJSON.plugins.map(plugin => {
      const pluginInfo = npm.info(plugin)
      return {
        name: plugin,
        description: pluginInfo.description,
        latest: pluginInfo['dist-tags'].latest,
        install: `dxw plugin install ${plugin}`,
      }
    }))
  }
}

interface CliPluginsJSON {
  plugins: string[]
}
