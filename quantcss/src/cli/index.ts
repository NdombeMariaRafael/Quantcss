#!/usr/bin/env node
import { Command } from "commander";
import { runBuild } from "./build";
import { runCheck } from "./check";
import { runDev } from "./dev";

const program = new Command();

program
  .name("quant")
  .description("QuantCSS — utilitário JIT framework");

program
  .command("build")
  .description("gera o quant.css otimizado")
  .action(runBuild);

program
  .command("check")
  .description("valida o código .qs e analisa uso de classes")
  .action(runCheck);

program
  .command("dev")
  .description("modo de desenvolvimento (watch)")
  .action(runDev);

program.parseAsync(process.argv);
