// app/config.ts
import * as Network from 'expo-network';

export const getApiUrl = async () => {
  try {
    const ip = await Network.getIpAddressAsync(); // Detecta la IP local automáticamente
    return `http://${ip}:4000/api/auth`;
  } catch (err) {
    console.warn("No se pudo obtener la IP local:", err);
    return "http://localhost:4000/api/auth"; // Fallback
  }
};
