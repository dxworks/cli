#!/usr/bin/env node

import chalk from 'chalk'
import {version} from './utils/utils'
import './extensions/extensions'
import {Command} from 'commander'
import {voyenvCommand} from './voyenv/voyenv'

// const path = require('path');


console.log(chalk.magenta(`Starting dxworks-cli ${version}`))

const cli = new Command()
cli
  .version('0.1.0')
  .description('DxWorks CLI - a cli utility to help with using and developing Dxworks projects.')
  .addCommand(voyenvCommand)
  // .addCommand( dev )
  .parse(process.argv)
