// app/utils/config.ts

// La URL base que te da ngrok (CAMBIALA SOLO AQUÍ)
const BASE_NGROK = "https://b613-2800-b20-111a-4f8d-59f0-1d50-2c18-ac8.ngrok-free.app";

// Exportamos las dos versiones para que las uses según necesites
export const API_URL = `${BASE_NGROK}/api`;
export const AUTH_API_URL = `${BASE_NGROK}/api/auth`;

export default {
    API_URL,
    AUTH_API_URL
};