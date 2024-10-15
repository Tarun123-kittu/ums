const { sequelize } = require("../models");
const { errorResponse, successResponse } = require("../utils/responseHandler")




exports.final_or_face_to_face_round = async (req, res) => {
    try {
        let leadId = req.body.leadId
        let status = req.body.status;
        let round_type = req.body.round_type;
        let currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

        let [isLeadExist] = await sequelize.query(`SELECT * FROM interviews WHERE lead_id = ${leadId}`)

        if (isLeadExist.length < 1) {
            return res.status(400).json(errorResponse("Lead not exist in the interviews with this lead Id."))
        }
   
        if (round_type == 'final') {
            await sequelize.query(`UPDATE interviews SET final_result = "${status}", updatedAt="${currentDate}" WHERE  lead_id = ${leadId}`)
        }
        if (round_type == 'face_to_face') {
            await sequelize.query(`UPDATE  interviews SET face_to_face_result = "${status}",updatedAt="${currentDate}" WHERE lead_id = ${leadId}`)
        }

        return res.status(200).json(successResponse("Result updated successfully"))

    } catch (error) {
        console.log("ERROR::", error)
        return res.status(500).json(errorResponse(error.message))
    }
}



exports.update_in_round_count = async (req, res) => {
    try {
        let leadId = req.body.leadId
        let in_round_count = req.body.in_round_count

        if (![3, 4].includes(in_round_count)) {
            return res.status(400).json(errorResponse("in_round_count must be either 3 or 4"));
        }

        let [isLeadExist] = await sequelize.query(`SELECT * FROM interview_leads WHERE id = ${leadId}`)
        if (isLeadExist.length < 1) {
            return res.status(400).json(errorResponse("Lead not exist with this lead id "))
        }

        await sequelize.query(`UPDATE interview_leads SET 	in_round = ${in_round_count} WHERE id = ${leadId}`)

        return res.status(200).json(successResponse("In round status updated successfully"))

    } catch (error) {
        console.log("ERROR::", error)
        return res.status(500).json(errorResponse(error.message))
    }
}