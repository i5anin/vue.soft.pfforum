const cron = require('node-cron')
const nodemailer = require('nodemailer')
const { Pool } = require('pg')
const config = require('../../../config')
const { emailConfig } = require('../../../config')
const { getNetworkDetails } = require('../../../db_type')

// Настройка подключения к базе данных
const networkDetails = getNetworkDetails()
const dbConfig =
  networkDetails.databaseType === 'build'
    ? config.dbConfig
    : config.dbConfigTest
const pool = new Pool(dbConfig)

// Set up Nodemailer
const transporter = nodemailer.createTransport({
  host: emailConfig.host,
  port: emailConfig.port,
  secure: false,
  auth: {
    user: emailConfig.user,
    pass: emailConfig.pass,
  },
})

// Function to check for status changes
async function checkStatusChanges() {
  try {
    console.log('Update completed_old first')
    const updateQuery = `
      UPDATE dbo.tool_history_nom t
      SET completed_old =
        CASE
          WHEN s.status_ready = TRUE THEN 't'
          WHEN s.status_ready = FALSE THEN 'f'
          ELSE NULL
        END
      FROM dbo.specs_nom_operations s
      WHERE t.id = s.id AND (t.completed_old IS DISTINCT FROM
        CASE
          WHEN s.status_ready = TRUE THEN 't'
          WHEN s.status_ready = FALSE THEN 'f'
          ELSE NULL
        END OR t.completed_old IS NULL);
    `
    await pool.query(updateQuery)

    console.log('Check for updated rows')
    const checkQuery = `
      SELECT t.id, n.name
      FROM dbo.tool_history_nom t
      JOIN dbo.tool_nom n ON t.id_tool = n.id
      WHERE (t.completed_old = 't' AND (t.completed_old_previous IS NULL OR t.completed_old_previous = 'f'));
    `
    const { rows } = await pool.query(checkQuery)

    if (rows.length > 0) {
      sendEmailNotification(rows)
    } else {
      console.log('No relevant data changes to send email')
    }
  } catch (error) {
    console.error('Error checking status changes:', error)
  }
}

// Function to send email notifications
function sendEmailNotification(rows) {
  let emailText = 'The status of the following items has changed:\n'
  rows.forEach((row) => {
    emailText += `ID: ${row.id}, Name: ${row.name}\n`
  })

  const mailOptions = {
    from: 'report@pf-forum.ru',
    to: 'isa@pf-forum.ru',
    subject: 'Бухгалтерия: по окончанию операции',
    text: emailText,
  }

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error)
    } else {
      console.log('Email sent: ' + info.response)
    }
  })
}

// Schedule the cron job
cron.schedule('* * * * *', () => {
  // Runs every minute, adjust as needed
  console.log('Running a task every minute')
  checkStatusChanges()
})
