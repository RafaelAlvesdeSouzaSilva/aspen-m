import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useI18n } from "@/contexts/i18n";
import { useScanAspenKeys, type AspenKeyEncontrada } from "@/services/ble";
import { parearAspenKey, type ModeloAspenKey } from "@/services/aspen-keys-local";

const TEAL = "#0b6b6b";

// Força de sinal aproximada em "barras" — RSSI é negativo, quanto mais
// perto de 0, mais perto fisicamente. Faixas aproximadas, não uma medição
// de distância exata (BLE não permite isso com precisão).
function forcaSinal(rssi: number | null): { barras: number; label: string } {
  if (rssi === null) return { barras: 0, label: "—" };
  if (rssi >= -55) return { barras: 4, label: "Muito perto" };
  if (rssi >= -70) return { barras: 3, label: "Perto" };
  if (rssi >= -85) return { barras: 2, label: "Média distância" };
  return { barras: 1, label: "Longe" };
}

export default function AspenKeyPareamento() {
  const router = useRouter();
  const { colors } = useI18n();
  const { escaneando, encontradas, erro, iniciar, parar } = useScanAspenKeys();

  const [modalModelo, setModalModelo] = useState<AspenKeyEncontrada | null>(null);
  const [pareando, setPareando] = useState(false);

  useEffect(() => {
    iniciar();
    return () => parar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function confirmarPareamento(modelo: ModeloAspenKey) {
    if (!modalModelo) return;
    setPareando(true);
    try {
      await parearAspenKey(modalModelo.id, modalModelo.nome, modelo);
      setModalModelo(null);
      parar();
      Alert.alert("Pareada!", "Sua Aspen Key foi adicionada à sua lista.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("Erro", "Não foi possível parear essa Aspen Key. Tente novamente.");
    } finally {
      setPareando(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[styles.btnVoltar, { backgroundColor: colors.inputBg }]} onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitulo, { color: colors.text }]}>Procurar Aspen Key</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.statusWrap}>
        {escaneando && !erro && (
          <>
            <ActivityIndicator color={TEAL} size="small" />
            <Text style={[styles.statusTexto, { color: colors.textSec }]}>Procurando por perto...</Text>
          </>
        )}
        {erro && (
          <View style={styles.erroBox}>
            <Ionicons name="bluetooth-outline" size={18} color="#ef4444" />
            <Text style={styles.erroTexto}>{erro}</Text>
            <TouchableOpacity onPress={iniciar} style={styles.btnTentarNovamente}>
              <Text style={styles.btnTentarNovamenteText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.lista}>
        {!erro && !escaneando && encontradas.length === 0 && (
          <Text style={[styles.vazioTexto, { color: colors.textMuted }]}>Nenhuma Aspen Key encontrada ainda.</Text>
        )}
        {encontradas.map((dispositivo) => {
          const sinal = forcaSinal(dispositivo.rssi);
          return (
            <TouchableOpacity
              key={dispositivo.id}
              style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => setModalModelo(dispositivo)}
            >
              <View style={styles.itemIconWrap}>
                <Ionicons name="key" size={20} color={TEAL} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemNome, { color: colors.text }]}>{dispositivo.nome}</Text>
                <View style={styles.sinalRow}>
                  {[1, 2, 3, 4].map((n) => (
                    <View
                      key={n}
                      style={[
                        styles.barraSinal,
                        { height: 4 + n * 3 },
                        n <= sinal.barras ? { backgroundColor: TEAL } : { backgroundColor: colors.border },
                      ]}
                    />
                  ))}
                  <Text style={[styles.sinalLabel, { color: colors.textMuted }]}>{sinal.label}</Text>
                </View>
              </View>
              <Text style={[styles.btnParear, { color: TEAL }]}>Parear</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Modal escolher modelo */}
      <Modal visible={!!modalModelo} transparent animationType="fade" onRequestClose={() => setModalModelo(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitulo, { color: colors.text }]}>Qual é o modelo?</Text>
            <Text style={[styles.modalTexto, { color: colors.textSec }]}>
              {modalModelo?.nome} — escolha o modelo pra gente saber como usá-la depois.
            </Text>
            <TouchableOpacity
              style={styles.btnModelo}
              onPress={() => confirmarPareamento("aspenkey_lite")}
              disabled={pareando}
            >
              <Text style={styles.btnModeloText}>Aspen Key Lite</Text>
              <Text style={styles.btnModeloDesc}>Localização manual (você confirma quando está perto)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnModelo}
              onPress={() => confirmarPareamento("aspenkey_pro")}
              disabled={pareando}
            >
              <Text style={styles.btnModeloText}>Aspen Key Pro</Text>
              <Text style={styles.btnModeloDesc}>Localização automática por proximidade</Text>
            </TouchableOpacity>
            {pareando
              ? <ActivityIndicator color={TEAL} style={{ marginTop: 12 }} />
              : (
                <TouchableOpacity style={styles.modalBtnCancelar} onPress={() => setModalModelo(null)}>
                  <Text style={[styles.modalBtnCancelarText, { color: colors.textSec }]}>Cancelar</Text>
                </TouchableOpacity>
              )
            }
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 0.5 },
  btnVoltar: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  headerTitulo: { fontSize: 16, fontWeight: "700" },
  statusWrap: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 20 },
  statusTexto: { fontSize: 13 },
  erroBox: { alignItems: "center", gap: 8, paddingHorizontal: 24 },
  erroTexto: { color: "#ef4444", fontSize: 13, textAlign: "center" },
  btnTentarNovamente: { backgroundColor: TEAL, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8, marginTop: 4 },
  btnTentarNovamenteText: { color: "white", fontWeight: "700", fontSize: 13 },
  lista: { paddingHorizontal: 16, gap: 10 },
  vazioTexto: { textAlign: "center", fontSize: 13, marginTop: 40 },
  itemCard: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 12, borderWidth: 0.5, padding: 14 },
  itemIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#e6f4f4", alignItems: "center", justifyContent: "center" },
  itemNome: { fontSize: 14, fontWeight: "600", marginBottom: 4 },
  sinalRow: { flexDirection: "row", alignItems: "flex-end", gap: 3 },
  barraSinal: { width: 4, borderRadius: 2 },
  sinalLabel: { fontSize: 11, marginLeft: 6 },
  btnParear: { fontSize: 13, fontWeight: "700" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", padding: 24 },
  modalCard: { borderRadius: 16, padding: 22 },
  modalTitulo: { fontSize: 18, fontWeight: "700", marginBottom: 6 },
  modalTexto: { fontSize: 13, marginBottom: 16, lineHeight: 19 },
  btnModelo: { borderWidth: 1.5, borderColor: TEAL, borderRadius: 10, padding: 14, marginBottom: 10 },
  btnModeloText: { color: TEAL, fontWeight: "700", fontSize: 14, marginBottom: 2 },
  btnModeloDesc: { color: "#64748b", fontSize: 11 },
  modalBtnCancelar: { alignItems: "center", paddingVertical: 10, marginTop: 4 },
  modalBtnCancelarText: { fontWeight: "600", fontSize: 14 },
});