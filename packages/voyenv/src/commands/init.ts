import template from 'string-template'
import * as fs from 'fs'
import * as path from 'path'
import {Command, Option} from 'commander'
import {log, OS, osType} from '@dxworks/cli-common'
import {defaultVoyenvFileName} from '../constants'
import {getAssetFile} from '../utils'

type VoyenvInitOptions = {
  createDir?: boolean,
  allInstruments?: boolean,
  allRuntimes?: boolean,
  name?: string,
  voyagerVersion?: string,
  platform?: string,
}

export const voyenvInit = new Command()
  .name('init')
  .description('Initializes a voyenv project by creating a voyenv.yml file')
  .argument('[folder]', 'the folder where to generate the voyenv file', '.')
  .option('-c, --create-dir', 'whether to create the output dir', false)
  .option('-i, --all-instruments', 'whether to add all official instruments', false)
  .option('-r, --all-runtimes', 'whether to add all supported runtimes', false)
  .option('-n, --name <name>', 'name of the voyager release', 'voyager')
  .option('-v, --voyager-version <version>', 'voyager version to download', 'v1.5.0')
  .addOption(new Option('-p, --platform <platform>', 'the target platform for voyager').choices([OS.WINDOWS, OS.MAC, OS.LINUX]).default(osType))
  .action(init)


export function chooseAssetFile(options: VoyenvInitOptions): string | undefined {
  if (!options.allRuntimes && !options.allInstruments)
    return 'simple-voyenv.yml'
  if (!options.allRuntimes && options.allInstruments)
    return 'instruments-voyenv.yml'
  if (options.allRuntimes)
    return 'full-voyenv.yml'
}

function init(folder: string, options: VoyenvInitOptions) {
  log.info(`Creating voyenv.yml file in ${folder}`)
  if (!fs.existsSync(folder)) {
    if (options.createDir) fs.mkdirSync(folder, {recursive: true})
    else {
      log.error(`Error: Voyenv could not initialize the folder path ${path.resolve(folder)} does not exist. If you want Voyenv to create the directory use the -c (--create-dir) flag`)
      process.exit(1)
    }
  }
  const voyenvFile = path.join(folder, defaultVoyenvFileName)

  const assetName = `voyenv/init/${chooseAssetFile(options)}`
  const templateString = fs.readFileSync(getAssetFile(assetName), 'utf-8')
  fs.writeFileSync(voyenvFile, template(templateString, {
    voyagerName: options.name,
    voyagerVersion: options.voyagerVersion,
    platform: options.platform,
  }))

}



