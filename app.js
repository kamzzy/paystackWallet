const express = require('express');
const app = express();
require('dotenv').config();
require('./config/database').connect();
const http = require('http');
const server = http.createServer(app);
const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require("./model/user");
const Wallet = require("./model/wallet");
const WalletTransaction = require("./model/wallet_transaction");
const Transaction = require("./model/transaction");
const path = require('path');
const FormData = require('form-data');
const data = new FormData();
const port = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
    next();
  });

// register
app.post("/register", async (req, res) => {
    try {
        // get user input
        const { first_name,last_name,email,password } = req.body;

        // validate user input
        if(!(email && password && first_name && last_name)) {
            res.status(400).send("All input is required");
            
        }
        // check if user already exist
        // validate if user exists in our db
        const oldUser = await User.findOne({email});

        if(oldUser) {
            return res.status(409).send("User already exist, please login");
        }
        // Encrypt user password
        encryptedPassword = await bcrypt.hash(password, 10)

        // create user in db
        const user = await User.create({
            first_name,
            last_name,
            email: email.toLowerCase(),
            password:encryptedPassword,
        });

        console.log(process.env.TOKEN_KEY);
        // create token
        const token = jwt.sign(
            {user_id: user._id, email},
            `${process.env.TOKEN_KEY}`,
            {
                expiresIn: "2h",
            }
        );
        // save user token
        user.token = token;
        // return new user
        res.status(201).json(user);

    } catch(error) {
        console.log(error);
    }

});
// login
app.post("/login", async (req, res) => {
    try {
        // get user input
        const { email,password } = req.body;
        // validate user input
        if(!(email && password)) {
            res.status(400).send("All input is required");
        }
        // validate if user exists in db
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            // create token
            const token = jwt.sign(
                {user_id:user._d, email},
                `${process.env.TOKEN_KEY}`,
                {
                    expiresIn:"2h",
                }
            );
            // save user token
            user.token = token;
            // user
            res.status(200).json(user);
        }
        res.status(400).send("Invalid credentials");
    }catch(error) {
        console.log(error);
    }

});

app.get("/pay", (req,res) => {
    res.sendFile(path.join(__dirname + "/index.html"));
});
app.post('/pay', async (req,res) => {
    try{
        var data = JSON.stringify({
            "email": 'test@tester.com',
            "amount": '50000',
            "reference": "",
            "callback_url": "http://localhost:3000/response",
          });
          
          var config = {
            method: 'post',
            url: 'https://api.paystack.co/transaction/initialize',
            headers: { 
              'Authorization': process.env.SECRET_KEY, 
              'Content-Type': 'application/json'
            },
            data : data
          };
          
          axios(config)
          .then(function (response) {
           const pay = response.data;
           console.log(pay);
           res.redirect(pay.data.authorization_url);
          })
          .catch(function (error) {
            console.log(error);
          });
    }catch(error) {
        console.log(error);
      };
});

app.get("/response", async (req,res) => {
    try{
        const { reference } = req.query;

  // URL with transaction ID of which will be used to confirm transaction status
  const url = `https://api.paystack.co/transaction/verify/${reference}`;

  // Network call to confirm transaction status
  const response = await axios({
    url,
    method: "get",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `${process.env.SECRET_KEY}`,
    },
  });

  console.log(response.data.data)

//     const { status,currency,id,amount,customer } = response.data.data;
//     // check if customer exists in database
//     const user = await User.findOne({email: customer.email});
//     // check if user has a wallet, else create one
//     const wallet = await validateUserWallet(user._id);
//     // create wallet transaction
//     await createWalletTransaction(user._id, status, currency,amount);
//     // create transaction
//     await createTransaction(user._id, id, status, currency, amount,customer)
    
//     await updateWallet(user._id, amount);

//     return res.status(200).json({
//         response: "wallet funded successfully",
//         data: walllet,
//     });

    } catch(error) {
        console.log(error);
    }
});

// const validateUserWallet = async(userId) => {
//     try{
//         // check if user has a wallet, else create one
//         const userWallet = await Wallet.findOne({userId});
//         if(!userWallet) {
//             // create wallet
//             const wallet = await Wallet.create({
//                 userId,
//             });
//             return wallet;
//         }
//         return userWallet;
//     } catch (error) {
//         console.log(error);
//     }
// };

// // create  wallet transaction
// const createWalletTransaction = async(userId,status, currency, amount) => {
//     try{
//         // create wallet transaction
//         const walletTransaction = await WalletTransaction.create({
//             amount,
//             userId,
//             isInflow: true,
//             currency,
//             status,
//         });
//         return walletTransaction;
//     } catch (error) {
//         console.log(error);
//     }
// };

// // create transaction
// const createTransaction = async (
//     userId,id,status,currency,amount,customer
// ) => {
//     try {
// // create transaction
// const transaction = await Transaction.create({
//     userId,
//     transactionId: id,
//     name: customer.name,
//     email: customer.email,
//     phone: customer.phone,
//     amount,
//     currency,
//     paymentStatus: status,
//     paymentGateway: "paystack",
//      });
//      return transaction;
//   } catch (error){
//       console.log(error);
//   }
// };

// // update wallet

// const updateWallet = async (userId, amount) => {
//     try {
//         // update wallet
//         const wallet = await Wallet.findOneAndUpdate(
//             {userId}, 
//             {$inc: {balance: amount} },
//             {new: true}
//         );
//         return wallet;
//     } catch(error) {
//         console.log(error);
//     }
// };

// app.get("/wallet/:userId/balance", async (req, res) => {
//     try {
//       const { userId } = req.params;
  
//       const wallet = await Wallet.findOne({ userId });
//       // user
//       res.status(200).json(wallet.balance);
//     } catch (err) {
//       console.log(err);
//     }
//   });


// server listening
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});


module.exports = server;