import { Router } from "express";
import { body, param } from 'express-validator'
import { ProjectController } from "../controllers/ProjectController";
import { handleInputErrors } from "../middleware/validation";
import { TaskController } from "../controllers/TaskController";
import { projectExist } from "../middleware/project";
import { hasAuthorization, taskBelongsToProject, taskExist } from "../middleware/task";
import { authenticate } from "../middleware/auth";
import { TeamMemberController } from "../controllers/TeamController";
import { NoteController } from "../controllers/NoteController";

const router = Router()

// Routing
router.param('idProject', projectExist)
router.param('idTask', taskExist)
router.param('idTask', taskBelongsToProject)
router.use(authenticate)

// Crear proyecto
router.post('/', 
    body('projectName')
        .notEmpty().withMessage('El nombre del proyecto es obligatorio'),
    body('clientName')
        .notEmpty().withMessage('El nombre del cliente es obligatorio'),
    body('description')
        .notEmpty().withMessage('La descripción del proyecto es obligatorio'),
    handleInputErrors,
    ProjectController.createProject
)

// Obtener todos los proyectos
router.get('/', 
    ProjectController.getAllProjects
)

// Obtener un proyecto por su id
router.get('/:idProject', 
    param('idProject').isInt().withMessage('Id no válido'),
    handleInputErrors,
    ProjectController.getProjectById
)

// Editar proyecto
router.patch('/:idProject',
    param('idProject').isInt().withMessage('Id no válido'),
    body('projectName')
        .notEmpty().withMessage('El nombre del proyecto no puede ir vacío'),
    body('clientName')
        .notEmpty().withMessage('El nombre del cliente no puede ir vacío'),
    body('description')
        .notEmpty().withMessage('La descripción del proyecto no puede ir vacío'),
    handleInputErrors,
    hasAuthorization,
    ProjectController.updatedProject
)

// Eliminar proyecto
router.delete('/:idProject',
    param('idProject').isInt().withMessage('Id no válido'),
    handleInputErrors,
    hasAuthorization,
    ProjectController.deleteProject
)

// Routes para las tareas
// Crea la tarea
router.post('/:idProject/tasks',
    body('name')
        .notEmpty().withMessage('El nombre de la tarea es obligatorio'),
    body('description')
        .notEmpty().withMessage('La descripción de la tarea es obligatorio'),
    handleInputErrors,
    TaskController.createTask
)

// Obtiene las tareas de un proyecto
router.get('/:idProject/tasks',
    handleInputErrors,
    TaskController.getProjectTasks
)

// Obtiene una tarea del proyecto
router.get('/:idProject/tasks/:idTask',
    param('idTask').isInt().withMessage('Id no válido'),
    handleInputErrors,
    TaskController.getTaskById
)

// Actualiza la tarea de un proyecto
router.patch('/:idProject/tasks/:idTask',
    hasAuthorization,
    param('idTask').isInt().withMessage('Id no válido'),
    body('name')
        .notEmpty().withMessage('El nombre de la tarea es obligatorio'),
    body('description')
        .notEmpty().withMessage('La descripción de la tarea es obligatorio'),
    handleInputErrors,
    TaskController.updateTask
)

// Eliminar una tarea de un proyecto
router.delete('/:idProject/tasks/:idTask',
    hasAuthorization,
    param('idTask').isInt().withMessage('Id no válido'),
    handleInputErrors,
    TaskController.deleteTask
)

// Actualizar estado
router.patch('/:idProject/tasks/:idTask/status',
    param('idTask').isInt().withMessage('Id no válido'),
    body('status')
        .notEmpty().withMessage('El estado es obligatorio'),
    handleInputErrors,
    TaskController.updateStatus
)

// Crear team
router.post('/:idProject/team/find',
    body('email')
        .isEmail().toLowerCase().withMessage('E-mail no válido'),
    handleInputErrors,
    TeamMemberController.findMemberByEmail
)

router.get('/:idProject/team',
    TeamMemberController.getProjectTeam
)

router.post('/:idProject/team',
    body('idUser')
        .isInt().withMessage('Id no válido'),
    handleInputErrors,
    TeamMemberController.addMemberById
)

router.delete('/:idProject/team/:idUser',
    param('idUser')
        .isInt().withMessage('Id no válido'),
    handleInputErrors,
    TeamMemberController.removeMemberById
)

// Rutas para las notas
// Creamos nota
router.post('/:idProject/tasks/:idTask/notes',
    body('content')
        .notEmpty().withMessage('El contenido de la nota es obligatorio'),
    handleInputErrors,
    NoteController.createNote
)

// Obtenemos las notas de una tarea
router.get('/:idProject/tasks/:idTask/notes',
    NoteController.getTaskNotes
)

router.delete('/:idProject/tasks/:idTask/notes/:idNote',
    param('idNote')
        .isInt().withMessage('Id no válido'),
    NoteController.deleteNote
)

export default router