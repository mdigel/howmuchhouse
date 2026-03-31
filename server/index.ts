import app, { isVercel, setupServer } from "./app";

if (!isVercel) {
  process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);
    setTimeout(() => process.exit(1), 1000);
  });

  process.on("unhandledRejection", (error) => {
    console.error("Unhandled Rejection:", error);
  });

  setupServer().catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
}

export { setupServer };
export default app;