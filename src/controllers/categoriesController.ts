import { Request, RequestHandler, Response } from "express";
import apiResponse from "../utils/apiResource";
import Category from "../models/Category";


export const dataCategories: RequestHandler = async (req: Request, res: Response) => {
    try {
        const data = await Category.find()
        res.status(200).json(apiResponse(true, 'Data Categories', { data }))
    } catch (error) {
        res.status(401).json(apiResponse(false, 'Data Tidak Di Temukan'))
    }
}

export const tambahCategories: RequestHandler = async (req: Request, res: Response) => {


    const { name, description } = req.body

    try {

        const tambah = new Category({
            name, description
        })

        await tambah.save()

        res.status(201).json(apiResponse(true, 'Data Categories Di Tambahkan', {tambah}))

    } catch (error) {
        res.status(401).json(apiResponse(false, 'Data Categories Tidak Berhasil Di Tambahkan'))

    }
}
