import {Command} from 'commander'
import {voyenvInit} from './commands/init'
import {voyenvInstall} from './commands/install'
import {voyenvInstrument} from './commands/instruments'

export const voyenvCommand = new Command()
  .name('voyenv')
  .addCommand(voyenvInit)
  .addCommand(voyenvInstall)
  .addCommand(voyenvInstrument)

