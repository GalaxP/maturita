export interface IAuth {
    email: string,
    password: string
}

export type AuthContextProviderProps = {
    children: React.ReactNode
}

export type AuthContextType = {
    user: object
    login: (credentials: IAuth) => void
}