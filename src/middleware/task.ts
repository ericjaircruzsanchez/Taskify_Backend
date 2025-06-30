import type { Response, Request, NextFunction } from "express";
import Task from "../models/Task.model";

// Declaramos de forma global el req para acceder al idProject
declare global {
    namespace Express {
        interface Request {
            task: Task
        }
    }
}

export async function taskExist(req: Request, res: Response, next: NextFunction){
    try {
        const { idTask } = req.params
        const task = await Task.findByPk(idTask)
        if (!task) {
            res.status(404).json({
                error: 'Tarea no encontrada'
            })
            return;
        }
        // Colocamos en el request el project para usarlo de manera global
        req.task = task
        next()
    } catch (error) {
        res.status(500).json({error: 'Hubo un error'})
    }
}

export async function taskBelongsToProject(req: Request, res: Response, next: NextFunction){
    try {
        if(req.task.idProject !== req.project.idProject){
            res.status(400).json({
                error: 'Acción no válida'
            })
            return;
        }
        next()
    } catch (error) {
        res.status(500).json({error: 'Hubo un error'})
    }
}

export async function hasAuthorization(req: Request, res: Response, next: NextFunction){
    try {
        if(req.user.idUser !== req.project.manager){
            res.status(400).json({
                error: 'Acción no válida'
            })
            return;
        }
        next()
    } catch (error) {
        res.status(500).json({error: 'Hubo un error'})
    }
}