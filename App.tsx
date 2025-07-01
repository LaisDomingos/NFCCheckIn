import React, { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';

type Estacao = 'ENTRADA' | 'SALA_VIP' | 'SAIDA';
type Participante = {
  name: string;
  canAccessVIP: boolean;
  status: {
    entrada: boolean;
    sala_vip: boolean;
    saida: boolean;
  };
};

const PARTICIPANTES_ORIGINAIS: Record<string, Participante> = {
  TAG123: { name: 'João', canAccessVIP: false, status: { entrada: false, sala_vip: false, saida: false } },
  TAG456: { name: 'Maria', canAccessVIP: true, status: { entrada: false, sala_vip: false, saida: false } },
  TAG789: { name: 'Ana', canAccessVIP: true, status: { entrada: false, sala_vip: false, saida: false } },
  TAG000: { name: 'Carlos', canAccessVIP: false, status: { entrada: false, sala_vip: false, saida: false } },
};


export default function App() {
  const [estacaoAtual, setEstacaoAtual] = useState<Estacao>('ENTRADA');
  const [participantes, setParticipantes] = useState<Record<string, Participante>>(PARTICIPANTES_ORIGINAIS);

  const [participante, setParticipante] = useState<string | null>(null);
  const [ultimaAcao, setUltimaAcao] = useState<string | null>(null);

  // Carrega os dados do AsyncStorage ou usa os originais
  useEffect(() => {
    const carregarDados = async () => {
      const dadosSalvos = await AsyncStorage.getItem('participantes');
      if (dadosSalvos) {
        setParticipantes(JSON.parse(dadosSalvos));
      } else {
        setParticipantes(PARTICIPANTES_ORIGINAIS);
        await AsyncStorage.setItem('participantes', JSON.stringify(PARTICIPANTES_ORIGINAIS));
      }
    };
    carregarDados();
  }, []);

  const salvarParticipantes = async (dados: Record<string, Participante>) => {
    setParticipantes(dados);
    await AsyncStorage.setItem('participantes', JSON.stringify(dados));
  };


  const lerNFC = async () => {
    try {
      /* await NfcManager.requestTechnology(NfcTech.Ndef, {
        alertMessage: 'Aproxime seu dispositivo do tag NFC',
      });
      const tag = await NfcManager.getTag();
      console.log('Tag lida:', tag);

      await NfcManager.cancelTechnologyRequest();

      const tagId = tag?.id ?? '';*/
      const tagId = 'TAG123'
      if (!tagId) {
        Alert.alert('Erro', 'Tag NFC sem ID');
        return;
      }

      const data = participantes[tagId];
      if (!data) {
        Alert.alert('Erro', 'Participante não encontrado');
        return;
      }

      const status = data.status;

      if (estacaoAtual === 'ENTRADA') {
        if (status.entrada) {
          Alert.alert('🚫 Já registrado', `${data.name} já fez check-in na entrada.`);
          return;
        }
        status.entrada = true;
        Alert.alert('✅ Entrada autorizada', `Bem-vindo, ${data.name}!`);
      }

      else if (estacaoAtual === 'SALA_VIP') {
        if (!status.entrada) {
          Alert.alert('🚫 Acesso negado', `${data.name} ainda não entrou no evento.`);
          return;
        }
        if (!data.canAccessVIP) {
          Alert.alert('🚫 VIP exclusivo', `${data.name} não tem acesso à sala VIP.`);
          return;
        }
        if (status.sala_vip) {
          Alert.alert('🚫 Já registrado', `${data.name} já acessou a sala VIP.`);
          return;
        }
        status.sala_vip = true;
        Alert.alert('🍾 Bem-vindo à Sala VIP', `${data.name}, aproveite o champanhe!`);
      }

      else if (estacaoAtual === 'SAIDA') {
        if (!status.entrada) {
          Alert.alert('🚫 Saída inválida', `${data.name} não entrou no evento.`);
          return;
        }
        if (status.saida) {
          Alert.alert('🚫 Já saiu', `${data.name} já registrou a saída.`);
          return;
        }
        status.saida = true;
        Alert.alert('👋 Até logo!', `${data.name}, esperamos te ver na próxima festa!`);
      }

      // Atualiza estado e AsyncStorage
      const novosDados = { ...participantes, [tagId]: { ...data, status } };
      await salvarParticipantes(novosDados);

      setParticipante(data.name);
      setUltimaAcao(estacaoAtual);
    } catch (error: any) {
      Alert.alert('Erro na leitura NFC', error.message);
      await NfcManager.cancelTechnologyRequest();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🎉 Party Check-in</Text>

      <Text style={styles.subTitle}>
        Estação atual: <Text style={styles.estacao}>{estacaoAtual}</Text>
      </Text>

      <View style={styles.stationButtons}>
        {['ENTRADA', 'SALA_VIP', 'SAIDA'].map((etapa) => (
          <TouchableOpacity
            key={etapa}
            style={[
              styles.stationButton,
              estacaoAtual === etapa && styles.stationButtonActive,
            ]}
            onPress={() => setEstacaoAtual(etapa as Estacao)}
          >
            <Text style={styles.stationButtonText}>{etapa}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.nfcButton} onPress={lerNFC}>
        <Text style={styles.nfcButtonText}>📲 Simular Leitura</Text>
      </TouchableOpacity>

      {participante && (
        <Text style={styles.participantInfo}>
          Último: <Text style={styles.participantName}>{participante}</Text> - Ação: {ultimaAcao}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 10,
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 10,
    textAlign: 'center',
  },
  estacao: {
    color: '#00f2ff',
    fontWeight: 'bold',
  },
  stationButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
    marginTop: 10,
  },
  stationButton: {
    backgroundColor: '#0f3460',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  stationButtonActive: {
    backgroundColor: '#00f2ff',
  },
  stationButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  nfcButton: {
    backgroundColor: '#e94560',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginTop: 10,
  },
  nfcButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  participantInfo: {
    marginTop: 30,
    fontSize: 16,
    color: '#fff',
  },
  participantName: {
    fontWeight: 'bold',
    color: '#00ffcc',
  },
});
