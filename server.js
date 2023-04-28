const express = require('express')
const app = express()
const dotenv = require('dotenv')
const connectDB = require('./db/connectDB')
const userRoutes = require('./router/router')
const cors = require('cors')

dotenv.config()

app.use(express.json());
app.use(cors());

const port = process.env.port


app.get('/', (req,res)=>{
    res.send('hello world')
})

app.use('/api' , userRoutes)

const startServer = async ()=>{
    try{
        await connectDB(process.env.dbURI)
        console.log('connected with database');

        app.listen(port , ()=>{
            console.log(`server started at ${port}`);
        })
    }
    catch(error){
        console.log(error);
    }
}


startServer()