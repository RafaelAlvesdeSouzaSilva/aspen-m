import { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  collection, doc, updateDoc, query, orderBy, onSnapshot,
  type Timestamp,
} from "firebase/firestore";
import Header from "@/components/Header";
import { useI18n } from "@/contexts/i18n";
import { auth, db } from "@/services/firebase";

const TEAL = "#0b6b6b";

type TipoNotif = "danger" | "success" | "info" | "warning" | "security" | "summary" | "default";

type Notificacao = {
  id: string;
  title: string;
  text: string;
  type: TipoNotif;
  read: boolean;
  created_at: Timestamp | null;
};

const ICONE_POR_TIPO: Record<TipoNotif, { icon: keyof typeof Ionicons.glyphMap; cor: string }> = {
  danger: { icon: "warning-outline", cor: "#ef4444" },
  success: { icon: "checkmark-circle-outline", cor: "#16a34a" },
  info: { icon: "information-circle-outline", cor: TEAL },
  warning: { icon: "warning-outline", cor: "#f59e0b" },
  security: { icon: "shield-checkmark-outline", cor: TEAL },
  summary: { icon: "bar-chart-outline", cor: TEAL },
  default: { icon: "notifications-outline", cor: "#94a3b8" },
};

function formatarData(ts: Timestamp | null) {
  if (!ts) return "Agora mesmo";
  const d = ts.toDate ? ts.toDate() : new Date(ts as any);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function Notificacoes() {
  const { colors, t } = useI18n();
  const [notifs, setNotifs] = useState<Notificacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState("all");

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      setCarregando(false);
      return;
    }
    const notifRef = collection(db, "users", uid, "notifications");
    const q = query(notifRef, orderBy("created_at", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const lista: Notificacao[] = snapshot.docs.map((docSnap) => {
          const d = docSnap.data() as any;
          return {
            id: docSnap.id,
            title: d.title || "",
            text: d.text || "",
            type: (d.type as TipoNotif) || "default",
            read: d.read === 1 || d.read === true,
            created_at: d.created_at ?? null,
          };
        });
        setNotifs(lista);
        setCarregando(false);
      },
      () => setCarregando(false),
    );
    return unsubscribe;
  }, []);

  async function marcarLida(id: string) {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    // Atualização otimista — o listener do Firestore confirma em seguida
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await updateDoc(doc(db, "users", uid, "notifications", id), { read: 1 });
    } catch {
      // Se falhar, o próximo snapshot do Firestore corrige o estado sozinho
    }
  }

  async function marcarTodasLidas() {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const naoLidas = notifs.filter((n) => !n.read);
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await Promise.all(
        naoLidas.map((n) => updateDoc(doc(db, "users", uid, "notifications", n.id), { read: 1 })),
      );
    } catch {
      // idem: o snapshot em tempo real reconcilia o estado
    }
  }

  const naoLidas = notifs.filter((n) => !n.read).length;

  const abas = [
    { key: "all", label: t("allTab") },
    { key: "unread", label: t("unreadTab") },
    { key: "read", label: t("readTab") },
  ];

  const filtradas =
    abaAtiva === "all" ? notifs : abaAtiva === "unread" ? notifs.filter((n) => !n.read) : notifs.filter((n) => n.read);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bg }]}>
      <Header titulo={t("notifications")} subtitulo={t("notificationsSubtitulo")} />

      <View style={[styles.abasWrap, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        {abas.map((aba) => (
          <TouchableOpacity key={aba.key} style={[styles.aba, abaAtiva === aba.key && styles.abaAtiva]} onPress={() => setAbaAtiva(aba.key)}>
            <Text style={[styles.abaText, { color: colors.textMuted }, abaAtiva === aba.key && styles.abaTextAtiva]}>{aba.label}</Text>
            {aba.key === "unread" && naoLidas > 0 && (
              <View style={styles.abaBadge}><Text style={styles.abaBadgeText}>{naoLidas}</Text></View>
            )}
          </TouchableOpacity>
        ))}
        {naoLidas > 0 && (
          <TouchableOpacity style={styles.marcarTodasBtn} onPress={marcarTodasLidas}>
            <Text style={styles.marcarTodasText}>{t("markAllRead")}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        {carregando ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ActivityIndicator color={TEAL} />
          </View>
        ) : filtradas.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="notifications-off-outline" size={40} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>{t("noNotifications")}</Text>
          </View>
        ) : (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {filtradas.map((n, i) => {
              const cfg = ICONE_POR_TIPO[n.type] ?? ICONE_POR_TIPO.default;
              return (
                <View key={n.id}>
                  <View style={styles.notifRow}>
                    <View style={[styles.notifIconWrap, { backgroundColor: cfg.cor + "18" }]}>
                      <Ionicons name={cfg.icon} size={20} color={cfg.cor} />
                    </View>
                    <View style={styles.notifContent}>
                      <View style={styles.notifTitleRow}>
                        {!n.read && <View style={styles.dot} />}
                        <Text style={[styles.notifTitulo, { color: colors.text }]}>{n.title}</Text>
                      </View>
                      <Text style={[styles.notifDesc, { color: colors.textSec }]}>{n.text}</Text>
                      <View style={styles.notifFooter}>
                        <Text style={[styles.notifHora, { color: colors.textMuted }]}>{formatarData(n.created_at)}</Text>
                        {!n.read && (
                          <TouchableOpacity onPress={() => marcarLida(n.id)}>
                            <Text style={styles.marcarLida}>{t("markRead")}</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                  {i < filtradas.length - 1 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
                </View>
              );
            })}
          </View>
        )}
      </View>
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  abasWrap: { flexDirection: "row", alignItems: "center", borderBottomWidth: 0.5, paddingHorizontal: 16 },
  aba: { paddingVertical: 14, paddingHorizontal: 4, marginRight: 16, flexDirection: "row", alignItems: "center", gap: 6 },
  abaAtiva: { borderBottomWidth: 2, borderBottomColor: TEAL },
  abaText: { fontSize: 14, fontWeight: "500" },
  abaTextAtiva: { color: TEAL, fontWeight: "600" },
  abaBadge: { backgroundColor: "#f59e0b", borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1 },
  abaBadgeText: { fontSize: 10, fontWeight: "700", color: "white" },
  marcarTodasBtn: { marginLeft: "auto" },
  marcarTodasText: { fontSize: 11, color: TEAL, fontWeight: "600" },
  section: { padding: 16 },
  card: { borderRadius: 12, borderWidth: 0.5, overflow: "hidden" },
  notifRow: { flexDirection: "row", gap: 12, padding: 16 },
  notifIconWrap: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  notifContent: { flex: 1 },
  notifTitleRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: TEAL },
  notifTitulo: { fontSize: 14, fontWeight: "600" },
  notifDesc: { fontSize: 12, lineHeight: 18, marginBottom: 6 },
  notifFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  notifHora: { fontSize: 11 },
  marcarLida: { fontSize: 12, color: TEAL, fontWeight: "600" },
  divider: { height: 0.5, marginHorizontal: 16 },
  emptyCard: { borderRadius: 12, borderWidth: 0.5, alignItems: "center", padding: 48, gap: 8 },
  emptyText: { fontSize: 13 },
});