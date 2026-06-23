import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ScheduleEntryDocument = HydratedDocument<ScheduleEntry>;

export type ScheduleStatus = 'scheduled' | 'canceled' | 'updated';

@Schema({ collection: 'schedule_entries', timestamps: true })
export class ScheduleEntry {
  @Prop({ type: Types.ObjectId, ref: 'FoodTruck', required: true, index: true })
  foodTruckId: Types.ObjectId;

  /** Optional specific date for the stop. */
  @Prop({ type: Date, default: null })
  date: Date | null;

  @Prop({ required: true, index: true })
  dayOfWeek: string;

  @Prop({ required: true })
  startTime: string; // "11:00"

  @Prop({ required: true })
  endTime: string; // "14:00"

  @Prop({ required: true, trim: true })
  locationName: string;

  @Prop({ default: '' })
  address: string;

  @Prop({ default: '' })
  city: string;

  /** Map coordinates for this stop (optional). */
  @Prop({ type: Number, default: null })
  latitude: number | null;

  @Prop({ type: Number, default: null })
  longitude: number | null;

  @Prop({ default: '' })
  notes: string;

  @Prop({ default: 'scheduled', index: true })
  status: ScheduleStatus;
}

export const ScheduleEntrySchema = SchemaFactory.createForClass(ScheduleEntry);
