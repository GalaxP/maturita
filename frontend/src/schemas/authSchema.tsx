export interface IAuth {
    email: string,
    password: string
}

export type AuthContextProviderProps = {
    children: React.ReactNode
}

export type AuthContextType = {
    user: any
    isAuthenticated: boolean
    login: (credentials: IAuth) => Promise<any>
    logout: () => Promise<any>
}