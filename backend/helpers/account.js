const User = require("../schemas/user")

const IsUserBanned = async function(uid) {
    const user = await User.findOne({uid: uid})
    if(!user) return true
    if(user.banned) return true
    return false
}

const IsUserAdmin = function(roles) {
    if(!roles) return false
    if(roles.includes('admin')) return true
    return false
}

const IsUserMod = function(user, community) {
    try {
        return community.moderators.findIndex(x=>x===user) !== -1
    } catch{
        return false
    }
}

module.exports = {
    IsUserBanned, IsUserAdmin, IsUserMod
}