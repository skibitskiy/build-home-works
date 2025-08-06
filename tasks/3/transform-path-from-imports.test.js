import assert from "node:assert";
import { describe, test } from "node:test";
import {transformPathFromImports} from './transform-path-from-imports.js'

describe('transform-path-from-imports', () => {
    test('should return true for existing import pattern', () => {
        assert.equal(transformPathFromImports("#components/button/index"), './src/components/button/index')
        assert.equal(transformPathFromImports("#utils/peps"), './src/utils/peps')
    })

    test('should return null for non existing import pattern', () => {
        assert.equal(transformPathFromImports("#lib/pops"), null)
    })
})