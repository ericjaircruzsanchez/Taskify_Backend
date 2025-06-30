import type { Response, Request, NextFunction } from "express";
import Project from "../models/Project.model";

// Declaramos de forma global el req para acceder al idProject
declare global {
    namespace Express {
        interface Request {
            project: Project
        }
    }
}

export async function projectExist(req: Request, res: Response, next: NextFunction){
    try {
        const { idProject } = req.params
        const project = await Project.findByPk(idProject)
        if (!project) {
            res.status(404).json({
                error: 'Proyecto no encontrado'
            })
            return;
        }
        // Colocamos en el request el project para usarlo de manera global
        req.project = project
        next()
    } catch (error) {
        res.status(500).json({error: 'Hubo un error'})
    }
}