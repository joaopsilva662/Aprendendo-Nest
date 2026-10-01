import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../Prisma/prisma.service.js';

import { CreateOrderDto } from './dto/create-order.dto.js';
import { UpdateOrderDto } from './dto/update-order.dto.js';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto) {
    const { userId, items } = createOrderDto;

    // Verifica se o pedido possui itens
    if (!items || items.length === 0) {
      throw new BadRequestException(
        'O pedido deve possuir pelo menos um item',
      );
    }

    // Agrupa produtos repetidos
    const groupedItems = items.reduce(
      (acc, item) => {
        if (!acc[item.productId]) {
          acc[item.productId] = 0;
        }

        acc[item.productId] += item.quantity;

        return acc;
      },
      {} as Record<number, number>,
    );

    const normalizedItems = Object.entries(groupedItems).map(
      ([productId, quantity]) => ({
        productId: Number(productId),
        quantity,
      }),
    );

    return this.prisma.$transaction(async (tx) => {
      // Verifica se o usuário existe
      const user = await tx.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('Usuário não encontrado');
      }

      // Busca os produtos
      const productIds = normalizedItems.map(
        (item) => item.productId,
      );

      const products = await tx.product.findMany({
        where: {
          id: {
            in: productIds,
          },
        },
      });

      // Verifica se todos os produtos existem
      if (products.length !== productIds.length) {
        throw new NotFoundException(
          'Um ou mais produtos não foram encontrados',
        );
      }

      let total = 0;

      const orderItems = normalizedItems.map((item) => {
        const product = products.find(
          (product) => product.id === item.productId,
        );

        if (!product) {
          throw new NotFoundException(
            `Produto ${item.productId} não encontrado`,
          );
        }

        // Verifica estoque
        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Estoque insuficiente para o produto "${product.name}". Estoque disponível: ${product.stock}`,
          );
        }

        // Calcula subtotal
        const subtotal =
          Number(product.price) * item.quantity;

        total += subtotal;

        return {
          quantity: item.quantity,
          price: product.price,
          productId: product.id,
        };
      });

      // Diminui o estoque
      for (const item of normalizedItems) {
        const result = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: {
              gte: item.quantity,
            },
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        // Segurança contra alteração simultânea do estoque
        if (result.count === 0) {
          throw new BadRequestException(
            'O estoque de um dos produtos não está mais disponível',
          );
        }
      }

      // Cria o pedido
      const order = await tx.order.create({
        data: {
          userId,
          total,

          items: {
            create: orderItems,
          },
        },

        include: {
          user: true,

          items: {
            include: {
              product: true,
            },
          },
        },
      });

      return order;
    });
  }

  async findAll() {
    return this.prisma.order.findMany({
      include: {
        user: true,

        items: {
          include: {
            product: true,
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },

      include: {
        user: true,

        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Pedido não encontrado');
    }

    return order;
  }

  async update(id: number, updateOrderDto: UpdateOrderDto) {
    await this.findOne(id);

    return this.prisma.order.update({
      where: { id },

      data: {
        status: updateOrderDto.status,
      },

      include: {
        user: true,

        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.order.delete({
      where: { id },
    });
  }
}