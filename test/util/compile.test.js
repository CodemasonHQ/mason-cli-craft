const {expect, test} = require('@oclif/test')
const compile = require('../../src/util/compile')

describe('compile', () => {
  test
  .do(async () => {
    var masonJson = {
      services: [
        {
          name: 'web',
          build: '.',
          base: 'codemasonhq/php',
        },
      ],
    }

    const context = await compile.compileDockerfile(masonJson)
    expect(context).to.contain('FROM codemasonhq/php')
  })
  .it('compiles dockerfile correctly')

  test
  .do(async () => {
    var masonJson = {
      services: [
        {
          name: 'web',
          build: '.',
          base: 'codemasonhq/php',
        },
      ],
    }

    const context = await compile.compileDockerCompose(masonJson)
    expect(context).to.contain('services:\n  web:\n    build: .\n')
  })
  .it('compiles docker-compose.yml correctly')

  test
  .do(async () => {
    const context = await compile.compileGitLabCI()
    expect(context).to.contain('stages: \n  - build')
  })
  .it('compiles .gitlab-ci.yml correctly')
})
