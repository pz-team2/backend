import { Request, Response } from "express";
import Event from "../models/Event";
import apiResponse from "../utils/apiResource";



export const tambahEvent = async(req:Request, res:Response) => {

    try{

        const  {title,quota, price, startTime, finishTime, date, address, status, description, organizer, picture, category} = req.body;

        // const picture = req.file ? req.file.path: '';
        // console.log(picture)

        const Events = new Event({
            title,
            quota, 
            price, 
            startTime, 
            finishTime, 
            picture, 
            date, 
            address, 
            status,
            description,
            category,
            organizer
        });
        console.log(Events)
        await Events.save();

        res.status(200).json(apiResponse(true, 'Berhasil Menambahkan Data', {Events}))

    }catch(error){
        console.log(error)
        res.status(500).json(apiResponse(false, 'Berhasil Menambahkan Data', {error}))

    }

}