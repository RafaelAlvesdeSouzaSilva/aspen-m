import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Persistência LOCAL e INTERINA das Aspen Keys pareadas neste aparelho.
 *
 * Isso existe porque o backend ainda não tem uma estrutura própria para
 * Aspen Keys (nem endpoint de pareamento) — combinado no prompt de revisão
 * do Aspen Network. Assim que existir (ex: coleção `users/{uid}/aspen_keys`
 * no Firestore, ou uma tabela própria), este arquivo deve ser substituído
 * por chamadas reais via services/api.ts ou services/firebase.ts, seguindo
 * o mesmo padrão já usado em dispositivos.tsx/notificacao.tsx.
 *
 * Limitação clara desse meio-termo: o pareamento fica só neste aparelho,
 * não sincroniza entre dispositivos nem aparece no site — é o preço de
 * termos algo testável antes do backend estar pronto.
 */

const CHAVE_STORAGE = "@aspen_keys_pareadas";

export type ModeloAspenKey = "aspenkey_lite" | "aspenkey_pro";

export type UltimaLocalizacao = {
  lat: number;
  lng: number;
  precisao: number | null;
  timestamp: string; // ISO 8601
};

export type AspenKeyPareada = {
  id: string; // MAC/UUID BLE usado no pareamento
  nome: string;
  modelo: ModeloAspenKey;
  ultimaLocalizacao: UltimaLocalizacao | null;
};

export async function listarAspenKeysPareadas(): Promise<AspenKeyPareada[]> {
  try {
    const bruto = await AsyncStorage.getItem(CHAVE_STORAGE);
    return bruto ? JSON.parse(bruto) : [];
  } catch {
    return [];
  }
}

async function salvarTudo(lista: AspenKeyPareada[]): Promise<void> {
  await AsyncStorage.setItem(CHAVE_STORAGE, JSON.stringify(lista));
}

export async function parearAspenKey(id: string, nome: string, modelo: ModeloAspenKey): Promise<AspenKeyPareada> {
  const lista = await listarAspenKeysPareadas();
  const nova: AspenKeyPareada = { id, nome, modelo, ultimaLocalizacao: null };
  const semDuplicata = lista.filter((k) => k.id !== id);
  await salvarTudo([nova, ...semDuplicata]);
  return nova;
}

export async function removerAspenKey(id: string): Promise<void> {
  const lista = await listarAspenKeysPareadas();
  await salvarTudo(lista.filter((k) => k.id !== id));
}

export async function atualizarLocalizacaoAspenKey(id: string, local: UltimaLocalizacao): Promise<void> {
  const lista = await listarAspenKeysPareadas();
  await salvarTudo(lista.map((k) => (k.id === id ? { ...k, ultimaLocalizacao: local } : k)));
}

/**
 * Status derivado a partir de há quanto tempo a última localização foi
 * registrada — mesma lógica de significado de cor do dashboard web do
 * Aspen Network (RECENTLY_SEEN / STALE / OFFLINE / SEM_LOCALIZACAO),
 * adaptada à paleta do app mobile.
 */
export type StatusAspenKey = "recently_seen" | "stale" | "offline" | "sem_localizacao";

export function calcularStatus(local: UltimaLocalizacao | null): StatusAspenKey {
  if (!local) return "sem_localizacao";
  const minutosDesde = (Date.now() - new Date(local.timestamp).getTime()) / 60000;
  if (minutosDesde < 15) return "recently_seen";
  if (minutosDesde < 24 * 60) return "stale";
  return "offline";
}

export const STATUS_INFO: Record<StatusAspenKey, { label: string; cor: string; fundo: string }> = {
  recently_seen: { label: "Vista recentemente", cor: "#16a34a", fundo: "#dcfce7" },
  stale: { label: "Sem atualização recente", cor: "#f59e0b", fundo: "#fef3c7" },
  offline: { label: "Offline", cor: "#ef4444", fundo: "#fee2e2" },
  sem_localizacao: { label: "Nunca localizada", cor: "#94a3b8", fundo: "#f1f5f9" },
};