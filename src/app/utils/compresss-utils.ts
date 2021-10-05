import fs from 'fs'
import * as unzipper from 'unzipper'
import path from 'path'

export async function unzip(zipFileName: string, options?: { path: string, overwriteRootDir?: string }): Promise<void> {
  return new Promise((resolve, reject) => {
    if (options?.overwriteRootDir) {
      fs.createReadStream(zipFileName)
        .pipe(unzipper.Parse())
        .on('entry', function (entry) {
          const fullPathName = path.resolve(options.path, entry.path.replaceBefore('/', options.overwriteRootDir))
          if (entry.type == 'Directory') {
            if (!fs.existsSync(fullPathName))
              fs.mkdirSync(fullPathName, {recursive: true})
          } else
            entry.pipe(fs.createWriteStream(fullPathName))
        })
        .on('finish', () => {
          resolve()
        })
        .on('error', reject)
    } else {
      fs.createReadStream(zipFileName)
        .pipe(unzipper.Extract(options))
        .on('finish', () => {
          resolve()
        })
        .on('error', reject)
    }
  })
}
