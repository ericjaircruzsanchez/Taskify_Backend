import { Table, Model, Column, DataType, ForeignKey, BelongsTo, HasMany } from "sequelize-typescript";
import Project from "./Project.model"; // Importa el modelo de Project
import { toDefaultValue } from "sequelize/lib/utils";
import User from "./User.model";
import Note from "./Note.model";

const taskStatus = {
    PENDING: 'pending',
    ON_HOLD: 'onHold',
    IN_PROGRESS: 'inProgress',
    UNDER_REVIEW: 'underReview',
    COMPLETED: 'completed'
} as const

export type TaskStatus = typeof taskStatus[keyof typeof taskStatus]

@Table({
    tableName: 'tasks'
})
class Task extends Model {
    @Column({
        type: DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    })
    declare idTask: number; 

    @Column({
        type: DataType.STRING
    })
    declare name: string;

    @Column({
        type: DataType.STRING
    })
    declare description: string;

    @Column({
        type: DataType.ENUM(...Object.values(taskStatus)),
        allowNull: false,
        defaultValue: taskStatus.PENDING
    })
    declare status: TaskStatus;

    // Clave foranea
    @ForeignKey(() => Project)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        onDelete: 'CASCADE'
    })
    declare idProject: number;

    @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER,
        allowNull: true
    })
    declare completedBy: number | null;

    @BelongsTo(() => User, 'completedBy')
    declare completedByUser: User;

    // Relación de tablas
    @BelongsTo(() => Project)
    project!: Project;

    @HasMany(() => Note, 'idTask')
    notes!: Note[];
}

export default Task;