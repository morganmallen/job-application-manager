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
import { ApplicationStatus } from './enums';
import { User } from './user.entity';
import { Company } from './company.entity';
import { ApplicationEvent } from './application-event.entity';
import { Note } from './note.entity';

@Entity('applications')
export class Application {
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ description: 'Job position title' })
  @Column()
  position!: string;

  @ApiProperty({ description: 'Application status', enum: ApplicationStatus })
  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.APPLIED,
  })
  status!: ApplicationStatus;

  @ApiProperty({ description: 'Application date' })
  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'applied_at',
  })
  appliedAt!: Date;

  @ApiProperty({ description: 'Application notes', required: false })
  @Column({ nullable: true })
  notes!: string;

  @ApiProperty({ description: 'Salary information', required: false })
  @Column({ nullable: true })
  salary!: string;

  @ApiProperty({ description: 'Job location', required: false })
  @Column({ nullable: true })
  location!: string;

  @ApiProperty({ description: 'Remote work option' })
  @Column({ default: false })
  remote!: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ApiProperty({ description: 'User ID who owns this application' })
  @Column({ name: 'user_id' })
  userId!: string;

  @ApiProperty({ description: 'Company ID for this application' })
  @Column({ name: 'company_id' })
  companyId!: string;

  @ManyToOne(() => User, (user) => user.applications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Company, (company) => company.applications, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'company_id' })
  company!: Company;

  @OneToMany(() => ApplicationEvent, (event) => event.application)
  events!: ApplicationEvent[];

  @OneToMany(() => Note, (note) => note.application)
  noteEntities!: Note[];
}
