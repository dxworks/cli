import path from 'path'
import {SingleBar} from 'cli-progress'
import fs from 'fs'
import request from 'request'
import {Octokit} from 'octokit'

// eslint-disable-next-line @typescript-eslint/no-var-requires
export const version = require('../../../package.json').version

export function getAssetFile(assetName: string): string {
  return path.join(__dirname, '../../assets', assetName)
}

// eslint-disable-next-line @typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars,@typescript-eslint/explicit-module-boundary-types
export const noop = () => {
}

export function isNotNullNorUndefined(o: unknown): boolean {
  return (typeof (o) !== 'undefined' && o !== null)
}

export function extractOwnerAndRepo(name: string): string[] {
  return name.split('/')
}

export const defaultOctokit = process.env.GH_TOKEN ? new Octokit({
  auth: process.env.GH_TOKEN,
  userAgent: `dxworks-cli ${version}`,
}) : new Octokit({
  userAgent: `dxworks-cli ${version}`,
})

export async function downloadFile(url: string, filename: string, payload?: any, progressBar?: SingleBar): Promise<string> {
  const file = fs.createWriteStream(filename, 'utf-8')
  let receivedBytes = 0

  return new Promise((resolve, reject) => {
    request.get(url)
      .on('response', (response) => {
        if (response.statusCode !== 200) {
          return reject('Response status was ' + response.statusCode)
        }
        const totalBytes = response.headers['content-length'] ? +response.headers['content-length'] : 0
        progressBar?.start(totalBytes, 0, payload)
      })
      .on('data', (chunk) => {
        receivedBytes += chunk.length
        progressBar?.update(receivedBytes, payload)
      })
      .pipe(file)
      .on('finish', () => {
        file.close()
        resolve(filename)
      })
      .on('error', (err) => {
        fs.unlinkSync(filename)
        progressBar?.stop()
        return reject(err)
      })
  })
}

/**
 * Format bytes as human-readable text.
 *
 * @param bytes Number of bytes.
 * @param si True to use metric (SI) units, aka powers of 1000. False to use
 *           binary (IEC), aka powers of 1024.
 * @param dp Number of decimal places to display.
 *
 * @return Formatted string.
 */
export function humanFileSize(bytes: number, si = false, dp = 1): string {
  const thresh = si ? 1000 : 1024

  if (Math.abs(bytes) < thresh) {
    return `${bytes} B`
  }

  const units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
  let u = -1
  const r = 10 ** dp

  do {
    bytes /= thresh
    ++u
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1)

  return bytes.toFixed(dp) + ' ' + units[u]
}

