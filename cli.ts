#!/usr/bin/env node

import { ExitPromptError } from "@inquirer/core";
import { run } from "./src/main";

run().catch((error) => {
    if (error.name === ExitPromptError.name) {
        console.log(error.message);

        return;
    }

    throw error;
});

