import jwt from "jsonwebtoken";

export const createToken = (roomName, identity) => {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  console.log("🔑 createToken() -> apiKey:", apiKey);
  console.log("🔑 createToken() -> apiSecret:", apiSecret ? "OK" : "MISSING");

  if (!apiKey || !apiSecret) {
    return null; // en vez de lanzar throw, devolvemos null
  }

  const payload = {
    sub: identity,
    room: roomName,
    iss: apiKey,       // API Key como issuer
  };

  const token = jwt.sign(payload, apiSecret, {
    algorithm: "HS256",
    expiresIn: "1h",
  });

  return token;
};
