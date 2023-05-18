import '@dxworks/ktextensions'

import {Command} from 'commander'
import {voyenvInit} from './commands/init'
import {voyenvInstall} from './commands/install'
import {voyenvInstrument} from './commands/instruments'
import {_package} from './utils'

export const voyenvCommand = new Command()
    .name('voyenv')
    .description(_package.description)
    .version(_package.version, '-v, -version, --version, -V')
    .addCommand(voyenvInit)
    .addCommand(voyenvInstall)
    .addCommand(voyenvInstrument)





