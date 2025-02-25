module.exports = {
  apps: [{
    name: "musika-backend",
    script: "index.js",
    env_production: {
      NODE_ENV: "production",
      PORT: 5001,
      MONGO_URI: "mongodb://localhost:27017/musika",
      JWT_SECRET: "musika_jwt_secret_2024",
      CORS_ORIGIN: "https://musikazw.com",
      FIREBASE_PROJECT_ID: "musika-ec60d"
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: "logs/err.log",
    out_file: "logs/out.log",
    log_file: "logs/combined.log",
    time: true
  }]
}
