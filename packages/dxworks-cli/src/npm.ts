import {execSync} from 'child_process'
import {npmExePath, pluginsFolder} from './utils'

export function list(options?: string, processOptions?: any): any {
  if (!options)
    options = '--depth=0 --prod --json'

  if (processOptions)
    return JSON.parse(npmCommand(`ls ${options}`, processOptions).toString())
  else
    return JSON.parse(npmCommand(`ls ${options}`).toString())
}

export function versionsFor(module: string): string[] {
  return info(module, 'versions') as string[]
}

export function info(module: string, field = '', json = true): any {
  const result = npmCommand(`info ${module} ${field} ${json ? '--json' : ''}`, {
    cwd: __dirname,
    stdio: ['pipe', 'pipe', 'inherit'],
  })
  return JSON.parse(result.toString())
}

export function install(module = '', otherOptions = '', directory = pluginsFolder): any {
  npmCommand(`install ${module} ${otherOptions}`, {cwd: directory, stdio: 'inherit'})
}

export function npmCommand(args: string, options?: any): string | Buffer {
  if (!options)
    return execSync(`${npmExePath} ${args}`, {cwd: pluginsFolder, stdio: ['pipe', 'pipe', 'inherit']})
  else
    return execSync(`${npmExePath} ${args}`, options)

}
