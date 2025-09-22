import express from 'express'

const app = express()

app.get('/', (req, res) => {
    res.json({
        user: "Alex",
    });
});

app.get('/about', (req, res) => {
    res.send("About Page");
});

app.get('/contacts', (req, res) => res.send("Contacts Page"))


app.listen(3000, () => {
    console.log("Server Started at http://localhost:3000")
});