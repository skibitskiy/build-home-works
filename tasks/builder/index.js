import fs from "node:fs";

import { bundle } from "./bundle.js";
import path from 'node:path';

const output = bundle(process.argv[2]);

const dirname = import.meta.dirname

try {
    fs.rmSync(path.join(dirname, './dist'), { recursive: true  })
} catch {}

fs.mkdirSync(path.join(dirname, './dist'));
fs.writeFileSync(path.join(dirname, './dist/main.js'), output);
