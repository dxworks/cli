export class InstrumentConfig {
  public name = ''
  public tag = 'latest'
  public asset: string | undefined
  public token: string | undefined
}

export class RuntimeConfig {
  public version: string | undefined
  public platform: 'windows' | 'mac' | 'linux' | 'unknown' = 'unknown'
  public arch: string | undefined
  public distribution: string | undefined
  public type: string | undefined
}

export interface Voyenv {
  name: string
  voyager_version: string
  instruments: InstrumentConfig[]
  runtimes: Map<string, RuntimeConfig>
  token: string
}
