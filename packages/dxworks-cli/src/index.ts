#!/usr/bin/env node

import {Command} from 'commander'
import {voyenvCommand} from '@dxworks/voyenv'
import {_package} from './utils'
import {devCommand} from '@dxworks/dev'



const cli = new Command()
cli
  .description(_package.description)
  .version(_package.version, '-v, -version, --version, -V')
  .addCommand(voyenvCommand)
  .addCommand(devCommand)
  .parse(process.argv)
