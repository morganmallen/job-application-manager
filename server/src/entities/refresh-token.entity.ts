import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';

@Entity('refresh_tokens')
export class RefreshToken {
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ description: 'Refresh token hash' })
  @Column({ unique: true })
  token_hash!: string;

  @ApiProperty({ description: 'User ID who owns this token' })
  @Column({ name: 'user_id' })
  userId!: string;

  @ApiProperty({ description: 'Token expiration date' })
  @Column({ type: 'timestamp', name: 'expires_at' })
  expiresAt!: Date;

  @ApiProperty({ description: 'Whether the token has been revoked' })
  @Column({ default: false, name: 'is_revoked' })
  isRevoked!: boolean;

  @ApiProperty({ description: 'User agent information' })
  @Column({ type: 'text', nullable: true, name: 'user_agent' })
  userAgent!: string;

  @ApiProperty({ description: 'IP address of the client' })
  @Column({ nullable: true, name: 'ip_address' })
  ipAddress!: string;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
