#!/usr/bin/env bash
#
# Build the per-story runner image locally and push it to ECR, so `sst deploy`
# on any stage/machine/CI just references the prebuilt image (no Docker at deploy).
#
# Usage:
#   ./scripts/build-runner.sh                # build + push :latest and :<git-sha>
#   ENGINE=docker ./scripts/build-runner.sh  # use docker instead of podman
#
# After pushing, deploy with the default (latest) or pin an immutable tag:
#   npx sst deploy --stage <stage>
#   RUNNER_IMAGE=<acct>.dkr.ecr.<region>.amazonaws.com/jira-coding-agent-runner:<sha> npx sst deploy
#
set -euo pipefail

ACCOUNT="${ACCOUNT:-327261196437}"
REGION="${REGION:-eu-central-1}"
REPO="${REPO:-jira-coding-agent-runner}"
ENGINE="${ENGINE:-podman}"           # podman | docker
PLATFORM="${PLATFORM:-linux/amd64}"  # Fargate default arch

REG="${ACCOUNT}.dkr.ecr.${REGION}.amazonaws.com"
SHA="$(git rev-parse --short HEAD)"
cd "$(dirname "$0")/.."

echo "▶ Ensuring ECR repo ${REPO} exists in ${REGION}…"
aws ecr describe-repositories --repository-names "$REPO" --region "$REGION" >/dev/null 2>&1 \
  || aws ecr create-repository --repository-name "$REPO" --region "$REGION" \
       --image-scanning-configuration scanOnPush=true >/dev/null

echo "▶ Logging ${ENGINE} into ECR…"
aws ecr get-login-password --region "$REGION" | "$ENGINE" login --username AWS --password-stdin "$REG"

echo "▶ Building ${REG}/${REPO}:${SHA} (${PLATFORM})…"
"$ENGINE" build --platform "$PLATFORM" -t "${REG}/${REPO}:${SHA}" runner/

echo "▶ Pushing immutable tag :${SHA}…"
IMGID="$("$ENGINE" images --format '{{.ID}}' --filter "reference=${REG}/${REPO}:${SHA}" | head -1)"
"$ENGINE" push "${REG}/${REPO}:${SHA}"

# Re-point :latest to the just-pushed manifest via the AWS CLI (no re-upload, and
# it sidesteps a podman quirk when pushing the literal tag "latest").
echo "▶ Re-pointing :latest → ${SHA}…"
MANIFEST="$(aws ecr batch-get-image --repository-name "$REPO" --region "$REGION" \
  --image-ids imageTag="$SHA" --query 'images[0].imageManifest' --output text)"
aws ecr put-image --repository-name "$REPO" --region "$REGION" \
  --image-tag latest --image-manifest "$MANIFEST" >/dev/null 2>&1 \
  || aws ecr put-image --repository-name "$REPO" --region "$REGION" \
       --image-tag latest --image-manifest "$MANIFEST" \
       --image-digest "$(aws ecr describe-images --repository-name "$REPO" --region "$REGION" \
            --image-ids imageTag="$SHA" --query 'imageDetails[0].imageDigest' --output text)" >/dev/null

echo "✓ Pushed ${REG}/${REPO}  tags: latest, ${SHA}"
aws ecr describe-images --repository-name "$REPO" --region "$REGION" \
  --query 'imageDetails[*].imageTags' --output json
