import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'

@Entity({ name: 'members' })
export class Member {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ type: 'text', nullable: false })
    name!: string

    @Column({ type: 'text', nullable: true })
    email!: string

    @Column({ type: 'text', nullable: true })
    phone!: string

    @Column({ name: 'is_active', type: 'boolean', default: true })
    isActive!: boolean

    @CreateDateColumn({ name: 'created_at', type: 'datetime' })
    createdAt!: Date
}