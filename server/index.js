import express from "express";

const app = express()

app.get('/', (req,res)=>{
    res.send('helloo')
})

app.listen(3000, ()=>{
    console.log("server runnnign on port 3000");
    
})