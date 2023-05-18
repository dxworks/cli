import {Command} from 'commander'
import {Manifest} from '../manifest/manifest'
import fs from 'fs'
import YAML from 'yaml'
import chalk from 'chalk'
import {ManifestValidator} from '../validate/manifest-validator'
import inquirer, {Question} from 'inquirer'
import {Suggestion} from '../model/validation'
import {defaultManifestFileName} from '../constants'
import {log} from '@dxworks/cli-common'
// eslint-disable-next-line @typescript-eslint/no-var-requires
inquirer.registerPrompt('search-list', require('inquirer-search-list'))

export const devValidate = new Command()
    .name('validate')
    .description('Will download and install a voyager release as well as its instruments and runtimes as specified in the configuration file')
    .option('-s --suggestions --show-suggestions', 'Whether to show suggestions', true)
    .option('-f --fix', 'Whether to show interactive suggestions to fix all mandatory errors and optionally warnings', false)
    .option('--fix-all', 'Whether to show interactive suggestions to fix all errors and warnings', false)
    .option('-e --examples --show-examples', 'Whether to show suggestions', false)
    .argument('[manifestFile]', 'The manifest file to validate.', defaultManifestFileName)
    .action(validate)

async function validate(manifestFile: string, options: any) {
    const manifestString = fs.readFileSync(manifestFile, 'utf-8')

    const validator = new ManifestValidator()
    const manifest = YAML.parse(manifestString) as Manifest
    const {warnings, errors, suggestions} = await validator.validate(manifest)
    log.info(`Found ${chalk.yellow(warnings.length + ' warnings')} and ${chalk.red(errors.length + ' errors')}`)

    errors.map((message, it) => `error ${it + 1}: ${message}`).forEach(log.error)
    warnings.map((message, it) => `warn ${it + 1}: ${message}`).forEach(log.warn)

    if (options.fix || options.fixAll) {
        await fixSuggestions(suggestions, manifest, options.fixAll)

    } else if (options.suggestions) {
        printSuggestions(suggestions, options)
    }
}

async function fixSuggestions(suggestions: Array<string | Suggestion>, manifest: Manifest, fixAll: boolean) {
    const interactiveSuggestions = suggestions
        .filter(it => typeof it !== 'string' && it.fix)
        .map(it => it as Suggestion)
        .filter(it => fixAll || it.mandatory)

    log.debug(`Fixing ${interactiveSuggestions.length} suggestions`)

    if (interactiveSuggestions.length) {
        const questions = interactiveSuggestions.flatMap(toInquirerQuestion)
        log.debug(`Will have to answer answer ${questions.length} questions`)
        const answers = await inquirer.prompt(questions)
        interactiveSuggestions.forEach(s => s.fix?.action(answers))
        await fixSuggestions((await new ManifestValidator().validate(manifest)).suggestions, manifest, fixAll)
    }
}

function toInquirerQuestion(s: Suggestion): Question[] {
    return s.fix?.questions.map((q: Question) => {
        return {
            message: s.text,
            ...q,
        }
    }) || []

}

function printSuggestions(suggestions: Array<string | Suggestion>, options: any) {
    log.info('\nIn order to improve the manifest of your project, take into consideration the following suggestions:')
    suggestions.forEach(suggestion => {
        if (typeof suggestion === 'string') {
            log.info(`  [ ] ${suggestion}`)
        } else {
            const examplesString = (options.examples && suggestion.examples) ? `\n      Examples:\n${suggestion.examples.map(it => `        * ${it.replaceAll('\n', '\n        ')}`).join('\n')}\n` : ''
            log.info(`  [ ] ${suggestion.text}${examplesString}`)
        }
    })
}


