import {Command} from 'commander'
import omelette from 'omelette'
import * as fs from 'fs'
import path from 'path'
import {dxwFolder} from '../../utils'
import {homedir} from 'os'


export const bashCompletionCommand = new Command()
  .name('complete')
  .description('installs autocomplete for the dxw command')
  .option('--completion')
  .allowUnknownOption(true)
  .action(installBashCompletion)

function installBashCompletion() {
  const tree = JSON.parse(fs.readFileSync(path.resolve(dxwFolder, 'bash-completion.json')).toString())
  const completion = omelette('dxw').tree(tree)
  completion.init()
  // completion.cleanupShellInitFile()

  console.log(completion)
  completion.setupShellInitFile(path.resolve(homedir(), '.zshrc'))

}
