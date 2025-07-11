import fs from "node:fs";
import path from "node:path";

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

  while (modulePaths.length > 0) {
    const modulePath = modulePaths.pop()

    if (cache.has(modulePath)) {
      continue
    }

    const moduleCode = fs.readFileSync(modulePath, "utf-8");

    cache.set(modulePath, removeImportAndExport(moduleCode));

    const dir = path.dirname(modulePath);

    const requireCalls = searchRequireCalls(moduleCode, dir);

    modulePaths.push(...requireCalls);
  }

  return [...cache.keys()].reverse().map((key) => {
    return cache.get(key)
  }).join('\n')
}

/**
 * Функция удаляет все require и module.exports из кода
 * 
 * @param {string} code 
 * @returns 
 */
function removeImportAndExport(code) {
  const requireRegexpString = '(const|var|let).*=\\s*require\\(.+\\);?'

  const exportsRegexpString = 'module\\.exports\\s*=\\s*\\{[^}]*\}\\s*;?'

  const re = new RegExp(`(${requireRegexpString})|(${exportsRegexpString})`, 'g')

  return code.replaceAll(re, '')
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
