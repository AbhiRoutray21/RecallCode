FROM node AS build

WORKDIR /client

COPY .env ./

COPY package*.json .
RUN npm install

COPY . .

RUN npm run build

FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /client/dist /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]

