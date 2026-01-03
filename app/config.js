const config = {
  // --- SETTING PAKASIR ---
  pakasir: {
    // Masukin API Key Pakasir lu di dalem kutip '...'
    secret: 'xmCaAM7PILQ1qU3nQ2q3T58r7m8UXOCM', 
    url: 'https://app.pakasir.com/api/transactioncreate'
  },

  // --- SETTING PTERODACTYL ---
  pterodactyl: {
    // URL Panel (Contoh: https://panel.domaingw.com) - JANGAN PAKE SLASH DI BELAKANG
    host: 'ptla_bC8ick9hsNMAK1Equ1PW9gnOg6aetRTUIn4r9DbdCp6', 
    
    // API Key Application (ptla_...)
    key: 'ptla_bC8ick9hsNMAK1Equ1PW9gnOg6aetRTUIn4r9DbdCp6', 
  },

  // --- SETTING DOMAIN VERCEL ---
  app: {
    // Masukin domain Vercel lu biar redirect-nya bener
    // Contoh: 'https://toko-panel-gw.vercel.app'
    baseUrl: 'https://aa-store-black.vercel.app' 
  }
};

export default config;
