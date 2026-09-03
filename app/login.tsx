import { useI18n } from "@/contexts/i18n";
import { auth } from "@/services/firebase";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const TEAL = "#0b6b6b";
const ADMIN_PANEL_URL = "https://aspencore.onrender.com/pages/admin/index.html";

function traduzirErroFirebase(codigo: string) {
  switch (codigo) {
    case "auth/invalid-email":
      return "E-mail inválido.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "E-mail ou senha incorretos.";
    case "auth/too-many-requests":
      return "Muitas tentativas. Tente novamente mais tarde.";
    default:
      return "Erro ao conectar com o servidor.";
  }
}

export default function Login() {
  const router = useRouter();
  const { loadPhotoForUser } = useI18n();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [biometriaDisponivel, setBiometriaDisponivel] = useState(false);
  const [tipoBiometria, setTipoBiometria] = useState<"fingerprint" | "face">(
    "fingerprint",
  );
  const [ultimoEmail, setUltimoEmail] = useState<string | null>(null);

  useEffect(() => {
    verificarBiometria();
  }, []);

  async function verificarBiometria() {
    try {
      const compativel = await LocalAuthentication.hasHardwareAsync();
      const registrado = await LocalAuthentication.isEnrolledAsync();
      if (!compativel || !registrado) return;

      const emailSalvo = await AsyncStorage.getItem("@aspen_bio_ultimo_email");
      if (!emailSalvo) return;

      const bioAtivada = await AsyncStorage.getItem(`@aspen_bio_${emailSalvo}`);
      const senhaSalva = await AsyncStorage.getItem(
        `@aspen_bio_senha_${emailSalvo}`,
      );
      if (bioAtivada !== "true" || !senhaSalva) return;

      setUltimoEmail(emailSalvo);
      setBiometriaDisponivel(true);

      const tipos =
        await LocalAuthentication.supportedAuthenticationTypesAsync();
      if (
        tipos.includes(
          LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
        )
      ) {
        setTipoBiometria("face");
      } else {
        setTipoBiometria("fingerprint");
      }
    } catch {}
  }

  async function loginComBiometria() {
    if (!ultimoEmail) return;
    try {
      const resultado = await LocalAuthentication.authenticateAsync({
        promptMessage: "Confirme sua identidade",
        cancelLabel: "Usar senha",
        fallbackLabel: "Usar senha",
      });

      if (resultado.success) {
        setCarregando(true);
        const senhaSalva = await AsyncStorage.getItem(
          `@aspen_bio_senha_${ultimoEmail}`,
        );
        if (!senhaSalva) {
          Alert.alert("Erro", "Credenciais não encontradas. Use sua senha.");
          setCarregando(false);
          return;
        }
        await fazerLogin(ultimoEmail, senhaSalva);
      }
    } catch {
      Alert.alert("Erro", "Falha na autenticação biométrica.");
    } finally {
      setCarregando(false);
    }
  }

  async function fazerLogin(emailLogin: string, senhaLogin: string) {
    const cred = await signInWithEmailAndPassword(auth, emailLogin, senhaLogin);

    // Mesma lógica do redirectAfterLogin() do web (client/js/features/auth.js):
    // admin não usa o app mobile, é direcionado pro painel web.
    try {
      const tokenResult = await cred.user.getIdTokenResult(true);
      if (tokenResult.claims.role === "admin") {
        await auth.signOut();
        const abriu = await Linking.canOpenURL(ADMIN_PANEL_URL);
        if (abriu) await Linking.openURL(ADMIN_PANEL_URL);
        Alert.alert(
          "Conta administrativa",
          "Contas de administrador só têm acesso pelo painel web. Abrimos o painel no seu navegador.",
        );
        return;
      }
    } catch {
      // Se falhar ao ler claims, segue o fluxo normal (mesmo comportamento do web)
    }

    await loadPhotoForUser(cred.user.uid);
    router.replace("/(tabs)/dashboard");
  }

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert("Atenção", "Preencha e-mail e senha.");
      return;
    }
    setCarregando(true);
    try {
      await fazerLogin(email, senha);
    } catch (err: any) {
      Alert.alert("Erro", traduzirErroFirebase(err.code));
    } finally {
      setCarregando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView style={styles.container} bounces={false}>
        <View style={styles.header}>
          <Image
            source={require("@/assets/images/logo-alt.png")}
            style={styles.logoIcon}
            resizeMode="contain"
          />
          <Text style={styles.brand}>ASPEN CORE</Text>
          <Text style={styles.brandSub}>SEGURANÇA DIGITAL</Text>
          <Text style={styles.tagline}>
            Segurança simples para quem precisa de proteção real.
          </Text>
          <View style={styles.bullets}>
            {[
              "Proteção contra phishing",
              "Autenticação simplificada",
              "Menos dependência de senhas",
            ].map((item) => (
              <View key={item} style={styles.bulletRow}>
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color="rgba(255,255,255,0.85)"
                />
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.form}>
          <Text style={styles.formTitle}>Bem-vindo de volta</Text>
          <Text style={styles.formSub}>
            Entre com sua conta para continuar.
          </Text>

          {/* Botão de biometria */}
          {biometriaDisponivel && ultimoEmail && (
            <TouchableOpacity
              style={styles.btnBiometria}
              onPress={loginComBiometria}
              disabled={carregando}
            >
              <View style={styles.btnBiometriaIconWrap}>
                <Ionicons
                  name="finger-print-outline"
                  size={28}
                  color={TEAL}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.btnBiometriaTitulo}>
                  Entrar com impressão digital
                </Text>
                <Text style={styles.btnBiometriaEmail}>{ultimoEmail}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
            </TouchableOpacity>
          )}

          {biometriaDisponivel && (
            <View style={styles.ouRow}>
              <View style={styles.ouLine} />
              <Text style={styles.ouText}>ou entre com senha</Text>
              <View style={styles.ouLine} />
            </View>
          )}

          <Text style={styles.label}>E-mail *</Text>
          <View style={styles.inputWrap}>
            <Ionicons
              name="mail-outline"
              size={16}
              color="#94A3B8"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="seu@email.com"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.labelRow}>
            <Text style={styles.label}>Senha *</Text>
            <TouchableOpacity onPress={() => router.push("/esqueci-senha")}>
              <Text style={styles.linkSmall}>Esqueceu sua senha?</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inputWrap}>
            <Ionicons
              name="lock-closed-outline"
              size={16}
              color="#94A3B8"
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Sua senha"
              placeholderTextColor="#94A3B8"
              secureTextEntry={!mostrarSenha}
              value={senha}
              onChangeText={setSenha}
            />
            <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)}>
              <Ionicons
                name={mostrarSenha ? "eye-off-outline" : "eye-outline"}
                size={16}
                color="#94A3B8"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.btnPrimary, carregando && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={carregando}
          >
            {carregando ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.btnPrimaryText}>Entrar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/register")}>
            <Text style={styles.linkCenter}>
              Não tem conta?{" "}
              <Text style={styles.linkDestaque}>Criar conta gratuita</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/")}>
            <Text style={styles.backLink}>← Voltar para o início</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7f8" },
  header: {
    backgroundColor: TEAL,
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  logoIcon: { width: 64, height: 64, marginBottom: 14 },
  brand: { color: "white", fontSize: 13, fontWeight: "700", letterSpacing: 1 },
  brandSub: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  tagline: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 26,
    marginBottom: 16,
  },
  bullets: { gap: 6 },
  bulletRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  bulletText: { color: "rgba(255,255,255,0.85)", fontSize: 13 },
  form: {
    backgroundColor: "white",
    margin: 16,
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 32,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4,
  },
  formSub: { fontSize: 13, color: "#64748b", marginBottom: 20 },
  btnBiometria: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1.5,
    borderColor: TEAL,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    backgroundColor: "#f0fafa",
  },
  btnBiometriaIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#e6f4f4",
    alignItems: "center",
    justifyContent: "center",
  },
  btnBiometriaTitulo: { fontSize: 14, fontWeight: "600", color: TEAL },
  btnBiometriaEmail: { fontSize: 11, color: "#64748b", marginTop: 2 },
  ouRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  ouLine: { flex: 1, height: 0.5, backgroundColor: "#e2e8f0" },
  ouText: { fontSize: 12, color: "#94a3b8" },
  label: { fontSize: 12, color: "#475569", marginBottom: 6, fontWeight: "500" },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 16,
    backgroundColor: "#f8fafc",
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 14, color: "#0f172a" },
  btnPrimary: {
    backgroundColor: TEAL,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
    marginBottom: 16,
  },
  btnDisabled: { opacity: 0.6 },
  btnPrimaryText: { color: "white", fontWeight: "700", fontSize: 15 },
  linkCenter: {
    textAlign: "center",
    fontSize: 13,
    color: "#64748b",
    marginBottom: 12,
  },
  linkDestaque: { color: TEAL, fontWeight: "600" },
  linkSmall: { fontSize: 12, color: TEAL, marginBottom: 6 },
  backLink: { textAlign: "center", fontSize: 13, color: "#94a3b8" },
});