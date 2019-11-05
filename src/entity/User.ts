import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Bulletin } from "./Bulletin";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @OneToMany((_type) => Bulletin, (bulletin) => bulletin.user) // note: we will create author property in the Photo class below
  bulletins: Bulletin[];
}
