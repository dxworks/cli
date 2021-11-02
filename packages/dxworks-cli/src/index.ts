#!/usr/bin/env node

import {Command} from 'commander'
import {_package} from './utils'
import {initPlugins, pluginCommand} from './commands/plugin'

initPlugins()

const cli = new Command()
cli
  .description(_package.description)
  .version(_package.version, '-v, -version, --version, -V')
  .addCommand(pluginCommand)
  .parse(process.argv)
