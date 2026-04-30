# 1. 빌드
FROM node:22-alpine AS builder
WORKDIR /workspace
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .

# Next.js
RUN npm run build

# 2. 실행 
FROM node:22-alpine AS runner
WORKDIR /workspace

# production 환경 설정
ENV NODE_ENV=production

# 필요한 파일만 복사
COPY --from=builder /workspace/next.config.mjs ./
COPY --from=builder /workspace/public ./public
COPY --from=builder /workspace/.next ./.next
COPY --from=builder /workspace/package.json ./
COPY --from=builder /workspace/node_modules ./node_modules

USER node

EXPOSE 3000
CMD ["npm", "run", "start"]