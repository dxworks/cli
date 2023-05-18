import path from 'path'
import * as fs from 'fs'
import {dxwFolder} from '@dxworks/cli-common'

// eslint-disable-next-line @typescript-eslint/no-var-requires
export const _package = require('../package.json')

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

export function pluginPackageJson(module: string): any {
    return JSON.parse(fs.readFileSync(path.resolve(pluginsFolder, 'node_modules', module, 'package.json')).toString())
}

export function getPluginFile(module: string, file: string): string {
    return path.resolve(pluginsFolder, 'node_modules', module, file)
}
