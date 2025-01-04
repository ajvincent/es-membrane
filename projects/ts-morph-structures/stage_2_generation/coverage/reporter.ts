import process from "process";
import chalk from "chalk";

const okDot = chalk.green("\xb7");
const missingValue = chalk.yellow("/");
const missingGroup = chalk.red("X");

export function reportTitle(
  value: string
): void {
  console.log(chalk.bold(value));
}

export function reportResult(
  asOneChar: boolean,
  status: "ok" | "missingGroup" | "missingValue",
  value: string
): void
{
  switch (status) {
    case "ok":
      value = asOneChar ? okDot : chalk.green(value);
      break;
    case "missingValue":
      value = asOneChar ? missingValue : chalk.yellow(value);
      break;
    case "missingGroup":
      value = asOneChar ? missingGroup : chalk.red(value);
      break;
  }

  if (asOneChar) {
    process.stdout.write(value);
  }
  else {
    console.log(value);
  }
}
