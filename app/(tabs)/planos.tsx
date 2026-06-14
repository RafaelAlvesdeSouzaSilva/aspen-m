import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from "@/components/Header";

const TEAL = "#0b6b6b";

const planos = [
  {
    id: "basico",
    nome: "BÁSICO",
    preco: "Grátis",
    precoSub: "",
    desc: "Para uso pessoal com até 2 dispositivos.",
    atual: true,
    popular: false,
    features: [
      { texto: "2 dispositivos", ativo: true },
      { texto: "Alertas de phishing", ativo: true },
      { texto: "Painel básico", ativo: true },
      { texto: "Relatórios mensais", ativo: false },
      { texto: "Suporte prioritário", ativo: false },
      { texto: "API de integração", ativo: false },
    ],
  },
  {
    id: "padrao",
    nome: "PADRÃO",
    preco: "R$ 29",
    precoSub: "/mês",
    desc: "Para famílias e profissionais com até 10 dispositivos.",
    atual: false,
    popular: true,
    features: [
      { texto: "10 dispositivos", ativo: true },
      { texto: "Proteção avançada", ativo: true },
      { texto: "Painel completo", ativo: true },
      { texto: "Relatórios mensais", ativo: true },
      { texto: "Suporte prioritário", ativo: true },
      { texto: "API de integração", ativo: false },
    ],
  },
  {
    id: "premium",
    nome: "PREMIUM",
    preco: "R$ 79",
    precoSub: "/mês",
    desc: "Para equipes e empresas com dispositivos ilimitados.",
    atual: false,
    popular: false,
    features: [
      { texto: "Dispositivos ilimitados", ativo: true },
      { texto: "Proteção avançada", ativo: true },
      { texto: "Painel completo", ativo: true },
      { texto: "Relatórios mensais", ativo: true },
      { texto: "Suporte prioritário", ativo: true },
      { texto: "API de integração", ativo: true },
    ],
  },
];

export default function Planos() {
  return (
    <ScrollView style={styles.container}>

      {/* ✅ Substitui o header antigo por esse componente */}
      <Header
        titulo="Planos"
        subtitulo="Você está no plano gratuito. Faça upgrade para desbloquear mais recursos."
      />

      {/* Banner plano atual */}
      <View style={styles.bannerAtual}>
        <Ionicons name="information-circle-outline" size={16} color={TEAL} />
        <Text style={styles.bannerText}>
          Você está no plano <Text style={{ fontWeight: "700" }}>Básico</Text>
        </Text>
      </View>

      {/* Cards de planos */}
      <View style={styles.planosWrap}>
        {planos.map((plano) => (
          <View
            key={plano.id}
            style={[
              styles.planoCard,
              plano.atual && styles.planoCardAtual,
              plano.popular && styles.planoCardPopular,
            ]}
          >
            {plano.atual && (
              <View style={styles.badgeAtual}>
                <Text style={styles.badgeAtualText}>Seu plano atual</Text>
              </View>
            )}
            {plano.popular && (
              <View style={styles.badgePopular}>
                <Text style={styles.badgePopularText}>Mais popular</Text>
              </View>
            )}

            <Text style={styles.planoNome}>{plano.nome}</Text>
            <View style={styles.precoRow}>
              <Text style={styles.preco}>{plano.preco}</Text>
              {plano.precoSub ? (
                <Text style={styles.precoSub}>{plano.precoSub}</Text>
              ) : null}
            </View>
            <Text style={styles.planoDesc}>{plano.desc}</Text>

            <View style={styles.featuresList}>
              {plano.features.map((f) => (
                <View key={f.texto} style={styles.featureRow}>
                  <Ionicons
                    name={f.ativo ? "checkmark-circle" : "close-circle"}
                    size={16}
                    color={f.ativo ? TEAL : "#cbd5e1"}
                  />
                  <Text style={[styles.featureText, !f.ativo && styles.featureInativo]}>
                    {f.texto}
                  </Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.btnPlano,
                plano.atual && styles.btnAtual,
                plano.popular && styles.btnPopular,
              ]}
              disabled={plano.atual}
            >
              <Text
                style={[
                  styles.btnPlanoText,
                  plano.atual && styles.btnAtualText,
                  plano.popular && styles.btnPopularText,
                ]}
              >
                {plano.atual ? "Plano atual" : "Ativar agora"}
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
  container: { flex: 1, backgroundColor: "#f5f7f8" },

  bannerAtual: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#e6f4f4",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: "#b2d8d8",
  },
  bannerText: { fontSize: 13, color: TEAL },

  planosWrap: { padding: 16, gap: 14 },

  planoCard: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: 20,
    borderWidth: 0.5,
    borderColor: "#e2e8f0",
  },
  planoCardAtual: { borderColor: "#94a3b8", borderWidth: 1 },
  planoCardPopular: { borderColor: TEAL, borderWidth: 2 },

  badgeAtual: {
    alignSelf: "flex-start",
    backgroundColor: "#f1f5f9",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 12,
  },
  badgeAtualText: { fontSize: 11, fontWeight: "600", color: "#475569" },

  badgePopular: {
    alignSelf: "flex-start",
    backgroundColor: TEAL,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 12,
  },
  badgePopularText: { fontSize: 11, fontWeight: "600", color: "white" },

  planoNome: { fontSize: 11, fontWeight: "700", color: "#94a3b8", letterSpacing: 1, marginBottom: 6 },
  precoRow: { flexDirection: "row", alignItems: "baseline", gap: 2, marginBottom: 6 },
  preco: { fontSize: 32, fontWeight: "700", color: "#0f172a" },
  precoSub: { fontSize: 14, color: "#94a3b8" },
  planoDesc: { fontSize: 13, color: "#64748b", marginBottom: 16, lineHeight: 18 },

  featuresList: { gap: 8, marginBottom: 20 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  featureText: { fontSize: 13, color: "#0f172a" },
  featureInativo: { color: "#cbd5e1" },

  btnPlano: {
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  btnAtual: { backgroundColor: "#f1f5f9", borderColor: "#e2e8f0" },
  btnPopular: { backgroundColor: TEAL, borderColor: TEAL },
  btnPlanoText: { fontSize: 14, fontWeight: "700", color: "#475569" },
  btnAtualText: { color: "#94a3b8" },
  btnPopularText: { color: "white" },
});