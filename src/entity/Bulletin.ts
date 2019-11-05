import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class Bulletin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 256
  })
  title: string;

  @Column()
  text: string;

  @ManyToOne((_type) => User, (user) => user.bulletins, { nullable: false })
  user: User;
}
