import {Command} from 'commander'
import {hubUpdateCommand} from './update'
import {hubRefreshCommand} from './refresh'
import {dxworksHubDir} from '@dxworks/cli-common'

export const hubCommand = new Command()
  .name('hub')
  .description(`provides information and access to the dxworks-hub available at (${dxworksHubDir})`)
  .addCommand(hubUpdateCommand)
  .addCommand(hubRefreshCommand)
