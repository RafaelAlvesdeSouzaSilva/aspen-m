import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/services/firebase";
import api from "@/services/api";

function traduzirErroFirebase(codigo: string) {
  switch (codigo) {
    case "auth/email-already-in-use":
      return "E-mail já cadastrado.";
    case "auth/invalid-email":
      return "E-mail inválido.";
    case "auth/weak-password":
      return "Senha muito fraca. Use pelo menos 6 caracteres.";
    default:
      return "Erro ao conectar com o servidor.";
  }
}

export default function Register() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [aceito, setAceito] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const handleCadastro = async () => {
    if (!nome || !email || !senha || !confirmar) {
      Alert.alert("Atenção", "Preencha todos os campos.");
      return;
    }
    if (senha.length < 8) {
      Alert.alert("Atenção", "A senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (senha !== confirmar) {
      Alert.alert("Atenção", "As senhas não coincidem.");
      return;
    }
    if (!aceito) {
      Alert.alert("Atenção", "Aceite os termos de uso para continuar.");
      return;
    }

    setCarregando(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, senha);
      await updateProfile(credential.user, { displayName: nome });

// Pega o token direto do credential, sem depender do auth.currentUser
      const token = await credential.user.getIdToken();
console.log("TOKEN:", token ? "ok" : "vazio");
try {
  const res = await api.post("/auth/sync-profile", { name: nome }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log("SYNC-PROFILE RESPOSTA:", JSON.stringify(res.data));
} catch (syncErr: any) {
  console.log("SYNC-PROFILE ERRO:", syncErr?.response?.data, syncErr?.message);
}

      Alert.alert("Sucesso!", "Conta criada com sucesso!", [
        { text: "OK", onPress: () => router.replace("/(tabs)/dashboard") },
      ]);
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        Alert.alert(
          "E-mail já cadastrado",
          "Já existe uma conta com este e-mail. Que tal fazer login?",
          [
            { text: "Cancelar", style: "cancel" },
            { text: "Ir para login", onPress: () => router.replace("/login") },
          ]
        );
        return;
      }
      const msg = traduzirErroFirebase(err.code);
      Alert.alert("Erro", msg);
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
            source={require("@/assets/images/logo-icone.png")}
            style={styles.logoIcon}
            resizeMode="contain"
          />
          <Text style={styles.brand}>ASPEN CORE</Text>
          <Text style={styles.brandSub}>SEGURANÇA DIGITAL</Text>
          <Text style={styles.tagline}>Comece a se proteger hoje.{"\n"}É grátis.</Text>
          <View style={styles.bullets}>
            {[
              "Configuração em menos de 2 minutos",
              "Sem cartão de crédito para começar",
              "Cancele quando quiser",
            ].map((item) => (
              <View key={item} style={styles.bulletRow}>
                <Ionicons name="checkmark-circle" size={14} color="rgba(255,255,255,0.85)" />
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.form}>
          <Text style={styles.formTitle}>Criar conta</Text>
          <Text style={styles.formSub}>Preencha os dados abaixo para começar.</Text>

          <Text style={styles.label}>Nome completo *</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="person-outline" size={16} color="#94A3B8" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Seu nome completo"
              placeholderTextColor="#94A3B8"
              value={nome}
              onChangeText={setNome}
            />
          </View>

          <Text style={styles.label}>E-mail *</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="mail-outline" size={16} color="#94A3B8" style={styles.inputIcon} />
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

          <Text style={styles.label}>Senha *</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={16} color="#94A3B8" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Mínimo 8 caracteres"
              placeholderTextColor="#94A3B8"
              secureTextEntry={!mostrarSenha}
              value={senha}
              onChangeText={setSenha}
            />
            <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)}>
              <Ionicons name={mostrarSenha ? "eye-off-outline" : "eye-outline"} size={16} color="#94A3B8" />
            </TouchableOpacity>
          </View>
          <Text style={styles.hint}>Use pelo menos 8 caracteres com letras e números.</Text>

          <Text style={styles.label}>Confirmar senha *</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={16} color="#94A3B8" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Repita a senha"
              placeholderTextColor="#94A3B8"
              secureTextEntry={!mostrarConfirmar}
              value={confirmar}
              onChangeText={setConfirmar}
            />
            <TouchableOpacity onPress={() => setMostrarConfirmar(!mostrarConfirmar)}>
              <Ionicons name={mostrarConfirmar ? "eye-off-outline" : "eye-outline"} size={16} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <View style={styles.checkboxRow}>
            <TouchableOpacity
              style={[styles.checkbox, aceito && styles.checkboxChecked]}
              onPress={() => setAceito(!aceito)}
            >
              {aceito && <Ionicons name="checkmark" size={12} color="white" />}
            </TouchableOpacity>
            <Text style={styles.checkText}>
              Li e concordo com os{" "}
              <Text
                style={styles.linkDestaque}
                onPress={() => router.push("/termos-de-uso" as any)}
              >
                Termos de uso
              </Text>
              {" "}e a{" "}
              <Text
                style={styles.linkDestaque}
                onPress={() => router.push("/politica-de-privacidade" as any)}
              >
                Política de privacidade
              </Text>
              .
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.btnPrimary, (!aceito || carregando) && styles.btnDisabled]}
            onPress={handleCadastro}
            disabled={!aceito || carregando}
          >
            {carregando ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.btnPrimaryText}>Criar conta gratuita</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/login")}>
            <Text style={styles.backLink}>
              Já tem conta? <Text style={styles.linkDestaque}>Entrar</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const TEAL = "#0b6b6b";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7f8" },
  header: {
    backgroundColor: TEAL, paddingTop: 60, paddingBottom: 32, paddingHorizontal: 24,
  },
  logoIcon: {
    width: 64,
    height: 64,
    marginBottom: 14,
  },
  brand: { color: "white", fontSize: 13, fontWeight: "700", letterSpacing: 1 },
  brandSub: { color: "rgba(255,255,255,0.7)", fontSize: 10, letterSpacing: 0.5, marginBottom: 10 },
  tagline: { color: "white", fontSize: 18, fontWeight: "600", lineHeight: 26, marginBottom: 16 },
  bullets: { gap: 6 },
  bulletRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  bulletText: { color: "rgba(255,255,255,0.85)", fontSize: 13 },
  form: {
    backgroundColor: "white", margin: 16, borderRadius: 16, padding: 24,
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, elevation: 2, marginBottom: 32,
  },
  formTitle: { fontSize: 20, fontWeight: "700", color: "#0f172a", marginBottom: 4 },
  formSub: { fontSize: 13, color: "#64748b", marginBottom: 20 },
  label: { fontSize: 12, color: "#475569", marginBottom: 6, fontWeight: "500" },
  inputWrap: {
    flexDirection: "row", alignItems: "center",
    borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 11, marginBottom: 14, backgroundColor: "#f8fafc",
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 14, color: "#0f172a" },
  hint: { fontSize: 11, color: "#94a3b8", marginTop: -10, marginBottom: 14 },
  checkboxRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 20 },
  checkbox: {
    width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: "#cbd5e1",
    alignItems: "center", justifyContent: "center", marginTop: 1, flexShrink: 0,
  },
  checkboxChecked: { backgroundColor: TEAL, borderColor: TEAL },
  checkText: { flex: 1, fontSize: 12, color: "#64748b", lineHeight: 18 },
  btnPrimary: {
    backgroundColor: TEAL, borderRadius: 10, paddingVertical: 14,
    alignItems: "center", marginBottom: 16,
  },
  btnDisabled: { opacity: 0.5 },
  btnPrimaryText: { color: "white", fontWeight: "700", fontSize: 15 },
  linkDestaque: { color: TEAL, fontWeight: "600" },
  backLink: { textAlign: "center", fontSize: 13, color: "#64748b" },
});