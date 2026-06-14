import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { height } = Dimensions.get("window");

export default function Home() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} bounces={false}>
      {/* Header / Hero */}
      <View style={styles.hero}>
        {/* Navbar */}
        <View style={styles.navbar}>
          <View style={styles.logoWrap}>
            <Ionicons name="shield-checkmark-outline" size={22} color="white" />
            <View>
              <Text style={styles.logoText}>ASPEN CORE</Text>
              <Text style={styles.logoSub}>SEGURANÇA DIGITAL</Text>
            </View>
          </View>
          <View style={styles.navButtons}>
            <TouchableOpacity
              style={styles.btnOutline}
              onPress={() => router.push("/login")}
            >
              <Text style={styles.btnOutlineText}>Entrar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnSolid}
              onPress={() => router.push("/register")}
            >
              <Text style={styles.btnSolidText}>Cadastrar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero content */}
        <View style={styles.heroContent}>
          <View style={styles.shieldIcon}>
            <Ionicons name="shield-checkmark-outline" size={48} color="white" />
          </View>
          <Text style={styles.badge}>PROTEÇÃO REAL, SEM COMPLICAÇÃO</Text>
          <Text style={styles.heroTitle}>
            Segurança simples para quem precisa de{" "}
            <Text style={styles.heroItalic}>proteção real</Text>
          </Text>
          <Text style={styles.heroSub}>
            O ASPEN CORE protege você contra phishing, reduz a dependência de
            senhas e simplifica a autenticação — para pessoas e equipes de
            qualquer tamanho.
          </Text>
          <View style={styles.heroButtons}>
            <TouchableOpacity
              style={styles.btnHeroPrimary}
              onPress={() => router.push("/register")}
            >
              <Text style={styles.btnHeroPrimaryText}>Conhecer solução</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnHeroSecondary}
              onPress={() => {}}
            >
              <Text style={styles.btnHeroSecondaryText}>Ver planos</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.socialProof}>
            <View style={styles.avatarStack}>
              {["#0b8a8a", "#0d7a7a", "#0f6b6b"].map((color, i) => (
                <View
                  key={i}
                  style={[
                    styles.avatar,
                    { backgroundColor: color, marginLeft: i * -10 },
                  ]}
                >
                  <Ionicons name="person" size={12} color="white" />
                </View>
              ))}
            </View>
            <Text style={styles.socialText}>
              Mais de <Text style={{ fontWeight: "700" }}>1.200 usuários</Text>{" "}
              protegidos hoje
            </Text>
          </View>
        </View>
      </View>

      {/* Como funciona */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Como funciona</Text>
        <Text style={styles.sectionSub}>Três passos para estar protegido.</Text>
        {[
          {
            num: "01",
            title: "Crie sua conta",
            desc: "Cadastro rápido com e-mail e senha. Nenhum cartão de crédito necessário para começar.",
            icon: "person-add-outline",
          },
          {
            num: "02",
            title: "Conecte seus dispositivos",
            desc: "Adicione seus computadores, smartphones e tablets ao painel de controle centralizado.",
            icon: "phone-portrait-outline",
          },
          {
            num: "03",
            title: "Fique protegido",
            desc: "Monitoramento contínuo, alertas inteligentes e relatórios claros para você sempre saber o que está acontecendo.",
            icon: "shield-checkmark-outline",
          },
        ].map((step) => (
          <View key={step.num} style={styles.stepCard}>
            <View style={styles.stepLeft}>
              <Text style={styles.stepNum}>{step.num}</Text>
              <View style={styles.stepIconWrap}>
                <Ionicons name={step.icon as any} size={22} color={TEAL} />
              </View>
            </View>
            <View style={styles.stepRight}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepDesc}>{step.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Planos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Planos acessíveis</Text>
        <Text style={styles.sectionSub}>
          Proteção para todos os perfis, sem surpresas na fatura.
        </Text>
        {[
          {
            tag: "BÁSICO",
            price: "Grátis",
            desc: "Para uso pessoal com até 2 dispositivos.",
            features: [
              "2 dispositivos",
              "Alertas de phishing",
              "Painel básico",
            ],
            cta: "Começar grátis",
            destaque: false,
          },
          {
            tag: "PADRÃO",
            price: "R$ 29",
            per: "/mês",
            desc: "Para famílias e profissionais com até 10 dispositivos.",
            features: [
              "10 dispositivos",
              "Proteção avançada",
              "Relatórios mensais",
              "Suporte prioritário",
            ],
            cta: "Assinar agora",
            destaque: true,
          },
          {
            tag: "PREMIUM",
            price: "R$ 79",
            per: "/mês",
            desc: "Para equipes e empresas com dispositivos ilimitados.",
            features: [
              "Dispositivos ilimitados",
              "API de integração",
              "SLA garantido",
              "Gerente de conta",
            ],
            cta: "Falar com vendas",
            destaque: false,
          },
        ].map((plan) => (
          <View
            key={plan.tag}
            style={[styles.planCard, plan.destaque && styles.planDestaque]}
          >
            {plan.destaque && (
              <View style={styles.planBadge}>
                <Text style={styles.planBadgeText}>Mais popular</Text>
              </View>
            )}
            <Text style={styles.planTag}>{plan.tag}</Text>
            <View style={styles.planPriceRow}>
              <Text style={styles.planPrice}>{plan.price}</Text>
              {plan.per && <Text style={styles.planPer}>{plan.per}</Text>}
            </View>
            <Text style={styles.planDesc}>{plan.desc}</Text>
            <View style={styles.planFeatures}>
              {plan.features.map((f) => (
                <View key={f} style={styles.planFeatureRow}>
                  <Ionicons name="checkmark" size={14} color={TEAL} />
                  <Text style={styles.planFeatureText}>{f}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.planBtn, plan.destaque && styles.planBtnDestaque]}
              onPress={() => router.push("/register")}
            >
              <Text
                style={[
                  styles.planBtnText,
                  plan.destaque && styles.planBtnTextDestaque,
                ]}
              >
                {plan.cta}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Footer CTA */}
      <View style={styles.footerCta}>
        <Ionicons
          name="shield-checkmark-outline"
          size={32}
          color="white"
          style={{ marginBottom: 12 }}
        />
        <Text style={styles.footerTitle}>Pronto para se proteger?</Text>
        <Text style={styles.footerSub}>
          Crie sua conta gratuita e comece hoje mesmo.
        </Text>
        <TouchableOpacity
          style={styles.btnFooter}
          onPress={() => router.push("/register")}
        >
          <Text style={styles.btnFooterText}>Criar conta gratuita</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const TEAL = "#0b6b6b";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7f8" },

  // Hero
  hero: { backgroundColor: TEAL, paddingBottom: 40 },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  logoWrap: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoText: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  logoSub: { color: "rgba(255,255,255,0.6)", fontSize: 9, letterSpacing: 0.5 },
  navButtons: { flexDirection: "row", gap: 8 },
  btnOutline: {
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.6)",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  btnOutlineText: { color: "white", fontSize: 13, fontWeight: "600" },
  btnSolid: {
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  btnSolidText: { color: TEAL, fontSize: 13, fontWeight: "700" },

  heroContent: { paddingHorizontal: 24, paddingTop: 24 },
  shieldIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 24,
  },
  badge: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 12,
    textAlign: "center",
  },
  heroTitle: {
    color: "white",
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 36,
    marginBottom: 14,
    textAlign: "center",
  },
  heroItalic: { fontStyle: "italic", color: "rgba(255,255,255,0.9)" },
  heroSub: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 28,
  },
  heroButtons: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
    marginBottom: 24,
  },
  btnHeroPrimary: {
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  btnHeroPrimaryText: { color: TEAL, fontWeight: "700", fontSize: 14 },
  btnHeroSecondary: {
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.6)",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  btnHeroSecondaryText: { color: "white", fontWeight: "600", fontSize: 14 },
  socialProof: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 8,
  },
  avatarStack: { flexDirection: "row" },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: TEAL,
    alignItems: "center",
    justifyContent: "center",
  },
  socialText: { color: "rgba(255,255,255,0.85)", fontSize: 12 },

  // Seções
  section: { padding: 24 },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a",
    textAlign: "center",
    marginBottom: 6,
  },
  sectionSub: {
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 24,
  },

  // Como funciona
  stepCard: {
    flexDirection: "row",
    gap: 16,
    backgroundColor: "white",
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: "#e2e8f0",
  },
  stepLeft: { alignItems: "center", gap: 8 },
  stepNum: { fontSize: 20, fontWeight: "700", color: "#e2e8f0" },
  stepIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#e6f4f4",
    alignItems: "center",
    justifyContent: "center",
  },
  stepRight: { flex: 1 },
  stepTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 6,
  },
  stepDesc: { fontSize: 13, color: "#64748b", lineHeight: 20 },

  // Planos
  planCard: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: 20,
    marginBottom: 14,
    borderWidth: 0.5,
    borderColor: "#e2e8f0",
  },
  planDestaque: { borderWidth: 2, borderColor: TEAL },
  planBadge: {
    backgroundColor: TEAL,
    borderRadius: 20,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 10,
  },
  planBadgeText: { color: "white", fontSize: 11, fontWeight: "700" },
  planTag: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94a3b8",
    letterSpacing: 1,
    marginBottom: 6,
  },
  planPriceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
    marginBottom: 6,
  },
  planPrice: { fontSize: 32, fontWeight: "700", color: "#0f172a" },
  planPer: { fontSize: 13, color: "#64748b" },
  planDesc: { fontSize: 13, color: "#64748b", marginBottom: 16 },
  planFeatures: { gap: 8, marginBottom: 20 },
  planFeatureRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  planFeatureText: { fontSize: 13, color: "#475569" },
  planBtn: {
    borderWidth: 1.5,
    borderColor: TEAL,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  planBtnDestaque: { backgroundColor: TEAL },
  planBtnText: { color: TEAL, fontWeight: "700", fontSize: 14 },
  planBtnTextDestaque: { color: "white" },

  // Footer CTA
  footerCta: {
    backgroundColor: TEAL,
    padding: 32,
    alignItems: "center",
  },
  footerTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  footerSub: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },
  btnFooter: {
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  btnFooterText: { color: TEAL, fontWeight: "700", fontSize: 15 },
});
