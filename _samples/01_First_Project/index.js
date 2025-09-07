import express from 'express'
import cors from 'cors'

const app = express()
const port = 3000

app.use(cors())

app.get("/", (req, res) => {
    res.json({ message: "Hello, Node.JS!", })
});

app.get("/user", (req, res) => {
    res.json({
        name: "Stanislav",
        age: 44,
    });
})

app.use((req, res) => {
    res.status(404).json({ error: "Not found", })
})

app.listen(port, () => {
    console.log("Server started at http://localhost:3000");
})