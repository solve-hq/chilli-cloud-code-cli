# chilli-cloud-code-cli

CLI to interact with Chilli Cloud Code

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/chilli-cloud-code-cli.svg)](https://npmjs.org/package/chilli-cloud-code-cli)
[![Downloads/week](https://img.shields.io/npm/dw/chilli-cloud-code-cli.svg)](https://npmjs.org/package/chilli-cloud-code-cli)
[![License](https://img.shields.io/npm/l/chilli-cloud-code-cli.svg)](https://github.com/solve-hq/chilli-cloud-code-cli/blob/master/package.json)

<!-- toc -->
* [chilli-cloud-code-cli](#chilli-cloud-code-cli)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

# Usage

<!-- usage -->
```sh-session
$ npm install -g chilli-cloud-code-cli
$ chilli-cloud-code COMMAND
running command...
$ chilli-cloud-code (-v|--version|version)
chilli-cloud-code-cli/0.1.1 darwin-x64 node-v13.11.0
$ chilli-cloud-code --help [COMMAND]
USAGE
  $ chilli-cloud-code COMMAND
...
```
<!-- usagestop -->

# Commands

<!-- commands -->
* [`chilli-cloud-code deploy-manifest PATH`](#chilli-cloud-code-deploy-manifest-path)
* [`chilli-cloud-code help [COMMAND]`](#chilli-cloud-code-help-command)
* [`chilli-cloud-code run`](#chilli-cloud-code-run)

## `chilli-cloud-code deploy-manifest PATH`

Deploy all scripts defined in the Manifest

```
USAGE
  $ chilli-cloud-code deploy-manifest PATH

ARGUMENTS
  PATH  Path to the manifest.json file

OPTIONS
  -g, --game=game  (required) The Chilli Game token to specify which game to deploy to
```

_See code: [src/commands/deploy-manifest.js](https://github.com/solve-hq/chilli-cloud-code-cli/blob/v0.1.1/src/commands/deploy-manifest.js)_

## `chilli-cloud-code help [COMMAND]`

display help for chilli-cloud-code

```
USAGE
  $ chilli-cloud-code help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.0.0/src/commands/help.ts)_

## `chilli-cloud-code run`

Run an existing cloud code script

```
USAGE
  $ chilli-cloud-code run

OPTIONS
  -g, --game=game          The Chilli Game token to specify which game to use
  -m, --manifest=manifest  The path to the manifest JSON file that contains the script definitions
  -n, --name=name          The name of the cloud code script to run
  -p, --player=player      Chilli Connect ID of the player to run the script as
```

_See code: [src/commands/run.js](https://github.com/solve-hq/chilli-cloud-code-cli/blob/v0.1.1/src/commands/run.js)_
<!-- commandsstop -->
