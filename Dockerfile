FROM node
COPY backend ./backend
COPY frontend ./frontend
WORKDIR ./backend
RUN npm install
WORKDIR ../frontend
RUN npm install
RUN npm run build
WORKDIR ../backend
CMD ["npm", "run", "dev"]