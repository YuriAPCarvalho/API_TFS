import { NextApiRequest, NextApiResponse } from "next";
import { backendURL } from "@/app/config"
import axios from "axios";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {   
    console.log(req.body);
    console.log("teste");
    
    // const response = await axios.post(
        
    // )        
    // res.status(response.status).json(await response.json())
}