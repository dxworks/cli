import {Command} from 'commander'
import chalk from 'chalk'
import {dxworksHubDir, log, updateDxworksHub} from '@dxworks/cli-common'
import path from 'path'
import * as fs from 'fs'
import {npm} from '../../npm'
import {emoji} from 'node-emoji'
import {SemVer} from 'semver'

export const pluginList = new Command()
    .name('list')
    .alias('ls')
    .description('lists the installed packages')
    .option('-a --available', 'list all officially available dxworks cli plugins')
    .action(listPlugins)

async function listPlugins(options: any) {
    const installedPlugins = npm.list().dependencies
    if (!options.available) {
        if (!installedPlugins)
            log.info('No plugins are installed!')
        else {
            log.info('The following plugins are installed on your system:')

            console.table(installedPlugins, ['version', 'resolved'])
        }
        log.info(`Run ${chalk.yellow('dxw plugin list -a')} for a list of all officially supported plugins.`)
        log.info(`Run ${chalk.yellow('dxw plugin outdated')} for a list of all outdated installed plugins.`)
    } else {
        await updateDxworksHub()
        log.info('These are all officially supported dxw plugins:')
        const tabularData = getAllAvailablePlugins(installedPlugins)
        console.table(tabularData, ['description', 'latest', 'installed'])
        log.info(`Run ${chalk.yellow('dxw plugin outdated')} for a list of all outdated installed plugins.`)
    }
}

export function getAllAvailablePlugins(installedPlugins = npm.list().dependencies): any {
    const pluginsFile = path.resolve(dxworksHubDir, 'cli-plugins.json')
    const cliPluginsJSON = JSON.parse(fs.readFileSync(pluginsFile).toString()) as CliPluginsJSON
    const installedPluginNames = Object.keys(installedPlugins)

    return cliPluginsJSON.plugins.map(plugin => {
        try {
            const pluginInfo = npm.info(plugin)
            const latestVersion = pluginInfo['dist-tags'].latest
            const installedPluginVersion = installedPlugins[plugin]?.version
            let _emoji = emoji.thumbsdown
            try {
                if (installedPluginVersion === latestVersion)
                    _emoji = emoji.tada
                else {
                    const installedPluginSemver = new SemVer(installedPluginVersion)
                    const latestSemver = new SemVer(latestVersion)
                    if (installedPluginSemver.major === latestSemver.major)
                        _emoji = emoji.thumbsup
                }
            } catch (e) {
                //ignore
            }

            return {
                name: plugin,
                description: pluginInfo.description,
                latest: latestVersion,
                installed: installedPluginNames.includes(plugin) ? _emoji + ' ' + installedPlugins[plugin].version : `$ dxw plugin i ${plugin}`,
            }
        } catch (e) {
            log.error(`Could not find plugin ${plugin}`)
            return null
        }
    })
        .filter(it => it !== null)
        .reduce((a: any, it) => ({...a, [it!.name]: it}), {})
}

interface CliPluginsJSON {
    plugins: string[]
}
