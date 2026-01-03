// app/config.js
const config = {
  // --- SETTING PAKASIR ---
  pakasir: {
    // API Key diambil dari file lama kamu
    secret: 'xmCaAM7PILQ1qU3nQ2q3T58r7m8UXOCM', 
    // Nama project di Pakasir
    project: 'arthurxyz-studios', 
    url: 'https://app.pakasir.com/api/transactioncreate/qris'
  },

  // --- SETTING PTERODACTYL ---
  pterodactyl: {
    // URL Panel (Tanpa garis miring di belakang)
    host: 'https://cp.athon.my.id', 
    // API Key Application (PLTA)
    key: 'ptla_bC8ick9hsNMAK1Equ1PW9gnOg6aetRTUIn4r9DbdCp6', 
  },

  // --- SETTING APLIKASI ---
  app: {
    // Domain tempat web ini dihosting (dipakai buat redirect nanti)
    baseUrl: 'https://aa-store-black.vercel.app' 
  }
};

export default config;
