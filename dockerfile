FROM node:20-alpine
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install

# Copy source files
COPY . .

# Generate Prisma client and build typescript code
RUN npx prisma generate
RUN npm run build

# Production stage
# FROM nginx:alpine
# COPY --from=build /app/dist /usr/share/nginx/html
# COPY --from=build /dist /usr/share/nginx/html
# COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 4000
CMD ["npm", "start"]