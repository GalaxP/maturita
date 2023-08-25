export interface IAuth {
    email: string,
    password: string
}

export type AuthContextProviderProps = {
    children: React.ReactNode
}

export type AuthContextType = {
    getUser: any
    isAuthenticated: boolean
    /*accessToken: string
    refresh_token: () => Promise<any>*/
    protectedAction: (action: Function, onFail?: Function) => any
    login: (credentials: IAuth) => Promise<any>
    logout: () => Promise<any>
}