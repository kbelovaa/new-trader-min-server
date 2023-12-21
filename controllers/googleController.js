require('dotenv').config();
const { google } = require('googleapis');
const nodemailer = require('nodemailer');

const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n');
const SCOPES = [process.env.GOOGLE_SHEETS_SCOPES];
const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GOOGLE_EMAIL,
    pass: process.env.GOOGLE_APP_PASS,
  },
});

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: clientEmail,
    private_key: privateKey,
  },
  scopes: SCOPES,
});

const sheets = google.sheets({ version: 'v4', auth });

class GoogleController {
  async getSchedule(req, res, next) {
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Schedule!A2:C1000',
      });
      const schedule = response.data.values;
      return res.status(200).json({ schedule });
    } catch (error) {
      console.error('Error when reading data:', error.message);
    }
  }

  async book(req, res, next) {
    const { row, name, surname, email, mobile, platform, weekday, date, time } = req.body;

    const mailOptions = {
      from: `NEW TRADER <${process.env.GOOGLE_EMAIL}>`,
      to: process.env.GOOGLE_RECIPIENT,
      subject: 'NEW TRADER: New booked call',
      text: `Hello!\n\nA new call has been booked:\n\n${date} (${weekday}), ${time} (Europe/Oslo)\n${name} ${surname}\n${email}\n${mobile}\nPlatform: ${platform}`,
    };

    try {
      const bookedValue = [['yes']];
      const values = [[name, surname, email, mobile, platform]];
      sheets.spreadsheets.values
        .update({
          spreadsheetId,
          range: `Schedule!E${row}:I${row}`,
          valueInputOption: 'RAW',
          resource: { values },
        })
        .then(() =>
          sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `Schedule!A${row}`,
            valueInputOption: 'RAW',
            resource: { values: bookedValue },
          })
        )
        .then(() => {
          transporter.sendMail(mailOptions);
        })
        .then(() => res.status(200).json({ success: true }));
    } catch (error) {
      return res.status(200).json({ success: false, message: error });
    }
  }

  async contactUs(req, res, next) {
    const { name, email, text } = req.body;

    const mailOptions = {
      from: `NEW TRADER <${process.env.GOOGLE_EMAIL}>`,
      to: process.env.GOOGLE_RECIPIENT,
      subject: 'NEW TRADER: New message',
      text: `Hello!\n\nWe have a new message from the Contact us form:\n\nName: ${name}\nEmail: ${email}\nMessage:\n${text}`,
    };

    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'ContactUs!A2:C1000',
      });
      const schedule = response.data.values;
      const row = schedule ? schedule.length + 2 : 2;

      const values = [[name, email, text]];
      sheets.spreadsheets.values
        .update({
          spreadsheetId,
          range: `ContactUs!A${row}:C${row}`,
          valueInputOption: 'RAW',
          resource: { values },
        })
        .then(() => {
          transporter.sendMail(mailOptions);
        })
        .then(() => res.status(200).json({ success: true }));
    } catch (error) {
      return res.status(200).json({ success: false, message: error });
    }
  }
}

module.exports = new GoogleController();
