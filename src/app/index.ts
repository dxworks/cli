#!/usr/bin/env node

import {Command} from 'commander'
import chalk from 'chalk'
import {voyenvCommand} from './voyenv/voyenv'
import {version} from './utils/utils'

// const path = require('path');


console.log(chalk.magenta(`Starting dxworks-cli ${version}`))

const cli = new Command()
cli
  .version('0.1.0')
  .description('DxWorks CLI - a cli utility to help with using and developing Dxworks projects.')
  .addCommand(voyenvCommand)
  .parse(process.argv)
