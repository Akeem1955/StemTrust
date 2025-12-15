#!/bin/bash

# Deployment Script for StemTrust (Azure VM)
# Run this script from the project root directory on the VM.

echo "🚀 Starting Deployment Setup..."

# 1. Create Backend .env file with CORRECT Docker settings
echo "📝 Creating Backend/.env configuration..."
cat > Backend/.env <<EOL
# Blockchain Keys
BLOCKFROST=preprod5P25YCSuWCXnr1nZoXyfUSQTJHz9ik3d
mnemonic=guitar parade barrel cram canoe trim repair stumble alone put sort since electric isolate post sentence immune vital dolphin width twelve napkin magic devote

# Database Connection
# NOTE: In Docker, we use the service name 'db' and the password defined in docker-compose.yml ('postgres')
DATABASE_URL="postgresql://postgres:postgres@db:5432/stemtrust?schema=public"

# JWT Secret
JWT_SECRET="super-secret-jwt-key-change-in-production"

# Server Configuration
PORT=8080

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=akimy.onboardx@gmail.com
SMTP_PASS=jgflkkbqeoggxvov
EOL

# 3. Add .dockerignore files if missing (Safety check)
echo "🛡️  Ensuring Docker ignore files exist..."
cat > Backend/.dockerignore <<EOF
node_modules
.env
EOF
cat > Frontend/.dockerignore <<EOF
node_modules
.env
EOF

# 4. Stop any existing containers and clear volumes (Fresh start)
echo "🛑 Stopping old containers..."
sudo docker compose down -v 2>/dev/null

# 5. Build and Start
echo "🏗️  Building (Aggressive/No-Cache)..."
sudo docker compose build --no-cache
sudo docker compose up -d --force-recreate

# 6. Verify & Initialize Database
echo "✅ Containers Started!"
echo "⏳ Waiting 15 seconds for Database to initialize..."
sleep 15

# Migration is now handled automatically by the backend container startup command.
# command: sh -c "npx prisma migrate deploy && node dist/server.js"

# Optional: Seed data if needed
# sudo docker compose exec backend sh -c 'npm run seed'

echo "🔍 Checking Status..."
sudo docker compose ps

echo ""
echo "🎉 Done! Your app should be live."
echo "👉 Access here: https://stemt-trust.southafricanorth.cloudapp.azure.com:5173"
echo "   (If you type http://, it will automatically switch to https://)"
