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

  @Prop({ default: true, index: true })
  active: boolean;
}

export const CalendarSchema = SchemaFactory.createForClass(Calendar);
