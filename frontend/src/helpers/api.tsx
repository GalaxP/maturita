import axios, { AxiosError, AxiosHeaderValue, AxiosHeaders, AxiosRequestConfig, AxiosResponse, RawAxiosRequestHeaders } from "axios";
import { useContext } from "react";
import AuthContext from "../contexts/AuthContext";
import Cookies from 'universal-cookie';

const api_url = process.env.REACT_APP_API_URL
let accessToken = ""

const post_data = async function(path:string, data:any, options?:AxiosRequestConfig, sendToken?:boolean, headers?:(RawAxiosRequestHeaders) | AxiosHeaders) {
    sendToken ||= false
    return new Promise<AxiosResponse<any, any>>((resolve, reject)=> {
        if(sendToken) {
            if(accessToken !== "") {
                axios.post(api_url+path, data, {...options, headers: {...headers, Authorization: "Bearer "+ accessToken} })
                .then((res)=> {
                    return resolve(res)
                })
                .catch((err)=> {
                    if(err.response?.status===401 && err.response.data.error.message === "jwt expired") {
                        refresh_token()
                        .then((token)=> {
                            axios.post(api_url+path, data, {...options, headers: {...headers, Authorization: "Bearer "+ token} })
                            .then((res2)=> {
                                return resolve(res2)
                            })
                            .catch((error2)=> { return reject(error2)})
                        })
                        .catch((error)=>{ reject(error)})
                    } else { reject(err) }
                })
            } else {
                refresh_token()
                .then((token)=> {
                    axios.post(api_url+path, data, {...options, headers: {...headers, Authorization: "Bearer "+ token} })
                    .then((res2)=> {
                        return resolve(res2)
                    })
                    .catch((error2)=> { return reject(error2)})
                })
                .catch((error)=>{ reject(error)})
            }
        } else {
            axios.post(api_url+path, data, options)
            .then((res)=> {
                return resolve(res)
            })
            .catch((err)=> {
                return reject(err)
            })
        }
    })
    /*
    if(sendToken) {
        var response = new Promise<AxiosResponse<"", "">>(() => { });;
        if(accessToken != "") {
            response = await axios.post(api_url+path, data, {...options, headers: {Authorization: "Bearer "+ accessToken} })
            .catch(async (err)=> {
                if(err.response.status===401) {
                    await refresh_token()
                    .then(()=>{
                        console.log('shrex')
                        response = axios.post(api_url+path, data, {...options, headers: {Authorization: "Bearer "+ accessToken} })
                    })
                    .catch((err)=> {return response})
                } else { return err;}
            })
        } else {
            await refresh_token()
            .then(()=>{
                response = axios.post(api_url+path, data, {...options, headers: {Authorization: "Bearer "+ accessToken} })
                return response
            })
            .catch((err)=> {console.log(err); return err})
        }
        return response;
    } else {
        return axios.post(api_url+path, data, options)
    }*/
}

const get_data = function(path:string, options?:AxiosRequestConfig, sendToken?:boolean) {
    sendToken ||= false
    return new Promise<AxiosResponse<any, any>>((resolve, reject)=> {
        if(sendToken) {
            if(accessToken !== "") {
                axios.get(api_url+path, {...options, headers: {Authorization: "Bearer "+ accessToken} })
                .then((res)=> {
                    return resolve(res)
                })
                .catch((err)=> {
                    if(err.response?.status===401 && err.response.data.error.message === "jwt expired") {
                        refresh_token()
                        .then((token)=> {
                            axios.get(api_url+path, {...options, headers: {Authorization: "Bearer "+ token} })
                            .then((res2)=> {
                                return resolve(res2)
                            })
                            .catch((error2)=> { return reject(error2)})
                        })
                        .catch((error)=>{ reject(error)})
                    } else { reject(err) }
                })
            } else {
                refresh_token()
                .then((token)=> {
                    axios.get(api_url+path, {...options, headers: {Authorization: "Bearer "+ token} })
                    .then((res2)=> {
                        return resolve(res2)
                    })
                    .catch((error2)=> { return reject(error2)})
                })
                .catch((error)=>{ reject(error)})
            }
        } else {
            axios.get(api_url+path, options)
            .then((res)=> {
                return resolve(res)
            })
            .catch((err)=> {
                return reject(err)
            })
        }
    })
}
const cookies = new Cookies();

const refresh_token = function() {
    return new Promise((resolve, reject) => {
        axios.post(api_url+"/account/refresh-token", {}, {withCredentials:true})
        .then((res)=> {
            if(res.status===200|| res.status === 204) {
                accessToken = res.data.accessToken
                //console.log(res.data)
                resolve(res.data.accessToken)
            }
            else {
                reject()
            }
        })
        .catch((err)=>{
            //TODO: FIGURE OUT WHAT TO DO IF THIS FAILS
            //PROBABLY SHOULD FORCE LOG OUT
            cookies.remove("account", { 
                path:"/",
                sameSite: "strict",
                httpOnly: false,
                secure: true
            });
            cookies.remove('refreshToken', {
                path: "/",
                sameSite: "lax",
                httpOnly: false,
                secure: false
            })
            cookies.remove('accessToken', {
                path: "/",
                sameSite: "lax",
                httpOnly: false,
                secure: false
            })
            reject(err)
            window.location.reload()
        })
    })
}

const setAccessToken = function(_accessToken:string) {
    accessToken = _accessToken;
}
const getAccessToken = function() {
    return accessToken
}

export {
    post_data,
    get_data,
    setAccessToken,
    getAccessToken
}
