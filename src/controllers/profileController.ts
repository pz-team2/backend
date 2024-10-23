import { Response, Request } from "express";

const profile = (req: Request, res: Response) => {
    try {
        return res.status(200).json({ message: "Endpoint Profile" });
    } catch (error) {
        console.error(error);
    }
};

export { profile };
