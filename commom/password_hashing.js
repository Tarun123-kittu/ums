const bcrypt = require('bcrypt');
const saltRounds = 10;

const encrypt_password = async (password) => {
    const passwordValidationRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).+$/;
    if (!passwordValidationRegex.test(password)) {
        throw new Error("Password must contain at least one uppercase letter and one special character.");
    }


    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword
}

const password_compare = async (user_password, password) => {
    try {
        const match = await bcrypt.compare(password, user_password);
        return match;
    } catch (error) {
        console.error('Error comparing passwords:', error);
        throw error;
    }
}

module.exports = { encrypt_password, password_compare }