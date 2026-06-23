import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export type UserRole = 'master_admin' | 'publisher' | 'listing_owner';

@Schema({ collection: 'users', timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ default: 'listing_owner' })
  role: UserRole;

  @Prop({ default: 'active' })
  status: 'active' | 'disabled';
}

export const UserSchema = SchemaFactory.createForClass(User);
