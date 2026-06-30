import fs from "node:fs";
import path from "node:path";

import {
  DEFAULT_IGNORED_DIRECTORIES,
  getHeaderForExtension,
  getSupportedExtensions,
  isGeneratedSourceExcluded,
  normalizeLicenseHeaderContent,
} from "./license-header-utils.js";

const TARGET_DIRECTORIES = ["src"];

function walkDirectory(directoryPath, collectedPaths) {
  const entries = fs.readdirSync(directoryPath, { withFileTypes: true });

  entries.forEach((entry) => {
    if (entry.isDirectory()) {
      if (DEFAULT_IGNORED_DIRECTORIES.has(entry.name)) {
        return;
      }

      walkDirectory(path.join(directoryPath, entry.name), collectedPaths);
      return;
    }

    const absolutePath = path.join(directoryPath, entry.name);
    if (getHeaderForExtension(absolutePath)) {
      collectedPaths.push(absolutePath);
    }
  });
}

const rootDirectory = process.cwd();
const targetFiles = [];

TARGET_DIRECTORIES.forEach((relativeDirectory) => {
  const absoluteDirectory = path.join(rootDirectory, relativeDirectory);

  if (!fs.existsSync(absoluteDirectory)) {
    return;
  }

  walkDirectory(absoluteDirectory, targetFiles);
});

let updatedCount = 0;
let skippedCount = 0;
let excludedCount = 0;

targetFiles.forEach((targetFile) => {
  if (isGeneratedSourceExcluded(rootDirectory, targetFile)) {
    excludedCount += 1;
    return;
  }

  const header = getHeaderForExtension(targetFile);

  if (!header) {
    skippedCount += 1;
    return;
  }

  const currentContent = fs.readFileSync(targetFile, "utf8");

  const normalized = normalizeLicenseHeaderContent(currentContent, header);

  if (!normalized.changed) {
    skippedCount += 1;
    return;
  }

  fs.writeFileSync(targetFile, normalized.content, "utf8");
  updatedCount += 1;
  console.log(`Updated ${path.relative(rootDirectory, targetFile)}`);
});

console.log(
  `Processed ${targetFiles.length} supported files. Added or normalized headers in ${updatedCount}; skipped ${skippedCount}; excluded ${excludedCount}.`,
);
console.log(`Supported extensions: ${getSupportedExtensions().join(", ")}`);
console.log(`Scoped directories: ${TARGET_DIRECTORIES.join(", ")}`);
console.log(
  "Excluded generated files: src/redux/apis/generatedApi.ts",
);
