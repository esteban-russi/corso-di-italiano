#!/usr/bin/env bash
# =============================================================================
# setup-gcp-sa.sh
# Sets up GCP Service Account and exports GCP_SA_KEY to GitHub Secrets
# following the pattern from personal-finance-report.
# =============================================================================

set -euo pipefail

PROJECT_ID="${GCP_PROJECT:-corso-di-italiano-496920}"
SA_NAME="github-actions-deployer"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
GITHUB_REPO="esteban-russi/corso-di-italiano"

echo "================================================================="
echo " Setting up Service Account for GitHub Actions"
echo " Project: $PROJECT_ID"
echo " Service Account: $SA_EMAIL"
echo " Target Repo: $GITHUB_REPO"
echo "================================================================="
echo ""

# 1. Enable required APIs
echo "--> Enabling required APIs..."
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  --project="$PROJECT_ID"

# 2. Ensure cloud-run-source-deploy Artifact Registry repo exists
REGION="${GCP_REGION:-europe-west2}"
if ! gcloud artifacts repositories describe "cloud-run-source-deploy" --location="$REGION" --project="$PROJECT_ID" &>/dev/null; then
  echo "--> Creating Artifact Registry repository cloud-run-source-deploy in $REGION..."
  gcloud artifacts repositories create "cloud-run-source-deploy" \
    --repository-format=docker \
    --location="$REGION" \
    --description="Cloud Run source deploy repository" \
    --project="$PROJECT_ID"
fi

# 3. Create Service Account if not exists
if ! gcloud iam service-accounts describe "$SA_EMAIL" --project="$PROJECT_ID" &>/dev/null; then
  echo "--> Creating service account $SA_NAME..."
  gcloud iam service-accounts create "$SA_NAME" \
    --display-name="GitHub Actions Deployer" \
    --project="$PROJECT_ID"
else
  echo "--> Service account $SA_EMAIL already exists."
fi

# 3. Grant IAM roles
ROLES=(
  "roles/run.admin"
  "roles/cloudbuild.builds.editor"
  "roles/artifactregistry.admin"
  "roles/storage.admin"
  "roles/iam.serviceAccountUser"
)
for role in "${ROLES[@]}"; do
  echo "--> Granting $role..."
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$SA_EMAIL" \
    --role="$role" \
    --quiet > /dev/null
done

# 4. Generate key and upload directly to GitHub Secrets
echo "--> Generating service account key and setting GitHub secret GCP_SA_KEY..."
gcloud iam service-accounts keys create - \
  --iam-account="$SA_EMAIL" \
  --project="$PROJECT_ID" \
| gh secret set GCP_SA_KEY --repo "$GITHUB_REPO"

echo ""
echo "================================================================="
echo "🎉 Secret GCP_SA_KEY successfully uploaded to $GITHUB_REPO!"
echo "================================================================="
