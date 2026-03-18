FROM node:24-bookworm-slim

ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

WORKDIR /app

COPY ./package.json ./
COPY ./package-lock.json ./

RUN npm ci
RUN npx playwright install --with-deps chromium

COPY ./ ./

