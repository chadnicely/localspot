import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type FoodTruckDocument = HydratedDocument<FoodTruck>;

export type PaymentStatus = 'paid' | 'unpaid' | 'trial' | 'comped';

@Schema({ collection: 'food_trucks', timestamps: true })
export class FoodTruck {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  ownerUserId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, index: true })
  slug: string;

  @Prop({ default: '' })
  logoUrl: string;

  @Prop({ default: '' })
  mainImageUrl: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ type: [String], default: [] })
  foodCategories: string[];

  @Prop({ default: '' })
  websiteUrl: string;

  @Prop({ default: '' })
  facebookUrl: string;

  @Prop({ default: '' })
  instagramUrl: string;

  @Prop({ default: '' })
  menuUrl: string;

  @Prop({ default: '' })
  phone: string;

  @Prop({ default: '' })
  email: string;

  @Prop({ default: false, index: true })
  isActive: boolean;

  @Prop({ default: false, index: true })
  isFeatured: boolean;

  @Prop({ default: 'unpaid', index: true })
  paymentStatus: PaymentStatus;

  /** Selected listing plan: weekly | monthly | featured. */
  @Prop({ default: 'weekly' })
  plan: string;
}

export const FoodTruckSchema = SchemaFactory.createForClass(FoodTruck);
