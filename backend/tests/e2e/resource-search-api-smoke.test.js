/*
 * Test di smoke molto semplici per verificare che l'endpoint di ricerca risorse
 * risponda correttamente a livello di struttura dati, da usare come base per i test
 * funzionali UI. Adatta l'URL e l'import dell'app in base alla struttura esistente.
 */

const request = require("supertest");
const app = require("../../src/app"); // ipotesi percorso app Express esistente

describe("GET /api/resources - smoke test per supporto UI ricerca", () => {
  it("dovrebbe rispondere con 200 e struttura dati prevista", async () => {
    const res = await request(app)
      .get("/api/resources")
      .query({ search: "Mar", role: "", skills: "", page: 1, pageSize: 10 })
      .expect(200);

    expect(res.body).toHaveProperty("data");
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body).toHaveProperty("pagination");
    expect(res.body.pagination).toHaveProperty("page");
    expect(res.body.pagination).toHaveProperty("pageSize");
    expect(res.body.pagination).toHaveProperty("total");
  });

  it("dovrebbe gestire filtri ruolo e skills senza errori server", async () => {
    const res = await request(app)
      .get("/api/resources")
      .query({ search: "", role: "Developer", skills: "React,SQL", page: 1, pageSize: 10 })
      .expect(200);

    expect(res.body).toHaveProperty("data");
  });
});
