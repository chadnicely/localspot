import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ListingDocument = HydratedDocument<Listing>;

export type ListingType = 'business' | 'food_truck' | 'musician' | 'vendor' | 'event_organizer';
export type ListingStatus = 'pending' | 'approved' | 'suspended';

@Schema({ collection: 'listings', timestamps: true })
export class Listing {
  @Prop({ type: Types.ObjectId, ref: 'Publisher', required: true, index: true })
  publisherId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  ownerUserId: Types.ObjectId;

  @Prop({ default: 'food_truck', index: true })
  type: ListingType;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, index: true })
  slug: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: '' })
  category: string;

  /** Cuisine for food trucks/food businesses. */
  @Prop({ default: '' })
  cuisineType: string;

  @Prop({ default: '' })
  logoUrl: string;

  @Prop({ default: '' })
  coverImageUrl: string;

  @Prop({ default: '' })
  phone: string;

  @Prop({ default: '' })
  email: string;

  @Prop({ default: '' })
  websiteUrl: string;

  @Prop({ default: '' })
  facebookUrl: string;

  @Prop({ default: '' })
  instagramUrl: string;

  @Prop({ default: '' })
  menuUrl: string;

  @Prop({ default: '' })
  address: string;

  @Prop({ default: '' })
  city: string;

  @Prop({ default: '' })
  state: string;

  @Prop({ default: 'pending', index: true })
  status: ListingStatus;

  @Prop({ default: false, index: true })
  featured: boolean;
}

export const ListingSchema = SchemaFactory.createForClass(Listing);
// Slug is unique within a publisher (hub), not globally.
ListingSchema.index({ publisherId: 1, slug: 1 }, { unique: true });
