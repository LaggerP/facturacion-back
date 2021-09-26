require('dotenv').config()

module.exports = {
    secret: process.env.FyA_AUTH_SECRET,
    expires: process.env.FyA_AUTH_EXPIRES,
    rounds: process.env.FyA_AUTH_ROUNDS
}
