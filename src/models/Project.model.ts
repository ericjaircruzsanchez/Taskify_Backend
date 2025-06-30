import { Table, Model, Column, DataType, HasMany, ForeignKey, BelongsTo, BelongsToMany } from "sequelize-typescript";
import Task from "./Task.model"; // Importa el modelo de Task
import User from "./User.model";
import Team from "./Team.model";

@Table({
    tableName: 'projects'
})

class Project extends Model {
    @Column({
        type: DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    })
    declare idProject: number;

    @Column({
        type: DataType.STRING
    })
    declare projectName: string;

    @Column({
        type: DataType.STRING
    })
    declare clientName: string;

    @Column({
        type: DataType.STRING
    })
    declare description: string;

    @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER
    })
    declare manager: number;

    @BelongsTo(() => User)
    declare managerUser: User;
    
    // Relacionando proyectos con tareas
    @HasMany(() => Task)
    tasks!: Task[];

    // Relacionando team
    @BelongsToMany(() => User, () => Team, 'idProject', 'idUser')
    declare collaborators: User[];
}

export default Project;