import { defineConfig, env } from "prisma/config";
import 'dotenv/config';

export default defineConfig({
    datasource: {
        provider: "postgresql",
        url: env("DATABASE_URL"),
    }
});
