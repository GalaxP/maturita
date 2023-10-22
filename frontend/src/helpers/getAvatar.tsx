const GetAvatar = (user:any) => {
    if(!user.user) return false
    if(user.provider === "google") return user.user.avatar
    return process.env.REACT_APP_API_URL+user.user.avatar
}
export const GetCommunityAvatar = (name: string) => {
    return process.env.REACT_APP_API_URL+name
}
export default GetAvatar
