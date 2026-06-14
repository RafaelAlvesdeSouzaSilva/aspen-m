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

const dispositivosIniciais = [
  {
    id: "1",
    nome: "iPhone 14",
    tipo: "smartphone",
    status: "online",
    ultimoAcesso: "Hoje, 08:42",
    icon: "phone-portrait-outline",
  },
  {
    id: "2",
    nome: "iPad Air",
    tipo: "tablet",
    status: "online",
    ultimoAcesso: "Ontem, 18:30",
    icon: "tablet-portrait-outline",
  },
  {
    id: "3",
    nome: "MacBook Pro",
    tipo: "computador",
    status: "offline",
    ultimoAcesso: "Há 3 dias",
    icon: "laptop-outline",
  },
  {
    id: "4",
    nome: "Windows PC",
    tipo: "computador",
    status: "online",
    ultimoAcesso: "Hoje, 07:15",
    icon: "desktop-outline",
  },
];

export default function Dispositivos() {
  const [dispositivos, setDispositivos] = useState(dispositivosIniciais);

  const remover = (id: string) => {
    setDispositivos((prev) => prev.filter((d) => d.id !== id));
  };

  const online = dispositivos.filter((d) => d.status === "online").length;

  return (
    <ScrollView style={styles.container}>
      <Header
        titulo="Dispositivos"
        subtitulo="Gerencie os dispositivos conectados à sua conta."
        direita={
          <TouchableOpacity style={styles.btnAdicionar}>
            <Ionicons name="add" size={20} color={TEAL} />
          </TouchableOpacity>
        }
      />

      {/* Resumo */}
      <View style={styles.resumoRow}>
        <View style={styles.resumoCard}>
          <Text style={styles.resumoValor}>{dispositivos.length}</Text>
          <Text style={styles.resumoLabel}>Total</Text>
        </View>
        <View style={styles.resumoCard}>
          <Text style={[styles.resumoValor, { color: "#16a34a" }]}>{online}</Text>
          <Text style={styles.resumoLabel}>Online</Text>
        </View>
        <View style={styles.resumoCard}>
          <Text style={[styles.resumoValor, { color: "#94a3b8" }]}>
            {dispositivos.length - online}
          </Text>
          <Text style={styles.resumoLabel}>Offline</Text>
        </View>
      </View>

      {/* Lista */}
      <View style={styles.section}>
        {dispositivos.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="desktop-outline" size={40} color="#cbd5e1" />
            <Text style={styles.emptyTitulo}>Nenhum dispositivo cadastrado</Text>
            <Text style={styles.emptyDesc}>Clique em "+" para começar.</Text>
          </View>
        ) : (
          <View style={styles.card}>
            {dispositivos.map((d, i) => (
              <View key={d.id}>
                <View style={styles.dispositivoRow}>
                  <View style={styles.dispositivoIconWrap}>
                    <Ionicons name={d.icon as any} size={22} color={TEAL} />
                  </View>
                  <View style={styles.dispositivoInfo}>
                    <View style={styles.dispositivoTitleRow}>
                      <Text style={styles.dispositivoNome}>{d.nome}</Text>
                      <View
                        style={[
                          styles.statusBadge,
                          d.status === "online" ? styles.statusOnline : styles.statusOffline,
                        ]}
                      >
                        <View
                          style={[
                            styles.statusDot,
                            { backgroundColor: d.status === "online" ? "#16a34a" : "#94a3b8" },
                          ]}
                        />
                        <Text
                          style={[
                            styles.statusText,
                            { color: d.status === "online" ? "#16a34a" : "#94a3b8" },
                          ]}
                        >
                          {d.status === "online" ? "Online" : "Offline"}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.dispositivoTipo}>{d.tipo}</Text>
                    <Text style={styles.dispositivoAcesso}>
                      Último acesso: {d.ultimoAcesso}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => remover(d.id)}
                    style={styles.btnRemover}
                  >
                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
                {i < dispositivos.length - 1 && <View style={styles.divider} />}
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

  btnAdicionar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#e6f4f4",
    alignItems: "center",
    justifyContent: "center",
  },

  resumoRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  resumoCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "#e2e8f0",
  },
  resumoValor: { fontSize: 24, fontWeight: "700", color: "#0f172a" },
  resumoLabel: { fontSize: 11, color: "#94a3b8", marginTop: 2 },

  section: { padding: 16 },

  card: {
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: "#e2e8f0",
    overflow: "hidden",
  },

  dispositivoRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  dispositivoIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#e6f4f4",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  dispositivoInfo: { flex: 1 },
  dispositivoTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  dispositivoNome: { fontSize: 15, fontWeight: "600", color: "#0f172a" },
  dispositivoTipo: { fontSize: 12, color: "#94a3b8", textTransform: "capitalize", marginBottom: 2 },
  dispositivoAcesso: { fontSize: 11, color: "#94a3b8" },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  statusOnline: { backgroundColor: "#dcfce7" },
  statusOffline: { backgroundColor: "#f1f5f9" },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: "600" },

  btnRemover: { padding: 6 },
  divider: { height: 0.5, backgroundColor: "#e2e8f0", marginHorizontal: 16 },

  emptyCard: {
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
    padding: 48,
    gap: 8,
  },
  emptyTitulo: { fontSize: 15, fontWeight: "600", color: "#475569" },
  emptyDesc: { fontSize: 13, color: "#94a3b8", textAlign: "center" },
});