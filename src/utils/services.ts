import { Plan, ServiceCategory } from "../types"

export const categories: ServiceCategory[] = ["cable", "data", "airtime", "electricity"]

export const Networks = {
    cable: [
        {
            id: 1,
            category: "cable",
            name: "GOTV"
        },
        {
            id: 2,
            category: "cable",
            name: "DSTV"
        },
        {
            id: 3,
            category: "cable",
            name: "STARTIME"
        }
    ],
    data: [
        {
            id: 1,
            category: "data",
            name: "MTN"
        },
        {
            id: 2,
            category: "data",
            name: "GLO"
        },
        {
            id: 3,
            category: "data",
            name: "9MOBILE"
        },
        {
            id: 4,
            category: "data",
            name: "AIRTEL"
        }
    ],
    airtime: [
        {
            id: 1,
            category: "airtime",
            name: "MTN"
        },
        {
            id: 2,
            category: "airtime",
            name: "GLO"
        },
        {
            id: 3,
            category: "airtime",
            name: "9MOBILE"
        },
        {
            id: 4,
            category: "airtime",
            name: "AIRTEL"
        }
    ],
    electricity: [
        {
            id: 1,
            category: "electricity",
            name: "Ikeja Electric"
        },
        {
            id: 2,
            category: "electricity",
            name: "Eko Electric"
        },
        {
            id: 3,
            category: "electricity",
            name: "Abuja Electric"
        },
        {
            id: 5,
            category: "electricity",
            name: "Enugu Electric"
        },
        {
            id: 5,
            category: "electricity",
            name: "Enugu Electric"
        },
        {
            id: 6,
            category: "electricity",
            name: "Port Harcourt Electric"
        }
    ]
}

export const Plans = {
    cable: {
        GOTV: [
            {
                id: 2,
                name: "GOtv Max",
                amount: 8500,
                payable_amount: 8500
            },
            {
                id: 18,
                name: "GOtv Smallie",
                amount: 1900,
                payable_amount: 1900
            }
            ,
            {
                id: 17,
                name: "GOtv Jolli",
                amount: 500,
                payable_amount: 500
            }
        ],
        DSTV: [
            {
                id: 5,
                name: "Asian Bouqet",
                amount: 24250,
                payable_amount: 24250
            },
            {
                id: 7,
                name: "DStv Compact",
                amount: 19000,
                payable_amount: 19000
            },
            {
                id: 8,
                name: "DStv Compact Plus",
                amount: 30000,
                payable_amount: 30000
            }
        ],
        STARTIME: [
            {
                id: 37,
                name: "Nova - 650 Naira - 1 Week",
                amount: 650,
                payable_amount: 650
            },
            {
                id: 40,
                name: "Classic - 2300 Naira - 1 Week",
                amount: 2300,
                payable_amount: 2300
            }
        ]
    },
    data: {
        MTN: [
            {
                id: 6,
                network: "mtn",
                plan_type: "gifting",
                size: "0.5GB",
                validity: "30 Days",
                amount: 340,
                payable_amount: 340
            }
        ],
        GLO: [
            {
                id: 272,
                network: "glo",
                plan_type: "corporate gifting",
                size: "200MB",
                validity: "14days Corporate Gifting",
                amount: 86,
                payable_amount: 86
            }
        ],
        "9MOBILE": [
            {
                id: 280,
                network: "9mobile",
                plan_type: "sme",
                size: "100MB",
                validity: "7 days Corporate Gifting",
                amount: 50,
                payable_amount: 50
            }
        ],
        AIRTEL: [
            {
                id: 293,
                network: "airtel",
                plan_type: "corporategifting",
                size: "1.5GB",
                validity: "Daily Plan",
                amount: 430,
                payable_amount: 430
            }
        ]
    }
} as {[key: string]: {[key: string]: Partial<Plan>[]}};

type PlanCategory = keyof typeof Plans;

export const getDataOrCableNetworkProviders = (serviceCategory?: ServiceCategory) => {
    if (!serviceCategory) {
        return [
            {
                category: "cable",
                providers: Networks.cable,
            },
            {
                category: "airtime",
                providers: Networks.airtime,
            },
            {
                category: "data",
                providers: Networks.data,
            },
            {
                category: "electricity",
                providers: Networks.electricity
            }
        ]
    }

    if (serviceCategory)
        return categories.filter(c => c === serviceCategory).map(category => ({
            category,
            providers: Networks[category]
        })
        )

    return categories.map(category => ({
        category,
        providers: Networks[category]
    }))
}

export const getDataOrCablePlans = (
    category: PlanCategory,
    provider?: string
) => {
    const categoryPlans = Plans[category];

    if (provider && provider in categoryPlans) {
        return categoryPlans[provider as keyof typeof categoryPlans];
    }

    if (provider && !(provider in categoryPlans)) {
        return [];
    }

    return categoryPlans;
};
