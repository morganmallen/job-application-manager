import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
import { Application } from './application.entity';

@Entity('companies')
export class Company {
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ description: 'Company name' })
  @Column()
  name!: string;

  @ApiProperty({ description: 'Company website URL', required: false })
  @Column({ nullable: true })
  website!: string;

  @ApiProperty({ description: 'Company description', required: false })
  @Column({ nullable: true })
  description!: string;

  @ApiProperty({ description: 'Company location', required: false })
  @Column({ nullable: true })
  location!: string;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ApiProperty({ description: 'User ID who owns this company' })
  @Column({ name: 'user_id' })
  userId!: string;

  @ManyToOne(() => User, (user) => user.companies, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @OneToMany(() => Application, (application) => application.company)
  applications!: Application[];
}
