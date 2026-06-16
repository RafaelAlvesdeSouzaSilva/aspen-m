import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const TEAL = "#0b6b6b";

export default function TermosDeUso() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.btnVoltar} onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={20} color="#475569" />
        </TouchableOpacity>
        <View style={styles.logoWrap}>
          <Ionicons name="shield-checkmark-outline" size={16} color={TEAL} />
          <Text style={styles.logoText}>ASPEN CORE</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.titulo}>Termos de Uso</Text>
        <Text style={styles.atualizacao}>Última atualização: 15 de novembro de 2025</Text>

        <Section titulo="1. Aceitação dos termos">
          Ao criar uma conta ou utilizar os serviços da plataforma ASPEN CORE, você concorda com estes Termos de Uso. Se não concordar com qualquer parte destes termos, não utilize o serviço.{"\n\n"}
          Estes termos constituem um contrato legal entre você e a ASPEN CORE. Recomendamos que os leia atentamente antes de utilizar a plataforma.
        </Section>

        <Section titulo="2. Descrição do serviço">
          A ASPEN CORE é uma plataforma de segurança digital que oferece serviços de autenticação física, proteção contra phishing e monitoramento de dispositivos. O serviço é prestado por meio de planos de assinatura mensal.{"\n\n"}
          Reservamo-nos o direito de modificar, suspender ou encerrar qualquer funcionalidade do serviço a qualquer momento, com aviso prévio de 30 dias para alterações significativas.
        </Section>

        <Section titulo="3. Sua conta">
          Para utilizar os recursos da plataforma, você deve criar uma conta com informações verdadeiras, precisas e atualizadas. Você é responsável por:{"\n\n"}
          • Manter a confidencialidade da sua senha{"\n"}
          • Todas as atividades realizadas na sua conta{"\n"}
          • Notificar imediatamente qualquer uso não autorizado{"\n\n"}
          É permitido somente uma conta por pessoa. Contas compartilhadas ou criadas por bots não são permitidas.
        </Section>

        <Section titulo="4. Uso aceitável">
          Você concorda em não utilizar o serviço para:{"\n\n"}
          • Violar leis ou regulamentos aplicáveis{"\n"}
          • Tentar acessar sistemas ou dados sem autorização{"\n"}
          • Interferir na operação normal da plataforma{"\n"}
          • Realizar engenharia reversa do software{"\n"}
          • Revender ou sublicenciar o acesso ao serviço{"\n\n"}
          O descumprimento destas regras pode resultar na suspensão imediata da conta sem reembolso.
        </Section>

        <Section titulo="5. Pagamentos e planos">
          Os planos pagos são cobrados mensalmente de forma antecipada. O cancelamento pode ser feito a qualquer momento e terá efeito ao final do período já pago — não há reembolso proporcional.{"\n\n"}
          Reservamo-nos o direito de alterar os preços com aviso prévio de 30 dias. A continuidade do uso após o aviso constituirá aceitação dos novos valores.
        </Section>

        <Section titulo="6. Propriedade intelectual">
          Todo o conteúdo, software, logotipos e materiais da plataforma são de propriedade exclusiva da ASPEN CORE e protegidos por leis de direitos autorais. Nenhum direito é transferido ao usuário além da licença limitada de uso do serviço.
        </Section>

        <Section titulo="7. Limitação de responsabilidade">
          A ASPEN CORE não se responsabiliza por danos indiretos, incidentais ou consequentes resultantes do uso ou impossibilidade de uso do serviço. Nossa responsabilidade total não excederá o valor pago pelo usuário nos últimos 12 meses.{"\n\n"}
          O serviço é fornecido "como está", sem garantias de disponibilidade ininterrupta. Nos esforçamos para manter disponibilidade de 99,5%, mas não garantimos este nível.
        </Section>

        <Section titulo="8. Rescisão">
          Qualquer uma das partes pode encerrar o contrato a qualquer momento. Você pode encerrar sua conta nas configurações da plataforma. Reservamo-nos o direito de suspender contas que violem estes termos sem aviso prévio.{"\n\n"}
          Após o encerramento, seus dados serão mantidos por 30 dias e então excluídos permanentemente, exceto quando a legislação exigir retenção por prazo maior.
        </Section>

        <Section titulo="9. Contato">
          Em caso de dúvidas sobre estes Termos de Uso, entre em contato pelo e-mail legal@aspencore.com. Responderemos em até 5 dias úteis.
        </Section>

        <Text style={styles.rodape}>© 2025 ASPEN CORE. Todos os direitos reservados.</Text>
      </ScrollView>
    </View>
  );
}

function Section({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <View style={styles.secao}>
      <Text style={styles.secaoTitulo}>{titulo}</Text>
      <Text style={styles.secaoTexto}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7f8" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: "white",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e2e8f0",
  },
  btnVoltar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  logoWrap: { flexDirection: "row", alignItems: "center", gap: 6 },
  logoText: { fontSize: 11, fontWeight: "700", color: TEAL, letterSpacing: 0.8 },
  scroll: { flex: 1 },
  content: { padding: 24, paddingBottom: 48 },
  titulo: { fontSize: 26, fontWeight: "700", color: "#0f172a", marginBottom: 4 },
  atualizacao: { fontSize: 12, color: "#94a3b8", marginBottom: 24 },
  secao: { marginBottom: 24 },
  secaoTitulo: { fontSize: 15, fontWeight: "700", color: TEAL, marginBottom: 8 },
  secaoTexto: { fontSize: 14, color: "#475569", lineHeight: 22 },
  rodape: { fontSize: 12, color: "#94a3b8", textAlign: "center", marginTop: 16 },
});
