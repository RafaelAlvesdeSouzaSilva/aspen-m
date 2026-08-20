import { Ionicons } from "@expo/vector-icons";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import {
  ActivityIndicator, Alert, Image, KeyboardAvoidingView, Modal,
  Platform, Pressable, ScrollView, StyleSheet, Text,
  TextInput, TouchableOpacity, View,
} from "react-native";
import { auth } from "@/services/firebase";
import api from "@/services/api";
import { useI18n } from "@/contexts/i18n";

const TEAL = "#0b6b6b";

type Usuario = {
  id: string; name: string; email: string;
  phone: string | null; document: string | null;
  plan: string; plan_expires_at: string | null;
};

type MetodoPagamento = {
  id: string; type: "card" | "pix";
  card_last4?: string; card_brand?: string;
  card_expiry?: string; is_default?: boolean;
};

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
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function iniciais(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0].toUpperCase()).join("");
}

export default function Perfil() {
  const router = useRouter();
  const { t, colors, photoUri, setPhotoUri, theme } = useI18n();
  const [uid, setUid] = useState<string | null>(null);

  const ABAS = [t("personalData"), t("security"), t("payment"), t("subscription")];
  const [abaAtiva, setAbaAtiva] = useState(0);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");

  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [trocandoSenha, setTrocandoSenha] = useState(false);
  const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false);
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  const [metodos, setMetodos] = useState<MetodoPagamento[]>([]);
  const [carregandoMetodos, setCarregandoMetodos] = useState(false);

  const [modalExcluir, setModalExcluir] = useState(false);
  const [modalFoto, setModalFoto] = useState(false);
  const [senhaExcluir, setSenhaExcluir] = useState("");
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => { carregarUsuario(); }, []);
  useEffect(() => { if (abaAtiva === 2) carregarMetodos(); }, [abaAtiva]);

  async function carregarUsuario() {
    try {
      const res = await api.get("/auth/me");
      const u: Usuario = res.data.data?.user ?? res.data;
      setUsuario(u);
      setUid(u.id ?? null);
      setNome(u.name ?? "");
      setTelefone(u.phone ? formatPhone(u.phone) : "");
      setCpf(u.document ? formatCpf(u.document) : "");
    } catch {
      Alert.alert(t("error"), t("profileError"));
    } finally {
      setCarregando(false);
    }
  }

  async function carregarMetodos() {
    setCarregandoMetodos(true);
    try {
      const res = await api.get("/payment-methods");
      setMetodos(res.data ?? []);
    } catch { setMetodos([]); }
    finally { setCarregandoMetodos(false); }
  }

  async function salvarDados() {
    if (!nome.trim() || nome.trim().length < 3) {
      Alert.alert(t("attention"), t("nameTooShort")); return;
    }
    setSalvando(true);
    try {
      const res = await api.put("/auth/profile", {
        name: nome.trim(),
        phone: telefone.replace(/\D/g, "") || null,
        document: cpf.replace(/\D/g, "") || null,
      });
      if (res.data.user) setUsuario(res.data.user);
      Alert.alert(t("success"), t("profileSaved"));
    } catch { Alert.alert(t("error"), t("profileError")); }
    finally { setSalvando(false); }
  }

  async function trocarSenha() {
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      Alert.alert(t("attention"), t("fillAllFields")); return;
    }
    if (novaSenha.length < 8) {
      Alert.alert(t("attention"), t("passwordTooShort")); return;
    }
    if (novaSenha !== confirmarSenha) {
      Alert.alert(t("attention"), t("passwordMismatch")); return;
    }
    setTrocandoSenha(true);
    try {
      const user = auth.currentUser;
      if (!user || !user.email) throw new Error("expired");
      const cred = EmailAuthProvider.credential(user.email, senhaAtual);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, novaSenha);
      setSenhaAtual(""); setNovaSenha(""); setConfirmarSenha("");
      Alert.alert(t("success"), t("passwordUpdated"));
    } catch (err: any) {
      const msg = err?.code === "auth/wrong-password" || err?.code === "auth/invalid-credential"
        ? t("passwordWrong")
        : err?.code === "auth/weak-password" ? t("passwordWeak") : t("passwordError");
      Alert.alert(t("error"), msg);
    } finally { setTrocandoSenha(false); }
  }

  async function excluirConta() {
    if (!senhaExcluir) { Alert.alert(t("attention"), t("deleteConfirm")); return; }
    setExcluindo(true);
    try {
      const user = auth.currentUser;
      if (!user || !user.email) throw new Error("expired");
      const cred = EmailAuthProvider.credential(user.email, senhaExcluir);
      await reauthenticateWithCredential(user, cred);
      await api.delete("/auth/account");
      await auth.currentUser?.delete();
      setModalExcluir(false);
      router.replace("/login");
    } catch (err: any) {
      const msg = err?.code === "auth/wrong-password" || err?.code === "auth/invalid-credential"
        ? t("passwordWrong") : t("deleteError");
      Alert.alert(t("error"), msg);
    } finally { setExcluindo(false); }
  }

  async function removerMetodo(id: string) {
    Alert.alert(t("removeMethod"), t("removeMethodConfirm"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("remove"), style: "destructive", onPress: async () => {
          try {
            await api.delete(`/payment-methods/${id}`);
            setMetodos((prev) => prev.filter((m) => m.id !== id));
          } catch { Alert.alert(t("error"), t("removeError")); }
        },
      },
    ]);
  }

  async function selecionarFoto() {
    setModalFoto(false);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(t("attention"), t("photoError")); return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri, uid ?? undefined);
    }
  }

  async function removerFoto() {
    setModalFoto(false);
    setPhotoUri(null, uid ?? undefined);
  }

  const planLabel = (p: string) => ({
    basico: t("planBasico"), padrao: t("planPadrao"), premium: t("planPremium"),
  }[p] ?? p);

  if (carregando) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={TEAL} />
      </View>
    );
  }

  const inics = iniciais(usuario?.name ?? "?");
  
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      {/* Header */}
      <View style={[styles.headerBar, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.inputBg }]}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerLogo}>
  <Image
    source={theme === "dark"
      ? require("@/assets/images/logo-icone.png")
      : require("@/assets/images/logo-alt.png")}
    style={{ width: 18, height: 18 }}
    resizeMode="contain"
  />
  <Text style={[styles.headerLogoText, { color: colors.text }]}>ASPEN CORE</Text>
</View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
        {/* Avatar */}
        <View style={[styles.avatarSection, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
          <TouchableOpacity style={styles.avatarWrap} onPress={() => setModalFoto(true)}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{inics}</Text>
              </View>
            )}
            <View style={styles.avatarEditBtn}>
              <Ionicons name="camera-outline" size={14} color="white" />
            </View>
          </TouchableOpacity>
          <Text style={[styles.avatarNome, { color: colors.text }]}>{usuario?.name ?? "—"}</Text>
          <Text style={[styles.avatarEmail, { color: colors.textSec }]}>{usuario?.email ?? "—"}</Text>
          <View style={styles.planBadge}>
            <Text style={styles.planBadgeText}>{t("profile")} · {planLabel(usuario?.plan ?? "")}</Text>
          </View>
        </View>

        {/* Abas */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.abasScroll, { backgroundColor: colors.abasBg, borderBottomColor: colors.border }]} contentContainerStyle={styles.abasContent}>
          {ABAS.map((aba, i) => (
            <TouchableOpacity key={aba} style={[styles.aba, abaAtiva === i && styles.abaAtiva]} onPress={() => setAbaAtiva(i)}>
              <Text style={[styles.abaText, { color: colors.textMuted }, abaAtiva === i && styles.abaTextAtiva]}>{aba}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.content}>
          {/* ---- Dados pessoais ---- */}
          {abaAtiva === 0 && (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {[
                { label: t("fullName"), value: nome, onChange: setNome, placeholder: "Seu nome completo" },
                { label: t("phone"), value: telefone, onChange: (v: string) => setTelefone(formatPhone(v)), placeholder: "(11) 99999-9999", keyboard: "phone-pad" as any },
                { label: t("cpf"), value: cpf, onChange: (v: string) => setCpf(formatCpf(v)), placeholder: "000.000.000-00", keyboard: "numeric" as any },
              ].map((f) => (
                <View key={f.label} style={styles.campo}>
                  <Text style={[styles.campoLabel, { color: colors.textSec }]}>{f.label}</Text>
                  <TextInput
                    style={[styles.campoInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                    value={f.value} onChangeText={f.onChange}
                    placeholder={f.placeholder} placeholderTextColor={colors.textMuted}
                    keyboardType={f.keyboard}
                  />
                </View>
              ))}
              <View style={styles.campo}>
                <Text style={[styles.campoLabel, { color: colors.textSec }]}>{t("email")}</Text>
                <TextInput style={[styles.campoInput, styles.campoInputDisabled, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textMuted }]} value={usuario?.email ?? ""} editable={false} />
                <Text style={[styles.campoHint, { color: colors.textMuted }]}>{t("emailReadOnly")}</Text>
              </View>
              <View style={styles.botoesRow}>
                <TouchableOpacity style={styles.btnPrimary} onPress={salvarDados} disabled={salvando}>
                  {salvando ? <ActivityIndicator color="white" size="small" /> : <Text style={styles.btnPrimaryText}>{t("save")}</Text>}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setNome(usuario?.name ?? ""); setTelefone(usuario?.phone ? formatPhone(usuario.phone) : ""); setCpf(usuario?.document ? formatCpf(usuario.document) : ""); }}>
                  <Text style={[styles.btnGhostText, { color: colors.textSec }]}>{t("cancel")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ---- Segurança ---- */}
          {abaAtiva === 1 && (
            <View>
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.cardTitulo, { color: colors.text }]}>{t("changePassword")}</Text>
                {[
                  { value: senhaAtual, onChange: setSenhaAtual, placeholder: t("currentPassword"), show: mostrarSenhaAtual, toggle: () => setMostrarSenhaAtual(!mostrarSenhaAtual) },
                  { value: novaSenha, onChange: setNovaSenha, placeholder: t("newPassword"), show: mostrarNovaSenha, toggle: () => setMostrarNovaSenha(!mostrarNovaSenha) },
                  { value: confirmarSenha, onChange: setConfirmarSenha, placeholder: t("confirmPassword"), show: mostrarConfirmar, toggle: () => setMostrarConfirmar(!mostrarConfirmar) },
                ].map((f, i) => (
                  <View key={i} style={[styles.inputSenhaWrap, { marginBottom: 14 }]}>
                    <TextInput
                      style={[styles.campoInput, { flex: 1, backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                      value={f.value} onChangeText={f.onChange}
                      placeholder={f.placeholder} placeholderTextColor={colors.textMuted}
                      secureTextEntry={!f.show} autoCapitalize="none"
                    />
                    <TouchableOpacity style={styles.olhoBtn} onPress={f.toggle}>
                      <Ionicons name={f.show ? "eye-off-outline" : "eye-outline"} size={18} color={colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity style={styles.btnPrimary} onPress={trocarSenha} disabled={trocandoSenha}>
                  {trocandoSenha ? <ActivityIndicator color="white" size="small" /> : <Text style={styles.btnPrimaryText}>{t("updatePassword")}</Text>}
                </TouchableOpacity>
              </View>

              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 12 }]}>
                <Text style={[styles.cardTitulo, { color: colors.text }]}>{t("dangerZone")}</Text>
                <View style={styles.dangerCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.dangerTitulo}>{t("deleteAccount")}</Text>
                    <Text style={[styles.dangerDesc, { color: colors.textMuted }]}>{t("deleteAccountDesc")}</Text>
                  </View>
                  <TouchableOpacity style={styles.btnDanger} onPress={() => setModalExcluir(true)}>
                    <Text style={styles.btnDangerText}>{t("remove")}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* ---- Pagamento ---- */}
          {abaAtiva === 2 && (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.cardTitulo, { color: colors.text }]}>{t("paymentMethods")}</Text>
              {carregandoMetodos ? (
                <ActivityIndicator color={TEAL} style={{ marginTop: 16 }} />
              ) : metodos.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="card-outline" size={40} color={colors.textMuted} />
                  <Text style={[styles.emptyTitulo, { color: colors.textSec }]}>{t("noPayment")}</Text>
                  <Text style={[styles.emptyDesc, { color: colors.textMuted }]}>{t("noPaymentDesc")}</Text>
                </View>
              ) : (
                metodos.map((m) => (
                  <View key={m.id} style={[styles.metodoCard, { borderBottomColor: colors.border }]}>
                    <View style={styles.metodoIcon}>
                      <Ionicons name={m.type === "card" ? "card-outline" : "qr-code-outline"} size={22} color={TEAL} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.metodoTitulo, { color: colors.text }]}>
                        {m.type === "card" ? `${m.card_brand ?? "Cartão"} ${t("cardEnding")} ${m.card_last4 ?? "****"}` : "Pix"}
                      </Text>
                      {m.type === "card" && m.card_expiry && <Text style={[styles.metodoSub, { color: colors.textSec }]}>{t("expires")} {m.card_expiry}</Text>}
                      {m.is_default && <View style={styles.defaultBadge}><Text style={styles.defaultBadgeText}>{t("default")}</Text></View>}
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
          {abaAtiva === 3 && (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.cardTitulo, { color: colors.text }]}>{t("subscriptionDetails")}</Text>
              {[
                { label: t("currentPlan"), value: planLabel(usuario?.plan ?? "") },
                { label: t("status"), value: usuario?.plan === "basico" ? t("free") : t("active") },
                { label: t("nextRenewal"), value: usuario?.plan_expires_at ? new Date(usuario.plan_expires_at).toLocaleDateString("pt-BR") : t("noRenewal") },
                { label: t("price"), value: usuario?.plan === "basico" ? t("free") : usuario?.plan === "padrao" ? "R$ 29,00/mês" : "R$ 79,00/mês" },
              ].map((row, i, arr) => (
                <View key={row.label}>
                  <View style={styles.subRow}>
                    <Text style={[styles.subLabel, { color: colors.textSec }]}>{row.label}</Text>
                    <Text style={[styles.subValor, { color: colors.text }]}>{row.value}</Text>
                  </View>
                  {i < arr.length - 1 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
                </View>
              ))}
              <TouchableOpacity style={[styles.btnPrimary, { marginTop: 16 }]} onPress={() => router.push("/(tabs)/planos" as any)}>
                <Text style={styles.btnPrimaryText}>{t("comparePlans")}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={{ height: 48 }} />
      </ScrollView>

      {/* Modal: foto */}
      <Modal visible={modalFoto} transparent animationType="slide" onRequestClose={() => setModalFoto(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setModalFoto(false)}>
          <Pressable style={[styles.modalSheet, { backgroundColor: colors.card }]} onPress={(e) => e.stopPropagation()}>
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
            <Text style={[styles.modalTitulo, { color: colors.text }]}>{t("changePhoto")}</Text>
            <TouchableOpacity style={styles.modalOpcao} onPress={selecionarFoto}>
              <Ionicons name="image-outline" size={22} color={TEAL} />
              <Text style={[styles.modalOpcaoText, { color: colors.text }]}>{t("gallery")}</Text>
            </TouchableOpacity>
            {photoUri && (
              <TouchableOpacity style={styles.modalOpcao} onPress={removerFoto}>
                <Ionicons name="trash-outline" size={22} color="#ef4444" />
                <Text style={[styles.modalOpcaoText, { color: "#ef4444" }]}>{t("removePhoto")}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.modalFechar, { borderTopColor: colors.border }]} onPress={() => setModalFoto(false)}>
              <Text style={[styles.modalFecharText, { color: colors.textSec }]}>{t("cancel")}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal: excluir conta */}
      <Modal visible={modalExcluir} transparent animationType="fade" onRequestClose={() => setModalExcluir(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setModalExcluir(false)}>
          <Pressable style={[styles.modalBox, { backgroundColor: colors.card }]} onPress={(e) => e.stopPropagation()}>
            <Text style={[styles.modalTitulo, { color: colors.text }]}>{t("deleteAccount")}</Text>
            <Text style={[styles.modalDesc, { color: colors.textSec }]}>{t("deleteAccountDesc")}</Text>
            <TextInput
              style={[styles.campoInput, { marginTop: 16, backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
              value={senhaExcluir} onChangeText={setSenhaExcluir}
              placeholder={t("currentPassword")} placeholderTextColor={colors.textMuted}
              secureTextEntry autoCapitalize="none"
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity onPress={() => { setModalExcluir(false); setSenhaExcluir(""); }}>
                <Text style={[styles.btnGhostText, { color: colors.textSec }]}>{t("cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnDanger} onPress={excluirConta} disabled={excluindo}>
                {excluindo ? <ActivityIndicator color="white" size="small" /> : <Text style={styles.btnDangerText}>{t("deleteAccount")}</Text>}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 56, paddingBottom: 14, paddingHorizontal: 16, borderBottomWidth: 0.5 },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  headerLogo: { flexDirection: "row", alignItems: "center", gap: 6 },
  headerLogoText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.8 },
  avatarSection: { paddingVertical: 28, alignItems: "center", borderBottomWidth: 0.5 },
  avatarWrap: { position: "relative", marginBottom: 14 },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: TEAL, alignItems: "center", justifyContent: "center" },
  avatarImg: { width: 80, height: 80, borderRadius: 40 },
  avatarText: { color: "white", fontSize: 28, fontWeight: "700" },
  avatarEditBtn: { position: "absolute", bottom: 0, right: 0, width: 26, height: 26, borderRadius: 13, backgroundColor: TEAL, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "white" },
  avatarNome: { fontSize: 20, fontWeight: "700", marginBottom: 3 },
  avatarEmail: { fontSize: 13, marginBottom: 12 },
  planBadge: { backgroundColor: "#e6f4f4", paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20 },
  planBadgeText: { fontSize: 12, fontWeight: "600", color: TEAL },
  abasScroll: { borderBottomWidth: 0.5 },
  abasContent: { paddingHorizontal: 8 },
  aba: { paddingHorizontal: 14, paddingVertical: 16 },
  abaAtiva: { borderBottomWidth: 2, borderBottomColor: TEAL },
  abaText: { fontSize: 13, fontWeight: "500" },
  abaTextAtiva: { color: TEAL, fontWeight: "700" },
  content: { padding: 16 },
  card: { borderRadius: 14, borderWidth: 0.5, padding: 20 },
  cardTitulo: { fontSize: 15, fontWeight: "700", marginBottom: 16 },
  campo: { marginBottom: 16 },
  campoLabel: { fontSize: 12, fontWeight: "600", marginBottom: 6 },
  campoInput: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, fontSize: 14 },
  campoInputDisabled: { opacity: 0.6 },
  campoHint: { fontSize: 11, marginTop: 4 },
  botoesRow: { flexDirection: "row", alignItems: "center", gap: 16, marginTop: 4 },
  btnPrimary: { backgroundColor: TEAL, borderRadius: 10, paddingVertical: 13, paddingHorizontal: 20, alignItems: "center" },
  btnPrimaryText: { color: "white", fontWeight: "700", fontSize: 14 },
  btnGhostText: { fontSize: 14, fontWeight: "500" },
  btnDanger: { backgroundColor: "#ef4444", borderRadius: 10, paddingVertical: 11, paddingHorizontal: 16, alignItems: "center" },
  btnDangerText: { color: "white", fontWeight: "700", fontSize: 13 },
  inputSenhaWrap: { flexDirection: "row", alignItems: "center" },
  olhoBtn: { position: "absolute", right: 12, top: 12 },
  dangerCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#fff5f5", borderRadius: 10, padding: 14, borderWidth: 0.5, borderColor: "#fecaca" },
  dangerTitulo: { fontSize: 14, fontWeight: "600", color: "#ef4444", marginBottom: 3 },
  dangerDesc: { fontSize: 12, lineHeight: 17 },
  emptyState: { alignItems: "center", paddingVertical: 32, gap: 8 },
  emptyTitulo: { fontSize: 15, fontWeight: "600" },
  emptyDesc: { fontSize: 13, textAlign: "center" },
  metodoCard: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, borderBottomWidth: 0.5 },
  metodoIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#e6f4f4", alignItems: "center", justifyContent: "center" },
  metodoTitulo: { fontSize: 14, fontWeight: "600", marginBottom: 2 },
  metodoSub: { fontSize: 12 },
  defaultBadge: { backgroundColor: "#e6f4f4", alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginTop: 4 },
  defaultBadgeText: { fontSize: 10, fontWeight: "600", color: TEAL },
  divider: { height: 0.5 },
  subRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14 },
  subLabel: { fontSize: 13, fontWeight: "500" },
  subValor: { fontSize: 13, fontWeight: "600" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalSheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 36 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 16 },
  modalBox: { margin: 24, borderRadius: 16, padding: 24 },
  modalTitulo: { fontSize: 17, fontWeight: "700", marginBottom: 12 },
  modalDesc: { fontSize: 13, lineHeight: 18 },
  modalOpcao: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 16 },
  modalOpcaoText: { fontSize: 16, fontWeight: "500" },
  modalFechar: { borderTopWidth: 0.5, marginTop: 8, paddingTop: 16, alignItems: "center" },
  modalFecharText: { fontSize: 15, fontWeight: "600" },
  modalBtns: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", gap: 16, marginTop: 16 },
});