#!/usr/bin/env bash
# =============================================================================
# setup-gcp-wif.sh
# Sets up GCP Workload Identity Federation (WIF) and IAM permissions
# for automated GitHub Actions deployment to Google Cloud Run.
# =============================================================================

set -euo pipefail

# Configuration defaults (override by setting env vars before running)
PROJECT_ID="${GCP_PROJECT:-corso-di-italiano-496920}"
REGION="${GCP_REGION:-europe-west2}"
SERVICE_NAME="${CLOUD_RUN_SERVICE:-corso-di-italiano}"
GITHUB_REPO="${GITHUB_REPO:-esteban-russi/corso-di-italiano}"
POOL_NAME="${WIF_POOL_NAME:-github-pool}"
PROVIDER_NAME="${WIF_PROVIDER_NAME:-github-provider}"
SA_NAME="${WIF_SA_NAME:-github-actions-deployer}"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

echo "================================================================="
echo " Setting up Workload Identity Federation for GitHub Actions"
echo "================================================================="
echo " GCP Project:  $PROJECT_ID"
echo " Region:       $REGION"
echo " Cloud Run:    $SERVICE_NAME"
echo " GitHub Repo:  $GITHUB_REPO"
echo " Service Acc:  $SA_EMAIL"
echo "================================================================="
echo ""

# 1. Enable required GCP APIs
echo "--> 1/7: Enabling required GCP APIs..."
gcloud services enable \
  iamcredentials.googleapis.com \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  sts.googleapis.com \
  --project="$PROJECT_ID"

# 2. Ensure Artifact Registry repository exists
echo "--> 2/7: Checking Artifact Registry repository ($SERVICE_NAME)..."
if ! gcloud artifacts repositories describe "$SERVICE_NAME" --location="$REGION" --project="$PROJECT_ID" &>/dev/null; then
  echo "    Creating repository $SERVICE_NAME in $REGION..."
  gcloud artifacts repositories create "$SERVICE_NAME" \
    --repository-format=docker \
    --location="$REGION" \
    --description="Docker repository for $SERVICE_NAME" \
    --project="$PROJECT_ID"
else
  echo "    Artifact Registry repository already exists."
fi

# 3. Create Service Account
echo "--> 3/7: Checking Service Account ($SA_NAME)..."
if ! gcloud iam service-accounts describe "$SA_EMAIL" --project="$PROJECT_ID" &>/dev/null; then
  echo "    Creating service account $SA_NAME..."
  gcloud iam service-accounts create "$SA_NAME" \
    --display-name="GitHub Actions Cloud Run Deployer" \
    --project="$PROJECT_ID"
else
  echo "    Service account already exists."
fi

# 4. Grant IAM roles to Service Account
echo "--> 4/7: Granting IAM roles to service account..."
ROLES=(
  "roles/run.admin"
  "roles/artifactregistry.writer"
  "roles/iam.serviceAccountUser"
)
for role in "${ROLES[@]}"; do
  echo "    Assigning $role..."
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$SA_EMAIL" \
    --role="$role" \
    --condition=None \
    --quiet > /dev/null
done

# 5. Create Workload Identity Pool
echo "--> 5/7: Checking Workload Identity Pool ($POOL_NAME)..."
if ! gcloud iam workload-identity-pools describe "$POOL_NAME" --location="global" --project="$PROJECT_ID" &>/dev/null; then
  echo "    Creating pool $POOL_NAME..."
  gcloud iam workload-identity-pools create "$POOL_NAME" \
    --location="global" \
    --display-name="GitHub Actions Pool" \
    --project="$PROJECT_ID"
else
  echo "    Workload Identity Pool already exists."
fi

# 6. Create Workload Identity Provider
echo "--> 6/7: Checking Workload Identity Provider ($PROVIDER_NAME)..."
if ! gcloud iam workload-identity-pools providers describe "$PROVIDER_NAME" \
  --workload-identity-pool="$POOL_NAME" \
  --location="global" \
  --project="$PROJECT_ID" &>/dev/null; then
  echo "    Creating provider $PROVIDER_NAME..."
  gcloud iam workload-identity-pools providers create-oidc "$PROVIDER_NAME" \
    --workload-identity-pool="$POOL_NAME" \
    --location="global" \
    --issuer-uri="https://token.actions.githubusercontent.com" \
    --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" \
    --attribute-condition="assertion.repository == '${GITHUB_REPO}'" \
    --project="$PROJECT_ID"
else
  echo "    Workload Identity Provider already exists."
fi

# 7. Get Project Number & Bind Workload Identity User
echo "--> 7/7: Binding Workload Identity to service account..."
PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format="value(projectNumber)")
POOL_RESOURCE_ID="projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_NAME}"
PROVIDER_FULL_NAME="${POOL_RESOURCE_ID}/providers/${PROVIDER_NAME}"

gcloud iam service-accounts add-iam-policy-binding "$SA_EMAIL" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/${POOL_RESOURCE_ID}/attribute.repository/${GITHUB_REPO}" \
  --project="$PROJECT_ID" \
  --quiet > /dev/null

echo ""
echo "================================================================="
echo "🎉 Setup Complete! Add these GitHub Secrets to your repository:"
echo "   https://github.com/${GITHUB_REPO}/settings/secrets/actions"
echo "================================================================="
echo ""
echo "Secret Name:  WIF_PROVIDER"
echo "Secret Value: $PROVIDER_FULL_NAME"
echo ""
echo "Secret Name:  WIF_SERVICE_ACCOUNT"
echo "Secret Value: $SA_EMAIL"
echo ""
echo "Secret Name:  GEMINI_API_KEY"
echo "Secret Value: <your-gemini-api-key>"
echo ""
echo "================================================================="
