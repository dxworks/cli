import {Command} from 'commander'
import {pluginList} from './list'
import {getAssetFile, pluginsFolder, pluginsPackage} from '../../utils'
import * as fs from 'fs'
import {log} from '@dxworks/cli-common'
import path from 'path'
import {pluginInstall} from './install'
import {pluginUpdate} from './update'
import {npm} from '../../npm'
import {pluginOutdated} from './outdated'

export const pluginCommand = new Command()
  .name('plugin')
  .description('handles dxworks cli plugins')
  .addCommand(pluginList)
  .addCommand(pluginInstall)
  .addCommand(pluginUpdate)
  .addCommand(pluginOutdated)


export function initPlugins(): void {
  if (!fs.existsSync(pluginsPackage)) {
    log.info('Initializing plugins folder')
    fs.mkdirSync(pluginsFolder, {recursive: true})
    fs.cpSync(getAssetFile('plugins/package.json'), pluginsPackage)
    fs.cpSync(getAssetFile('plugins/.npmrc'), path.resolve(pluginsFolder, '.npmrc'))
    log.info('Created package.json')
    log.info('Added .npmrc')
    log.info('Installing plugins')
    npm.install()
  }
}
