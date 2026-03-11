FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

# 공개 API 베이스 URL을 빌드 타임에 주입
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}

COPY . .
RUN npm run build

########################
# Run stage (Next.js 서버)
########################
FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

# 빌드 산출물 및 의존성 복사
COPY --from=build /app ./

# 앱이 사용하는 포트 (package.json: next start -p 10007)
EXPOSE 10007

CMD ["npm", "start"]

