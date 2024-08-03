const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');
const fs = require('fs');
const path = require('path');
const color = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
};

// Fungsi untuk klaim faucet
const claimFaucet = async (address, proxy) => {
  const faucetEndpoint = `https://faucet.ping.pub/symphony/send/${address}`;
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Connection': 'keep-alive',
  };

  try {
    const axiosConfig = {
      headers,
      httpsAgent: proxy ? new HttpsProxyAgent(proxy) : undefined,
    };
    const response = await axios.get(faucetEndpoint, axiosConfig);
    console.log(`${color.green}Klaim faucet berhasil untuk ${address}${color.reset}`);
    console.log(`${color.cyan}Response: ${response.data}${color.reset}`);
  } catch (error) {
    console.log(`${color.red}Gagal klaim faucet: ${error.message}${color.reset}`);
  }
};

// Fungsi untuk mengambil proxy dari URL
const fetchProxies = async () => {
  try {
    const response = await axios.get('https://raw.githubusercontent.com/elliottophellia/yakumo/master/results/http/global/phttp_checked.txt');
    const proxies = response.data.split('\n').map(proxy => proxy.trim()).filter(proxy => proxy);
    return proxies;
  } catch (error) {
    console.log(`${color.red}Gagal mengambil proxy: ${error.message}${color.reset}`);
    return [];
  }
};

// Fungsi untuk klaim faucet dengan menggunakan banyak proxy
const claimFaucetWithProxies = async (address) => {
  const proxies = await fetchProxies();
  if (proxies.length === 0) {
    console.log(`${color.red}Tidak ada proxy yang tersedia.${color.reset}`);
    return;
  }

  for (const proxy of proxies) {
    console.log(`${color.yellow}Menggunakan proxy: ${proxy}${color.reset}`);
    await claimFaucet(address, proxy);
  }
};

module.exports = { claimFaucetWithProxies, claimFaucet };
