const {Command, flags} = require('@oclif/command')
const download = require('download-git-repo')
const compile = require('../../util/compile')
const exists = require('fs').existsSync
const {cli} = require('cli-ux')
const chalk = require('chalk')
const fs = require('fs-extra')
const path = require('path')
const _ = require('lodash')

class CraftCommand extends Command {

	async run() {
        
        const {args} = this.parse(CraftCommand);
        const {flags} = this.parse(CraftCommand);

        const kitInfo = await this.resolveKit(args.kit).catch((e) => {
            this.error(e);
        });

        const loadedKit = await this.loadKit(kitInfo);
        const masonJson = this.parseCraftKit(loadedKit, flags.with);

        // Dockerfile
        const dockerfile = await compile.compileDockerfile(masonJson, flags['dockerfile']).catch((e) => {
            this.error(e);
        });
        await this.confirmAndWriteFile('Dockerfile', dockerfile)

        // docker-compose.yml
        const dockerCompose = await compile.compileDockerCompose(masonJson, flags['docker-compose']).catch((e) => {
            this.error(e);
        });
        await this.confirmAndWriteFile('docker-compose.yml', dockerCompose)
        
        // .gitlab-ci.yml
        const gitlabCi = await compile.compileGitLabCI(flags['gitlab-ci']).catch((e) => {
            this.error(e);
        });
        await this.confirmAndWriteFile('.gitlab-ci.yml', gitlabCi)

	}

    /**
     * Does all the heavy lifting for craft kits.
     * Detects if a kit is official, custom or local
     * craft kit and downloads the craft kits as required.
     */
    async resolveKit(kit) {

        if(exists(kit)) {
            
            return {
                type: 'local',
                path: kit,
            };

        } else {

            // No slash means use official 
            var isOfficial = (kit.indexOf('/') == -1)

            // Prepare the repo url to retrieve the craft kit from
            var repo = isOfficial ? 'codemasonhq/craft-kit-' + kit : kit;

            // Download the craft kit
            const path = await this.download(repo)

            return {
                type: isOfficial ? 'official' : 'custom',
                path: path,
            }

        }

    }

    /**
     * Download the craft kit from a git repo 
     */ 
    download(repo) {
        return new Promise(function(resolve, reject) {
            const tmpPath = '/tmp/codemason/craft-kit-' + Math.random().toString(35).substr(2, 7);

            try {
                download(repo, tmpPath, function (error) {
                    if(error) reject('Failed to download repo ' + repo + ': ' + error.message.trim())
                    resolve(tmpPath);
                });
            } catch(e) {
                throw ("Could not find craft kit")
            }
        });
    }
    
    /**
     * Load kit
     */
    loadKit(kitInfo) {
        try {
            return require(path.join(kitInfo.path, 'index.js'));
        } catch(e) {
            this.error("Could not load craft kit. It appears to be incorrectly formatted.")
        }
    }

    parseCraftKit(kit, withFlag) {

        // Get the list of services we're crafting with
        let craftWith = kit.default;
        
        if(!_.isEmpty(withFlag)) {
            craftWith = withFlag;
        }

        // Convert a --with string to an array
        if(typeof craftWith == "string") {
            craftWith = _.map(craftWith.split(","), _.trim);
        }

        // Pull out the Mason JSON 
        const serviceList = _.pick(kit.masonJson, craftWith);

        // Warn the user if they've attempted to use an unsupported service
        if(craftWith.length != _.size(serviceList)) {
            this.warn("Attempted to use an unsupported service - ignored.")
        }

        // Prepare Mason JSON (https://codemason.io/docs/mason-json)
        let masonJson = {
            name: "",
            description: "",
            masonVersion: "v1",
            services: _.filter(serviceList, ['type', 'service']),
        };

        // Send a warning if more than one service needs to be built
        if(_.filter(masonJson.services, 'base').length > 1) {
            // todo: add prompt to get them to choose(?)
            this.warn("More than one service is needing to be built. Manual intervention may be required." 
                            + "\n\t\t > The craft command is not designed to handle more than one service needing to be built. ");

        }

        // Tell the user
        this.log(`Crafting ${chalk.green(kit.name)} application with ${chalk.green(craftWith.join(", "))}`);

        return masonJson;
    }

    /**
     * Prompt for overwrite confirmation if required 
     * and write the generated file to user disk
     */
    async confirmAndWriteFile(filename, contents) {
        let writeFile = true;

        if(exists(filename)) { // Confirm should overwrite
            const overwrite = await cli.prompt(`Overwite existing ${filename} file? [yes/no]`, {default: 'no'})
            switch(overwrite) {
                case "yes":
                case "y":
                    writeFile = true;
                break;

                case "no":
                case "n":
                    writeFile = false;
                break;
            }
        }

        if(writeFile) {
            this.writeFile(filename, contents);
        }
    }

    /**
     * Write file to file system
     */
    writeFile(filename, contents) {
        try {
            fs.writeFileSync(filename, contents, { encoding: 'utf8' });
            this.log(chalk.grey(`... Wrote ${ filename }`));
        } catch(e) {
            this.error(`Could not write ${ filename }: (${ e.message || e.toString() })`);
        }
    }
}

CraftCommand.args = [
    {
        name: 'kit',
        required: true,
        description: 'craft kit to use'
    },
]

CraftCommand.flags = {
    with: flags.string({
        char: 'w', 
        description: 'specify services to craft your app with',
    }),
    dockerfile: flags.string({
        description: 'dockerfile template path',
    }),
    'docker-compose': flags.string({
        description: 'docker-compose.yml template path',
    }),
    'gitlab-ci': flags.string({
        description: '.gitlab-ci.yml template path',
    }),
}

CraftCommand.description = 'docker powered dev environments that just work'

module.exports = CraftCommand
