import {Command} from 'commander'
import * as fs from 'fs'
import path from 'path'
import {npm} from '../../npm'

export const pluginLink = new Command()
  .name('link')
  .alias('ln')
  .argument('[path]', 'Path to folder or package.json file you want to link', process.cwd())
  .description('Links a local project as plugin tot the global installation of dxworks cli')
  .action(linkPlugins)

function validatePackageJsonPath(_path: string): string {
  const stats = fs.statSync(_path)
  if(stats.isDirectory()) {
    const packagePath = path.resolve(_path, 'package.json')
    if(fs.existsSync(packagePath))
      return packagePath
  }else if(stats.isFile()) {
    if(path.basename(_path) === 'package.json') {
      return _path
    }
  }
  throw Error('Path is neither a package.json file nor a npm package folder.')
}

async function linkPlugins(_path: string) {
  const packageJsonPath = validatePackageJsonPath(_path)
  const packageName = JSON.parse(fs.readFileSync(packageJsonPath).toString()).name
  npm.link('', '', path.dirname(packageJsonPath))
  npm.link(packageName, '--save')
}
