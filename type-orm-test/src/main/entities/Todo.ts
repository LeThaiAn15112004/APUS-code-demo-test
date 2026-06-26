import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'

@Entity({ name: 'todos' })
export class Todo {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'text', nullable: false })
  title!: string

  @Column({ type: 'text', nullable: true })
  description!: string

  @Column({ name: 'is_completed', type: 'boolean', default: false })
  isCompleted!: boolean

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt!: Date
}

