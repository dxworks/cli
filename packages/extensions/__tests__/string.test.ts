import '../src/index.ts'

const initial = 'someString/someOtherString'

describe('String class', () => {
  describe('replacBefore', () => {
    it('should replace before /', () => {
      expect(initial.replaceBefore('/', 'nothing')).toEqual('nothing/someOtherString')
    })
  })
})
