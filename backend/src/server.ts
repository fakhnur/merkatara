import { createApp } from './app';
import { ENV } from './config/env';
import { connectDB } from './config/db';
import { autoSeedIfEmpty } from './utils/seeder';

const startServer = async (): Promise<void> => {
  await connectDB();
  await autoSeedIfEmpty();

  const app = createApp();

  app.listen(ENV.PORT, () => {
    console.log(`Server running on port ${ENV.PORT}`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
