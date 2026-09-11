import { useEffect, useRef, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import { BleManager, Device, State as BleState } from "react-native-ble-plx";

// Mesmo UUID de serviço anunciado pelo firmware da Aspen Key (ESP32-S3),
// confirmado com nRF Connect. Sem GATT, sem troca de dados — só presença.
export const ASPEN_KEY_SERVICE_UUID = "4b544159-4153-5045-4e4b-455931000001";

// Uma única instância do BleManager para o app inteiro — criar mais de uma
// duplica listeners nativos e desperdiça bateria.
let bleManagerSingleton: BleManager | null = null;
function getBleManager(): BleManager {
  if (!bleManagerSingleton) bleManagerSingleton = new BleManager();
  return bleManagerSingleton;
}

export type AspenKeyEncontrada = {
  id: string; // MAC address (Android) ou UUID (iOS)
  nome: string;
  rssi: number | null;
};

/**
 * Pede as permissões de Bluetooth necessárias em tempo de execução.
 * Android 12+ exige BLUETOOTH_SCAN e BLUETOOTH_CONNECT explicitamente;
 * versões antigas exigem ACCESS_FINE_LOCATION para scan BLE.
 * No iOS a permissão é pedida automaticamente pelo sistema na primeira
 * chamada de scan, a partir do NSBluetoothAlwaysUsageDescription do
 * Info.plist — não precisa (nem dá) pedir manualmente aqui.
 */
export async function pedirPermissoesBluetooth(): Promise<boolean> {
  if (Platform.OS !== "android") return true;

  const versaoAndroid = Platform.Version as number;
  if (versaoAndroid >= 31) {
    const resultado = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    ]);
    return (
      resultado[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] === PermissionsAndroid.RESULTS.GRANTED &&
      resultado[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] === PermissionsAndroid.RESULTS.GRANTED
    );
  }

  // Android < 12: scan BLE exige localização por causa de como o Android
  // classifica essa permissão (não é bug nosso, é histórico da plataforma).
  const resultado = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );
  return resultado === PermissionsAndroid.RESULTS.GRANTED;
}

/**
 * Hook de scan de Aspen Keys por perto. Cuida de pedir permissão, checar
 * se o Bluetooth do aparelho está ligado, e limpar o scan automaticamente
 * ao desmontar a tela (scan sem parar dreno bateria e vaza listener nativo).
 */
export function useScanAspenKeys() {
  const [escaneando, setEscaneando] = useState(false);
  const [encontradas, setEncontradas] = useState<AspenKeyEncontrada[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const managerRef = useRef(getBleManager());

  function iniciar() {
    setErro(null);
    setEncontradas([]);

    pedirPermissoesBluetooth().then((concedida) => {
      if (!concedida) {
        setErro("Permissão de Bluetooth não concedida. Ative nas configurações do sistema.");
        return;
      }

      managerRef.current.state().then((estado) => {
        if (estado !== BleState.PoweredOn) {
          setErro(
            estado === BleState.PoweredOff
              ? "O Bluetooth está desligado. Ative-o para procurar sua Aspen Key."
              : "Bluetooth indisponível neste aparelho no momento.",
          );
          return;
        }

        setEscaneando(true);
        managerRef.current.startDeviceScan(
          [ASPEN_KEY_SERVICE_UUID],
          { allowDuplicates: false },
          (erroScan, device) => {
            if (erroScan) {
              setErro(erroScan.message ?? "Erro ao escanear dispositivos Bluetooth.");
              setEscaneando(false);
              return;
            }
            if (!device) return;
            setEncontradas((prev) => {
              if (prev.some((d) => d.id === device.id)) {
                // Já na lista — só atualiza o RSSI (força de sinal), que
                // muda conforme a distância do usuário até a Aspen Key.
                return prev.map((d) => (d.id === device.id ? { ...d, rssi: device.rssi } : d));
              }
              return [...prev, { id: device.id, nome: device.name ?? "Aspen Key", rssi: device.rssi }];
            });
          },
        );
      });
    });
  }

  function parar() {
    managerRef.current.stopDeviceScan();
    setEscaneando(false);
  }

  useEffect(() => {
    return () => {
      managerRef.current.stopDeviceScan();
    };
  }, []);

  return { escaneando, encontradas, erro, iniciar, parar };
}