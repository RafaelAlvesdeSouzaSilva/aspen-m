import { Ionicons } from "@expo/vector-icons";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "@/services/firebase";
import api from "@/services/api";

const TEAL = "#0b6b6b";
const ABAS = ["Dados pessoais", "Segurança", "Pagamento", "Assinatura"] as const;
type Aba = typeof ABAS[number];

type Usuario = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  document: string | null;
  plan: string;
  plan_expires_at: string | null;
};

type MetodoPagamento = {
  id: string;
  type: "card" | "pix";
  card_last4?: string;
  card_brand?: string;
  card_expiry?: string;
  card_holder?: string;
  is_default?: boolean;
};

// ============================================================
// Helpers
// ============================================================
function planLabel(plan: string) {
  const map: Record<string, string> = { basico: "Básico", padrao: "Padrão", premium: "Premium" };
  return map[plan] ?? plan;
}

function formatCpf(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return d.replace(/(\d{3})(\d+)/, "$1.$2");
  if (d.length <= 9) return d.replace(/(\d{3})(\d{3})(\d+)/, "$1.$2.$3");
  return d.replace(/(\d{3})(\d{3})(\d{3})(\d+)/, "$1.$2.$3-$4");
}

function formatPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0,2)}) ${d.slice(2)}`;
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
}

function iniciais(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0].toUpperCase()).join("");
}

// ============================================================
// Sub-componente: campo de input
// ============================================================
function Campo({
  label, value, onChangeText, placeholder, keyboardType, secureTextEntry, editable = true, hint,
}: {
  label: string; value: string; onChangeText?: (v: string) => void;
  placeholder?: string; keyboardType?: any; secureTextEntry?: boolean;
  editable?: boolean; hint?: string;
}) {
  return (
    <View style={styles.campo}>
      <Text style={styles.campoLabel}>{label}</Text>
      <TextInput
        style={[styles.campoInput, !editable && styles.campoInputDisabled]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        editable={editable}
        autoCapitalize="none"
      />
      {!!hint && <Text style={styles.campoHint}>{hint}</Text>}
    </View>
  );
}

// ============================================================
// Main
// ============================================================
export default function Perfil() {
  const router = useRouter();
  const [abaAtiva, setAbaAtiva] = useState<Aba>("Dados pessoais");
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  // Dados pessoais
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");

  // Segurança
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [trocandoSenha, setTrocandoSenha] = useState(false);
  const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false);
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  // Pagamento
  const [metodos, setMetodos] = useState<MetodoPagamento[]>([]);
  const [carregandoMetodos, setCarregandoMetodos] = useState(false);

  // Modal excluir conta
  const [modalExcluir, setModalExcluir] = useState(false);
  const [senhaExcluir, setSenhaExcluir] = useState("");
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    carregarUsuario();
  }, []);

  useEffect(() => {
    if (abaAtiva === "Pagamento") carregarMetodos();
  }, [abaAtiva]);

  async function carregarUsuario() {
    try {
      const res = await api.get("/auth/me");
      const u: Usuario = res.data.data?.user ?? res.data;
      setUsuario(u);
      setNome(u.name ?? "");
      setTelefone(u.phone ?? "");
      setCpf(u.document ?? "");
    } catch {
      Alert.alert("Erro", "Não foi possível carregar o perfil.");
    } finally {
      setCarregando(false);
    }
  }

  async function carregarMetodos() {
    setCarregandoMetodos(true);
    try {
      const res = await api.get("/payment-methods");
      setMetodos(res.data ?? []);
    } catch {
      setMetodos([]);
    } finally {
      setCarregandoMetodos(false);
    }
  }

  async function salvarDados() {
    if (!nome.trim() || nome.trim().length < 3) {
      Alert.alert("Atenção", "Nome deve ter pelo menos 3 caracteres.");
      return;
    }
    setSalvando(true);
    try {
      const res = await api.put("/auth/profile", {
        name: nome.trim(),
        phone: telefone.replace(/\D/g, "") || null,
        document: cpf.replace(/\D/g, "") || null,
      });
      const userAtualizado = res.data.user;
      if (userAtualizado) setUsuario(userAtualizado);
      Alert.alert("Sucesso", "Dados salvos com sucesso!");
    } catch {
      Alert.alert("Erro", "Não foi possível salvar os dados.");
    } finally {
      setSalvando(false);
    }
  }

  function cancelarDados() {
    if (!usuario) return;
    setNome(usuario.name ?? "");
    setTelefone(usuario.phone ?? "");
    setCpf(usuario.document ?? "");
  }

  async function trocarSenha() {
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      Alert.alert("Atenção", "Preencha todos os campos de senha.");
      return;
    }
    if (novaSenha.length < 8) {
      Alert.alert("Atenção", "A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      Alert.alert("Atenção", "As senhas não coincidem.");
      return;
    }

    setTrocandoSenha(true);
    try {
      const user = auth.currentUser;
      if (!user || !user.email) throw new Error("Sessão expirada.");
      const cred = EmailAuthProvider.credential(user.email, senhaAtual);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, novaSenha);
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
      Alert.alert("Sucesso", "Senha atualizada com sucesso!");
    } catch (err: any) {
      const msg =
        err?.code === "auth/wrong-password" || err?.code === "auth/invalid-credential"
          ? "Senha atual incorreta."
          : err?.code === "auth/weak-password"
          ? "Nova senha muito fraca."
          : "Erro ao atualizar senha.";
      Alert.alert("Erro", msg);
    } finally {
      setTrocandoSenha(false);
    }
  }

  async function excluirConta() {
    if (!senhaExcluir) {
      Alert.alert("Atenção", "Digite sua senha para confirmar.");
      return;
    }
    setExcluindo(true);
    try {
      const user = auth.currentUser;
      if (!user || !user.email) throw new Error("Sessão expirada.");
      const cred = EmailAuthProvider.credential(user.email, senhaExcluir);
      await reauthenticateWithCredential(user, cred);
      await api.delete("/auth/account");
      await auth.currentUser?.delete();
      setModalExcluir(false);
      router.replace("/login");
    } catch (err: any) {
      const msg =
        err?.code === "auth/wrong-password" || err?.code === "auth/invalid-credential"
          ? "Senha incorreta."
          : "Erro ao excluir conta. Tente novamente.";
      Alert.alert("Erro", msg);
    } finally {
      setExcluindo(false);
    }
  }

  async function removerMetodo(id: string) {
    Alert.alert("Remover método", "Deseja remover este método de pagamento?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover", style: "destructive", onPress: async () => {
          try {
            await api.delete(`/payment-methods/${id}`);
            setMetodos((prev) => prev.filter((m) => m.id !== id));
          } catch {
            Alert.alert("Erro", "Não foi possível remover o método.");
          }
        },
      },
    ]);
  }

  if (carregando) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={TEAL} />
      </View>
    );
  }

  const inics = iniciais(usuario?.name ?? "?");

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Perfil</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Avatar + info */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{inics}</Text>
          </View>
          <Text style={styles.avatarNome}>{usuario?.name ?? "—"}</Text>
          <Text style={styles.avatarEmail}>{usuario?.email ?? "—"}</Text>
          <View style={styles.planBadge}>
            <Text style={styles.planBadgeText}>Plano {planLabel(usuario?.plan ?? "")}</Text>
          </View>
        </View>

        {/* Abas */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.abasScroll} contentContainerStyle={styles.abasContent}>
          {ABAS.map((aba) => (
            <TouchableOpacity key={aba} style={[styles.aba, abaAtiva === aba && styles.abaAtiva]} onPress={() => setAbaAtiva(aba)}>
              <Text style={[styles.abaText, abaAtiva === aba && styles.abaTextAtiva]}>{aba}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ---- Dados pessoais ---- */}
        {abaAtiva === "Dados pessoais" && (
          <View style={styles.painel}>
            <Campo label="Nome completo *" value={nome} onChangeText={setNome} placeholder="Seu nome completo" />
            <Campo label="E-mail" value={usuario?.email ?? ""} editable={false} hint="Para alterar o e-mail, entre em contato com o suporte." />
            <Campo
              label="Telefone"
              value={telefone}
              onChangeText={(v) => setTelefone(formatPhone(v))}
              placeholder="(11) 99999-9999"
              keyboardType="phone-pad"
            />
            <Campo
              label="CPF"
              value={cpf}
              onChangeText={(v) => setCpf(formatCpf(v))}
              placeholder="000.000.000-00"
              keyboardType="numeric"
            />
            <View style={styles.botoesRow}>
              <TouchableOpacity style={styles.btnPrimary} onPress={salvarDados} disabled={salvando}>
                {salvando ? <ActivityIndicator color="white" size="small" /> : <Text style={styles.btnPrimaryText}>Salvar alterações</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnGhost} onPress={cancelarDados}>
                <Text style={styles.btnGhostText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ---- Segurança ---- */}
        {abaAtiva === "Segurança" && (
          <View style={styles.painel}>
            <Text style={styles.painelTitulo}>Alterar senha</Text>
            <View style={styles.inputSenhaWrap}>
              <TextInput
                style={styles.campoInput}
                value={senhaAtual}
                onChangeText={setSenhaAtual}
                placeholder="Senha atual"
                placeholderTextColor="#94a3b8"
                secureTextEntry={!mostrarSenhaAtual}
              />
              <TouchableOpacity style={styles.olhoBtn} onPress={() => setMostrarSenhaAtual(!mostrarSenhaAtual)}>
                <Ionicons name={mostrarSenhaAtual ? "eye-off-outline" : "eye-outline"} size={18} color="#94a3b8" />
              </TouchableOpacity>
            </View>
            <View style={styles.inputSenhaWrap}>
              <TextInput
                style={styles.campoInput}
                value={novaSenha}
                onChangeText={setNovaSenha}
                placeholder="Nova senha (mín. 8 caracteres)"
                placeholderTextColor="#94a3b8"
                secureTextEntry={!mostrarNovaSenha}
              />
              <TouchableOpacity style={styles.olhoBtn} onPress={() => setMostrarNovaSenha(!mostrarNovaSenha)}>
                <Ionicons name={mostrarNovaSenha ? "eye-off-outline" : "eye-outline"} size={18} color="#94a3b8" />
              </TouchableOpacity>
            </View>
            <View style={styles.inputSenhaWrap}>
              <TextInput
                style={styles.campoInput}
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                placeholder="Confirmar nova senha"
                placeholderTextColor="#94a3b8"
                secureTextEntry={!mostrarConfirmar}
              />
              <TouchableOpacity style={styles.olhoBtn} onPress={() => setMostrarConfirmar(!mostrarConfirmar)}>
                <Ionicons name={mostrarConfirmar ? "eye-off-outline" : "eye-outline"} size={18} color="#94a3b8" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.btnPrimary} onPress={trocarSenha} disabled={trocandoSenha}>
              {trocandoSenha ? <ActivityIndicator color="white" size="small" /> : <Text style={styles.btnPrimaryText}>Atualizar senha</Text>}
            </TouchableOpacity>

            <View style={styles.divider} />

            <Text style={styles.painelTitulo}>Zona de perigo</Text>
            <View style={styles.dangerCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.dangerTitulo}>Excluir conta</Text>
                <Text style={styles.dangerDesc}>Esta ação é permanente e irreversível. Todos os seus dados serão apagados.</Text>
              </View>
              <TouchableOpacity style={styles.btnDanger} onPress={() => setModalExcluir(true)}>
                <Text style={styles.btnDangerText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ---- Pagamento ---- */}
        {abaAtiva === "Pagamento" && (
          <View style={styles.painel}>
            <Text style={styles.painelTitulo}>Métodos de pagamento</Text>
            {carregandoMetodos ? (
              <ActivityIndicator color={TEAL} style={{ marginTop: 16 }} />
            ) : metodos.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="card-outline" size={40} color="#cbd5e1" />
                <Text style={styles.emptyTitulo}>Nenhum método cadastrado</Text>
                <Text style={styles.emptyDesc}>Adicione um cartão de crédito ou Pix para usar em pagamentos.</Text>
              </View>
            ) : (
              metodos.map((m) => (
                <View key={m.id} style={styles.metodoCard}>
                  <View style={styles.metodoIconWrap}>
                    <Ionicons name={m.type === "card" ? "card-outline" : "qr-code-outline"} size={22} color={TEAL} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.metodoTitulo}>
                      {m.type === "card"
                        ? `${m.card_brand ?? "Cartão"} terminando em ${m.card_last4 ?? "****"}`
                        : "Pix"}
                    </Text>
                    {m.type === "card" && m.card_expiry && (
                      <Text style={styles.metodoSub}>Expira em {m.card_expiry}</Text>
                    )}
                    {m.is_default && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>Padrão</Text>
                      </View>
                    )}
                  </View>
                  <TouchableOpacity onPress={() => removerMetodo(m.id)}>
                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

        {/* ---- Assinatura ---- */}
        {abaAtiva === "Assinatura" && (
          <View style={styles.painel}>
            <Text style={styles.painelTitulo}>Detalhes da assinatura</Text>
            <View style={styles.subCard}>
              <View style={styles.subRow}>
                <Text style={styles.subLabel}>Plano</Text>
                <View style={styles.planBadge}>
                  <Text style={styles.planBadgeText}>{planLabel(usuario?.plan ?? "")}</Text>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.subRow}>
                <Text style={styles.subLabel}>Status</Text>
                <View style={[styles.statusBadge, usuario?.plan === "basico" ? styles.statusGratuito : styles.statusAtivo]}>
                  <Text style={styles.statusBadgeText}>{usuario?.plan === "basico" ? "Gratuito" : "Ativo"}</Text>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.subRow}>
                <Text style={styles.subLabel}>Próxima renovação</Text>
                <Text style={styles.subValor}>
                  {usuario?.plan_expires_at
                    ? new Date(usuario.plan_expires_at).toLocaleDateString("pt-BR")
                    : "Sem data de renovação"}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.subRow}>
                <Text style={styles.subLabel}>Valor</Text>
                <Text style={styles.subValor}>
                  {usuario?.plan === "basico" ? "Gratuito" : usuario?.plan === "padrao" ? "R$ 29,00/mês" : "R$ 79,00/mês"}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={[styles.btnPrimary, { marginTop: 16 }]} onPress={() => router.push("/(tabs)/planos" as any)}>
              <Text style={styles.btnPrimaryText}>Comparar planos</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 48 }} />
      </ScrollView>

      {/* Modal: Excluir conta */}
      <Modal visible={modalExcluir} transparent animationType="fade" onRequestClose={() => setModalExcluir(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setModalExcluir(false)}>
          <Pressable style={styles.modalBox} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitulo}>Excluir conta</Text>
            <Text style={styles.modalDesc}>
              Esta ação é permanente. Digite sua senha para confirmar.
            </Text>
            <TextInput
              style={[styles.campoInput, { marginTop: 12 }]}
              value={senhaExcluir}
              onChangeText={setSenhaExcluir}
              placeholder="Sua senha atual"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              autoCapitalize="none"
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.btnGhost} onPress={() => { setModalExcluir(false); setSenhaExcluir(""); }}>
                <Text style={styles.btnGhostText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnDanger} onPress={excluirConta} disabled={excluindo}>
                {excluindo ? <ActivityIndicator color="white" size="small" /> : <Text style={styles.btnDangerText}>Excluir conta</Text>}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7f8" },
  loading: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f5f7f8" },

  headerBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingTop: 56, paddingBottom: 12, paddingHorizontal: 16,
    backgroundColor: "white", borderBottomWidth: 0.5, borderBottomColor: "#e2e8f0",
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 16, fontWeight: "700", color: "#0f172a" },

  avatarSection: {
    backgroundColor: "white", paddingVertical: 24, alignItems: "center",
    borderBottomWidth: 0.5, borderBottomColor: "#e2e8f0",
  },
  avatarCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: TEAL, alignItems: "center", justifyContent: "center", marginBottom: 12,
  },
  avatarText: { color: "white", fontSize: 26, fontWeight: "700" },
  avatarNome: { fontSize: 18, fontWeight: "700", color: "#0f172a", marginBottom: 2 },
  avatarEmail: { fontSize: 13, color: "#64748b", marginBottom: 10 },

  planBadge: { backgroundColor: "#e6f4f4", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  planBadgeText: { fontSize: 12, fontWeight: "600", color: TEAL },

  abasScroll: { backgroundColor: "white", borderBottomWidth: 0.5, borderBottomColor: "#e2e8f0" },
  abasContent: { paddingHorizontal: 12, flexDirection: "row" },
  aba: { paddingHorizontal: 12, paddingVertical: 14 },
  abaAtiva: { borderBottomWidth: 2, borderBottomColor: TEAL },
  abaText: { fontSize: 14, color: "#94a3b8", fontWeight: "500" },
  abaTextAtiva: { color: TEAL, fontWeight: "700" },

  painel: { margin: 16, backgroundColor: "white", borderRadius: 14, borderWidth: 0.5, borderColor: "#e2e8f0", padding: 20 },
  painelTitulo: { fontSize: 15, fontWeight: "700", color: "#0f172a", marginBottom: 16 },

  campo: { marginBottom: 16 },
  campoLabel: { fontSize: 12, fontWeight: "600", color: "#475569", marginBottom: 6 },
  campoInput: {
    borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 11, fontSize: 14,
    color: "#0f172a", backgroundColor: "#f8fafc",
  },
  campoInputDisabled: { backgroundColor: "#f1f5f9", color: "#94a3b8" },
  campoHint: { fontSize: 11, color: "#94a3b8", marginTop: 4 },

  botoesRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 4 },
  btnPrimary: { backgroundColor: TEAL, borderRadius: 10, paddingVertical: 13, paddingHorizontal: 20, alignItems: "center" },
  btnPrimaryText: { color: "white", fontWeight: "700", fontSize: 14 },
  btnGhost: { paddingVertical: 13 },
  btnGhostText: { color: "#64748b", fontSize: 14, fontWeight: "500" },
  btnDanger: { backgroundColor: "#ef4444", borderRadius: 10, paddingVertical: 11, paddingHorizontal: 16, alignItems: "center" },
  btnDangerText: { color: "white", fontWeight: "700", fontSize: 13 },

  inputSenhaWrap: { position: "relative", marginBottom: 14 },
  olhoBtn: { position: "absolute", right: 12, top: 12 },

  divider: { height: 0.5, backgroundColor: "#e2e8f0", marginVertical: 16 },

  dangerCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "#fff5f5", borderRadius: 10, padding: 14,
    borderWidth: 0.5, borderColor: "#fecaca",
  },
  dangerTitulo: { fontSize: 14, fontWeight: "600", color: "#ef4444", marginBottom: 3 },
  dangerDesc: { fontSize: 12, color: "#94a3b8", lineHeight: 17 },

  emptyState: { alignItems: "center", paddingVertical: 32, gap: 8 },
  emptyTitulo: { fontSize: 15, fontWeight: "600", color: "#475569" },
  emptyDesc: { fontSize: 13, color: "#94a3b8", textAlign: "center" },

  metodoCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: "#e2e8f0",
  },
  metodoIconWrap: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "#e6f4f4", alignItems: "center", justifyContent: "center",
  },
  metodoTitulo: { fontSize: 14, fontWeight: "600", color: "#0f172a", marginBottom: 2 },
  metodoSub: { fontSize: 12, color: "#64748b" },
  defaultBadge: { backgroundColor: "#e6f4f4", alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginTop: 4 },
  defaultBadgeText: { fontSize: 10, fontWeight: "600", color: TEAL },

  subCard: { borderWidth: 0.5, borderColor: "#e2e8f0", borderRadius: 10, overflow: "hidden" },
  subRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14 },
  subLabel: { fontSize: 13, color: "#64748b", fontWeight: "500" },
  subValor: { fontSize: 13, color: "#0f172a", fontWeight: "600" },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  statusAtivo: { backgroundColor: "#dcfce7" },
  statusGratuito: { backgroundColor: "#f1f5f9" },
  statusBadgeText: { fontSize: 12, fontWeight: "600", color: "#16a34a" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" },
  modalBox: { backgroundColor: "white", borderRadius: 16, padding: 24, width: "85%", gap: 4 },
  modalTitulo: { fontSize: 17, fontWeight: "700", color: "#0f172a", marginBottom: 4 },
  modalDesc: { fontSize: 13, color: "#64748b", lineHeight: 18 },
  modalBtns: { flexDirection: "row", justifyContent: "flex-end", gap: 12, marginTop: 16 },
});