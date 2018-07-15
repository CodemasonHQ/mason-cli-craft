Mason CLI Plugin for Craft Kits
===============

[![Version](https://img.shields.io/npm/v/mason-cli-craft.svg)](https://npmjs.org/package/mason-cli-craft)
[![Downloads/week](https://img.shields.io/npm/dw/mason-cli-craft.svg)](https://npmjs.org/package/mason-cli-craft)

The craft plugin for Mason CLI makes getting started with Docker a breeze - it's like buildpacks for Docker.

Whether you're new to Docker or a pro, you'll love how Craft Kits just work straight out of the box.


## Installation
The craft plugin comes installed by default with the Mason CLI.
```
npm install --global codemason
```
Prerequisites: [Git](https://git-scm.com/downloads), [Docker](https://docs.docker.com/engine/installation/)

## Quick Start
A quick example of using a craft kit for a Laravel project: 

- Create a new Laravel project  `laravel new pebble`
- Change into your new directory `cd pebble/` 
- Dockerize Laravel with `mason craft laravel`
- Spin up your environment `docker-compose up`

**That's all!** You're now running your Laravel application with Docker!

You'll be able to access your application at `http://<docker-ip>`, where `<docker-ip>` is the boot2docker ip or localhost if you are running Docker natively.


## Usage
Using the `craft` command, you can easily turn any app into a Docker app. 

```
$ mason craft <craft-kit>
```

For example
```
$ mason craft laravel
```

The above command pulls the craft kit from [codemasonhq/craft-kit-laravel](https://github.com/CodemasonHQ/craft-kit-laravel) and generates a `Dockerfile` and `docker-compose.yml` file for you based on what's defined in the craft kit. The generated files will be added to the current working directory.

Or if you want to get a little bit more specific, you can specify exactly what containers from the craft kit you want to use.
```
$ mason craft laravel --with="php, postgres"
```

## Craft Kits
Craft kits are a super flexible and portable way to define Docker environments. They are an excellent way to ease into building Docker powered apps without having to learn the ins and outs of Docker.

Official craft kits provide an opinionated starting point for Dockerizing your apps. We've carefully selected and specifically created Docker images that play together nicely so you can Dockerize your apps with a single command.

You can find all the official craft kits within the [CodemasonHQ organisation](https://github.com/codemasonhq) with the prefix `craft-kit-`. We aim to support as many popular frameworks, architectures and languages as possible.

Officially supported craft kits: 
- [Laravel](https://github.com/codemasonhq/craft-kit-laravel) 
- [Wordpress](https://github.com/codemasonhq/craft-kit-wordpress) *(beta)*
- [Rails](https://github.com/codemasonhq/craft-kit-laravel) *(beta)*

Community contributed craft kits: 
- PRs welcome


## Custom Craft Kits
While we recommend the official craft kits for simplicity and compatibility with what we have planned, custom craft kits give you an added level of flexibility. Anyone can create a craft kit and use it with: 
```
$ mason craft username/repo
```
Where `username/repo` is the short hand for the repository to retrieve. 
- GitHub - `github:username/repo` or simply `username/repo`
- GitLab - `gitlab:username/repo`
- BitBucket - `bitbucket:username/repo`

By default it will use the `master` branch, but you can specify a branch or a tag like so `username/repo#branch`. You may also use the `--clone` flag so your SSH keys are used (allowing you to access your private repositories).

## Local Craft Kits
You may also use a local craft kit.
```
$ mason craft ~/path/to/my/craft-kit
```

## Creating a Craft Kit
Craft kits are light weight javascript applications. They require one `index.js` file as an entry point which exposes the craft kit to the CLI. Beyond that, you can structure it however you see fit.

A nice example is the [laravel craft kit](https://github.com/CodemasonHQ/craft-kit-laravel).

### index.js
| Property | Description                                                                       |
| -------- | --------------------------------------------------------------------------------- |
| name     | *[string]* Simple name for your craft kit                                         |
| default  | *[array]* Default containers for craft kit to use                                 | 
| masonJson | *[object]* [Mason JSON](https://codemason.io/docs/mason-json) for available containers |

Example
```javascript
module.exports = {
  name: 'laravel',
  default: ["php", "mysql"],
  masonJson: {
    php: require('./mason-json/php.js'),
    mysql: require('./mason-json/mysql.js')
  },
}
```

### Mason JSON 
Define the available containers using [Mason JSON](https://codemason.io/docs/mason-json). Mason JSON is a JSON schema that is deliberately modelled of the `docker-compose.yml` file. It makes it a little bit easier to deal with all the Docker configuration options and adds a little bit of extra functionality. 

**mason-json/php.js**
```javascript
module.exports = {
    name: 'php', 
    image: 'codemasonhq/php',
    type: 'instance',
    volumes: {
        './':'/app',
    },
    ports: [
        "80:80",
        "443:443"
    ],
}
```

**mason-json/mysql.js**
```javascript
module.exports = {
    name: 'mysql',
    image: 'mysql',
    type: 'service',
    volumes: {
        '/var/lib/mysql':'/var/lib/mysql'
    },
    ports: ["3306:3306"],
    environment: {
        'MYSQL_DATABASE': 'demo',
          'MYSQL_USER': 'demo',
          'MYSQL_PASSWORD': 'secret',
          'MYSQL_ROOT_PASSWORD': 'root'
    }
}
```

## Additional Documentation 
Additional documentation for the Mason CLI can be found on the [Codemason website](https://codemason.io/docs/mason-cli).
