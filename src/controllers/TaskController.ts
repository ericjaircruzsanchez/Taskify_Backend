import type { Request, Response } from 'express'
import Task from '../models/Task.model'
import Project from '../models/Project.model'
import User from '../models/User.model'
import Note from '../models/Note.model'

export class TaskController {
    // Crear una tarea
    static createTask = async (req : Request, res: Response) => {
        try {
            const task = new Task(req.body)
            task.idProject = req.project.idProject
            await task.save()
            res.json('Tarea creada correctamente')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    // Obtener tareas del proyecto
    static getProjectTasks = async (req : Request, res: Response) => {
        try {
            const idProject = req.project.idProject
            const tasks = await Task.findAll({
                where: { idProject },
                include: [{ //Hacemos join con project
                    model: Project,
                    attributes: ['idProject', 'projectName', 'clientName', 'description', 'createdAt', 'updatedAt']
                }]
            })
            res.json(tasks)
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    // Obtener una tarea por id
    static getTaskById = async (req : Request, res: Response) => {
        try {
            const task = await Task.findByPk(req.task.idTask, {
                include: [
                    {
                        model: User,
                        as: 'completedByUser', // Usa el alias definido en el modelo
                        attributes: ['idUser', 'name', 'email']
                    },
                    {
                        model: Note,
                        as: 'notes',
                        attributes: ['idNote', 'content', 'createdBy', 'idTask', 'createdAt', 'updatedAt'],
                        include: [
                            {
                                model: User,
                                as: 'createdByUser',
                                attributes: ['idUser', 'name', 'email']
                            }
                        ]
                    }
                ]
            })
            res.json(task)
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    // Actualizar una tarea
    static updateTask = async (req : Request, res: Response) => {
        try {
            await req.task.update(req.body)
            res.json('Tarea actualizada correctamente')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    // Eliminar tarea de un proyecto
    static deleteTask = async (req : Request, res: Response) => {
        try {
            await req.task.destroy()
            res.json('Tarea eliminada correctamente')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    // Actualizar estado
    static updateStatus = async (req : Request, res: Response) => {
        try {
            const { status } = req.body
            req.task.status = status
            
            if(status === 'pending'){
                req.task.completedBy = null
            }else{
                req.task.completedBy = req.user.idUser
            }
            await req.task.save();
            res.json('Tarea actualizada')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }
}