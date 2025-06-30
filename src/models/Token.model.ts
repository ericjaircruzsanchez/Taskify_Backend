import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import User from "./User.model";

@Table({
    tableName: 'token',
    timestamps: false
})
class Token extends Model {
    @Column({
        type: DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    })
    declare idToken: number; 

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare token: string;

    @Column({
        type: DataType.DATE,
        defaultValue:() => new Date(),
        allowNull: false
    })
    declare createdAt: Date;

    // Clave foranea
    @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    declare idUser: number;

    // Relación de tablas
    @BelongsTo(() => User)
    user!: User;

}

export default Token;