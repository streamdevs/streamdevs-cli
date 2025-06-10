import { confirm, input, password } from "@inquirer/prompts";
import chalk from "chalk";
import boxen from "boxen";
import ora from "ora";

import { startHttpServer } from "./http-server";
import {
  getAuthorizationUri,
  listenForAuthorizationCode,
} from "./authorization-code";
import { getAccessToken } from "./access-token";
import { notEmpty } from "./prompt-validators/not-empty";
import http from "node:http";

const PORT = 8695;
const REDIRECT_URI = `http://localhost:${PORT}`;

const titleText = "Streamlabs API integration";
const welcomeText = `You need a Streamlabs API OAuth client.
Your client configuration MUST include the redirect URI 'http://localhost:${PORT}' (without quotes)
See ${chalk.blue("https://streamlabs.com/dashboard#/settings/oauth-clients")} to register a new OAuth Client or update an existing configuration`;

export async function connect() {
  // Mark feature start
  console.log(chalk.bold(titleText));
  console.log(welcomeText);

  // Checklist before performing any actions

  // region Step 0: Validate technical requirements on our end
  // Can we start a local http server on PORT?
  const server = await startHttpServer(PORT);

  if (!server) {
    return;
  }
  // endregion

  // region Step 1: Validate requirements on user's end
  if (
    !(await confirm({
      message: "Have you created an OAuth client already?",
      default: false,
    }))
  ) {
    console.log("Please come back when you have created an OAuth client :)");

    return;
  }
  // endregion

  // Feature processing

  // region Step 2: Gather user info
  const client_id = await input({
    message: "Enter your application's OAuth client id",
    validate: notEmpty,
  });
  const client_secret = await password({
    message: "Enter your application's OAuth client secret (will be hidden)",
    mask: true,
    validate: notEmpty,
  });
  // endregion

  // region Step 3: Authorization
  const authSpinner = ora("Waiting for authorization ...").start();
  let authCode: string | undefined;

  try {
    authCode = await getAuthorizationCode(client_id, REDIRECT_URI, server);
  } catch (error: unknown) {
    authSpinner.fail(`Authorization error`);
    console.log(
      chalk.red(
        `Could not get Streamlabs authorization response:\n${(error as Error).message}`,
      ),
    );

    return;
  }

  authSpinner.succeed("Streamlabs API OAuth Authorization Code received");
  // endregion

  // region Step 4: Access Token
  // Now lets get an Access Token so we can interact with Streamlabs API via other apps
  const tokenSpinner = ora(
    "Getting OAuth Access Token for Streamlabs API ...",
  ).start();

  let token: string | undefined;

  try {
    token = await getAccessToken(
      client_id,
      client_secret,
      authCode,
      REDIRECT_URI,
    );
  } catch (error: unknown) {
    tokenSpinner.fail(`Error!`);

    return;
  }

  tokenSpinner.succeed("Streamlabs API OAuth Access Token received");
  // endregion

  // region Step 5: Display the token
  console.log(
    `${chalk.bold.yellowBright("Warning!")} Sharing your token allows anyone to interact with the Streamlabs API on your behalf`,
  );

  await password({ message: "Press enter to display the token" });

  console.log(
    boxen(token, {
      padding: 1,
      borderStyle: "round",
      title: "Streamlabs API OAuth Access Token",
      titleAlignment: "center",
    }),
  );
  //endregion

  // Done! :)
  console.log(
    `You can now use this token with ${chalk.bold("streamdevs/webhook")}`,
  );
  // Feature end
}

function getAuthorizationCode(
  client_id: string,
  redirect_uri: string,
  server: http.Server,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const authorizationUrl = getAuthorizationUri(client_id, redirect_uri);
    console.log(
      "Open this link and authorize your application to access your Streamlabs account:",
    );
    console.log(chalk.bold.blue(authorizationUrl.toString()));

    listenForAuthorizationCode(server).then(resolve).catch(reject);
  });
}
