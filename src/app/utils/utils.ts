import path from 'path'

// eslint-disable-next-line @typescript-eslint/no-var-requires
export const version = require('../../../package.json').version

export function getAssetFile(assetName: string){
  return path.join(__dirname, '../../assets', assetName)
}
