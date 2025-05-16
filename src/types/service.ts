export type ServiceCategory = "cable" | "data" | "airtime" | "electricity"

export type Provider = "DSTV" | "GOTV" | "STARTIME" | "MTN" | "GLO" | "9MOBILE" | "AIRTEL"

export type DataProviders = "MTN" | "GLO" | "9MOBILE" | "AIRTEL"

export type CableProviders = "DSTV" | "GOTV" | "STARTIME";

export type PlanCategory = "cable" | "data"

export type BuyElectricityRequest = { 
    disco_name: string;
    amount: number;
    meter_number: number;
    meter_type: "prepaid" | "postpaid"; 
}

export type BuyElectricity = Omit<BuyElectricityRequest, "meter_type"> &{ 
    MeterType: 1 | 2; // (PREPAID:1, POSTAID:2) 
}

export type BuyDataRequest = { 
    network: string;
    mobile_number: number;
    plan: number;
    amount: number;
}

export type BuyData = Omit<BuyDataRequest, "amount"> &{ 
    Ported_number: boolean;
}

export type BuyAirtimeRequest = { 
    network: string;
    amount: number;
    mobile_number: number;
}

export type BuyAirtime = BuyAirtimeRequest & { 
    Ported_number: true;
    airtime_type: "VTU"
}

export type SubscribeCableRequest = { 
    cablename: string;
    cableplan: string;
    smart_card_number: number;
    amount: number;
}

export type Plan = {
    id: number,
    network: string,
    plan_type: string,
    size: string,
    validity: string,
    amount: number,
    payable_amount: number
   name: string
}

export type SubscribeCable = Omit<SubscribeCableRequest, "amount">

export type GetDataProvider = {
    id: number,
    category: string,
    name: string
}

export type GetDataOrCable = {
    category: string,
    providers: GetDataProvider[]
}