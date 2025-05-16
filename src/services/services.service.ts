import { callAyinlakApi, generateUniqueId, getDataOrCableNetworkProviders, getDataOrCablePlans, Networks, Plans } from "../utils"
import { BuyAirtime, BuyAirtimeRequest, BuyData, BuyDataRequest, BuyElectricity, BuyElectricityRequest, GetDataOrCable, Provider, ServiceCategory, SubscribeCable, SubscribeCableRequest } from "../types"
import { initializePayment } from "../utils/paystack";
import userService from "./user.service";

export class ServicesService {
    getServicesAndProviders(query: { withProviders?: boolean, category?: string }) {
        const { withProviders, category } = query
        let data: string[] | GetDataOrCable[] = getDataOrCableNetworkProviders(category as string | undefined as ServiceCategory);

        if (!withProviders) {
            console.log({ withProviders });
            data = (data as GetDataOrCable[]).map((cat) => cat.category)
        }

        return {
            message: "There You Go",
            success: true,
            data
        }
    }

    getPlans(category: any, provider: any) {
        const data = getDataOrCablePlans(category, provider)

        return {
            success: true,
            message: "You have successfully revealed our plans.",
            data
        }
    }
    
    async buyData(user: any, payload: BuyDataRequest) {
        try {
            // structure request payload for purchase
            const { network, plan } = payload
            const data: BuyData = { ...payload, Ported_number: true }

            const networkExists = Networks.airtime.filter(n => n.name === network)
            if (networkExists.length === 0)
                return { success: false, message: "Biller does not exist", data: null }

            const dataplan = Plans.data[network].filter(p => p.id === plan)[0]
            if (!dataplan)
                return { success: false, message: "Data plan does not exist", data: null }

            // find user: check balance and other conditions 
            const isExistingUser = await userService.findUserByEmail(user.email)
            if (!isExistingUser)
                return { success: false, message: "User does not exist", data: null }

            //  charge via paystack
            const ref = generateUniqueId()
            const { } = await initializePayment(isExistingUser.email, dataplan.payable_amount!, ref)

            // subscribe on ayinlak
            const { } = await callAyinlakApi("/data", "post", data)

            // handle ayinlak failure and retry

            // send success response
            return { success: true, message: "Data purchase successful.", data: {} }
        } catch (e) {
            // send failure response
            console.error("There was an error purchasing data.", { e })
            return { success: false, message: "There was an error purchasing data.", data: null }
        }
    }

    async confirmDataPurchase(id: string) {
        try {
            // confirm on ayinlak
            const { } = await callAyinlakApi(`/data/${id}`, "get")

            // handle ayinlak failure and retry

        } catch (e) {
            // send failure response
            console.error("There was an error confirming your data purchase.", { e })
            return { success: false, message: "There was an error confirming your data purchase.", data: null }
        }
    }

    async buyAirtime(user: any, payload: BuyAirtimeRequest) {
        try {
            // structure request payload for purchase
            const { amount, network } = payload
            const data: BuyAirtime = { ...payload, Ported_number: true, airtime_type: "VTU" }

            const networkExists = Networks.airtime.filter(n => n.name === network)
            if (networkExists.length === 0)
                return { success: false, message: "Biller does not exist", data: null }

            // find user: check other conditions 
            const isExistingUser = await userService.findUserByEmail(user.email)
            if (!isExistingUser)
                return { success: false, message: "User does not exist", data: null }

            //  charge via paystack
            const ref = generateUniqueId()
            const { } = await initializePayment(isExistingUser.email, amount!, ref)

            // subscribe on ayinlak
            const { } = await callAyinlakApi("/topup", "post", data)

            // handle ayinlak failure and retry

            // send success response
            return { success: true, message: "Airtime purchase successful.", data: {} }
        } catch (e) {
            // send failure response
            console.error("There was an error purchasing airtime.", { e })
            return { success: false, message: "There was an error purchasing airtime.", data: null }
        }
    }

    async confirmAirtimeTopUp(id: string) {
        try {
            // confirm on ayinlak
            const { } = await callAyinlakApi(`/topup/${id}`, "get")

            // handle ayinlak failure and retry

        } catch (e) {
            // send failure response
            console.error("There was an error confirming your airtime purchase.", { e })
            return { success: false, message: "There was an error confirming your airtime purchase.", data: null }
        }
    }
    
    async buyElectricity(user: any, payload: BuyElectricityRequest) {
        try {
            // structure request payload for purchase
            const { meter_number, disco_name, meter_type, amount } = payload

            const discoExists = Networks.electricity.filter(n => n.name === disco_name)
            if (discoExists.length === 0)
                return { success: false, message: "Biller does not exist", data: null }

            const MeterType = meter_type === "prepaid" ? 1 : 2
            const data: BuyElectricity = { ...payload, MeterType }

            // validate iuc number
            const res_ = await callAyinlakApi(`/validatemeter?meternumber=${meter_number}&disconame=${disco_name}&mtype=${MeterType}`, "get")
            if (!res_.ok)
                return { success: false, message: "Invalid Meter number", data: null }

            // find user: check balance and other conditions 
            const isExistingUser = await userService.findUserByEmail(user.email)
            if (!isExistingUser)
                return { success: false, message: "User does not exist", data: null }

            //  charge via paystack
            const ref = generateUniqueId()
            const { } = await initializePayment(isExistingUser.email, amount!, ref)

            // subscribe on ayinlak
            const { } = await callAyinlakApi("/billpayment", "post", data)

            // handle ayinlak failure and retry

            // send success response
            return { success: true, message: "Electricity recharge successful.", data: {} }
        } catch (e) {
            // send failure response
            console.error("There was an error recharging electricity.", { e })
            return { success: false, message: "There was an error recharging electricity.", data: null }
        }
    }

    async confirmElectricityRecharge(id: string) {
        try {
            // confirm on ayinlak
            const { } = await callAyinlakApi(`/billayment/${id}`, "get")

            // handle ayinlak failure and retry

        } catch (e) {
            // send failure response
            console.error("There was an error confirming your electricity purchase.", { e })
            return { success: false, message: "There was an error confirming your electricity purchase.", data: null }
        }
    }
    
    async payForCable(user: any, payload: SubscribeCableRequest) {
        try {
            // structure request payload for purchase
            const { smart_card_number, cablename, cableplan, amount } = payload

            const data: SubscribeCable = { ...payload }

            // validate iuc number
            const res_ = await callAyinlakApi(`/validateiuc?smart_card_number=${smart_card_number}&cablename=${cablename}`, "get")
            if (!res_.ok)
                return { success: false, message: "Invalid IUC number", data: null }

            const planExists = Plans.cable[cablename].filter(n => n.name === cableplan)[0]
            if (!planExists)
                return { success: false, message: "Plan does not exist", data: null }

            if (amount !== planExists.payable_amount)
                return { success: false, message: `Please enter exactly ${planExists.payable_amount} naira`, data: null }

            // find user: check balance and other conditions 
            const isExistingUser = await userService.findUserByEmail(user.email)
            if (!isExistingUser)
                return { success: false, message: "User does not exist", data: null }

            //  charge via paystack
            const ref = generateUniqueId()
            const { } = await initializePayment(isExistingUser.email, planExists.payable_amount!, ref)

            // subscribe on ayinlak
            const { } = await callAyinlakApi("/cablesub", "post", data)

            // handle ayinlak failure and retry

            // send success response
            return { success: true, message: "Cable subscription successful.", data: {} }
        } catch (e) {
            // send failure response
            console.error("There was an error subscribing your cable.", { e })
            return { success: false, message: "There was an error subscribing your cable.", data: null }
        }
    }

    async confirmCableSub(id: string) {
        try {
            // confirm on ayinlak
            const { } = await callAyinlakApi(`cablesub/${id}`, "get")

            // handle ayinlak failure and retry

        } catch (e) {
            // send failure response
            console.error("There was an error confirming your cable subscription.", { e })
            return { success: false, message: "There was an error your cable subscription.", data: null }
        }
    }
}

export default new ServicesService()