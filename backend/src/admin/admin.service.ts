import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FoodTruck, FoodTruckDocument } from '../trucks/food-truck.schema';

const WEEKLY_PRICE: Record<string, number> = {
  weekly: 10,
  featured: 15,
  monthly: 49 / 4, // ~12.25/week
};

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(FoodTruck.name) private readonly truckModel: Model<FoodTruckDocument>,
  ) {}

  async dashboard() {
    const trucks = await this.truckModel.find().sort({ updatedAt: -1 }).exec();

    const activeTrucks = trucks.filter((t) => t.isActive).length;
    const paidTrucks = trucks.filter((t) => t.paymentStatus === 'paid').length;
    const pendingTrucks = trucks.filter((t) => !t.isActive).length;

    const weeklyRevenue = Math.round(
      trucks
        .filter((t) => t.paymentStatus === 'paid')
        .reduce((sum, t) => sum + (WEEKLY_PRICE[t.plan] ?? 10), 0),
    );

    const recentTrucks = trucks.slice(0, 6).map((t) => ({
      id: t._id.toString(),
      name: t.name,
      slug: t.slug,
      isActive: t.isActive,
      paymentStatus: t.paymentStatus,
      updatedAt: (t as unknown as { updatedAt: Date }).updatedAt,
    }));

    return {
      totalTrucks: trucks.length,
      activeTrucks,
      pendingTrucks,
      paidTrucks,
      weeklyRevenue,
      recentTrucks,
    };
  }
}
