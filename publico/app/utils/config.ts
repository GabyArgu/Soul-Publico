// app/utils/config.ts

// La URL base que te da ngrok (CAMBIALA SOLO AQUÍ)
const BASE_NGROK = "https://efb6-2800-b20-111a-4f8d-d970-1cf3-fd4b-9f52.ngrok-free.app";

// Exportamos las dos versiones para que las uses según necesites
export const API_URL = `${BASE_NGROK}/api`;
export const AUTH_API_URL = `${BASE_NGROK}/api/auth`;