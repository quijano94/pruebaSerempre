const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const md5 = require("md5");
const bodyParser = require("body-parser");
const cors = require('cors')({origin: true});

admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

const app = express();
const main = express();

main.use('/api', app);
main.use(cors);
main.use(bodyParser.json());

exports.apiRest = functions.https.onRequest(main);

app.post('/users', async(req, res) => {
    try {
        const {name, email, password} = req.body;

        if(!name){
            throw new Error('name is empty');
        }

        if(!email){
            throw new Error('email is empty');
        }

        if(!password){
            throw new Error('password is empty');
        }

        const data = {
            name,
            email,
            password: md5(password) 
        }
        const userRef = await db.collection('users').add(data);
        const user = await userRef.get();

        res.json({
            id: userRef.id,
            data: user.data()
        });
    } catch (error) {
       res.status(500).send(error); 
    }
});

app.put('/users/:id', async(req,res) => {
    try {
        const userId = req.params.id;
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;

        if(!userId){
            throw new Error('id is empty');
        }

        const userData = await db.collection('users').doc(userId).get();
        const {name: nameDb, email: emailDb, password: passwordDb} = userData.data();

        const data = {
            name: name ? name : nameDb,
            email: email ? email : emailDb,
            password: password ? md5(password) : passwordDb
        }

        const userRef = await db.collection('users').doc(userId).set(data, {merge: true});
        

        res.json({
            id: userId,
            data
        })

    } catch (error) {
        res.status(500).send(error);
    }
});

app.delete('/users/:id', async(req,res) =>{
    try {
        const userId = req.params.id;
        if(!userId){
            throw new Error('id is empty');
        }
        await db.collection('users').doc(userId).delete();
        res.json({
            id: userId
        })
    } catch (error) {
        res.status(500).send(error);
    }
});

app.post('/users/points/:id', async(req, res) => {
    try {
        const userId = req.params.id;
        const {quantity, reason} = req.body;

        if(!quantity){
            throw new Error('quantity is empty');
        }

        if(!reason){
            throw new Error('reason is empty');
        }


        const data = {
            quantity,
            reason
        }
        const pointUserRef = await db.collection('users').doc(userId).collection('points').add(data);
        const pointUser = await pointUserRef.get();

        res.json({
            id: pointUserRef.id,
            data: pointUser.data()
        });
    } catch (error) {
       res.status(500).send(error); 
    }
});

app.put('/users/points/:idUser/:idPoint', async(req,res) => {
    try {
        const userId = req.params.idUser;
        const userPointId = req.params.idPoint;
        const quantity = req.body.quantity;
        const reason = req.body.reason;

        if(!userId){
            throw new Error('user id is empty');
        }

        if(!userPointId){
            throw new Error('point id is empty');
        }

        const userPointData = await db.collection('users').doc(userId).collection('points').doc(userPointId).get();
        const {quantity: quantityDb, reason: reasonDb} = userPointData.data();

        const data = {
            quantity: quantity ? quantity : quantityDb,
            reason: reason ? reason : reasonDb
        }

        const userPointRef = await db.collection('users').doc(userId).collection('points').doc(userPointId).set(data, {merge: true});
        

        res.json({
            id: userId,
            id: userPointId,
            data
        })

    } catch (error) {
        res.status(500).send(error);
    }
});

app.delete('/users/points/:idUser/:idPoint', async(req,res) => {
    try {
        const userId = req.params.idUser;
        const userPointId = req.params.idPoint;

        if(!userId){
            throw new Error('user id is empty');
        }

        if(!userPointId){
            throw new Error('point id is empty');
        }

        await db.collection('users').doc(userId).collection('points').doc(userPointId).delete();

        res.json({
            id: userId,
            id: userPointId
        })

    } catch (error) {
        res.status(500).send(error);
    }
});


// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
