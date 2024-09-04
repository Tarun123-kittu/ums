const validateCreateUserDataTypes = (req, res, next) => {
    const body = req.body;
    const expectedTypes = {
        email: 'string',
        username: 'string',
        password: 'string',
        confirm_password: 'string',
        role_id: 'number'
    };

    for (const [field, expectedType] of Object.entries(expectedTypes)) {
        const actualType = typeof body[field];
        console.log(`Checking field: ${field}, Expected: ${expectedType}, Actual: ${actualType}`); // Log field check

        if (actualType !== expectedType) {
            return res.status(400).json({
                type: 'error',
                message: `Invalid data type for field '${field}'. Expected '${expectedType}', but got '${actualType}'.`
            });
        }
    }

    next();
};

const validateLoginDAtaTypes = (req, res, next) => {
    const body = req.body;
    const expectedTypes = {
        email: 'string',
        password: 'string',
    };

    for (const [field, expectedType] of Object.entries(expectedTypes)) {
        const actualType = typeof body[field];
        console.log(`Checking field: ${field}, Expected: ${expectedType}, Actual: ${actualType}`); // Log field check

        if (actualType !== expectedType) {
            return res.status(400).json({
                type: 'error',
                message: `Invalid data type for field '${field}'. Expected '${expectedType}', but got '${actualType}'.`
            });
        }
    }

    next();
};

const validateForgotPasswordDataTypes = (req, res, next) => {
    const body = req.body;
    const expectedTypes = {
        email: 'string',
    };

    for (const [field, expectedType] of Object.entries(expectedTypes)) {
        const actualType = typeof body[field];
        console.log(`Checking field: ${field}, Expected: ${expectedType}, Actual: ${actualType}`); // Log field check

        if (actualType !== expectedType) {
            return res.status(400).json({
                type: 'error',
                message: `Invalid data type for field '${field}'. Expected '${expectedType}', but got '${actualType}'.`
            });
        }
    }

    next();
};

const validateResetPasswordDataTypes = (req, res, next) => {
    const body = req.body;
    const expectedTypes = {
        password: "string",
        confirm_password: "string"
    };

    for (const [field, expectedType] of Object.entries(expectedTypes)) {
        const actualType = typeof body[field];
        console.log(`Checking field: ${field}, Expected: ${expectedType}, Actual: ${actualType}`); // Log field check

        if (actualType !== expectedType) {
            return res.status(400).json({
                type: 'error',
                message: `Invalid data type for field '${field}'. Expected '${expectedType}', but got '${actualType}'.`
            });
        }
    }

    next();
};

const validateChangePasswordDataTypes = (req, res, next) => {
    const body = req.body;
    const expectedTypes = {
        password: "string",
        newPassword: "string"
    };

    for (const [field, expectedType] of Object.entries(expectedTypes)) {
        const actualType = typeof body[field];
        console.log(`Checking field: ${field}, Expected: ${expectedType}, Actual: ${actualType}`); // Log field check

        if (actualType !== expectedType) {
            return res.status(400).json({
                type: 'error',
                message: `Invalid data type for field '${field}'. Expected '${expectedType}', but got '${actualType}'.`
            });
        }
    }

    next();
};
const validateNewRoledDataTypes = (req, res, next) => {
    const body = req.body;
    const expectedTypes = {
        role: "string",
    };

    for (const [field, expectedType] of Object.entries(expectedTypes)) {
        const actualType = typeof body[field];
        console.log(`Checking field: ${field}, Expected: ${expectedType}, Actual: ${actualType}`); // Log field check

        if (actualType !== expectedType) {
            return res.status(400).json({
                type: 'error',
                message: `Invalid data type for field '${field}'. Expected '${expectedType}', but got '${actualType}'.`
            });
        }
    }

    next();
};
const validateNewPermissionDataTypes = (req, res, next) => {
    const body = req.body;
    const expectedTypes = {
        permission: "string",
    };

    for (const [field, expectedType] of Object.entries(expectedTypes)) {
        const actualType = typeof body[field];
        console.log(`Checking field: ${field}, Expected: ${expectedType}, Actual: ${actualType}`); // Log field check

        if (actualType !== expectedType) {
            return res.status(400).json({
                type: 'error',
                message: `Invalid data type for field '${field}'. Expected '${expectedType}', but got '${actualType}'.`
            });
        }
    }

    next();
};



module.exports = {
    validateCreateUserDataTypes,
    validateLoginDAtaTypes,
    validateForgotPasswordDataTypes,
    validateResetPasswordDataTypes,
    validateChangePasswordDataTypes,
    validateNewRoledDataTypes,
    validateNewPermissionDataTypes
};
