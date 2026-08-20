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
import { auth } from "@/services/firebase";
import api from "@/services/api";
import { useI18n } from "@/contexts/i18n";

const TEAL = "#0b6b6b";

export default function Dashboard() {
  const router = useRouter();
  const { colors, photoUri, t, theme } = useI18n();
  const logo = theme === "dark" ? LOGO_CLARA : LOGO_ESCURA;
  const [menuAberto, setMenuAberto] = useState(false);
  const [usuario, setUsuario] = useState<{ name: string; email: string; plan: string; plan_expires_at: string | null } | null>(null);
  const [numDispositivos, setNumDispositivos] = useState("—");

  const hoje = new Date().toLocaleDateString("pt-BR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  useEffect(() => {
    async function carregar() {
      try {
        const [resUser, resDevices] = await Promise.all([
          api.get("/auth/me"),
          api.get("/devices"),
        ]);
        const u = resUser.data.data?.user ?? resUser.data;
        setUsuario(u);
        setNumDispositivos(String(resDevices.data?.length ?? 0));
      } catch (err) {
        console.error("Erro ao carregar dashboard:", err);
      }
    }
    carregar();
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

  const metricas = [
    { label: t("deviceCount"), valor: numDispositivos, sub: t("allOnline"), subColor: "#16a34a", icon: "phone-portrait-outline" },
    { label: t("subscriptionStatus"), valor: usuario ? planLabel(usuario.plan) : "—", sub: planSub(), subColor: TEAL, icon: "ribbon-outline" },
    { label: t("alertsMonth"), valor: "2", sub: t("alertsDown"), subColor: "#16a34a", icon: "warning-outline" },
    { label: t("protectionLevel"), valor: t("high"), sub: t("configured"), subColor: "#16a34a", icon: "shield-checkmark-outline" },
  ];

  const notificacoes = [
    { titulo: "Phishing bloqueado", desc: "Tentativa bloqueada no seu iPhone 14.", hora: "Hoje, 08:42", icon: "warning-outline", iconColor: "#f59e0b" },
    { titulo: "Assinatura renovada", desc: "Assinatura renovada automaticamente.", hora: "Ontem, 10:00", icon: "checkmark-circle-outline", iconColor: "#16a34a" },
    { titulo: "Novo dispositivo", desc: "iPad Air adicionado à sua conta.", hora: "Ontem, 18:30", icon: "tablet-portrait-outline", iconColor: TEAL },
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
                <Text style={[styles.metricaSub, { color: m.subColor }]}>{m.sub}</Text>
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
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {notificacoes.map((n, i) => (
              <View key={n.titulo}>
                <View style={styles.notifRow}>
                  <View style={[styles.notifIconWrap, { backgroundColor: n.iconColor + "18" }]}>
                    <Ionicons name={n.icon as any} size={18} color={n.iconColor} />
                  </View>
                  <View style={styles.notifContent}>
                    <View style={styles.notifTitleRow}>
                      <View style={styles.dotUnread} />
                      <Text style={[styles.notifTitulo, { color: colors.text }]}>{n.titulo}</Text>
                    </View>
                    <Text style={[styles.notifDesc, { color: colors.textSec }]}>{n.desc}</Text>
                    <Text style={[styles.notifHora, { color: colors.textMuted }]}>{n.hora}</Text>
                  </View>
                </View>
                {i < notificacoes.length - 1 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
              </View>
            ))}
          </View>
        </View>

        {/* Atividade */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("recentActivity")}</Text>
            <TouchableOpacity><Text style={styles.verTudo}>{t("seeMore")}</Text></TouchableOpacity>
          </View>
          <View style={[styles.card, styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="time-outline" size={32} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>{t("noRecentActivity")}</Text>
          </View>
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