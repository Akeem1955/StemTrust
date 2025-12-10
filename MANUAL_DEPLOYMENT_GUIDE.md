# Manual Deployment Guide (No Docker)

This guide runs the application directly on the VM using Node.js and PM2. This avoids Docker complexity/overhead but requires manual setup of dependencies.

---

## 🏗️ Step 1: Install Node.js on VM

Run these commands on your Azure VM:

```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (Process Manager to keep apps running)
sudo npm install -g pm2
sudo npm install -g serve
```

---

## 📦 Step 2: Prepare Backend

1.  **Navigate to Backend folder:**
    ```bash
    cd ~/StemTrust/Backend
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    npx prisma generate
    ```

3.  **Create .env file:**
    ```bash
    nano .env
    # Paste your environment variables (DATABASE_URL, etc)
    # Save with Ctrl+O, Enter, Ctrl+X
    ```

4.  **Start Backend with PM2:**
    ```bash
    # This runs the server in the background
    pm2 start src/server.ts --name backend --interpreter ./node_modules/.bin/tsx
    ```

---

## 🎨 Step 3: Prepare Frontend

1.  **Navigate to Frontend folder:**
    ```bash
    cd ~/StemTrust/Frontend
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Build the Project:**
    ```bash
    npm run build
    ```

4.  **Serve the Frontend with PM2:**
    We use the `serve` package to host the static build files on port 5173.

    ```bash
    # Serve the 'dist' (or 'build') folder on port 5173
    pm2 start "serve -s build -l 5173" --name frontend
    ```
    *(Note: If your build folder is named `dist`, change `build` to `dist` in the command above.)*

---

## 🔄 Step 4: Verify & Save

1.  **Check Status:**
    ```bash
    pm2 list
    ```
    You should see both `backend` and `frontend` online.

2.  **Save Config (so it restarts on reboot):**
    ```bash
    pm2 save
    pm2 startup
    # Run the command that 'pm2 startup' gives you
    ```

---

## 🌐 Step 5: Access App

Visit: `http://stemt-trust.southafricanorth.cloudapp.azure.com:5173`

*   **Troubleshooting:**
    *   If API calls fail, ensure your Frontend is pointing to the correct backend IP/URL in `.env` or `src/lib/api.ts`.
    *   For manual deployment, `http://localhost:3001` in the frontend code refers to the *user's browser* localhost, which won't work. You must update `VITE_API_BASE_URL` in `Frontend/.env` to point to `http://stemt-trust.southafricanorth.cloudapp.azure.com:3001` (and open port 3001 in Azure).
