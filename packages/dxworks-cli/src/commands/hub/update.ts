import {Command} from 'commander'
import {updateDxworksHub} from '@dxworks/cli-common'

export const hubUpdateCommand = new Command()
  .name('update')
  .description('update dxworks-hub')
  .aliases(['pull', 'fetch', 'get'])
  .action(updateDxworksHub)

