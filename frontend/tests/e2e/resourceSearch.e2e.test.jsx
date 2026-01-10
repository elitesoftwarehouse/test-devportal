import React from "react";
import { render, screen, waitFor, fireEvent, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { rest } from "msw";
import { setupServer } from "msw/node";
import ResourceSearchPage from "../pages/ResourceSearchPage";

// Mock server per simulare backend ricerca risorse
const apiUrl = "http://localhost/api/resources";

const mockResources = [
  {
    id: 1,
    name: "Mario Rossi",
    role: "Developer",
    skills: ["React", "Node.js", "TypeScript"],
  },
  {
    id: 2,
    name: "Maria Bianchi",
    role: "Project Manager",
    skills: ["Agile", "Scrum", "Communication"],
  },
  {
    id: 3,
    name: "Marco Verdi",
    role: "Developer",
    skills: ["Java", "Spring", "SQL"],
  },
  {
    id: 4,
    name: "Anna Neri",
    role: "UX Designer",
    skills: ["Figma", "UX Research", "Prototyping"],
  },
];

const server = setupServer(
  rest.get(apiUrl, (req, res, ctx) => {
    const search = (req.url.searchParams.get("search") || "").toLowerCase();
    const role = req.url.searchParams.get("role") || "";
    const skillsRaw = req.url.searchParams.get("skills") || "";
    const page = parseInt(req.url.searchParams.get("page") || "1", 10);
    const pageSize = parseInt(req.url.searchParams.get("pageSize") || "10", 10);

    const selectedSkills = skillsRaw ? skillsRaw.split(",") : [];

    let results = mockResources.filter((r) => {
      const matchesName = !search || r.name.toLowerCase().includes(search);
      const matchesRole = !role || r.role === role;
      const matchesSkills =
        selectedSkills.length === 0 ||
        selectedSkills.some((s) => r.skills.includes(s)); // comportamento OR
      return matchesName && matchesRole && matchesSkills;
    });

    const total = results.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    results = results.slice(start, end);

    return res(
      ctx.status(200),
      ctx.json({
        data: results,
        pagination: {
          page,
          pageSize,
          total,
        },
      })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("ResourceSearchPage - test funzionali UI base", () => {
  test("ricerca per nome con match parziale e combinazione con ruolo", async () => {
    render(<ResourceSearchPage />);

    const nameInput = screen.getByPlaceholderText(/cerca per nome/i);
    fireEvent.change(nameInput, { target: { value: "Mar" } });

    // attesa risultati per solo nome
    await waitFor(() => {
      expect(screen.getByText("Mario Rossi")).toBeInTheDocument();
      expect(screen.getByText("Maria Bianchi")).toBeInTheDocument();
      expect(screen.getByText("Marco Verdi")).toBeInTheDocument();
    });

    // ora filtro anche per ruolo Developer
    const roleSelect = screen.getByLabelText(/ruolo/i);
    fireEvent.change(roleSelect, { target: { value: "Developer" } });

    await waitFor(() => {
      expect(screen.getByText("Mario Rossi")).toBeInTheDocument();
      expect(screen.getByText("Marco Verdi")).toBeInTheDocument();
      // Project Manager non dovrebbe essere visibile
      expect(screen.queryByText("Maria Bianchi")).not.toBeInTheDocument();
    });
  });

  test("multi selezione skills e deselezione con comportamento OR", async () => {
    render(<ResourceSearchPage />);

    // apri selettore skills (assumiamo sia un multi-select con label "Skills")
    const skillsSelect = screen.getByLabelText(/skills/i);

    // seleziono React e SQL
    fireEvent.change(skillsSelect, { target: { value: "React" } });
    // simuliamo multi-selezione aggiungendo un secondo change
    fireEvent.change(skillsSelect, { target: { value: "SQL" } });

    await waitFor(() => {
      expect(screen.getByText("Mario Rossi")).toBeInTheDocument();
      expect(screen.getByText("Marco Verdi")).toBeInTheDocument();
      // gli altri non hanno React o SQL
      expect(screen.queryByText("Maria Bianchi")).not.toBeInTheDocument();
      expect(screen.queryByText("Anna Neri")).not.toBeInTheDocument();
    });
  });

  test("visualizzazione stato 'nessun risultato'", async () => {
    render(<ResourceSearchPage />);

    const nameInput = screen.getByPlaceholderText(/cerca per nome/i);
    fireEvent.change(nameInput, { target: { value: "Zyxw" } });

    await waitFor(() => {
      expect(screen.getByText(/nessuna risorsa trovata/i)).toBeInTheDocument();
    });
  });

  test("gestione errore API con messaggio utente", async () => {
    server.use(
      rest.get(apiUrl, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    render(<ResourceSearchPage />);

    await waitFor(() => {
      expect(
        screen.getByText(/errore durante il caricamento delle risorse/i)
      ).toBeInTheDocument();
    });
  });

  test("paginazione: cambio pagina aggiorna i risultati", async () => {
    // configuriamo il server per un pageSize=2 per testare facilmente la paginazione
    server.use(
      rest.get(apiUrl, (req, res, ctx) => {
        const page = parseInt(req.url.searchParams.get("page") || "1", 10);
        const pageSize = 2;
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const total = mockResources.length;
        const results = mockResources.slice(start, end);
        return res(
          ctx.status(200),
          ctx.json({ data: results, pagination: { page, pageSize, total } })
        );
      })
    );

    render(<ResourceSearchPage />);

    // pagina 1
    await waitFor(() => {
      expect(screen.getByText("Mario Rossi")).toBeInTheDocument();
      expect(screen.getByText("Maria Bianchi")).toBeInTheDocument();
    });

    const nextPageButton = screen.getByRole("button", { name: /pagina successiva/i });
    fireEvent.click(nextPageButton);

    await waitFor(() => {
      expect(screen.getByText("Marco Verdi")).toBeInTheDocument();
      expect(screen.getByText("Anna Neri")).toBeInTheDocument();
      expect(screen.queryByText("Mario Rossi")).not.toBeInTheDocument();
    });
  });
});
