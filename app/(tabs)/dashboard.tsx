import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const TEAL = "#0b6b6b";

const hoje = new Date().toLocaleDateString("pt-BR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default function Dashboard() {
  const router = useRouter();
  const [menuAberto, setMenuAberto] = useState(false);

  const metricas = [
    {
      label: "DISPOSITIVOS CONECTADOS",
      valor: "4",
      sub: "Todos online",
      subColor: "#16a34a",
      icon: "phone-portrait-outline",
    },
    {
      label: "STATUS DA ASSINATURA",
      valor: "Padrão",
      sub: "Ativo até dez/2025",
      subColor: TEAL,
      icon: "ribbon-outline",
    },
    {
      label: "ALERTAS ESTE MÊS",
      valor: "2",
      sub: "↓ 60% que mês anterior",
      subColor: "#16a34a",
      icon: "warning-outline",
    },
    {
      label: "NÍVEL DE PROTEÇÃO",
      valor: "Alto",
      sub: "Tudo configurado",
      subColor: "#16a34a",
      icon: "shield-checkmark-outline",
    },
  ];

  const notificacoes = [
    {
      titulo: "Phishing bloqueado",
      desc: "Uma tentativa de phishing foi detectada e bloqueada no seu iPhone 14.",
      hora: "Hoje, 08:42",
      icon: "warning-outline",
      iconColor: "#f59e0b",
    },
    {
      titulo: "Assinatura renovada",
      desc: "Sua assinatura Padrão foi renovada automaticamente.",
      hora: "Ontem, 10:00",
      icon: "checkmark-circle-outline",
      iconColor: "#16a34a",
    },
    {
      titulo: "Novo dispositivo adicionado",
      desc: "iPad Air foi adicionado com sucesso à sua conta.",
      hora: "Ontem, 18:30",
      icon: "tablet-portrait-outline",
      iconColor: TEAL,
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f7f8" }}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            {/* Logo */}
            <View style={styles.logoWrap}>
              <Ionicons name="shield-checkmark-outline" size={20} color={TEAL} />
              <View>
                <Text style={styles.logoText}>ASPEN CORE</Text>
                <Text style={styles.logoSub}>SEGURANÇA DIGITAL</Text>
              </View>
            </View>

            {/* Botões + Avatar */}
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.navBtn}
                onPress={() => router.push("/(tabs)/planos" as any)}
              >
                <Text style={styles.navBtnText}>Planos</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.navBtn}
                onPress={() => router.push("/(tabs)/dispositivos" as any)}
              >
                <Text style={styles.navBtnText}>Dispositivos</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.avatarCircle}
                onPress={() => setMenuAberto(true)}
              >
                <Text style={styles.avatarText}>RA</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.saudacao}>Bem-vindo, Rafael!</Text>
          <Text style={styles.dataHoje}>{hoje}</Text>
          <Text style={styles.headerSub}>
            Aqui está um resumo da sua segurança digital.
          </Text>

          {/* Botão NFC em destaque */}
          <TouchableOpacity
            style={styles.btnNfc}
            onPress={() => router.push("/desbloqueio" as any)}
          >
            <View style={styles.btnNfcIconWrap}>
              <Ionicons name="wifi-outline" size={22} color="white" />
            </View>
            <View style={styles.btnNfcTextos}>
              <Text style={styles.btnNfcTitulo}>Modo de acesso NFC</Text>
              <Text style={styles.btnNfcDesc}>
                Aproxime o celular para desbloquear sem senha
              </Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={18} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </View>

        {/* Métricas */}
        <View style={styles.section}>
          <View style={styles.metricasGrid}>
            {metricas.map((m) => (
              <View key={m.label} style={styles.metricaCard}>
                <Ionicons
                  name={m.icon as any}
                  size={18}
                  color={TEAL}
                  style={{ marginBottom: 8 }}
                />
                <Text style={styles.metricaLabel}>{m.label}</Text>
                <Text style={styles.metricaValor}>{m.valor}</Text>
                <Text style={[styles.metricaSub, { color: m.subColor }]}>
                  {m.sub}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Notificações recentes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Notificações</Text>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/notificacao" as any)}
            >
              <Text style={styles.verTudo}>Ver todas</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            {notificacoes.map((n, i) => (
              <View key={n.titulo}>
                <View style={styles.notifRow}>
                  <View
                    style={[
                      styles.notifIconWrap,
                      { backgroundColor: n.iconColor + "18" },
                    ]}
                  >
                    <Ionicons name={n.icon as any} size={18} color={n.iconColor} />
                  </View>
                  <View style={styles.notifContent}>
                    <View style={styles.notifTitleRow}>
                      <View style={styles.dotUnread} />
                      <Text style={styles.notifTitulo}>{n.titulo}</Text>
                    </View>
                    <Text style={styles.notifDesc}>{n.desc}</Text>
                    <Text style={styles.notifHora}>{n.hora}</Text>
                  </View>
                </View>
                {i < notificacoes.length - 1 && (
                  <View style={styles.divider} />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Atividade recente */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Atividade recente</Text>
            <TouchableOpacity>
              <Text style={styles.verTudo}>Ver tudo</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.card, styles.emptyCard]}>
            <Ionicons name="time-outline" size={32} color="#cbd5e1" />
            <Text style={styles.emptyText}>Nenhuma atividade recente</Text>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Menu dropdown do avatar */}
      <Modal
        visible={menuAberto}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuAberto(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setMenuAberto(false)}
        >
          <View style={styles.dropdown}>
            <View style={styles.dropdownHeader}>
              <View style={styles.dropdownAvatar}>
                <Text style={styles.dropdownAvatarText}>RA</Text>
              </View>
              <View>
                <Text style={styles.dropdownNome}>Rafael Alves</Text>
                <Text style={styles.dropdownEmail}>rafinha@gmail.com</Text>
              </View>
            </View>

            <View style={styles.dropdownDivider} />

            {[
              { label: "Perfil", icon: "person-outline", route: "/(tabs)/profile" },
              { label: "Configurações", icon: "settings-outline", route: "/(tabs)/configuracoes" },
              { label: "Notificações", icon: "notifications-outline", route: "/(tabs)/notificacao" },
            ].map((item) => (
              <TouchableOpacity
                key={item.label}
                style={styles.dropdownItem}
                onPress={() => {
                  setMenuAberto(false);
                  router.push(item.route as any);
                }}
              >
                <Ionicons name={item.icon as any} size={18} color="#475569" />
                <Text style={styles.dropdownItemText}>{item.label}</Text>
              </TouchableOpacity>
            ))}

            <View style={styles.dropdownDivider} />

            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setMenuAberto(false);
                router.replace("/login");
              }}
            >
              <Ionicons name="log-out-outline" size={18} color="#ef4444" />
              <Text style={[styles.dropdownItemText, { color: "#ef4444" }]}>
                Sair
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7f8" },

  header: {
    backgroundColor: "white",
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e2e8f0",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  logoWrap: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoText: { fontSize: 11, fontWeight: "700", color: TEAL, letterSpacing: 0.8 },
  logoSub: { fontSize: 8, color: "#94a3b8", letterSpacing: 0.5 },

  headerActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  navBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
  },
  navBtnText: { fontSize: 12, fontWeight: "600", color: "#475569" },

  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: TEAL,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "white", fontSize: 13, fontWeight: "700" },

  saudacao: { fontSize: 22, fontWeight: "700", color: "#0f172a", marginBottom: 2 },
  dataHoje: { fontSize: 12, color: "#94a3b8", marginBottom: 4, textTransform: "capitalize" },
  headerSub: { fontSize: 13, color: "#64748b", marginBottom: 16 },

  // Botão NFC destaque
  btnNfc: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: TEAL,
    borderRadius: 14,
    padding: 14,
  },
  btnNfcIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  btnNfcTextos: { flex: 1 },
  btnNfcTitulo: { fontSize: 14, fontWeight: "700", color: "white", marginBottom: 2 },
  btnNfcDesc: { fontSize: 11, color: "rgba(255,255,255,0.75)" },

  // Seções
  section: { paddingHorizontal: 16, paddingTop: 24 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#0f172a" },
  verTudo: { fontSize: 13, color: TEAL, fontWeight: "600" },

  // Métricas
  metricasGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metricaCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 14,
    width: "48%",
    borderWidth: 0.5,
    borderColor: "#e2e8f0",
  },
  metricaLabel: { fontSize: 9, fontWeight: "700", color: "#94a3b8", letterSpacing: 0.5, marginBottom: 6 },
  metricaValor: { fontSize: 22, fontWeight: "700", color: "#0f172a", marginBottom: 4 },
  metricaSub: { fontSize: 11, fontWeight: "500" },

  // Card base
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: "#e2e8f0",
    overflow: "hidden",
  },

  // Notificações
  notifRow: { flexDirection: "row", gap: 12, padding: 14 },
  notifIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  notifContent: { flex: 1 },
  notifTitleRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 3 },
  dotUnread: { width: 7, height: 7, borderRadius: 4, backgroundColor: TEAL },
  notifTitulo: { fontSize: 14, fontWeight: "600", color: "#0f172a" },
  notifDesc: { fontSize: 12, color: "#64748b", lineHeight: 18, marginBottom: 4 },
  notifHora: { fontSize: 11, color: "#94a3b8" },
  divider: { height: 0.5, backgroundColor: "#e2e8f0", marginHorizontal: 14 },

  // Empty state
  emptyCard: { alignItems: "center", justifyContent: "center", padding: 32, gap: 8 },
  emptyText: { fontSize: 13, color: "#94a3b8" },

  // Modal dropdown
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.15)" },
  dropdown: {
    position: "absolute",
    top: 90,
    right: 16,
    backgroundColor: "white",
    borderRadius: 14,
    width: 230,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 0.5,
    borderColor: "#e2e8f0",
    overflow: "hidden",
  },
  dropdownHeader: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14 },
  dropdownAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: TEAL,
    alignItems: "center",
    justifyContent: "center",
  },
  dropdownAvatarText: { color: "white", fontSize: 13, fontWeight: "700" },
  dropdownNome: { fontSize: 14, fontWeight: "600", color: "#0f172a" },
  dropdownEmail: { fontSize: 11, color: "#94a3b8" },
  dropdownDivider: { height: 0.5, backgroundColor: "#e2e8f0" },
  dropdownItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 13 },
  dropdownItemText: { fontSize: 14, color: "#475569", fontWeight: "500" },
});