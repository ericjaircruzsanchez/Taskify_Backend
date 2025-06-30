import type { Request, Response } from "express"
import User from "../models/User.model"
import Team from "../models/Team.model"
import Project from "../models/Project.model"

export class TeamMemberController {
    // Buscamos a un integrante por email
    static findMemberByEmail = async (req : Request, res : Response) => {
        try {
            const { email } = req.body
            // Buscar usuario
            const user = await User.findOne({
                attributes: ['idUser', 'email', 'name'],
                where: { email } 
            })

            if(!user){
                const error = new Error('Usuario no encontrado')
                res.status(404).json({error: error.message})
                return
            }
            res.json(user)
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static getProjectTeam = async (req: Request, res: Response) => {
        try {
            const { idProject } = req.params;
    
            const project = await Project.findOne({
                where: { idProject },
                include: [{
                    model: User,
                    as: 'collaborators',
                    through: { attributes: [] },
                    attributes: ['idUser', 'email', 'name']
                }]
            });
    
            if (!project) {
                res.status(404).json({ error: 'Proyecto no encontrado' });
                return
            }
    
            res.json(project.collaborators);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Hubo un error' });
        }
    }

    // Agregamos un integrante al equipo
    static addMemberById = async (req : Request, res : Response) => {
        try {
            const { idUser } = req.body
            const { idProject } = req.params
            // Buscar usuario
            const user = await User.findByPk(idUser, {
                attributes: ['idUser'],
            })

            // El usuario no existe
            if(!user){
                const error = new Error('Usuario no encontrado')
                res.status(404).json({error: error.message})
                return
            }

            // Buscamos el usuario en el equipo
            const userTeam = await Team.findOne({
                where: { idUser, idProject }
            })
            

            if(userTeam){
                const error = new Error('El usuario ya existe en el proyecto')
                res.status(409).json({error: error.message})
                return
            }
            // Agregar al equipo
            await Team.create({
                idUser,
                idProject
            })
            
            res.send('El usuario se ha agregado al proyecto')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    // Eliminamos un integrante del equipo
    static removeMemberById = async (req : Request, res : Response) => {
        try {
            const { idUser } = req.params
            const { idProject } = req.params
            // Buscamos el usuario en el equipo
            const userTeam = await Team.findOne({
                where: { idUser, idProject }
            })
            if(!userTeam){
                const error = new Error('El integrante no se encuentra en el proyecto')
                res.status(409).json({error: error.message})
                return
                
            }
            await userTeam.destroy()
            res.send('Usuario eliminado correctamente')
            return
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }
}