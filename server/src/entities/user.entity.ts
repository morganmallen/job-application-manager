import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Company } from './company.entity';
import { Application } from './application.entity';

export enum ApplicationStatus {
  APPLIED = 'APPLIED',
  INTERVIEWING = 'INTERVIEWING',
  OFFER = 'OFFER',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
  ACCEPTED = 'ACCEPTED',
}

export enum EventType {
  PHONE_SCREEN = 'PHONE_SCREEN',
  TECHNICAL_INTERVIEW = 'TECHNICAL_INTERVIEW',
  BEHAVIORAL_INTERVIEW = 'BEHAVIORAL_INTERVIEW',
  CODING_CHALLENGE = 'CODING_CHALLENGE',
  TAKE_HOME_ASSIGNMENT = 'TAKE_HOME_ASSIGNMENT',
  ONSITE_INTERVIEW = 'ONSITE_INTERVIEW',
  REFERENCE_CHECK = 'REFERENCE_CHECK',
  NEGOTIATION = 'NEGOTIATION',
  OTHER = 'OTHER',
}

@Entity('users')
export class User {
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ description: 'User email address' })
  @Column({ unique: true })
  email!: string;

  @ApiProperty({ description: 'User first name' })
  @Column()
  first_name!: string;

  @ApiProperty({ description: 'User last name' })
  @Column()
  last_name!: string;

  @ApiProperty({ description: 'Hashed user password' })
  @Column()
  password_hash!: string;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  createdAt!: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => Company, (company) => company.user)
  companies!: Company[];

  @OneToMany(() => Application, (application) => application.user)
  applications!: Application[];
}
