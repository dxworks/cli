import fs from 'fs'
import * as git from 'isomorphic-git'
import * as http from 'isomorphic-git/http/node'
import {log} from './logging'
import path from 'path'
import {homedir} from 'os'

export const dxworksHubGithubUrl = 'https://github.com/dxworks/dxworks-hub'

export const dxworksHubDir = path.resolve(homedir(), '.dxw', 'hub')

export async function updateDxworksHub(): Promise<void> {
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
