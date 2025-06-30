import type { Request, Response } from 'express'
import Token from '../models/Token.model'
import User from '../models/User.model'
import { checkPassword, hashPassword } from '../utils/auth'
import { generateToken } from '../utils/token'
import { AuthEmail } from '../emails/AuthEmail'
import { DateTime } from 'luxon'
import { generateJWT } from '../utils/jwt'

export class AuthController {
    static createAccount = async (req : Request, res : Response) => {
        try {
            const { password, email } = req.body
            // Verificar duplicados
            const userExist = await User.findOne({
                where: { email }
            })
            if(userExist){
                const error = new Error('El usuario ya está registrado')
                res.status(409).json({error: error.message})
                return 
            }
            // Crea el usuario
            const user = new User(req.body)
            // Hash password
            user.password = await hashPassword(password)
            await user.save()
            // Generando token
            const token = new Token()
            token.token = generateToken()
            // Relacionamos el id usuario con el usuario del token
            token.idUser = user.idUser
            await token.save()
            AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            })
            res.send('Cuenta creada, revisa tu email para confirmarla')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static confirmAccount = async (req: Request, res: Response) => {
        try {
            const { token } = req.body
            const tokenExists = await Token.findOne({ where: { token } })

            // Comprobamos que el token exista
            if (!tokenExists) {
                const error = new Error('Token no válido')
                res.status(404).json({ error: error.message})
            }

            const tokenCreado = DateTime.fromJSDate(tokenExists.createdAt)
            const fechaActual = DateTime.now()
            const expirado = fechaActual.diff(tokenCreado, "minutes").minutes > 10

            // Verificamos que no haya expirado
            if (expirado) {
                await tokenExists.destroy()
                res.status(400).json({ error: "Token expirado" })
            }

            const user = await User.findByPk(tokenExists.idUser)
            user.confirmed = true

            await user.save()
            await tokenExists.destroy()
            res.send('Cuenta confirmada correctamente')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static login = async (req: Request, res: Response) => {
        try {
            
            const { email, password } = req.body
            const user = await User.findOne({
                where: { email }
            })
            // Verificamos que existe el correo
            if(!user){
                const error = new Error('Usuario no encontrado')
                res.status(404).json({ error: error.message})
            }
            if(!user.confirmed){
                const token = new Token()
                token.idUser = user.idUser
                token.token = generateToken()
                await token.save()

                AuthEmail.sendConfirmationEmail({
                    email: user.email,
                    name: user.name,
                    token: token.token
                })
                const error = new Error('La cuenta no ha sido confirmada, hemos enviado un e-mail de confirmación')
                res.status(404).json({ error: error.message})
            }

            // Revisamos password
            const isPasswordCorrect = await checkPassword(password, user.password)

            // En caso de que no sea correcto
            if(!isPasswordCorrect){
                const error = new Error('Password incorrecto')
                res.status(404).json({ error: error.message})
            }

            // Instanciamos el JWT
            const token = generateJWT({id: user.idUser})

            res.send(token)

        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static requestConfirmationCode = async (req : Request, res : Response) => {
        try {
            const { email } = req.body
            // Usuario existente
            const user = await User.findOne({
                where: { email }
            })
            if(!user){
                const error = new Error('El usuario no está registrado')
                res.status(404).json({error: error.message})
                return 
            }
            if(user.confirmed){
                const error = new Error('El usuario ya está confirmado')
                res.status(403).json({error: error.message})
                return 
            }
            // Generando token
            const token = new Token()
            token.token = generateToken()
            // Relacionamos el id usuario con el usuario del token
            token.idUser = user.idUser
            await token.save()
            AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            })
            res.send('Se envió un nuevo token a tu e-mail')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static forgotPassword = async (req : Request, res : Response) => {
        try {
            const { email } = req.body
            // Usuario existente
            const user = await User.findOne({
                where: { email }
            })
            if(!user){
                const error = new Error('El usuario no está registrado')
                res.status(404).json({error: error.message})
                return 
            }
            
            // Generando token
            const token = new Token()
            token.token = generateToken()
            // Relacionamos el id usuario con el usuario del token
            token.idUser = user.idUser
            await token.save()
            AuthEmail.sendPasswordResetToken({
                email: user.email,
                name: user.name,
                token: token.token
            })
            res.send('Revisa tu e-mail para reestablecer la contraseña')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static validateToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.body
            const tokenExists = await Token.findOne({ where: { token } })

            // Comprobamos que el token exista
            if (!tokenExists) {
                const error = new Error('Token no válido')
                res.status(404).json({ error: error.message})
            }

            const tokenCreado = DateTime.fromJSDate(tokenExists.createdAt)
            const fechaActual = DateTime.now()
            const expirado = fechaActual.diff(tokenCreado, "minutes").minutes > 10

            // Verificamos que no haya expirado
            if (expirado) {
                await tokenExists.destroy()
                res.status(400).json({ error: "Token expirado" })
            }

            res.send('Token válido, define tu nuevo password')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static updatePasswordWithToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.params
            const { password } = req.body
            const tokenExists = await Token.findOne({ where: { token } })

            // Comprobamos que el token exista
            if (!tokenExists) {
                const error = new Error('Token no válido')
                res.status(404).json({ error: error.message})
                return
            }

            const tokenCreado = DateTime.fromJSDate(tokenExists.createdAt)
            const fechaActual = DateTime.now()
            const expirado = fechaActual.diff(tokenCreado, "minutes").minutes > 10

            // Verificamos que no haya expirado
            if (expirado) {
                await tokenExists.destroy()
                res.status(400).json({ error: "Token expirado" })
            }

            // Obtenemos la constraseña
            const user = await User.findByPk(tokenExists.idUser)
            user.password = await hashPassword(password)
            console.log(user.password)
            await user.save()

            // Borramos el token una vez cambiada la contraseña
            await tokenExists.destroy()
            res.send('El password se modificó correctamente')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static user = async (req: Request, res: Response) => {
        res.json(req.user)
    }

    static updateProfile = async (req: Request, res: Response) => {
        try {
            const { name, email } = req.body

            const userExist = await User.findOne({
                where: {email}
            })

            if(userExist && userExist.idUser !== req.user.idUser){
                const error = new Error('Ese email ya está registrado')
                res.status(409).json({error: error.message})
                return
            }
            req.user.name = name
            req.user.email = email
            await req.user.save()
            res.send('Perfil actualizado correctamente')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static updatedCurrentUserPassword = async (req: Request, res: Response) => {
        try {
            const { current_password, password } = req.body

            const user = await User.findByPk(req.user.idUser)

            const isPasswordCorrect = await checkPassword(current_password, user.password)

            if(!isPasswordCorrect){
                const error = new Error('El password actual es incorrecto')
                res.status(401).json({error: error.message})
                return
            }

            user.password = await hashPassword(password)
            await user.save()
            res.send('El password se modificó correctamente')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static checkPassword = async (req: Request, res: Response) => {
        try {
            const { password } = req.body

            const user = await User.findByPk(req.user.idUser)

            const isPasswordCorrect = await checkPassword(password, user.password)

            if(!isPasswordCorrect){
                const error = new Error('El password es incorrecto')
                res.status(401).json({error: error.message})
                return
            }
            res.send('Password correcto')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }
}
