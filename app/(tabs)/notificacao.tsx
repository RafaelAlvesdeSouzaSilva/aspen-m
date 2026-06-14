import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from "@/components/Header";

const TEAL = "#0b6b6b";

const notificacoesIniciais = [
  {
    id: "1",
    titulo: "Phishing bloqueado",
    desc: "Uma tentativa de phishing foi detectada e bloqueada automaticamente no seu iPhone 14. Nenhuma ação necessária.",
    hora: "Hoje, 08:42",
    lida: false,
    icon: "warning-outline",
    iconColor: "#f59e0b",
  },
  {
    id: "2",
    titulo: "Assinatura renovada",
    desc: "Sua assinatura Padrão foi renovada automaticamente. Próxima renovação: 31/12/2025.",
    hora: "Ontem, 10:00",
    lida: false,
    icon: "checkmark-circle-outline",
    iconColor: "#16a34a",
  },
  {
    id: "3",
    titulo: "Novo dispositivo adicionado",
    desc: "iPad Air foi adicionado com sucesso à sua conta.",
    hora: "Ontem, 18:30",
    lida: false,
    icon: "tablet-portrait-outline",
    iconColor: TEAL,
  },
];

const abas = ["Todas", "Não lidas", "Lidas"];

export default function Notificacoes() {
  const [notifs, setNotifs] = useState(notificacoesIniciais);
  const [abaAtiva, setAbaAtiva] = useState("Todas");

  const marcarLida = (id: string) => {
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, lida: true } : n)));
  };

  const marcarTodasLidas = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, lida: true })));
  };

  const naoLidas = notifs.filter((n) => !n.lida).length;

  const filtradas =
    abaAtiva === "Todas"
      ? notifs
      : abaAtiva === "Não lidas"
      ? notifs.filter((n) => !n.lida)
      : notifs.filter((n) => n.lida);

  return (
    <ScrollView style={styles.container}>
      <Header
        titulo="Notificações"
        subtitulo="Acompanhe os eventos da sua conta."
        direita={
          naoLidas > 0 ? (
            <TouchableOpacity onPress={marcarTodasLidas}>
              <View style={styles.badgeHeader}>
                <Text style={styles.badgeHeaderText}>{naoLidas}</Text>
              </View>
            </TouchableOpacity>
          ) : undefined
        }
      />

      {/* Abas */}
      <View style={styles.abasWrap}>
        {abas.map((aba) => (
          <TouchableOpacity
            key={aba}
            style={[styles.aba, abaAtiva === aba && styles.abaAtiva]}
            onPress={() => setAbaAtiva(aba)}
          >
            <Text style={[styles.abaText, abaAtiva === aba && styles.abaTextAtiva]}>
              {aba}
            </Text>
            {aba === "Não lidas" && naoLidas > 0 && (
              <View style={styles.abaBadge}>
                <Text style={styles.abaBadgeText}>{naoLidas}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}

        {naoLidas > 0 && (
          <TouchableOpacity
            style={styles.marcarTodasBtn}
            onPress={marcarTodasLidas}
          >
            <Text style={styles.marcarTodasText}>Marcar todas como lidas</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Lista */}
      <View style={styles.section}>
        {filtradas.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="notifications-off-outline" size={40} color="#cbd5e1" />
            <Text style={styles.emptyText}>Nenhuma notificação aqui</Text>
          </View>
        ) : (
          <View style={styles.card}>
            {filtradas.map((n, i) => (
              <View key={n.id}>
                <View style={styles.notifRow}>
                  <View style={[styles.notifIconWrap, { backgroundColor: n.iconColor + "18" }]}>
                    <Ionicons name={n.icon as any} size={20} color={n.iconColor} />
                  </View>
                  <View style={styles.notifContent}>
                    <View style={styles.notifTitleRow}>
                      {!n.lida && <View style={styles.dot} />}
                      <Text style={styles.notifTitulo}>{n.titulo}</Text>
                    </View>
                    <Text style={styles.notifDesc}>{n.desc}</Text>
                    <View style={styles.notifFooter}>
                      <Text style={styles.notifHora}>{n.hora}</Text>
                      {!n.lida && (
                        <TouchableOpacity onPress={() => marcarLida(n.id)}>
                          <Text style={styles.marcarLida}>Marcar lida</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
                {i < filtradas.length - 1 && <View style={styles.divider} />}
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
  container: { flex: 1, backgroundColor: "#f5f7f8" },

  badgeHeader: {
    backgroundColor: "#f59e0b",
    borderRadius: 10,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeHeaderText: { fontSize: 11, fontWeight: "700", color: "white" },

  abasWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e2e8f0",
    paddingHorizontal: 16,
  },
  aba: {
    paddingVertical: 14,
    paddingHorizontal: 4,
    marginRight: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  abaAtiva: { borderBottomWidth: 2, borderBottomColor: TEAL },
  abaText: { fontSize: 14, color: "#94a3b8", fontWeight: "500" },
  abaTextAtiva: { color: TEAL, fontWeight: "600" },
  abaBadge: {
    backgroundColor: "#f59e0b",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  abaBadgeText: { fontSize: 10, fontWeight: "700", color: "white" },
  marcarTodasBtn: { marginLeft: "auto" },
  marcarTodasText: { fontSize: 11, color: TEAL, fontWeight: "600" },

  section: { padding: 16 },

  card: {
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: "#e2e8f0",
    overflow: "hidden",
  },

  notifRow: { flexDirection: "row", gap: 12, padding: 16 },
  notifIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  notifContent: { flex: 1 },
  notifTitleRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: TEAL },
  notifTitulo: { fontSize: 14, fontWeight: "600", color: "#0f172a" },
  notifDesc: { fontSize: 12, color: "#64748b", lineHeight: 18, marginBottom: 6 },
  notifFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  notifHora: { fontSize: 11, color: "#94a3b8" },
  marcarLida: { fontSize: 12, color: TEAL, fontWeight: "600" },
  divider: { height: 0.5, backgroundColor: "#e2e8f0", marginHorizontal: 16 },

  emptyCard: {
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: "#e2e8f0",
    alignItems: "center",
    padding: 48,
    gap: 8,
  },
  emptyText: { fontSize: 13, color: "#94a3b8" },
});