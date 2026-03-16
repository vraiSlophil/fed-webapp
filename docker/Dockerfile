FROM node:24-bookworm-slim

ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

WORKDIR /app

COPY . .

RUN npm ci
RUN npx playwright install --with-deps chromium

# CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
