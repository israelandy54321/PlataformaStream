import { startFFmpeg, stopFFmpeg } from "../services/ffmpeg.js";
import { createToken } from "../services/livekit.js";

export const startStream = (req, res) => {
  const { platform } = req.body; // youtube / facebook
  startFFmpeg(platform);
  res.json({ message: `Transmisión iniciada en ${platform}` });
};

export const stopStream = (req, res) => {
  stopFFmpeg();
  res.json({ message: "Transmisión detenida" });
};

export const generateToken = (req, res) => {
  console.log("LIVEKIT_API_KEY:", process.env.LIVEKIT_API_KEY);
  console.log("LIVEKIT_API_SECRET:", process.env.LIVEKIT_API_SECRET);
  const { roomName, identity } = req.query;
  const token = createToken(roomName, identity);
  res.json({ token });
};
