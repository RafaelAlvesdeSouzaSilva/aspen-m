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

export default function PoliticaDePrivacidade() {
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
        <Text style={styles.titulo}>Política de Privacidade</Text>
        <Text style={styles.atualizacao}>Última atualização: 15 de novembro de 2025</Text>

        <Section titulo="1. Dados que coletamos">
          Coletamos apenas os dados necessários para prestar o serviço com segurança:{"\n\n"}
          • Dados de cadastro: nome completo e endereço de e-mail{"\n"}
          • Dados de autenticação: hash da senha (nunca a senha em texto puro){"\n"}
          • Dados de uso: data e hora dos acessos, dispositivos conectados{"\n"}
          • Dados de pagamento: processados por parceiros certificados PCI-DSS — não armazenamos dados de cartão{"\n\n"}
          Não coletamos dados sensíveis como origem racial, convicções religiosas, dados de saúde ou biometria.
        </Section>

        <Section titulo="2. Como usamos os dados">
          Utilizamos seus dados exclusivamente para:{"\n\n"}
          • Autenticar e identificar você na plataforma{"\n"}
          • Detectar e bloquear atividades suspeitas na sua conta{"\n"}
          • Enviar notificações relacionadas à segurança{"\n"}
          • Processar pagamentos e emitir cobranças{"\n"}
          • Melhorar o serviço com base em métricas agregadas e anônimas{"\n\n"}
          Não utilizamos seus dados para publicidade, venda a terceiros ou criação de perfis comportamentais.
        </Section>

        <Section titulo="3. Armazenamento e segurança">
          Seus dados são armazenados em servidores no Brasil com as seguintes proteções:{"\n\n"}
          • Senhas protegidas com bcrypt (hash unidirecional com salt){"\n"}
          • Comunicações criptografadas via TLS 1.3{"\n"}
          • Acesso ao banco restrito por autenticação e rede privada{"\n"}
          • Backups diários com retenção de 30 dias{"\n\n"}
          Em caso de incidente de segurança que afete seus dados, você será notificado em até 72 horas conforme exigido pela LGPD.
        </Section>

        <Section titulo="4. Compartilhamento de dados">
          Não vendemos nem alugamos seus dados pessoais. Podemos compartilhá-los apenas nas seguintes situações:{"\n\n"}
          • Parceiros de infraestrutura: provedores de hospedagem e banco de dados que operam sob acordos de confidencialidade{"\n"}
          • Processadores de pagamento: apenas os dados necessários para concluir a transação{"\n"}
          • Obrigação legal: quando exigido por lei, ordem judicial ou autoridade competente
        </Section>

        <Section titulo="5. Cookies">
          Utilizamos cookies estritamente necessários para manter sua sessão autenticada. Não utilizamos cookies de rastreamento, publicidade ou análise comportamental sem seu consentimento explícito.{"\n\n"}
          Você pode desativar cookies no seu navegador, mas isso pode impedir o funcionamento correto da plataforma.
        </Section>

        <Section titulo="6. Seus direitos (LGPD)">
          Nos termos da Lei Geral de Proteção de Dados (Lei n. 13.709/2018), você tem direito a:{"\n\n"}
          • Acesso: solicitar uma cópia de todos os seus dados pessoais{"\n"}
          • Correção: atualizar dados incorretos ou desatualizados{"\n"}
          • Exclusão: solicitar a remoção dos seus dados da plataforma{"\n"}
          • Portabilidade: receber seus dados em formato estruturado{"\n"}
          • Revogação: retirar seu consentimento a qualquer momento{"\n"}
          • Oposição: contestar o tratamento realizado sem sua concordância{"\n\n"}
          Para exercer qualquer destes direitos, entre em contato pelo e-mail privacidade@aspencore.com.
        </Section>

        <Section titulo="7. Retenção de dados">
          Mantemos seus dados enquanto sua conta estiver ativa. Após o encerramento da conta, os dados são excluídos em até 30 dias, exceto quando a lei exigir retenção por prazo maior (ex: obrigações fiscais por 5 anos).{"\n\n"}
          Logs de acesso são mantidos por 6 meses para fins de segurança e conformidade.
        </Section>

        <Section titulo="8. Menores de idade">
          O serviço é destinado a maiores de 18 anos. Não coletamos intencionalmente dados de menores. Se identificarmos uma conta criada por menor, ela será encerrada e os dados removidos imediatamente.
        </Section>

        <Section titulo="9. Contato e encarregado de dados (DPO)">
          Para questões relacionadas à privacidade ou para exercer seus direitos, entre em contato com nosso Encarregado de Dados:{"\n\n"}
          • E-mail: privacidade@aspencore.com{"\n"}
          • Prazo de resposta: até 15 dias úteis{"\n\n"}
          Você também pode registrar reclamações junto à Autoridade Nacional de Proteção de Dados (ANPD) em www.gov.br/anpd.
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