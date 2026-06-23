import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument, UserRole } from './user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  findByEmail(email: string) {
    return this.userModel.findOne({ email: email.toLowerCase().trim() }).exec();
  }

  findById(id: string) {
    return this.userModel.findById(id).exec();
  }

  async create(name: string, email: string, password: string, role: UserRole = 'truck_owner') {
    const passwordHash = await bcrypt.hash(password, 10);
    return this.userModel.create({
      name,
      email: email.toLowerCase().trim(),
      passwordHash,
      role,
    });
  }

  createAdmin(name: string, email: string, password: string) {
    return this.create(name, email, password, 'admin');
  }

  verifyPassword(password: string, passwordHash: string) {
    return bcrypt.compare(password, passwordHash);
  }
}
