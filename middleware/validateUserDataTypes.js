const validateCreateUserDataTypes = (req, res, next) => {
    const body = req.body;

    const expectedTypes = {
        name: 'string',
        username: 'string',
        email: 'string',
        mobile: 'string',
        emergency_contact_relationship: 'string',
        emergency_contact_name: 'string',
        emergency_contact: 'string',
        bank_name: 'string',
        account_number: 'string',
        ifsc: 'string',
        increment_date: 'string', 
        gender: 'string',
        dob: 'string',  
        doj: 'string',  
        skype_email: 'string',
        ultivic_email: 'string',
        salary: 'number', 
        security: 'number', 
        total_security: 'number', 
        installments: 'number',
        position: 'string',
        department: 'string',
        status: 'string',
        password: 'string',
        address: 'string',
        role: 'string' 
    };

    for (const [field, expectedType] of Object.entries(expectedTypes)) {
        const actualType = typeof body[field];

        console.log(`Checking field: ${field}, Expected: ${expectedType}, Actual: ${actualType}`); 

        if (expectedType === 'number' && actualType === 'string' && !isNaN(parseFloat(body[field]))) {
            continue; 
        }

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

const validateDisableRoleDataTypes = (req, res, next) => {
    const body = req.body;
    const expectedTypes = {
        role_id: "number",
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
    validateNewPermissionDataTypes,
    validateDisableRoleDataTypes
};
