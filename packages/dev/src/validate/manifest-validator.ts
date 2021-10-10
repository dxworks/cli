import {Manifest, VoyagerVersion} from '../manifest/manifest'
import {ValidationResult} from '../model/validation'
import * as git from 'isomorphic-git'
import fs from 'fs'
import didYouMean from 'didyoumean'
import {coerce, rcompare, valid} from 'semver'
import slug from 'slug'
import spdxCorrect from 'spdx-correct'
import {defaultOctokit, extractOwnerAndRepo, log} from '@org.dxworks/cli-common'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const licenseIds = require('spdx-license-ids/')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const deprecatedLicenseIds = require('spdx-license-ids/deprecated.json')

export class ManifestValidator {

  public async validate(obj: Manifest): Promise<ValidationResult> {
    const finalRes: ValidationResult = [
      this.validateNameAndSlug(obj),
      this.validateDescription(obj),
      this.validateLicense(obj),

      this.validateCode(obj),
      this.validateDocs(obj),
      this.validateIssues(obj),
      this.validateSite(obj),
      this.validateLogo(obj),

      this.validateTechnologies(obj),
      this.validateTags(obj),
      this.validateAuthors(obj),
      ...await this.validateVoyager(obj),
    ].reduce(ManifestValidator.mergeValidationResults)

    if (!obj.voyager && !obj.scriptbee && !obj.symphony) {
      finalRes.warnings.push('Project does not declare any version of voyager, symphony or scriptbee!')
    }

    return finalRes
  }

  private async validateVoyager(obj: Manifest) {
    if (obj.voyager?.versions) {
      return await Promise.all(obj.voyager.versions.map(it => this.validateVoyagerVersion(it)))
    }
    return []
  }

  private static mergeValidationResults(prev: ValidationResult, current: ValidationResult) {
    return {
      suggestions: [...prev.suggestions, ...current.suggestions],
      warnings: [...prev.warnings, ...current.warnings],
      errors: [...prev.errors, ...current.errors],
    }
  }

  async validateVoyagerRepository(voyagerVersion: VoyagerVersion): Promise<ValidationResult> {
    const res: ValidationResult = {suggestions: [], warnings: [], errors: []}

    if (!voyagerVersion.name) {
      res.errors.push(`Name field missing for ${voyagerVersion}. Please add the name field! It should be the name of a Github repository in the form owner/repo`)
      await this.suggestNameForVoyagerVersion(res, voyagerVersion)
    } else {
      log.debug(`Validating repo name: ${voyagerVersion.name}`)
      const [owner, repo] = extractOwnerAndRepo(voyagerVersion.name)
      try {
        await defaultOctokit.rest.repos.get({
          owner,
          repo,
        })
        await this.validateVoyagerVersionTag(res, voyagerVersion)
      } catch (e: any) {
        res.errors.push(`Repository ${voyagerVersion.name} not found for ${voyagerVersion.version}`)
        await this.suggestNameForVoyagerVersion(res, voyagerVersion)
      }
    }
    return res
  }

  private async suggestNameForVoyagerVersion(res: ValidationResult, voyagerVersion: VoyagerVersion) {
    const remotes = await git.listRemotes({fs, dir: process.cwd()})
    const suggestedRepos = remotes.sort(ManifestValidator.originFirst).filter(it => it.url.includes('github')).map(it => ManifestValidator.getRepoAndOwnerFromRemoteUrl(it.url))
    const noneOfTheAbove = 'None of the above'
    const questions = []
    if (suggestedRepos.length > 1) {
      questions.push({
        name: 'chosenName',
        type: 'list',
        choices: [...suggestedRepos, noneOfTheAbove],
        default: suggestedRepos[0],
      }, {
        name: 'name',
        type: 'input',
        when(answers: any) {
          return answers.chosenName === noneOfTheAbove
        },
      })
    } else {
      questions.push({
        name: 'name',
        type: 'input',
        default: suggestedRepos ? suggestedRepos[0] : undefined,
      })
    }
    res.suggestions.push({
      text: `Enter a name for your version ${voyagerVersion.version} in form repo/owner`,
      fix: {
        questions: questions,
        action: answers => {
          voyagerVersion.name = answers.chosenName !== noneOfTheAbove ? answers.chosenName : answers.name
        },
      },
      mandatory: true,
    })
  }

  private static getRepoAndOwnerFromRemoteUrl(url: string | undefined): string | undefined {
    return url?.removeSuffix('.git')
      .removePrefix('https://github.com/')
      .removePrefix('git@github.com:')
  }

  async validateVoyagerVersionTag(res: ValidationResult, voyagerVersion: VoyagerVersion): Promise<void> {
    const tag = voyagerVersion.tag
    const [owner, repo] = extractOwnerAndRepo(voyagerVersion.name)
    const releases = (await defaultOctokit.rest.repos.listReleases({
      owner,
      repo,
      tag,
    })).data
    const allReleasedTags = releases.map(it => it.tag_name).sort(this.sortVoyagerTags)
    if (!tag) {
      res.errors.push(`Tag field missing for ${voyagerVersion}. Please add the tag field! It should be the git tag name of the version`)
      this.suggestAddingTag(res, voyagerVersion, allReleasedTags)
    } else {
      log.debug(`Validating repo tag: ${tag}`)
      const release = releases.find(rel => rel.tag_name === tag)
      log.debug(`Release ${release} found for tag`)
      if (!release) {
        res.errors.push(`No Release found for tag ${tag} in repository ${voyagerVersion.name} for version ${voyagerVersion.version}`)
        this.suggestAddingTag(res, voyagerVersion, allReleasedTags)
      } else {
        const asset = voyagerVersion.asset
        if (asset) {
          log.debug(`Validating repo asset: ${tag}`)
          const releaseAssetNames = release.assets.map(it => it.name)
          if (!releaseAssetNames.includes(asset)) {
            const suggestion = didYouMean(asset, releaseAssetNames)
            if (suggestion) {
              res.errors.push(`No asset ${asset} found for tag ${tag} in repository ${voyagerVersion.name} for version ${voyagerVersion.version}. Did you mean ${suggestion}?`)
            }
          }
        }
      }
    }
  }

  private suggestAddingTag(res: ValidationResult, voyagerVersion: VoyagerVersion, allReleasedTags: string[]) {
    const versionString = typeof voyagerVersion.version === 'string' ? voyagerVersion.version : voyagerVersion.version.raw
    const questionName = `tag@${versionString.replaceAll('.', '_')}`
    res.suggestions.push({
      text: `Choose an existing tag from ${voyagerVersion.name} for version ${voyagerVersion.version}`,
      fix: {
        questions: [
          {
            name: questionName,
            type: 'search-list',
            choices: allReleasedTags,
          },
        ],
        action: answers => {
          voyagerVersion.tag = answers[questionName]
        },
      },
      mandatory: true,
    })
  }

  sortVoyagerTags(tag1: string, tag2: string): 1 | 0 | -1 {
    const tag1IsVoyager = tag1.endsWith('-voyager')
    const tag2IsVoyager = tag2.endsWith('-voyager')
    if (tag1IsVoyager && !tag2IsVoyager) return -1
    if (!tag2IsVoyager && tag2IsVoyager) return 1
    const semver1 = valid(tag1)
    const semver2 = valid(tag2)
    if (semver1 && !semver2) return -1
    if (!semver1 && semver2) return 1
    if (semver1 && semver2) return rcompare(semver1, semver2)
    return 0
  }

  async validateVoyagerVersion(voyagerVersion: VoyagerVersion): Promise<ValidationResult> {
    return [
      this.validateVersion(voyagerVersion),
      await this.validateVoyagerRepository(voyagerVersion),
    ].reduce(ManifestValidator.mergeValidationResults)
  }

  validateVersion(voyagerVersion: VoyagerVersion): ValidationResult {
    const res: ValidationResult = {suggestions: [], warnings: [], errors: []}

    if (!voyagerVersion.version) {
      res.errors.push(`Version field missing for ${voyagerVersion}. Please add the version field! It should be a semantic version string`)
    } else if (!valid(voyagerVersion.version)) {
      const coercedSemver = coerce(voyagerVersion.version)
      if (!coercedSemver)
        res.errors.push(`Voyager version ${voyagerVersion.version} is not a semantic version`)
      else
        res.errors.push(`Voyager version ${voyagerVersion.version} is not a semantic version. Did you mean ${coercedSemver.raw}`)
    }
    return res
  }

  validateAuthors(obj: Manifest): ValidationResult {
    const res: ValidationResult = {suggestions: [], warnings: [], errors: []}

    if (!obj.authors) {
      res.warnings.push('Project authors missing')
      res.suggestions.push({
        text: 'Add the authors of the project',
        examples: [
          'authors:\n' +
          '  - John Doe # simple author name\n' +
          '  - name: Jane Smith # author object with details\n' +
          '    email: jane@smith.com\n' +
          '    social:\n' +
          '      twitter: "@janesmith"\n' +
          '      facebook: Jane Smith',
        ],
      })
    }
    return res
  }

  validateTags(obj: Manifest): ValidationResult {
    const res: ValidationResult = {suggestions: [], warnings: [], errors: []}

    if (!obj.tags) {
      res.warnings.push('Project tag missing')
      res.suggestions.push({
        text: 'Add some tags to the project. Tags, like Github Topics, are key words / constructs that identify with your project. Tags have slug format.',
        examples: [
          'tags:\n' +
          '  - software-analysis\n' +
          '  - data-extraction\n' +
          '  - code-analysis\n',
        ],
      })
    }
    return res
  }

  validateTechnologies(obj: Manifest): ValidationResult {
    const res: ValidationResult = {suggestions: [], warnings: [], errors: []}

    if (!obj.technologies) {
      res.warnings.push('Project technologies missing')
      res.suggestions.push({
        text: 'Add used technologies to project. Technologies refer to programming languages, build tools, frameworks, etc.',
        examples: [
          'technologies:\n' +
          '  - Kotlin\n' +
          '  - Maven\n' +
          '  - Docker\n',
        ],
      })
    }
    return res
  }

  validateLogo(obj: Manifest): ValidationResult {
    const res: ValidationResult = {suggestions: [], warnings: [], errors: []}

    if (!obj.logo) {
      res.warnings.push('Project logo missing')
      res.suggestions.push({
        text: 'Add a logo to your project',
        examples: [
          'logo: https://raw.githubusercontent.com/dxworks/dxworks-site/main/src/assets/dxworks.png # just one logo option',
          'logo: # add multiple logo options to use on light and dark themes\n' +
          '  default: https://raw.githubusercontent.com/dxworks/dxworks-site/main/src/assets/dxworks.png\n' +
          '  light: https://raw.githubusercontent.com/dxworks/dxworks-site/main/src/assets/dxworks.png\n' +
          '  dark: https://raw.githubusercontent.com/dxworks/dxworks-site/main/src/assets/dxworks-white-full.png\n' +
          '  thumbnail_light: https://raw.githubusercontent.com/dxworks/dxworks-site/main/src/assets/dxworks-square.png\n' +
          '  thumbnail_dark: https://raw.githubusercontent.com/dxworks/dxworks-site/main/src/assets/dxworks-white-square-full.png\n' +
          '  icon_light: https://raw.githubusercontent.com/dxworks/dxworks-site/main/src/assets/dxworks-imgonly.png\n' +
          '  icon_dark: https://raw.githubusercontent.com/dxworks/dxworks-site/main/src/assets/dxworks-white-imgonly.png',
        ],
      })
    }
    return res
  }

  validateIssues(obj: Manifest): ValidationResult {
    const res: ValidationResult = {suggestions: [], warnings: [], errors: []}

    if (!obj.issues) {
      res.warnings.push('Project issues missing')
      res.suggestions.push({
        text: 'Add the links to your project issue tracking system',
        examples: [
          'issues: https://github.com/dxworks/project/issues',
          'issues:' +
          '\n  - https://github.com/dxworks/project/issues' +
          '\n  - https://dxworks.atlassian.net/PROJECT',
        ],
      })
    }
    return res
  }

  validateSite(obj: Manifest): ValidationResult {
    const res: ValidationResult = {suggestions: [], warnings: [], errors: []}

    if (!obj.homepage) {
      res.warnings.push('Project homepage is missing')
      res.suggestions.push({
        text: 'Add the link to your project homepage',
        examples: ['homepage: https://project.dxworks.org'],
      })
    }
    return res
  }

  validateDocs(obj: Manifest): ValidationResult {
    const res: ValidationResult = {suggestions: [], warnings: [], errors: []}

    if (!obj.code) {
      res.warnings.push('Project documentation missing')
      res.suggestions.push({
        text: 'Add the links to your project documentation',
        examples: [
          'docs: https://dxworks.github.io/project',
          'docs:' +
          '\n  - https://dxworks.org/project' +
          '\n  - https://github.com/dxworks/project/tree/main/README.md' +
          '\n  - https://readthedocs.io/dxworks/project',
        ],
      })
    }
    return res
  }

  validateCode(obj: Manifest): ValidationResult {
    const res: ValidationResult = {suggestions: [], warnings: [], errors: []}

    if (!obj.code) {
      res.warnings.push('Code repository missing')
      res.suggestions.push({
        text: 'Add the links to your repositories where your project lives',
        examples: [
          'code: https://github.com/dxworks/project',
          'code:' +
          '\n  - https://github.com/dxworks/project' +
          '\n  - https://github.com/dxworks/project-scriptbee',
        ],
      })
    }
    return res
  }


  validateDescription(obj: Manifest): ValidationResult {
    const res: ValidationResult = {suggestions: [], warnings: [], errors: []}

    if (!obj.description) {
      res.warnings.push('Description is missing')
      res.suggestions.push('Add a description')
    }
    return res
  }

  validateNameAndSlug(obj: Manifest): ValidationResult {
    const res: ValidationResult = {suggestions: [], warnings: [], errors: []}

    const convertedSlug = slug(obj.slug)
    if (obj.slug !== convertedSlug) {
      res.errors.push(`Slug ${obj.slug} not acceptable. We suggest renaming it to ${convertedSlug}.`)
    }
    if (!obj.name) {
      res.warnings.push(`Name is missing. Will default to slug: ${convertedSlug}`)
      res.suggestions.push('Add the full name of the tool')
    }
    return res
  }

  validateLicense(obj: Manifest): ValidationResult {
    const res: ValidationResult = {suggestions: [], warnings: [], errors: []}

    if (!obj.license)
      res.warnings.push('License is missing')
    else {
      if (deprecatedLicenseIds.includes(obj.license))
        res.warnings.push(`License ${obj.license} is deprecated. Please update to one of the SPDX accepted licenses (https://spdx.org/licenses/)`)
      if (!licenseIds.includes(obj.license)) {
        const correctedLicense = spdxCorrect(obj.license)
        if (correctedLicense)
          res.warnings.push(`License ${obj.license} is not a valid SPDX License Identifier (https://spdx.org/licenses/). Please rename to ${correctedLicense}`)
        else
          res.warnings.push(`License ${obj.license} is not a valid SPDX License Identifier (https://spdx.org/licenses/). Please choose a license from this list`)
      }
    }
    return res
  }

  private static originFirst(remote1: Remote, remote2: Remote): number {
    return remote1.remote === 'origin' ? 1 : remote2.remote === 'origin' ? -1 : 0
  }
}

interface Remote {
  remote: string
  url: string
}
