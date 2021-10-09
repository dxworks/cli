import {SemVer} from 'semver'


export interface Manifest {
  slug: string
  name: string
  description: string
  license: string
  logo: string | LogoUrls
  code: string | string[]
  issues: string | string[]
  docs: string | string[]
  homepage: string
  technologies: string[]
  tags: string[]
  authors: (string | Author)[]
  voyager: VoyagerManifest
  symphony: SymphonyManifest
  scriptbee: VoyagerManifest
}

export interface Author {
  name: string
  email: string
  social: any
}

export interface VoyagerVersion {
  version: string | SemVer
  name: string
  owner: string
  repo: string
  tag: string
  asset: string
  instrument: string
}

export interface VoyagerManifest {
  versions: VoyagerVersion[]
}

export interface SymphonyVersion {
  version: string | SemVer
  name: string
  compose: string
}

export interface SymphonyManifest {
  versions: SymphonyVersion[]
}

export interface ScriptbeeVersion {
  version: string | SemVer
  name: string
  code: string
  requires: { voyager?: string, symphony?: string }
}

export interface ScriptbeeManifest {
  versions: ScriptbeeVersion[]
}

export interface LogoUrls {
  default: string
  light: string
  dark: string
  thumbnail_light: string
  thumbnail_dark: string
  icon_light: string
  icon_dark: string
}

