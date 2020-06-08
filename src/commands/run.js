const { Command, flags } = require("@oclif/command");
const ChilliClient = require("../chilli/client");
const fs = require("fs");
const path = require("path");
const inquirer = require("inquirer");
const { cli } = require("cli-ux");

const buildParamPrompt = (param) => {
  console.log(param);
  switch (param.Type) {
    case "STRING":
      return {
        type: "input",
        name: param.Name,
        message: `String for Parameter ${param.Name} (${
          param.Required ? "required" : "optional"
        })`,
      };
    case "NUMERIC":
      return {
        type: "number",
        name: param.Name,
        message: `Number for Parameter ${param.Name} (${
          param.Required ? "required" : "optional"
        })`,
      };
    case "BOOLEAN":
      return {
        type: "confirm",
        name: param.Name,
        message: `Bool for Parameter ${param.Name} (${
          param.Required ? "required" : "optional"
        })`,
      };
    case "JSON":
      return {
        type: "editor",
        name: param.Name,
        message: `JSON for Parameter ${param.Name} (${
          param.Required ? "required" : "optional"
        })`,
        filter: JSON.parse,
      };
    default:
      break;
  }
};

const buildParamPrompts = (params) => params.map(buildParamPrompt);

const promptForParamValues = async (remoteScript) => {
  if (!remoteScript.Params) {
    return {};
  }

  return inquirer.prompt(buildParamPrompts(remoteScript.Params));
};

class RunCommand extends Command {
  async run() {
    const { flags } = this.parse(RunCommand);

    if (!process.env.CHILLI_API_TOKEN) {
      console.error(`No CHILLI_API_TOKEN environment variable set, exiting...`);

      this.exit();
    }

    if (!process.env.CHILLI_API_SECRET) {
      console.error(
        `No CHILLI_API_SECRET environment variable set, exiting...`
      );

      this.exit();
    }

    const chilliClient = new ChilliClient(
      process.env.CHILLI_API_TOKEN,
      process.env.CHILLI_API_SECRET,
      flags.game
    );

    const manifestPath = path.resolve(flags.manifest);

    const manifestContents = fs.readFileSync(manifestPath, "utf8");
    const manifest = JSON.parse(manifestContents);

    const scriptDefinition = manifest.scripts[flags.name];

    if (!scriptDefinition) {
      console.error(
        `Could not find a script named ${flags.name} in the manifest file ${flags.manifest}`
      );

      this.exit();
    }

    const remoteScript = await chilliClient.getScriptDetails(flags.name);

    if (!remoteScript) {
      console.error(
        `No script named ${flags.name} found in Chilli Cloud Code. You might need to deploy it first using chilli-cloud-code deploy`
      );

      this.exit();
    }

    const params = await promptForParamValues(remoteScript);

    try {
      cli.action.start(
        `Running script ${flags.name} as player ${flags.player}`
      );

      const response = await chilliClient.testRunScript(flags.name, {
        ChilliConnectID: flags.player,
        Params: params,
      });

      cli.action.stop();

      this.log("");

      for (const log of response.Logs) {
        this.log(`[${log.LogLevel}](${log.DateTime}) ${log.Message}`);
      }

      this.log(`\n${JSON.stringify(response.Output, null, 2)}`);
    } catch (error) {
      console.error(
        `Error running script ${flags.name}: ${JSON.stringify(
          error.response.data
        )}`
      );
    }
  }
}

RunCommand.description = `Run an existing cloud code script`;

RunCommand.flags = {
  game: flags.string({
    char: "g",
    description: "The Chilli Game token to specify which game to use",
  }),
  manifest: flags.string({
    char: "m",
    description:
      "The path to the manifest JSON file that contains the script definitions",
  }),
  name: flags.string({
    char: "n",
    description: "The name of the cloud code script to run",
  }),
  player: flags.string({
    char: "p",
    description: "Chilli Connect ID of the player to run the script as",
  }),
};

module.exports = RunCommand;
