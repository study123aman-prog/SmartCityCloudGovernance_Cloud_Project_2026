# AWS Deployment Runbook

This is the deployment plan for the FireGuard software-only prototype. It has not been executed against an AWS account.

## Target topology

- React build: private S3 frontend bucket behind CloudFront
- Express API and FastAPI ML service: one EC2 instance initially
- Database: MongoDB Atlas
- Reports and datasets: private S3 bucket
- Notifications: SNS topic
- Logs and alarms: CloudWatch
- Background reports: Lambda

## Before creating resources

1. Choose one AWS region and enable billing alerts.
2. Create an administrative setup identity, then use least-privilege roles for workloads.
3. Confirm expected costs and free-tier eligibility. Ask for approval before creating EC2, CloudFront, NAT Gateway, or other billable resources.
4. Register a domain only if a custom hostname is needed.

## Network and IAM

Create one EC2 security group with these inbound rules:

| Port | Source | Purpose |
|---|---|---|
| 80 | `0.0.0.0/0` | HTTP redirect or web traffic |
| 443 | `0.0.0.0/0` | HTTPS web traffic |
| 22 | fixed administrator IP only | emergency SSH access |

Do not expose ports `5001`, `8000`, `27017`, or MongoDB credentials publicly. Express should reach FastAPI through `127.0.0.1:8000`.

Attach an EC2 instance role with only the required S3 and SNS actions. Use an IAM role instead of access keys on the server. Keep the S3 buckets private and block public access.

## Automated Infrastructure Provisioning (CloudFormation)

You can provision all required AWS resources (S3 buckets, CloudFront OAC, SNS Topic, IAM roles, Security Groups) using the provided CloudFormation template:

```bash
aws cloudformation create-stack \
  --stack-name fireguard-production \
  --template-body file://infra/fireguard-infra.yaml \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameters ParameterKey=EnvironmentName,ParameterValue=production \
               ParameterKey=AdministratorCIDR,ParameterValue="$(curl -s https://checkip.amazonaws.com)/32"
```

## EC2 setup

An automated setup script is provided in `scripts/setup-ec2.sh`:

```bash
# On the EC2 instance:
git clone <repository-url> /opt/fireguard
cd /opt/fireguard
chmod +x scripts/setup-ec2.sh
./scripts/setup-ec2.sh
```

Or execute manually:

```bash
sudo apt update
sudo apt install -y git nginx python3 python3-venv
# Install Node.js 22 LTS

git clone <private-repository-url> fireguard
cd fireguard

cd backend
npm ci --omit=dev
cd ../frontend
npm ci
cd ../ml-service
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Copy `model.pkl` into `ml-service/model/model.pkl` and create environment files from the templates. The backend should use:

```env
NODE_ENV=production
PORT=5001
MONGODB_URI=<MongoDB Atlas connection string>
JWT_SECRET=<long random secret>
ML_SERVICE_URL=http://127.0.0.1:8000
FRONTEND_ORIGIN=https://<frontend-hostname>
AWS_REGION=<region>
AWS_S3_BUCKET=<private-storage-bucket>
AWS_SNS_TOPIC_ARN=<sns-topic-arn>
SNS_RISK_THRESHOLD=0.7
```

## Process supervision

Run the ML service and backend under systemd using the provided service files in `scripts/systemd/`:

```bash
sudo cp scripts/systemd/fireguard-ml.service /etc/systemd/system/
sudo cp scripts/systemd/fireguard-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now fireguard-ml
sudo systemctl enable --now fireguard-backend
sudo systemctl status fireguard-ml fireguard-backend
```

FastAPI listens only on `127.0.0.1:8000`. Express listens on `127.0.0.1:5001` behind Nginx.

## Nginx

Use Nginx to terminate HTTPS and proxy `/api/` to `http://127.0.0.1:5001`. Do not proxy the ML service publicly. Use `scripts/nginx/fireguard.conf`:

```bash
sudo cp scripts/nginx/fireguard.conf /etc/nginx/sites-available/fireguard.conf
sudo ln -sf /etc/nginx/sites-available/fireguard.conf /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

After validating the configuration:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Frontend deployment

Set the API URL before building:

```bash
cd frontend
cp .env.example .env
# Set VITE_API_URL=https://<api-hostname>/api
npm run build
aws s3 sync dist/ s3://<private-frontend-bucket> --delete
```

Serve the frontend bucket through CloudFront with a private origin access control. Configure SPA fallback so unknown routes return `index.html`.

## S3, SNS, and Lambda

- Storage bucket: block public access, encrypt at rest, and restrict object prefixes.
- SNS topic: restrict `sns:Publish` to the EC2 role and confirm subscriptions.
- Lambda report role: allow only `s3:PutObject` for `reports/*` and CloudWatch logging.
- Never put AWS credentials in React environment variables.

## CloudWatch

Collect:

- Nginx access and error logs
- Express logs
- FastAPI/Uvicorn logs
- EC2 CPU, memory, disk, and status checks
- Lambda invocation errors and duration

Create alarms for EC2 status failure, high CPU, low disk space, backend 5xx responses, ML service failures, and Lambda errors.

## Deployment verification

```bash
curl -fsS https://<api-hostname>/api/health
curl -fsS https://<api-hostname>/docs
curl -I https://<frontend-hostname>/
```

Then verify registration, login, simulated values, prediction persistence, history, private S3 upload URLs, SNS subscription confirmation, and the Lambda report path.

## 100% Zero-Cost AWS Free Tier Guide

FireGuard is architected to operate entirely within the **AWS Free Tier** ($0.00 / month cost).

### Free Tier Resource Matrix

| Service | Free Tier Allowance | FireGuard Resource & Usage | Cost |
|---|---|---|---|
| **EC2 Compute** | 750 hours/month (`t2.micro` or `t3.micro`) | 1x `t2.micro` or `t3.micro` running Ubuntu 24.04 LTS (configured with 2GB swap) | **$0.00** |
| **EBS Storage** | 30 GB General Purpose SSD (gp2/gp3) | 20 GB gp3 root volume | **$0.00** |
| **S3 Storage** | 5 GB standard storage, 20k GET, 2k PUT | Frontend bucket + Storage bucket (< 10 MB total) | **$0.00** |
| **CloudFront** | 1 TB data transfer out, 10M HTTP/HTTPS reqs | Frontend distribution (Always Free tier) | **$0.00** |
| **AWS Lambda** | 1M requests/month, 3.2M seconds compute | Report generator function (Always Free tier) | **$0.00** |
| **Amazon SNS** | 1M publishes, 100k HTTP, 1k emails/month | FireGuard risk alert notifications (Always Free tier) | **$0.00** |
| **Database** | MongoDB Atlas M0 Sandbox | Free Forever (512 MB storage, shared RAM) | **$0.00** |

### Crucial Architectural Rules to Avoid Any Charges
1. **NO NAT Gateway**: Do not place your EC2 instance in a private subnet requiring a NAT Gateway. NAT Gateways cost ~$32/month minimum. Use a public subnet with the provided security group (only ports 80, 443, and 22 open).
2. **NO Application Load Balancer (ALB)**: ALBs incur ~$16–$22/month. FireGuard uses **Nginx** directly on the EC2 instance as the reverse proxy for $0.00.
3. **NO AWS Secrets Manager**: Secrets Manager costs $0.40/secret/month. Use the local environment file (`EnvironmentFile=/opt/fireguard/backend/.env`) with restricted permissions (`chmod 600`) or AWS SSM Parameter Store standard parameters (free).
4. **Use Strictly `t2.micro` or `t3.micro`**: Do not launch larger or paid instances. The automated setup script `scripts/setup-ec2.sh` automatically configures a 2 GB swap file to ensure 1 GB micro instances never experience memory pressure or OOM issues.

### Setting Up a Zero-Spend Budget Alert ($0.01 Threshold)
To guarantee you are alerted before any charges can occur:

1. In the **AWS Management Console**, search for **AWS Budgets**.
2. Click **Create budget** $\rightarrow$ select **Zero spend budget** template.
3. Name the budget `fireguard-zero-spend`.
4. Enter your email address for alert notifications.
5. Click **Create budget**. AWS will immediately notify you if your account incurs even $0.01 in unexpected usage.

```bash
# Alternatively via AWS CLI (if installed):
aws budgets create-budget \
  --account-id <your-account-id> \
  --budget file://infra/zero-spend-budget.json \
  --notifications-with-subscribers file://infra/zero-spend-notification.json
```

---

## Limitations

- The original training dataset and training code are unavailable.
- Class semantics and model quality are not independently verified.
- Simulated values are not real-time observations.
- This is a prototype, not a certified emergency or fire-safety system.

