export interface InstrumentConfig {
    name: string
    tag: string
    asset: string
    token: string
}

export interface RuntimeConfig {
    version: string
    platform: 'windows' | 'mac' | 'linux' | 'unknown'
    arch: string
    distribution: string
    type: string
}

export interface Voyenv {
    name: string
    voyager_version: string
    instruments: InstrumentConfig[]
    runtimes: Map<string, RuntimeConfig>
    token: string
}
