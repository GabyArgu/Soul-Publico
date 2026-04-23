import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import {
    AppState,
    ImageBackground,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Toast from "react-native-root-toast";

export default function Login() {
  const router = useRouter();
  const [carnet, setCarnet] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const API_URL =
    "https://efb6-2800-b20-111a-4f8d-d970-1cf3-fd4b-9f52.ngrok-free.app/api/auth";

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "inactive" || state === "background") {
        SecureStore.deleteItemAsync("userData");
      }
    });
    return () => subscription.remove();
  }, []);

  const validarCarnet = (text: string) => {
    if (/^[A-Za-z]{0,2}[0-9]{0,6}$/.test(text)) {
      setCarnet(text.toUpperCase());
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

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
      containerStyle: {
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginTop: 60,
        alignSelf: "center",
      },
      textStyle: { fontFamily: "Inter-Medium", fontSize: 14 },
    });
  };

  const handleLogin = async () => {
    if (!carnet || !password) {
      showToast("⚠️ Completa carnet y contraseña");
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/login`, { carnet, password });
      showToast("¡Login exitoso!", true);

      const fullName = res.data.user.nombreCompleto;
      const genero = res.data.user.genero || "O";
      const userCarnet = res.data.user.carnet.trim();
      const idUsuario = res.data.user.idUsuario;
      const email = res.data.user.email;
      const urlCv = res.data.user.urlCv;

      await SecureStore.setItemAsync(
        "userData",
        JSON.stringify({
          carnet: userCarnet,
          nombreCompleto: fullName,
          genero: genero,
          idUsuario: idUsuario,
          email: email,
          urlCv: urlCv,
        }),
      );

      const nameParts = fullName.split(" ");
      const displayName =
        nameParts.length >= 3
          ? `${nameParts[0]} ${nameParts[2]}`
          : nameParts[0];

      router.replace({
        pathname: "/(tabs)",
        params: {
          nombreUsuario: displayName,
          generoUsuario: genero,
        },
      });
    } catch (err: any) {
      if (err.response?.status === 400) {
        showToast("❌ Carnet o contraseña incorrectos");
      } else {
        showToast("❌ Error de conexión. Intenta nuevamente.");
      }
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/images/fondo-l.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={-190}
        enableOnAndroid={true}
        bounces={false}
      >
        <View style={styles.container}>
          <View style={styles.formContainer}>
            <View style={[styles.input, styles.inputCarnet]}>
              <TextInput
                style={styles.generalInput}
                placeholder="Ingresa tu carnet"
                placeholderTextColor="#666"
                value={carnet}
                onChangeText={validarCarnet}
                keyboardType="default"
                autoCapitalize="characters"
              />
            </View>

            <View style={[styles.input, styles.inputPassword]}>
              <TextInput
                style={styles.generalInput}
                placeholder="Ingresa tu contraseña"
                placeholderTextColor="#666"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={toggleShowPassword}
                style={styles.eyeIcon}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showPassword ? "eye" : "eye-off"}
                  size={22}
                  color="#1942BF"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={handleLogin} style={styles.loginButton}>
              <Text style={styles.loginButtonText}>Ingresar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => router.push("/(auth)/Crear")}
            >
              <Text style={styles.registerButtonText}>Registrarme</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    width: "100%",
    paddingBottom: 80,
  },
  formContainer: {
    width: 300,
    backgroundColor: "transparent",
  },
  input: {
    backgroundColor: "#EFF1F8",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    height: 58,
  },
  inputCarnet: {
    borderLeftWidth: 15,
    borderLeftColor: "#F9DC50",
  },
  inputPassword: {
    borderLeftWidth: 15,
    borderLeftColor: "#2666DE",
  },
  generalInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 15,
    fontSize: 16,
    fontFamily: "Inter-Bold",
    fontWeight: "bold",
    color: "black",
  },
  eyeIcon: {
    paddingRight: 15,
    justifyContent: "center",
    height: "100%",
  },
  loginButton: {
    backgroundColor: "#2666DE",
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 12,
  },
  loginButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Inter-Bold",
    fontWeight: "bold",
  },
  registerButton: {
    padding: 12,
    alignItems: "center",
  },
  registerButtonText: {
    color: "#1942BF",
    fontSize: 16,
    fontFamily: "Inter-Bold",
    fontWeight: "bold",
  },
});
