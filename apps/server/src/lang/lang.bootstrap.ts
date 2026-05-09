import { existsSync, readdirSync, statSync } from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { Dictionary } from './lang.types';
import { combineDictionary } from './lang.utils';
import { IS_DEV } from '../config/config';

export function getAllDictionaryExports(
  dir: string,
  collected: {
    path: string;
    dictionaries: Record<string, Dictionary>;
  }[] = [],
) {
  const files = readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      getAllDictionaryExports(fullPath, collected);
    } else if (
      file.endsWith('.dictionary.js') &&
      !file.startsWith('_') // skip indexer/combined dictionary files
    ) {
      // Use require here to load .ts file using ts-node in dev, may require tsconfig set up
      // Or just collect the file path for further processing
      const relPath = fullPath
        .replace(process.cwd() + path.sep, '')
        .replace(/\\/g, '/');

      // Resolve the absolute path relative to the current working directory,
      // convert .ts (or .js) to .js for dist builds, and ensure require works for both dev and prod
      const absolutePath = path.resolve(
        process.cwd(),
        relPath
          .replace(/^src\//, 'dist/src/')
          .replace(/\.ts$/, '.js')
          .replace(/\.js$/, '.js'),
      );

      const exportVars = require(absolutePath);
      const dictionaries = Object.entries(exportVars).reduce((acc, [k, v]) => {
        if (typeof v === 'object' && 'dictionary' in v) {
          return { ...acc, [k]: v };
        }
        return acc;
      }, {});

      collected.push({
        path: absolutePath,
        dictionaries,
      });
    }
  }

  return collected;
}

export async function langBootstrap() {
  if (!existsSync(`public/lang`)) await mkdir(`public/lang`);

  const collected = getAllDictionaryExports(path.join(__dirname, '..', '..'));
  const dictionaries = collected.reduce<Dictionary[]>(
    (acc, cur) => [...acc, ...Object.values(cur.dictionaries)],
    [],
  );

  const combinedDictionary = combineDictionary(dictionaries);

  await writeFile(
    'src/lang/lang.dictionary.json',
    JSON.stringify(combinedDictionary),
  );

  await Promise.all(
    Object.keys(combinedDictionary).map(async (locale) => {
      await writeFile(
        `public/lang/${locale}.json`,
        JSON.stringify(combinedDictionary[locale]),
      );
    }),
  );
}
