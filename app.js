const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')
const indexRouter = require('./routes/index')
const app = express()

require('dotenv').config()
app.use(cors())
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json()) //req.body객체 인식
app.use('/api',indexRouter)

const mongoURI = process.env.LOCAL_DB_ADDRESS
const MongoConnect = async () => {
    try {
        await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });
        console.log('Mongoose connected');
        } catch (error) {
        console.error('DB connection failed:', error);
        }
    };
MongoConnect()
app.listen(process.env.PORT || 5001, ()=>{
    console.log('server on 5001')
})
