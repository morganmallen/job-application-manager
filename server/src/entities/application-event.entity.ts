import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { EventType } from './user.entity';
import { Application } from './application.entity';

@Entity('application_events')
export class ApplicationEvent {
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ description: 'Event type', enum: EventType })
  @Column({
    type: 'enum',
    enum: EventType,
  })
  type!: EventType;

  @ApiProperty({ description: 'Event title' })
  @Column()
  title!: string;

  @ApiProperty({ description: 'Event description', required: false })
  @Column({ nullable: true })
  description!: string;

  @ApiProperty({ description: 'Scheduled date and time', required: false })
  @Column({ type: 'timestamp', nullable: true })
  scheduledAt!: Date;

  @ApiProperty({ description: 'Completion date and time', required: false })
  @Column({ type: 'timestamp', nullable: true })
  completedAt!: Date;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  createdAt!: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updatedAt!: Date;

  @ApiProperty({ description: 'Application ID this event belongs to' })
  @Column()
  applicationId!: string;

  @ManyToOne(() => Application, (application) => application.events, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'applicationId' })
  application!: Application;
}
