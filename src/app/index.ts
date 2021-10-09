#!/usr/bin/env node

import './extensions/extensions'
import {Command} from 'commander'
import {voyenvCommand} from './voyenv/voyenv'
import {version} from './utils/utils'
import {devCommand} from './dev/dev'


const cli = new Command()
cli
  .description('DxWorks CLI - a cli utility to help with using and developing Dxworks projects.')
  .version(version, '-v, -version, --version, -V')
  .addCommand(voyenvCommand)
  .addCommand(devCommand)
  .parse(process.argv)
