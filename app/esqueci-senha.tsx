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
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import api from "@/services/api";

const TEAL = "#0b6b6b";

type Etapa = "email" | "codigo" | "nova_senha";

export default function EsqueciSenha() {
  const router = useRouter();
  const [etapa, setEtapa] = useState<Etapa>("email");
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const handleEnviarEmail = async () => {
    if (!email) return Alert.alert("Atenção", "Informe seu e-mail.");
    setCarregando(true);
    try {
      await api.post("/auth/esqueci-senha", { email });
      Alert.alert("E-mail enviado!", "Verifique sua caixa de entrada e spam.");
      setEtapa("codigo");
    } catch (err: any) {
      Alert.alert("Erro", err.response?.data?.erro || "Erro ao enviar e-mail.");
    } finally {
      setCarregando(false);
    }
  };

  const handleVerificarCodigo = () => {
    if (codigo.length !== 6) return Alert.alert("Atenção", "Digite o código de 6 dígitos.");
    setEtapa("nova_senha");
  };

  const handleRedefinirSenha = async () => {
    if (!novaSenha || !confirmarSenha)
      return Alert.alert("Atenção", "Preencha os campos de senha.");
    if (novaSenha.length < 8)
      return Alert.alert("Atenção", "A senha deve ter pelo menos 8 caracteres.");
    if (novaSenha !== confirmarSenha)
      return Alert.alert("Atenção", "As senhas não coincidem.");

    setCarregando(true);
    try {
      await api.post("/auth/redefinir-senha", { email, codigo, novaSenha });
      Alert.alert("Sucesso!", "Senha redefinida com sucesso!", [
        { text: "Entrar", onPress: () => router.replace("/login") },
      ]);
    } catch (err: any) {
      Alert.alert("Erro", err.response?.data?.erro || "Código inválido ou expirado.");
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.btnVoltar} onPress={() => router.back()}>
            <Ionicons name="arrow-back-outline" size={20} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
          <View style={styles.shieldCircle}>
            <Ionicons name="lock-open-outline" size={28} color="white" />
          </View>
          <Text style={styles.brand}>ASPEN CORE</Text>
          <Text style={styles.tagline}>Recuperação de senha</Text>

          {/* Indicador de etapas */}
          <View style={styles.etapasRow}>
            {["email", "codigo", "nova_senha"].map((e, i) => (
              <View key={e} style={styles.etapaWrap}>
                <View style={[
                  styles.etapaBola,
                  (etapa === e ||
                    (i === 0 && ["codigo", "nova_senha"].includes(etapa)) ||
                    (i === 1 && etapa === "nova_senha"))
                    && styles.etapaBolaAtiva
                ]}>
                  <Text style={styles.etapaNum}>{i + 1}</Text>
                </View>
                {i < 2 && <View style={[styles.etapaLinha,
                  ((i === 0 && ["codigo", "nova_senha"].includes(etapa)) ||
                    (i === 1 && etapa === "nova_senha"))
                    && styles.etapaLinhaAtiva
                ]} />}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.form}>
          {/* Etapa 1 — E-mail */}
          {etapa === "email" && (
            <>
              <Text style={styles.formTitle}>Esqueceu sua senha?</Text>
              <Text style={styles.formSub}>
                Informe seu e-mail e enviaremos um código de recuperação.
              </Text>
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
              <TouchableOpacity
                style={[styles.btnPrimary, carregando && styles.btnDisabled]}
                onPress={handleEnviarEmail}
                disabled={carregando}
              >
                {carregando ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.btnPrimaryText}>Enviar código</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {/* Etapa 2 — Código */}
          {etapa === "codigo" && (
            <>
              <Text style={styles.formTitle}>Digite o código</Text>
              <Text style={styles.formSub}>
                Enviamos um código de 6 dígitos para{" "}
                <Text style={{ fontWeight: "700", color: TEAL }}>{email}</Text>
              </Text>
              <Text style={styles.label}>Código *</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="key-outline" size={16} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { letterSpacing: 6, fontSize: 18, fontWeight: "700" }]}
                  placeholder="000000"
                  placeholderTextColor="#94A3B8"
                  keyboardType="default"
                  autoCapitalize="characters"
                  maxLength={6}
                  value={codigo}
                  onChangeText={setCodigo}
                />
              </View>
              <TouchableOpacity style={styles.btnPrimary} onPress={handleVerificarCodigo}>
                <Text style={styles.btnPrimaryText}>Verificar código</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setEtapa("email")}>
                <Text style={styles.linkCenter}>Não recebeu? <Text style={styles.linkDestaque}>Reenviar</Text></Text>
              </TouchableOpacity>
            </>
          )}

          {/* Etapa 3 — Nova senha */}
          {etapa === "nova_senha" && (
            <>
              <Text style={styles.formTitle}>Nova senha</Text>
              <Text style={styles.formSub}>Crie uma senha forte para sua conta.</Text>

              <Text style={styles.label}>Nova senha *</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={16} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Mínimo 8 caracteres"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!mostrarSenha}
                  value={novaSenha}
                  onChangeText={setNovaSenha}
                />
                <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)}>
                  <Ionicons name={mostrarSenha ? "eye-off-outline" : "eye-outline"} size={16} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Confirmar nova senha *</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={16} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Repita a senha"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!mostrarSenha}
                  value={confirmarSenha}
                  onChangeText={setConfirmarSenha}
                />
              </View>

              <TouchableOpacity
                style={[styles.btnPrimary, carregando && styles.btnDisabled]}
                onPress={handleRedefinirSenha}
                disabled={carregando}
              >
                {carregando ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.btnPrimaryText}>Redefinir senha</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity onPress={() => router.push("/login")}>
            <Text style={styles.backLink}>← Voltar para o login</Text>
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
    paddingTop: 56,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  btnVoltar: { marginBottom: 16 },
  shieldCircle: {
    width: 48, height: 48, borderRadius: 24,
    borderWidth: 2, borderColor: "rgba(255,255,255,0.45)",
    alignItems: "center", justifyContent: "center", marginBottom: 14,
  },
  brand: { color: "white", fontSize: 13, fontWeight: "700", letterSpacing: 1, marginBottom: 4 },
  tagline: { color: "rgba(255,255,255,0.85)", fontSize: 16, fontWeight: "500", marginBottom: 24 },

  etapasRow: { flexDirection: "row", alignItems: "center" },
  etapaWrap: { flexDirection: "row", alignItems: "center" },
  etapaBola: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center", justifyContent: "center",
  },
  etapaBolaAtiva: { backgroundColor: "white" },
  etapaNum: { fontSize: 12, fontWeight: "700", color: TEAL },
  etapaLinha: { width: 40, height: 2, backgroundColor: "rgba(255,255,255,0.25)", marginHorizontal: 4 },
  etapaLinhaAtiva: { backgroundColor: "white" },

  form: {
    backgroundColor: "white", margin: 16, borderRadius: 16, padding: 24,
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, elevation: 2, marginBottom: 32,
  },
  formTitle: { fontSize: 20, fontWeight: "700", color: "#0f172a", marginBottom: 4 },
  formSub: { fontSize: 13, color: "#64748b", marginBottom: 20, lineHeight: 20 },
  label: { fontSize: 12, color: "#475569", marginBottom: 6, fontWeight: "500" },
  inputWrap: {
    flexDirection: "row", alignItems: "center",
    borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 11, marginBottom: 16, backgroundColor: "#f8fafc",
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 14, color: "#0f172a" },
  btnPrimary: {
    backgroundColor: TEAL, borderRadius: 10, paddingVertical: 14,
    alignItems: "center", marginBottom: 16,
  },
  btnDisabled: { opacity: 0.6 },
  btnPrimaryText: { color: "white", fontWeight: "700", fontSize: 15 },
  linkCenter: { textAlign: "center", fontSize: 13, color: "#64748b", marginBottom: 12 },
  linkDestaque: { color: TEAL, fontWeight: "600" },
  backLink: { textAlign: "center", fontSize: 13, color: "#94a3b8", marginTop: 4 },
});