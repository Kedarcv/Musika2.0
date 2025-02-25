const pm2 = require('pm2');

pm2.connect(function(err) {
  if (err) {
    console.error(err);
    process.exit(2);
  }

  pm2.start({
    script: 'index.js',
    name: 'musika-backend',
    env: {
      NODE_ENV: 'production',
      PORT: 5001,
      MONGO_URI: process.env.MONGO_URI,
      JWT_SECRET: process.env.JWT_SECRET,
      CORS_ORIGIN: 'https://musikazw.com'
    },
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    log_file: 'logs/combined.log',
    time: true
  }, function(err, apps) {
    if (err) {
      console.error('Error starting PM2:', err);
      return pm2.disconnect();
    }

    pm2.launchBus((err, bus) => {
      console.log('PM2 and application successfully started');
    });
  });
});
