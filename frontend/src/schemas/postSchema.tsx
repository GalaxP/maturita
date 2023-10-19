export interface IComment {
    id: string
    body: string
    author: {id: string, displayName:string, avatar:string}
    createdAt: Date
    votes_likes: number
    votes_dislikes: number
    user_vote? : number
    comments: IComment[]
}
export interface PostSchema {
    _id?: string
    title: string
    body: string
    author: {
        id: string,
        displayName: string,
        avatar: string
    }
    createdAt: Date
    votes_likes: number
    votes_dislikes: number
    user_vote?: number
    community: ""
    comments?: IComment[]
    comment_length?: number
}