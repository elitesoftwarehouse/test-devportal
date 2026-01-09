import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {
  fetchProfileQualityList,
  ProfileQualityListResponse
} from '../profileQualityApi';

const mock = new MockAdapter(axios);

describe('profileQualityApi', () => {
  afterEach(() => {
    mock.reset();
  });

  it('chiama la API con i parametri corretti e restituisce i dati', async () => {
    const responseData: ProfileQualityListResponse = {
      items: [
        {
          id: 'p1',
          nome: 'Mario Rossi',
          tipo: 'PROFESSIONISTA',
          completezza: 100,
          statoQualita: 'OK',
          campiMancanti: []
        }
      ],
      total: 1
    };

    mock
      .onGet('/api/profile-quality', {
        params: {
          tipo: 'PROFESSIONISTA',
          minCompletezza: '80',
          orderBy: 'nome',
          order: 'asc'
        }
      })
      .reply(200, responseData);

    const result = await fetchProfileQualityList({
      tipo: 'PROFESSIONISTA',
      livelloCompletezza: 'ALTA',
      orderBy: 'nome',
      order: 'asc'
    });

    expect(result).toEqual(responseData);
  });
});
