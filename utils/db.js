import { MongoClient } from 'mongodb';

// const host = process.env.DB_HOST || 'localhost';
// const port = process.env.DB_PORT || 21017;
// const database = process.env.DB_DATABASE || 'files_manager';

class DBClient {
  constructor() {
    const {
      DB_HOST = 'localhost',
      DB_PORT = 27017,
      DB_DATABASE = 'files_manager',
    } = process.env;
    this.client = new MongoClient(`mongodb://${DB_HOST}:${DB_PORT}/${DB_DATABASE}`,
      { useUnifiedTopology: true });
    this.connect();
  }

  async connect() {
    try {
      await this.client.connect();
    } catch (error) {
      console.error(`Error connecting to MongoDB: ${error.message}`);
    }
  }

  isAlive() {
    return Boolean(this.client.topology.isConnected());
  }

  async nbUsers() {
    const db = this.client.db(dbClient.DB_DATABASE);
    const numOfUsers = await db.collection('users').countDocuments();
    return numOfUsers;
  }

  async nbFiles() {
    const db = this.client.db(dbClient.DB_DATABASE);
    const numOfFiles = await db.collection('files').countDocuments();
    return numOfFiles;
  }

  async getFileById() {
    try {
      const db = await this.client.db(dbClient.DB_DATABASE);
      const files = await db.collection('files');
      const file = await files.findOne({ _id: ObjectId(id) });
      return file;
    } catch (error) {
      console.error('Error retrieving file by ID:', error);
      throw error;
    }
  }
}

const dbClient = new DBClient();
dbClient.connect();
export default dbClient;
