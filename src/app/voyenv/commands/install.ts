import {Command} from 'commander'
import {defaultVoyenvFileName} from '../../utils/constants'
import YAML from 'yaml'
import fs from 'fs'
import {Voyenv} from '../model/voyenv'
import {VoyagerService} from '../services/voyager.service'
import {InstrumentService} from '../services/instrument.service'
import {Octokit} from 'octokit'
import {version} from '../../utils/utils'
import path from 'path'


export const voyenvInstall = new Command()
  .name('install')
  .description('Will download and install a voyager release as well as its instruments and runtimes as specified in the configuration file')
  .argument('[voyenvFilePath]', 'The voyenv file with the configuration of the voyager release. By default, it is voyenv.yml', defaultVoyenvFileName)
  .action(install)


export async function install(file: string): Promise<void> {
  console.log(`Installing Voyager from ${file}`)

  const voyenvString = fs.readFileSync(file, 'utf-8')

  const voyenv = YAML.parse(voyenvString) as Voyenv

  console.log(`Setting up release ${voyenv.name}`)


  const voyenvDir = path.resolve(path.dirname(file))
  const rootDir = path.join(voyenvDir, voyenv.name)
  fs.mkdirSync(rootDir, {recursive: true})

  const octokit = getOctokit(voyenv)

  console.log('Downloading voyager')
  await new VoyagerService(octokit, rootDir).downloadAndInstallVoyager(voyenv.voyager_version)
  console.log('Downloading Instruments')
  await new InstrumentService(octokit, rootDir).downloadInstruments(voyenv.instruments)

  if (voyenv.name !== '.') {
    console.log('Copying Voyenv')
    voyenv.name = '.'
    fs.writeFileSync(path.resolve(rootDir, defaultVoyenvFileName), YAML.stringify(voyenv), {encoding: 'utf-8'})
  }

  process.exit(0)

}

function getOctokit(voyenv: Voyenv) {
  if (voyenv.token)
    return new Octokit({
      auth: voyenv.token,
      userAgent: `dxworks-cli ${version}`,
    })
  else return new Octokit({
    userAgent: `dxworks-cli ${version}`,
  })
}


