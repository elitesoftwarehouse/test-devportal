import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import companyOnboardingRoutes from "./routes/companyOnboarding.routes";
// ... altri import esistenti

const app = express();

app.use(cors());
app.use(bodyParser.json());

// ... altre route esistenti
app.use("/api", companyOnboardingRoutes);

// ... export / error handler esistenti
export default app;
