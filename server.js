
const express = require('express');
const sql = require('mssql');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

const config = {
    user: 'adminuser',
    password: 'Him1234@',
    server: 'quiz-server-xyz.database.windows.net',
    database: 'QuizDB',
    options: {
        encrypt: true
    }
};

app.get('/', async (req, res) => {
    try {
        await sql.connect(config);
        const result = await sql.query`SELECT * FROM Questions`;
        res.render('index', { questions: result.recordset });
    } catch (err) {
        res.send("Database error: " + err.message);
    }
});

app.post('/vote', async (req, res) => {
    const { questionId, answer } = req.body;
    try {
        await sql.connect(config);
        await sql.query`
            INSERT INTO Responses (QuestionId, Answer)
            VALUES (${questionId}, ${answer})
        `;
        res.redirect('/results');
    } catch (err) {
        res.send("Error saving response: " + err.message);
    }
});

app.get('/results', async (req, res) => {
    try {
        await sql.connect(config);
        const result = await sql.query`
            SELECT QuestionId, Answer, COUNT(*) as Total
            FROM Responses
            GROUP BY QuestionId, Answer
        `;
        res.render('results', { results: result.recordset });
    } catch (err) {
        res.send("Error fetching results: " + err.message);
    }
});

app.listen(3000, () => console.log("Server running on port 3000"));
