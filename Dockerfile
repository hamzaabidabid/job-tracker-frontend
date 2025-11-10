## =======================================================
## Étape 1: Phase de construction (Build Stage)
## =======================================================
#FROM node:18-alpine AS build
#WORKDIR /app
#COPY package*.json ./
#RUN npm install
#COPY . .
#RUN npm run build
#
## =======================================================
## Étape 2: Phase de service (Serve Stage)
## =======================================================
#FROM nginx:alpine
#
## Supprime les fichiers par défaut de Nginx
#RUN rm -rf /usr/share/nginx/html/*
#
## --- LA CORRECTION EST ICI ---
## On copie le contenu du sous-dossier 'browser' qui contient le vrai build
#COPY --from=build /app/dist/job-tracker-frontend/browser/ /usr/share/nginx/html/
#
## On copie notre configuration Nginx
#COPY nginx.conf /etc/nginx/conf.d/default.conf
#
#EXPOSE 80
# =======================================================
# Étape 1: Phase de service (Serve Stage)
# On part directement de l'image Nginx de production
# =======================================================
FROM nginx:alpine

# On supprime les fichiers par défaut de Nginx
RUN rm -rf /usr/share/nginx/html/*

# On copie le contenu du dossier 'dist' qui a été compilé par Jenkins
# Le chemin exact peut varier, ajustez si nécessaire
COPY dist/job-tracker-frontend/browser/ /usr/share/nginx/html/

# On copie notre configuration Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# On expose le port
EXPOSE 80
