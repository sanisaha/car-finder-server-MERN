const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const bookingCollection = client.db('car-finder').collection('bookings');
        const bookedItemCollection = client.db('car-finder').collection('bookedItems');

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
        app.post('/cars', async (req, res) => {
            const product = req.body;
            const newProduct = await carCollections.insertOne(product);
            res.send(newProduct);
        })
        app.get('/latest', async (req, res) => {
            const query = {};
            const cursor = carCollections.find(query).sort({ date: -1 });
            const latestItems = await cursor.limit(4).toArray();
            res.send(latestItems);
        })
        app.put('/cars/item/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const action = req.body;
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    action: action.advertize
                }
            }
            const result = await carCollections.updateOne(filter, updatedDoc, options);
            res.send(result);
        })
        app.get('/advertize', async (req, res) => {
            const query = { action: 'advertize' };
            const cars = await carCollections.find(query).toArray();
            res.send(cars);
        })
        app.post('/bookedItems', async (req, res) => {
            const bookedItem = req.body;
            const result = await bookedItemCollection.insertOne(bookedItem);
            res.send(result);
        })
        app.delete('/cars/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await carCollections.deleteOne(query);
            res.send(result);
        })
        app.get('/cars/:email', async (req, res) => {
            const email = req.params.email;
            const query = { sellerEmail: email };
            const myProducts = await carCollections.find(query).toArray();
            res.send(myProducts);
        })
        app.get('/bookedItems/:email', async (req, res) => {
            const email = req.params.email;
            const query = { sellerEmail: email };
            const myProducts = await bookedItemCollection.find(query).toArray();
            res.send(myProducts);
        })
        app.delete('/bookedItems/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await bookedItemCollection.deleteOne(query);
            res.send(result);
        })
        app.post('/users', async (req, res) => {
            const user = req.body;
            const newUser = await userCollections.insertOne(user);
            res.send(newUser);
        })
        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            const newBooking = await bookingCollection.insertOne(booking);
            res.send(newBooking);
        })
        app.get('/bookings', async (req, res) => {
            const userEmail = req.query.email;
            const query = { email: userEmail };
            const userBookings = await bookingCollection.find(query).toArray();
            res.send(userBookings);
        })
        app.get('/users', async (req, res) => {
            const query = {};
            const users = await userCollections.find(query).toArray();
            res.send(users);
        });
        app.get('/buyers', async (req, res) => {
            const query = { userType: 'I am a Buyer' };
            const users = await userCollections.find(query).toArray();
            res.send(users);
        });
        app.get('/sellers', async (req, res) => {
            const query = { userType: 'I am a Seller' };
            const users = await userCollections.find(query).toArray();
            res.send(users);
        });
        app.get('/users/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const seller = await userCollections.findOne(query);
            res.send({ isSeller: seller?.userType == "I am a Seller" });
        })
        app.get('/users/buyer/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const buyer = await userCollections.findOne(query);
            res.send({ isBuyer: buyer?.userType == "I am a Buyer" });
        })
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const admin = await userCollections.findOne(query);
            res.send({ isAdmin: admin?.userType == "admin" });
        })
        app.put('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const userType = req.body;
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    userType: userType.admin
                }
            }
            const result = await userCollections.updateOne(filter, updatedDoc, options);
            res.send(result);
        });

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


