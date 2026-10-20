import ts from 'typescript';

// Runtime dependencies that are published with ES2015+ syntax. They are
// transpiled to ES5 so that the ES5 bundles (dist/dexie.js, dist/dexie.mjs)
// keep containing ES5 syntax only.
const ES2015_DEPENDENCIES =
  /node_modules[\\/](?:\.pnpm[\\/][^\\/]+[\\/]node_modules[\\/])?(?:event-reduce-js|binary-decision-diagram|array-push-at-sort-position)[\\/]/;

export function downlevelDependencies() {
  return {
    name: 'downlevel-dependencies',
    transform(code, id) {
      if (!ES2015_DEPENDENCIES.test(id)) return null;
      const output = ts.transpileModule(code, {
        fileName: id,
        compilerOptions: {
          target: ts.ScriptTarget.ES5,
          module: ts.ModuleKind.ES2015,
          importHelpers: true,
          allowJs: true,
          sourceMap: true,
        },
      });
      return {
        code: output.outputText.replace(/\/\/# sourceMappingURL=.*$/m, ''),
        map: JSON.parse(output.sourceMapText),
      };
    },
  };
}
