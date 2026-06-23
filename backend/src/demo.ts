/* eslint-disable no-console */
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AppModule } from './app.module';
import { configureApp } from './setup';
import { seedDatabase } from './seed-data';

/**
 * Zero-config demo: spins up an in-memory MongoDB, seeds it, and starts the API.
 * No external database required. Data is ephemeral and re-seeded on each start.
 */
async function main() {
  const mongod = await MongoMemoryServer.create({ instance: { dbName: 'food_truck' } });
  process.env.MONGODB_URI = mongod.getUri();
  console.log('🍔 In-memory MongoDB started');

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = configureApp(app);

  await seedDatabase(app);

  const port = Number(config.get('PORT') ?? 3001);
  await app.listen(port);
  console.log(`\n✓ Demo API ready at http://localhost:${port} (docs at /docs)`);
  console.log('  Master admin: admin@onthespot.com / ChangeMe123!');
  console.log('  Account:      publisher@northportmatters.com / ChangeMe123!');
  console.log('  Calendars:    /northportfoodtrucks  and  /westvalleyfoodtrucks');

  const shutdown = async () => {
    await app.close();
    await mongod.stop();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('Demo failed to start:', err);
  process.exit(1);
});
