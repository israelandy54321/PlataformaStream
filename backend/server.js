import express from "express";
import dotenv from "dotenv";
import streamRoutes from "./routes/stream.js";
import { errorHandler } from "./utils/errorHandler.js";



dotenv.config();

const app = express();
app.use(express.json());

// Rutas principales
app.use("/api/stream", streamRoutes);

// Middleware de errores
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend corriendo en http://localhost:${PORT}`);
});
