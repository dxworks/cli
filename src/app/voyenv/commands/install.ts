import {Command} from 'commander'
import {defaultVoyenvFileName} from '../../utils/constants'


export const voyenvInstall = new Command()
  .name('install')
  .description('Will download and install a voyager release as well as its instruments and runtimes as specified in the configuration file')
  .argument('[voyenvFilePath]', 'The voyenv file with the configuration of the voyager release. By default, it is voyenv.yml', defaultVoyenvFileName)
  .action(install)


function install(file: string, options: any, command: Command) {
  console.log(`Installing Voyager from ${file}`)
}
