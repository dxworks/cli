import {chooseAssetFile} from '../src/commands/init'

describe('asset files choosing', () => {
  it('should pick simple voyenv template', () => {
    expect(chooseAssetFile({allRuntimes: false, allInstruments: false})).toEqual('simple-voyenv.yml')
  })
})
