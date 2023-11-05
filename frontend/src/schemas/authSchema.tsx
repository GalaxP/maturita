export interface IAuth {
    email: string,
    password: string,
    token?: string
}

export type AuthContextProviderProps = {
    children: React.ReactNode
}

export type AuthContextType = {
    getUser: any
    setUserForcefully: (user: any) => void
    isAuthenticated: boolean
    /*accessToken: string
    refresh_token: () => Promise<any>*/
    protectedAction: (action: Function, onFail?: Function) => any
    login: (credentials: IAuth, token?: string) => Promise<any>
    googleLogin: (user: string, accessToken: string) => void
    logout: () => Promise<any>
}