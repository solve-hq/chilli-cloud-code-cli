const { Command, flags } = require("@oclif/command");
const ChilliClient = require("../chilli/client");
const fs = require("fs");
const path = require("path");
const isEqual = require("lodash.isequal");
const { cli } = require("cli-ux");

const hasLocalChanges = (remoteScript, scriptOperation) => {
  // Has any local code changes?
  if (remoteScript.Script.Code != scriptOperation.code) {
    return true;
  }

  const normalizedLocalParams = normalizeScriptParams(
    scriptOperation.definition.parameters
  );

  // Has any local param changes?
  return !isEqual(remoteScript.Params, normalizedLocalParams);
};

const normalizeScriptParams = (params) =>
  Object.keys(params).map((paramName) => {
    const param = params[paramName];

    return {
      Name: paramName,
      Type: param.type.toUpperCase(),
      Required: param.required,
    };
  });

const createOptions = (key, scriptDefinition, code) => {
  return { Key: key, ...updateOptions(scriptDefinition, code) };
};

const updateOptions = (scriptDefinition, code) => {
  const options = {
    Name: scriptDefinition.name,
    Type: scriptDefinition.type,
    Code: code,
  };

  switch (scriptDefinition.type) {
    case "API":
    case "SUPPORT":
      options.Params = normalizeScriptParams(scriptDefinition.parameters);
      break;
    case "EVENT":
      options.EventType = scriptDefinition.eventType;
    case "SCHEDULE":
      options.ScheduleType = scriptDefinition.frequency.toUpperCase();
      options.ScheduleMinute = scriptDefinition.minute;

      if (
        options.ScheduleType === "DAILY" ||
        options.ScheduleType === "WEEKLY"
      ) {
        options.ScheduleHour = scriptDefinition.hour;
      }

      if (options.ScheduleType === "WEEKLY") {
        options.ScheduleDayOfWeek = scriptDefinition.dayOfWeek.toUpperCase();
      }

    default:
      break;
  }

  return options;
};

const createScript = async (scriptOperation, chilliClient) => {
  try {
    const response = await chilliClient.createScript(
      createOptions(
        scriptOperation.key,
        scriptOperation.definition,
        scriptOperation.code
      )
    );

    return response;
  } catch (error) {
    switch (error.response.status) {
      case 422:
        console.error(
          `Creating script ${
            scriptOperation.key
          } failed because the request was invalid: ${JSON.stringify(
            error.response.data
          )}`
        );
        break;

      default:
        break;
    }
  }
};

const updateScript = async (scriptOperation, chilliClient) => {
  try {
    const response = await chilliClient.updateScript(
      scriptOperation.key,
      updateOptions(scriptOperation.definition, scriptOperation.code)
    );

    return response;
  } catch (error) {
    switch (error.response.status) {
      case 422:
        console.error(
          `Updating script ${
            scriptOperation.key
          } failed because the request was invalid: ${JSON.stringify(
            error.response.data
          )}`
        );
        break;

      default:
        break;
    }
  }
};

const deployScriptOperation = async (scriptOperation, chilliClient) => {
  if (scriptOperation.deployType === "update") {
    return updateScript(scriptOperation, chilliClient);
  } else {
    return createScript(scriptOperation, chilliClient);
  }
};

const publishScriptOperation = async (scriptOperation, chilliClient) => {
  return chilliClient.publishScript(scriptOperation.key);
};

class DeployManifestCommand extends Command {
  async run() {
    const { flags, args } = this.parse(DeployManifestCommand);

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

    const manifestPath = path.resolve(args.path);

    const manifestContents = fs.readFileSync(manifestPath, "utf8");
    const manifest = JSON.parse(manifestContents);

    const scriptOperations = await Object.keys(manifest.scripts).reduce(
      async (agg, scriptKey) => {
        const scriptDefinition = manifest.scripts[scriptKey];

        const scriptPath = path.resolve(
          path.dirname(manifestPath),
          scriptDefinition.code
        );

        if (!fs.existsSync(scriptPath)) {
          console.error(
            `Script ${scriptKey} code at ${scriptPath} does not exist, exiting...`
          );

          this.exit();
        }

        const scriptCode = fs.readFileSync(scriptPath, "utf8");

        const remoteScriptDetails = await chilliClient.getScriptDetails(
          scriptKey
        );

        const scriptOperationDetails = {
          key: scriptKey,
          definition: scriptDefinition,
          code: scriptCode,
        };

        // If the script exists and has no local changed, don't update it
        if (
          remoteScriptDetails &&
          !hasLocalChanges(remoteScriptDetails, scriptOperationDetails)
        ) {
          this.log(
            `Skipping ${scripKey} because it does not contain any changes.`
          );
          return agg;
        }

        scriptOperationDetails.deployType = remoteScriptDetails
          ? "update"
          : "create";

        return agg.concat(scriptOperationDetails);
      },
      []
    );

    cli.action.start(`Deploying changes to scripts`);

    await Promise.all(
      scriptOperations.map((operation) =>
        deployScriptOperation(operation, chilliClient)
      )
    );

    cli.action.stop();

    cli.action.start(`Publishing scripts`);

    await Promise.all(
      scriptOperations.map((operation) =>
        publishScriptOperation(operation, chilliClient)
      )
    );

    cli.action.stop();
  }
}

DeployManifestCommand.description = `Deploy all scripts defined in the Manifest`;

DeployManifestCommand.flags = {
  game: flags.string({
    char: "g",
    description: "The Chilli Game token to specify which game to deploy to",
    required: true,
  }),
};

DeployManifestCommand.args = [
  {
    name: "path",
    required: true,
    description: "Path to the manifest.json file",
  },
];

module.exports = DeployManifestCommand;
