import express from "express";
import convertRoutes from "./routes/convert.routes";
import notesRoutes from "./routes/notes.routes";

const app = express();

//app.use(cors());
app.use(express.json());

// Prefijo de API
app.use("/convert", convertRoutes);
app.use("/notes", notesRoutes);


export default app;
