exports.successResponse = (message = 'success' , data = null) => ({
    type: "success",
    message : message && message,
    data : data && data
})

exports.errorResponse = (message) => ({
    type: "error",
    message
})
