import type { Request, Response } from 'express'
import Note from '../models/Note.model'

type NoteParams = {
    idNote: Note['idNote']
}

export class NoteController {
    static createNote = async (req : Request<{}, {}, Note>, res : Response) => {
        try {
            const { content } = req.body
            const note = new Note()
            note.content = content
            note.createdBy = req.user.idUser
            note.idTask = req.task.idTask

            await note.save()
            res.send('Nota creada correctamente')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static getTaskNotes = async (req : Request, res : Response) => {
        try {
            const { idTask } = req.params
            const notes = await Note.findAll({
                where: {idTask}
            })
            res.send(notes)
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static deleteNote = async (req : Request<NoteParams>, res : Response) => {
        try {
            const { idNote } = req.params
            const note = await Note.findByPk(idNote)
            if(!note) {
                const error = new Error('Nota no encontrada')
                res.status(404).json({error: error.message})
            }

            if(note.createdBy !== req.user.idUser){
                const error = new Error('Acción no válida')
                res.status(409).json({error: error.message})
            }
            await note.destroy()
            res.send('Nota eliminada')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }
}