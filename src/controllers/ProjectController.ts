import type { Request, Response } from 'express'
import Project from '../models/Project.model'
import Task from '../models/Task.model'
import User from '../models/User.model'
import { Op, Sequelize } from 'sequelize'
import Team from '../models/Team.model'

// Consultas
export class ProjectController{
    // Crear un proyecto
    static createProject = async (req : Request, res: Response) => {
        const project = new Project(req.body)
        // Asignamos el manager al proyecto
        project.manager = req.user.idUser
        try {
            await project.save()
            res.send('Proyecto creado correctamente')
        } catch (error) {
            console.log(error)
        }
    }

    // Obtener todos los proyectos
    static getAllProjects = async (req : Request, res: Response) => {
        try {
            const idUser = req.user.idUser;
    
            const projects = await Project.findAll({
                attributes: [
                    [Sequelize.fn('DISTINCT', Sequelize.col('Project.idProject')), 'idProject'],
                    'projectName',
                    'clientName',
                    'description',
                    'manager',
                    'createdAt',
                    'updatedAt'
                ],
                include: [
                    {
                        model: User,
                        as: 'collaborators',
                        where: { idUser },
                        attributes: [],
                        required: false // Esto permite que aún se incluyan los proyectos donde el usuario es solo manager
                    }
                ],
                where: {
                    [Op.or]: [
                        { manager: idUser },
                        Sequelize.literal(`"collaborators"."idUser" = ${idUser}`)
                    ]
                },
                raw: true
            });
    
            res.json(projects);
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Error al obtener proyectos' });
        }
    }

    // Obtener un proyecto por id
    static getProjectById = async (req : Request, res: Response) => {
        try {
            const idProject = +req.params.idProject
            const idUser = req.user.idUser
            const project = await Project.findByPk(req.params.idProject, {
                include: [{ // Hacemos join con task
                    model: Task,
                    attributes: ['idTask', 'name', 'description', 'status']
                }]
            })

            const isManager = project.manager === idUser;

            const isCollaborator = await Team.findOne({
                where: {
                    idProject,
                    idUser
                }
            });

            if (!isManager && !isCollaborator) {
                const error = new Error('Acción no válida');
                res.status(403).json({ error: error.message });
                return
            }

            res.json(project);
        } catch (error) {
            console.log(error)
        }
    }

    // Actualizar un proyecto
    static updatedProject = async (req : Request, res: Response) => {
        try {
            await req.project.update(req.body)
            res.json('Proyecto actualizado correctamente')
        } catch (error) {
            console.log(error)
        }
    }

    // Actualizar un proyecto
    static deleteProject = async (req : Request, res: Response) => {
        try {
            // Validamos que existe el proyecto
            const project = await Project.findByPk(req.params.idProject)
            // Validamos que el usuario pertenece al proyecto
            if(project.manager !== +req.user.idUser){
                const error = new Error('Solo el manager puede eliminar un proyecto')
                res.status(404).json({error: error.message})
                return
            }
            await project.destroy()
            res.json('Proyecto eliminado correctamente')
        } catch (error) {
            console.log(error)
        }
    }
}

