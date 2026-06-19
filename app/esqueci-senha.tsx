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
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/services/firebase";

const TEAL = "#0b6b6b";

function traduzirErroFirebase(codigo: string) {
  switch (codigo) {
    case "auth/invalid-email":
      return "E-mail inválido.";
    case "auth/too-many-requests":
      return "Muitas tentativas. Tente novamente mais tarde.";
    default:
      return "Erro ao enviar e-mail.";
  }
}

export default function EsqueciSenha() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const handleEnviarEmail = async () => {
    if (!email) return Alert.alert("Atenção", "Informe seu e-mail.");
    setCarregando(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setEnviado(true);
    } catch (err: any) {
      // Por segurança, não revelamos se o e-mail existe ou não.
      // O Firebase já trata isso, mas mantemos a mensagem genérica em erros de rede.
      if (err.code === "auth/invalid-email") {
        Alert.alert("Erro", traduzirErroFirebase(err.code));
      } else {
        setEnviado(true);
      }
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
        </View>

        <View style={styles.form}>
          {!enviado ? (
            <>
              <Text style={styles.formTitle}>Esqueceu sua senha?</Text>
              <Text style={styles.formSub}>
                Informe seu e-mail e enviaremos um link para você redefinir sua senha.
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
                  <Text style={styles.btnPrimaryText}>Enviar link de recuperação</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark-circle" size={48} color={TEAL} />
              </View>
              <Text style={styles.formTitle}>E-mail enviado!</Text>
              <Text style={styles.formSub}>
                Se este e-mail estiver cadastrado, você receberá um link para
                redefinir sua senha em poucos minutos. Verifique também a
                caixa de spam.
              </Text>
              <TouchableOpacity onPress={() => setEnviado(false)}>
                <Text style={styles.linkCenter}>
                  Não recebeu? <Text style={styles.linkDestaque}>Tentar de novo</Text>
                </Text>
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
  tagline: { color: "rgba(255,255,255,0.85)", fontSize: 16, fontWeight: "500", marginBottom: 8 },

  form: {
    backgroundColor: "white", margin: 16, borderRadius: 16, padding: 24,
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, elevation: 2, marginBottom: 32,
  },
  successIcon: { alignItems: "center", marginBottom: 8 },
  formTitle: { fontSize: 20, fontWeight: "700", color: "#0f172a", marginBottom: 4, textAlign: "center" },
  formSub: { fontSize: 13, color: "#64748b", marginBottom: 20, lineHeight: 20, textAlign: "center" },
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
