
export interface PostSchema {
    _id?: string
    title: string
    body: string
    author: string
    createdAt: Date
    votes_likes: number
    votes_dislikes: number
    user_vote?: number
}