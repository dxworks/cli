import {Command} from 'commander'
import {npm} from '../../npm'

export const pluginOutdated = new Command()
    .name('outdated')
    .description('lists outdated dxworks cli plugins')
    .action(outdatedPlugins)

async function outdatedPlugins() {
    npm.outdated()
}
