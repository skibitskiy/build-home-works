import fs from "node:fs";
import path from "node:path";

const template = (runtime, entryPath) => `
const cache = {};
const module = {};

${runtime}

const require = (path) => {
  const resultFromCache = module[path] && module[path].exports
  if (resultFromCache) {
    return resultFromCache
  }

  module[path] = {}

  cache[path](require, module[path]);

  return module[path].exports
}

cache['${entryPath}'](require, module)
`

/**
 * Примерный алгоритм работы бандлера:
 * 1. Прочитать entry и собрать список всех вызовов require
 * 2. Пройтись по полученным require (они могут быть вложенными)
 * 3. На выходе получится массив с исходным кодом всех модулей
 * 4. Склеить всё воедино обернув модули и entry в новый рантайм
 * 
 * Для чтения файлов используйте fs.readFileSync
 * Для резолва пути до модуля испльзуйте path.resolve (вам нужен путь до родителя где был вызван require)
 * Пока что сборщик упрощен, считаем что require из node_modules нет
 */

/**
 * @param {string} entryPath - путь к entry бандлинга
 */
export function bundle(entryPath) {
  const cache = new Map()

  const modulePaths = [entryPath]

  const createCacheSet = (modulePath, moduleCode) => {
    return `cache['${modulePath}'] = (require, module) => {\n${moduleCode}\n}`
  }

  while (modulePaths.length > 0) {
    const modulePath = modulePaths.pop()

    if (cache.has(modulePath)) {
      continue
    }

    const moduleCode = fs.readFileSync(modulePath, "utf-8");

    const modulePathWithoutSrc = modulePath.replace(/(\.\/)?src\//gi, './')

    cache.set(modulePathWithoutSrc, createCacheSet(modulePathWithoutSrc, moduleCode));

    const dir = path.dirname(modulePath);

    const requireCalls = searchRequireCalls(moduleCode, dir);

    modulePaths.push(...requireCalls);
  }

  const cacheKeys = [...cache.keys()].reverse()

  const code = cacheKeys.map((key) => {
    return cache.get(key)
  }).join('\n')

  return template(code, cacheKeys.at(-1))
}

/**
 * Функция для поиска в файле вызовов require
 * Возвращает id модулей
 * @param {string} code 
 */
function searchRequireCalls(code, dir) {
  return [...code.matchAll(/require\(('|")(.*)('|")\)/g)]
  .map(
    (item) => item[2]
  ).map((name) => {
    return path.join(dir, name)
  });
}
