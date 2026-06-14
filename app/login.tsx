import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView style={styles.container} bounces={false}>
        <View style={styles.header}>
          <View style={styles.shieldCircle}>
            <Ionicons name="shield-checkmark-outline" size={28} color="white" />
          </View>
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
            <TouchableOpacity>
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
            style={styles.btnPrimary}
            onPress={() => router.replace("/(tabs)/dashboard")}
          >
            <Text style={styles.btnPrimaryText}>Entrar</Text>
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

const TEAL = "#0b6b6b";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7f8" },
  header: {
    backgroundColor: TEAL,
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  shieldCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.45)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
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
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4,
  },
  formSub: { fontSize: 13, color: "#64748b", marginBottom: 20 },
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
