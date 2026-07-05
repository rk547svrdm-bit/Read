import "dotenv/config";

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: required("JWT_SECRET", "dev-secret-change-me"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  auctionDefaultDurationHours: Number(process.env.AUCTION_DEFAULT_DURATION_HOURS ?? 48),
  auctionDefaultMinIncrement: Number(process.env.AUCTION_DEFAULT_MIN_INCREMENT ?? 1),
  auctionCloserIntervalSeconds: Number(process.env.AUCTION_CLOSER_INTERVAL_SECONDS ?? 30),
};
