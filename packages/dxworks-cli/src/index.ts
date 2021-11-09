#!/usr/bin/env node

import {Command} from 'commander'
import {_package, getPluginFile, pluginPackageJson, pluginsPackage} from './utils'
import {initPlugins, pluginCommand} from './commands/plugin'
import '@dxworks/ktextensions'
import * as fs from 'fs'
import {log} from '@dxworks/cli-common'

initPlugins()

function initDxwCommand() {
  const cli = new Command()
    .description(_package.description)
    .version(_package.version, '-v, -version, --version, -V')
    .addCommand(pluginCommand)


  const pluginsPackageJson = JSON.parse(fs.readFileSync(pluginsPackage).toString())
  Object.keys(pluginsPackageJson.dependencies).forEach(plugin => {
    const pluginPackage = pluginPackageJson(plugin)
    const commands: { command: string, file: string }[] = pluginPackage?.dxw?.commands
    if (commands) {
      commands.map(c => {
        const filePath = getPluginFile(plugin, c.file)
        if (fs.existsSync(filePath)) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const command: Command = require(filePath)[c.command]
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            cli.addCommand(command.description(`[from: ${plugin}] ${command._description}`))
          } catch (e) {
            log.error(`Could not load command ${commands} from plugin ${plugin}`)
          }
        }
      })
    }
  })

  cli.commands.sort((a, b) => a.name().localeCompare(b.name()))
  return cli
}

export const cli = initDxwCommand()

cli.parse(process.argv)

