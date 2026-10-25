#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#  AUTO PRO — Google Cloud Run Deployment Script
#  Run this script from the /backend directory
#  Usage: bash deploy-cloud-run.sh
# ═══════════════════════════════════════════════════════════════

set -e  # Exit on any error

# ─── CONFIG — Edit these before running ───────────────────────
PROJECT_ID="auto-pro-prod"           # Your Google Cloud Project ID
REGION="asia-south1"                 # Mumbai region (closest to India)
SERVICE_NAME="auto-pro-backend"      # Cloud Run service name
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

# ─── Environment Variables — Fill these from your .env ────────
MONGODB_URI="mongodb+srv://USER:PASS@cluster.mongodb.net/autopro"
JWT_SECRET="your-64-char-jwt-secret"
JWT_REFRESH_SECRET="your-64-char-refresh-secret"
CORS_ORIGIN="https://${SERVICE_NAME}-xxxx-as.a.run.app"
RAZORPAY_KEY_ID="rzp_live_XXXXXXXXX"
RAZORPAY_KEY_SECRET="XXXXXXXXXXXXXXXXXX"
FIREBASE_PROJECT_ID="your-firebase-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk@your-project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
GOOGLE_MAPS_API_KEY="AIzaSyXXXXXXXXXXXXXXXXXX"
# ──────────────────────────────────────────────────────────────

echo "🚀 Auto Pro — Cloud Run Deployment Starting..."
echo "   Project : ${PROJECT_ID}"
echo "   Region  : ${REGION}"
echo "   Service : ${SERVICE_NAME}"
echo ""

# Step 1: Set active project
echo "📋 Step 1/5: Setting Google Cloud project..."
gcloud config set project "${PROJECT_ID}"

# Step 2: Enable required APIs
echo "🔌 Step 2/5: Enabling Cloud Run + Artifact Registry APIs..."
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Step 3: Build & push Docker image
echo "🐳 Step 3/5: Building Docker image (this takes ~2 min)..."
gcloud builds submit \
  --tag "${IMAGE_NAME}:latest" \
  --timeout=10m \
  .

# Step 4: Deploy to Cloud Run
echo "☁️  Step 4/5: Deploying to Cloud Run (Mumbai)..."
gcloud run deploy "${SERVICE_NAME}" \
  --image "${IMAGE_NAME}:latest" \
  --region "${REGION}" \
  --platform managed \
  --allow-unauthenticated \
  --port 5000 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --concurrency 80 \
  --timeout 3600 \
  --set-env-vars "NODE_ENV=production" \
  --set-env-vars "PORT=5000" \
  --set-env-vars "API_VERSION=v1" \
  --set-env-vars "MONGODB_URI=${MONGODB_URI}" \
  --set-env-vars "JWT_SECRET=${JWT_SECRET}" \
  --set-env-vars "JWT_EXPIRES_IN=15m" \
  --set-env-vars "JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}" \
  --set-env-vars "JWT_REFRESH_EXPIRES_IN=7d" \
  --set-env-vars "CORS_ORIGIN=${CORS_ORIGIN}" \
  --set-env-vars "RATE_LIMIT_WINDOW_MS=900000" \
  --set-env-vars "RATE_LIMIT_MAX_REQUESTS=100" \
  --set-env-vars "RAZORPAY_KEY_ID=${RAZORPAY_KEY_ID}" \
  --set-env-vars "RAZORPAY_KEY_SECRET=${RAZORPAY_KEY_SECRET}" \
  --set-env-vars "FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}" \
  --set-env-vars "FIREBASE_CLIENT_EMAIL=${FIREBASE_CLIENT_EMAIL}" \
  --set-env-vars "FIREBASE_PRIVATE_KEY=${FIREBASE_PRIVATE_KEY}" \
  --set-env-vars "GOOGLE_MAPS_API_KEY=${GOOGLE_MAPS_API_KEY}" \
  --set-env-vars "LOG_LEVEL=info"

# Step 5: Get the service URL
echo ""
echo "✅ Step 5/5: Getting service URL..."
SERVICE_URL=$(gcloud run services describe "${SERVICE_NAME}" \
  --region="${REGION}" \
  --format="value(status.url)")

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  ✅ DEPLOYMENT COMPLETE!"
echo "  🌐 Backend URL: ${SERVICE_URL}"
echo "  ❤️  Health Check: ${SERVICE_URL}/api/v1/health"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📱 Next steps:"
echo "  1. Copy this URL: ${SERVICE_URL}"
echo "  2. Update eas.json in both mobile apps:"
echo "     EXPO_PUBLIC_API_BASE_URL=${SERVICE_URL}/api/v1"
echo "  3. Update CORS_ORIGIN in Cloud Run env vars"
echo "  4. Run: eas build --platform android --profile production"
echo ""
echo "🔧 To update CORS after getting the URL, run:"
echo "  gcloud run services update ${SERVICE_NAME} \\"
echo "    --region ${REGION} \\"
echo "    --set-env-vars CORS_ORIGIN=${SERVICE_URL}"
