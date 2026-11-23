import fs from "node:fs";
import path from "node:path";
import * as yaml from "js-yaml";
import { marked } from "marked";

const CONTENT_DIR = path.resolve("src/content");

export function renderMarkdown(str) {
  return str ? marked.parse(str) : "";
}

/** @returns {any} */
export function loadYaml(relativePath) {
  const fullPath = path.join(CONTENT_DIR, relativePath);
  if (!fs.existsSync(fullPath)) return {};
  return yaml.load(fs.readFileSync(fullPath, "utf-8")) || {};
}

/** @returns {any[]} */
export function loadMarkdownCollection(folder) {
  const dirPath = path.join(CONTENT_DIR, folder);
  if (!fs.existsSync(dirPath)) return [];

  return fs
    .readdirSync(dirPath)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(dirPath, file), "utf-8");
      const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
      const data = match ? yaml.load(match[1]) || {} : {};
      const body = match ? match[2].trim() : raw.trim();

      return {
        slug: file.replace(/\.md$/, ""),
        data,
        body,
        html: renderMarkdown(body),
      };
    });
}