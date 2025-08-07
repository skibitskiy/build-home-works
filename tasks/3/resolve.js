import fs from "node:fs";
import path from "node:path";
import { transformPathFromImports } from './transform-path-from-imports.js'

const rootDir = path.resolve(".");

const extensionsToResolve = ["js", "ts", "json"];

/**
 * @param {string} _importPath 
 * @param {string} parentPath 
 * @returns {string | null}
 */
export function resolve(_importPath, parentPath) {
  let filePath = ''

  let importPath = _importPath

  if (importPath.startsWith('#')) {
    importPath = transformPathFromImports(importPath)

    if (importPath === null) {
      return null
    }

    filePath = path.resolve(rootDir, importPath)
  } else {
    filePath = path.resolve(path.dirname(parentPath), importPath)
  }

  const extensionMathResult = filePath.match(/\.\w+$/)

  const extenstion = extensionMathResult?.[0]

  if (extenstion) {
    return isFileExists(filePath)
  } else {
    for (let i = 0; i < extensionsToResolve.length; ++i) {
      const ext = extensionsToResolve[i];

      const filePathWithExtension = `${filePath}.${ext}`

      if (isFileExists(filePathWithExtension)) {
        return filePathWithExtension
      }
    }
  }

  return null
}

function isFileExists(filePath) {
  try {
    fs.readFileSync(filePath);
    return filePath;
  } catch (err) {
    return null;
  }
}
