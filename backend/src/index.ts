import app from './app';
import { config } from './config';

const startServer = async (): Promise<void> => {
  try {
    // Database connection will be added in Phase 02/03
    // await connectDatabase();

    app.listen(config.port, () => {
      console.log(`\n🚗 Auto Pro Backend`);
      console.log(`   Environment: ${config.env}`);
      console.log(`   Port:        ${config.port}`);
      console.log(`   API:         /api/${config.apiVersion}`);
      console.log(`   Health:      http://localhost:${config.port}/api/${config.apiVersion}/health`);
      console.log(`   Started:     ${new Date().toISOString()}\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
