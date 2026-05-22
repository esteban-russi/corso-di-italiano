VITE_GEMINI_API_KEY ?= $(error Set VITE_GEMINI_API_KEY)
GCP_PROJECT        ?= corso-di-italiano-496920
GCP_REGION         ?= europe-west2
CLOUD_RUN_SERVICE  ?= corso-di-italiano
CLOUD_RUN_IMAGE    ?= $(GCP_REGION)-docker.pkg.dev/$(GCP_PROJECT)/$(CLOUD_RUN_SERVICE)/$(CLOUD_RUN_SERVICE)

# =============================================================================
# Local Docker
# =============================================================================

docker-build:
	docker build \
		--build-arg VITE_GEMINI_API_KEY=$(VITE_GEMINI_API_KEY) \
		-t $(CLOUD_RUN_SERVICE) .

docker-run:
	docker run -p 8080:8080 $(CLOUD_RUN_SERVICE)

docker: docker-build docker-run

# =============================================================================
# Cloud Run Deployment
# =============================================================================
# Build the Docker image via Cloud Build and push to Artifact Registry,
# then deploy (or update) the Cloud Run service.

deploy-build:
	gcloud builds submit \
		--config=cloudbuild.yaml \
		--project=$(GCP_PROJECT) \
		--substitutions=_VITE_GEMINI_API_KEY=$(VITE_GEMINI_API_KEY),_IMAGE=$(CLOUD_RUN_IMAGE)

deploy-run:
	gcloud run deploy $(CLOUD_RUN_SERVICE) \
		--image=$(CLOUD_RUN_IMAGE):latest \
		--region=$(GCP_REGION) \
		--project=$(GCP_PROJECT) \
		--allow-unauthenticated \
		--port=8080 \
		--memory=512Mi \
		--cpu=1 \
		--concurrency=80 \
		--min-instances=0 \
		--max-instances=3

deploy: deploy-build deploy-run
