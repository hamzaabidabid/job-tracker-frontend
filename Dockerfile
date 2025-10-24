# =======================================================
# Étape 1: Phase de construction (Build Stage)
# =======================================================
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# =======================================================
# Étape 2: Phase de service (Serve Stage)
# =======================================================
FROM nginx:alpine

# Supprime les fichiers par défaut de Nginx
RUN rm -rf /usr/share/nginx/html/*

# --- LA CORRECTION EST ICI ---
# On copie le contenu du sous-dossier 'browser' qui contient le vrai build
COPY --from=build /app/dist/job-tracker-frontend/browser/ /usr/share/nginx/html/

# On copie notre configuration Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
