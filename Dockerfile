FROM node:20-alpine3.16
COPY backend ./backend
COPY frontend ./frontend
WORKDIR ./frontend
RUN npm install
RUN npm run build
WORKDIR ../backend
RUN npm install
CMD ["npm", "run", "dev"]