import { spawn } from "child_process";
import { rtmpConfig } from "../config/rtmpConfig.js";

let ffmpegProcess = null;

export const startFFmpeg = (platform) => {
  const url = rtmpConfig[platform];
  if (!url) throw new Error("Plataforma no soportada");

  ffmpegProcess = spawn("ffmpeg", [
    "-re", "-i", "rtmp://localhost/live/room",  // entrada (desde LiveKit relay)
    "-c:v", "libx264", "-preset", "veryfast",
    "-c:a", "aac", "-b:a", "128k",
    "-f", "flv", url
  ]);

  ffmpegProcess.stdout.on("data", (d) => console.log("ffmpeg:", d.toString()));
  ffmpegProcess.stderr.on("data", (d) => console.error("ffmpeg err:", d.toString()));
};

export const stopFFmpeg = () => {
  if (ffmpegProcess) {
    ffmpegProcess.kill("SIGINT");
    ffmpegProcess = null; //hola
  }
};
