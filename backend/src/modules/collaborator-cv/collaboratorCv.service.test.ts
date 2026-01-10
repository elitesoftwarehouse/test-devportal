import { CollaboratorCvService } from './collaboratorCv.service';

function expect(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

(async () => {
  const service = new CollaboratorCvService();
  const collaboratorId = 'c1';

  const first = await service.uploadNew({
    collaboratorId,
    fileNameOriginale: 'cv1.pdf',
    mimeType: 'application/pdf',
    dimensione: 1234,
    caricatoreUserId: 'admin1',
  });

  const second = await service.uploadNew({
    collaboratorId,
    fileNameOriginale: 'cv2.pdf',
    mimeType: 'application/pdf',
    dimensione: 2345,
    caricatoreUserId: 'admin1',
  });

  const list = await service.listByCollaborator(collaboratorId);
  const current = list.filter((x) => x.flagIsCorrente && !x.flagIsDeleted);

  expect(list.length === 2, 'Devono esistere 2 CV non eliminati');
  expect(current.length === 1, 'Deve esistere un solo CV corrente');
  expect(current[0].id === second.id, 'L\'ultimo CV caricato deve essere quello corrente');

  // eslint-disable-next-line no-console
  console.log('collaboratorCv.service.test.ts passed');
})();
