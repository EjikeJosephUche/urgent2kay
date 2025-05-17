import Axios from 'axios';

type HttpMethod = "get" | "post" | "patch" | "delete" | "put";

export const apiRequest = async <T>(
    route: string,
    method: HttpMethod,
    data?: { [key: string]: any },
    config?: Axios.AxiosXHRConfigBase<unknown>,
): Promise<any> => {
    try {
        config = config ? config : {}
        const axiosInstance = Axios.create(config);

        axiosInstance.interceptors.request.use(
            (config) => {
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        const response = await axiosInstance[method](route, data);

        return response.data
    } catch (error: any) {
        throw new Error(error)
    }
};