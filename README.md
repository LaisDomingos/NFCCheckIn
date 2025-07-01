# Party Check-in NFC App 🎉📲

App React Native para controle simples de entrada, acesso VIP e saída de participantes em um evento, usando NFC para identificar os convidados.

---

## Funcionalidades

- Leitura de tags NFC para identificar participantes pelo ID.
- Controle de fluxo por estações: **ENTRADA**, **SALA_VIP** e **SAIDA**.
- Validação de acesso VIP para participantes autorizados.
- Armazenamento local dos dados de participantes e seus status usando AsyncStorage.
- Simulação de leitura NFC para testes manuais.
- Interface simples com botões para alternar entre estações.

---

## Tecnologias

- React Native
- TypeScript
- react-native-nfc-manager (para leitura NFC)
- AsyncStorage (armazenamento local)

---

## Como usar

### Pré-requisitos

- Node.js e npm/yarn instalados
- React Native CLI instalado globalmente
- Ambiente configurado para desenvolvimento React Native (Android Studio, Xcode etc)
- Dispositivo físico com NFC habilitado (ou emulador com suporte a NFC — veja nota abaixo)

### Instalação

1. Clone o repositório ou crie o projeto:

```bash
npx react-native init NFCCheckIn
```
2. Instale dependências:

```bash
npm install react-native-nfc-manager @react-native-async-storage/async-storage
npx pod-install
```
3. Copie o código do App.tsx para seu projeto.

### Executando
Inicie o servidor Metro:

```bash
npx react-native start
```
Em outro terminal, rode o app no dispositivo/emulador:
```bash
npx react-native run-android
# ou
npx react-native run-ios
```
### Testes no Android Studio IDE
- No emulador Android, o NFC não é suportado, portanto você não poderá testar a leitura NFC real.
- Para testes manuais no emulador ou durante desenvolvimento, use o botão “📲 Simular Leitura” que simula a leitura de uma tag fixa (TAG456).
- Para testar a leitura NFC real, você deve rodar o app em um dispositivo físico com NFC habilitado.

### Usando o app
- Escolha a estação (ENTRADA, SALA_VIP, SAIDA) no topo.
- Para testar a leitura NFC, aproxime uma tag NFC válida do dispositivo físico ou use o botão “📲 Simular Leitura” para simular uma tag.
- O app valida e atualiza o status do participante, mostrando alertas para ações permitidas ou negadas.

### Estrutura de dados
O app mantém um registro de participantes, cada um com:
- name: nome do convidado
- canAccessVIP: booleano para permissão VIP
- status: objeto com flags booleanas para entrada, sala_vip e saida

Os IDs das tags NFC são usados para identificar os participantes.

### Configurações importantes
No Android, é necessário configurar as permissões NFC no AndroidManifest.xml:

```xml
<uses-permission android:name="android.permission.NFC" />
<uses-feature android:name="android.hardware.nfc" android:required="true" />
No iOS, suporte NFC é limitado a dispositivos compatíveis e requer configuração no Xcode.
```


![image](https://github.com/user-attachments/assets/0a8b7dce-23b8-4c62-a746-32c72e3deccc)
