import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PublisherDocument = HydratedDocument<Publisher>;

export type PublisherStatus = 'pending' | 'approved' | 'suspended';

@Schema({ collection: 'publishers', timestamps: true })
export class Publisher {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, index: true })
  slug: string;

  /** The subdomain that resolves this hub, e.g. "northport" -> northport.onthespot.com */
  @Prop({ required: true, unique: true, index: true })
  subdomain: string;

  @Prop({ default: '' })
  city: string;

  @Prop({ default: '' })
  state: string;

  @Prop({ default: 'USA' })
  country: string;

  @Prop({ default: '' })
  logoUrl: string;

  @Prop({ default: '#dc2626' })
  primaryColor: string;

  @Prop({ default: '#1f3559' })
  secondaryColor: string;

  @Prop({ default: '' })
  websiteUrl: string;

  @Prop({ default: '' })
  facebookUrl: string;

  @Prop({ default: '' })
  instagramUrl: string;

  @Prop({ default: '' })
  contactEmail: string;

  @Prop({ default: 'pending', index: true })
  status: PublisherStatus;
}

export const PublisherSchema = SchemaFactory.createForClass(Publisher);
