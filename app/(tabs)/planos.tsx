import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from "@/components/Header";
import { useI18n } from "@/contexts/i18n";

const TEAL = "#0b6b6b";

export default function Planos() {
  const { colors, t } = useI18n();

  const planos = [
    {
      id: "basico",
      nome: t("planBasico"),
      preco: t("free"),
      precoSub: "",
      desc: t("planBasicoDesc"),
      atual: true,
      popular: false,
      features: [
        { texto: `2 ${t("devices")}`, ativo: true },
        { texto: "Alertas de phishing", ativo: true },
        { texto: "Painel básico", ativo: true },
        { texto: "Relatórios mensais", ativo: false },
        { texto: t("biometric"), ativo: false },
        { texto: "API", ativo: false },
      ],
    },
    {
      id: "padrao",
      nome: t("planPadrao"),
      preco: "R$ 29",
      precoSub: "/mês",
      desc: t("planPadraoDesc"),
      atual: false,
      popular: true,
      features: [
        { texto: `10 ${t("devices")}`, ativo: true },
        { texto: "Proteção avançada", ativo: true },
        { texto: "Painel completo", ativo: true },
        { texto: "Relatórios mensais", ativo: true },
        { texto: "Suporte prioritário", ativo: true },
        { texto: "API", ativo: false },
      ],
    },
    {
      id: "premium",
      nome: t("planPremium"),
      preco: "R$ 79",
      precoSub: "/mês",
      desc: t("planPremiumDesc"),
      atual: false,
      popular: false,
      features: [
        { texto: `${t("devices")} ilimitados`, ativo: true },
        { texto: "Proteção avançada", ativo: true },
        { texto: "Painel completo", ativo: true },
        { texto: "Relatórios mensais", ativo: true },
        { texto: "Suporte prioritário", ativo: true },
        { texto: "API", ativo: true },
      ],
    },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bg }]}>
      <Header titulo={t("plans")} subtitulo={t("planosSubtitulo")} />

      <View style={[styles.bannerAtual, { backgroundColor: colors.card, borderColor: "#b2d8d8" }]}>
        <Ionicons name="information-circle-outline" size={16} color={TEAL} />
        <Text style={[styles.bannerText, { color: TEAL }]}>
          {t("voceEstaNoPlano")} <Text style={{ fontWeight: "700" }}>{t("planBasico")}</Text>
        </Text>
      </View>

      <View style={styles.planosWrap}>
        {planos.map((plano) => (
          <View
            key={plano.id}
            style={[
              styles.planoCard,
              { backgroundColor: colors.card, borderColor: colors.border },
              plano.atual && { borderColor: colors.textMuted, borderWidth: 1 },
              plano.popular && { borderColor: TEAL, borderWidth: 2 },
            ]}
          >
            {plano.atual && (
              <View style={[styles.badgeAtual, { backgroundColor: colors.inputBg }]}>
                <Text style={[styles.badgeAtualText, { color: colors.textSec }]}>{t("planAtual")}</Text>
              </View>
            )}
            {plano.popular && (
              <View style={styles.badgePopular}>
                <Text style={styles.badgePopularText}>{t("maisPopular")}</Text>
              </View>
            )}
            <Text style={[styles.planoNome, { color: colors.textMuted }]}>{plano.nome.toUpperCase()}</Text>
            <View style={styles.precoRow}>
              <Text style={[styles.preco, { color: colors.text }]}>{plano.preco}</Text>
              {!!plano.precoSub && (
                <Text style={[styles.precoSub, { color: colors.textMuted }]}>{plano.precoSub}</Text>
              )}
            </View>
            <Text style={[styles.planoDesc, { color: colors.textSec }]}>{plano.desc}</Text>
            <View style={styles.featuresList}>
              {plano.features.map((f) => (
                <View key={f.texto} style={styles.featureRow}>
                  <Ionicons
                    name={f.ativo ? "checkmark-circle" : "close-circle"}
                    size={16}
                    color={f.ativo ? TEAL : colors.textMuted}
                  />
                  <Text style={[styles.featureText, { color: f.ativo ? colors.text : colors.textMuted }]}>
                    {f.texto}
                  </Text>
                </View>
              ))}
            </View>
            <TouchableOpacity
              style={[
                styles.btnPlano,
                { borderColor: colors.border },
                plano.atual && { backgroundColor: colors.inputBg },
                plano.popular && { backgroundColor: TEAL, borderColor: TEAL },
              ]}
              disabled={plano.atual}
            >
              <Text
                style={[
                  styles.btnPlanoText,
                  { color: colors.textSec },
                  plano.atual && { color: colors.textMuted },
                  plano.popular && { color: "white" },
                ]}
              >
                {plano.atual ? t("planoAtual") : t("ativarAgora")}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bannerAtual: { flexDirection: "row", alignItems: "center", gap: 8, marginHorizontal: 16, marginTop: 16, padding: 12, borderRadius: 10, borderWidth: 0.5 },
  bannerText: { fontSize: 13 },
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
});