import {humanFileSize} from '../src'

describe('human readable byte size', () => {
  it('should return 1.1MB', () => {
    expect(humanFileSize(1024*1024, false, 0)).toEqual('1 MiB')
  })
})
