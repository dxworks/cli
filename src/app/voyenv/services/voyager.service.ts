import {downloadFile, getAssetFile} from '../../utils/utils'
import {Octokit} from 'octokit'
import {Presets, SingleBar} from 'cli-progress'

import {configFile, doctorFile, dxworks, missionFile, voyager, voyagerAssetName} from '../../utils/constants'
import path from 'path'
import * as fs from 'fs'
import {unzip} from '../../utils/compresss-utils'

export class VoyagerService {
  private octokit: Octokit
  private readonly directory: string
  private token: string | undefined

  constructor(octokit: Octokit, directory = '.', token?: string) {
    this.octokit = octokit
    this.directory = directory
    this.token = token
  }

  public async downloadAndInstallVoyager(voyagerVersion: string): Promise<void> {
    const release = await this.octokit.rest.repos.getReleaseByTag({
      owner: dxworks,
      repo: voyager,
      tag: voyagerVersion,
    })

    const progressBar = new SingleBar({
      format: 'voyager: {action} [{bar}] {percentage}% | ETA: {eta}s',
    }, Presets.shades_classic)

    const voyagerArchive = await downloadFile(release.data.assets[0].browser_download_url, path.resolve(this.directory, voyagerAssetName), {action: 'Downloading'}, progressBar)
    progressBar.update({action: 'Unzipping'})
    await unzip(voyagerArchive, {path: this.directory, overwriteRootDir: voyager})
    fs.rmSync(voyagerArchive)
    const voyagerDir = path.join(this.directory, voyager)
    fs.rmSync(path.resolve(voyagerDir, 'instruments'), {recursive: true, force: true})
    fs.readdirSync(voyagerDir).forEach(file =>
      fs.cpSync(path.resolve(voyagerDir, file), path.resolve(this.directory, file), {recursive: true}))
    fs.rmSync(voyagerDir, {recursive: true, force: true})
    fs.cpSync(getAssetFile('voyenv/install/default-config.yml'), path.resolve(this.directory, configFile))
    fs.cpSync(getAssetFile('voyenv/install/default-doctor.yml'), path.resolve(this.directory, doctorFile))
    fs.cpSync(getAssetFile('voyenv/install/default-mission.yml'), path.resolve(this.directory, missionFile))
    progressBar.stop()

  }

}
