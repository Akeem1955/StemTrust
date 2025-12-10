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

# 2. Add .dockerignore files if missing (Safety check)
echo "🛡️  Ensuring Docker ignore files exist..."
echo "node_modules" > Backend/.dockerignore
echo "node_modules" > Frontend/.dockerignore

# 3. Stop any existing containers and clear volumes (Fresh start)
echo "🛑 Stopping old containers..."
sudo docker compose down -v 2>/dev/null

# 4. Build and Start
echo "🏗️  Building and Starting Containers..."
sudo docker compose up -d --build

# 5. Verify
echo "✅ Deployment Command Sent!"
echo "⏳ Waiting 10 seconds for services to initialize..."
sleep 10
sudo docker compose ps

echo ""
echo "🎉 Done! Your app should be live."
echo "👉 Check http://stemt-trust.southafricanorth.cloudapp.azure.com:5173"
