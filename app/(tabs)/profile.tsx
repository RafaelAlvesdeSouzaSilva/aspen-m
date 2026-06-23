import Header from "@/components/Header";
import api from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const TEAL = "#0b6b6b";

const abas = ["Dados pessoais", "Segurança", "Pagamento", "Assinatura"];

type Usuario = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  document: string | null;
  plan: string;
  plan_expires_at: string | null;
};

const planLabel = (plan: string) => {
  const map: Record<string, string> = { basico: "Básico", padrao: "Padrão", premium: "Premium" };
  return map[plan] ?? plan;
};

export default function Perfil() {
  const [abaAtiva, setAbaAtiva] = useState("Dados pessoais");
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  // campos editáveis
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");

  useEffect(() => {
    async function carregar() {
      try {
        const res = await api.get("/auth/me");
        const u: Usuario = res.data.data?.user ?? res.data;
        setUsuario(u);
        setNome(u.name ?? "");
        setEmail(u.email ?? "");
        setTelefone(u.phone ?? "");
        setCpf(u.document ?? "");
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  async function salvar() {
    if (!usuario) return;
    setSalvando(true);
    try {
      await api.put("/auth/profile", {
        name: nome,
        email,
        phone: telefone || null,
        document: cpf || null,
      });
      setUsuario((u) => u ? { ...u, name: nome, email, phone: telefone, document: cpf } : u);
      Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
    } catch (err) {
      Alert.alert("Erro", "Não foi possível salvar as alterações.");
    } finally {
      setSalvando(false);
    }
  }

  function cancelar() {
    if (!usuario) return;
    setNome(usuario.name ?? "");
    setEmail(usuario.email ?? "");
    setTelefone(usuario.phone ?? "");
    setCpf(usuario.document ?? "");
  }

  const iniciais = usuario?.name
    ? usuario.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  if (carregando) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f5f7f8" }}>
        <ActivityIndicator size="large" color={TEAL} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Header titulo="Perfil" mostrarVoltar />

      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{iniciais}</Text>
          </View>
        </View>
        <Text style={styles.avatarNome}>{usuario?.name ?? "—"}</Text>
        <Text style={styles.avatarEmail}>{usuario?.email ?? "—"}</Text>
        <View style={styles.planoBadge}>
          <Text style={styles.planoBadgeText}>Plano {planLabel(usuario?.plan ?? "")}</Text>
        </View>
      </View>

      {/* Abas */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.abasScroll}
        contentContainerStyle={styles.abasContent}
      >
        {abas.map((aba) => (
          <TouchableOpacity
            key={aba}
            style={[styles.aba, abaAtiva === aba && styles.abaAtiva]}
            onPress={() => setAbaAtiva(aba)}
          >
            <Text style={[styles.abaText, abaAtiva === aba && styles.abaTextAtiva]}>{aba}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Conteúdo */}
      <View style={styles.content}>
        {abaAtiva === "Dados pessoais" && (
          <View style={styles.card}>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Nome completo *</Text>
              <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholderTextColor="#94a3b8" />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>E-mail *</Text>
              <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#94a3b8" />
            </View>
            <View style={styles.row}>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>Telefone</Text>
                <TextInput style={styles.input} value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" placeholderTextColor="#94a3b8" placeholder="(00) 00000-0000" />
              </View>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>CPF</Text>
                <TextInput style={styles.input} value={cpf} onChangeText={setCpf} keyboardType="numeric" placeholderTextColor="#94a3b8" placeholder="000.000.000-00" />
              </View>
            </View>
            <View style={styles.botoesRow}>
              <TouchableOpacity style={styles.btnSalvar} onPress={salvar} disabled={salvando}>
                <Text style={styles.btnSalvarText}>{salvando ? "Salvando..." : "Salvar alterações"}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnCancelar} onPress={cancelar}>
                <Text style={styles.btnCancelarText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {abaAtiva === "Segurança" && (
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <View>
                <Text style={styles.infoTitulo}>Senha</Text>
                <Text style={styles.infoDesc}>Gerenciada pelo Firebase Auth</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <View>
                <Text style={styles.infoTitulo}>Autenticação 2FA</Text>
                <Text style={styles.infoDesc}>Adicione uma camada extra de proteção</Text>
              </View>
              <View style={styles.btnAtivo}>
                <Text style={styles.btnAtivoText}>Firebase</Text>
              </View>
            </View>
          </View>
        )}

        {abaAtiva === "Pagamento" && (
          <View style={[styles.card, styles.emptyState]}>
            <Ionicons name="card-outline" size={40} color="#cbd5e1" />
            <Text style={styles.emptyTitulo}>Nenhum método de pagamento</Text>
            <Text style={styles.emptyDesc}>Adicione um cartão para assinar um plano.</Text>
            <TouchableOpacity style={styles.btnSalvar}>
              <Text style={styles.btnSalvarText}>Adicionar cartão</Text>
            </TouchableOpacity>
          </View>
        )}

        {abaAtiva === "Assinatura" && (
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <View>
                <Text style={styles.infoTitulo}>Plano atual</Text>
                <Text style={styles.infoDesc}>
                  {planLabel(usuario?.plan ?? "")}
                  {usuario?.plan === "basico" ? " — Gratuito" : ""}
                </Text>
              </View>
              <View style={styles.btnAtivo}>
                <Text style={styles.btnAtivoText}>Ativo</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <View>
                <Text style={styles.infoTitulo}>Próxima renovação</Text>
                <Text style={styles.infoDesc}>
                  {usuario?.plan_expires_at
                    ? new Date(usuario.plan_expires_at).toLocaleDateString("pt-BR")
                    : "Plano gratuito não renova"}
                </Text>
              </View>
            </View>
            <View style={styles.divider} />
            <TouchableOpacity style={[styles.btnSalvar, { marginTop: 8 }]}>
              <Text style={styles.btnSalvarText}>Fazer upgrade</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7f8" },
  avatarSection: { backgroundColor: "white", paddingVertical: 24, alignItems: "center", borderBottomWidth: 0.5, borderBottomColor: "#e2e8f0" },
  avatarWrap: { position: "relative", marginBottom: 12 },
  avatarCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: TEAL, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "white", fontSize: 24, fontWeight: "700" },
  avatarNome: { fontSize: 18, fontWeight: "700", color: "#0f172a", marginBottom: 2 },
  avatarEmail: { fontSize: 13, color: "#64748b", marginBottom: 10 },
  planoBadge: { backgroundColor: "#e6f4f4", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  planoBadgeText: { fontSize: 12, fontWeight: "600", color: TEAL },
  abasScroll: { backgroundColor: "white", borderBottomWidth: 0.5, borderBottomColor: "#e2e8f0" },
  abasContent: { paddingHorizontal: 16, gap: 4 },
  aba: { paddingHorizontal: 12, paddingVertical: 14 },
  abaAtiva: { borderBottomWidth: 2, borderBottomColor: TEAL },
  abaText: { fontSize: 14, color: "#94a3b8", fontWeight: "500" },
  abaTextAtiva: { color: TEAL, fontWeight: "600" },
  content: { padding: 16 },
  card: { backgroundColor: "white", borderRadius: 12, borderWidth: 0.5, borderColor: "#e2e8f0", padding: 20 },
  fieldGroup: { marginBottom: 16 },
  fieldLabel: { fontSize: 12, fontWeight: "600", color: "#475569", marginBottom: 6 },
  input: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, fontSize: 14, color: "#0f172a", backgroundColor: "#f8fafc" },
  row: { flexDirection: "row", gap: 12 },
  botoesRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 4 },
  btnSalvar: { backgroundColor: TEAL, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 20, alignItems: "center" },
  btnSalvarText: { color: "white", fontWeight: "700", fontSize: 14 },
  btnCancelar: { paddingVertical: 12 },
  btnCancelarText: { color: "#64748b", fontSize: 14 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14 },
  infoTitulo: { fontSize: 14, fontWeight: "600", color: "#0f172a", marginBottom: 2 },
  infoDesc: { fontSize: 12, color: "#64748b" },
  btnAtivo: { backgroundColor: "#dcfce7", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  btnAtivoText: { fontSize: 12, fontWeight: "600", color: "#16a34a" },
  divider: { height: 0.5, backgroundColor: "#e2e8f0" },
  emptyState: { alignItems: "center", gap: 8, paddingVertical: 16 },
  emptyTitulo: { fontSize: 15, fontWeight: "600", color: "#475569" },
  emptyDesc: { fontSize: 13, color: "#94a3b8", textAlign: "center", marginBottom: 8 },
});
