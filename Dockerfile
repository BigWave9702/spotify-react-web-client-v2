
# build environment
FROM node:20-alpine AS builder
WORKDIR /usr/src/app
ARG VITE_CLIENT_ID="b5ee804e56a54d6185579bf2f45d863d"
ARG VITE_REDIRECT_ID=http://localhost:3000/
ENV VITE_CLIENT_ID=$VITE_CLIENT_ID
ENV VITE_REDIRECT_ID=$VITE_REDIRECT_ID
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# production environment
FROM nginx:1.23.2-alpine
RUN rm -rf /etc/nginx/conf.d
COPY ./docker/nginx/default.conf /etc/nginx/conf.d/
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html
RUN chmod +r /usr/share/nginx/html/*
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
