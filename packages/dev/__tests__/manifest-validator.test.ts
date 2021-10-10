import {ManifestValidator} from '../src/validate/manifest-validator'

const tags = [
  'v1.5.1', 'sometag', 'v1.5.1-voyager',
  'v1.5.0', 'v1.5.0-voyager',
  'v1.4.1', 'v1.4.1-voyager',
  'v1.4.0', 'v1.4.0-voyager',
  'v1.3.0', 'v1.3.0-voyager',
  'v1.2.1', 'v1.2.1-voyager',
  'v1.2.0', 'v1.2.0-voyager',
  'v1.1.0', 'full tag', 'v1.1.0-voyager',
  'v1.0.0', 'v0.1.2',
  'v0.1.2-voyager', 'v0.1.1',
  'v0.1.0', 'v0.1.0-voyager',
  'v0.0.0', 'last-tag',
]
const correctlySortedTags = [
  'v1.5.1-voyager',
  'v1.5.0-voyager',
  'v1.4.1-voyager',
  'v1.4.0-voyager',
  'v1.3.0-voyager',
  'v1.2.1-voyager',
  'v1.2.0-voyager',
  'v1.1.0-voyager',
  'v0.1.2-voyager',
  'v0.1.0-voyager',
  'v1.5.1',
  'v1.5.0',
  'v1.4.1',
  'v1.4.0',
  'v1.3.0',
  'v1.2.1',
  'v1.2.0',
  'v1.1.0',
  'v1.0.0',
  'v0.1.2',
  'v0.1.1',
  'v0.1.0',
  'v0.0.0',
  'sometag',
  'full tag',
  'last-tag',
]


describe('sorting tag suggestions for repo', () => {
  it('should put voyager suffixed versions on top', () => {
    const validator = new ManifestValidator()

    const sortedTags = tags.sort(validator.sortVoyagerTags)

    expect(sortedTags).toEqual(correctlySortedTags)
  })
})
