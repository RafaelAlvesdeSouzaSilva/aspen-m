import { Ionicons } from "@expo/vector-icons";
import { signOut } from "firebase/auth";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "@/services/firebase";
import api from "@/services/api";

const TEAL = "#0b6b6b";

type Usuario = {
  name: string;
  email: string;
  plan: string;
};

const SECOES = ["Conta", "Privacidade", "Segurança", "Preferências", "Sobre"] as const;
type Secao = typeof SECOES[number];

function planLabel(plan: string) {
  const map: Record<string, string> = { basico: "Básico", padrao: "Padrão", premium: "Premium" };
  return map[plan] ?? plan;
}

// ============================================================
// Sub-componente: item de configuração com switch
// ============================================================
function ItemToggle({ titulo, descricao, value, onValueChange }: {
  titulo: string; descricao?: string; value: boolean; onValueChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.configRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.configTitulo}>{titulo}</Text>
        {!!descricao && <Text style={styles.configDesc}>{descricao}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#e2e8f0", true: TEAL }}
        thumbColor="white"
      />
    </View>
  );
}

// Sub-componente: item de configuração com ação
function ItemAcao({ titulo, descricao, onPress, cor, icone, disabled }: {
  titulo: string; descricao?: string; onPress: () => void;
  cor?: string; icone?: string; disabled?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.configRow} onPress={onPress} disabled={disabled}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.configTitulo, cor ? { color: cor } : {}]}>{titulo}</Text>
        {!!descricao && <Text style={styles.configDesc}>{descricao}</Text>}
      </View>
      <Ionicons name={(icone ?? "chevron-forward") as any} size={16} color={cor ?? "#cbd5e1"} />
    </TouchableOpacity>
  );
}

function Divisor() {
  return <View style={styles.divider} />;
}

// ============================================================
// Main
// ============================================================
export default function Configuracoes() {
  const router = useRouter();
  const [secaoAtiva, setSecaoAtiva] = useState<Secao>("Conta");
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  // Toggles
  const [notifPush, setNotifPush] = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);
  const [compartilharDados, setCompartilharDados] = useState(true);
  const [cookies, setCookies] = useState(false);
  const [autenticacaoBio, setAutenticacaoBio] = useState(true);
  const [alertasLogin, setAlertasLogin] = useState(true);
  const [saindo, setSaindo] = useState(false);

  useEffect(() => {
    async function carregar() {
      try {
        const res = await api.get("/auth/me");
        const u: Usuario = res.data.data?.user ?? res.data;
        setUsuario(u);
      } catch {
        // silencioso
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  async function handleSair() {
    Alert.alert("Sair", "Deseja encerrar a sessão?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair", style: "destructive", onPress: async () => {
          setSaindo(true);
          try {
            await signOut(auth);
            router.replace("/login");
          } catch {
            Alert.alert("Erro", "Não foi possível sair. Tente novamente.");
          } finally {
            setSaindo(false);
          }
        },
      },
    ]);
  }

  if (carregando) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={TEAL} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f7f8" }}>
      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configurações</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={{ flex: 1, flexDirection: "row" }}>
        {/* Menu lateral */}
        <ScrollView style={styles.menu} showsVerticalScrollIndicator={false}>
          {SECOES.map((sec) => (
            <TouchableOpacity
              key={sec}
              style={[styles.menuItem, secaoAtiva === sec && styles.menuItemAtivo]}
              onPress={() => setSecaoAtiva(sec)}
            >
              <Text style={[styles.menuItemText, secaoAtiva === sec && styles.menuItemTextAtivo]}>{sec}</Text>
            </TouchableOpacity>
          ))}

          {/* Botão sair */}
          <TouchableOpacity style={styles.menuItemSair} onPress={handleSair} disabled={saindo}>
            {saindo
              ? <ActivityIndicator size="small" color="#ef4444" />
              : <Text style={styles.menuItemSairText}>Sair</Text>}
          </TouchableOpacity>
        </ScrollView>

        {/* Conteúdo */}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 12 }}>

          {/* ---- Conta ---- */}
          {secaoAtiva === "Conta" && (
            <View style={styles.card}>
              <Text style={styles.cardTitulo}>Conta</Text>

              <View style={styles.userPreview}>
                <View style={styles.userPreviewAvatar}>
                  <Text style={styles.userPreviewAvatarText}>
                    {usuario?.name?.split(" ").map((n) => n[0]).slice(0,2).join("").toUpperCase() ?? "?"}
                  </Text>
                </View>
                <View>
                  <Text style={styles.userPreviewNome}>{usuario?.name ?? "—"}</Text>
                  <Text style={styles.userPreviewEmail}>{usuario?.email ?? "—"}</Text>
                  <View style={styles.planBadge}>
                    <Text style={styles.planBadgeText}>Plano {planLabel(usuario?.plan ?? "")}</Text>
                  </View>
                </View>
              </View>

              <Divisor />
              <ItemAcao
                titulo="Editar perfil"
                descricao="Nome, telefone e CPF"
                onPress={() => router.push("/(tabs)/profile" as any)}
              />
              <Divisor />
              <ItemAcao
                titulo="Alterar senha"
                descricao="Redefina sua senha de acesso"
                onPress={() => { setSecaoAtiva("Segurança"); }}
              />
              <Divisor />
              <ItemAcao
                titulo="Gerenciar plano"
                descricao={`Você está no plano ${planLabel(usuario?.plan ?? "")}`}
                onPress={() => router.push("/(tabs)/planos" as any)}
              />
            </View>
          )}

          {/* ---- Privacidade ---- */}
          {secaoAtiva === "Privacidade" && (
            <View style={styles.card}>
              <Text style={styles.cardTitulo}>Privacidade</Text>
              <ItemToggle
                titulo="Compartilhar dados de uso anônimos"
                descricao="Ajuda a melhorar o produto."
                value={compartilharDados}
                onValueChange={setCompartilharDados}
              />
              <Divisor />
              <ItemToggle
                titulo="Cookies de análise"
                descricao="Usados para medir o desempenho do sistema."
                value={cookies}
                onValueChange={setCookies}
              />
              <Divisor />
              <ItemAcao
                titulo="Política de privacidade"
                onPress={() => router.push("/politica-de-privacidade" as any)}
              />
              <Divisor />
              <ItemAcao
                titulo="Termos de uso"
                onPress={() => router.push("/termos-de-uso" as any)}
              />
            </View>
          )}

          {/* ---- Segurança ---- */}
          {secaoAtiva === "Segurança" && (
            <View style={styles.card}>
              <Text style={styles.cardTitulo}>Segurança</Text>
              <ItemToggle
                titulo="Autenticação biométrica"
                descricao="Use impressão digital ou Face ID para entrar."
                value={autenticacaoBio}
                onValueChange={setAutenticacaoBio}
              />
              <Divisor />
              <ItemToggle
                titulo="Alertas de login suspeito"
                descricao="Notificação quando detectar acesso incomum."
                value={alertasLogin}
                onValueChange={setAlertasLogin}
              />
              <Divisor />
              <ItemAcao
                titulo="Alterar senha"
                descricao="Redefina sua senha de acesso"
                onPress={() => router.push("/(tabs)/profile" as any)}
              />
              <Divisor />
              <ItemAcao
                titulo="Excluir conta"
                descricao="Remove permanentemente sua conta e dados"
                onPress={() => router.push("/(tabs)/profile" as any)}
                cor="#ef4444"
                icone="warning-outline"
              />
            </View>
          )}

          {/* ---- Preferências ---- */}
          {secaoAtiva === "Preferências" && (
            <View style={styles.card}>
              <Text style={styles.cardTitulo}>Preferências</Text>
              <ItemToggle
                titulo="Notificações push"
                descricao="Receba alertas de segurança no celular."
                value={notifPush}
                onValueChange={setNotifPush}
              />
              <Divisor />
              <ItemToggle
                titulo="Notificações por e-mail"
                descricao="Receba resumo semanal de atividades."
                value={notifEmail}
                onValueChange={setNotifEmail}
              />
              <Divisor />
              <View style={styles.configRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.configTitulo}>Idioma</Text>
                  <Text style={styles.configDesc}>Português (Brasil)</Text>
                </View>
                <View style={styles.idiomaTag}>
                  <Text style={styles.idiomaTagText}>PT-BR</Text>
                </View>
              </View>
            </View>
          )}

          {/* ---- Sobre ---- */}
          {secaoAtiva === "Sobre" && (
            <View style={styles.card}>
              <Text style={styles.cardTitulo}>Sobre o Aspen Core</Text>
              <View style={styles.sobreHeader}>
                <Ionicons name="shield-checkmark-outline" size={40} color={TEAL} />
                <Text style={styles.sobreNome}>ASPEN CORE</Text>
                <Text style={styles.sobreTagline}>Segurança Digital</Text>
                <Text style={styles.sobreVersao}>Versão 1.0.0</Text>
              </View>
              <Divisor />
              <ItemAcao titulo="Termos de uso" onPress={() => router.push("/termos-de-uso" as any)} />
              <Divisor />
              <ItemAcao titulo="Política de privacidade" onPress={() => router.push("/politica-de-privacidade" as any)} />
              <Divisor />
              <ItemAcao
                titulo="Instagram"
                descricao="@aspencore0"
                onPress={() => Linking.openURL("https://www.instagram.com/aspencore0/")}
                icone="logo-instagram"
              />
              <Divisor />
              <ItemAcao
                titulo="Fale conosco"
                descricao="aspencorp0@gmail.com"
                onPress={() => Linking.openURL("mailto:aspencorp0@gmail.com")}
                icone="mail-outline"
              />
              <Divisor />
              <Text style={styles.sobreCopyright}>© 2026 ASPEN CORE. Todos os direitos reservados.</Text>
            </View>
          )}

          <View style={{ height: 32 }} />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f5f7f8" },

  headerBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingTop: 56, paddingBottom: 12, paddingHorizontal: 16,
    backgroundColor: "white", borderBottomWidth: 0.5, borderBottomColor: "#e2e8f0",
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 16, fontWeight: "700", color: "#0f172a" },

  menu: {
    width: 100, backgroundColor: "white",
    borderRightWidth: 0.5, borderRightColor: "#e2e8f0",
  },
  menuItem: { paddingVertical: 14, paddingHorizontal: 12 },
  menuItemAtivo: { backgroundColor: "#e6f4f4", borderRightWidth: 2, borderRightColor: TEAL },
  menuItemText: { fontSize: 12, color: "#64748b", fontWeight: "500" },
  menuItemTextAtivo: { color: TEAL, fontWeight: "700" },
  menuItemSair: { paddingVertical: 14, paddingHorizontal: 12, marginTop: 8, borderTopWidth: 0.5, borderTopColor: "#e2e8f0" },
  menuItemSairText: { fontSize: 12, color: "#ef4444", fontWeight: "600" },

  card: {
    backgroundColor: "white", borderRadius: 12,
    borderWidth: 0.5, borderColor: "#e2e8f0", padding: 16,
  },
  cardTitulo: { fontSize: 14, fontWeight: "700", color: "#0f172a", marginBottom: 14 },

  userPreview: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 4 },
  userPreviewAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: TEAL, alignItems: "center", justifyContent: "center",
  },
  userPreviewAvatarText: { color: "white", fontSize: 16, fontWeight: "700" },
  userPreviewNome: { fontSize: 14, fontWeight: "600", color: "#0f172a", marginBottom: 1 },
  userPreviewEmail: { fontSize: 11, color: "#64748b", marginBottom: 6 },

  planBadge: { backgroundColor: "#e6f4f4", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, alignSelf: "flex-start" },
  planBadgeText: { fontSize: 10, fontWeight: "600", color: TEAL },

  configRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", paddingVertical: 13, gap: 8,
  },
  configTitulo: { fontSize: 12, fontWeight: "600", color: "#0f172a", marginBottom: 2 },
  configDesc: { fontSize: 11, color: "#94a3b8" },

  divider: { height: 0.5, backgroundColor: "#e2e8f0" },

  idiomaTag: {
    borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  idiomaTagText: { fontSize: 11, color: "#475569", fontWeight: "600" },

  sobreHeader: { alignItems: "center", paddingVertical: 16, gap: 4 },
  sobreNome: { fontSize: 16, fontWeight: "700", color: "#0f172a", letterSpacing: 1 },
  sobreTagline: { fontSize: 12, color: "#64748b" },
  sobreVersao: { fontSize: 11, color: "#94a3b8", marginTop: 4 },
  sobreCopyright: { fontSize: 11, color: "#94a3b8", textAlign: "center", paddingTop: 14 },
});