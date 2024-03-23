export interface IComment {
    showLine: boolean | undefined
    offset: number
    
    id: string
    body: string
    author: {id: string, displayName:string, avatar:string}
    createdAt: Date
    votes_likes: number
    votes_dislikes: number
    user_vote? : number
    comments: IComment[]
    isOp: boolean
    disabled: boolean
}
export interface PostSchema {
    _id?: string
    title: string
    body: string
    author: {
        id: string,
        displayName: string,
        avatar: string,
        provider: string,
        isMod?: boolean
    }
    tag?: {
        name:string
        color:string
    },
    photos?: [string]
    createdAt: Date
    votes_likes: number
    votes_dislikes: number
    user_vote?: number
    community: {
        name: string,
        avatar: string
    }
    comments?: IComment[],
    locked: boolean,
    comment_length?: number
}