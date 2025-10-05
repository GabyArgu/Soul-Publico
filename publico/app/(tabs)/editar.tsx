// app/(main)/EditarPerfil.tsx
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Switch, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import Toast from "react-native-root-toast";
import * as DocumentPicker from "expo-document-picker";
import axios from "axios";
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
    const API_URL = "https://d06a6c5dfc30.ngrok-free.app/api";

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

    // Estados para idiomas
    const [idiomasSeleccionados, setIdiomasSeleccionados] = useState<{ idIdioma: number, idINivel: number }[]>([]);
    const [modalIdiomasVisible, setModalIdiomasVisible] = useState(false);

    // Posición de sugerencias
    const [layoutTecnicas, setLayoutTecnicas] = useState({ y: 0, width: 0 });
    const [layoutBlandas, setLayoutBlandas] = useState({ y: 0, width: 0 });

    // Cargar datos del usuario logeado
    useEffect(() => {
        const loadUser = async () => {
            const data = await getUserData();
            if (data) {
                setUserData(data);
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

            // Cargar todos los datos necesarios con endpoints CORRECTOS
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
        }
    }, [departamento]);

    // Precargar datos cuando se carguen los catálogos
    useEffect(() => {
        if (userData?.carnet && carreras.length > 0 && departamentos.length > 0 && disponibilidades.length > 0) {
            precargarDatosUsuario();
        }
    }, [carreras, departamentos, disponibilidades, userData]);

    const cargarMunicipios = async (idDepartamento: number) => {
        try {
            const response = await axios.get(`${API_URL}/municipios/${idDepartamento}`);
            setMunicipios(response.data);

            // Después de cargar municipios, buscar el municipio del usuario
            if (userData?.carnet) {
                await buscarMunicipioUsuario();
            }
        } catch (error) {
            console.error("Error cargando municipios:", error);
        }
    };

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({ type: "application/pdf" });
            if (!result.canceled) {
                setCv(result.assets[0]); // guardamos todo el objeto
                showToast("📄 Archivo seleccionado: " + result.assets[0].name, true);
            }
        } catch (error) {
            console.error(error);
            showToast("❌ Error al seleccionar archivo");
        }
    };

    const uploadCv = async () => {
        if (!cv) throw new Error("No se seleccionó CV");

        console.log("📤 Intentando subir archivo:", cv.name, "URI:", cv.uri);

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
                timeout: 30000, // 30 segundos timeout
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
            // Si hay error, dejar el array vacío en lugar de fallar completamente
            setIdiomasSeleccionados([]);
            showToast("⚠️ No se pudieron cargar los idiomas, pero puedes continuar");
        }
    };

    // Función mejorada para buscar municipio
    const buscarMunicipioUsuario = async () => {
        if (!userData?.carnet || !departamento) return;

        try {
            // Cargar datos del usuario para obtener el municipio
            const usuarioResponse = await axios.get(`${API_URL}/usuarios/${userData.carnet}`);
            const usuarioData = usuarioResponse.data;

            if (!usuarioData.municipio) return;

            // Buscar el municipio por nombre
            const municipioEncontrado = municipios.find((m: Municipio) =>
                m.nombre.trim().toLowerCase() === usuarioData.municipio.trim().toLowerCase()
            );

            if (municipioEncontrado) {
                setMunicipio(municipioEncontrado.idMunicipio.toString());
            }
        } catch (error) {
            console.error("Error buscando municipio:", error);
        }
    };

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

            // Departamento
            if (usuarioData.departamento && departamentos.length > 0) {
                const deptoEncontrado = departamentos.find(d =>
                    d.nombre.trim().toLowerCase() === usuarioData.departamento.trim().toLowerCase()
                );
                if (deptoEncontrado) {
                    setDepartamento(deptoEncontrado.idDepartamento.toString());

                    // Esperar a que se carguen los municipios y luego buscar el municipio
                    setTimeout(async () => {
                        await buscarMunicipioUsuario();
                    }, 500);
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
            console.error("Error precargando datos:", error);
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

        // Cargar CV existente - SIMPLEMENTE GUARDAR LA URL COMO STRING
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

    const formularioValido = () => {
        return (
            nombre &&
            carrera &&
            correo &&
            carnet &&
            cumple &&
            unidades &&
            /^\d{4}-\d{4}$/.test(telefono) &&
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo) &&
            departamento &&
            municipio &&
            disponibilidad
        );
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
        if (!formularioValido()) {
            showToast("⚠️ Completa todos los campos");
            return;
        }

        try {
            // 1️⃣ Subir CV
            let urlCvFinal = "";
            if (cv && cv.uri) { // Si es un archivo nuevo (tiene URI)
                urlCvFinal = await uploadCv();
            } else if (cv) { // Si es la URL existente
                urlCvFinal = cv;
            }

            // 2️⃣ Preparar datos para actualizar
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
                idIdioma: idiomasSeleccionados.length > 0 ? idiomasSeleccionados[0].idIdioma : null,
                idNivel: idiomasSeleccionados.length > 0 ? idiomasSeleccionados[0].idINivel : null,
                idHorario: Number(disponibilidad),
                habilidadesTecnicas: habilidadesTecnicas.map(h => h.idHabilidad).join(","),
                habilidadesBlandas: habilidadesBlandas.map(h => h.idHabilidad).join(","),
                transportarse: transporte,
                urlCv: urlCvFinal,
            };

            console.log("Campos antes de enviar:", datosActualizacion);

            // 3️⃣ Actualizar usuario en backend
            await axios.put(`${API_URL}/usuarios/${carnet}`, datosActualizacion);

            showToast("✅ Perfil actualizado correctamente", true);
            setTimeout(() => router.back(), 1500);
             
        } catch (error) {
            console.error("Error actualizando perfil:", error);
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

                {/* Fila carnet y cumpleaños */}
                <View style={styles.row}>
                    <View style={[styles.inputContainer2, styles.half]}>
                        <TextInput
                            style={styles.input}
                            placeholder="Carnet"
                            placeholderTextColor="#666"
                            value={carnet}
                            onChangeText={setCarnet}
                            editable={false}
                        />
                    </View>
                    <TouchableOpacity
                        style={[styles.inputContainer2, styles.half, { justifyContent: "space-between" }]}
                        onPress={() => setShowCumple(true)}
                    >
                        <Text style={[styles.input, { color: cumple ? "#000" : "#666" }]}>
                            {cumple ? cumple.toLocaleDateString() : "Cumple"}
                        </Text>
                        <Ionicons name="calendar-outline" size={22} color="#213A8E" style={styles.iconCalendar} />
                    </TouchableOpacity>
                    {showCumple && (
                        <DateTimePicker
                            value={cumple || new Date()}
                            mode="date"
                            display="calendar"
                            onChange={(event, selectedDate) => {
                                setShowCumple(false);
                                if (selectedDate) setCumple(selectedDate);
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

                {/* Habilidades técnicas */}
                <View style={{ zIndex: 20 }}>
                    <View style={styles.chipsInputContainer} onLayout={(event) => {
                        const { y, width } = event.nativeEvent.layout;
                        setLayoutTecnicas({ y: y, width: width });
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
                    {inputHabilidadTecnica.length > 0 && sugerenciasTecnicas.length > 0 && (
                        <View style={[styles.suggestionsList, { top: layoutTecnicas.y, width: layoutTecnicas.width }]}>
                            {sugerenciasTecnicas.map(item => (
                                <TouchableOpacity key={item.idHabilidad} onPress={() => agregarHabilidad(item, "Técnica")} style={styles.suggestionItem}>
                                    <Text style={styles.suggestionText}>{item.nombre}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                {/* Habilidades blandas */}
                <View style={{ zIndex: 10 }}>
                    <View style={styles.chipsInputContainer} onLayout={(event) => {
                        const { y, width } = event.nativeEvent.layout;
                        setLayoutBlandas({ y: y, width: width });
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
                    {inputHabilidadBlanda.length > 0 && sugerenciasBlandas.length > 0 && (
                        <View style={[styles.suggestionsList, { top: layoutBlandas.y, width: layoutBlandas.width }]}>
                            {sugerenciasBlandas.map(item => (
                                <TouchableOpacity key={item.idHabilidad} onPress={() => agregarHabilidad(item, "Blanda")} style={styles.suggestionItem}>
                                    <Text style={styles.suggestionText}>{item.nombre}</Text>
                                </TouchableOpacity>
                            ))}
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
                        style={[
                            styles.buttonYellow,
                            !formularioValido() && styles.buttonDisabled
                        ]}
                        onPress={handleSubmit}
                        disabled={!formularioValido()}
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

// Estilos (se mantienen iguales)
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
    buttonDisabled: {
        backgroundColor: "#ccc",
        shadowColor: "#999",
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
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        zIndex: 100,
        elevation: 5,
        maxHeight: 150,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    suggestionItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee'
    },
    suggestionText: {
        fontSize: 14,
        fontFamily: 'Inter-Medium'
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
});