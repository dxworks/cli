import {platform} from 'os'

export const OS = {
    WINDOWS: 'windows',
    LINUX: 'linux',
    MAC: 'mac',
    UNKNOWN: 'unknown',
}

export const osType = getOsType()

function getOsType() {
    switch (platform()) {
        case 'darwin':
            return OS.MAC
        case 'win32':
            return OS.WINDOWS
        case 'linux':
            return OS.LINUX
        default:
            return OS.UNKNOWN
    }
}


