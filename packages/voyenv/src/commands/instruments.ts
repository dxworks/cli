import {Command} from 'commander'
import * as path from 'path'
import * as fs from 'fs'
import {dxworksHubDir, log, updateDxworksHub} from '@dxworks/cli-common'

export const voyenvInstrument = new Command()
    .name('instrument')
    .description('manipulate the instruments a a voyager environment')
    .action(instrumentUpdate)


async function instrumentUpdate() {
    await updateDxworksHub()

    fs.readdirSync(path.resolve(dxworksHubDir, 'projects'))
        .filter(it => it.endsWith('.manifest.yml'))
        .forEach(file => {
            const slug = path.basename(file).removeSuffix('.manifest.yml')
            log.debug(slug)
        })
}

