FROM node AS build

WORKDIR /recallcode-docs

COPY package*.json .
RUN npm install

COPY . .

RUN npm run build

FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /recallcode-docs/dist /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]