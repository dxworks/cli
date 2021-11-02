import {versionsFor} from '../src/npm'

describe('npm info wrapper', () => {
  it('should return all versions of the npm package (huge)', () => {
    const npmVersions = versionsFor('yarn')
    console.log(npmVersions.length)
    expect(npmVersions.length).toBeGreaterThan(50)
  })
})
