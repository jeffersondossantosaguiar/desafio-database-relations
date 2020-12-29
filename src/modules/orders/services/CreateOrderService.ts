import { inject, injectable } from 'tsyringe'

import AppError from '@shared/errors/AppError'

import IProductsRepository from '@modules/products/repositories/IProductsRepository'
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository'
import Order from '../infra/typeorm/entities/Order'
import IOrdersRepository from '../repositories/IOrdersRepository'

interface IProduct {
  id: string
  quantity: number
}

interface IRequest {
  customer_id: string
  products: IProduct[]
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) { }

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const checkCustomerExists = await this.customersRepository.findById(customer_id)

    if (!checkCustomerExists) {
      throw new AppError("This customer does not exist")
    }

    const allProductsInOrder = await this.productsRepository.findAllById(products)

    if (!allProductsInOrder.length) {
      throw new AppError("Cold not find products with these ids")
    }

    const existentProductsIds = allProductsInOrder.map(product => product.id)

    const checkInexistentProducts = products.filter(
      product => !existentProductsIds.includes(product.id)
    )

    if (checkInexistentProducts.length) {
      throw new AppError(`cold not found ${checkInexistentProducts[0].id}`)
    }

    const findProductsWithNoQuantityAvailable = products.filter(
      product => allProductsInOrder.filter(p => p.id === product.id)[0].quantity < product.quantity
      //1:35:50
    )

    if (findProductsWithNoQuantityAvailable.length) {
      throw new AppError(`The quantity is not available`)
    }

    const serealizedProducts = products.map(product => ({
      product_id: product.id,
      quantity: product.quantity,
      price: allProductsInOrder.filter(p => p.id === product.id)[0].price
    }))

    const order = await this.ordersRepository.create({
      customer: checkCustomerExists,
      products: serealizedProducts
    })

    const orderedProductsQuantity = products.map(product => ({
      id: product.id,
      quantity: allProductsInOrder.filter(p => p.id === product.id)[0].quantity - product.quantity
    }))

    await this.productsRepository.updateQuantity(orderedProductsQuantity)

    return order
  }
}

export default CreateOrderService
