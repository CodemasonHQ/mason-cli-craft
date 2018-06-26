const Handlebars = require('handlebars');
const fs = require('fs-extra')
const path = require('path')
const _ = require('lodash')

/**
 * Compile `Dockerfile` and add to app source
 */ 
exports.compileDockerfile = async function(masonJson, templateFile) {

    // Get Dockerfile template
    const source = this.getTemplateFile(templateFile || path.resolve(__dirname, '../../templates/Dockerfile'));

    // Prep the handlebars template
    const template = Handlebars.compile(source);

    // Context data to evaluate Handlebars template with 
    context = _.get(_.filter(masonJson.services, 'base'), 0, { base: 'ubuntu'});

    // Compile
    return template(context);

}

/**
 * Compile `docker-compose.yml` and add to app source
 */
exports.compileDockerCompose = async function(masonJson, templateFile) {

    // Get Dockerfile template
    const source = this.getTemplateFile(templateFile || path.resolve(__dirname, '../../templates/docker-compose.yml'));

    // Prep the handlebars template
    const template = Handlebars.compile(source);

    // Replacement data for handlebars
    context = masonJson;

    // Compile
    return template(context);

}

/**
 * Compile `.gitlab-ci.yml` and add to app source.
 */
 exports.compileGitLabCI = async function(templateFile) {
    return this.getTemplateFile(templateFile || path.resolve(__dirname, '../../templates/.gitlab-ci.yml'));
 }

 /**
 * Grab template file 
 */
const getTemplateFile = exports.getTemplateFile = function(templateFile) {
    try {
        return fs.readFileSync(templateFile, 'utf8');
    } catch (error) {
        throw error.message || error.toString();
    }
}