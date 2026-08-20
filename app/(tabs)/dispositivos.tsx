import { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from "@/components/Header";
import { useI18n } from "@/contexts/i18n";

const TEAL = "#0b6b6b";

const dispositivosIniciais = [
  { id: "1", nome: "iPhone 14", tipo: "smartphone", status: "online", ultimoAcesso: "Hoje, 08:42", icon: "phone-portrait-outline" },
  { id: "2", nome: "iPad Air", tipo: "tablet", status: "online", ultimoAcesso: "Ontem, 18:30", icon: "tablet-portrait-outline" },
  { id: "3", nome: "MacBook Pro", tipo: "computador", status: "offline", ultimoAcesso: "Há 3 dias", icon: "laptop-outline" },
  { id: "4", nome: "Windows PC", tipo: "computador", status: "online", ultimoAcesso: "Hoje, 07:15", icon: "desktop-outline" },
];

export default function Dispositivos() {
  const { colors, t } = useI18n();
  const [dispositivos, setDispositivos] = useState(dispositivosIniciais);
  const remover = (id: string) => setDispositivos((prev) => prev.filter((d) => d.id !== id));
  const onlineCount = dispositivos.filter((d) => d.status === "online").length;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bg }]}>
      <Header
        titulo={t("devices")}
        subtitulo={t("devicesSubtitulo")}
        direita={
          <TouchableOpacity style={[styles.btnAdicionar, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="add" size={20} color={TEAL} />
          </TouchableOpacity>
        }
      />

      <View style={styles.resumoRow}>
        {[
          { val: dispositivos.length, label: t("total"), color: colors.text },
          { val: onlineCount, label: t("online"), color: "#16a34a" },
          { val: dispositivos.length - onlineCount, label: t("offline"), color: colors.textMuted },
        ].map((r) => (
          <View key={r.label} style={[styles.resumoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.resumoValor, { color: r.color }]}>{r.val}</Text>
            <Text style={[styles.resumoLabel, { color: colors.textMuted }]}>{r.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        {dispositivos.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="desktop-outline" size={40} color={colors.textMuted} />
            <Text style={[styles.emptyTitulo, { color: colors.textSec }]}>{t("noDevices")}</Text>
            <Text style={[styles.emptyDesc, { color: colors.textMuted }]}>{t("noDevicesDesc")}</Text>
          </View>
        ) : (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {dispositivos.map((d, i) => (
              <View key={d.id}>
                <View style={styles.dispositivoRow}>
                  <View style={styles.dispositivoIconWrap}>
                    <Ionicons name={d.icon as any} size={22} color={TEAL} />
                  </View>
                  <View style={styles.dispositivoInfo}>
                    <View style={styles.dispositivoTitleRow}>
                      <Text style={[styles.dispositivoNome, { color: colors.text }]}>{d.nome}</Text>
                      <View style={[styles.statusBadge, d.status === "online" ? styles.statusOnline : { backgroundColor: colors.inputBg }]}>
                        <View style={[styles.statusDot, { backgroundColor: d.status === "online" ? "#16a34a" : colors.textMuted }]} />
                        <Text style={[styles.statusText, { color: d.status === "online" ? "#16a34a" : colors.textMuted }]}>
                          {d.status === "online" ? t("online") : t("offline")}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.dispositivoTipo, { color: colors.textMuted }]}>{d.tipo}</Text>
                    <Text style={[styles.dispositivoAcesso, { color: colors.textMuted }]}>{t("lastAccess")} {d.ultimoAcesso}</Text>
                  </View>
                  <TouchableOpacity onPress={() => remover(d.id)} style={styles.btnRemover}>
                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
                {i < dispositivos.length - 1 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
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
  btnAdicionar: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", borderWidth: 0.5 },
  resumoRow: { flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingTop: 16 },
  resumoCard: { flex: 1, borderRadius: 12, padding: 14, alignItems: "center", borderWidth: 0.5 },
  resumoValor: { fontSize: 24, fontWeight: "700" },
  resumoLabel: { fontSize: 11, marginTop: 2 },
  section: { padding: 16 },
  card: { borderRadius: 12, borderWidth: 0.5, overflow: "hidden" },
  dispositivoRow: { flexDirection: "row", alignItems: "center", padding: 16, gap: 12 },
  dispositivoIconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#e6f4f4", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  dispositivoInfo: { flex: 1 },
  dispositivoTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2, flexWrap: "wrap" },
  dispositivoNome: { fontSize: 15, fontWeight: "600" },
  dispositivoTipo: { fontSize: 12, textTransform: "capitalize", marginBottom: 2 },
  dispositivoAcesso: { fontSize: 11 },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  statusOnline: { backgroundColor: "#dcfce7" },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: "600" },
  btnRemover: { padding: 6 },
  divider: { height: 0.5, marginHorizontal: 16 },
  emptyCard: { borderRadius: 12, borderWidth: 0.5, alignItems: "center", padding: 48, gap: 8 },
  emptyTitulo: { fontSize: 15, fontWeight: "600" },
  emptyDesc: { fontSize: 13, textAlign: "center" },
});