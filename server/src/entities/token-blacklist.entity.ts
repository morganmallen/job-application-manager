import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('token_blacklist')
export class TokenBlacklist {
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ description: 'JWT token hash' })
  @Column({ unique: true })
  token_hash!: string;

  @ApiProperty({ description: 'Token expiration date' })
  @Column({ type: 'timestamp', name: 'expires_at' })
  expiresAt!: Date;

  @ApiProperty({ description: 'Reason for blacklisting' })
  @Column({ nullable: true })
  reason!: string;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
