import {homedir} from 'os'
import path from 'path'

// eslint-disable-next-line @typescript-eslint/no-var-requires
export const _package = require('../package.json')

export const dxwFolder = path.resolve(homedir(), '.dxw')
export const pluginsFolder = path.resolve(dxwFolder, 'plugins')

// eslint-disable-next-line @typescript-eslint/no-var-requires
export const pluginsPackage = path.resolve(pluginsFolder, 'package.json')

export function getAssetFile(assetName: string): string {
  return path.join(__dirname, 'assets', assetName)
}

export const npmExePath = getBin('npm')
export const ncuPath = getBin('ncu')

function getBin(exe: string): string {
  return path.resolve(__dirname, '..', 'node_modules', '.bin', exe)
}
