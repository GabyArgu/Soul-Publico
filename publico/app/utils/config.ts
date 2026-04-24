// app/utils/config.ts

// La URL base que te da ngrok (CAMBIALA SOLO AQUÍ)
const BASE_NGROK = "https://9e10-2800-b20-111a-4f8d-21f4-fd73-459d-9904.ngrok-free.app";

// Exportamos las dos versiones para que las uses según necesites
export const API_URL = `${BASE_NGROK}/api`;
export const AUTH_API_URL = `${BASE_NGROK}/api/auth`;

export default {
    API_URL,
    AUTH_API_URL
};