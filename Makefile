# The Gemini key is server-side only. Accept GEMINI_API_KEY, falling back to the
# legacy VITE_GEMINI_API_KEY value if that is what is exported in the shell/.env.
GEMINI_API_KEY     ?= $(VITE_GEMINI_API_KEY)
GCP_PROJECT        ?= corso-di-italiano-496920
GCP_REGION         ?= europe-west2
CLOUD_RUN_SERVICE  ?= corso-di-italiano
CLOUD_RUN_IMAGE    ?= $(GCP_REGION)-docker.pkg.dev/$(GCP_PROJECT)/$(CLOUD_RUN_SERVICE)/$(CLOUD_RUN_SERVICE)

require-key:
	@test -n "$(GEMINI_API_KEY)" || { echo "Set GEMINI_API_KEY (or VITE_GEMINI_API_KEY)"; exit 1; }

# =============================================================================
# Local Docker
# =============================================================================

docker-build:
	docker build -t $(CLOUD_RUN_SERVICE) .

docker-run: require-key
	docker run -p 8080:8080 -e GEMINI_API_KEY=$(GEMINI_API_KEY) $(CLOUD_RUN_SERVICE)

docker: docker-build docker-run

# =============================================================================
# Cloud Run Deployment
# =============================================================================
# Build the image via Cloud Build, push to Artifact Registry, then deploy.
# The API key is injected as a runtime env var (never baked into the image).

deploy-build:
	gcloud builds submit \
		--config=cloudbuild.yaml \
		--project=$(GCP_PROJECT) \
		--substitutions=_IMAGE=$(CLOUD_RUN_IMAGE)

deploy-run: require-key
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
		--max-instances=3 \
		--set-env-vars=GEMINI_API_KEY=$(GEMINI_API_KEY)

deploy: deploy-build deploy-run
