import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CalendarDocument = HydratedDocument<Calendar>;

export type CalendarType = 'food_truck' | 'musician' | 'vendor' | 'farmers_market' | 'event';

@Schema({ collection: 'calendars', timestamps: true })
export class Calendar {
  /** Owning account (Publisher). */
  @Prop({ type: Types.ObjectId, ref: 'Publisher', required: true, index: true })
  publisherId: Types.ObjectId;

  @Prop({ default: 'food_truck', index: true })
  type: CalendarType;

  @Prop({ required: true, trim: true })
  name: string;

  /** Public subdomain for THIS calendar's site, e.g. "northportfoodtrucks". */
  @Prop({ required: true, unique: true, index: true })
  subdomain: string;

  /** Optional subheadline shown under the title on the front page. */
  @Prop({ default: '' })
  tagline: string;

  /** Per-calendar theme. */
  @Prop({ default: '#dc2626' })
  primaryColor: string;

  @Prop({ default: '#1f3559' })
  secondaryColor: string;

  @Prop({ default: '#f59e0b' })
  accentColor: string;

  /** Hero image shown on the calendar's front (home) page. */
  @Prop({ default: '' })
  heroImageUrl: string;

  @Prop({ default: true, index: true })
  active: boolean;
}

export const CalendarSchema = SchemaFactory.createForClass(Calendar);
