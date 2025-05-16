import { Request, Response } from "express"
import { serviceService } from "../services"
import { parseBoolean, sendErrorResponse, sendSuccessResponse } from "../utils"
import { Provider } from "../types"

export class ServicesController {
    fetchOurServices(req: Request, res: Response) {
        try {
            const query = { ...req.query, withProviders: parseBoolean(req.query.withProviders) }
            const response = serviceService.getServicesAndProviders(query)

            sendSuccessResponse(res, response.message, response.data, 200)
        } catch (error) {
            sendErrorResponse(res, "There was a problem getting services", error, 500)
        }
    }

    fetchOurPlans(req: Request, res: Response) {
        try {
            const { category } = req.params
            const { provider } = req.query
            
            const response = serviceService.getPlans(category, provider)

            sendSuccessResponse(res, response.message, response.data, 200)
        } catch (error) {
            sendErrorResponse(res, "There was a problem getting services", error, 500)
        }
    }

    async purchaseData(req: Request, res: Response) {
        try {
            const payload = req.body
            const user = req.user
            
            const response = await serviceService.buyData(user, payload)

            sendSuccessResponse(res, response.message, response.data, 200)
        } catch (error) {
            sendErrorResponse(res, "There was a problem getting services", error, 500)
        }
    }

    async topUpAirtime(req: Request, res: Response) {
        try {
            const payload = req.body
            const user = req.user
            
            const response = await serviceService.buyAirtime(user, payload)

            sendSuccessResponse(res, response.message, response.data, 200)
        } catch (error) {
            sendErrorResponse(res, "There was a problem getting services", error, 500)
        }
    }

    async rechargeElectricity(req: Request, res: Response) {
        try {
            const payload = req.body
            const user = req.user
            
            const response = await serviceService.buyElectricity(user, payload)

            sendSuccessResponse(res, response.message, response.data, 200)
        } catch (error) {
            sendErrorResponse(res, "There was a problem getting services", error, 500)
        }
    }

    async subscribeCable(req: Request, res: Response) {
        try {
            const payload = req.body
            const user = req.user
            
            const response = await serviceService.payForCable(user, payload)

            sendSuccessResponse(res, response.message, response.data, 200)
        } catch (error) {
            sendErrorResponse(res, "There was a problem getting services", error, 500)
        }
    }
}

export default new ServicesController()