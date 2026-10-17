# The server as one container. Build from the REPOSITORY ROOT (the lockfile is there):
#   docker build -f server/Dockerfile -t dwdg-server .
#   docker run --rm -p 8787:8787 --env-file server/.env.local dwdg-server
# Node 24 runs the TypeScript sources directly, so there is no build step and the image holds only the server's own
# dependencies and its source: no frontend, no database files, no development tools.

FROM node:24-bookworm-slim AS dependencies
WORKDIR /app
# npm needs every workspace's package.json to read the lockfile, but only the server's dependencies are installed.
COPY package.json package-lock.json ./
COPY server/package.json server/
COPY frontend/package.json frontend/
RUN npm ci --omit=dev --workspace server --ignore-scripts

FROM node:24-bookworm-slim
ENV NODE_ENV=production
WORKDIR /app
COPY --from=dependencies /app/node_modules node_modules
COPY server/package.json server/
COPY server/src server/src
# The unprivileged user that the node image ships with.
USER node
# Hosts set PORT; 8787 is the default. HOST defaults to all interfaces.
EXPOSE 8787
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||8787)+'/api/health').then(r=>{process.exitCode=r.ok?0:1},()=>{process.exitCode=1})"
CMD ["node", "server/src/main.ts"]
