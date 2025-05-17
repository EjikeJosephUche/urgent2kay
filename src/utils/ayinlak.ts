import config from '../config/config';
import { BuyAirtime, BuyData, SubscribeCable, BuyElectricity } from '../types/service';
import { apiRequest } from './apiRequest';

const { AYINLAK_AUTH_TOKEN, AYINLAK_BASE_URL } = config

if (!AYINLAK_BASE_URL)
    throw new Error("Base URL must be specified in the environment variables.");

let conf = {
    baseURL: AYINLAK_BASE_URL,
    withCredentials: true,
    headers: {
        'Authorization': `Token  ${AYINLAK_AUTH_TOKEN}`,
        'Content-Type': 'application/json'
    }
}

// Define the available HTTP methods
type HttpMethod = "get" | "post" | "patch" | "delete" | "put";

export const callAyinlakApi = async (
    route: string,
    method: HttpMethod,
    data?: BuyAirtime | BuyData | BuyElectricity | SubscribeCable) => {
    return await apiRequest(route, method, data, conf)
}