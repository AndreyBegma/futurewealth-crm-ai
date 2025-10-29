import { Router } from "express";

const v1Router = Router() 

v1Router.get('/', (req,res) => { 
    res.status(200).json({
        message: "Server is running",
    })
})


export default v1Router