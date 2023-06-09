import { ArgsType, Field, registerEnumType } from '@nestjs/graphql'
import { Prisma } from '@prisma/client'
import { WhereUniqueInputNumber } from 'src/common/dtos/common.input'
import { AddressOrderByWithRelationInput } from './orderBy.args'
import { AddressWhereInput, AddressWhereUniqueInput } from './where.args'

registerEnumType(Prisma.AddressScalarFieldEnum, {
  name: 'AddressScalarFieldEnum',
})

@ArgsType()
export class FindManyAddressArgs
  implements Required<Omit<Prisma.AddressFindManyArgs, 'include' | 'select'>>
{
  @Field(() => AddressWhereInput, { nullable: true })
  where: AddressWhereInput
  @Field(() => [AddressOrderByWithRelationInput], { nullable: true })
  orderBy: AddressOrderByWithRelationInput[]
  @Field(() => WhereUniqueInputNumber, { nullable: true })
  cursor: WhereUniqueInputNumber
  @Field(() => Number, { nullable: true })
  take: number
  @Field(() => Number, { nullable: true })
  skip: number
  @Field(() => [Prisma.AddressScalarFieldEnum], { nullable: true })
  distinct: Prisma.AddressScalarFieldEnum[]
}

@ArgsType()
export class FindUniqueAddressArgs {
  @Field({ nullable: true })
  where: AddressWhereUniqueInput
}
