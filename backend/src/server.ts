import { prisma } from "./config/db";
import { env } from "./config/env";
import app from "./app";
import http from "http";

let server: http.Server | undefined;

const startServer = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log("Database connected successfully");

    server = app.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
      console.log(`Health check: http://localhost:${env.PORT}/api/health`);
      console.log(`Ready: http://localhost:${env.PORT}/api/ready`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

const shutdown = (signal: string): void => {
  console.log(`${signal} received, shutting down`);
  const forceExit = setTimeout(() => process.exit(1), 10_000);
  forceExit.unref();
  server?.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection", error);
  shutdown("unhandledRejection");
});
