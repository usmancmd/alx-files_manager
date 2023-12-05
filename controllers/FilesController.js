import redisClient from '../utils/redis';
import dbClient from '../utils/db';
import { ObjectID } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises'

class FilesController {
    static async postUpload(req, res) {
        const token = req.header('X-Token')

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
            .findOne({ _id: objectId })
        
        const { name, type, parentId, isPublic = isPublic || false, data } = req.body;
        // const { name } = req.body;
        // const { type } = req.body;
        // const { parentId } = req.body;
        // const isPublic = req.body.isPublic || false;
        // const { data } = req.body;
        
        if (!name) {
            return res.status(400).send('Missing name');
        }
        
        if (!type) {
            console.log("f1111111111")
            return res.status(400).send('Missing type');
        }

        if (!data && type !== 'folder') {
            console.log("f22222222222")
            return res.status(400).send('Missing data')
        }

        if (parentId) {
            const objectId = new ObjectID(parentId)
            const file = await dbClient.client
                .db(dbClient.database)
                .collection('files')
                .findOne({ _id: objectId, userId: user._id})
            if (!file) {
                return res.status(400).send('Parent not found')
            }

            if (file.type !== 'folder') {
                return res.status(400).send('Parent is not a folder')
            }
        }

        const files = dbClient.client.db(dbClient.database).collection('files');
        if (type === 'folder') {
            files.insertOne(
                {
                    userId: user._id,
                    name,
                    type,
                    isPublic,
                    parentId: parentId || 0,
                }
            ).then((result) => {
                res.status(201).json({
                    id: result.insertedId,
                    userId: user._id,
                    name,
                    type,
                    isPublic,
                    parentId: parentId || 0,
                })
            }).catch((error) => {
                console.log(error)
            })
        } else {
            const filePath = process.env.FOLDER_PATH || '/tmp/files_manager';
            const fileName = `${filePath}/${uuidv4()}`;
            const buffer = Buffer.from(data, 'base64');
            try {
                try {
                    await fs.mkdir(filePath);
                } catch (error) {
                    // console.log('Error from mkdir', error);
                }
                await fs.writeFile(fileName, buffer, 'utf-8');
            } catch (error) {
                console.log('Error from writeFile', error);
            }
            files.insertOne(
                {
                    userId: user._id,
                    name,
                    type,
                    isPublic,
                    parentId: parentId || 0,
                    localPath: fileName
                }
            ).then((result) => {
                res.status(201).json({
                    id: result.insertedId,
                    userId: user._id,
                    name,
                    type,
                    isPublic,
                    parentId: parentId || 0,
                })
            })
        }

    }
}

export default FilesController;