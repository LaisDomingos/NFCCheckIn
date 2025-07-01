import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';

const ETAPAS = ['REGISTRO', 'ENTRADA', 'SALA_VIP', 'SAIDA'];

// Mock de participantes por tag NFC
const participantesMock: { [key: string]: { name: string; allowedStep: string } } = {
  'TAG123REG': { name: 'João', allowedStep: 'REGISTRO' },
  'TAG456ENT': { name: 'Maria', allowedStep: 'ENTRADA' },
  'TAG789VIP': { name: 'Ana', allowedStep: 'SALA_VIP' },
  'TAG000SAI': { name: 'Carlos', allowedStep: 'SAIDA' },
};


export default function App() {
  const [etapaAtual, setEtapaAtual] = useState<string>(ETAPAS[0]);
  const [participante, setParticipante] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const savedStep = await AsyncStorage.getItem('currentStep');
      if (savedStep && ETAPAS.includes(savedStep)) {
        setEtapaAtual(savedStep);
      } else {
        await AsyncStorage.setItem('currentStep', ETAPAS[0]);
        setEtapaAtual(ETAPAS[0]);
      }
      await NfcManager.start();
    })();
  }, []);

  const lerNFC = async () => {
    try {
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const tag = await NfcManager.getTag();
      await NfcManager.cancelTechnologyRequest();

      const tagId = tag?.id ?? '';

      if (!tagId) {
        Alert.alert('Erro', 'Tag NFC sem ID');
        return;
      }
      
      const data = participantesMock[tagId];

      if (!data) {
        Alert.alert('Erro', 'Participante não encontrado.');
        return;
      }

      setParticipante(data.name);

      if (data.allowedStep === etapaAtual) {
        Alert.alert('Check-in OK', `${data.name} liberado para etapa: ${etapaAtual}`);

        // Avança etapa
        const nextIndex = ETAPAS.indexOf(etapaAtual) + 1;
        const nextStep = ETAPAS[nextIndex] || ETAPAS[0];
        setEtapaAtual(nextStep);
        await AsyncStorage.setItem('currentStep', nextStep);
      } else {
        Alert.alert('Erro', `Etapa incorreta. O participante está liberado para ${data.allowedStep}, mas a etapa atual é ${etapaAtual}.`);
      }
    } catch (error: any) {
      Alert.alert('Erro na leitura NFC', error.message);
      await NfcManager.cancelTechnologyRequest();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Check-in Evento NFC</Text>
      <Text style={styles.step}>Etapa Atual: {etapaAtual}</Text>
      <Button title="Ler NFC" onPress={lerNFC} />
      {participante && <Text style={styles.participant}>Participante: {participante}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, justifyContent:'center', alignItems:'center', padding:20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  step: { fontSize: 18, marginBottom: 20 },
  participant: { marginTop: 20, fontSize: 16, fontStyle: 'italic' },
});
