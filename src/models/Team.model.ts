import { Table, Model, Column, ForeignKey, DataType } from "sequelize-typescript";
import User from "./User.model";
import Project from "./Project.model";

@Table({
    tableName: 'team',
    timestamps: false
  })
  class Team extends Model {
    @ForeignKey(() => Project)
    @Column({
      type: DataType.INTEGER
    })
    declare idProject: number;
  
    @ForeignKey(() => User)
    @Column({
      type: DataType.INTEGER
    })
    declare idUser: number;
  }
  
  export default Team;