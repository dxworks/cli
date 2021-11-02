import {npm} from '../dist/npm'

describe('npm info wrapper', () => {
  it('should return all versions of the npm package (huge)', () => {
    const npmVersions = npm.versionsFor('npm')
    console.log(npmVersions.length)
    expect(npmVersions.length).toBeGreaterThan(50)
  })
})
