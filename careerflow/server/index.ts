import { join } from "node:path";
import { createApp } from "./app.js";

const port = Number(process.env.PORT ?? 3000);
const databasePath = process.env.DATABASE_PATH ?? join(process.cwd(), "data", "careerflow.db");
const application = createApp(databasePath);

application.listen(port);
console.log(`CareerFlow API running at http://127.0.0.1:${port}`);
