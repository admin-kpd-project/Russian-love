FROM node:20-alpine AS build
WORKDIR /w
# Empty = browser uses current origin (nginx :8080 on VPS, etc.). Override at build: --build-arg VITE_API_BASE_URL=https://api.example.com
ARG VITE_API_BASE_URL=
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /w/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
