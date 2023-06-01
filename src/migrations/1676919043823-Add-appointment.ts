import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddAppointment1676919043823 implements MigrationInterface {
    name = 'AddAppointment1676919043823'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE \`appointment\` (\`appointmentUUID\` varchar(36) NOT NULL, \`studentUUID\` varchar(255) NOT NULL, \`teacherUUID\` varchar(255) NOT NULL, \`date\` int NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`appointmentUUID\`)) ENGINE=InnoDB`
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`appointment\``)
    }
}
