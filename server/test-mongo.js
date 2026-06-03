const { MongoClient } = require('mongodb');

// Enable MongoDB driver debugging
const util = require('util');
console.log('--- MongoDB Driver Debug Mode ---');
process.env.MONGODB_DEBUG = 'true';

const uriDirect = 'mongodb://yohad50050_db_user:AWEhJsQwBbQcPYLY@ac-kfuttkz-shard-00-00.0xtoo4r.mongodb.net:27017,ac-kfuttkz-shard-00-01.0xtoo4r.mongodb.net:27017,ac-kfuttkz-shard-00-02.0xtoo4r.mongodb.net:27017/bridgebot?ssl=true&replicaSet=atlas-11hkp0-shard-0&authSource=admin&retryWrites=true&w=majority';

async function run() {
  console.log('Connecting...');
  const client = new MongoClient(uriDirect, { 
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
    socketTimeoutMS: 5000,
  });

  // Listen to connection events
  client.on('serverHeartbeatStarted', event => console.log('Ping:', event.connectionId));
  client.on('serverHeartbeatSucceeded', event => console.log('Pong (Success):', event.connectionId));
  client.on('serverHeartbeatFailed', event => console.log('Pong (Failed):', event.connectionId, event.failure.message));
  
  try {
    await client.connect();
    console.log('✅ SUCCESS! Connected to DB!');
    await client.db('admin').command({ ping: 1 });
    console.log('✅ PING SUCCESSFUL!');
  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error);
  } finally {
    await client.close();
  }
}

run();
