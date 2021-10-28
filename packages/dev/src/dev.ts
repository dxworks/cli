import '@dxworks/ktextensions'
import {Command} from 'commander'
import {devValidate} from './commands/validate'
import {devInit} from './commands/init'
import {_package} from './utils'

export const devCommand = new Command()
  .description(_package.description)
  .name('dev')
  .alias('dxdev')
  .version(_package.version, '-v, -version, --version, -V')
  .addCommand(devValidate)
  .addCommand(devInit)
