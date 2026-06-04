# Isolated per-story coding-agent runner.
# Ships the Claude Code CLI ("ingest claude cli") plus git + gh so the agent can
# clone the target repo, implement the story, run tests, and open a PR.
FROM node:20-slim

# git + gh (GitHub CLI) + certs
RUN apt-get update \
  && apt-get install -y --no-install-recommends git curl ca-certificates gnupg \
  && curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \
       | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
  && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
       > /etc/apt/sources.list.d/github-cli.list \
  && apt-get update && apt-get install -y --no-install-recommends gh \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev

COPY index.mjs ./

# The Claude Code CLI is installed as a dependency; expose it on PATH.
ENV PATH="/app/node_modules/.bin:${PATH}"

CMD ["node", "index.mjs"]
