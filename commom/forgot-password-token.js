const crypto = require('crypto')

const passwordResetToken = async () => {
    const resetToken = await crypto.randomBytes(32).toString('hex')

    this.passwordResetToken = await crypto.createHash('sha256').update(resetToken).digest('hex')
    this.passwordResetExpiresIn = Date.now() + 10 * 60 * 1000
    return resetToken
}

module.exports = passwordResetToken