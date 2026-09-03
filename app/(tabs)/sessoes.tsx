import { useCallback, useEffect, useState } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "@/components/Header";
import { useI18n } from "@/contexts/i18n";
import api from "@/services/api";
import { SESSION_ID_KEY } from "@/services/session";

const TEAL = "#0b6b6b";

type Sessao = {
  id: string;
  label: string;
  browser: string | null;
  os: string | null;
  ip: string | null;
  geo: { city?: string; country?: string } | null;
  created_at: string;
  last_seen_at: string;
};

function formatarQuando(dataStr: string) {
  const d = new Date(dataStr);
  const agora = new Date();
  const diffMin = Math.floor((agora.getTime() - d.getTime()) / 60000);
  if (diffMin < 1) return "Agora mesmo";
  if (diffMin < 60) return `Há ${diffMin} min`;
  if (diffMin < 1440) return `Há ${Math.floor(diffMin / 60)} h`;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function Sessoes() {
  const { colors } = useI18n();

  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [sessaoAtualId, setSessaoAtualId] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [removendoId, setRemovendoId] = useState<string | null>(null);
  const [encerrandoTodas, setEncerrandoTodas] = useState(false);

  const carregar = useCallback(async () => {
    setErro(null);
    try {
      const [atualId, res] = await Promise.all([
        AsyncStorage.getItem(SESSION_ID_KEY),
        api.get("/auth/sessions"),
      ]);
      setSessaoAtualId(atualId);
      setSessoes(res.data?.data?.sessions ?? []);
    } catch (err: any) {
      setErro(err?.response?.data?.message ?? "Não foi possível carregar suas sessões.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function confirmarRemocao(s: Sessao) {
    Alert.alert(
      "Encerrar sessão",
      `Encerrar o acesso de "${s.label}"? Esse dispositivo vai precisar entrar novamente.`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Encerrar", style: "destructive", onPress: () => remover(s.id) },
      ],
    );
  }

  async function remover(id: string) {
    setRemovendoId(id);
    try {
      await api.delete(`/auth/sessions/${id}`);
      setSessoes((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      Alert.alert("Erro", err?.response?.data?.message ?? "Não foi possível encerrar essa sessão.");
    } finally {
      setRemovendoId(null);
    }
  }

  function confirmarEncerrarTodas() {
    Alert.alert(
      "Encerrar todas as sessões",
      "Isso desconecta todos os seus dispositivos, incluindo este. Você vai precisar entrar novamente.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Encerrar todas", style: "destructive", onPress: encerrarTodas },
      ],
    );
  }

  async function encerrarTodas() {
    setEncerrandoTodas(true);
    try {
      await api.post("/auth/revoke-sessions");
      Alert.alert("Pronto", "Todas as sessões foram encerradas. Você será desconectado.");
    } catch (err: any) {
      Alert.alert("Erro", err?.response?.data?.message ?? "Não foi possível encerrar as sessões.");
    } finally {
      setEncerrandoTodas(false);
    }
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bg }]}>
      <Header titulo="Sessões ativas" subtitulo="Dispositivos conectados à sua conta" />

      {erro && (
        <View style={styles.erroBanner}>
          <Ionicons name="warning-outline" size={16} color="#ef4444" />
          <Text style={styles.erroBannerText}>{erro}</Text>
        </View>
      )}

      <View style={styles.section}>
        {carregando ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ActivityIndicator color={TEAL} />
          </View>
        ) : sessoes.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="phone-portrait-outline" size={40} color={colors.textMuted} />
            <Text style={[styles.emptyTitulo, { color: colors.textSec }]}>Nenhuma sessão encontrada</Text>
          </View>
        ) : (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {sessoes.map((s, i) => {
              const local = [s.geo?.city, s.geo?.country].filter(Boolean).join(", ");
              const ehAtual = s.id === sessaoAtualId;
              return (
                <View key={s.id}>
                  <View style={styles.sessaoRow}>
                    <View style={styles.iconWrap}>
                      <Ionicons name="phone-portrait-outline" size={20} color={TEAL} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.tituloRow}>
                        <Text style={[styles.sessaoLabel, { color: colors.text }]}>{s.label}</Text>
                        {ehAtual && (
                          <View style={styles.badgeAtual}>
                            <Text style={styles.badgeAtualText}>Este dispositivo</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.sessaoDetalhe, { color: colors.textMuted }]}>
                        {[s.browser, s.os].filter(Boolean).join(" · ")}
                      </Text>
                      {!!local && <Text style={[styles.sessaoDetalhe, { color: colors.textMuted }]}>{local}{s.ip ? ` · ${s.ip}` : ""}</Text>}
                      <Text style={[styles.sessaoData, { color: colors.textMuted }]}>Ativo {formatarQuando(s.last_seen_at)}</Text>
                    </View>
                    {!ehAtual && (
                      <TouchableOpacity onPress={() => confirmarRemocao(s)} disabled={removendoId === s.id} style={styles.btnRemover}>
                        {removendoId === s.id
                          ? <ActivityIndicator size="small" color="#ef4444" />
                          : <Ionicons name="log-out-outline" size={18} color="#ef4444" />}
                      </TouchableOpacity>
                    )}
                  </View>
                  {i < sessoes.length - 1 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
                </View>
              );
            })}
          </View>
        )}
      </View>

      {sessoes.length > 1 && (
        <TouchableOpacity style={styles.btnEncerrarTodas} onPress={confirmarEncerrarTodas} disabled={encerrandoTodas}>
          {encerrandoTodas
            ? <ActivityIndicator size="small" color="#ef4444" />
            : <Text style={styles.btnEncerrarTodasText}>Encerrar todas as sessões</Text>}
        </TouchableOpacity>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  erroBanner: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#fee2e2", marginHorizontal: 16, marginTop: 14, padding: 12, borderRadius: 10 },
  erroBannerText: { color: "#ef4444", fontSize: 12, flex: 1 },
  section: { padding: 16 },
  emptyCard: { borderRadius: 12, borderWidth: 0.5, alignItems: "center", padding: 48, gap: 8 },
  emptyTitulo: { fontSize: 15, fontWeight: "600" },
  card: { borderRadius: 12, borderWidth: 0.5, overflow: "hidden" },
  sessaoRow: { flexDirection: "row", alignItems: "center", padding: 16, gap: 12 },
  iconWrap: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#e6f4f4", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  tituloRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  sessaoLabel: { fontSize: 14, fontWeight: "600" },
  badgeAtual: { backgroundColor: "#dcfce7", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  badgeAtualText: { fontSize: 10, fontWeight: "700", color: "#16a34a" },
  sessaoDetalhe: { fontSize: 12, marginTop: 2 },
  sessaoData: { fontSize: 11, marginTop: 4 },
  btnRemover: { padding: 6 },
  divider: { height: 0.5, marginHorizontal: 16 },
  btnEncerrarTodas: { marginHorizontal: 16, alignItems: "center", paddingVertical: 12 },
  btnEncerrarTodasText: { color: "#ef4444", fontSize: 13, fontWeight: "700" },
});