import { Table, Model, Column, DataType, ForeignKey, BelongsTo } from "sequelize-typescript";
import User from "./User.model"; // Asegúrate de importar el modelo de User
import Task from "./Task.model"; // Asegúrate de importar el modelo de Task

@Table({
    tableName: 'notes' // Normalmente en plural
})
class Note extends Model {
    @Column({
        type: DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    })
    declare idNote: number;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare content: string;

    @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    declare createdBy: number;

    @BelongsTo(() => User, 'createdBy')
    createdByUser!: User;

    @ForeignKey(() => Task)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        onDelete: 'CASCADE',
    })
    declare idTask: number;

    @BelongsTo(() => Task, 'idTask')
    task!: Task;
}

export default Note;