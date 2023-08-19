import axios, { AxiosRequestConfig } from "axios";

const api_url = "http://localhost:8080";

const post_data = function(path:string, data:any, options?:AxiosRequestConfig) {
    return axios.post(api_url+path, data, options)
}

const get_data = function(path:string) {
    return axios.get(api_url+path);
}

export {
    post_data,
    get_data
}
