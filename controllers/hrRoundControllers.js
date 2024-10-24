let { sequelize } = require('../models');
const { all } = require('../routes/route');
let { errorResponse, successResponse } = require("../utils/responseHandler")
const jwt = require('jsonwebtoken')
const config = require("../config/config")
const { send_email } = require("../utils/commonFuntions")



exports.get_hr_round_questions = async (req, res) => {
  try {
    const getSeriesQuery = `SELECT id,question FROM HR_Round_Questions `;

    const [questions] = await sequelize.query(getSeriesQuery);

    if (questions.length < 1) { return res.status(400).json(errorResponse("No question created yet!")) }

    res.status(200).json(successResponse('HR Round Questions fetched successfully.', questions));
  } catch (error) {
    console.log("ERROR::", error)
    return res.status(500).json(errorResponse(error.message))
  }
}

exports.hr_round = async (req, res) => {
  let transaction;
  try {
    const { lead_id, responses } = req.body;


    if (!lead_id || !Array.isArray(responses)) {
      return res.status(400).json({ error: 'Invalid input data' });
    }

    transaction = await sequelize.transaction();


    const [leads] = await sequelize.query(
      'SELECT * FROM interview_leads WHERE id = ?',
      {
        replacements: [lead_id],
        type: sequelize.QueryTypes.SELECT,
        transaction,
      }
    );
    if (!leads) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Lead not found' });
    }


    const [interviewResult] = await sequelize.query(
      'INSERT INTO Interviews (lead_id, interview_link_click_count, hr_round_result, technical_round_result, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
      {
        replacements: [lead_id, 0, 'Pending', 'Pending'],
        type: sequelize.QueryTypes.INSERT,
        transaction,
      }
    );

    const interview_id = interviewResult;


    for (const response of responses) {
      const { questionid, answer } = response;


      const [question] = await sequelize.query(
        'SELECT * FROM HR_Round_Questions WHERE id = ?',
        {
          replacements: [questionid],
          type: sequelize.QueryTypes.SELECT,
          transaction,
        }
      );

      if (!question) {
        await transaction.rollback();
        return res.status(404).json({ error: `Question with ID ${questionid} not found` });
      }


      await sequelize.query(
        'INSERT INTO HR_Rounds (interview_id, lead_id, questionid, answer) VALUES (?, ?, ?, ?)',
        {
          replacements: [interview_id, lead_id, questionid, answer],
          type: sequelize.QueryTypes.INSERT,
          transaction,
        }
      );
    }


    const update_interview_round = `UPDATE interview_leads SET in_round = 1 WHERE id = ?`;
    const is_row_updated = await sequelize.query(
      update_interview_round,
      {
        replacements: [lead_id],
        type: sequelize.QueryTypes.UPDATE,
        transaction,
      }
    );


    await transaction.commit();

    return res.status(200).json({ message: 'HR round completed successfully', interview_id });

  } catch (error) {

    if (transaction) await transaction.rollback();
    console.error("ERROR::", error);
    return res.status(500).json({ error: 'An error occurred while processing the HR round' });
  }
}




exports.hr_round_result = async (req, res) => {
  const { interview_id, hr_round_result } = req.body;
  const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

  const transaction = await sequelize.transaction();

  try {

    if (!interview_id || !['selected', 'rejected', 'pending', 'on hold'].includes(hr_round_result)) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Invalid input data' });
    }


    const [affectedRows] = await sequelize.query(
      'UPDATE Interviews SET hr_round_result = ?,updatedAt = ? WHERE id = ?',
      {
        replacements: [hr_round_result, currentDate, interview_id],
        type: sequelize.QueryTypes.UPDATE,
        transaction,
      }
    );


    if (affectedRows === 0) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Interview not found' });
    }


    await transaction.commit();
    return res.status(200).json({ message: 'HR round result updated successfully' });
  } catch (error) {
    await transaction.rollback();
    console.log("ERROR::", error);
    return res.status(500).json({ error: 'An error occurred while processing the request' });
  }
};

exports.update_lead_response = async (req, res) => {
  try {
    const { id, answer } = req.body;


    if (!id || typeof answer !== 'string') {
      return res.status(400).json({ error: 'Invalid input data' });
    }

    const transaction = await sequelize.transaction();

    const [affectedRows] = await sequelize.query(
      'UPDATE HR_Rounds SET answer = :answer WHERE id = :id',
      {
        replacements: { answer, id },
        type: sequelize.QueryTypes.UPDATE,
        transaction,
      }
    );

    if (affectedRows === 0) {

      await transaction.rollback();
      return res.status(404).json({ error: 'HR round record not found for the given ID' });
    }


    await transaction.commit();
    return res.status(200).json({ message: 'HR round answer updated successfully' });
  } catch (error) {
    await transaction.rollback();
    console.log("ERROR::", error);
    return res.status(500).json({ error: 'An error occurred while processing the request' });
  }
}

exports.get_hr_assign_questions_to_lead = async (req, res) => {
  const { count } = req.query;
  const limit = parseInt(count, 10) || 10;

  try {
    const hr_assign_questions = `SELECT id, question FROM hr_round_questions ORDER BY RAND() LIMIT ${limit}`;

    const all_questions = await sequelize.query(hr_assign_questions, {
      type: sequelize.QueryTypes.SELECT,
    });

    if (!all_questions || all_questions.length === 0) {
      return res.status(400).json({ type: "error", message: "Error while fetching the question" });
    }

    return res.status(200).json({
      type: "success",
      data: all_questions
    });
  } catch (error) {
    return res.status(400).json({
      type: "error",
      message: error.message
    });
  }
};

exports.get_hr_round_candidate = async (req, res) => {
  try {
    const { pageNumber = 1, pageSize = 10, profile, experience, result_status } = req.query;
    const page = parseInt(pageNumber, 10) || 1;
    const limit = parseInt(pageSize, 10) || 10;
    const offset = (page - 1) * limit;

    let whereClause = "WHERE i.in_round = 1";


    if (profile) {
      whereClause += ` AND i.profile LIKE '%${profile}%'`;
    }


    if (experience) {
      whereClause += ` AND i.experience = ${experience}`;
    }


    if (result_status) {
      const validStatuses = ['selected', 'rejected', 'pending', 'on hold'];
      if (validStatuses.includes(result_status)) {
        whereClause += ` AND iv.hr_round_result = '${result_status}'`;
      } else {
        return res.status(400).json({
          type: 'error',
          message: 'Invalid hr_round_result filter value.'
        });
      }
    }


    const countQuery = `SELECT COUNT(*) as totalRecords 
                            FROM interview_leads i 
                            JOIN interviews iv ON iv.lead_id = i.id 
                            ${whereClause}`;

    const totalRecordsResult = await sequelize.query(countQuery, {
      type: sequelize.QueryTypes.SELECT,
    });

    const totalRecords = totalRecordsResult[0].totalRecords;
    const totalPages = Math.ceil(totalRecords / limit);


    const get_hr_round_leads = `
        SELECT 
            i.id, 
            i.name, 
            i.experience, 
            l.language AS profile, 
            iv.hr_round_result,
            iv.id AS interview_id
        FROM 
            interview_leads i 
        JOIN 
            interviews iv ON iv.lead_id = i.id 
            JOIN languages l ON l.id  = i.profile
        ${whereClause}
        ORDER BY i.createdAt DESC  
        LIMIT ${limit} OFFSET ${offset};
    `;


    const all_hr_round_candidates = await sequelize.query(get_hr_round_leads, {
      type: sequelize.QueryTypes.SELECT,
    });

    if (!all_hr_round_candidates.length) {
      return res.status(200).json({ type: "success", message: "No candidate found" });
    }

    return res.status(200).json({
      type: "success",
      data: all_hr_round_candidates,
      currentPage: page,
      totalPages: totalPages,
      totalRecords: totalRecords,
      pageSize: limit
    });
  } catch (error) {
    console.log('ERROR::', error);
    return res.status(500).json(errorResponse(error.message));
  }
};




exports.get_hr_round_assign_questions_to_lead = async (req, res) => {
  const { interview_id, lead_id } = req.query
  if (!interview_id || !lead_id) return res.status(400).json({ type: "error", message: "interview id and lead id is required to perform this action" })
  try {
    const get_assigned_questions = `SELECT hrq.id AS question_id,hrq.question,hr.answer,hr.key_point FROM hr_round_questions hrq JOIN hr_rounds hr ON hrq.id = hr.questionid WHERE hr.interview_id = ? AND hr.lead_id = ?`;
    const all_questions = await sequelize.query(
      get_assigned_questions,
      {
        replacements: [interview_id, lead_id],
        type: sequelize.QueryTypes.SELECT
      }
    );

    console.log(all_questions)
    if (!all_questions) return res.status(200).json({ type: "success", message: "No questions found" })
    return res.status(200).json({
      type: "success",
      data: all_questions
    })
  } catch (error) {
    return res.status(400).json({
      type: "error",
      message: error?.message
    })
  }
}

exports.update_key_point = async (req, res) => {
  const { question_id, lead_id, interview_id, key_point } = req.body;

  const allowedKeys = ["question_id", "lead_id", "interview_id", "key_point"];

  const isValid = Object.keys(req.body).every(key => allowedKeys.includes(key));

  if (!isValid) {
    return res.status(400).json({ error: "Invalid input data" });
  }

  try {
    const updateQuery = `
            UPDATE hr_rounds
            SET key_point = :key_point
            WHERE questionid = :question_id
            AND lead_id = :lead_id
            AND interview_id = :interview_id
        `;

    const [result] = await sequelize.query(updateQuery, {
      replacements: { key_point, question_id, lead_id, interview_id },
      type: sequelize.QueryTypes.UPDATE
    });

    if (result === 0) { return res.status(404).json({ type: "error", message: "No matching record found to update" }); }

    return res.status(200).json({ type: "success", message: "Key point updated successfully" });

  } catch (error) {
    console.error("Error updating key point:", error);
    return res.status(500).json({ type: "error", message: error?.message });
  }
};




exports.sendLeadInterviewLink = async (req, res) => {
  try {
    const t = await sequelize.transaction();

    const { lead_id, test_series } = req.query;

    if (!lead_id) {
      return res.status(400).json({ type: "error", message: "Lead ID is required to perform this action" });
    }

    const isLeadValid = `SELECT id, email, test_auth_token, name FROM interview_leads WHERE id = ?`;
    const [isLead] = await sequelize.query(isLeadValid, {
      replacements: [lead_id],
      type: sequelize.QueryTypes.SELECT,
      transaction: t
    });

    if (!isLead || isLead.length === 0) {
      await t.rollback();
      return res.status(404).json({ type: "error", message: "Lead not found" });
    }

    if (isLead?.test_auth_token) {
      await t.rollback();
      return res.status(400).json({ type: "error", message: `Test already sent to ${isLead?.name}` });
    }

    const token = jwt.sign({ lead_id }, config?.development?.lead_auth_token);

    if (!token) {
      await t.rollback();
      return res.status(400).json({ type: "error", message: "Something went wrong, please try again later" });
    }
    const update_lead_token = `UPDATE interview_leads SET test_auth_token = ?,assigned_test_series = ?,in_round= 2 WHERE id = ?`;
    await sequelize.query(update_lead_token, {
      replacements: [token, test_series, lead_id],
      type: sequelize.QueryTypes.UPDATE,
      transaction: t
    });

    await send_email({
      email: isLead?.email,
      subject: `Interview test from Ultivic`,
      text: `Hey, Your Test Link`,
      html: `
    <div
      dir="ltr"
      class="es-wrapper-color"
      lang="en"
      style="background-color: #f6f6f6"
    >
      <!--[if gte mso 9]>
        <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
          <v:fill type="tile" color="#f6f6f6"></v:fill>
        </v:background>
      <![endif]-->
      <table
        width="100%"
        cellspacing="0"
        cellpadding="0"
        class="es-wrapper"
        role="none"
        style="
          mso-table-lspace: 0pt;
          mso-table-rspace: 0pt;
          border-collapse: collapse;
          border-spacing: 0px;
          padding: 0;
          margin: 0;
          width: 100%;
          height: 100%;
          background-repeat: repeat;
          background-position: center top;
          background-color: #f6f6f6;
        "
      >
        <tr>
          <td valign="top" style="padding: 0; margin: 0">
            <table
              cellspacing="0"
              cellpadding="0"
              align="center"
              class="es-header"
              role="none"
              style="
                mso-table-lspace: 0pt;
                mso-table-rspace: 0pt;
                border-collapse: collapse;
                border-spacing: 0px;
                width: 100%;
                table-layout: fixed !important;
                background-color: transparent;
                background-repeat: repeat;
                background-position: center top;
              "
            >
              <tr>
                <td align="center" style="padding: 0; margin: 0">
                  <table
                    cellspacing="0"
                    cellpadding="0"
                    bgcolor="#ffffff"
                    align="center"
                    class="es-header-body"
                    role="none"
                    style="
                      mso-table-lspace: 0pt;
                      mso-table-rspace: 0pt;
                      border-collapse: collapse;
                      border-spacing: 0px;
                      background-color: #ffffff;
                      width: 600px;
                    "
                  >
                    <tr>
                      <td
                        align="left"
                        bgcolor="#F7E3E3"
                        style="
                          margin: 0;
                          padding-top: 32px;
                          padding-right: 20px;
                          padding-bottom: 32px;
                          padding-left: 20px;
                          background-color: #f7e3e3;
                        "
                      >
                        <table
                          cellspacing="0"
                          cellpadding="0"
                          align="right"
                          class="es-right"
                          role="none"
                          style="
                            mso-table-lspace: 0pt;
                            mso-table-rspace: 0pt;
                            border-collapse: collapse;
                            border-spacing: 0px;
                            float: right;
                          "
                        >
                          <tr>
                            <td
                              align="left"
                              style="padding: 0; margin: 0; width: 560px"
                            >
                              <table
                                width="100%"
                                cellspacing="0"
                                cellpadding="0"
                                role="presentation"
                                style="
                                  mso-table-lspace: 0pt;
                                  mso-table-rspace: 0pt;
                                  border-collapse: collapse;
                                  border-spacing: 0px;
                                "
                              >
                                <tr>
                                  <td
                                    align="center"
                                    style="padding: 0; margin: 0; font-size: 0"
                                  >
                                    <img
                                      src="https://frokhjs.stripocdn.email/content/guids/CABINET_aae6c46012051069e562276d25ce47940f57b1ff51be9d9cb73cc6e756acef1f/images/frame_230.png"
                                      alt=""
                                      width="219"
                                      height="67"
                                      style="
                                        display: block;
                                        font-size: 14px;
                                        border: 0;
                                        outline: none;
                                        text-decoration: none;
                                      "
                                    />
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            <table
              cellspacing="0"
              cellpadding="0"
              align="center"
              class="es-content"
              role="none"
              style="
                mso-table-lspace: 0pt;
                mso-table-rspace: 0pt;
                border-collapse: collapse;
                border-spacing: 0px;
                width: 100%;
                table-layout: fixed !important;
              "
            >
              <tr>
                <td align="center" style="padding: 0; margin: 0">
                  <table
                    cellspacing="0"
                    cellpadding="0"
                    bgcolor="#ffffff"
                    align="center"
                    class="es-content-body"
                    role="none"
                    style="
                      mso-table-lspace: 0pt;
                      mso-table-rspace: 0pt;
                      border-collapse: collapse;
                      border-spacing: 0px;
                      background-color: #ffffff;
                      width: 600px;
                    "
                  >
                    <tr>
                      <td
                        align="left"
                        style="
                          padding: 0;
                          margin: 0;
                          padding-right: 20px;
                          padding-left: 20px;
                          padding-top: 20px;
                        "
                      >
                        <table
                          width="100%"
                          cellspacing="0"
                          cellpadding="0"
                          role="none"
                          style="
                            mso-table-lspace: 0pt;
                            mso-table-rspace: 0pt;
                            border-collapse: collapse;
                            border-spacing: 0px;
                          "
                        >
                          <tr>
                            <td
                              valign="top"
                              align="center"
                              style="padding: 0; margin: 0; width: 560px"
                            >
                              <table
                                width="100%"
                                cellspacing="0"
                                cellpadding="0"
                                role="presentation"
                                style="
                                  mso-table-lspace: 0pt;
                                  mso-table-rspace: 0pt;
                                  border-collapse: collapse;
                                  border-spacing: 0px;
                                "
                              >
                                <tr>
                                  <td
                                    align="center"
                                    class="es-text-6241"
                                    style="
                                      padding: 0;
                                      margin: 0;
                                      padding-bottom: 14px;
                                    "
                                  >
                                    <p
                                      style="
                                        margin: 0;
                                        mso-line-height-rule: exactly;
                                        font-family: arial, 'helvetica neue',
                                          helvetica, sans-serif;
                                        line-height: 36px !important;
                                        letter-spacing: 0;
                                        color: #333333;
                                        font-size: 14px;
                                      "
                                    >
                                      <span
                                        class="es-text-mobile-size-24"
                                        style="
                                          font-size: 24px;
                                          line-height: 36px !important;
                                        "
                                        >Welcome to Ultivic</span
                                      >
                                    </p>
                                  </td>
                                </tr>
                                <tr>
                                  <td
                                    align="center"
                                    class="es-text-4106"
                                    style="
                                      padding: 0;
                                      margin: 0;
                                      padding-bottom: 24px;
                                    "
                                  >
                                    <p
                                      class="es-text-mobile-size-16"
                                      style="
                                        margin: 0;
                                        mso-line-height-rule: exactly;
                                        font-family: arial, 'helvetica neue',
                                          helvetica, sans-serif;
                                        line-height: 24px !important;
                                        letter-spacing: 0;
                                        color: #333333;
                                        font-size: 16px;
                                      "
                                    >
                                      Thank you for applying to
                                      <strong>Ultivic Interview</strong>
                                      Process. As a next step, you are requested
                                      to appear for the online Test.
                                    </p>
                                  </td>
                                </tr>
                                <tr>
                                  <td
                                    align="center"
                                    style="padding: 0; margin: 0"
                                  >
                                    <p
                                      style="
                                        margin: 0;
                                        mso-line-height-rule: exactly;
                                        font-family: arial, 'helvetica neue',
                                          helvetica, sans-serif;
                                        line-height: 21px;
                                        letter-spacing: 0;
                                        color: #333333;
                                        font-size: 14px;
                                      "
                                    >
                                      Here is your test link. answer them
                                      carefully.
                                    </p>
                                  </td>
                                </tr>
                                <tr>
                                  <td
                                    align="center"
                                    style="
                                      padding: 0;
                                      margin: 0;
                                      padding-bottom: 24px;
                                    "
                                  >
                                    <p
                                      style="
                                        margin: 0;
                                        mso-line-height-rule: exactly;
                                        font-family: arial, 'helvetica neue',
                                          helvetica, sans-serif;
                                        line-height: 21px;
                                        letter-spacing: 0;
                                        color: #333333;
                                        font-size: 14px;
                                      "
                                    >
                                      <a
                                        target="_blank"
                                        href="http://localhost:3000/leads/technical-round/${isLead?.id}/${token}"
                                        style="
                                          mso-line-height-rule: exactly;
                                          text-decoration: underline;
                                          color: #1a90d9;
                                          font-size: 14px;
                                        "
                                        >Click Here</a
                                      >
                                    </p>
                                  </td>
                                </tr>
                                <tr>
                                  <td
                                    align="center"
                                    style="padding: 0; margin: 0"
                                  >
                                    <p
                                      style="
                                        margin: 0;
                                        mso-line-height-rule: exactly;
                                        font-family: arial, 'helvetica neue',
                                          helvetica, sans-serif;
                                        line-height: 21px;
                                        letter-spacing: 0;
                                        color: #333333;
                                        font-size: 14px;
                                      "
                                    >
                                      If you are having any issues with your
                                      account, please don’t hesitate to contact
                                      Customer Services.
                                    </p>
                                  </td>
                                </tr>
                                <tr>
                                  <td
                                    align="center"
                                    style="
                                      padding: 0;
                                      margin: 0;
                                      padding-top: 24px;
                                    "
                                  >
                                    <p
                                      style="
                                        margin: 0;
                                        mso-line-height-rule: exactly;
                                        font-family: arial, 'helvetica neue',
                                          helvetica, sans-serif;
                                        line-height: 21px;
                                        letter-spacing: 0;
                                        color: #333333;
                                        font-size: 14px;
                                      "
                                    >
                                      Thanks
                                    </p>
                                  </td>
                                </tr>
                                <tr>
                                  <td
                                    align="center"
                                    style="padding: 0; margin: 0"
                                  >
                                    <p
                                      style="
                                        margin: 0;
                                        mso-line-height-rule: exactly;
                                        font-family: arial, 'helvetica neue',
                                          helvetica, sans-serif;
                                        line-height: 21px;
                                        letter-spacing: 0;
                                        color: #333333;
                                        font-size: 14px;
                                      "
                                    >
                                      <u style="color: #000"
                                        ><a
                                          href="https://ultivic.com/"
                                          target="_blank"
                                          style="
                                            mso-line-height-rule: exactly;
                                            text-decoration: underline;
                                            color: #000;
                                            font-size: 14px;
                                          "
                                          >Ultivic Private Limited</a
                                        ></u
                                      >
                                    </p>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            <table
              cellspacing="0"
              cellpadding="0"
              align="center"
              class="es-footer"
              role="none"
              style="
                mso-table-lspace: 0pt;
                mso-table-rspace: 0pt;
                border-collapse: collapse;
                border-spacing: 0px;
                width: 100%;
                table-layout: fixed !important;
                background-color: transparent;
                background-repeat: repeat;
                background-position: center top;
              "
            >
              <tr>
                <td align="center" style="padding: 0; margin: 0">
                  <table
                    cellspacing="0"
                    cellpadding="0"
                    bgcolor="#ffffff"
                    align="center"
                    class="es-footer-body"
                    role="none"
                    style="
                      mso-table-lspace: 0pt;
                      mso-table-rspace: 0pt;
                      border-collapse: collapse;
                      border-spacing: 0px;
                      background-color: #ffffff;
                      width: 600px;
                    "
                  >
                    <tr>
                      <td
                        align="left"
                        style="
                          margin: 0;
                          padding-right: 20px;
                          padding-left: 20px;
                          padding-top: 20px;
                          padding-bottom: 20px;
                        "
                      >
                        <table
                          cellspacing="0"
                          cellpadding="0"
                          align="right"
                          class="es-right"
                          role="none"
                          style="
                            mso-table-lspace: 0pt;
                            mso-table-rspace: 0pt;
                            border-collapse: collapse;
                            border-spacing: 0px;
                            float: right;
                          "
                        >
                          <tr>
                            <td
                              align="left"
                              style="padding: 0; margin: 0; width: 560px"
                            >
                              <table
                                width="100%"
                                cellspacing="0"
                                cellpadding="0"
                                role="none"
                                style="
                                  mso-table-lspace: 0pt;
                                  mso-table-rspace: 0pt;
                                  border-collapse: collapse;
                                  border-spacing: 0px;
                                "
                              >
                                <tr>
                                  <td
                                    align="center"
                                    style="padding: 0; margin: 0; display: none"
                                  ></td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>



            
            `
    });

    await t.commit();

    return res.status(200).json({ type: "success", message: "Test link sent successfully!" });
  } catch (error) {
    await t.rollback();
    console.error("Error generating interview link:", error);
    return res.status(500).json({ type: "error", message: error.message });
  }
};



