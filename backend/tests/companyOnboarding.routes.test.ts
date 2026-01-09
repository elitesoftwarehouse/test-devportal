import request from "supertest";
import app from "../src/app";

// Helper per creare un token fake o mockare authMiddleware se nel progetto si usa un approccio diverso

describe("Company Onboarding Routes", () => {
  it("dovrebbe rifiutare accesso senza autenticazione", async () => {
    const res = await request(app).get("/api/me/onboarding/company");
    expect(res.status).toBe(401);
  });

  // Per test più approfonditi sarebbe necessario mockare authMiddleware e db,
  // seguendo i pattern già presenti nel progetto.
});
