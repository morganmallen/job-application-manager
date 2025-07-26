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
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => Company, (company) => company.user)
  companies!: Company[];

  @OneToMany(() => Application, (application) => application.user)
  applications!: Application[];
}
