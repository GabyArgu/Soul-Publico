# 🌟 SOUL - App Pública (React Native)

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![SQL Server](https://img.shields.io/badge/SQL_Server-CC2927?style=for-the-badge&logo=microsoft-sql-server&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

---

## 📋 Descripción

**SOUL** es la **aplicación pública** para que los estudiantes gestionen y sigan sus proyectos universitarios desde dispositivos móviles.  
Incluye frontend en **React Native (Expo)** y backend en **Node.js (Express)**, con base de datos **SQL Server** y API propia en `server/`.

La comunicación con el backend se realiza vía **API REST**, configurada dinámicamente usando **ngrok**.

---

## 🚀 Características Principales

- Registro y envío de proyectos.
- Seguimiento del estado y retroalimentación.
- Perfil de usuario editable.
- Notificaciones automáticas.
- Seguridad mediante JWT y validaciones.

---

## 🛠️ Tecnologías Utilizadas

### **Frontend (React Native)**

- React Native + Expo
- React Navigation
- Axios
- Context API / Estado global
- Estilos con Tailwind / NativeWind

### **Backend (Node.js / Express)**

- Node.js + Express
- SQL Server (mssql)
- JWT para autenticación
- Validaciones y seguridad

---

## ⚙️ Arquitectura General

```text
Frontend (React Native - Expo)
        │
        ▼
Backend (Node.js + Express - server/)
        │
        ▼
Base de Datos (SQL Server)
```

---

## 📦 Instalación y Ejecución

### 🧾 Prerrequisitos

Asegúrate de tener instalado:

- Node.js 18+
- npm o yarn
- Expo CLI (`npm install -g expo-cli`)
- SQL Server
- ngrok (para exponer localmente la API)

---

### 🔹 1. Clonar el Repositorio

```bash
git clone https://github.com/GabyArgu/Soul-Publico
cd soul-app
```

---

### 🔹 2. Configurar URL de API con ngrok

1. Levanta el backend en `server/`:

```bash
cd server
npm install
npm run dev
```

2. Inicia ngrok en el puerto del backend (por ejemplo, 4000):

```bash
ngrok http 4000
```

3. Copia la URL que ngrok te da (ej: `https://efb6-2800-b20-111a-4f8d-d970-1cf3-fd4b-9f52.ngrok-free.app`) y reemplaza en:

```javascript
API_URL = "AQUI/api";
```

```text
recomendado usar la funcion de buscar y remplazar de visual
```

---

### 🔹 3. Instalar dependencias Frontend

```bash
cd ../
npm install
```

---

### 🔹 4. Ejecutar la App (React Native / Expo)

```bash
npm start
```

Luego escanea el **código QR** con **Expo Go** o ejecuta en un emulador Android/iOS.

---

## 👤 Credenciales de Prueba

```text
Usuario: MM230483
Contraseña: 1234
```

---

## 🔐 Seguridad

- Autenticación JWT
- Validación de entradas en frontend y backend
- Hash de contraseñas con **bcrypt**
- Protección contra inyección SQL
- Configuración de CORS segura

---

## 📊 Módulos Principales

- 🎯 Proyectos recomendado con machine learneing
- 🎓 Gestión de perfil
- 🔔 Sistema de Notificaciones
- 🔐 Aplicar a proyectos o crearlos

---

## 💻 Enlace del Proyecto

📦 [Repositorio SOUL App en GitHub](https://github.com/GabyArgu/Soul-Publico)

---

## 👥 Equipo de Desarrollo

| Integrante      | Rol      | Responsabilidad                  |
| --------------- | -------- | -------------------------------- |
| Gabriela Méndez | Frontend | Desarrollo móvil y diseño UI     |
| Milton Flores   | Backend  | API REST, base de datos y Docker |

---

## 🧠 Lecciones Aprendidas

- Integración de React Native con APIs REST en Node.js.
- Uso de ngrok para exponer localmente la API a dispositivos móviles.
- Manejo de autenticación JWT y seguridad básica.
- Buenas prácticas de documentación y organización de proyectos.

---

## 📘 Licencia

Este proyecto está bajo la licencia **MIT**.  
Puedes usarlo, modificarlo y distribuirlo libremente dando crédito a los autores.
