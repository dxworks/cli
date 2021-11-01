#!/usr/bin/env node

import {log} from '@dxworks/cli-common'
import {devCommand} from './dev'
import {_package} from './utils'

log.info(`Starting dxdev ${_package.version}`)
devCommand.parse(process.argv)

