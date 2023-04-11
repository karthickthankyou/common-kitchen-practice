import {
  Resolver,
  Query,
  Mutation,
  Args,
  Parent,
  ResolveField,
} from '@nestjs/graphql'

import { FoodItemsService } from './food-items.service'
import { FoodItem } from './entities/food-item.entity'
import { FindManyFoodItemArgs, FindUniqueFoodItemArgs } from './dto/find.args'
import { CreateFoodItemInput } from './dto/create-food-item.input'
import { UpdateFoodItemInput } from './dto/update-food-item.input'
import { Kitchen } from '../kitchens/entities/kitchen.entity'
import { PrismaService } from 'src/common/prisma/prisma.service'
import { Schedule } from '../schedules/entities/schedule.entity'
import { CustomerReview } from '../customer-reviews/entities/customer-review.entity'
import {
  AllowAuthenticated,
  GetUser,
} from 'src/common/decorators/auth/auth.decorator'
import { GetUserType } from '@common-kitchen-org/types'
import { checkRowLevelPermission } from 'src/common/guards'
import { MeiliSearchService } from 'src/meilisearch/meilisearch.service'

@Resolver(() => FoodItem)
export class FoodItemsResolver {
  constructor(
    private readonly foodItemsService: FoodItemsService,
    private readonly meiliSearchService: MeiliSearchService,
    private readonly prisma: PrismaService,
  ) {}

  @AllowAuthenticated()
  @Mutation(() => FoodItem)
  async createFoodItem(
    @Args('createFoodItemInput') args: CreateFoodItemInput,
    @GetUser() user: GetUserType,
  ) {
    const kitchen = await this.prisma.kitchen.findUnique({
      where: { id: args.kitchenId },
    })
    checkRowLevelPermission(user, kitchen.cookId)
    const foodItem = await this.foodItemsService.create(args)
    await this.meiliSearchService.addDocuments('foodItems', [foodItem])
    return foodItem
  }

  @AllowAuthenticated('admin')
  @Query(() => [FoodItem], { name: 'foodItems' })
  findAll(@Args() args: FindManyFoodItemArgs) {
    return this.foodItemsService.findAll(args)
  }

  @Query(() => FoodItem, { name: 'foodItem' })
  findOne(@Args() args: FindUniqueFoodItemArgs) {
    return this.foodItemsService.findOne(args)
  }

  @AllowAuthenticated()
  @Mutation(() => FoodItem)
  async updateFoodItem(
    @Args('updateFoodItemInput') args: UpdateFoodItemInput,
    @GetUser() user: GetUserType,
  ) {
    const kitchen = await this.prisma.kitchen.findUnique({
      where: { id: args.kitchenId },
    })
    checkRowLevelPermission(user, kitchen.cookId)
    return this.foodItemsService.update(args)
  }

  @AllowAuthenticated()
  @Mutation(() => FoodItem)
  async removeFoodItem(
    @Args() args: FindUniqueFoodItemArgs,
    @GetUser() user: GetUserType,
  ) {
    const foodItem = await this.prisma.foodItem.findUnique({
      ...args,
      select: { kitchen: true },
    })
    checkRowLevelPermission(user, foodItem.kitchen.cookId)

    return this.foodItemsService.remove(args)
  }

  @ResolveField(() => Kitchen)
  kitchen(@Parent() foodItem: FoodItem) {
    return this.prisma.kitchen.findUnique({
      where: { id: foodItem.kitchenId },
    })
  }
  @ResolveField(() => [Schedule])
  schedules(@Parent() foodItem: FoodItem) {
    return this.prisma.schedule.findMany({
      where: { foodItemId: foodItem.id },
    })
  }
  @ResolveField(() => [CustomerReview])
  customerReview(@Parent() foodItem: FoodItem) {
    return this.prisma.customerReview.findMany({
      where: { foodItemId: foodItem.id },
    })
  }
}
