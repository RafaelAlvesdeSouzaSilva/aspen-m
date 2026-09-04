import { useCallback, useEffect, useState } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, RefreshControl, Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from "@/components/Header";
import { useI18n } from "@/contexts/i18n";
import api from "@/services/api";

const TEAL = "#0b6b6b";

type Categoria = "bug" | "sugestao" | "elogio" | "duvida";
type Status = "novo" | "em_analise" | "respondido" | "resolvido";

type Feedback = {
  id: string;
  category: Categoria;
  rating: number;
  message: string;
  status: Status;
  adminReply: string | null;
  createdAt: string | { _seconds: number } | null;
};

const CATEGORIAS: { id: Categoria; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: "bug", label: "Problema", icon: "bug-outline" },
  { id: "sugestao", label: "Sugestão", icon: "bulb-outline" },
  { id: "elogio", label: "Elogio", icon: "heart-outline" },
  { id: "duvida", label: "Dúvida", icon: "help-circle-outline" },
];

const STATUS_INFO: Record<Status, { label: string; cor: string; fundo: string }> = {
  novo: { label: "Recebido", cor: "#0284c7", fundo: "#e0f2fe" },
  em_analise: { label: "Em análise", cor: "#f59e0b", fundo: "#fef3c7" },
  respondido: { label: "Respondido", cor: "#0284c7", fundo: "#e0f2fe" },
  resolvido: { label: "Resolvido", cor: "#16a34a", fundo: "#dcfce7" },
};

// Mesmo cuidado das outras telas: essa API às vezes devolve o payload
// sem o aninhamento {data:{...}} esperado.
function extrairFeedbacks(res: any): Feedback[] {
  return res.data?.data?.feedback ?? res.data?.feedback ?? (Array.isArray(res.data) ? res.data : []);
}

function formatarData(createdAt: Feedback["createdAt"]) {
  if (!createdAt) return "";
  const ms = typeof createdAt === "string"
    ? new Date(createdAt).getTime()
    : (createdAt._seconds ?? 0) * 1000;
  if (!ms) return "";
  return new Date(ms).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function Estrelas({ valor, onChange, tamanho = 28 }: { valor: number; onChange?: (v: number) => void; tamanho?: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 4 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <TouchableOpacity key={n} disabled={!onChange} onPress={() => onChange?.(n)}>
          <Ionicons name={n <= valor ? "star" : "star-outline"} size={tamanho} color={n <= valor ? "#f59e0b" : "#cbd5e1"} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function Avaliacoes() {
  const { colors } = useI18n();

  const [lista, setLista] = useState<Feedback[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Formulário (criar / editar)
  const [modalForm, setModalForm] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [categoria, setCategoria] = useState<Categoria>("sugestao");
  const [nota, setNota] = useState(0);
  const [mensagem, setMensagem] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState<string | null>(null);

  const carregar = useCallback(async (comSpinner = true) => {
    if (comSpinner) setCarregando(true);
    setErro(null);
    try {
      const res = await api.get("/feedback/mine");
      setLista(extrairFeedbacks(res));
    } catch (err: any) {
      setErro(err?.response?.data?.message ?? "Não foi possível carregar suas avaliações.");
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function onRefresh() {
    setAtualizando(true);
    carregar(false);
  }

  function abrirNovo() {
    setEditandoId(null);
    setCategoria("sugestao");
    setNota(0);
    setMensagem("");
    setErroForm(null);
    setModalForm(true);
  }

  function abrirEdicao(f: Feedback) {
    setEditandoId(f.id);
    setCategoria(f.category);
    setNota(f.rating);
    setMensagem(f.message);
    setErroForm(null);
    setModalForm(true);
  }

  async function salvar() {
    if (nota < 1) {
      setErroForm("Selecione uma nota de 1 a 5 estrelas.");
      return;
    }
    if (!mensagem.trim()) {
      setErroForm("Escreva uma mensagem.");
      return;
    }
    setSalvando(true);
    setErroForm(null);
    try {
      if (editandoId) {
        await api.patch(`/feedback/${editandoId}`, { category: categoria, rating: nota, message: mensagem.trim() });
      } else {
        await api.post("/feedback", { category: categoria, rating: nota, message: mensagem.trim(), page: "mobile" });
      }
      // Recarrega da fonte real em vez de confiar no formato exato do
      // objeto devolvido — se salvou, aparece aqui de qualquer forma.
      await carregar(false);
      setModalForm(false);
    } catch (err: any) {
      setErroForm(err?.response?.data?.message ?? "Não foi possível salvar sua avaliação.");
    } finally {
      setSalvando(false);
    }
  }

  function confirmarExclusao(f: Feedback) {
    Alert.alert(
      "Excluir avaliação",
      "Isso remove seu envio permanentemente. Não é possível desfazer.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: () => excluir(f.id) },
      ],
    );
  }

  async function excluir(id: string) {
    const anterior = lista;
    setLista((prev) => prev.filter((f) => f.id !== id));
    try {
      await api.delete(`/feedback/${id}`);
    } catch (err: any) {
      setLista(anterior);
      Alert.alert("Erro", err?.response?.data?.message ?? "Não foi possível excluir a avaliação.");
    }
  }

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.bg }]}
        refreshControl={<RefreshControl refreshing={atualizando} onRefresh={onRefresh} tintColor={TEAL} />}
      >
        <Header
          titulo="Avaliações"
          subtitulo="Envie sugestões, dúvidas ou relate problemas"
          direita={
            <TouchableOpacity style={[styles.btnNovo, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={abrirNovo}>
              <Ionicons name="add" size={20} color={TEAL} />
            </TouchableOpacity>
          }
        />

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
          ) : lista.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="chatbubble-ellipses-outline" size={40} color={colors.textMuted} />
              <Text style={[styles.emptyTitulo, { color: colors.textSec }]}>Nenhuma avaliação ainda</Text>
              <Text style={[styles.emptyDesc, { color: colors.textMuted }]}>Toque no + para enviar sua primeira avaliação.</Text>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {lista.map((f) => {
                const cat = CATEGORIAS.find((c) => c.id === f.category);
                const st = STATUS_INFO[f.status] ?? STATUS_INFO.novo;
                const podeEditar = f.status === "novo";
                return (
                  <View key={f.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.cardTopo}>
                      <View style={styles.categoriaWrap}>
                        <Ionicons name={cat?.icon ?? "chatbubble-outline"} size={16} color={TEAL} />
                        <Text style={[styles.categoriaText, { color: colors.text }]}>{cat?.label ?? f.category}</Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: st.fundo }]}>
                        <Text style={[styles.statusBadgeText, { color: st.cor }]}>{st.label}</Text>
                      </View>
                    </View>

                    <Estrelas valor={f.rating} tamanho={16} />

                    <Text style={[styles.mensagem, { color: colors.textSec }]}>{f.message}</Text>

                    {f.adminReply && (
                      <View style={[styles.respostaBox, { backgroundColor: colors.inputBg }]}>
                        <Text style={[styles.respostaLabel, { color: TEAL }]}>Resposta da equipe</Text>
                        <Text style={[styles.respostaTexto, { color: colors.textSec }]}>{f.adminReply}</Text>
                      </View>
                    )}

                    <View style={styles.cardRodape}>
                      <Text style={[styles.dataText, { color: colors.textMuted }]}>{formatarData(f.createdAt)}</Text>
                      {podeEditar && (
                        <View style={{ flexDirection: "row", gap: 16 }}>
                          <TouchableOpacity onPress={() => abrirEdicao(f)}>
                            <Text style={styles.acaoText}>Editar</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => confirmarExclusao(f)}>
                            <Text style={[styles.acaoText, { color: "#ef4444" }]}>Excluir</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Modal criar/editar */}
      <Modal visible={modalForm} transparent animationType="fade" onRequestClose={() => setModalForm(false)}>
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}>
            <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.modalTitulo, { color: colors.text }]}>
                {editandoId ? "Editar avaliação" : "Nova avaliação"}
              </Text>

              <Text style={[styles.modalLabel, { color: colors.textSec }]}>Categoria</Text>
              <View style={styles.categoriasRow}>
                {CATEGORIAS.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={[
                      styles.categoriaBtn,
                      { borderColor: colors.border },
                      categoria === c.id && { borderColor: TEAL, backgroundColor: "#e6f4f4" },
                    ]}
                    onPress={() => setCategoria(c.id)}
                  >
                    <Ionicons name={c.icon} size={18} color={categoria === c.id ? TEAL : colors.textMuted} />
                    <Text style={[styles.categoriaBtnText, { color: categoria === c.id ? TEAL : colors.textMuted }]}>{c.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.modalLabel, { color: colors.textSec }]}>Nota</Text>
              <Estrelas valor={nota} onChange={setNota} />

              <Text style={[styles.modalLabel, { color: colors.textSec }]}>Mensagem</Text>
              <TextInput
                style={[styles.modalTextarea, { borderColor: colors.border, color: colors.text }]}
                placeholder="Conte com detalhes..."
                placeholderTextColor={colors.textMuted}
                value={mensagem}
                onChangeText={setMensagem}
                multiline
                numberOfLines={5}
                maxLength={2000}
              />

              {erroForm && <Text style={styles.modalErro}>{erroForm}</Text>}

              <View style={styles.modalBotoes}>
                <TouchableOpacity style={styles.modalBtnCancelar} onPress={() => setModalForm(false)}>
                  <Text style={[styles.modalBtnCancelarText, { color: colors.textSec }]}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtnSalvar, salvando && { opacity: 0.6 }]} onPress={salvar} disabled={salvando}>
                  {salvando
                    ? <ActivityIndicator size="small" color="white" />
                    : <Text style={styles.modalBtnSalvarText}>{editandoId ? "Salvar" : "Enviar"}</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  btnNovo: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", borderWidth: 0.5 },
  erroBanner: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#fee2e2", marginHorizontal: 16, marginTop: 14, padding: 12, borderRadius: 10 },
  erroBannerText: { color: "#ef4444", fontSize: 12, flex: 1 },
  section: { padding: 16 },
  emptyCard: { borderRadius: 12, borderWidth: 0.5, alignItems: "center", padding: 48, gap: 8 },
  emptyTitulo: { fontSize: 15, fontWeight: "600" },
  emptyDesc: { fontSize: 13, textAlign: "center" },
  card: { borderRadius: 12, borderWidth: 0.5, padding: 16, gap: 8 },
  cardTopo: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  categoriaWrap: { flexDirection: "row", alignItems: "center", gap: 6 },
  categoriaText: { fontSize: 13, fontWeight: "700" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  statusBadgeText: { fontSize: 11, fontWeight: "700" },
  mensagem: { fontSize: 13, lineHeight: 19 },
  respostaBox: { borderRadius: 8, padding: 10, gap: 2 },
  respostaLabel: { fontSize: 11, fontWeight: "700" },
  respostaTexto: { fontSize: 12, lineHeight: 17 },
  cardRodape: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  dataText: { fontSize: 11 },
  acaoText: { fontSize: 12, color: TEAL, fontWeight: "700" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  modalCard: { borderRadius: 16, padding: 22 },
  modalTitulo: { fontSize: 18, fontWeight: "700", marginBottom: 14 },
  modalLabel: { fontSize: 12, fontWeight: "600", marginBottom: 8, marginTop: 14 },
  categoriasRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  categoriaBtn: { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9 },
  categoriaBtnText: { fontSize: 12, fontWeight: "600" },
  modalTextarea: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 14, minHeight: 100, textAlignVertical: "top" },
  modalErro: { color: "#ef4444", fontSize: 12, marginTop: 10 },
  modalBotoes: { flexDirection: "row", gap: 10, marginTop: 22 },
  modalBtnCancelar: { flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: 10 },
  modalBtnCancelarText: { fontWeight: "600", fontSize: 14 },
  modalBtnSalvar: { flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: 10, backgroundColor: TEAL },
  modalBtnSalvarText: { color: "white", fontWeight: "700", fontSize: 14 },
});