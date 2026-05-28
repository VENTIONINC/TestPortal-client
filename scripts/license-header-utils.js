import fs from "node:fs";
import path from "node:path";

export const LICENSE_HEADER = [
  "// Copyright 2026 Vention",
  "// SPDX-License-Identifier: Apache-2.0",
].join("\n");

export const HEADER_BY_EXTENSION = new Map([
  [".ts", LICENSE_HEADER],
  [".tsx", LICENSE_HEADER],
  [".js", LICENSE_HEADER],
  [".jsx", LICENSE_HEADER],
  [".mjs", LICENSE_HEADER],
  [".cjs", LICENSE_HEADER],
]);

export const DEFAULT_IGNORED_DIRECTORIES = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  "coverage",
]);

export const GENERATED_SOURCE_EXCLUSIONS = new Set([
  path.normalize("src/redux/apis/generatedApi.ts"),
]);

export function getSupportedExtensions() {
  return Array.from(HEADER_BY_EXTENSION.keys());
}

export function getHeaderForExtension(filePath) {
  return HEADER_BY_EXTENSION.get(path.extname(filePath).toLowerCase()) ?? null;
}

export function normalizeHeader(header) {
  return `${header}\n\n`;
}

export function hasLicenseHeader(content, header) {
  return content.startsWith(normalizeHeader(header));
}

export function isGeneratedSourceExcluded(rootDirectory, filePath) {
  const relativePath = path.relative(rootDirectory, filePath);
  return GENERATED_SOURCE_EXCLUSIONS.has(path.normalize(relativePath));
}

export function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

export function ensureParentDirectory(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}
