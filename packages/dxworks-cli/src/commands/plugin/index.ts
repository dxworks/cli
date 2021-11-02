import {Command} from 'commander'
import {pluginList} from './list'
import {getAssetFile, pluginsFolder, pluginsPackage} from '../../utils'
import * as fs from 'fs'
import {log} from '@dxworks/cli-common'
import path from 'path'
import * as npm from '../../npm'
import {pluginInstall} from './install'

export const pluginCommand = new Command()
  .name('plugin')
  .description('handles dxworks cli plugins')
  .addCommand(pluginList)
  .addCommand(pluginInstall)


export function initPlugins(): void {
  if (!fs.existsSync(pluginsPackage)) {
    log.info('Initializing plugins folder')
    fs.mkdirSync(pluginsFolder)
    fs.cpSync(getAssetFile('plugins/package.json'), pluginsPackage)
    fs.cpSync(getAssetFile('plugins/.npmrc'), path.resolve(pluginsFolder, '.npmrc'))
    log.info('Created package.json')
    log.info('Added .npmrc')
    log.info('Installing plugins')
    npm.install()
  }
}
