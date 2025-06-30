import { BelongsToMany, Column, DataType, HasMany, Model, Table } from "sequelize-typescript";
import Project from "./Project.model";
import Team from "./Team.model";

@Table({
    tableName: 'user'
})

class User extends Model {
    @Column({
        type: DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    })
    declare idUser: number;

    @Column({
        type: DataType.STRING,
        unique: true,
        allowNull: false,
        set(value: string) {
            this.setDataValue('email', value.toLowerCase());
        }
    })
    declare email: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare password: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare name: string;

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false
    })
    declare confirmed: boolean;

    @HasMany(() => Project, 'manager')
    declare managedProjects: Project[];

    @BelongsToMany(() => Project, () => Team)
    declare collaboratedProjects: Project[];
}

export default User;