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
  @Column()
  userId!: string;

  @ApiProperty({ description: 'Token expiration date' })
  @Column({ type: 'timestamp' })
  expiresAt!: Date;

  @ApiProperty({ description: 'Whether the token has been revoked' })
  @Column({ default: false })
  isRevoked!: boolean;

  @ApiProperty({ description: 'User agent information' })
  @Column({ type: 'text', nullable: true })
  userAgent!: string;

  @ApiProperty({ description: 'IP address of the client' })
  @Column({ nullable: true })
  ipAddress!: string;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;
}
