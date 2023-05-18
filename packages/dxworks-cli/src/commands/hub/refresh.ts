import {Command} from 'commander'
import {dxworksHubDir, log, updateDxworksHub} from '@dxworks/cli-common'
import * as fs from 'fs'

export const hubRefreshCommand = new Command()
    .name('refresh')
    .description('update dxworks-hub')
    .aliases(['reset', 'rs'])
    .action(refreshHub)

async function refreshHub() {
    log.info(`Removing hub directory ${dxworksHubDir}`)
    fs.rmSync(dxworksHubDir, {recursive: true, force: true})
    await updateDxworksHub()
}

