import express from "express";
import { startStream, stopStream, generateToken } from "../controllers/streamController.js";

const router = express.Router();

router.post("/start", startStream);      // Inicia transmisión
router.post("/stop", stopStream);        // Detiene transmisión
router.get("/token", generateToken);     // Genera token de invitado

export default router;
