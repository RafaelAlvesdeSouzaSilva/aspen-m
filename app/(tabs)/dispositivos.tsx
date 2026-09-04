import { useCallback, useEffect, useState } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Modal, TextInput, ActivityIndicator, Alert, RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from "@/components/Header";
import { useI18n } from "@/contexts/i18n";
import api from "@/services/api";

const TEAL = "#0b6b6b";

type TipoDispositivo = "desktop" | "mobile" | "tablet";

type Dispositivo = {
  id: number | string;
  name: string;
  type: TipoDispositivo;
  os: string | null;
  status: "online" | "offline";
  last_access_at: string | null;
  created_at: string;
};

const ICONE_POR_TIPO: Record<TipoDispositivo, keyof typeof Ionicons.glyphMap> = {
  desktop: "desktop-outline",
  mobile: "phone-portrait-outline",
  tablet: "tablet-portrait-outline",
};

const LABEL_POR_TIPO: Record<TipoDispositivo, string> = {
  desktop: "computador",
  mobile: "celular",
  tablet: "tablet",
};

// Mesmo cuidado do planos.tsx: essa API às vezes devolve o payload sem
// o aninhamento {data:{...}} esperado. Sem isso, a lista podia ficar
// sempre vazia mesmo com dispositivos cadastrados de verdade.
function extrairDispositivos(res: any): Dispositivo[] {
  return res.data?.data?.devices ?? res.data?.devices ?? (Array.isArray(res.data) ? res.data : []);
}

function formatarUltimoAcesso(dataStr: string | null) {
  if (!dataStr) return "Nunca acessado";
  const data = new Date(dataStr);
  const agora = new Date();
  const diffSeg = Math.floor((agora.getTime() - data.getTime()) / 1000);
  if (diffSeg < 60) return "Agora mesmo";
  if (diffSeg < 3600) return `Há ${Math.floor(diffSeg / 60)} min`;
  if (diffSeg < 86400) return `Há ${Math.floor(diffSeg / 3600)} h`;
  if (diffSeg < 172800) return `Ontem, ${data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
  return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) + ", " +
    data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export default function Dispositivos() {
  const { colors, t } = useI18n();

  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [verificandoId, setVerificandoId] = useState<string | number | null>(null);

  // Modal de adicionar
  const [modalAdicionar, setModalAdicionar] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novoTipo, setNovoTipo] = useState<TipoDispositivo>("mobile");
  const [novoOs, setNovoOs] = useState("");
  const [salvandoNovo, setSalvandoNovo] = useState(false);
  const [erroModal, setErroModal] = useState<string | null>(null);

  const carregarDispositivos = useCallback(async (comSpinner = true) => {
    if (comSpinner) setCarregando(true);
    setErro(null);
    try {
      const res = await api.get("/devices");
      setDispositivos(extrairDispositivos(res));
    } catch (err: any) {
      setErro(
        err?.response?.data?.message ?? "Não foi possível carregar seus dispositivos.",
      );
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, []);

  useEffect(() => {
    carregarDispositivos();
  }, [carregarDispositivos]);

  const onRefresh = () => {
    setAtualizando(true);
    carregarDispositivos(false);
  };

  const onlineCount = dispositivos.filter((d) => d.status === "online").length;

  async function verificarAgora(d: Dispositivo) {
    setVerificandoId(d.id);
    try {
      await api.patch(`/devices/${d.id}/status`, { status: "online" });
      await carregarDispositivos(false);
    } catch (err: any) {
      Alert.alert(
        "Erro",
        err?.response?.data?.message ?? "Não foi possível verificar o dispositivo.",
      );
    } finally {
      setVerificandoId(null);
    }
  }

  function confirmarRemocao(d: Dispositivo) {
    Alert.alert(
      "Remover dispositivo",
      `Remover "${d.name}" da sua conta? Essa ação não pode ser desfeita.`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Remover", style: "destructive", onPress: () => removerDispositivo(d.id) },
      ],
    );
  }

  async function removerDispositivo(id: string | number) {
    const anteriores = dispositivos;
    setDispositivos((prev) => prev.filter((d) => d.id !== id));
    try {
      await api.delete(`/devices/${id}`);
    } catch (err: any) {
      setDispositivos(anteriores);
      Alert.alert(
        "Erro",
        err?.response?.data?.message ?? "Não foi possível remover o dispositivo.",
      );
    }
  }

  function abrirModalAdicionar() {
    setNovoNome("");
    setNovoTipo("mobile");
    setNovoOs("");
    setErroModal(null);
    setModalAdicionar(true);
  }

  async function salvarNovoDispositivo() {
    if (!novoNome || novoNome.trim().length < 2) {
      setErroModal("Informe um nome com pelo menos 2 caracteres.");
      return;
    }
    setSalvandoNovo(true);
    setErroModal(null);
    try {
      await api.post("/devices", {
        name: novoNome.trim(),
        type: novoTipo,
        os: novoOs.trim() || null,
      });
      // Recarrega da fonte real (GET /devices) em vez de confiar no
      // formato exato do objeto devolvido pelo POST — se o dispositivo
      // foi criado, ele aparece aqui de qualquer forma.
      await carregarDispositivos(false);
      setModalAdicionar(false);
    } catch (err: any) {
      setErroModal(
        err?.response?.data?.message ?? "Não foi possível adicionar o dispositivo.",
      );
    } finally {
      setSalvandoNovo(false);
    }
  }

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.bg }]}
        refreshControl={<RefreshControl refreshing={atualizando} onRefresh={onRefresh} tintColor={TEAL} />}
      >
        <Header
          titulo={t("devices")}
          subtitulo={t("devicesSubtitulo")}
          direita={
            <TouchableOpacity
              style={[styles.btnAdicionar, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={abrirModalAdicionar}
            >
              <Ionicons name="add" size={20} color={TEAL} />
            </TouchableOpacity>
          }
        />

        <View style={styles.resumoRow}>
          {[
            { val: dispositivos.length, label: t("total"), color: colors.text },
            { val: onlineCount, label: t("online"), color: "#16a34a" },
            { val: dispositivos.length - onlineCount, label: t("offline"), color: colors.textMuted },
          ].map((r) => (
            <View key={r.label} style={[styles.resumoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.resumoValor, { color: r.color }]}>{r.val}</Text>
              <Text style={[styles.resumoLabel, { color: colors.textMuted }]}>{r.label}</Text>
            </View>
          ))}
        </View>

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
          ) : dispositivos.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="desktop-outline" size={40} color={colors.textMuted} />
              <Text style={[styles.emptyTitulo, { color: colors.textSec }]}>{t("noDevices")}</Text>
              <Text style={[styles.emptyDesc, { color: colors.textMuted }]}>{t("noDevicesDesc")}</Text>
            </View>
          ) : (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {dispositivos.map((d, i) => (
                <View key={d.id}>
                  <View style={styles.dispositivoRow}>
                    <View style={styles.dispositivoIconWrap}>
                      <Ionicons name={ICONE_POR_TIPO[d.type] ?? "desktop-outline"} size={22} color={TEAL} />
                    </View>
                    <View style={styles.dispositivoInfo}>
                      <View style={styles.dispositivoTitleRow}>
                        <Text style={[styles.dispositivoNome, { color: colors.text }]}>{d.name}</Text>
                        <View style={[styles.statusBadge, d.status === "online" ? styles.statusOnline : { backgroundColor: colors.inputBg }]}>
                          <View style={[styles.statusDot, { backgroundColor: d.status === "online" ? "#16a34a" : colors.textMuted }]} />
                          <Text style={[styles.statusText, { color: d.status === "online" ? "#16a34a" : colors.textMuted }]}>
                            {d.status === "online" ? t("online") : t("offline")}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.dispositivoTipo, { color: colors.textMuted }]}>
                        {LABEL_POR_TIPO[d.type] ?? d.type}{d.os ? ` · ${d.os}` : ""}
                      </Text>
                      <Text style={[styles.dispositivoAcesso, { color: colors.textMuted }]}>
                        {t("lastAccess")} {formatarUltimoAcesso(d.last_access_at)}
                      </Text>
                    </View>
                    <View style={styles.acoesCol}>
                      {d.status !== "online" && (
                        <TouchableOpacity
                          onPress={() => verificarAgora(d)}
                          disabled={verificandoId === d.id}
                          style={styles.btnVerificar}
                        >
                          {verificandoId === d.id
                            ? <ActivityIndicator size="small" color={TEAL} />
                            : <Text style={styles.btnVerificarText}>Verificar</Text>}
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity onPress={() => confirmarRemocao(d)} style={styles.btnRemover}>
                        <Ionicons name="trash-outline" size={18} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  {i < dispositivos.length - 1 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
                </View>
              ))}
            </View>
          )}
        </View>
        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Modal adicionar dispositivo */}
      <Modal visible={modalAdicionar} transparent animationType="fade" onRequestClose={() => setModalAdicionar(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitulo, { color: colors.text }]}>Adicionar dispositivo</Text>

            <Text style={[styles.modalLabel, { color: colors.textSec }]}>Nome *</Text>
            <TextInput
              style={[styles.modalInput, { borderColor: colors.border, color: colors.text }]}
              placeholder="Ex: iPhone do Fael"
              placeholderTextColor={colors.textMuted}
              value={novoNome}
              onChangeText={setNovoNome}
            />

            <Text style={[styles.modalLabel, { color: colors.textSec }]}>Tipo *</Text>
            <View style={styles.tipoRow}>
              {(["mobile", "tablet", "desktop"] as TipoDispositivo[]).map((tipo) => (
                <TouchableOpacity
                  key={tipo}
                  style={[
                    styles.tipoBtn,
                    { borderColor: colors.border },
                    novoTipo === tipo && { borderColor: TEAL, backgroundColor: "#e6f4f4" },
                  ]}
                  onPress={() => setNovoTipo(tipo)}
                >
                  <Ionicons name={ICONE_POR_TIPO[tipo]} size={18} color={novoTipo === tipo ? TEAL : colors.textMuted} />
                  <Text style={[styles.tipoBtnText, { color: novoTipo === tipo ? TEAL : colors.textMuted }]}>
                    {LABEL_POR_TIPO[tipo]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.modalLabel, { color: colors.textSec }]}>Sistema (opcional)</Text>
            <TextInput
              style={[styles.modalInput, { borderColor: colors.border, color: colors.text }]}
              placeholder="Ex: iOS 18, Windows 11..."
              placeholderTextColor={colors.textMuted}
              value={novoOs}
              onChangeText={setNovoOs}
            />

            {erroModal && <Text style={styles.modalErro}>{erroModal}</Text>}

            <View style={styles.modalBotoes}>
              <TouchableOpacity style={styles.modalBtnCancelar} onPress={() => setModalAdicionar(false)}>
                <Text style={[styles.modalBtnCancelarText, { color: colors.textSec }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtnSalvar, salvandoNovo && { opacity: 0.6 }]}
                onPress={salvarNovoDispositivo}
                disabled={salvandoNovo}
              >
                {salvandoNovo
                  ? <ActivityIndicator size="small" color="white" />
                  : <Text style={styles.modalBtnSalvarText}>Adicionar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  btnAdicionar: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", borderWidth: 0.5 },
  resumoRow: { flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingTop: 16 },
  resumoCard: { flex: 1, borderRadius: 12, padding: 14, alignItems: "center", borderWidth: 0.5 },
  resumoValor: { fontSize: 24, fontWeight: "700" },
  resumoLabel: { fontSize: 11, marginTop: 2 },
  erroBanner: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#fee2e2", marginHorizontal: 16, marginTop: 14, padding: 12, borderRadius: 10 },
  erroBannerText: { color: "#ef4444", fontSize: 12, flex: 1 },
  section: { padding: 16 },
  card: { borderRadius: 12, borderWidth: 0.5, overflow: "hidden" },
  dispositivoRow: { flexDirection: "row", alignItems: "center", padding: 16, gap: 12 },
  dispositivoIconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#e6f4f4", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  dispositivoInfo: { flex: 1 },
  dispositivoTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2, flexWrap: "wrap" },
  dispositivoNome: { fontSize: 15, fontWeight: "600" },
  dispositivoTipo: { fontSize: 12, textTransform: "capitalize", marginBottom: 2 },
  dispositivoAcesso: { fontSize: 11 },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  statusOnline: { backgroundColor: "#dcfce7" },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: "600" },
  acoesCol: { alignItems: "flex-end", gap: 8 },
  btnVerificar: { borderWidth: 1, borderColor: TEAL, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, minWidth: 66, alignItems: "center" },
  btnVerificarText: { color: TEAL, fontSize: 11, fontWeight: "700" },
  btnRemover: { padding: 6 },
  divider: { height: 0.5, marginHorizontal: 16 },
  emptyCard: { borderRadius: 12, borderWidth: 0.5, alignItems: "center", padding: 48, gap: 8 },
  emptyTitulo: { fontSize: 15, fontWeight: "600" },
  emptyDesc: { fontSize: 13, textAlign: "center" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", padding: 24 },
  modalCard: { borderRadius: 16, padding: 22 },
  modalTitulo: { fontSize: 18, fontWeight: "700", marginBottom: 16 },
  modalLabel: { fontSize: 12, fontWeight: "500", marginBottom: 6, marginTop: 12 },
  modalInput: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, fontSize: 14 },
  tipoRow: { flexDirection: "row", gap: 8 },
  tipoBtn: { flex: 1, alignItems: "center", gap: 4, borderWidth: 1, borderRadius: 10, paddingVertical: 10 },
  tipoBtnText: { fontSize: 11, fontWeight: "600", textTransform: "capitalize" },
  modalErro: { color: "#ef4444", fontSize: 12, marginTop: 10 },
  modalBotoes: { flexDirection: "row", gap: 10, marginTop: 22 },
  modalBtnCancelar: { flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: 10 },
  modalBtnCancelarText: { fontWeight: "600", fontSize: 14 },
  modalBtnSalvar: { flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: 10, backgroundColor: TEAL },
  modalBtnSalvarText: { color: "white", fontWeight: "700", fontSize: 14 },
});