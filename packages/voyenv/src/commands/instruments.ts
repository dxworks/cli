import {Command} from 'commander'
import * as path from 'path'
import * as fs from 'fs'
import * as git from 'isomorphic-git'
import * as http from 'isomorphic-git/http/node'
import {homedir} from 'os'
import {log} from '@org.dxworks/cli-common'
import {dxworksHubGithubUrl} from '../constants'

const dxworksHubDir = path.resolve(homedir(), '.dxw', 'hub')

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

async function updateDxworksHub() {
  try {
    log.info('Updating dxworks-hub...')
    await git.pull({
      fs, http, dir: dxworksHubDir, ref: 'main', singleBranch: true, author: {name: 'cli', email: 'cli@dxworks.org'},
    })
    log.info('Successfully updated')
  } catch (e) {
    log.warn('No repository found, cloning...', e)
    await git.clone({
      fs, http, dir: dxworksHubDir, url: dxworksHubGithubUrl,
    })
    log.info('Successfully cloned')

  }
}
