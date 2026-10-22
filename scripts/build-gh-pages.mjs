import fs from 'node:fs';
import { execSync } from 'node:child_process';

// 1. Asegurar index.html estándar para que Vite detecte el entrypoint /src/main.tsx
const devIndexHtml = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Sistema de Análisis y Planeación Financiera | GFO IS2122</title>
  </head>
  <body class="bg-slate-50 text-slate-900 antialiased">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;

fs.writeFileSync('index.html', devIndexHtml, 'utf8');

// 2. Ejecutar TypeScript y Vite build hacia docs/
execSync('npx tsc -b && npx vite build --outDir docs --emptyOutDir', { stdio: 'inherit' });

// 3. Crear .nojekyll en raíz y en docs/
fs.writeFileSync('.nojekyll', '', 'utf8');
fs.writeFileSync('docs/.nojekyll', '', 'utf8');

// 4. Leer los nombres de archivos con hash generados en docs/index.html
const docsHtml = fs.readFileSync('docs/index.html', 'utf8');
const jsMatch = docsHtml.match(/src="\.\/assets\/(index-[^"]+\.js)"/);
const cssMatch = docsHtml.match(/href="\.\/assets\/(index-[^"]+\.css)"/);

if (!jsMatch || !cssMatch) {
  throw new Error('No se encontraron los assets compilados en docs/index.html');
}

const jsFile = jsMatch[1];
const cssFile = cssMatch[1];

// 5. Escribir index.html híbrido en la raíz (funciona en localhost con Vite dev y en GitHub Pages desde /root)
const hybridIndexHtml = `<!doctype html>
<html lang="es">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sistema de Análisis y Planeación Financiera | GFO IS2122</title>
</head>

<body class="bg-slate-50 text-slate-900 antialiased">
  <div id="root"></div>
  <script>
    (function () {
      var isLocal =
        location.hostname === 'localhost' ||
        location.hostname === '127.0.0.1' ||
        location.port !== '';
      if (isLocal) {
        var devScript = document.createElement('script');
        devScript.type = 'module';
        devScript.src = '/src/main.tsx';
        document.body.appendChild(devScript);
      } else {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = './docs/assets/${cssFile}';
        document.head.appendChild(link);

        var prodScript = document.createElement('script');
        prodScript.type = 'module';
        prodScript.crossOrigin = 'anonymous';
        prodScript.src = './docs/assets/${jsFile}';
        document.head.appendChild(prodScript);
      }
    })();
  </script>
</body>

</html>
`;

fs.writeFileSync('index.html', hybridIndexHtml, 'utf8');
console.log(`Build completado y sincronizado: ${jsFile}, ${cssFile}`);

