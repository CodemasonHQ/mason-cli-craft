const {expect, test} = require('@oclif/test')
const fs = require('fs-extra')

describe('craft', () => {
  test
  .do(() => {
    fs.ensureDirSync('/tmp/codemason/testing-craft-kit')

    var masonJson = {
      name: 'php',
      default: ['php'],
      masonJson: {
        php: {
          name: 'web',
          build: '.',
          base: 'codemasonhq/php',
          type: 'service',
          volumes: {
            './': '/app',
          },
          ports: [
            '80:80',
            '443:443',
          ],
        },
        mariadb: {
          name: 'mariadb',
          image: 'mariadb',
          type: 'service',
          volumes: {
            './storage/data/mysql': '/var/lib/mysql',
          },
          ports: ['3306:3306'],
          environment: {
            MYSQL_DATABASE: 'demo',
            MYSQL_USER: 'demo',
            MYSQL_PASSWORD: 'secret',
            MYSQL_ROOT_PASSWORD: 'root',
          },
        },
      },
    }

    fs.writeFileSync('/tmp/codemason/testing-craft-kit/index.js', 'module.exports = ' + JSON.stringify(masonJson))
  })
  .stub(fs, 'writeFileSync', () => {})
  .stdout()
  .stderr()
  .command(['craft', '/tmp/codemason/testing-craft-kit', '--with', 'php,mariadb'])
  .do(() => {
    fs.removeSync('/tmp/codemason/testing-craft-kit')
  })
  .it('craft with php', ctx => {
    expect(ctx.stdout).to.contain('Crafting php application with php, mariadb\n')
    expect(ctx.stdout).to.contain('... Wrote Dockerfile\n')
    expect(ctx.stdout).to.contain('... Wrote docker-compose.yml\n')
    expect(ctx.stdout).to.contain('... Wrote .gitlab-ci.yml\n')
  })
})
