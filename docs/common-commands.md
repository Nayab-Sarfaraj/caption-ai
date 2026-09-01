# Caption-AI Worker: Common Commands

Quick reference for connecting to and managing the production worker on EC2.

## Server details

| Item | Value |
| --- | --- |
| Instance | `caption-worker` (`i-055da1bb44400b663`) |
| Region | `eu-north-1` (Stockholm) |
| Public IP | `13.60.31.229` |
| Instance type | `t3.micro` (1 GB RAM) |
| SSH key | `caption-worker-key.pem` |

## Connect over SSH

Run this from the directory containing your SSH key:

```powershell
cd ~/Downloads
ssh -i .\caption-worker-key.pem ubuntu@13.60.31.229
```

After connecting, commands below assume the repository is at `~/caption-ai`.

## Deploy the latest code

```bash
cd ~/caption-ai
git pull
npm install
npm run worker:build
pm2 restart worker
```

## Manage the worker with PM2

```bash
# List running processes
pm2 list

# Follow live worker logs (Ctrl+C to exit)
pm2 logs worker

# Show the last 100 log lines
pm2 logs worker --lines 100

# Restart after code or environment changes
pm2 restart worker

# Stop the worker
pm2 stop worker

# Start a stopped worker
pm2 start worker

# Remove the worker from PM2 entirely
pm2 delete worker

# Persist the current process list across reboots
pm2 save

# Show a quick health summary
pm2 status
```

## Edit environment variables

```bash
cd ~/caption-ai
nano .env.local
```

In Nano, press `Ctrl+O`, press `Enter` to save, then press `Ctrl+X` to exit.
Restart the worker for changes to take effect:

```bash
pm2 restart worker
```

## Check system health

The instance has 1 GB of RAM, so monitor memory and disk usage regularly.

```bash
# Memory usage
free -h

# Disk usage
df -h

# Live resource monitor
sudo apt install htop && htop
```

## Enable automatic restart after reboot

Run this once after the worker is running:

```bash
pm2 startup
```

PM2 prints a `sudo` command. Run that command, then save the current process
list:

```bash
pm2 save
```

## Update system packages

Run occasionally during maintenance windows:

```bash
sudo apt update && sudo apt upgrade -y
```
