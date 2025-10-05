// utils/session.ts
import * as SecureStore from 'expo-secure-store';
import React from 'react';

export interface UserData {
    carnet: string;
    nombreCompleto: string;
    genero: string;
    id: number;
    email: string;
    urlCv: string;
}

// Funciones existentes (manteniendo tus exports nombrados)
export async function getUserData(): Promise<UserData | null> {
    try {
        const data = await SecureStore.getItemAsync('userData');
        return data ? JSON.parse(data) : null;
    } catch (err) {
        console.error("Error al obtener datos de usuario:", err);
        return null;
    }
}

export async function setUserData(userData: UserData): Promise<void> {
    try {
        await SecureStore.setItemAsync('userData', JSON.stringify(userData));
    } catch (err) {
        console.error("Error al guardar datos de usuario:", err);
    }
}

export async function clearUserData(): Promise<void> {
    try {
        await SecureStore.deleteItemAsync('userData');
    } catch (err) {
        console.error("Error al limpiar datos de usuario:", err);
    }
}

// Componente por defecto para Expo Router
const SessionUtils = () => {
    // Este componente no renderiza nada, solo sirve para export default
    return null;
};

export default SessionUtils; 