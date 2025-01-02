import { JSDocStructure } from "ts-morph";
import {
  reportTitle, reportResult
} from "./reporter.js";

export default function reportTSDocsCoverage(
  asSummary: boolean,
  results: Record<string, Record<string, JSDocStructure | "(missing group)" | null>>,
): void
{
  reportTitle("Coverage report: TSDoc comments");
  for (const [className, fields] of Object.entries(results)) {
    if (!asSummary)
      process.stdout.write(className + ":\n");

    for (const [fieldName, value] of Object.entries(fields)) {
      if (value === "(missing group)") {
        reportResult(asSummary, "missingGroup", "  (all)");
        break;
      }

      if (value === null) {
        reportResult(asSummary, "missingValue", "  " + fieldName);
        break;
      }

      reportResult(asSummary, "ok", "  " + fieldName);
    }
  }
  process.stdout.write("\n\n");
}
