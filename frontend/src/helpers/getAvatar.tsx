
const GetAvatar = (user:any) => {
    if(!user) return false
    if(!user.user) return false
    if(user.provider === "google") {return user.user.avatar}
    return process.env.REACT_APP_API_URL+user.user.avatar
}
export const getStringAvatar = (avatar: string, provider: string) => {
    if(provider === "google") return avatar
    return process.env.REACT_APP_API_URL+avatar
}
export const GetCommunityAvatar = (name: string) => {
    return process.env.REACT_APP_API_URL+name
}
export default GetAvatar
