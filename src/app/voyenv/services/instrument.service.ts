import {InstrumentConfig} from '../model/voyenv'
import path from 'path'
import {downloadFile, humanFileSize, isNotNullNorUndefined} from '../../utils/utils'
import semver, {rcompare, SemVer} from 'semver'
import {Octokit} from 'octokit'
import {MultiBar, Options, Params, Format, Presets, GenericFormatter} from 'cli-progress'
import fs from 'fs'
import chalk from 'chalk'
import {unzip} from '../../utils/compresss-utils'


export class InstrumentService {
  private readonly directory: string
  private readonly instrumentsDir: string
  private octokit: Octokit
  private token: string | undefined

  constructor(octokit: Octokit, directory = '.', token?: string) {
    this.octokit = octokit
    this.directory = directory
    this.instrumentsDir = path.resolve(directory, 'instruments')
    fs.mkdirSync(this.instrumentsDir, {recursive: true})
    this.token = token
  }

  public async downloadInstruments(instruments: InstrumentConfig[]): Promise<void> {
    const multiProgressBar = new MultiBar({
      clearOnComplete: false,
      hideCursor: true,
      format: this.createFormatter(instruments),
      formatBar: Format.BarFormat,
      barCompleteChar: Presets.shades_classic.barCompleteChar,
      barIncompleteChar: Presets.shades_classic.barIncompleteChar,
    })
    await Promise.all(instruments.map(instrument =>
      this.downloadAndUnzip(instrument, multiProgressBar)
    ))
    multiProgressBar.stop()
  }

  private async downloadAndUnzip(instrument: InstrumentConfig, multiProgressBar: MultiBar) {
    const singleBar = multiProgressBar.create(100, 0, {name: instrument.name, state: 'Getting Version'})

    const tagDetails = await this.getTag(instrument)

    if (tagDetails && tagDetails.downloadUrl) {
      const instrumentFolder = `${instrument.name.replace('/', '.')}-${tagDetails.tag}`
      const zipFileName = path.join(this.instrumentsDir, `${instrumentFolder}.zip`)
      await downloadFile(tagDetails.downloadUrl, zipFileName, {
        name: instrument.name,
        state: 'Downloading',
      }, singleBar)
      singleBar.update({name: instrument.name, state: 'Unzipping'})
      await unzip(zipFileName, {path: path.resolve(this.instrumentsDir, instrumentFolder)})
      fs.rmSync(zipFileName)
      singleBar.update({name: instrument.name, state: 'Done'})
    }
  }


  private async getLatestInstrumentTag(instrument: InstrumentConfig): Promise<TagDetails | null> {
    const [owner, repo] = InstrumentService.extractOwnerAndRepo(instrument.name)
    const {data} = await this.octokit.rest.repos.listReleases({
      owner,
      repo,
    })
    const tag = data.map(it => it.tag_name)
      .filter(it => it.startsWith('v') && it.endsWith('-voyager') && semver.valid(it))
      .map(it => semver.parse(it))
      .filter(it => it)
      .sort((v1, v2) => rcompare(v1 as SemVer, v2 as SemVer))
      .find(isNotNullNorUndefined)?.raw
    if (tag == null)
      return null

    const downloadUrl = await this.getDownloadUrl(instrument, data, tag)

    return {
      tag,
      downloadUrl,
    }
  }

  private async getDownloadUrl(instrument: InstrumentConfig, releases: any[], tag: string) {
    if (instrument.asset)
      return releases.find(it => it.tag_name === tag)?.assets.find((it: any) => it.name === instrument.asset)?.browser_download_url
    else {
      const [owner, repo] = InstrumentService.extractOwnerAndRepo(instrument.name)

      return (await this.octokit.rest.repos.downloadZipballArchive({
        owner,
        repo,
        ref: tag,
      })).url
    }

  }

  private static extractOwnerAndRepo(name: string): string[] {
    return name.split('/')
  }

  private async getTag(instrumentConfig: InstrumentConfig): Promise<TagDetails | null> {
    if (instrumentConfig.tag === undefined) {
      return await this.getLatestInstrumentTag(instrumentConfig)
    } else {
      const [owner, repo] = InstrumentService.extractOwnerAndRepo(instrumentConfig.name)
      const release = (await this.octokit.rest.repos.getReleaseByTag({
        owner,
        repo,
        tag: instrumentConfig.tag,
      })).data

      return {
        tag: instrumentConfig.tag,
        downloadUrl: await this.getDownloadUrl(instrumentConfig, [release], instrumentConfig.tag),
      }
    }
  }

  public createFormatter(instruments: InstrumentConfig[]): GenericFormatter {
    const maxNameLen = instruments.map(it => it.name.length).max()
    return function (options: Options, params: Params, payload: { name: string, state: string }) {

      // bar grows dynamically by current progress - no whitespaces are added
      // const bar = options.barCompleteString.substr(0, Math.round(params.progress * options.barsize));
      // console.log(options)

      if (payload.state === 'Done') {
        return `${payload.name.padEnd(maxNameLen)}: ${chalk.green(payload.state.padEnd(15))} [${options.formatBar?.call(null, params.progress, options)}] ${(Math.floor(params.progress*100) + '').padStart(3)}% | ${humanFileSize(params.value)} / ${humanFileSize(params.total)}`
      } else {
        return `${payload.name.padEnd(maxNameLen)}: ${chalk.yellow(payload.state.padEnd(15))} [${options.formatBar?.call(null, params.progress, options)}] ${(Math.floor(params.progress*100) + '').padStart(3)}% | ${humanFileSize(params.value)} / ${humanFileSize(params.total)}`
      }
    }
  }
}


interface TagDetails {
  tag: string | undefined
  downloadUrl: string | undefined
}
