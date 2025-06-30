import jwt from 'jsonwebtoken'
import User from '../models/User.model'

type UserPayload = {
    id: User['idUser']
}

export const generateJWT = (payload: UserPayload) => {
    const data = {

    }
    // Crea un jwtoken
    const token = jwt.sign( payload, process.env.JWT_SECRET, {
        // Fecha de expiración
        expiresIn: '180d'
    })
    return token
}