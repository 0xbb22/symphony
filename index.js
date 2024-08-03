const fs = require('fs');
const readline = require('readline');
const { DirectSecp256k1HdWallet, makeCosmoshubPath } = require('@cosmjs/proto-signing');
const { SigningStargateClient, assertIsDeliverTxSuccess } = require('@cosmjs/stargate');
const bip39 = require('bip39');
const axios = require('axios');
const claimFaucet = require('./files/faucet');
const { claimFaucetWithProxies } = require('./files/faucet');
require('dotenv').config();

// Konfigurasi
const rpcEndpoint = "https://symphony-rpc.kleomedes.network";
const apiEndpoint = "https://symphony-api.kleomedes.network";
const prefix = "symphony";
const feeAmount = {
  amount: [{ denom: "note", amount: "5000" }], // Biaya (0.005 MLD)
  gas: "200000", // Batas Gas
};

// Kode Warna ANSI
const color = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
};

// Menampilkan informasi script dan channel
const displayInfo = () => {
  console.log(`${color.cyan}==============================${color.reset}`);
  console.log(`${color.green}Symphony Script${color.reset}`);
  console.log(`${color.yellow}Channel: ${color.cyan}t.me/ugdairdrop${color.reset}`);
  console.log(`${color.cyan}==============================${color.reset}\n`);
};

// Fungsi untuk membaca mnemonic dari file .env
const readMnemonicFromEnv = () => {
  return process.env.MNEMONIC_SENDER;
};

// Fungsi untuk menghasilkan alamat
const generateAddress = async (mnemonic) => {
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
    prefix,
    hdPaths: [makeCosmoshubPath(0)],
  });
  const [account] = await wallet.getAccounts();
  return account.address;
};

// Fungsi untuk mengirim transaksi
const sendTransaction = async (client, senderAddress, recipientAddress, amount) => {
  const sendAmount = {
    denom: "note",
    amount: amount,
  };

  const result = await client.sendTokens(senderAddress, recipientAddress, [sendAmount], feeAmount, "Transaksi Uji");
  assertIsDeliverTxSuccess(result);
  console.log(`${color.green}Transaksi berhasil dikirim ke ${recipientAddress}${color.reset}`);
  console.log(`${color.cyan}Tx Hash: ${result.transactionHash}${color.reset}`);
};

// Fungsi untuk meminta input dari pengguna
const askQuestion = (query) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
};

// Fungsi untuk mendapatkan saldo alamat
const getBalance = async (client, address) => {
  const balance = await client.getBalance(address, "note");
  return balance.amount / 1000000; // Mengonversi dari note ke MLD
};

// Fungsi untuk mendapatkan validator aktif
const getActiveValidators = async () => {
  const response = await axios.get(`${apiEndpoint}/cosmos/staking/v1beta1/validators?status=BOND_STATUS_BONDED`);
  const validators = response.data.validators;
  if (validators.length === 0) throw new Error('Tidak ada validator aktif ditemukan');
  return validators;
};

// Fungsi untuk staking ke validator
const stakeToValidator = async (client, delegatorAddress, validatorAddress, amount) => {
  const delegateAmount = {
    denom: "note",
    amount: amount,
  };

  const result = await client.delegateTokens(delegatorAddress, validatorAddress, delegateAmount, feeAmount, "Transaksi Staking");
  assertIsDeliverTxSuccess(result);
  console.log(`${color.green}Staking berhasil ke validator ${validatorAddress}${color.reset}`);
  console.log(`${color.cyan}Tx Hash: ${result.transactionHash}${color.reset}`);
};

// Fungsi untuk menampilkan informasi dengan warna
const printColored = (message, colorCode) => {
  console.log(`${colorCode}${message}${color.reset}`);
};

// Menu Pilihan
const menu = async () => {
  displayInfo(); // Menampilkan informasi script dan channel

  console.log(`${color.cyan}Pilih Menu:${color.reset}`);
  console.log(`${color.yellow}1. Mengirim otomatis${color.reset}`);
  console.log(`${color.yellow}2. Stake otomatis${color.reset}`);
  console.log(`${color.yellow}3. Klaim Faucet${color.reset}`);

  const choice = await askQuestion('Masukkan pilihan Anda (1, 2, atau 3): ');

  switch (choice) {
    case '1':
      await sendAutomatically();
      break;
    case '2':
      await stakeAutomatically();
      break;
    case '3':
      await claimFaucetForSenderWithProxies();
      break;
    default:
      console.log(`${color.red}Pilihan tidak valid. Silakan pilih 1, 2, atau 3.${color.reset}`);
  }
};

// Fungsi untuk mengirim otomatis
const sendAutomatically = async () => {
  const walletCount = await askQuestion('Masukkan jumlah wallet yang ingin dibuat: ');
  const mnemonics = [];

  printColored('Menghasilkan alamat...', color.cyan);
  for (let i = 0; i < walletCount; i++) {
    const mnemonic = bip39.generateMnemonic();
    mnemonics.push(mnemonic);
    const address = await generateAddress(mnemonic);
    printColored(`Alamat ${i + 1} yang dihasilkan: ${address}`, color.yellow);
  }

  const mnemonicSender = readMnemonicFromEnv();
  const senderWallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonicSender, {
    prefix,
    hdPaths: [makeCosmoshubPath(0)],
  });
  const senderAddress = (await senderWallet.getAccounts())[0].address;

  const client = await SigningStargateClient.connectWithSigner(rpcEndpoint, senderWallet);
  const balance = await getBalance(client, senderAddress);

  printColored(`\nAlamat Pengirim: ${senderAddress}`, color.cyan);
  printColored(`Saldo Pengirim: ${balance} MLD`, color.cyan);

  const amountToSend = await askQuestion('Masukkan jumlah token yang akan dikirim ke setiap alamat (dalam note, misalnya 100000000 untuk 100 MLD): ');

  for (const mnemonic of mnemonics) {
    const recipientAddress = await generateAddress(mnemonic);
    printColored(`Mengirim ${amountToSend / 1000000} MLD ke ${recipientAddress}...`, color.cyan);
    await sendTransaction(client, senderAddress, recipientAddress, amountToSend);
  }

  printColored('\nSemua transaksi selesai dengan sukses.', color.green);
};

// Fungsi untuk stake otomatis
const stakeAutomatically = async () => {
  const mnemonicSender = readMnemonicFromEnv();
  const senderWallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonicSender, {
    prefix,
    hdPaths: [makeCosmoshubPath(0)],
  });
  const senderAddress = (await senderWallet.getAccounts())[0].address;

  const client = await SigningStargateClient.connectWithSigner(rpcEndpoint, senderWallet);
  const balance = await getBalance(client, senderAddress);

  printColored(`\nAlamat Pengirim: ${senderAddress}`, color.cyan);
  printColored(`Saldo Pengirim: ${balance} MLD`, color.cyan);

  const validators = await getActiveValidators();
  printColored('\nDaftar Validator Aktif:', color.cyan);
  validators.forEach((validator, index) => {
    printColored(`${index + 1}. ${validator.description.moniker} (${validator.operator_address})`, color.yellow);
  });

  const validatorCount = await askQuestion('Masukkan jumlah validator yang akan digunakan untuk staking: ');
  const selectedValidators = validators.slice(0, validatorCount).map(v => v.operator_address);

  const amountToStake = await askQuestion('Masukkan jumlah token yang akan di-stake ke setiap validator (dalam note, misalnya 100000000 untuk 100 MLD): ');

  for (const validatorAddress of selectedValidators) {
    printColored(`Melakukan staking ${amountToStake / 1000000} MLD ke ${validatorAddress}...`, color.cyan);
    await stakeToValidator(client, senderAddress, validatorAddress, amountToStake);
  }

  printColored('\nSemua staking selesai dengan sukses.', color.green);
};

// Fungsi untuk klaim faucet untuk alamat pengirim dengan proxy
const claimFaucetForSenderWithProxies = async () => {
  const mnemonicSender = readMnemonicFromEnv();
  const senderAddress = await generateAddress(mnemonicSender);

  printColored(`\nMengklaim faucet untuk ${senderAddress} dengan proxy...`, color.cyan);
  await claimFaucetWithProxies(senderAddress);
};

// Fungsi untuk klaim faucet untuk alamat pengirim
const claimFaucetForSender = async () => {
  const mnemonicSender = readMnemonicFromEnv();
  const senderAddress = await generateAddress(mnemonicSender);

  printColored(`\nMengklaim faucet untuk ${senderAddress}...`, color.cyan);
  await claimFaucet(senderAddress);
};

menu();
