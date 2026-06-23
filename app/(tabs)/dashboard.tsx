import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import api from "@/services/api";

const TEAL = "#0b6b6b";

const hoje = new Date().toLocaleDateString("pt-BR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

type Usuario = {
  id: string;
  name: string;
  email: string;
  plan: string;
  plan_expires_at: string | null;
};

type Dispositivo = {
  id: string;
  name: string;
  type: string;
  status: string;
  last_access_at: string | null;
};

export default function Dashboard() {
  const router = useRouter();
  const [menuAberto, setMenuAberto] = useState(false);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        const [resUser, resDevices] = await Promise.all([
          api.get("/auth/me"),
          api.get("/devices"),
        ]);
        setUsuario(resUser.data.data?.user ?? resUser.data);
        setDispositivos(resDevices.data ?? []);
      } catch (err) {
        console.error("Erro ao carregar dashboard:", err);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  const planLabel = (plan: string) => {
    const map: Record<string, string> = {
      basico: "Básico",
      padrao: "Padrão",
      premium: "Premium",
    };
    return map[plan] ?? plan;
  };

  const onlineCount = dispositivos.filter((d) => d.status === "ativo").length;

  const metricas = [
    {
      label: "DISPOSITIVOS CONECTADOS",
      valor: carregando ? "—" : String(dispositivos.length),
      sub: carregando ? "" : `${onlineCount} online`,
      subColor: "#16a34a",
      icon: "phone-portrait-outline",
    },
    {
      label: "STATUS DA ASSINATURA",
      valor: carregando ? "—" : planLabel(usuario?.plan ?? ""),
      sub: usuario?.plan_expires_at
        ? `Ativo até ${new Date(usuario.plan_expires_at).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}`
        : usuario?.plan === "basico"
        ? "Gratuito"
        : "",
      subColor: TEAL,
      icon: "ribbon-outline",
    },
    {
      label: "ALERTAS ESTE MÊS",
      valor: "0",
      sub: "Nenhum alerta",
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
      titulo: "Bem-vindo ao Aspen Core",
      desc: "Sua conta está ativa e protegida.",
      hora: "Hoje",
      icon: "shield-checkmark-outline",
      iconColor: TEAL,
    },
  ];

  if (carregando) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f5f7f8" }}>
        <ActivityIndicator size="large" color={TEAL} />
      </View>
    );
  }

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
                onPress={() => router.push("/(tabs)/notificacao")}
              >
                <Ionicons name="notifications-outline" size={20} color="#475569" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.avatarBtn}
                onPress={() => setMenuAberto(true)}
              >
                <Text style={styles.avatarText}>
                  {usuario?.name
                    ? usuario.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()
                    : "?"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.greeting}>
            Olá, {usuario?.name?.split(" ")[0] ?? "usuário"} 👋
          </Text>
          <Text style={styles.date}>{hoje}</Text>
        </View>

        {/* Menu dropdown do avatar */}
        <Modal
          visible={menuAberto}
          transparent
          animationType="fade"
          onRequestClose={() => setMenuAberto(false)}
        >
          <Pressable style={styles.overlay} onPress={() => setMenuAberto(false)}>
            <View style={styles.dropdownMenu}>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  setMenuAberto(false);
                  router.push("/(tabs)/profile");
                }}
              >
                <Ionicons name="person-outline" size={16} color="#475569" />
                <Text style={styles.dropdownText}>Meu perfil</Text>
              </TouchableOpacity>
              <View style={styles.dropdownDivider} />
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  setMenuAberto(false);
                  router.push("/(tabs)/configuracoes");
                }}
              >
                <Ionicons name="settings-outline" size={16} color="#475569" />
                <Text style={styles.dropdownText}>Configurações</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>

        {/* Métricas */}
        <View style={styles.metricsGrid}>
          {metricas.map((m) => (
            <View key={m.label} style={styles.metricCard}>
              <View style={styles.metricIconWrap}>
                <Ionicons name={m.icon as any} size={20} color={TEAL} />
              </View>
              <Text style={styles.metricLabel}>{m.label}</Text>
              <Text style={styles.metricValor}>{m.valor}</Text>
              {!!m.sub && (
                <Text style={[styles.metricSub, { color: m.subColor }]}>{m.sub}</Text>
              )}
            </View>
          ))}
        </View>

        {/* Ações rápidas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações rápidas</Text>
          <View style={styles.acoesList}>
            {[
              {
                icon: "add-circle-outline",
                label: "Adicionar dispositivo",
                color: TEAL,
                onPress: () => router.push("/(tabs)/dispositivos"),
              },
              {
                icon: "ribbon-outline",
                label: "Gerenciar plano",
                color: "#7c3aed",
                onPress: () => router.push("/(tabs)/planos"),
              },
              {
                icon: "shield-checkmark-outline",
                label: "Configurações de segurança",
                color: "#0284c7",
                onPress: () => router.push("/(tabs)/configuracoes"),
              },
            ].map((a) => (
              <TouchableOpacity
                key={a.label}
                style={styles.acaoCard}
                onPress={a.onPress}
              >
                <View style={[styles.acaoIcon, { backgroundColor: `${a.color}18` }]}>
                  <Ionicons name={a.icon as any} size={22} color={a.color} />
                </View>
                <Text style={styles.acaoLabel}>{a.label}</Text>
                <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notificações recentes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Atividade recente</Text>
          <View style={styles.notifCard}>
            {notificacoes.map((n, i) => (
              <View key={n.titulo}>
                <View style={styles.notifRow}>
                  <View style={[styles.notifIconWrap, { backgroundColor: `${n.iconColor}18` }]}>
                    <Ionicons name={n.icon as any} size={18} color={n.iconColor} />
                  </View>
                  <View style={styles.notifInfo}>
                    <Text style={styles.notifTitulo}>{n.titulo}</Text>
                    <Text style={styles.notifDesc}>{n.desc}</Text>
                    <Text style={styles.notifHora}>{n.hora}</Text>
                  </View>
                </View>
                {i < notificacoes.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    backgroundColor: "white",
    paddingTop: 56,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e2e8f0",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  logoWrap: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoText: { fontSize: 13, fontWeight: "700", color: "#0f172a", letterSpacing: 0.5 },
  logoSub: { fontSize: 9, color: "#94a3b8", letterSpacing: 0.5 },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  navBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center",
  },
  avatarBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: TEAL, alignItems: "center", justifyContent: "center",
  },
  avatarText: { color: "white", fontSize: 13, fontWeight: "700" },
  greeting: { fontSize: 20, fontWeight: "700", color: "#0f172a", marginBottom: 4 },
  date: { fontSize: 13, color: "#94a3b8", textTransform: "capitalize" },

  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.2)" },
  dropdownMenu: {
    position: "absolute", top: 100, right: 20,
    backgroundColor: "white", borderRadius: 12,
    borderWidth: 0.5, borderColor: "#e2e8f0",
    shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
    minWidth: 180,
  },
  dropdownItem: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  dropdownText: { fontSize: 14, color: "#0f172a" },
  dropdownDivider: { height: 0.5, backgroundColor: "#e2e8f0" },

  metricsGrid: {
    flexDirection: "row", flexWrap: "wrap", gap: 12,
    padding: 16,
  },
  metricCard: {
    width: "47%", backgroundColor: "white", borderRadius: 12,
    padding: 16, borderWidth: 0.5, borderColor: "#e2e8f0",
  },
  metricIconWrap: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "#e6f4f4", alignItems: "center", justifyContent: "center",
    marginBottom: 10,
  },
  metricLabel: { fontSize: 9, fontWeight: "600", color: "#94a3b8", letterSpacing: 0.5, marginBottom: 4 },
  metricValor: { fontSize: 20, fontWeight: "700", color: "#0f172a", marginBottom: 2 },
  metricSub: { fontSize: 11, fontWeight: "500" },

  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#0f172a", marginBottom: 12 },

  acoesList: { gap: 8 },
  acaoCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: "white", borderRadius: 12, padding: 16,
    borderWidth: 0.5, borderColor: "#e2e8f0",
  },
  acaoIcon: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
  },
  acaoLabel: { flex: 1, fontSize: 14, fontWeight: "500", color: "#0f172a" },

  notifCard: {
    backgroundColor: "white", borderRadius: 12,
    borderWidth: 0.5, borderColor: "#e2e8f0", overflow: "hidden",
  },
  notifRow: { flexDirection: "row", padding: 16, gap: 12 },
  notifIconWrap: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  notifInfo: { flex: 1 },
  notifTitulo: { fontSize: 14, fontWeight: "600", color: "#0f172a", marginBottom: 2 },
  notifDesc: { fontSize: 12, color: "#64748b", marginBottom: 4 },
  notifHora: { fontSize: 11, color: "#94a3b8" },
  divider: { height: 0.5, backgroundColor: "#e2e8f0", marginHorizontal: 16 },
});
