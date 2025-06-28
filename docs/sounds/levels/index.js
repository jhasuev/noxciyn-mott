import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseDir = __dirname;

async function walkAndCollect(fileList = [], currentDir = baseDir, topLevelFolder = '') {
  const entries = await fs.promises.readdir(currentDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(currentDir, entry.name);

    if (entry.isDirectory()) {
      const relative = path.relative(baseDir, fullPath).split(path.sep);
      const topFolder = relative[0] || topLevelFolder;
      await walkAndCollect(fileList, fullPath, topFolder);
    } else if (entry.name.endsWith('.mp3')) {
      const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      fileList.push({ path: relativePath, topFolder: topLevelFolder || relativePath.split('/')[0] });
    }
  }

  return fileList;
}

function buildAudioMap(fileObjects) {
  const map = {};

  for (const { path: relativePath, topFolder } of fileObjects) {
    const key = path.basename(relativePath, '.mp3'); // имя файла без расширения
    const fullPath = `sounds/levels/${relativePath}`;

    if (!map[topFolder]) {
      map[topFolder] = {};
    }

    map[topFolder][key] = fullPath;
  }

  return Object.entries(map).map(([folder, audios]) => ({
    folder,
    audios,
  }));
}

(async () => {
  const audioFiles = await walkAndCollect();
  const result = buildAudioMap(audioFiles);
  console.log(JSON.stringify(result, null, 2));

  // Если нужно сохранить:
  // await fs.promises.writeFile(path.join(baseDir, 'audioMap.json'), JSON.stringify(result, null, 2));
})();
