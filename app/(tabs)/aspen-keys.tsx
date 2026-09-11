import { useCallback, useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import Header from "@/components/Header";
import { useI18n } from "@/contexts/i18n";
import {
  listarAspenKeysPareadas, calcularStatus, STATUS_INFO,
  type AspenKeyPareada,
} from "@/services/aspen-keys-local";

const TEAL = "#0b6b6b";

const MODELO_LABEL: Record<string, string> = {
  aspenkey_lite: "Aspen Key Lite",
  aspenkey_pro: "Aspen Key Pro",
};

function formatarAtualizada(timestamp: string | undefined) {
  if (!timestamp) return "Nunca atualizada";
  const diffMin = Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000);
  if (diffMin < 1) return "Atualizada agora mesmo";
  if (diffMin < 60) return `Atualizada há ${diffMin} min`;
  if (diffMin < 1440) return `Atualizada há ${Math.floor(diffMin / 60)} h`;
  return `Atualizada há ${Math.floor(diffMin / 1440)} dia(s)`;
}

export default function AspenKeys() {
  const router = useRouter();
  const { colors } = useI18n();

  const [chaves, setChaves] = useState<AspenKeyPareada[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);

  const carregar = useCallback(async (comSpinner = true) => {
    if (comSpinner) setCarregando(true);
    const lista = await listarAspenKeysPareadas();
    setChaves(lista);
    setCarregando(false);
    setAtualizando(false);
  }, []);

  // Recarrega toda vez que a tela ganha foco (ex: voltando do pareamento)
  useFocusEffect(
    useCallback(() => {
      carregar(false);
    }, [carregar]),
  );

  function onRefresh() {
    setAtualizando(true);
    carregar(false);
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
      refreshControl={<RefreshControl refreshing={atualizando} onRefresh={onRefresh} tintColor={TEAL} />}
    >
      <Header
        titulo="Minhas Aspen Keys"
        subtitulo="Localize e gerencie suas chaves físicas"
        direita={
          <TouchableOpacity
            style={[styles.btnAdicionar, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push("/aspen-key-pareamento" as any)}
          >
            <Ionicons name="add" size={20} color={TEAL} />
          </TouchableOpacity>
        }
      />

      <View style={styles.avisoBanner}>
        <Ionicons name="information-circle-outline" size={16} color={TEAL} />
        <Text style={styles.avisoBannerText}>
          O pareamento fica salvo apenas neste aparelho por enquanto — ainda não sincroniza com o site.
        </Text>
      </View>

      <View style={styles.section}>
        {carregando ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ActivityIndicator color={TEAL} />
          </View>
        ) : chaves.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="key-outline" size={40} color={colors.textMuted} />
            <Text style={[styles.emptyTitulo, { color: colors.textSec }]}>Nenhuma Aspen Key pareada</Text>
            <Text style={[styles.emptyDesc, { color: colors.textMuted }]}>Toque no + para procurar uma por perto.</Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {chaves.map((k) => {
              const status = calcularStatus(k.ultimaLocalizacao);
              const st = STATUS_INFO[status];
              return (
                <TouchableOpacity
                  key={k.id}
                  style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => router.push({ pathname: "/aspen-key-detalhe" as any, params: { id: k.id } })}
                >
                  <View style={styles.cardIconWrap}>
                    <Ionicons name="key" size={22} color={TEAL} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.cardTopo}>
                      <Text style={[styles.cardNome, { color: colors.text }]}>{k.nome}</Text>
                      <View style={styles.modeloBadge}>
                        <Text style={styles.modeloBadgeText}>{MODELO_LABEL[k.modelo] ?? k.modelo}</Text>
                      </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: st.fundo, alignSelf: "flex-start" }]}>
                      <View style={[styles.statusDot, { backgroundColor: st.cor }]} />
                      <Text style={[styles.statusText, { color: st.cor }]}>{st.label}</Text>
                    </View>
                    <Text style={[styles.cardAtualizada, { color: colors.textMuted }]}>
                      {formatarAtualizada(k.ultimaLocalizacao?.timestamp)}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </TouchableOpacity>
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
  btnAdicionar: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", borderWidth: 0.5 },
  avisoBanner: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#e6f4f4", marginHorizontal: 16, marginTop: 14, padding: 12, borderRadius: 10 },
  avisoBannerText: { color: TEAL, fontSize: 12, flex: 1 },
  section: { padding: 16 },
  emptyCard: { borderRadius: 12, borderWidth: 0.5, alignItems: "center", padding: 48, gap: 8 },
  emptyTitulo: { fontSize: 15, fontWeight: "600" },
  emptyDesc: { fontSize: 13, textAlign: "center" },
  card: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 12, borderWidth: 0.5, padding: 16 },
  cardIconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#e6f4f4", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  cardTopo: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" },
  cardNome: { fontSize: 15, fontWeight: "600" },
  modeloBadge: { backgroundColor: "#f1f5f9", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  modeloBadgeText: { fontSize: 10, fontWeight: "700", color: "#475569" },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, marginBottom: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: "700" },
  cardAtualizada: { fontSize: 11 },
});