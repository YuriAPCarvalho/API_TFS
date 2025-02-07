import express from 'express'
import cors from 'cors'
import TaskRoute from './src/routes/TaskRoute.js'
import * as dotenv from 'dotenv'

const app = express()
dotenv.config()

// dotenv.config()
app.use(cors())

app.use(express.json())

app.use(TaskRoute)

app.listen(process.env.PORT | 3200, () => console.log(`Rodando na porta ${process.env.PORT}`))