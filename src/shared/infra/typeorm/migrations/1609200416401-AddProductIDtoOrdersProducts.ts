import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from "typeorm"

export default class AddProductIDtoOrdersProducts1609200416401 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('orders_products', new TableColumn({
      name: 'product_id',
      type: 'uuid',
      isNullable: true,
    }))

    await queryRunner.createForeignKey('orders_products', new TableForeignKey({
      name: 'ProductsOrdersProduct',
      columnNames: ['product_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'products',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    }))
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('orders_products', 'ProductsOrdersProduct')
    await queryRunner.dropColumn('orders_products', 'product_id')
  }

}
