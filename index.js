const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

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
        const paymentsCollection = client.db('car-finder').collection('payments');
        //api created for data loading based on category
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
        //api for get all cars data
        app.get('/cars', async (req, res) => {
            const { type, gearBox, engine, conditionType, minResalePrice, maxResalePrice, minYear, maxYear, page = 1, limit = 10 } = req.query;
        
            let query = {};
        
            // Filtering by type
            if (type) {
                query.type = type;
            }
        
            // Filtering by gearBox
            if (gearBox) {
                query.gearBox = gearBox;
            }
        
            // Filtering by engine type
            if (engine) {
                query.engine = engine;
            }
        
            // Filtering by condition type
            if (conditionType) {
                query.conditionType = conditionType;
            }
        
            // Filtering by resale price range
            if (minResalePrice || maxResalePrice) {
                query.resalePrice = {};
                if (minResalePrice) query.resalePrice.$gte = parseInt(minResalePrice);
                if (maxResalePrice) query.resalePrice.$lte = parseInt(maxResalePrice);
            }
        
            // Filtering by year of purchase range
            if (minYear || maxYear) {
                query.yearOfPurchase = {};
                if (minYear) query.yearOfPurchase.$gte = parseInt(minYear);
                if (maxYear) query.yearOfPurchase.$lte = parseInt(maxYear);
            }

            // Pagination
    const options = {
        skip: (parseInt(page) - 1) * parseInt(limit), // Skips documents to get the correct page
        limit: parseInt(limit), // Limits the number of documents returned
    };
        
            try {
                const cars = await carCollections.find(query).skip(options.skip).limit(options.limit).toArray();
                const totalCars = await carCollections.countDocuments(query);
                res.send({ cars, totalCars, currentPage: parseInt(page), totalPages: Math.ceil(totalCars / parseInt(limit)) });
            } catch (error) {
                res.status(500).send({ message: "Failed to retrieve cars", error });
            }
        });
        

        //items posted on db via server by sellers
        app.post('/cars', async (req, res) => {
            const product = req.body;
            const newProduct = await carCollections.insertOne(product);
            res.send(newProduct);
        })
        //get cars by engine type
        app.get('/cars/engine/:engine', async (req, res) => {
            const engine = req.params.engine;
            const query = { engine };
            const cars = await carCollections.find(query).toArray();
            res.send(cars);
        })
        //api created for latest data by sort method and data limit to 4
        app.get('/latest', async (req, res) => {
            const query = {};
            const cursor = carCollections.find(query).sort({ date: -1 });
            const latestItems = await cursor.limit(4).toArray();
            res.send(latestItems);
        })
        // product information updated through put method..advertize property set on products by seller
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
        // get car by id
        app.get('/cars/item/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await carCollections.findOne(query);
            res.send(result);
        })
        //data api created for advertize item sorting by advertize property in product
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
        app.get('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await bookingCollection.findOne(query);
            res.send(result);
        })

        app.get('/users', async (req, res) => {
            const query = {};
            const users = await userCollections.find(query).toArray();
            res.send(users);
        });
        app.get('/verified', async (req, res) => {
            const sellerEmail = req.query.email;
            const query = { email: sellerEmail };
            const seller = await userCollections.findOne(query);
            res.send(seller);
        })
        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await userCollections.deleteOne(query);
            res.send(result);
        })
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
        //data api created for single seller with email
        app.get('/users/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const seller = await userCollections.findOne(query);
            res.send({ isSeller: seller?.userType == "I am a Seller" });
        })
        //data api created for single buyer with email
        app.get('/users/buyer/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const buyer = await userCollections.findOne(query);
            res.send({ isBuyer: buyer?.userType == "I am a Buyer" });
        })
        //data api created for single admin with email
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const admin = await userCollections.findOne(query);
            res.send({ isAdmin: admin?.userType == "admin" });
        })
        //admin updating the seller status and set property in seller info database
        app.put('/users/verify/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const status = req.body;
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    status: status.verify
                }
            }
            const result = await userCollections.updateOne(filter, updatedDoc, options);
            res.send(result);
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
        }),
            //payment information getting from client and give him a secrect code
            app.post('/create-payment-intent', async (req, res) => {
                const booking = req.body;
                const price = booking.price;
                const amount = price * 100;

                const paymentIntent = await stripe.paymentIntents.create({
                    currency: 'usd',
                    amount: amount,
                    "payment_method_types": [
                        "card"
                    ]
                });
                res.send({
                    clientSecret: paymentIntent.client_secret,
                })
                // payment information and payer information set on database
                app.post('/payments', async (req, res) => {
                    const payment = req.body;
                    const result = await paymentsCollection.insertOne(payment);
                    const id = payment.bookingId
                    const filter = { _id: ObjectId(id) }
                    const updatedDoc = {
                        $set: {
                            paid: true,
                            transactionId: payment.transactionId
                        }
                    }
                    const updatedResult = await bookingCollection.updateOne(filter, updatedDoc)
                    res.send(result);
                })
                    ;
            });
        ;

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


