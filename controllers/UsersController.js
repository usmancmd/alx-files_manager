import sha1 from 'sha1';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import { ObjectID } from 'mongodb';

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    // Check if email already exists
    const existingUser = await dbClient.client
      .db(dbClient.DB_DATABASE)
      .collection('users')
      .findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: 'Already exist' });
    }

    // Hash the password using SHA1
    const hashedPassword = sha1(password);

    // Create a new user object
    const newUser = {
      email,
      password: hashedPassword,
    };

    const result = await dbClient.client
      .db(dbClient.DB_DATABASE)
      .collection('users')
      .insertOne(newUser);

    // Return the new user with only the email and id
    return res.status(201).json({
      id: result.insertedId,
      email: newUser.email,
    });
  }

  static async getMe(req, res) {
    const token = req.header('X-Token');

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await redisClient.get(`auth_${token}`);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const objectId = new ObjectID(userId)
    const user = await dbClient.client
      .db(dbClient.database)
      .collection('users')
      .findOne({ _id: objectId });

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Return the user object with only the email and id
    return res.status(200).json({
      id: user._id,
      email: user.email,
    });
  }
}

export default UsersController;
