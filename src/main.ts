import chalk from "chalk";

import { connect as connectToStreamlabs } from "./features/streamlabs/connect";

// @see https://www.asciiart.eu/text-to-ascii-art
const header = `
.▄▄ · ▄▄▄▄▄▄▄▄  ▄▄▄ . ▄▄▄· • ▌ ▄ ·. ·▄▄▄▄  ▄▄▄ . ▌ ▐·.▄▄ · 
▐█ ▀. •██  ▀▄ █·▀▄.▀·▐█ ▀█ ·██ ▐███▪██▪ ██ ▀▄.▀·▪█·█▌▐█ ▀. 
▄▀▀▀█▄ ▐█.▪▐▀▀▄ ▐▀▀▪▄▄█▀▀█ ▐█ ▌▐▌▐█·▐█· ▐█▌▐▀▀▪▄▐█▐█•▄▀▀▀█▄
▐█▄▪▐█ ▐█▌·▐█•█▌▐█▄▄▌▐█ ▪▐▌██ ██▌▐█▌██. ██ ▐█▄▄▌ ███ ▐█▄▪▐█
 ▀▀▀▀  ▀▀▀ .▀  ▀ ▀▀▀  ▀  ▀ ▀▀  █▪▀▀▀▀▀▀▀▀•  ▀▀▀ . ▀   ▀▀▀▀ 
 `;

const welcome = [
  `Welcome to the ${chalk.bold("StreamDevs")} CLI!`,
  `Please report any issues on ${chalk.blue("https://github.com/streamdevs/cli/issues")}`,
].join("\n");

export async function run() {
  console.log(header);
  console.log(welcome + `\n`);

  // If/when more features are added, add a selection menu here: "What do you want to do?"

  // Delegate control to the only feature available at the moment
  await connectToStreamlabs();
}
