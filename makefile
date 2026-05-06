AZ_LOCATION ?= westus
AZ_RG       ?= app-hr-com-rg
AZ_ACR      ?= apphrcomacr
AZ_VAULT    ?= app-hr-com-kv
SERVICE     := app-hr-com
GIT_SHA     := $(shell git rev-parse HEAD)
BUILD_TAG   ?= latest
IMAGE       := $(AZ_ACR).azurecr.io/$(SERVICE)

BUILD_ARGS := \
	--build-arg NEXT_PUBLIC_API_URL \
	--build-arg NEXT_PUBLIC_FIREBASE_API_KEY \
	--build-arg NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN \
	--build-arg NEXT_PUBLIC_FIREBASE_PROJECT_ID \
	--build-arg NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET \
	--build-arg NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID \
	--build-arg NEXT_PUBLIC_FIREBASE_APP_ID \
	--build-arg NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID \
	--build-arg NEXT_PUBLIC_FIREBASE_VAPID_KEY \
	--build-arg NEXT_PUBLIC_RECAPTCHA_SITE_KEY

.DEFAULT_GOAL := build

dev:
	bun run dev

build:
	bun run build

lint:
	bun run lint

# Pull all NEXT_PUBLIC_* build-args from Key Vault and export them so
# `docker buildx build --build-arg FOO` picks up FOO from the environment.
# Requires Key Vault Secrets Officer/User on $(AZ_VAULT).
build-args-export:
	@echo "Loading build-args from Key Vault $(AZ_VAULT)..."
	$(eval export NEXT_PUBLIC_API_URL                      := $(shell az keyvault secret show --vault-name $(AZ_VAULT) --name next-public-api-url --query value -o tsv))
	$(eval export NEXT_PUBLIC_FIREBASE_API_KEY             := $(shell az keyvault secret show --vault-name $(AZ_VAULT) --name next-public-firebase-api-key --query value -o tsv))
	$(eval export NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN         := $(shell az keyvault secret show --vault-name $(AZ_VAULT) --name next-public-firebase-auth-domain --query value -o tsv))
	$(eval export NEXT_PUBLIC_FIREBASE_PROJECT_ID          := $(shell az keyvault secret show --vault-name $(AZ_VAULT) --name next-public-firebase-project-id --query value -o tsv))
	$(eval export NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET      := $(shell az keyvault secret show --vault-name $(AZ_VAULT) --name next-public-firebase-storage-bucket --query value -o tsv))
	$(eval export NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID := $(shell az keyvault secret show --vault-name $(AZ_VAULT) --name next-public-firebase-messaging-sender-id --query value -o tsv))
	$(eval export NEXT_PUBLIC_FIREBASE_APP_ID              := $(shell az keyvault secret show --vault-name $(AZ_VAULT) --name next-public-firebase-app-id --query value -o tsv))
	$(eval export NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID      := $(shell az keyvault secret show --vault-name $(AZ_VAULT) --name next-public-firebase-measurement-id --query value -o tsv))
	$(eval export NEXT_PUBLIC_FIREBASE_VAPID_KEY           := $(shell az keyvault secret show --vault-name $(AZ_VAULT) --name next-public-firebase-vapid-key --query value -o tsv))
	$(eval export NEXT_PUBLIC_RECAPTCHA_SITE_KEY           := $(shell az keyvault secret show --vault-name $(AZ_VAULT) --name next-public-recaptcha-site-key --query value -o tsv))

build-image: build-args-export
	docker buildx build \
		--platform "linux/amd64" \
		--tag "$(IMAGE):$(GIT_SHA)-build" \
		--target "builder" \
		$(BUILD_ARGS) \
		.
	docker buildx build \
		--cache-from "$(IMAGE):$(GIT_SHA)-build" \
		--platform "linux/amd64" \
		--tag "$(IMAGE):$(GIT_SHA)" \
		$(BUILD_ARGS) \
		.

build-image-login:
	az acr login --name $(AZ_ACR)

build-image-push: build-image-login
	docker image push $(IMAGE):$(GIT_SHA)

build-image-push-build-stage: build-image-login
	docker image push $(IMAGE):$(GIT_SHA)-build

build-image-pull: build-image-login
	docker image pull $(IMAGE):$(GIT_SHA)

build-image-promote: build-image-login
	docker image tag $(IMAGE):$(GIT_SHA) $(IMAGE):$(BUILD_TAG)
	docker image push $(IMAGE):$(BUILD_TAG)

# `az acr build` alternative — builds in Azure, no local Docker required.
build-image-cloud: build-args-export
	az acr build \
		--registry $(AZ_ACR) \
		--image $(SERVICE):$(GIT_SHA) \
		--image $(SERVICE):$(BUILD_TAG) \
		--platform linux/amd64 \
		--build-arg NEXT_PUBLIC_API_URL="$$NEXT_PUBLIC_API_URL" \
		--build-arg NEXT_PUBLIC_FIREBASE_API_KEY="$$NEXT_PUBLIC_FIREBASE_API_KEY" \
		--build-arg NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="$$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN" \
		--build-arg NEXT_PUBLIC_FIREBASE_PROJECT_ID="$$NEXT_PUBLIC_FIREBASE_PROJECT_ID" \
		--build-arg NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="$$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET" \
		--build-arg NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="$$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID" \
		--build-arg NEXT_PUBLIC_FIREBASE_APP_ID="$$NEXT_PUBLIC_FIREBASE_APP_ID" \
		--build-arg NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="$$NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID" \
		--build-arg NEXT_PUBLIC_FIREBASE_VAPID_KEY="$$NEXT_PUBLIC_FIREBASE_VAPID_KEY" \
		--build-arg NEXT_PUBLIC_RECAPTCHA_SITE_KEY="$$NEXT_PUBLIC_RECAPTCHA_SITE_KEY" \
		.
