import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('src/modules');
const files = [];
(function walk(d) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, f.name);
    if (f.isDirectory()) walk(p);
    else if (p.endsWith('.tsx')) files.push(p);
  }
})(root);

for (const file of files) {
  let src = fs.readFileSync(file, 'utf8');
  if (!src.includes('type="number"')) continue;
  const re = /<input((?:(?!<input)[\s\S])*?)\s*type="number"/g;
  let count = 0;
  src = src.replace(re, (_m, between) => {
    count++;
    return `<NumberInput${between}`;
  });
  const rel = path
    .relative(path.dirname(file), path.resolve('src/components/common/NumberInput'))
    .replace(/\\/g, '/');
  const importLine = `import { NumberInput } from '${rel.startsWith('.') ? rel : './' + rel}';\n`;
  const lines = src.split('\n');
  let lastImport = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^import\s/.test(lines[i]) || /^\} from /.test(lines[i])) lastImport = i;
    if (/^(export|const|function)\s/.test(lines[i])) break;
  }
  lines.splice(lastImport + 1, 0, importLine.trimEnd());
  fs.writeFileSync(file, lines.join('\n'));
  console.log(path.relative('.', file), count);
}
