#!/usr/bin/env node

import { Command } from "commander";
import { InitCommand } from "./commands/init.ts";
import { loadEnv } from "./utils/config.ts";

export const SUPPORTED_ADAPTERS = ["neon"];
export const VALID_MODULES = ["cache", "realtime", "queue"];

loadEnv();
const program = new Command();

program.name("pgtrinity").description("CLI for PGTrinity configuration").version("0.0.1");

InitCommand.register(program);

program.parse();
