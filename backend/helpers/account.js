const User = require("../schemas/user")

const IsUserBanned = async function(uid) {
    const user = await User.findOne({uid: uid})
    if(!user) return true
    if(user.banned) return true
    return false
}

module.exports = {
    IsUserBanned
}