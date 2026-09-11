import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Location from "expo-location";
// ATENÇÃO DE VERSÃO: o app está com newArchEnabled: false (confirmado no
// prompt de revisão do Aspen Network). A partir da v11, o
// @maplibre/maplibre-react-native exige a New Architecture e renomeia
// MapView -> Map. Enquanto newArchEnabled continuar false, instale uma
// versão anterior à v11 (ex: `npx expo install @maplibre/maplibre-react-native@10`)
// e mantenha a API abaixo (MapView/Camera/PointAnnotation). Se um dia a New
// Architecture for ativada no projeto, revisar este arquivo pra API nova.
import MapLibreGL from "@maplibre/maplibre-react-native";
import { useI18n } from "@/contexts/i18n";
import {
  listarAspenKeysPareadas, atualizarLocalizacaoAspenKey, removerAspenKey,
  calcularStatus, STATUS_INFO, type AspenKeyPareada,
} from "@/services/aspen-keys-local";

const TEAL = "#0b6b6b";

// Estilo de mapa sem exigir chave nenhuma — tiles demo do próprio MapLibre.
// Trocar pela URL de estilo definitiva do projeto quando/se a equipe tiver
// uma (ex: hospedando estilo próprio ou usando outro provedor sem custo).
const MAP_STYLE_URL = "https://demotiles.maplibre.org/style.json";

const MODELO_LABEL: Record<string, string> = {
  aspenkey_lite: "Aspen Key Lite",
  aspenkey_pro: "Aspen Key Pro",
};

export default function AspenKeyDetalhe() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useI18n();

  const [chave, setChave] = useState<AspenKeyPareada | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [atualizandoLocal, setAtualizandoLocal] = useState(false);

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function carregar() {
    setCarregando(true);
    const lista = await listarAspenKeysPareadas();
    setChave(lista.find((k) => k.id === id) ?? null);
    setCarregando(false);
  }

  async function marcarComoPerto() {
    if (!chave) return;
    setAtualizandoLocal(true);
    try {
      const permissao = await Location.requestForegroundPermissionsAsync();
      if (!permissao.granted) {
        Alert.alert("Permissão necessária", "Ative a permissão de localização para usar este botão.");
        return;
      }
      const posicao = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      await atualizarLocalizacaoAspenKey(chave.id, {
        lat: posicao.coords.latitude,
        lng: posicao.coords.longitude,
        precisao: posicao.coords.accuracy,
        timestamp: new Date().toISOString(),
      });
      await carregar();
    } catch {
      Alert.alert("Erro", "Não foi possível obter sua localização atual.");
    } finally {
      setAtualizandoLocal(false);
    }
  }

  function confirmarRemocao() {
    Alert.alert(
      "Remover Aspen Key",
      "Isso remove o pareamento deste aparelho com essa Aspen Key. Você pode parear de novo depois.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover", style: "destructive", onPress: async () => {
            if (!chave) return;
            await removerAspenKey(chave.id);
            router.back();
          },
        },
      ],
    );
  }

  if (carregando) {
    return (
      <View style={[styles.loadingWrap, { backgroundColor: colors.bg }]}>
        <ActivityIndicator color={TEAL} size="large" />
      </View>
    );
  }

  if (!chave) {
    return (
      <View style={[styles.loadingWrap, { backgroundColor: colors.bg }]}>
        <Text style={{ color: colors.textSec }}>Aspen Key não encontrada.</Text>
      </View>
    );
  }

  const status = calcularStatus(chave.ultimaLocalizacao);
  const st = STATUS_INFO[status];
  const ehLite = chave.modelo === "aspenkey_lite";

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[styles.btnVoltar, { backgroundColor: colors.inputBg }]} onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitulo, { color: colors.text }]} numberOfLines={1}>{chave.nome}</Text>
        <TouchableOpacity style={[styles.btnVoltar, { backgroundColor: colors.inputBg }]} onPress={confirmarRemocao}>
          <Ionicons name="trash-outline" size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.modeloBadge}>
          <Text style={styles.modeloBadgeText}>{MODELO_LABEL[chave.modelo] ?? chave.modelo}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: st.fundo }]}>
          <View style={[styles.statusDot, { backgroundColor: st.cor }]} />
          <Text style={[styles.statusText, { color: st.cor }]}>{st.label}</Text>
        </View>
      </View>

      {chave.ultimaLocalizacao ? (
        <>
          <View style={styles.mapaWrap}>
            <MapLibreGL.MapView style={styles.mapa} mapStyle={MAP_STYLE_URL} logoEnabled={false}>
              <MapLibreGL.Camera
                zoomLevel={15}
                centerCoordinate={[chave.ultimaLocalizacao.lng, chave.ultimaLocalizacao.lat]}
              />
              <MapLibreGL.PointAnnotation
                id="ultima-localizacao"
                coordinate={[chave.ultimaLocalizacao.lng, chave.ultimaLocalizacao.lat]}
              >
                <View style={styles.marcador}>
                  <Ionicons name="key" size={16} color="white" />
                </View>
              </MapLibreGL.PointAnnotation>
            </MapLibreGL.MapView>
          </View>
          <View style={styles.detalhesLocal}>
            <Text style={[styles.detalheLabel, { color: colors.textMuted }]}>Latitude / Longitude</Text>
            <Text style={[styles.detalheValor, { color: colors.text }]}>
              {chave.ultimaLocalizacao.lat.toFixed(6)}, {chave.ultimaLocalizacao.lng.toFixed(6)}
            </Text>
            {chave.ultimaLocalizacao.precisao != null && (
              <Text style={[styles.detalheSub, { color: colors.textMuted }]}>
                Precisão aproximada: {Math.round(chave.ultimaLocalizacao.precisao)} m
              </Text>
            )}
          </View>
        </>
      ) : (
        <View style={[styles.emptyMapa, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="location-outline" size={32} color={colors.textMuted} />
          <Text style={[styles.emptyMapaTexto, { color: colors.textMuted }]}>Ainda sem localização registrada.</Text>
        </View>
      )}

      {ehLite && (
        <TouchableOpacity style={styles.btnPerto} onPress={marcarComoPerto} disabled={atualizandoLocal}>
          {atualizandoLocal
            ? <ActivityIndicator color="white" size="small" />
            : (
              <>
                <Ionicons name="location" size={18} color="white" />
                <Text style={styles.btnPertoText}>Estou perto da minha Aspen Key agora</Text>
              </>
            )}
        </TouchableOpacity>
      )}
      {ehLite && (
        <Text style={[styles.avisoLite, { color: colors.textMuted }]}>
          Modelo Lite: a localização é atualizada manualmente, usando o GPS do seu celular como substituto
          da detecção automática por Bluetooth — a detecção automática é uma etapa futura.
        </Text>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 0.5, gap: 10 },
  btnVoltar: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  headerTitulo: { fontSize: 16, fontWeight: "700", flex: 1, textAlign: "center" },
  infoRow: { flexDirection: "row", gap: 10, padding: 16 },
  modeloBadge: { backgroundColor: "#f1f5f9", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  modeloBadgeText: { fontSize: 11, fontWeight: "700", color: "#475569" },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: "700" },
  mapaWrap: { marginHorizontal: 16, borderRadius: 14, overflow: "hidden", height: 240 },
  mapa: { flex: 1 },
  marcador: { width: 32, height: 32, borderRadius: 16, backgroundColor: TEAL, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "white" },
  detalhesLocal: { padding: 16 },
  detalheLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5, marginBottom: 4 },
  detalheValor: { fontSize: 15, fontWeight: "600", marginBottom: 4 },
  detalheSub: { fontSize: 12 },
  emptyMapa: { marginHorizontal: 16, borderRadius: 14, borderWidth: 0.5, alignItems: "center", padding: 40, gap: 8 },
  emptyMapaTexto: { fontSize: 13 },
  btnPerto: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: TEAL, marginHorizontal: 16, marginTop: 20, borderRadius: 12, paddingVertical: 15 },
  btnPertoText: { color: "white", fontWeight: "700", fontSize: 14 },
  avisoLite: { fontSize: 11, textAlign: "center", marginHorizontal: 24, marginTop: 10, lineHeight: 16 },
});