FROM node:22-alpine

WORKDIR /workspace

# Alpine 이미지는 기본적으로 bash가 없으므로 설치해 줍니다.
RUN apk update && apk add --no-cache bash

# 패키지 파일만 먼저 복사하여 의존성 설치
COPY package.json package-lock.json* ./
RUN npm install

# 로컬 개발용이므로 소스 코드는 docker-compose의 volume 마운트를 통해 참조합니다.
# COPY . . (제거됨)

EXPOSE 3000

# 개발 서버 실행
CMD ["npm", "run", "dev"]