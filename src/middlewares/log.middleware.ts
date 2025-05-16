import { NextFunction, Request, Response } from "express"

export const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const { body, query, params} = req
    console.log("Request Dets:", {body, query, params})
    next()
}