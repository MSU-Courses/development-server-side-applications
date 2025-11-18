import express from 'express'
import rateLimiter from './middleware/rateLimiter.js'

const app = express()
const port = 3000

app.use(express.json())
app.use(rateLimiter({ capacity: 5, refillRate: 2}));

app.get('/', (req, res) => {
    res.json({
        message: "Hello world!"
    })
})

app.use((req,res) => {
    res.redirect('/')
})

app.listen(port, () => console.log(`http://localhost:${port}`))