import { useCallback, useEffect, useState } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Modal, ActivityIndicator, Alert, Image, Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import Header from "@/components/Header";
import { useI18n } from "@/contexts/i18n";
import api from "@/services/api";

const TEAL = "#0b6b6b";

type PlanoId = "basico" | "padrao" | "premium";

type Usuario = {
  plan: PlanoId;
  plan_expires_at: string | null;
  plan_cancel_scheduled: boolean;
};

const ORDEM_PLANO: Record<PlanoId, number> = { basico: 0, padrao: 1, premium: 2 };

const PLANOS_INFO: Record<PlanoId, {
  nome: string; preco: string; precoSub: string; desc: string; badge: string | null;
  features: { texto: string; ativo: boolean }[];
}> = {
  basico: {
    nome: "Básico", preco: "Grátis", precoSub: "", badge: null,
    desc: "Para uso pessoal com até 2 dispositivos.",
    features: [
      { texto: "2 dispositivos", ativo: true },
      { texto: "Alertas de phishing", ativo: true },
      { texto: "Painel básico", ativo: true },
      { texto: "Relatórios mensais", ativo: false },
      { texto: "Suporte prioritário", ativo: false },
      { texto: "API de integração", ativo: false },
    ],
  },
  padrao: {
    nome: "Padrão", preco: "R$ 29", precoSub: "/mês", badge: "Mais popular",
    desc: "Para famílias e profissionais com até 10 dispositivos.",
    features: [
      { texto: "10 dispositivos", ativo: true },
      { texto: "Proteção avançada", ativo: true },
      { texto: "Painel completo", ativo: true },
      { texto: "Relatórios mensais", ativo: true },
      { texto: "Suporte prioritário", ativo: true },
      { texto: "API de integração", ativo: false },
    ],
  },
  premium: {
    nome: "Premium", preco: "R$ 79", precoSub: "/mês", badge: null,
    desc: "Para equipes e empresas com dispositivos ilimitados.",
    features: [
      { texto: "Dispositivos ilimitados", ativo: true },
      { texto: "Proteção avançada", ativo: true },
      { texto: "Painel completo", ativo: true },
      { texto: "Relatórios mensais", ativo: true },
      { texto: "Suporte prioritário", ativo: true },
      { texto: "API de integração", ativo: true },
    ],
  },
};

function formatarData(dataStr: string | null) {
  if (!dataStr) return "";
  const d = new Date(dataStr.replace(" ", "T"));
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function Planos() {
  const { colors, t } = useI18n();

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // Modal de confirmação (upgrade/downgrade)
  const [modalConfirmar, setModalConfirmar] = useState(false);
  const [planoAlvo, setPlanoAlvo] = useState<PlanoId | null>(null);
  const [acaoAlvo, setAcaoAlvo] = useState<"upgrade" | "downgrade" | null>(null);
  const [processando, setProcessando] = useState(false);

  // Modal Pix
  const [modalPix, setModalPix] = useState(false);
  const [pixCarregando, setPixCarregando] = useState(false);
  const [pixErro, setPixErro] = useState<string | null>(null);
  const [pixDados, setPixDados] = useState<{ id: string; qrCodeBase64: string | null; qrCode: string | null } | null>(null);
  const [pixStatus, setPixStatus] = useState<"pending" | "success" | "error">("pending");
  const [pixStatusMsg, setPixStatusMsg] = useState("Aguardando pagamento...");

  // Cartão: preapproval pendente aguardando confirmação manual
  const [cartaoPendente, setCartaoPendente] = useState<{ id: string; plano: PlanoId } | null>(null);
  const [confirmandoCartao, setConfirmandoCartao] = useState(false);

  // Cancelar assinatura
  const [modalCancelar, setModalCancelar] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [reativando, setReativando] = useState(false);

  const carregarUsuario = useCallback(async () => {
    setErro(null);
    try {
      const res = await api.get("/auth/me");
      setUsuario(res.data?.data?.user);
    } catch (err: any) {
      setErro(err?.response?.data?.message ?? "Não foi possível carregar seus planos.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarUsuario();
  }, [carregarUsuario]);

  // Polling do Pix — mesma lógica do web (a cada 5s, até 60 tentativas / ~5min)
  useEffect(() => {
    if (!modalPix || !pixDados || pixStatus !== "pending") return;
    let tentativas = 0;
    const intervalo = setInterval(async () => {
      tentativas++;
      try {
        const res = await api.get(`/payment/plan/pix/${pixDados.id}/status`);
        const data = res.data?.data;
        if (data?.status === "approved") {
          clearInterval(intervalo);
          setPixStatus("success");
          setPixStatusMsg("Pagamento confirmado! Fechando...");
          if (data.user) setUsuario(data.user);
          setTimeout(() => setModalPix(false), 2000);
        } else if (tentativas >= 60) {
          clearInterval(intervalo);
          setPixStatus("error");
          setPixStatusMsg("Não conseguimos confirmar o Pix. Se você já pagou, aguarde alguns minutos.");
        }
      } catch {
        // erro pontual de rede — tenta de novo no próximo ciclo
      }
    }, 5000);
    return () => clearInterval(intervalo);
  }, [modalPix, pixDados, pixStatus]);

  function abrirConfirmacao(plano: PlanoId, acao: "upgrade" | "downgrade") {
    setPlanoAlvo(plano);
    setAcaoAlvo(acao);
    setModalConfirmar(true);
  }

  async function confirmarDowngrade() {
    if (!planoAlvo) return;
    setProcessando(true);
    try {
      const res = await api.put("/auth/plan", { plan: planoAlvo });
      setUsuario(res.data?.data?.user);
      setModalConfirmar(false);
      Alert.alert("Pronto", "Seu plano foi atualizado com sucesso.");
    } catch (err: any) {
      Alert.alert("Erro", err?.response?.data?.message ?? "Não foi possível processar a troca de plano.");
    } finally {
      setProcessando(false);
    }
  }

  async function iniciarUpgradeCartao() {
    if (!planoAlvo) return;
    setProcessando(true);
    try {
      const res = await api.post("/payment/plan/card", { plan: planoAlvo });
      const { id, initPoint } = res.data?.data ?? {};
      if (!id || !initPoint) throw new Error("Resposta inválida do Mercado Pago.");
      setModalConfirmar(false);
      setCartaoPendente({ id, plano: planoAlvo });
      const podeAbrir = await Linking.canOpenURL(initPoint);
      if (podeAbrir) await Linking.openURL(initPoint);
    } catch (err: any) {
      Alert.alert("Erro", err?.response?.data?.message ?? err.message ?? "Não foi possível iniciar o pagamento por cartão.");
    } finally {
      setProcessando(false);
    }
  }

  async function confirmarPagamentoCartao() {
    if (!cartaoPendente) return;
    setConfirmandoCartao(true);
    try {
      const res = await api.post("/payment/plan/card/confirm", { preapprovalId: cartaoPendente.id });
      setUsuario(res.data?.data?.user);
      setCartaoPendente(null);
      Alert.alert("Pronto", "Pagamento confirmado! Seu plano foi atualizado.");
    } catch (err: any) {
      Alert.alert(
        "Ainda não confirmado",
        err?.response?.data?.message ?? "O Mercado Pago ainda não confirmou a autorização. Se você já concluiu no navegador, aguarde um instante e tente de novo.",
      );
    } finally {
      setConfirmandoCartao(false);
    }
  }

  async function iniciarUpgradePix() {
    if (!planoAlvo) return;
    const plano = planoAlvo;
    setModalConfirmar(false);
    setPixDados(null);
    setPixErro(null);
    setPixStatus("pending");
    setPixStatusMsg("Aguardando pagamento...");
    setPixCarregando(true);
    setModalPix(true);
    try {
      const res = await api.post("/payment/plan/pix", { plan: plano });
      const payment = res.data?.data;
      setPixDados({ id: payment.id, qrCodeBase64: payment.qrCodeBase64, qrCode: payment.qrCode });
    } catch (err: any) {
      setPixErro(err?.response?.data?.message ?? "Não foi possível gerar o Pix.");
    } finally {
      setPixCarregando(false);
    }
  }

  async function copiarCodigoPix() {
    if (!pixDados?.qrCode) return;
    await Clipboard.setStringAsync(pixDados.qrCode);
    Alert.alert("Copiado", "Código Pix copiado para a área de transferência.");
  }

  async function executarCancelamento() {
    setCancelando(true);
    try {
      const res = await api.post("/auth/cancel-subscription");
      setUsuario(res.data?.data?.user);
      setModalCancelar(false);
      Alert.alert("Assinatura cancelada", "Você mantém acesso até o fim do período já pago.");
    } catch (err: any) {
      Alert.alert("Erro", err?.response?.data?.message ?? "Não foi possível cancelar a assinatura.");
    } finally {
      setCancelando(false);
    }
  }

  async function executarReativacao() {
    setReativando(true);
    try {
      const res = await api.post("/auth/reactivate-subscription");
      setUsuario(res.data?.data?.user);
      Alert.alert("Pronto", "Sua assinatura foi mantida.");
    } catch (err: any) {
      Alert.alert("Erro", err?.response?.data?.message ?? "Não foi possível reativar a assinatura.");
    } finally {
      setReativando(false);
    }
  }

  if (carregando) {
    return (
      <View style={[styles.loadingWrap, { backgroundColor: colors.bg }]}>
        <ActivityIndicator color={TEAL} size="large" />
      </View>
    );
  }

  if (erro || !usuario) {
    return (
      <ScrollView style={[styles.container, { backgroundColor: colors.bg }]}>
        <Header titulo={t("plans")} subtitulo={t("planosSubtitulo")} />
        <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.emptyTitulo, { color: colors.textSec }]}>Não foi possível carregar seus planos.</Text>
          <Text style={[styles.emptyDesc, { color: colors.textMuted }]}>{erro}</Text>
          <TouchableOpacity onPress={carregarUsuario} style={styles.btnTentarNovamente}>
            <Text style={styles.btnTentarNovamenteText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  const ordemAtual = ORDEM_PLANO[usuario.plan] ?? 0;
  const temPlanoPago = usuario.plan !== "basico";
  const agendado = !!usuario.plan_cancel_scheduled;

  return (
    <>
      <ScrollView style={[styles.container, { backgroundColor: colors.bg }]}>
        <Header titulo={t("plans")} subtitulo={temPlanoPago ? "Gerencie sua assinatura" : t("planosSubtitulo")} />

        <View style={[styles.bannerAtual, { backgroundColor: colors.card, borderColor: "#b2d8d8" }]}>
          <Ionicons name="information-circle-outline" size={16} color={TEAL} />
          <Text style={[styles.bannerText, { color: TEAL }]}>
            Você está no plano <Text style={{ fontWeight: "700" }}>{PLANOS_INFO[usuario.plan].nome}</Text>
            {usuario.plan_expires_at && (
              agendado
                ? <>. Acesso até <Text style={{ fontWeight: "700" }}>{formatarData(usuario.plan_expires_at)}</Text> (cancelamento agendado)</>
                : <>. Renova automaticamente em <Text style={{ fontWeight: "700" }}>{formatarData(usuario.plan_expires_at)}</Text></>
            )}.
          </Text>
        </View>

        {cartaoPendente && (
          <View style={styles.cartaoPendenteBanner}>
            <Ionicons name="card-outline" size={18} color="#f59e0b" />
            <View style={{ flex: 1 }}>
              <Text style={styles.cartaoPendenteTitulo}>Autorização de cartão em andamento</Text>
              <Text style={styles.cartaoPendenteDesc}>Concluiu no navegador? Confirme abaixo.</Text>
            </View>
            <TouchableOpacity
              style={styles.btnConfirmarCartao}
              onPress={confirmarPagamentoCartao}
              disabled={confirmandoCartao}
            >
              {confirmandoCartao
                ? <ActivityIndicator size="small" color="white" />
                : <Text style={styles.btnConfirmarCartaoText}>Confirmar</Text>}
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.planosWrap}>
          {(Object.keys(PLANOS_INFO) as PlanoId[]).map((planoId) => {
            const info = PLANOS_INFO[planoId];
            const ordem = ORDEM_PLANO[planoId];
            const isAtual = planoId === usuario.plan;
            const isUpgrade = ordem > ordemAtual;
            const isDowngrade = ordem < ordemAtual;

            let btnTexto = "";
            let btnDisabled = true;
            let onPress = () => {};

            if (isAtual) {
              btnTexto = "Plano atual";
            } else if (agendado) {
              btnTexto = "Reative para trocar de plano";
            } else if (isUpgrade) {
              btnTexto = usuario.plan === "basico" ? "Assinar agora" : "Fazer upgrade";
              btnDisabled = false;
              onPress = () => abrirConfirmacao(planoId, "upgrade");
            } else if (isDowngrade) {
              btnTexto = "Fazer downgrade";
              btnDisabled = false;
              onPress = () => abrirConfirmacao(planoId, "downgrade");
            }

            return (
              <View
                key={planoId}
                style={[
                  styles.planoCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  isAtual && { borderColor: colors.textMuted, borderWidth: 1 },
                  info.badge && !isAtual && { borderColor: TEAL, borderWidth: 2 },
                ]}
              >
                {isAtual && (
                  <View style={[styles.badgeAtual, { backgroundColor: colors.inputBg }]}>
                    <Text style={[styles.badgeAtualText, { color: colors.textSec }]}>Seu plano atual</Text>
                  </View>
                )}
                {info.badge && !isAtual && (
                  <View style={styles.badgePopular}>
                    <Text style={styles.badgePopularText}>{info.badge}</Text>
                  </View>
                )}
                <Text style={[styles.planoNome, { color: colors.textMuted }]}>{info.nome.toUpperCase()}</Text>
                <View style={styles.precoRow}>
                  <Text style={[styles.preco, { color: colors.text }]}>{info.preco}</Text>
                  {!!info.precoSub && <Text style={[styles.precoSub, { color: colors.textMuted }]}>{info.precoSub}</Text>}
                </View>
                <Text style={[styles.planoDesc, { color: colors.textSec }]}>{info.desc}</Text>
                <View style={styles.featuresList}>
                  {info.features.map((f) => (
                    <View key={f.texto} style={styles.featureRow}>
                      <Ionicons name={f.ativo ? "checkmark-circle" : "close-circle"} size={16} color={f.ativo ? TEAL : colors.textMuted} />
                      <Text style={[styles.featureText, { color: f.ativo ? colors.text : colors.textMuted }]}>{f.texto}</Text>
                    </View>
                  ))}
                </View>
                <TouchableOpacity
                  style={[
                    styles.btnPlano,
                    { borderColor: colors.border },
                    isAtual && { backgroundColor: colors.inputBg },
                    isUpgrade && !agendado && { backgroundColor: TEAL, borderColor: TEAL },
                  ]}
                  disabled={btnDisabled}
                  onPress={onPress}
                >
                  <Text
                    style={[
                      styles.btnPlanoText,
                      { color: colors.textSec },
                      isAtual && { color: colors.textMuted },
                      isUpgrade && !agendado && { color: "white" },
                    ]}
                  >
                    {btnTexto}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {temPlanoPago && !agendado && (
          <TouchableOpacity style={styles.linkCancelar} onPress={() => setModalCancelar(true)}>
            <Text style={styles.linkCancelarText}>Cancelar assinatura</Text>
          </TouchableOpacity>
        )}
        {temPlanoPago && agendado && (
          <TouchableOpacity style={styles.btnReativar} onPress={executarReativacao} disabled={reativando}>
            {reativando
              ? <ActivityIndicator size="small" color={TEAL} />
              : <Text style={styles.btnReativarText}>Manter assinatura</Text>}
          </TouchableOpacity>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Modal confirmar upgrade/downgrade */}
      <Modal visible={modalConfirmar} transparent animationType="fade" onRequestClose={() => setModalConfirmar(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            {planoAlvo && acaoAlvo === "upgrade" ? (
              <>
                <Text style={[styles.modalTitulo, { color: colors.text }]}>
                  Assinar {PLANOS_INFO[planoAlvo].nome}
                </Text>
                <Text style={[styles.modalTexto, { color: colors.textSec }]}>
                  Escolha a forma de pagamento para {PLANOS_INFO[planoAlvo].preco}{PLANOS_INFO[planoAlvo].precoSub}.
                </Text>
                <TouchableOpacity style={styles.btnPagamento} onPress={iniciarUpgradeCartao} disabled={processando}>
                  <Ionicons name="card-outline" size={20} color={TEAL} />
                  <Text style={styles.btnPagamentoText}>Cartão de crédito</Text>
                  {processando && <ActivityIndicator size="small" color={TEAL} />}
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnPagamento} onPress={iniciarUpgradePix} disabled={processando}>
                  <Ionicons name="qr-code-outline" size={20} color={TEAL} />
                  <Text style={styles.btnPagamentoText}>Pix</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalBtnCancelar} onPress={() => setModalConfirmar(false)}>
                  <Text style={[styles.modalBtnCancelarText, { color: colors.textSec }]}>Cancelar</Text>
                </TouchableOpacity>
              </>
            ) : planoAlvo && acaoAlvo === "downgrade" ? (
              <>
                <Text style={[styles.modalTitulo, { color: colors.text }]}>
                  Trocar para {PLANOS_INFO[planoAlvo].nome}
                </Text>
                <Text style={[styles.modalTexto, { color: colors.textSec }]}>
                  Você perderá acesso aos recursos exclusivos do plano atual imediatamente.
                </Text>
                <View style={styles.modalBotoes}>
                  <TouchableOpacity style={styles.modalBtnCancelarFlex} onPress={() => setModalConfirmar(false)}>
                    <Text style={[styles.modalBtnCancelarText, { color: colors.textSec }]}>Voltar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalBtnConfirmarDowngrade, processando && { opacity: 0.6 }]}
                    onPress={confirmarDowngrade}
                    disabled={processando}
                  >
                    {processando
                      ? <ActivityIndicator size="small" color="white" />
                      : <Text style={styles.modalBtnSalvarText}>Confirmar</Text>}
                  </TouchableOpacity>
                </View>
              </>
            ) : null}
          </View>
        </View>
      </Modal>

      {/* Modal Pix */}
      <Modal visible={modalPix} transparent animationType="fade" onRequestClose={() => setModalPix(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card, alignItems: "center" }]}>
            <Text style={[styles.modalTitulo, { color: colors.text }]}>Pagar com Pix</Text>

            {pixCarregando ? (
              <ActivityIndicator color={TEAL} style={{ marginVertical: 24 }} />
            ) : pixErro ? (
              <Text style={styles.modalErro}>{pixErro}</Text>
            ) : pixDados ? (
              <>
                {pixDados.qrCodeBase64 && (
                  <Image
                    source={{ uri: `data:image/png;base64,${pixDados.qrCodeBase64}` }}
                    style={styles.qrImage}
                  />
                )}
                <TouchableOpacity style={styles.btnCopiarPix} onPress={copiarCodigoPix}>
                  <Ionicons name="copy-outline" size={16} color={TEAL} />
                  <Text style={styles.btnCopiarPixText}>Copiar código Pix</Text>
                </TouchableOpacity>
                <View style={styles.pixStatusRow}>
                  {pixStatus === "pending" && <ActivityIndicator size="small" color={TEAL} />}
                  {pixStatus === "success" && <Ionicons name="checkmark-circle" size={16} color="#16a34a" />}
                  {pixStatus === "error" && <Ionicons name="alert-circle" size={16} color="#ef4444" />}
                  <Text
                    style={[
                      styles.pixStatusText,
                      pixStatus === "success" && { color: "#16a34a" },
                      pixStatus === "error" && { color: "#ef4444" },
                    ]}
                  >
                    {pixStatusMsg}
                  </Text>
                </View>
              </>
            ) : null}

            <TouchableOpacity style={styles.modalBtnCancelar} onPress={() => setModalPix(false)}>
              <Text style={[styles.modalBtnCancelarText, { color: colors.textSec }]}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal cancelar assinatura */}
      <Modal visible={modalCancelar} transparent animationType="fade" onRequestClose={() => setModalCancelar(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitulo, { color: colors.text }]}>Cancelar assinatura</Text>
            <Text style={[styles.modalTexto, { color: colors.textSec }]}>
              Você mantém acesso ao plano atual até o fim do período já pago. Depois disso, sua conta volta para o plano Básico.
            </Text>
            <View style={styles.modalBotoes}>
              <TouchableOpacity style={styles.modalBtnCancelarFlex} onPress={() => setModalCancelar(false)}>
                <Text style={[styles.modalBtnCancelarText, { color: colors.textSec }]}>Voltar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtnConfirmarCancelar, cancelando && { opacity: 0.6 }]}
                onPress={executarCancelamento}
                disabled={cancelando}
              >
                {cancelando
                  ? <ActivityIndicator size="small" color="white" />
                  : <Text style={styles.modalBtnSalvarText}>Cancelar assinatura</Text>}
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
  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  bannerAtual: { flexDirection: "row", alignItems: "center", gap: 8, marginHorizontal: 16, marginTop: 16, padding: 12, borderRadius: 10, borderWidth: 0.5 },
  bannerText: { fontSize: 13, flex: 1 },
  cartaoPendenteBanner: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#fef3c7", marginHorizontal: 16, marginTop: 12, padding: 12, borderRadius: 10 },
  cartaoPendenteTitulo: { fontSize: 13, fontWeight: "700", color: "#92400e" },
  cartaoPendenteDesc: { fontSize: 11, color: "#92400e" },
  btnConfirmarCartao: { backgroundColor: "#f59e0b", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, minWidth: 84, alignItems: "center" },
  btnConfirmarCartaoText: { color: "white", fontSize: 12, fontWeight: "700" },
  planosWrap: { padding: 16, gap: 14 },
  planoCard: { borderRadius: 14, padding: 20, borderWidth: 0.5 },
  badgeAtual: { alignSelf: "flex-start", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 12 },
  badgeAtualText: { fontSize: 11, fontWeight: "600" },
  badgePopular: { alignSelf: "flex-start", backgroundColor: TEAL, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 12 },
  badgePopularText: { fontSize: 11, fontWeight: "600", color: "white" },
  planoNome: { fontSize: 11, fontWeight: "700", letterSpacing: 1, marginBottom: 6 },
  precoRow: { flexDirection: "row", alignItems: "baseline", gap: 2, marginBottom: 6 },
  preco: { fontSize: 32, fontWeight: "700" },
  precoSub: { fontSize: 14 },
  planoDesc: { fontSize: 13, marginBottom: 16, lineHeight: 18 },
  featuresList: { gap: 8, marginBottom: 20 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  featureText: { fontSize: 13 },
  btnPlano: { borderRadius: 10, paddingVertical: 13, alignItems: "center", borderWidth: 1 },
  btnPlanoText: { fontSize: 14, fontWeight: "700" },
  linkCancelar: { alignItems: "center", paddingVertical: 8 },
  linkCancelarText: { color: "#ef4444", fontSize: 13, fontWeight: "600" },
  btnReativar: { marginHorizontal: 16, borderWidth: 1.5, borderColor: TEAL, borderRadius: 10, paddingVertical: 13, alignItems: "center" },
  btnReativarText: { color: TEAL, fontWeight: "700", fontSize: 14 },
  emptyCard: { margin: 16, borderRadius: 12, borderWidth: 0.5, alignItems: "center", padding: 32, gap: 8 },
  emptyTitulo: { fontSize: 15, fontWeight: "600" },
  emptyDesc: { fontSize: 13, textAlign: "center" },
  btnTentarNovamente: { marginTop: 8, backgroundColor: TEAL, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
  btnTentarNovamenteText: { color: "white", fontWeight: "700", fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", padding: 24 },
  modalCard: { borderRadius: 16, padding: 22 },
  modalTitulo: { fontSize: 18, fontWeight: "700", marginBottom: 8, textAlign: "center" },
  modalTexto: { fontSize: 13, lineHeight: 19, marginBottom: 18, textAlign: "center" },
  modalErro: { color: "#ef4444", fontSize: 13, textAlign: "center", marginVertical: 20 },
  btnPagamento: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1.5, borderColor: TEAL, borderRadius: 10, padding: 14, marginBottom: 10 },
  btnPagamentoText: { flex: 1, fontSize: 14, fontWeight: "600", color: TEAL },
  modalBotoes: { flexDirection: "row", gap: 10, marginTop: 4 },
  modalBtnCancelar: { alignItems: "center", paddingVertical: 12, marginTop: 4 },
  modalBtnCancelarFlex: { flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: 10 },
  modalBtnCancelarText: { fontWeight: "600", fontSize: 14 },
  modalBtnConfirmarDowngrade: { flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: 10, backgroundColor: "#0f172a" },
  modalBtnConfirmarCancelar: { flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: 10, backgroundColor: "#ef4444" },
  modalBtnSalvarText: { color: "white", fontWeight: "700", fontSize: 14 },
  qrImage: { width: 200, height: 200, marginBottom: 16, borderRadius: 8 },
  btnCopiarPix: { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderColor: TEAL, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 9, marginBottom: 16 },
  btnCopiarPixText: { color: TEAL, fontSize: 13, fontWeight: "600" },
  pixStatusRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  pixStatusText: { fontSize: 12, color: "#64748b" },
});