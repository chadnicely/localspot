import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ScheduleEntryDocument = HydratedDocument<ScheduleEntry>;

export type ScheduleStatus = 'active' | 'cancelled' | 'pending';

@Schema({ collection: 'schedule_entries', timestamps: true })
export class ScheduleEntry {
  @Prop({ type: Types.ObjectId, ref: 'Publisher', required: true, index: true })
  publisherId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Listing', required: true, index: true })
  listingId: Types.ObjectId;

  /** Optional title (e.g. a gig name or event title). */
  @Prop({ default: '' })
  title: string;

  /** Optional specific date for the stop/appearance. */
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

  @Prop({ default: '' })
  state: string;

  /** Map coordinates for this stop (optional). */
  @Prop({ type: Number, default: null })
  latitude: number | null;

  @Prop({ type: Number, default: null })
  longitude: number | null;

  @Prop({ default: '' })
  externalLink: string;

  @Prop({ default: '' })
  notes: string;

  @Prop({ default: 'active', index: true })
  status: ScheduleStatus;
}

export const ScheduleEntrySchema = SchemaFactory.createForClass(ScheduleEntry);
