import {platform} from 'os'
import {OS} from './constants'

export const osType = getOsType()
export const isWindows = osType === OS.WINDOWS
export const commandInterpreterName = getCommandInterpreter()
export const interpreterArg = getInterpreterArg()

function getOsType() {
  switch (platform()) {
    case 'darwin':
      return OS.MAC
    case 'win32':
      return OS.WINDOWS
    case 'linux':
      return OS.LINUX
    default:
      return OS.UNKNOWN
  }
}

function getCommandInterpreter() {
  if (isWindows) return 'cmd.exe'
  else return 'bash'
}

function getInterpreterArg() {
  if (isWindows) return '/C'
  else return '-c'
}


