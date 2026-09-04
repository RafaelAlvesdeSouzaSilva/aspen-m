import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image, Modal, Pressable, ScrollView, StyleSheet,
  Text, TouchableOpacity, View,
} from "react-native";

const LOGO_ESCURA = require("@/assets/images/logo-alt.png");
const LOGO_CLARA = require("@/assets/images/logo-icone.png");
import { signOut } from "firebase/auth";
import { collection, query, orderBy, limit, onSnapshot, type Timestamp } from "firebase/firestore";
import { auth, db } from "@/services/firebase";
import api from "@/services/api";
import { registerSession } from "@/services/session";
import { useI18n } from "@/contexts/i18n";

const TEAL = "#0b6b6b";

type Usuario = { name: string; email: string; plan: string; plan_expires_at: string | null };

type AtividadeItem = {
  id: string;
  type: string;
  severity: "info" | "warning";
  title: string;
  deviceName: string | null;
  created_at: string;
};

type NotifPreview = {
  id: string;
  title: string;
  text: string;
  type: string;
  read: boolean;
};

// Esse backend às vezes devolve o payload sem o aninhamento {data:{...}}
// esperado — mesmo cuidado aplicado nas outras telas (planos, dispositivos,
// avaliações). Sem isso, partes da tela liam undefined mesmo com a
// requisição respondendo certo.
function extrairUsuario(res: any): Usuario | null {
  return res.data?.data?.user ?? res.data?.user ?? res.data ?? null;
}
function extrairSummary(res: any): any {
  return res.data?.data ?? res.data ?? {};
}

const ICONE_ATIVIDADE: Record<string, keyof typeof Ionicons.glyphMap> = {
  device_added: "phone-portrait-outline",
  device_removed: "trash-outline",
  login: "log-in-outline",
  login_alert: "warning-outline",
  password_changed: "key-outline",
};

const ICONE_NOTIF: Record<string, { icon: keyof typeof Ionicons.glyphMap; cor: string }> = {
  danger: { icon: "warning-outline", cor: "#ef4444" },
  success: { icon: "checkmark-circle-outline", cor: "#16a34a" },
  info: { icon: "information-circle-outline", cor: TEAL },
  warning: { icon: "warning-outline", cor: "#f59e0b" },
  security: { icon: "shield-checkmark-outline", cor: TEAL },
  default: { icon: "notifications-outline", cor: "#94a3b8" },
};

function formatarRelativo(dataStr: string) {
  const d = new Date(dataStr);
  const diffMin = Math.floor((Date.now() - d.getTime()) / 60000);
  if (diffMin < 1) return "Agora mesmo";
  if (diffMin < 60) return `Há ${diffMin} min`;
  if (diffMin < 1440) return `Há ${Math.floor(diffMin / 60)} h`;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export default function Dashboard() {
  const router = useRouter();
  const { colors, photoUri, t, theme } = useI18n();
  const logo = theme === "dark" ? LOGO_CLARA : LOGO_ESCURA;
  const [menuAberto, setMenuAberto] = useState(false);
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  const [numDispositivos, setNumDispositivos] = useState("—");
  const [numOnline, setNumOnline] = useState(0);
  const [alertasAtual, setAlertasAtual] = useState<number | null>(null);
  const [alertasAnterior, setAlertasAnterior] = useState(0);
  const [protecao, setProtecao] = useState<string | null>(null);
  const [atividade, setAtividade] = useState<AtividadeItem[]>([]);
  const [carregandoResumo, setCarregandoResumo] = useState(true);

  const [notifs, setNotifs] = useState<NotifPreview[]>([]);

  const hoje = new Date().toLocaleDateString("pt-BR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  useEffect(() => {
    registerSession(); // fire-and-forget, igual ao loadUser() do web

    async function carregar() {
      try {
        const [resUser, resSummary] = await Promise.all([
          api.get("/auth/me"),
          // Endpoint que o Igor já tinha pronto no backend e o mobile nunca
          // usava — calcula dispositivos/alertas/nível de proteção/atividade
          // de verdade a partir dos eventos reais da conta, em vez de
          // valores fixos ("2 alertas", "Alto" sempre).
          api.get("/dashboard/summary"),
        ]);
        setUsuario(extrairUsuario(resUser));

        const summary = extrairSummary(resSummary);
        setNumDispositivos(String(summary?.devices?.total ?? 0));
        setNumOnline(summary?.devices?.online ?? 0);
        setAlertasAtual(summary?.alerts?.current ?? 0);
        setAlertasAnterior(summary?.alerts?.previous ?? 0);
        setProtecao(summary?.protectionLevel ?? null);
        setAtividade(Array.isArray(summary?.activity) ? summary.activity.slice(0, 3) : []);
      } catch (err) {
        console.error("Erro ao carregar dashboard:", err);
      } finally {
        setCarregandoResumo(false);
      }
    }
    carregar();
  }, []);

  // Prévia das notificações — mesma fonte (Firestore em tempo real) da
  // tela de notificações, só que limitada às 3 mais recentes.
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const q = query(collection(db, "users", uid, "notifications"), orderBy("created_at", "desc"), limit(3));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotifs(snapshot.docs.map((docSnap) => {
        const d = docSnap.data() as any;
        return {
          id: docSnap.id,
          title: d.title || "",
          text: d.text || "",
          type: d.type || "default",
          read: d.read === 1 || d.read === true,
        };
      }));
    });
    return unsubscribe;
  }, []);

  const primeiroNome = usuario?.name?.split(" ")[0] ?? t("loading");
  const iniciais = usuario?.name
    ? usuario.name.split(" ").map((p: string) => p[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  const planLabel = (plan: string) => ({
    basico: t("planBasico"), padrao: t("planPadrao"), premium: t("planPremium"),
  }[plan] ?? plan);

  const planSub = () => {
    if (!usuario) return t("loading");
    if (usuario.plan_expires_at) {
      return `${t("active")} ${new Date(usuario.plan_expires_at).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}`;
    }
    return usuario.plan === "basico" ? t("free") : t("active");
  };

  const PROTECAO_LABEL: Record<string, string> = {
    alto: t("high"), medio: "Médio", baixo: "Baixo", sem_dados: "—",
  };

  const alertasSub = () => {
    if (alertasAtual === null) return "—";
    if (alertasAtual === 0) return "Nenhum alerta";
    if (alertasAnterior === 0) return `${alertasAtual} este mês`;
    const variacao = Math.round(((alertasAtual - alertasAnterior) / alertasAnterior) * 100);
    return variacao <= 0 ? `↓ ${Math.abs(variacao)}% que mês anterior` : `↑ ${variacao}% que mês anterior`;
  };

  const metricas = [
    { label: t("deviceCount"), valor: numDispositivos, sub: numOnline > 0 ? `${numOnline} online` : t("allOnline"), subColor: "#16a34a", icon: "phone-portrait-outline" },
    { label: t("subscriptionStatus"), valor: usuario ? planLabel(usuario.plan) : "—", sub: planSub(), subColor: TEAL, icon: "ribbon-outline" },
    { label: t("alertsMonth"), valor: alertasAtual === null ? "—" : String(alertasAtual), sub: alertasSub(), subColor: (alertasAtual ?? 0) === 0 ? "#16a34a" : "#f59e0b", icon: "warning-outline" },
    { label: t("protectionLevel"), valor: protecao ? (PROTECAO_LABEL[protecao] ?? protecao) : "—", sub: protecao === "alto" ? t("configured") : "", subColor: "#16a34a", icon: "shield-checkmark-outline" },
  ];

  async function handleSair() {
    setMenuAberto(false);
    try { await signOut(auth); } catch {}
    router.replace("/login");
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView style={{ flex: 1 }}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
          <View style={styles.headerTop}>
            <View style={styles.logoWrap}>
              <Image source={logo} style={styles.logoImg} resizeMode="contain" />
              <View>
                <Text style={[styles.logoText, { color: colors.text }]}>ASPEN CORE</Text>
                <Text style={[styles.logoSub, { color: colors.textMuted }]}>{t("securityDigital").toUpperCase()}</Text>
              </View>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={[styles.navBtn, { borderColor: colors.border, backgroundColor: colors.inputBg }]} onPress={() => router.push("/(tabs)/planos" as any)}>
                <Text style={[styles.navBtnText, { color: colors.textSec }]}>{t("plans")}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.navBtn, { borderColor: colors.border, backgroundColor: colors.inputBg }]} onPress={() => router.push("/(tabs)/dispositivos" as any)}>
                <Text style={[styles.navBtnText, { color: colors.textSec }]}>{t("devices")}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.avatarCircle} onPress={() => setMenuAberto(true)}>
                {photoUri
                  ? <Image source={{ uri: photoUri }} style={styles.avatarImg} />
                  : <Text style={styles.avatarText}>{iniciais}</Text>}
              </TouchableOpacity>
            </View>
          </View>

          <Text style={[styles.saudacao, { color: colors.text }]}>{t("welcome")} {primeiroNome}!</Text>
          <Text style={[styles.dataHoje, { color: colors.textMuted }]}>{hoje}</Text>
          <Text style={[styles.headerSub, { color: colors.textSec }]}>{t("securitySummary")}</Text>

          <TouchableOpacity style={styles.btnNfc} onPress={() => router.push("/desbloqueio" as any)}>
            <View style={styles.btnNfcIconWrap}>
              <Ionicons name="wifi-outline" size={22} color="white" />
            </View>
            <View style={styles.btnNfcTextos}>
              <Text style={styles.btnNfcTitulo}>{t("nfcMode")}</Text>
              <Text style={styles.btnNfcDesc}>{t("nfcDesc")}</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={18} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </View>

        {/* Métricas */}
        <View style={styles.section}>
          <View style={styles.metricasGrid}>
            {metricas.map((m) => (
              <View key={m.label} style={[styles.metricaCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Ionicons name={m.icon as any} size={18} color={TEAL} style={{ marginBottom: 8 }} />
                <Text style={[styles.metricaLabel, { color: colors.textMuted }]}>{m.label}</Text>
                <Text style={[styles.metricaValor, { color: colors.text }]}>{m.valor}</Text>
                {!!m.sub && <Text style={[styles.metricaSub, { color: m.subColor }]}>{m.sub}</Text>}
              </View>
            ))}
          </View>
        </View>

        {/* Notificações */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("notifications")}</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/notificacao" as any)}>
              <Text style={styles.verTudo}>{t("seeAll")}</Text>
            </TouchableOpacity>
          </View>
          {notifs.length === 0 ? (
            <View style={[styles.card, styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="notifications-off-outline" size={28} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>{t("noNotifications")}</Text>
            </View>
          ) : (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {notifs.map((n, i) => {
                const cfg = ICONE_NOTIF[n.type] ?? ICONE_NOTIF.default;
                return (
                  <View key={n.id}>
                    <View style={styles.notifRow}>
                      <View style={[styles.notifIconWrap, { backgroundColor: cfg.cor + "18" }]}>
                        <Ionicons name={cfg.icon} size={18} color={cfg.cor} />
                      </View>
                      <View style={styles.notifContent}>
                        <View style={styles.notifTitleRow}>
                          {!n.read && <View style={styles.dotUnread} />}
                          <Text style={[styles.notifTitulo, { color: colors.text }]}>{n.title}</Text>
                        </View>
                        <Text style={[styles.notifDesc, { color: colors.textSec }]} numberOfLines={2}>{n.text}</Text>
                      </View>
                    </View>
                    {i < notifs.length - 1 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Atividade */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("recentActivity")}</Text>
          </View>
          {atividade.length === 0 ? (
            <View style={[styles.card, styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="time-outline" size={32} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                {carregandoResumo ? t("loading") : t("noRecentActivity")}
              </Text>
            </View>
          ) : (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {atividade.map((a, i) => (
                <View key={a.id}>
                  <View style={styles.notifRow}>
                    <View style={[styles.notifIconWrap, { backgroundColor: (a.severity === "warning" ? "#f59e0b" : TEAL) + "18" }]}>
                      <Ionicons name={ICONE_ATIVIDADE[a.type] ?? "time-outline"} size={18} color={a.severity === "warning" ? "#f59e0b" : TEAL} />
                    </View>
                    <View style={styles.notifContent}>
                      <Text style={[styles.notifTitulo, { color: colors.text }]}>{a.title}</Text>
                      {!!a.deviceName && <Text style={[styles.notifDesc, { color: colors.textSec }]}>{a.deviceName}</Text>}
                      <Text style={[styles.notifHora, { color: colors.textMuted }]}>{formatarRelativo(a.created_at)}</Text>
                    </View>
                  </View>
                  {i < atividade.length - 1 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Dropdown avatar */}
      <Modal visible={menuAberto} transparent animationType="fade" onRequestClose={() => setMenuAberto(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setMenuAberto(false)}>
          <View style={[styles.dropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.dropdownHeader}>
              <View style={styles.dropdownAvatar}>
                {photoUri
                  ? <Image source={{ uri: photoUri }} style={styles.dropdownAvatarImg} />
                  : <Text style={styles.dropdownAvatarText}>{iniciais}</Text>}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.dropdownNome, { color: colors.text }]} numberOfLines={1}>{usuario?.name ?? t("loading")}</Text>
                <Text style={[styles.dropdownEmail, { color: colors.textMuted }]} numberOfLines={1}>{usuario?.email ?? ""}</Text>
              </View>
            </View>
            <View style={[styles.dropdownDivider, { backgroundColor: colors.border }]} />
            {[
              { label: t("profile"), icon: "person-outline", route: "/(tabs)/profile" },
              { label: t("settings"), icon: "settings-outline", route: "/(tabs)/configuracoes" },
              { label: t("notifications"), icon: "notifications-outline", route: "/(tabs)/notificacao" },
              { label: "Avaliações", icon: "chatbubble-ellipses-outline", route: "/(tabs)/avaliacoes" },
            ].map((item) => (
              <TouchableOpacity key={item.label} style={styles.dropdownItem} onPress={() => { setMenuAberto(false); router.push(item.route as any); }}>
                <Ionicons name={item.icon as any} size={18} color={colors.textSec} />
                <Text style={[styles.dropdownItemText, { color: colors.text }]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
            <View style={[styles.dropdownDivider, { backgroundColor: colors.border }]} />
            <TouchableOpacity style={styles.dropdownItem} onPress={handleSair}>
              <Ionicons name="log-out-outline" size={18} color="#ef4444" />
              <Text style={[styles.dropdownItemText, { color: "#ef4444" }]}>{t("logout")}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 56, paddingHorizontal: 16, paddingBottom: 20, borderBottomWidth: 0.5 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  logoWrap: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoImg: { width: 22, height: 22 },
  logoText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.8 },
  logoSub: { fontSize: 8, letterSpacing: 0.5 },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  navBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1 },
  navBtnText: { fontSize: 12, fontWeight: "600" },
  avatarCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: TEAL, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  avatarImg: { width: 36, height: 36, borderRadius: 18 },
  avatarText: { color: "white", fontSize: 13, fontWeight: "700" },
  saudacao: { fontSize: 22, fontWeight: "700", marginBottom: 2 },
  dataHoje: { fontSize: 12, marginBottom: 4, textTransform: "capitalize" },
  headerSub: { fontSize: 13, marginBottom: 16 },
  btnNfc: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: TEAL, borderRadius: 14, padding: 14 },
  btnNfcIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  btnNfcTextos: { flex: 1 },
  btnNfcTitulo: { fontSize: 14, fontWeight: "700", color: "white", marginBottom: 2 },
  btnNfcDesc: { fontSize: 11, color: "rgba(255,255,255,0.75)" },
  section: { paddingHorizontal: 16, paddingTop: 24 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "700" },
  verTudo: { fontSize: 13, color: TEAL, fontWeight: "600" },
  metricasGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metricaCard: { borderRadius: 12, padding: 14, width: "48%", borderWidth: 0.5 },
  metricaLabel: { fontSize: 9, fontWeight: "700", letterSpacing: 0.5, marginBottom: 6 },
  metricaValor: { fontSize: 22, fontWeight: "700", marginBottom: 4 },
  metricaSub: { fontSize: 11, fontWeight: "500" },
  card: { borderRadius: 12, borderWidth: 0.5, overflow: "hidden" },
  notifRow: { flexDirection: "row", gap: 12, padding: 14 },
  notifIconWrap: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  notifContent: { flex: 1 },
  notifTitleRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 3 },
  dotUnread: { width: 7, height: 7, borderRadius: 4, backgroundColor: TEAL },
  notifTitulo: { fontSize: 14, fontWeight: "600" },
  notifDesc: { fontSize: 12, lineHeight: 18, marginBottom: 4 },
  notifHora: { fontSize: 11 },
  divider: { height: 0.5, marginHorizontal: 14 },
  emptyCard: { alignItems: "center", justifyContent: "center", padding: 32, gap: 8 },
  emptyText: { fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.15)" },
  dropdown: { position: "absolute", top: 90, right: 16, borderRadius: 14, width: 230, shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 16, elevation: 8, borderWidth: 0.5, overflow: "hidden" },
  dropdownHeader: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14 },
  dropdownAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: TEAL, alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 },
  dropdownAvatarImg: { width: 38, height: 38, borderRadius: 19 },
  dropdownAvatarText: { color: "white", fontSize: 13, fontWeight: "700" },
  dropdownNome: { fontSize: 14, fontWeight: "600" },
  dropdownEmail: { fontSize: 11 },
  dropdownDivider: { height: 0.5 },
  dropdownItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 13 },
  dropdownItemText: { fontSize: 14, fontWeight: "500" },
});