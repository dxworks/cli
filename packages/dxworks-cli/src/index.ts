#!/usr/bin/env node

import {Command} from 'commander'
import {_package, dxwFolder, getPluginFile, pluginPackageJson, pluginsPackage} from './utils'
import {initPlugins, pluginCommand} from './commands/plugin'
import '@dxworks/ktextensions'
import * as fs from 'fs'
import {log} from '@dxworks/cli-common'
import path from 'path'
import {bashCompletionCommand} from './commands/bashCompletion'

initPlugins()

function getCommandCompletionTree(it: Command) {
  return it.commands.map(it => it.name())
}

function createCommandBashCompletionTree(cli: Command) {
  const completionTree = cli.commands.reduce((a: any, it) => ({...a, [it.name()]: getCommandCompletionTree(it)}), {})
  console.log(completionTree)
  fs.writeFileSync(path.resolve(dxwFolder, 'bash-completion.json'), JSON.stringify(completionTree))
}

function initDxwCommand() {
  const cli = new Command()
    .description(_package.description)
    .version(_package.version, '-v, -version, --version, -V')
    .addCommand(pluginCommand)
    .addCommand(bashCompletionCommand)


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
  createCommandBashCompletionTree(cli)
  return cli
}

export const cli = initDxwCommand()

cli.parse(process.argv)

