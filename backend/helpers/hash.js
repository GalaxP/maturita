const bcrypt = require("bcrypt")
const saltRounds = 10;

const HashPassword = async function(password) {
    return await bcrypt.hash(password, saltRounds)
}

module.exports = {
    HashPassword
}