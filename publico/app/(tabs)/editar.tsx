// app/(main)/EditarPerfil.tsx
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import * as DocumentPicker from "expo-document-picker";
import * as SecureStore from 'expo-secure-store';
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-root-toast";
import { getUserData, UserData } from '../utils/session';

// Interfaces para los datos
interface Usuario {
    nombreCompleto: string;
    carnet: string;
    email: string;
    fechaNacimiento: string;
    telefono: string;
    departamento: string;
    municipio: string;
    carrera: string;
    uvs: number;
    disponibilidad: string;
    urlCv: string;
    genero: string;
    tieneTransporte: boolean;
}

interface Carrera {
    idCarrera: number;
    nombre: string;
}

interface Departamento {
    idDepartamento: number;
    nombre: string;
}

interface Municipio {
    idMunicipio: number;
    nombre: string;
    idDepartamento: number;
}

interface Idioma {
    idIdioma: number;
    nombre: string;
}

interface Nivel {
    idINivel: number;
    nombre: string;
}

interface Habilidad {
    idHabilidad: number;
    nombre: string;
    tipo: string;
}

interface Disponibilidad {
    idDisponibilidad: number;
    nombre: string;
}

export default function EditarPerfil() {
    const router = useRouter();
    const API_URL = "https://888f4c9ee1eb.ngrok-free.app/api";

    // Estados para datos de usuario
    const [userData, setUserData] = useState<UserData | null>(null);

    // Estados para datos de API
    const [carreras, setCarreras] = useState<Carrera[]>([]);
    const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
    const [municipios, setMunicipios] = useState<Municipio[]>([]);
    const [idiomas, setIdiomas] = useState<Idioma[]>([]);
    const [niveles, setNiveles] = useState<Nivel[]>([]);
    const [habilidades, setHabilidades] = useState<Habilidad[]>([]);
    const [disponibilidades, setDisponibilidades] = useState<Disponibilidad[]>([]);

    // Estados del formulario
    const [nombre, setNombre] = useState("");
    const [carrera, setCarrera] = useState("");
    const [correo, setCorreo] = useState("");
    const [carnet, setCarnet] = useState("");
    const [cumple, setCumple] = useState<Date | null>(null);
    const [showCumple, setShowCumple] = useState(false);
    const [fechaTexto, setFechaTexto] = useState(""); // NUEVO: para entrada de texto de fecha
    const [unidades, setUnidades] = useState("");
    const [telefono, setTelefono] = useState("");
    const [departamento, setDepartamento] = useState("");
    const [municipio, setMunicipio] = useState("");
    const [transporte, setTransporte] = useState(false);
    const [disponibilidad, setDisponibilidad] = useState("");
    const [cv, setCv] = useState<any>(null);
    const [cargando, setCargando] = useState(true);

    // Estados para habilidades
    const [inputHabilidadTecnica, setInputHabilidadTecnica] = useState("");
    const [inputHabilidadBlanda, setInputHabilidadBlanda] = useState("");
    const [habilidadesTecnicas, setHabilidadesTecnicas] = useState<Habilidad[]>([]);
    const [habilidadesBlandas, setHabilidadesBlandas] = useState<Habilidad[]>([]);
    const [sugerenciasTecnicas, setSugerenciasTecnicas] = useState<Habilidad[]>([]);
    const [sugerenciasBlandas, setSugerenciasBlandas] = useState<Habilidad[]>([]);
    const [creandoHabilidad, setCreandoHabilidad] = useState<"Técnica" | "Blanda" | null>(null); // NUEVO: estado para crear habilidades

    // Estados para idiomas
    const [idiomasSeleccionados, setIdiomasSeleccionados] = useState<{ idIdioma: number, idINivel: number }[]>([]);
    const [modalIdiomasVisible, setModalIdiomasVisible] = useState(false);

    
    // Estado para errores
    const [errores, setErrores] = useState<string[]>([]);

    // Posición de sugerencias
    const [layoutTecnicas, setLayoutTecnicas] = useState({ y: 0, width: 0 });
    const [layoutBlandas, setLayoutBlandas] = useState({ y: 0, width: 0 });

    // Cargar datos del usuario logeado
    useEffect(() => {
        const loadUser = async () => {
            const data = await getUserData();
            if (data) {
                setUserData(data);
                setCarnet(data.carnet); // Precargar carnet del usuario logueado
            } else {
                router.replace('/(auth)/LoginScreen');
            }
        };
        loadUser();
    }, []);

    // Cargar datos desde API cuando userData esté disponible
    useEffect(() => {
        if (userData?.carnet) {
            cargarDatosIniciales();
        }
    }, [userData]);

    // Cargar datos desde API
    const cargarDatosIniciales = async () => {
        try {
            setCargando(true);

            // Cargar todos los datos necesarios
            const [
                carrerasRes,
                departamentosRes,
                idiomasRes,
                nivelesRes,
                habilidadesRes,
                disponibilidadesRes
            ] = await Promise.all([
                axios.get(`${API_URL}/carreras`),
                axios.get(`${API_URL}/departamentos`),
                axios.get(`${API_URL}/idiomas`),
                axios.get(`${API_URL}/niveles`),
                axios.get(`${API_URL}/habilidades`),
                axios.get(`${API_URL}/disponibilidad`).catch(() => {
                    return { data: [] };
                })
            ]);

            setCarreras(carrerasRes.data || []);
            setDepartamentos(departamentosRes.data || []);
            setIdiomas(idiomasRes.data || []);
            setNiveles(nivelesRes.data || []);
            setHabilidades(habilidadesRes.data || []);
            setDisponibilidades(disponibilidadesRes.data || []);

            // Cargar datos del usuario DESPUÉS de tener todos los catálogos
            await cargarDatosUsuario();

        } catch (error) {
            console.error("❌ Error cargando datos iniciales:", error);
            showToast("⚠️ Algunos datos no se cargaron correctamente");
        } finally {
            setCargando(false);
        }
    };

    // Cargar municipios cuando cambie el departamento
    useEffect(() => {
        if (departamento) {
            cargarMunicipios(Number(departamento));
        } else {
            setMunicipios([]);
            setMunicipio("");
        }
    }, [departamento]);

    // Precargar datos cuando se carguen los catálogos
    useEffect(() => {
        if (userData?.carnet && carreras.length > 0 && departamentos.length > 0 && disponibilidades.length > 0) {
            precargarDatosUsuario();
        }
    }, [carreras, departamentos, disponibilidades, userData]);

    // Sincronizar fecha texto con fecha Date
    useEffect(() => {
        if (cumple) {
            setFechaTexto(cumple.toLocaleDateString('es-ES'));
        }
    }, [cumple]);

    // Debuggear cambios
    useEffect(() => {
    }, [municipios, municipio]);

    useEffect(() => {
    }, [departamento]);

    // Función para eliminar acentos
    const eliminarAcentos = (texto: string) => {
        return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };

    // Función mejorada para cargar municipios
    const cargarMunicipios = async (idDepartamento: number) => {
        try {
            const response = await axios.get(`${API_URL}/municipios/${idDepartamento}`);
            const municipiosCargados = response.data || [];
            setMunicipios(municipiosCargados);
            return municipiosCargados;
        } catch (error) {
            setMunicipios([]);
            return [];
        }
    };

    // Función mejorada para buscar municipio
    const buscarMunicipioUsuario = async (nombreMunicipio?: string) => {
        if (!nombreMunicipio) {
            // Si no tenemos nombre, cargar datos del usuario
            try {
                const usuarioResponse = await axios.get(`${API_URL}/usuarios/${userData?.carnet}`);
                nombreMunicipio = usuarioResponse.data.municipio;

            } catch (error) {
                console.error("Error obteniendo datos del usuario:", error);
                return;
            }
        }

        if (!nombreMunicipio || municipios.length === 0) {
            console.log("❌ No hay municipios cargados o nombre vacío");
            return;
        }

        // Búsqueda más flexible
        const municipioEncontrado = municipios.find((m: Municipio) => {
            const municipioNombre = m.nombre.trim().toLowerCase();
            const buscado = nombreMunicipio.trim().toLowerCase();

            return municipioNombre === buscado ||
                municipioNombre.includes(buscado) ||
                buscado.includes(municipioNombre) ||
                eliminarAcentos(municipioNombre) === eliminarAcentos(buscado);
        });

        if (municipioEncontrado) {
            setMunicipio(municipioEncontrado.idMunicipio.toString());
        } else {
            console.log("❌ Municipio no encontrado:", nombreMunicipio);
            // Intentar una segunda búsqueda más agresiva después de un delay
            setTimeout(() => {
                buscarMunicipioAgresiva(nombreMunicipio);
            }, 1000);
        }
    };

    // Función auxiliar para búsqueda agresiva
    const buscarMunicipioAgresiva = (nombreMunicipio: string) => {
        if (municipios.length === 0) return;

        const municipioEncontrado = municipios.find((m: Municipio) => {
            const municipioNombre = eliminarAcentos(m.nombre.trim().toLowerCase());
            const buscado = eliminarAcentos(nombreMunicipio.trim().toLowerCase());

            // Búsqueda más permisiva
            return municipioNombre === buscado ||
                municipioNombre.replace(/\s/g, '') === buscado.replace(/\s/g, '') ||
                municipioNombre.startsWith(buscado) ||
                buscado.startsWith(municipioNombre);
        });

        if (municipioEncontrado) {
            setMunicipio(municipioEncontrado.idMunicipio.toString());
        }
    };

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({ type: "application/pdf" });
            if (!result.canceled) {
                setCv(result.assets[0]);
                showToast("📄 Archivo seleccionado: " + result.assets[0].name, true);
            }
        } catch (error) {
            console.error(error);
            showToast("❌ Error al seleccionar archivo");
        }
    };

    const uploadCv = async () => {
        if (!cv) throw new Error("No se seleccionó CV");

        const formData = new FormData();
        formData.append("cv", {
            uri: cv.uri,
            name: cv.name || "documento.pdf",
            type: "application/pdf",
        } as any);

        try {
            const res = await axios.post(`${API_URL}/cv`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                timeout: 30000,
            });

            console.log("✅ Respuesta del servidor:", res.data);
            return res.data.url;
        } catch (error: any) {
            console.error("❌ Error en uploadCv:", error.response?.data || error.message);
            throw error;
        }
    };

    // Función mejorada para cargar habilidades
    const cargarHabilidadesUsuario = async (carnetUsuario: string) => {
        try {
            const response = await axios.get(`${API_URL}/usuarios/${carnetUsuario}/habilidades`);
            if (response.data) {
                const tecnicas = response.data.filter((h: Habilidad) => h.tipo === "Técnica");
                const blandas = response.data.filter((h: Habilidad) => h.tipo === "Blanda");

                setHabilidadesTecnicas(tecnicas);
                setHabilidadesBlandas(blandas);
            }
        } catch (error) {
            console.error("Error cargando habilidades:", error);
        }
    };

    // Función mejorada para cargar idiomas
    const cargarIdiomasUsuario = async (carnetUsuario: string) => {
        try {
            const response = await axios.get(`${API_URL}/usuarios/${carnetUsuario}/idiomas`);

            if (response.data && response.data.length > 0) {
                const idiomasConNiveles = response.data.map((item: any) => ({
                    idIdioma: item.idIdioma,
                    idINivel: item.idINivel
                }));
                setIdiomasSeleccionados(idiomasConNiveles);
            } else {
                setIdiomasSeleccionados([]);
            }
        } catch (error) {
            console.error("❌ Error cargando idiomas:", error);
            setIdiomasSeleccionados([]);
            showToast("⚠️ No se pudieron cargar los idiomas, pero puedes continuar");
        }
    };

    // FUNCIÓN MEJORADA PARA PRECARGAR DATOS
    const precargarDatosUsuario = async () => {
        if (!userData?.carnet) return;

        try {
            const usuarioResponse = await axios.get(`${API_URL}/usuarios/${userData.carnet}`);
            const usuarioData = usuarioResponse.data;


            // Carrera
            if (usuarioData.carrera && carreras.length > 0) {
                const carreraEncontrada = carreras.find(c =>
                    c.nombre.trim().toLowerCase() === usuarioData.carrera.trim().toLowerCase()
                );
                if (carreraEncontrada) {
                    setCarrera(carreraEncontrada.idCarrera.toString());
                }
            }

            // Departamento - AHORA ESPERAMOS A QUE SE CARGUEN LOS MUNICIPIOS
            if (usuarioData.idDepartamento) {
                setDepartamento(usuarioData.idDepartamento.toString());

                // Cargar municipios del departamento
                const municipiosCargados = await cargarMunicipios(usuarioData.idDepartamento);

                // Y aquí directamente seteamos el municipio si lo tenemos
                if (usuarioData.idMunicipio) {
                    const existeMunicipio = municipiosCargados.find(
                        (m: Municipio) => m.idMunicipio === usuarioData.idMunicipio
                    );
                    if (existeMunicipio) {
                        setMunicipio(usuarioData.idMunicipio.toString());
                    } else {
                        console.warn("⚠️ Municipio del usuario no encontrado en la lista");
                    }
                }
            }

            // Disponibilidad
            if (usuarioData.disponibilidad && disponibilidades.length > 0) {
                const dispEncontrada = disponibilidades.find(d =>
                    d.nombre.trim().toLowerCase() === usuarioData.disponibilidad.trim().toLowerCase()
                );
                if (dispEncontrada) {
                    setDisponibilidad(dispEncontrada.idDisponibilidad.toString());
                }
            }
        } catch (error) {
            console.error("❌ Error precargando datos:", error);
        }
    };

    // Filtrar habilidades mientras se escribe
    useEffect(() => {
        setSugerenciasTecnicas(
            habilidades.filter(h => h.tipo === "Técnica" &&
                h.nombre.toLowerCase().includes(inputHabilidadTecnica.toLowerCase()) &&
                !habilidadesTecnicas.some(ht => ht.idHabilidad === h.idHabilidad)
            )
        );
    }, [inputHabilidadTecnica, habilidadesTecnicas, habilidades]);

    useEffect(() => {
        setSugerenciasBlandas(
            habilidades.filter(h => h.tipo === "Blanda" &&
                h.nombre.toLowerCase().includes(inputHabilidadBlanda.toLowerCase()) &&
                !habilidadesBlandas.some(hb => hb.idHabilidad === h.idHabilidad)
            )
        );
    }, [inputHabilidadBlanda, habilidadesBlandas, habilidades]);

    const cargarDatosUsuario = async () => {
        try {
            if (!userData?.carnet) {
                showToast("❌ No se pudieron cargar los datos del usuario");
                return;
            }

            await cargarDesdeAPI(userData.carnet);
        } catch (error) {
            console.error("❌ Error cargando datos del usuario:", error);
            showToast("❌ Error cargando datos del usuario");
        }
    };

    const cargarDesdeAPI = async (carnetUsuario: string) => {
        try {
            const respuesta = await axios.get(`${API_URL}/usuarios/${carnetUsuario}`);
            if (respuesta.data) {
                llenarFormularioBasico(respuesta.data);
            }
        } catch (error) {
            console.error("Error cargando desde API:", error);
            showToast("❌ Error cargando datos del servidor");
        }
    };

    const llenarFormularioBasico = async (usuarioData: Usuario) => {
        // Datos básicos
        setNombre(usuarioData.nombreCompleto || "");
        setCorreo(usuarioData.email || "");
        setCarnet(usuarioData.carnet || "");
        setTelefono(usuarioData.telefono || "");
        setUnidades(usuarioData.uvs?.toString() || "0");
        setTransporte(usuarioData.tieneTransporte || false);

        // Cargar CV existente
        if (usuarioData.urlCv) {
            setCv(usuarioData.urlCv);
        }

        // Convertir fecha de nacimiento
        if (usuarioData.fechaNacimiento) {
            try {
                const fecha = new Date(usuarioData.fechaNacimiento);
                if (!isNaN(fecha.getTime())) {
                    setCumple(fecha);
                }
            } catch (error) {
                console.error("Error parseando fecha:", error);
            }
        }

        // Cargar datos adicionales
        await cargarHabilidadesUsuario(usuarioData.carnet);
        await cargarIdiomasUsuario(usuarioData.carnet);
    };

    // Funciones para habilidades
    const agregarHabilidad = (h: Habilidad, tipo: "Técnica" | "Blanda") => {
        if (tipo === "Técnica") {
            setHabilidadesTecnicas([...habilidadesTecnicas, h]);
            setInputHabilidadTecnica("");
        } else {
            setHabilidadesBlandas([...habilidadesBlandas, h]);
            setInputHabilidadBlanda("");
        }
    };

    // NUEVA FUNCIÓN para crear y agregar habilidad
    const crearYAgregarHabilidad = async (tipo: "Técnica" | "Blanda") => {
        const nombreHabilidad = tipo === "Técnica" ? inputHabilidadTecnica : inputHabilidadBlanda;

        if (!nombreHabilidad.trim()) return;

        try {
            setCreandoHabilidad(tipo);

            const response = await axios.post(`${API_URL}/habilidades`, {
                nombre: nombreHabilidad,
                tipo: tipo
            });

            const nuevaHabilidad = response.data;

            // Agregar a la lista de habilidades global
            setHabilidades(prev => [...prev, nuevaHabilidad]);

            // Agregar a las habilidades seleccionadas
            agregarHabilidad(nuevaHabilidad, tipo);

            showToast(`✅ Habilidad "${nombreHabilidad}" creada y agregada`, true);

        } catch (error) {
            console.error("Error creando habilidad:", error);
            showToast("❌ Error al crear la habilidad");
        } finally {
            setCreandoHabilidad(null);
        }
    };

    const eliminarHabilidad = (id: number, tipo: "Técnica" | "Blanda") => {
        if (tipo === "Técnica")
            setHabilidadesTecnicas(habilidadesTecnicas.filter(h => h.idHabilidad !== id));
        else
            setHabilidadesBlandas(habilidadesBlandas.filter(h => h.idHabilidad !== id));
    };

    // Funciones para idiomas y niveles
    const toggleIdiomaNivel = (idIdioma: number, idINivel: number) => {
        const existeIndex = idiomasSeleccionados.findIndex(item => item.idIdioma === idIdioma);

        if (existeIndex !== -1) {
            const nuevosIdiomas = [...idiomasSeleccionados];
            nuevosIdiomas.splice(existeIndex, 1);
            setIdiomasSeleccionados(nuevosIdiomas);
        } else {
            setIdiomasSeleccionados([...idiomasSeleccionados, { idIdioma, idINivel }]);
        }
    };

    const actualizarNivelIdioma = (idIdioma: number, idINivel: number) => {
        const nuevosIdiomas = idiomasSeleccionados.map(item =>
            item.idIdioma === idIdioma ? { ...item, idINivel } : item
        );
        setIdiomasSeleccionados(nuevosIdiomas);
    };

    const getIdiomasTexto = () => {
        if (idiomasSeleccionados.length === 0) return "Idiomas y niveles (opcional)";
        return `${idiomasSeleccionados.length} idioma(s) seleccionado(s)`;
    };

    // Validaciones
    const validarTelefono = (text: string) => {
        if (/^\d{0,4}-?\d{0,4}$/.test(text)) {
            if (text.length === 4 && !text.includes("-")) {
                setTelefono(text + "-");
            } else {
                setTelefono(text);
            }
        }
    };

    // Función para procesar fecha desde texto
    const procesarFechaDesdeTexto = (text: string) => {
        setFechaTexto(text);

        // Intentar parsear la fecha mientras se escribe
        if (text.length === 10) { // DD/MM/AAAA
            const parts = text.split('/');
            if (parts.length === 3) {
                const day = parseInt(parts[0]);
                const month = parseInt(parts[1]) - 1; // Meses son 0-indexed
                const year = parseInt(parts[2]);

                if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                    const newDate = new Date(year, month, day);
                    if (!isNaN(newDate.getTime())) {
                        setCumple(newDate);
                        return;
                    }
                }
            }
        }

        // Si no se pudo parsear, limpiar la fecha
        if (text.length === 0) {
            setCumple(null);
        }
    };

    const validarFormulario = () => {
        const nuevosErrores: string[] = [];

        if (!nombre) nuevosErrores.push("Nombre");
        if (!carrera) nuevosErrores.push("Carrera");
        if (!correo) nuevosErrores.push("Correo");
        if (!cumple) nuevosErrores.push("Fecha de cumpleaños");
        if (!unidades) nuevosErrores.push("Unidades");
        if (!telefono) nuevosErrores.push("Teléfono");
        if (!departamento) nuevosErrores.push("Departamento");
        if (!municipio) nuevosErrores.push("Municipio");
        if (!disponibilidad) nuevosErrores.push("Disponibilidad");

        // Validaciones de formato
        if (telefono && !/^\d{4}-\d{4}$/.test(telefono)) nuevosErrores.push("Teléfono debe tener formato 0000-0000");
        if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) nuevosErrores.push("Correo electrónico válido");

        setErrores(nuevosErrores);
        return nuevosErrores.length === 0;
    };

    // Toast personalizado
    const showToast = (message: string, success: boolean = false) => {
        Toast.show(message, {
            duration: 3000,
            position: Toast.positions.TOP,
            shadow: true,
            animation: true,
            hideOnPress: true,
            backgroundColor: success ? "#4CAF50" : "#E53935",
            textColor: "#fff",
            opacity: 0.95,
            containerStyle: { borderRadius: 10, paddingHorizontal: 15, paddingVertical: 10, marginTop: 60, alignSelf: "center" },
            textStyle: { fontFamily: "Inter-Medium", fontSize: 14 },
        });
    };

    const handleSubmit = async () => {
        // Validar primero
        if (!validarFormulario()) {
            showToast(`⚠️ Completa los campos requeridos`);
            return;
        }

        try {
            // 1️⃣ Subir CV
            let urlCvFinal = "";
            if (cv && cv.uri) {
                urlCvFinal = await uploadCv();
            } else if (cv) {
                urlCvFinal = cv;
            }

            // 2️⃣ Preparar arrays de idiomas y niveles para múltiples selecciones
            const idIdiomas = idiomasSeleccionados.map(item => item.idIdioma);
            const idNiveles = idiomasSeleccionados.map(item => item.idINivel);

            // 3️⃣ Preparar datos para actualizar - INCLUYENDO EL NUEVO CARNET
            const datosActualizacion = {
                nombre,
                genero: userData?.genero || "O",
                fechaNacimiento: cumple?.toISOString().split("T")[0],
                email: correo,
                telefono,
                departamento: Number(departamento),
                municipio: Number(municipio),
                idCarrera: Number(carrera),
                uvs: parseInt(unidades),
                idIdioma: idIdiomas,
                idNivel: idNiveles,
                idHorario: Number(disponibilidad),
                habilidadesTecnicas: habilidadesTecnicas.map(h => h.idHabilidad).join(","),
                habilidadesBlandas: habilidadesBlandas.map(h => h.idHabilidad).join(","),
                transportarse: transporte,
                urlCv: urlCvFinal,
                carnet: carnet // <-- AÑADIR ESTO para enviar el nuevo carnet
            };

            console.log("📤 Enviando datos de actualización:", datosActualizacion);

            // 4️⃣ Actualizar usuario en backend
            const respuesta = await axios.put(
                `${API_URL}/usuarios/${userData?.carnet}`,
                datosActualizacion
            );

            console.log("✅ Respuesta del servidor:", respuesta.data);

            // 5️⃣ VERIFICAR SI SE CAMBIÓ EL CARNET
            if (respuesta.data.carnetActualizado || carnet !== userData?.carnet) {
                // Si cambió el carnet, cerrar sesión y redirigir al login
                showToast("✅ Perfil actualizado. Inicia sesión nuevamente con tu nuevo carnet", true);

                // Esperar un poco para que se vea el toast
                setTimeout(() => {
                    // Limpiar datos de sesión y redirigir al login
                    SecureStore.deleteItemAsync("userData");
                    router.replace('/(auth)/LoginScreen');
                }, 2000);
            } else {
                // Si no cambió el carnet, comportamiento normal
                showToast("✅ Perfil actualizado correctamente", true);
                setTimeout(() => router.back(), 1500);
            }

        } catch (error) {
            console.error("❌ Error actualizando perfil:", error);
            showToast("❌ Error actualizando perfil");
        }
    };

    if (cargando) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Cargando datos...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Editar Perfil</Text>
                <Ionicons
                    name="arrow-back"
                    size={28}
                    color="#000"
                    onPress={() => router.back()}
                />
            </View>

            {/* Contenido */}
            <ScrollView style={styles.contentBackground} contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Mostrar errores si existen */}
                {errores.length > 0 && (
                    <View style={styles.erroresContainer}>
                        <Text style={styles.erroresTitle}>Faltan campos por llenar:</Text>
                        {errores.map((error, index) => (
                            <Text key={index} style={styles.errorItem}>• {error}</Text>
                        ))}
                    </View>
                )}

                {/* Nombre */}
                <View style={[styles.inputContainer, { marginTop: 30 }]}>
                    <TextInput
                        style={styles.input}
                        placeholder="Nombre"
                        placeholderTextColor="#666"
                        value={nombre}
                        onChangeText={setNombre}
                    />
                </View>

                {/* Carrera */}
                <View style={styles.inputContainer}>
                    <Picker
                        selectedValue={carrera}
                        onValueChange={setCarrera}
                        style={styles.picker}
                        dropdownIconColor="#213A8E"
                    >
                        <Picker.Item label="Selecciona tu carrera" value="" />
                        {carreras.map(c => (
                            <Picker.Item
                                key={c.idCarrera}
                                label={c.nombre}
                                value={c.idCarrera.toString()}
                            />
                        ))}
                    </Picker>
                </View>

                {/* Correo */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Correo"
                        placeholderTextColor="#666"
                        value={correo}
                        onChangeText={setCorreo}
                        keyboardType="email-address"
                    />
                </View>

                {/* Fila carnet y cumpleaños MEJORADA */}
                <View style={styles.row}>
                    <View style={[styles.inputContainer2, styles.half]}>
                        <TextInput
                            style={styles.input}
                            placeholder="Carnet"
                            placeholderTextColor="#666"
                            value={carnet}
                            onChangeText={setCarnet}
                        />
                    </View>

                    {/* FECHA MEJORADA - CON INPUT DE TEXTO Y PICKER */}
                    <View style={[styles.inputContainer2, styles.half]}>
                        <TextInput
                            style={[styles.input, { flex: 1 }]}
                            placeholder="DD/MM/AAAA"
                            placeholderTextColor="#666"
                            value={fechaTexto}
                            onChangeText={procesarFechaDesdeTexto}
                            keyboardType="numeric"
                        />
                        <TouchableOpacity
                            onPress={() => setShowCumple(true)}
                            style={{ padding: 5 }}
                        >
                            <Ionicons name="calendar-outline" size={22} color="#213A8E" />
                        </TouchableOpacity>
                    </View>

                    {showCumple && (
                        <DateTimePicker
                            value={cumple || new Date()}
                            mode="date"
                            display="spinner"
                            onChange={(event, selectedDate) => {
                                setShowCumple(false);
                                if (selectedDate) {
                                    setCumple(selectedDate);
                                }
                            }}
                        />
                    )}
                </View>

                {/* Fila unidades y teléfono */}
                <View style={styles.row}>
                    <View style={[styles.inputContainer2, styles.half]}>
                        <TextInput
                            style={styles.input}
                            placeholder="Unidades"
                            placeholderTextColor="#666"
                            value={unidades}
                            onChangeText={setUnidades}
                            keyboardType="numeric"
                        />
                    </View>
                    <View style={[styles.inputContainer2, styles.half]}>
                        <TextInput
                            style={styles.input}
                            placeholder="Teléfono"
                            placeholderTextColor="#666"
                            value={telefono}
                            onChangeText={validarTelefono}
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                {/* Departamento */}
                <View style={styles.inputContainer}>
                    <Picker
                        selectedValue={departamento}
                        onValueChange={setDepartamento}
                        style={styles.picker}
                        dropdownIconColor="#213A8E"
                    >
                        <Picker.Item label="Selecciona departamento" value="" />
                        {departamentos.map(d => (
                            <Picker.Item
                                key={d.idDepartamento}
                                label={d.nombre}
                                value={d.idDepartamento.toString()}
                            />
                        ))}
                    </Picker>
                </View>

                {/* Municipio */}
                <View style={styles.inputContainer}>
                    <Picker
                        selectedValue={municipio}
                        onValueChange={setMunicipio}
                        style={styles.picker}
                        dropdownIconColor="#213A8E"
                        enabled={!!departamento && municipios.length > 0}
                    >
                        <Picker.Item
                            label={departamento ? "Selecciona municipio" : "Primero selecciona departamento"}
                            value=""
                        />
                        {municipios.map(m => (
                            <Picker.Item
                                key={m.idMunicipio}
                                label={m.nombre}
                                value={m.idMunicipio.toString()}
                            />
                        ))}
                    </Picker>
                </View>

                {/* Idiomas y Niveles - Selección múltiple */}
                <TouchableOpacity
                    style={styles.inputContainer}
                    onPress={() => setModalIdiomasVisible(true)}
                >
                    <Text style={[styles.input, { color: idiomasSeleccionados.length > 0 ? "#000" : "#666" }]}>
                        {getIdiomasTexto()}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#213A8E" />
                </TouchableOpacity>
                        
                {/* Habilidades técnicas MEJORADAS */}
                <View style={{ zIndex: 1000 }}>
                    <View style={styles.chipsInputContainer} onLayout={(event) => {
                        const { y, width } = event.nativeEvent.layout;
                        setLayoutTecnicas({ y: y + 40, width: width });
                    }}>
                        <View style={styles.chipsContainer}>
                            {habilidadesTecnicas.map(h => (
                                <View key={h.idHabilidad} style={styles.chip}>
                                    <Text style={styles.chipText}>{h.nombre}</Text>
                                    <TouchableOpacity onPress={() => eliminarHabilidad(h.idHabilidad, "Técnica")} style={styles.chipClose}>
                                        <Ionicons name="close-circle" size={16} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                            <TextInput
                                style={styles.chipTextInput}
                                placeholder="Habilidades técnicas"
                                placeholderTextColor="#666"
                                value={inputHabilidadTecnica}
                                onChangeText={setInputHabilidadTecnica}
                            />
                        </View>
                    </View>
                    {inputHabilidadTecnica.length > 0 && (
                        <View style={[styles.suggestionsList, {
                            top: layoutTecnicas.y + 40,
                            width: layoutTecnicas.width,
                            left: 20
                        }]}>
                            <ScrollView style={styles.suggestionsScroll} nestedScrollEnabled={true}>
                                {sugerenciasTecnicas.length > 0 ? (
                                    // Mostrar sugerencias existentes
                                    sugerenciasTecnicas.map(item => (
                                        <TouchableOpacity
                                            key={item.idHabilidad}
                                            onPress={() => agregarHabilidad(item, "Técnica")}
                                            style={styles.suggestionItem}
                                        >
                                            <Text style={styles.suggestionText}>{item.nombre}</Text>
                                        </TouchableOpacity>
                                    ))
                                ) : (
                                    // Mostrar opción para crear nueva habilidad
                                    <TouchableOpacity
                                        onPress={() => crearYAgregarHabilidad("Técnica")}
                                        style={styles.suggestionItem}
                                        disabled={creandoHabilidad === "Técnica"}
                                    >
                                        <Ionicons name="add-circle-outline" size={20} color="#2666DE" />
                                        <Text style={[styles.suggestionText, { marginLeft: 8 }]}>
                                            {creandoHabilidad === "Técnica"
                                                ? "Creando..."
                                                : `Crear "${inputHabilidadTecnica}" como habilidad técnica`}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </ScrollView>
                        </View>
                    )}
                </View>

                {/* Habilidades blandas MEJORADAS */}
                <View style={{ zIndex: 900 }}>
                    <View style={styles.chipsInputContainer} onLayout={(event) => {
                        const { y, width } = event.nativeEvent.layout;
                        setLayoutBlandas({ y: y + 40, width: width });
                    }}>
                        <View style={styles.chipsContainer}>
                            {habilidadesBlandas.map(h => (
                                <View key={h.idHabilidad} style={styles.chip}>
                                    <Text style={styles.chipText}>{h.nombre}</Text>
                                    <TouchableOpacity onPress={() => eliminarHabilidad(h.idHabilidad, "Blanda")} style={styles.chipClose}>
                                        <Ionicons name="close-circle" size={16} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                            <TextInput
                                style={styles.chipTextInput}
                                placeholder="Habilidades blandas"
                                placeholderTextColor="#666"
                                value={inputHabilidadBlanda}
                                onChangeText={setInputHabilidadBlanda}
                            />
                        </View>
                    </View>
                    {inputHabilidadBlanda.length > 0 && (
                        <View style={[styles.suggestionsList, {
                            top: layoutBlandas.y + 40,
                            width: layoutBlandas.width,
                            left: 20
                        }]}>
                            <ScrollView style={styles.suggestionsScroll} nestedScrollEnabled={true}>
                                {sugerenciasBlandas.length > 0 ? (
                                    sugerenciasBlandas.map(item => (
                                        <TouchableOpacity
                                            key={item.idHabilidad}
                                            onPress={() => agregarHabilidad(item, "Blanda")}
                                            style={styles.suggestionItem}
                                        >
                                            <Text style={styles.suggestionText}>{item.nombre}</Text>
                                        </TouchableOpacity>
                                    ))
                                ) : (
                                    <TouchableOpacity
                                        onPress={() => crearYAgregarHabilidad("Blanda")}
                                        style={styles.suggestionItem}
                                        disabled={creandoHabilidad === "Blanda"}
                                    >
                                        <Ionicons name="add-circle-outline" size={20} color="#2666DE" />
                                        <Text style={[styles.suggestionText, { marginLeft: 8 }]}>
                                            {creandoHabilidad === "Blanda"
                                                ? "Creando..."
                                                : `Crear "${inputHabilidadBlanda}" como habilidad blanda`}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </ScrollView>
                        </View>
                    )}
                </View>

                {/* Disponibilidad */}
                <View style={styles.inputContainer}>
                    <Picker
                        selectedValue={disponibilidad}
                        onValueChange={setDisponibilidad}
                        style={styles.picker}
                        dropdownIconColor="#213A8E"
                    >
                        <Picker.Item label="Selecciona disponibilidad" value="" />
                        {disponibilidades.map(d => (
                            <Picker.Item
                                key={d.idDisponibilidad}
                                label={d.nombre}
                                value={d.idDisponibilidad.toString()}
                            />
                        ))}
                    </Picker>
                </View>

                {/* Transporte */}
                <View style={[styles.inputContainer, { justifyContent: "space-between" }]}>
                    <Text style={[styles.input, { color: transporte ? "#000" : "#666" }]}>Transporte</Text>
                    <Switch
                        value={transporte}
                        onValueChange={setTransporte}
                        trackColor={{ false: "#ccc", true: "#2666DE" }}
                        thumbColor={transporte ? "#fff" : "#fff"}
                    />
                </View>

                {/* Subir CV */}
                <TouchableOpacity style={styles.inputContainer} onPress={pickDocument}>
                    <Text style={[styles.input, { color: cv ? "#000" : "#666" }]}>
                        {cv ? (cv.name || "CV actual") : "Sube tu CV"}
                    </Text>
                    <Ionicons name="cloud-upload-outline" size={22} color="#213A8E" />
                </TouchableOpacity>

                {/* Botón guardar */}
                <View style={{ alignItems: "flex-end", marginTop: 20 }}>
                    <TouchableOpacity
                        style={styles.buttonYellow}
                        onPress={handleSubmit}
                    >
                        <Ionicons name="save-outline" size={28} color="#fff" />
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Modal de Idiomas */}
            <Modal
                visible={modalIdiomasVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalIdiomasVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Idiomas y niveles (opcional)</Text>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setModalIdiomasVisible(false)}
                            >
                                <Ionicons name="close" size={24} color="#213A8E" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalContent}>
                            {idiomas.map(idiomaItem => {
                                const estaSeleccionado = idiomasSeleccionados.some(item => item.idIdioma === idiomaItem.idIdioma);
                                const nivelSeleccionado = idiomasSeleccionados.find(item => item.idIdioma === idiomaItem.idIdioma)?.idINivel;

                                return (
                                    <View key={idiomaItem.idIdioma} style={styles.idiomaContainer}>
                                        <TouchableOpacity
                                            style={[
                                                styles.idiomaOption,
                                                estaSeleccionado && styles.idiomaSelected
                                            ]}
                                            onPress={() => {
                                                if (niveles.length > 0) {
                                                    const primerNivel = niveles[0].idINivel;
                                                    toggleIdiomaNivel(idiomaItem.idIdioma, primerNivel);
                                                } else {
                                                    showToast("⚠️ Aún no se han cargado los niveles");
                                                }
                                            }}
                                        >
                                            <Ionicons
                                                name={estaSeleccionado ? "checkbox" : "square-outline"}
                                                size={22}
                                                color={estaSeleccionado ? "#2666DE" : "#666"}
                                            />
                                            <Text style={styles.idiomaText}>{idiomaItem.nombre}</Text>
                                        </TouchableOpacity>

                                        {estaSeleccionado && (
                                            <View style={styles.nivelesContainer}>
                                                <Text style={styles.nivelesTitle}>Nivel requerido:</Text>
                                                <View style={styles.nivelesOptions}>
                                                    {niveles.map(nivelItem => (
                                                        <TouchableOpacity
                                                            key={nivelItem.idINivel}
                                                            style={[
                                                                styles.nivelOption,
                                                                nivelSeleccionado === nivelItem.idINivel && styles.nivelSelected
                                                            ]}
                                                            onPress={() => actualizarNivelIdioma(idiomaItem.idIdioma, nivelItem.idINivel)}
                                                        >
                                                            <Text style={[
                                                                styles.nivelText,
                                                                nivelSeleccionado === nivelItem.idINivel && styles.nivelTextSelected
                                                            ]}>
                                                                {nivelItem.nombre}
                                                            </Text>
                                                        </TouchableOpacity>
                                                    ))}
                                                </View>
                                            </View>
                                        )}
                                    </View>
                                );
                            })}
                        </ScrollView>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.aplicarButton}
                                onPress={() => setModalIdiomasVisible(false)}
                            >
                                <Text style={styles.aplicarButtonText}>Aceptar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Bottom nav */}
            <View style={styles.bottomNav}>
                <Ionicons
                    name="home-outline"
                    size={28}
                    color="#fff"
                    onPress={() => router.push("/")}
                />
                <Ionicons
                    name="star-outline"
                    size={28}
                    color="#fff"
                    onPress={() => router.push("/(tabs)/guardados")}
                />
                <Ionicons
                    name="file-tray-outline"
                    size={28}
                    color="#fff"
                    onPress={() => router.push("/(tabs)/aplicaciones")}
                />
                <Ionicons
                    name="notifications-outline"
                    size={28}
                    color="#fff"
                    onPress={() => router.push("/(tabs)/notificaciones")}
                />
                <Ionicons
                    name="person-outline"
                    size={28}
                    color="#fff"
                    onPress={() => router.push("/(tabs)/cuenta")}
                />
            </View>
        </View>
    );
}

// ESTILOS (mantener igual que en tu código original)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    loadingText: {
        fontSize: 16,
        color: "#666",
        fontFamily: "Inter-Regular"
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 91,
        marginBottom: 20,
        backgroundColor: "#fff",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#000",
        fontFamily: "MyriadPro-Bold",
    },
    contentBackground: {
        flex: 1,
        backgroundColor: "#F2F6FC",
        paddingHorizontal: 20,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 15,
        gap: 10,
    },
    half: { flex: 1 },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 12,
        paddingHorizontal: 10,
        borderLeftWidth: 15,
        borderLeftColor: "#2666DE",
        height: 55,
        marginBottom: 15,
        shadowColor: "#2666DE",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 6,
        elevation: 8,
    },
    inputContainer2: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 12,
        paddingHorizontal: 10,
        borderLeftWidth: 15,
        borderLeftColor: "#2666DE",
        height: 55,
        shadowColor: "#2666DE",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 6,
        elevation: 8,
    },
    input: {
        flex: 1,
        fontSize: 15,
        fontFamily: "Inter-Medium",
        color: "#000",
        height: 55,
        textAlignVertical: "center",
    },
    picker: {
        flex: 1,
        fontSize: 15,
        fontFamily: "Inter-Medium",
        color: "#000",
        height: 55,
    },
    iconCalendar: { marginRight: 10 },
    buttonYellow: {
        backgroundColor: "#F9DC50",
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#FFD700",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.7,
        shadowRadius: 8,
        elevation: 10,
    },
    bottomNav: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        paddingVertical: 12,
        backgroundColor: "#2666DE",
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingBottom: 30,
        paddingTop: 20,
    },
    chipsInputContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 15,
        borderLeftWidth: 15,
        borderLeftColor: '#2666DE',
        paddingVertical: 10,
        minHeight: 55,
        paddingHorizontal: 5,
        justifyContent: 'center',
        shadowColor: "#2666DE",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 6,
        elevation: 8,
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center'
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2666DE',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        margin: 5,
    },
    chipText: {
        color: '#fff',
        fontFamily: 'Inter-Medium',
        fontSize: 12
    },
    chipClose: {
        marginLeft: 5
    },
    chipTextInput: {
        flexGrow: 1,
        fontSize: 15,
        fontFamily: 'Inter-Medium',
        color: '#000',
        minWidth: 100,
        includeFontPadding: false,
        textAlignVertical: 'center',
        paddingVertical: 0,
        marginVertical: 0,
    },
    suggestionsList: {
        position: 'absolute',
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#2666DE',
        borderRadius: 12,
        zIndex: 2000,
        elevation: 50,
        maxHeight: 200,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        overflow: 'hidden',
    },
    suggestionsScroll: {
        maxHeight: 400,
    },
    suggestionItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
    },
    suggestionText: {
        fontSize: 14,
        fontFamily: 'Inter-Medium',
        color: '#333',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        maxHeight: '80%',
        paddingBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#213A8E',
        fontFamily: 'MyriadPro-Bold',
    },
    closeButton: {
        padding: 4,
    },
    modalContent: {
        paddingHorizontal: 20,
        maxHeight: '70%',
    },
    modalButtons: {
        paddingHorizontal: 20,
        marginTop: 10,
    },
    idiomaContainer: {
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        paddingBottom: 10,
    },
    idiomaOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    idiomaSelected: {
        backgroundColor: '#F2F6FC',
        borderRadius: 8,
        paddingHorizontal: 10,
    },
    idiomaText: {
        marginLeft: 10,
        fontSize: 15,
        fontFamily: 'Inter-Medium',
        color: '#333',
        flex: 1,
    },
    nivelesContainer: {
        marginLeft: 32,
        marginTop: 5,
    },
    nivelesTitle: {
        fontSize: 12,
        fontFamily: 'Inter-Medium',
        color: '#666',
        marginBottom: 5,
    },
    nivelesOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    nivelOption: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        backgroundColor: '#f0f0f0',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    nivelSelected: {
        backgroundColor: '#2666DE',
        borderColor: '#2666DE',
    },
    nivelText: {
        fontSize: 12,
        fontFamily: 'Inter-Medium',
        color: '#666',
    },
    nivelTextSelected: {
        color: '#fff',
        fontWeight: 'bold',
    },
    aplicarButton: {
        backgroundColor: '#2666DE',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    aplicarButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        fontFamily: 'MyriadPro-Bold',
    },
    erroresContainer: {
        backgroundColor: '#FFEAA7',
        padding: 15,
        borderRadius: 10,
        marginTop: 15,
        borderLeftWidth: 4,
        borderLeftColor: '#E53935',
    },
    erroresTitle: {
        fontSize: 14,
        fontFamily: 'Inter-Bold',
        color: '#D63031',
        marginBottom: 5,
    },
    errorItem: {
        fontSize: 12,
        fontFamily: 'Inter-Medium',
        color: '#E17055',
        marginLeft: 10,
    },
});