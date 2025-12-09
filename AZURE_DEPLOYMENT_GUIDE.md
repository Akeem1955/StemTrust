# Deploying StemTrust to Azure VM (Docker)

This guide walks you through deploying the StemTrust project (Frontend + Backend + DB) to a single Azure Virtual Machine using Docker Compose.

---

## 🏗️ Prerequisites

1.  **Azure Account**: Active subscription.
2.  **Azure VM**: Ubuntu 22.04 LTS recommended (or Debian).
    *   *Size*: Standard B2s (2 vCPUs, 4 GiB RAM) or larger recommended for building.
3.  **SSH Key**: Access to the VM via terminal.

---

## 🚀 Step 1: Install Docker on the VM

SSH into your Azure VM:
```bash
ssh azureuser@<your-vm-ip-address>
```

Run the following commands to install Docker Engine and Docker Compose:

```bash
# Update packages
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg

# Add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add the repository
echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Allow running docker without sudo (optional, requires re-login)
sudo usermod -aG docker $USER
```
*Note: Logout (`exit`) and login again for the group change to take effect.*

---

## 📦 Step 2: Transfer Project Files

You can either clone your repository (if using Git) or copy files from your local machine.

### Option A: Using Git (Recommended)
```bash
git clone <your-repo-url> stemtrust
cd stemtrust
```

### Option B: Copying Local Files (SCP)
Use `scp` from your local machine (Windows PowerShell/Command Prompt):

**Note:** You must zip your project first to verify ignoring `node_modules`.

```powershell
# Zip the project first (excluding node_modules)
Compress-Archive -Path Frontend, Backend, docker-compose.yml -DestinationPath stemtrust_deploy.zip

# Upload
scp stemtrust_deploy.zip azureuser@<your-vm-ip-address>:~/
```

Then on the VM:
```bash
unzip stemtrust_deploy.zip -d stemtrust
cd stemtrust
```

---

## ⚙️ Step 3: Configure Environment

Create/Edit the `.env` file for the backend on the VM (if not included):

```bash
nano Backend/.env
```

Paste your environment variables:
```ini
DATABASE_URL=postgresql://postgres:postgres@db:5432/stemtrust
PORT=8080
JWT_SECRET=supersecret
# Add Blockfrost keys/mnemonic here if needed
```

---

## ▶️ Step 4: Start the Application

Run Docker Compose to build and start the containers.

```bash
docker compose up -d --build
```
*   `-d`: Detached mode (runs in background).
*   `--build`: Forces a rebuild of images.

Check if containers are running:
```bash
docker compose ps
```

---

## 🌐 Step 5: Open Azure Ports (Network Security Group)

By default, external access is blocked. You must allow traffic on the ports.

1.  Go to **Azure Portal** -> **Virtual Machines** -> Select your VM.
2.  Click **Networking** (on the left menu).
3.  Click **Add inbound port rule**.
4.  Add a rule for:
    *   **Port**: `5173` (Frontend)
    *   **Protocol**: TCP
    *   **Action**: Allow
    *   **Name**: Allow_Frontend
5.  *(Optional)* If you changed nginx to listen on port 80, open Port `80` instead.

---

## ✅ Step 6: Access the App

Open your browser and visit:

`http://<your-vm-ip-address>:5173`

*   The frontend should load.
*   Logins/Signups (API calls) should work correctly.
*   API requests are routed to `http://<vm-ip>:5173/api/...` which Nginx proxies to the backend container.
