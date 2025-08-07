import fs from "node:fs";

const packageJSON = JSON.parse(fs.readFileSync("./package.json", "utf-8"));

const { imports } = packageJSON;

/**
 * 
 * @param {string} importPath 
 * @returns {string | null}
 */
export function transformPathFromImports(importPath) {
  const regexps = Object.entries(imports).reduce((res, [key, value]) => {
      const regexp = new RegExp(key.replaceAll('.', '\\.').replaceAll('*', ''))
      const valuePath = value.replaceAll('*', '')

      res.set(regexp, valuePath)
      return res
    }, new Map())

    const regexpsEntries = [...regexps.entries()]

    for (let i = 0; i < regexpsEntries.length; ++i) {
      const [re, rePath] = regexpsEntries[i]

      const matchResult = importPath.match(re)

      if (matchResult) {
        return importPath.replace(re, rePath)
      }
    }

    return null
}