import { MongoClient } from 'mongodb';

const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || 21017;
const database = process.env.DB_DATABASE || 'files_manager';

class DBClient {
  constructor() {
    this.client = new MongoClient(`mongodb://${host}:${port}`, { useUnifiedTopology: true });
    this.client.connect();
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    const db = this.client.db(database);
    const numOfUsers = await db.collection('users').countDocuments();
    return numOfUsers;
  }

  async nbFiles() {
    const db = this.client.db(database);
    const numOfFiles = await db.collection('files').countDocuments();
    return numOfFiles;
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
