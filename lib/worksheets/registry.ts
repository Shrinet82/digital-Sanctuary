import fs from "node:fs";
import path from "node:path";
import type { WorksheetTemplate } from "./types";

/**
 * Loads every worksheet template from content/worksheets/*.json.
 *
 * This directory IS the worksheet library — dropping a new JSON file in
 * makes a new worksheet appear across the app with no code changes.
 * Server-only (uses fs); pass templates to client components as props.
 */

const WORKSHEET_DIR = path.join(process.cwd(), "content", "worksheets");

let cache: WorksheetTemplate[] | null = null;

function validate(t: unknown, file: string): WorksheetTemplate {
  const tpl = t as WorksheetTemplate;
  const problems: string[] = [];

  if (!tpl.id) problems.push("missing id");
  if (!tpl.version) problems.push("missing version");
  if (!tpl.name) problems.push("missing name");
  if (!Array.isArray(tpl.steps) || tpl.steps.length === 0)
    problems.push("missing steps");

  // Every answer-collecting step needs a key so we know where to store it.
  tpl.steps?.forEach((s, i) => {
    const needsKey = s.type !== "info" && s.type !== "summary";
    if (needsKey && !s.key) problems.push(`step ${i} (${s.type}) has no key`);
  });

  if (problems.length) {
    throw new Error(
      `Invalid worksheet template in ${file}: ${problems.join(", ")}`
    );
  }
  return tpl;
}

export function getAllWorksheets(): WorksheetTemplate[] {
  if (cache) return cache;

  if (!fs.existsSync(WORKSHEET_DIR)) {
    cache = [];
    return cache;
  }

  const templates = fs
    .readdirSync(WORKSHEET_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(WORKSHEET_DIR, file), "utf8");
      return validate(JSON.parse(raw), file);
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  cache = templates;
  return templates;
}

export function getWorksheet(id: string): WorksheetTemplate | null {
  return getAllWorksheets().find((t) => t.id === id) ?? null;
}
