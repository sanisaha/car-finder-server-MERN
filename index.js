const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

app.use(cors());
app.use(express.json());

const db_user = process.env.DB_USER;
const db_password = process.env.DB_PASSWORD

const uri = `mongodb+srv://${db_user}:${db_password}@cluster0.uzyhqeg.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const carCollections = client.db('car-finder').collection('cars');
        const userCollections = client.db('car-finder').collection('users');

        app.get('/category/:id', async (req, res) => {
            const id = req.params.id;
            const query = {
                "$or": [
                    { gearBox: { $regex: id } },
                    { type: { $regex: id } },
                    { engine: { $regex: id } }
                ]
            }
            const result = await carCollections.find(query).toArray();
            res.send(result);

        })
        app.post('/users', async (req, res) => {
            const user = req.body;
            const newUser = await userCollections.insertOne(user);
            res.send(result);
        })

    }
    finally {

    }
}
run().catch(e => console.error(e));
app.get('/', (req, res) => {
    res.send('car-finder running on server')
})
app.listen(port, () => {
    console.log(`car-finder running properly on ${port}`)
})


