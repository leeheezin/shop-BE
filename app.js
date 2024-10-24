const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()

require('dotenv').config()
app.use(cors())
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json()) //req.body객체 인식

const mongoURI = process.env.LOCAL_DB_ADDRESS
mongoose.connect(mongoURI).then(()=>console.log('mongoose connected')).catch((error)=>console.log('db connection fail',error))
app.listen(process.env.PORT || 5001, ()=>{
    console.log('server on')
})
