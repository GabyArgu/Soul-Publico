import React, { createContext, useContext, useState, ReactNode } from "react";

export interface UserCreation {
  nombre?: string;
  carnet?: string;
  genero?: "M" | "F" | "O"; 
  fechaNacimiento?: string; // iso string
  email?: string;
  departamento?: string;
  municipio?: string;
  telefono?: string;
  carrera?: string;
  unidades?: string;
  idioma?: string;
  nivel?: string;
  habilidadesTecnicas?: string;
  habilidadesBlandas?: string;
  transportarse?: boolean;
  horario?: string;
  cv?: string;
  password?: string;
  confirmPassword?: string;
}

// 2. Definir tipo del contexto
interface UserCreationContextType {
  user: UserCreation;
  setUser: React.Dispatch<React.SetStateAction<UserCreation>>;
}

// 3. Crear contexto
const UserCreationContext = createContext<UserCreationContextType | undefined>(undefined);

// 4. Provider
export const UserCreationProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserCreation>({});
  return (
    <UserCreationContext.Provider value={{ user, setUser }}>
      {children}
    </UserCreationContext.Provider>
  );
};

// 5. Hook para usar el contexto
export const useUserCreation = () => {
  const context = useContext(UserCreationContext);
  if (!context) throw new Error("useUserCreation debe usarse dentro de UserCreationProvider");
  return context;
};