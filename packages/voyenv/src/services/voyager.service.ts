import {Octokit} from 'octokit'
import {Presets, SingleBar} from 'cli-progress'

import path from 'path'
import * as fs from 'fs'
import {defaultOctokit, downloadFile, isNotNullNorUndefined, log, unzip} from '@dxworks/cli-common'
import {configFile, doctorFile, dxworks, missionFile, voyager, voyagerAssetName} from '../constants'
import {getAssetFile} from '../utils'
import semver, {rcompare, SemVer} from 'semver'

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
        progressBar?.update({action: 'Unzipping'})
        await unzip(voyagerArchive, {path: this.directory, overwriteRootDir: voyager})
        fs.rmSync(voyagerArchive)
        const voyagerDir = path.join(this.directory, voyager)
        fs.rmSync(path.resolve(voyagerDir, 'instruments'), {recursive: true, force: true})
        fs.readdirSync(voyagerDir).forEach(file =>
            fs.cpSync(path.resolve(voyagerDir, file), path.resolve(this.directory, file), {recursive: true}))
        fs.rmSync(voyagerDir, {recursive: true, force: true})
        fs.cpSync(getAssetFile('install/default-config.yml'), path.resolve(this.directory, configFile))
        fs.cpSync(getAssetFile('install/default-doctor.yml'), path.resolve(this.directory, doctorFile))
        fs.cpSync(getAssetFile('install/default-mission.yml'), path.resolve(this.directory, missionFile))
        fs.chmodSync(path.resolve(this.directory, 'voyager.sh'), '755')
        progressBar.stop()

    }

}

export async function getLatestVoyagerVersion(): Promise<string> {
    log.info('Computing latest Voyager version...')
    const {data} = await defaultOctokit.rest.repos.listReleases({
        owner: 'dxworks',
        repo: 'voyager',
    })
    const tag = data.map(it => it.tag_name)
        .filter(it => it.startsWith('v') && semver.valid(it))
        .map(it => semver.parse(it))
        .filter(it => it)
        .sort((v1, v2) => rcompare(v1 as SemVer, v2 as SemVer))
        .find(isNotNullNorUndefined)?.raw
    if (tag == null)
        return 'v1.5.0'
    return tag
}
