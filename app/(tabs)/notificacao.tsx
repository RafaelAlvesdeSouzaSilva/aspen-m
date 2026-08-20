import { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from "@/components/Header";
import { useI18n } from "@/contexts/i18n";

const TEAL = "#0b6b6b";

const notificacoesIniciais = [
  { id: "1", titulo: "Phishing bloqueado", desc: "Uma tentativa de phishing foi detectada e bloqueada automaticamente no seu iPhone 14.", hora: "Hoje, 08:42", lida: false, icon: "warning-outline", iconColor: "#f59e0b" },
  { id: "2", titulo: "Assinatura renovada", desc: "Sua assinatura Padrão foi renovada automaticamente.", hora: "Ontem, 10:00", lida: false, icon: "checkmark-circle-outline", iconColor: "#16a34a" },
  { id: "3", titulo: "Novo dispositivo adicionado", desc: "iPad Air foi adicionado com sucesso à sua conta.", hora: "Ontem, 18:30", lida: false, icon: "tablet-portrait-outline", iconColor: TEAL },
];

export default function Notificacoes() {
  const { colors, t } = useI18n();
  const [notifs, setNotifs] = useState(notificacoesIniciais);
  const [abaAtiva, setAbaAtiva] = useState("all");

  const marcarLida = (id: string) => setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, lida: true } : n));
  const marcarTodasLidas = () => setNotifs((prev) => prev.map((n) => ({ ...n, lida: true })));
  const naoLidas = notifs.filter((n) => !n.lida).length;

  const abas = [
    { key: "all", label: t("allTab") },
    { key: "unread", label: t("unreadTab") },
    { key: "read", label: t("readTab") },
  ];

  const filtradas = abaAtiva === "all" ? notifs : abaAtiva === "unread" ? notifs.filter((n) => !n.lida) : notifs.filter((n) => n.lida);

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
        {filtradas.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="notifications-off-outline" size={40} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>{t("noNotifications")}</Text>
          </View>
        ) : (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {filtradas.map((n, i) => (
              <View key={n.id}>
                <View style={styles.notifRow}>
                  <View style={[styles.notifIconWrap, { backgroundColor: n.iconColor + "18" }]}>
                    <Ionicons name={n.icon as any} size={20} color={n.iconColor} />
                  </View>
                  <View style={styles.notifContent}>
                    <View style={styles.notifTitleRow}>
                      {!n.lida && <View style={styles.dot} />}
                      <Text style={[styles.notifTitulo, { color: colors.text }]}>{n.titulo}</Text>
                    </View>
                    <Text style={[styles.notifDesc, { color: colors.textSec }]}>{n.desc}</Text>
                    <View style={styles.notifFooter}>
                      <Text style={[styles.notifHora, { color: colors.textMuted }]}>{n.hora}</Text>
                      {!n.lida && (
                        <TouchableOpacity onPress={() => marcarLida(n.id)}>
                          <Text style={styles.marcarLida}>{t("markRead")}</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
                {i < filtradas.length - 1 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
              </View>
            ))}
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