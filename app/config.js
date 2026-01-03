// app/config.js
const config = {
  // --- SETTING PAKASIR ---
  pakasir: {
    secret: 'xmCaAM7PILQ1qU3nQ2q3T58r7m8UXOCM', 
    project: 'arthurxyz-studios', 
    url: 'https://app.pakasir.com/api/transactioncreate/qris',
    merchant_name: 'Athon Hosting', // Tambahan dari bot
    qris_name: 'ATHON-HOSTING'      // Tambahan dari bot
  },

  // --- SETTING PTERODACTYL ---
  pterodactyl: {
    host: 'https://cp.athon.my.id', 
    key: 'ptla_bC8ick9hsNMAK1Equ1PW9gnOg6aetRTUIn4r9DbdCp6', 
    
    // --- SETTING KHUSUS MINECRAFT (DARI BOT) ---
    // Pastikan ID EGG dan NEST ini benar di panel kamu untuk Minecraft
    egg_id: 1,      // Biasanya ID 1 itu Minecraft Java (Cek di panel admin > Nests)
    nest_id: 1,     // Biasanya ID 1 itu Minecraft
    location_id: 1, // Lokasi server (Node)
    
    // Docker Image untuk Java/Minecraft
    docker_image: "ghcr.io/pterodactyl/yolks:java_17", 
    // Startup Command Minecraft
    startup: "java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar server.jar nogui"
  },

  app: {
    baseUrl: 'https://aa-store-black.vercel.app' 
  },
  
  // Produk (Disamakan dengan bot)
  products: {
    basic: { name: 'Minecraft Basic', ram: 2048, cpu: 100, disk: 5120, price: 10000 },
    premium: { name: 'Minecraft Premium', ram: 4096, cpu: 200, disk: 10240, price: 25000 },
    sultan: { name: 'Minecraft Sultan', ram: 8192, cpu: 400, disk: 25600, price: 50000 }
  }
};

export default config;
