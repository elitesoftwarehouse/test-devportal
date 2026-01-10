import { buildCollaboratorCvStorageKey } from './collaboratorCvStorageStrategy';

function expect(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

(async () => {
  const collaboratorId = '123e4567-e89b-12d3-a456-426614174000';
  const originalFileName = 'CV Mario Rossi 2024.pdf';
  const fixedDate = new Date('2024-05-10T09:15:33Z');

  const result = buildCollaboratorCvStorageKey(collaboratorId, originalFileName, fixedDate);

  expect(result.storageKey.startsWith(`collaborators/${collaboratorId}/`), 'Lo storageKey deve iniziare con la cartella del collaboratore');
  expect(result.storageKey.endsWith('.pdf'), 'L\'estensione deve essere mantenuta (.pdf)');
  expect(result.storageKey.includes('cv_mario_rossi_2024') || result.storageKey.includes('cv_mario_rossi_2024.pdf'), 'Il nome sanificato deve contenere il base name atteso');

  // Se arriviamo qui senza eccezioni, il test è considerato passato
  // eslint-disable-next-line no-console
  console.log('collaboratorCvStorageStrategy.test.ts passed');
})();
