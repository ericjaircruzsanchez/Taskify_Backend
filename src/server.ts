import express from "express";
import db from "./config/db";
import colors from 'colors'
import cors from 'cors'
import { corsConfig } from "./config/cors";
import morgan from "morgan";
import authRoutes from './routes/authRoutes'
import projectRoutes from './routes/projectRoutes'

// Conectando a la base de datos
async function connectDB(){
    try {
        await db.authenticate()
        db.sync()
        console.log(colors.magenta.bold('Conexion exitosa a la BD'))
        
    } catch (error) {
        console.log(colors.red.bold(error))
    }
}

connectDB()

const app = express()

// Ping
app.get('/ping', cors(), (req, res) => {
  res.status(200).send('pong')
})

// Permitimos la conexion con cors
app.use(cors(corsConfig))

// Usando morgan 
app.use(morgan('dev'))

// Habilitamos la lectura json
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)



export default app