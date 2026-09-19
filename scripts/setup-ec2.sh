#!/usr/bin/env bash
# FireGuard EC2 Provisioning & Setup Script
# Target OS: Ubuntu 24.04 LTS (x86_64 or ARM64 / Graviton)
set -euo pipefail

echo "========================================================="
echo " Starting FireGuard EC2 Host Setup"
echo "========================================================="

# 1. Setup Swap for AWS Free Tier Instances (t2.micro / t3.micro has 1GB RAM)
echo "[1/8] Configuring swap space for Free Tier micro instance stability..."
if [ ! -f /swapfile ]; then
  sudo fallocate -l 2G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
  echo "2GB swap file enabled successfully."
else
  echo "Swap file already exists."
fi

# 2. System packages update
echo "[2/8] Updating system packages..."
sudo apt-get update -y
sudo apt-get install -y git curl ufw nginx python3 python3-venv python3-pip

# 3. Install Node.js 22 LTS via NodeSource
echo "[3/8] Installing Node.js LTS..."
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi
echo "Node.js version: $(node -v)"
echo "NPM version: $(npm -v)"

# 4. Setup application directory
INSTALL_DIR="/opt/fireguard"
echo "[4/8] Setting up application directory at ${INSTALL_DIR}..."
sudo mkdir -p "${INSTALL_DIR}"
sudo chown -R ubuntu:ubuntu "${INSTALL_DIR}"

if [ ! -d "${INSTALL_DIR}/backend" ]; then
  echo "Copying application files to ${INSTALL_DIR}..."
  cp -r . "${INSTALL_DIR}/"
fi

# 5. Setup Python ML Service
echo "[5/8] Setting up ML Service virtual environment..."
cd "${INSTALL_DIR}/ml-service"
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
deactivate

# Ensure model artifact exists
if [ ! -f "${INSTALL_DIR}/ml-service/model/model.pkl" ] && [ -f "${INSTALL_DIR}/model.pkl" ]; then
  mkdir -p "${INSTALL_DIR}/ml-service/model"
  cp "${INSTALL_DIR}/model.pkl" "${INSTALL_DIR}/ml-service/model/model.pkl"
fi

# 6. Setup Backend Dependencies
echo "[6/8] Installing Backend dependencies..."
cd "${INSTALL_DIR}/backend"
npm ci --omit=dev

# 7. Configure Systemd Services
echo "[7/8] Installing and starting systemd services..."
sudo cp "${INSTALL_DIR}/scripts/systemd/fireguard-ml.service" /etc/systemd/system/
sudo cp "${INSTALL_DIR}/scripts/systemd/fireguard-backend.service" /etc/systemd/system/

sudo systemctl daemon-reload
sudo systemctl enable --now fireguard-ml.service
sudo systemctl enable --now fireguard-backend.service

# 8. Configure Nginx
echo "[8/8] Configuring Nginx reverse proxy..."
sudo cp "${INSTALL_DIR}/scripts/nginx/fireguard.conf" /etc/nginx/sites-available/fireguard.conf
sudo ln -sf /etc/nginx/sites-available/fireguard.conf /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

echo "========================================================="
echo " FireGuard EC2 Setup Complete!"
echo " Check service status with:"
echo "   sudo systemctl status fireguard-ml"
echo "   sudo systemctl status fireguard-backend"
echo "========================================================="
