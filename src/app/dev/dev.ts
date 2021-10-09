import {Command} from 'commander'
import {devValidate} from './commands/validate'
import {devInit} from './commands/init'

export const devCommand = new Command()
  .name('dev')
  .addCommand(devValidate)
  .addCommand(devInit)
