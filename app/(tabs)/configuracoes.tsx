import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from "@/components/Header";
import api from "@/services/api";

const TEAL = "#0b6b6b";

const menuItens = ["Conta", "Privacidade", "Segurança", "Preferências"];

export default function Configuracoes() {
  const [abaAtiva, setAbaAtiva] = useState("Conta");
  const [compartilharDados, setCompartilharDados] = useState(true);
  const [cookies, setCookies] = useState(false);
  const [doisFatores, setDoisFatores] = useState(true);
  const [alertasLogin, setAlertasLogin] = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);
  const [email, setEmailState] = useState("—");
  const [nome, setNome] = useState("—");

  useEffect(() => {
    async function carregar() {
      try {
        const res = await api.get("/auth/me");
        const u = res.data.data?.user ?? res.data;
        setEmailState(u.email ?? "—");
        setNome(u.name ?? "—");
      } catch (err) {
        console.error("Erro ao carregar configurações:", err);
      }
    }
    carregar();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Header
        titulo="Configurações"
        subtitulo="Gerencie as preferências da sua conta."
      />

      <View style={styles.body}>
        {/* Menu lateral */}
        <View style={styles.menu}>
          {menuItens.map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.menuItem, abaAtiva === item && styles.menuItemAtivo]}
              onPress={() => setAbaAtiva(item)}
            >
              <Text style={[styles.menuItemText, abaAtiva === item && styles.menuItemTextAtivo]}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Conteúdo */}
        <View style={styles.conteudo}>
          {abaAtiva === "Conta" && (
            <View style={styles.card}>
              <Text style={styles.cardTitulo}>Conta</Text>
              <View style={styles.divider} />
              <View style={styles.configRow}>
                <View style={styles.configInfo}>
                  <Text style={styles.configTitulo}>E-mail de contato</Text>
                  <Text style={styles.configDesc}>{email}</Text>
                </View>
                <TouchableOpacity>
                  <Text style={styles.linkAlterar}>Alterar</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.divider} />
              <View style={styles.configRow}>
                <View style={styles.configInfo}>
                  <Text style={styles.configTitulo}>Nome de exibição</Text>
                  <Text style={styles.configDesc}>{nome}</Text>
                </View>
                <TouchableOpacity>
                  <Text style={styles.linkAlterar}>Alterar</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.divider} />
              <View style={styles.configRow}>
                <View style={styles.configInfo}>
                  <Text style={[styles.configTitulo, { color: "#ef4444" }]}>Excluir conta</Text>
                  <Text style={styles.configDesc}>Esta ação é permanente e irreversível.</Text>
                </View>
                <TouchableOpacity>
                  <Text style={[styles.linkAlterar, { color: "#ef4444" }]}>Excluir</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {abaAtiva === "Privacidade" && (
            <View style={styles.card}>
              <Text style={styles.cardTitulo}>Privacidade</Text>
              <View style={styles.divider} />
              <View style={styles.configRow}>
                <View style={styles.configInfo}>
                  <Text style={styles.configTitulo}>Compartilhar dados de uso anônimos</Text>
                  <Text style={styles.configDesc}>Ajuda a melhorar o produto.</Text>
                </View>
                <Switch
                  value={compartilharDados}
                  onValueChange={setCompartilharDados}
                  trackColor={{ false: "#e2e8f0", true: TEAL }}
                  thumbColor="white"
                />
              </View>
              <View style={styles.divider} />
              <View style={styles.configRow}>
                <View style={styles.configInfo}>
                  <Text style={styles.configTitulo}>Cookies de análise</Text>
                  <Text style={styles.configDesc}>Usados para medir o desempenho do sistema.</Text>
                </View>
                <Switch
                  value={cookies}
                  onValueChange={setCookies}
                  trackColor={{ false: "#e2e8f0", true: TEAL }}
                  thumbColor="white"
                />
              </View>
            </View>
          )}

          {abaAtiva === "Segurança" && (
            <View style={styles.card}>
              <Text style={styles.cardTitulo}>Segurança</Text>
              <View style={styles.divider} />
              <View style={styles.configRow}>
                <View style={styles.configInfo}>
                  <Text style={styles.configTitulo}>Autenticação em dois fatores (2FA)</Text>
                  <Text style={styles.configDesc}>Adiciona uma camada extra de proteção.</Text>
                </View>
                <Switch
                  value={doisFatores}
                  onValueChange={setDoisFatores}
                  trackColor={{ false: "#e2e8f0", true: TEAL }}
                  thumbColor="white"
                />
              </View>
              <View style={styles.divider} />
              <View style={styles.configRow}>
                <View style={styles.configInfo}>
                  <Text style={styles.configTitulo}>Alertas de login suspeito</Text>
                  <Text style={styles.configDesc}>Notificação por e-mail ao detectar acesso incomum.</Text>
                </View>
                <Switch
                  value={alertasLogin}
                  onValueChange={setAlertasLogin}
                  trackColor={{ false: "#e2e8f0", true: TEAL }}
                  thumbColor="white"
                />
              </View>
              <View style={styles.divider} />
              <View style={styles.configRow}>
                <View style={styles.configInfo}>
                  <Text style={styles.configTitulo}>Sessões ativas</Text>
                  <Text style={styles.configDesc}>3 sessões em dispositivos diferentes.</Text>
                </View>
                <TouchableOpacity>
                  <Text style={[styles.linkAlterar, { color: "#ef4444" }]}>Encerrar todas</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {abaAtiva === "Preferências" && (
            <View style={styles.card}>
              <Text style={styles.cardTitulo}>Preferências</Text>
              <View style={styles.divider} />
              <View style={styles.configRow}>
                <View style={styles.configInfo}>
                  <Text style={styles.configTitulo}>Idioma</Text>
                  <Text style={styles.configDesc}>Português (Brasil)</Text>
                </View>
                <View style={styles.selectWrap}>
                  <Text style={styles.selectText}>PT-BR</Text>
                  <Ionicons name="chevron-down-outline" size={14} color="#94a3b8" />
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.configRow}>
                <View style={styles.configInfo}>
                  <Text style={styles.configTitulo}>Notificações por e-mail</Text>
                  <Text style={styles.configDesc}>Receber resumo semanal de atividades.</Text>
                </View>
                <Switch
                  value={notifEmail}
                  onValueChange={setNotifEmail}
                  trackColor={{ false: "#e2e8f0", true: TEAL }}
                  thumbColor="white"
                />
              </View>
            </View>
          )}
        </View>
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7f8" },

  body: { flexDirection: "row", padding: 16, gap: 12, alignItems: "flex-start" },

  menu: {
    width: 110,
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: "#e2e8f0",
    overflow: "hidden",
  },
  menuItem: { paddingVertical: 13, paddingHorizontal: 14 },
  menuItemAtivo: { backgroundColor: "#e6f4f4" },
  menuItemText: { fontSize: 13, color: "#64748b", fontWeight: "500" },
  menuItemTextAtivo: { color: TEAL, fontWeight: "700" },

  conteudo: { flex: 1 },

  card: {
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: "#e2e8f0",
    padding: 16,
  },
  cardTitulo: { fontSize: 15, fontWeight: "700", color: "#0f172a", marginBottom: 12 },

  configRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    gap: 8,
  },
  configInfo: { flex: 1 },
  configTitulo: { fontSize: 13, fontWeight: "600", color: "#0f172a", marginBottom: 2 },
  configDesc: { fontSize: 11, color: "#94a3b8" },
  linkAlterar: { fontSize: 12, color: TEAL, fontWeight: "600" },
  divider: { height: 0.5, backgroundColor: "#e2e8f0" },

  selectWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  selectText: { fontSize: 12, color: "#475569", fontWeight: "500" },
});