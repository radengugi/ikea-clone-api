FROM node:12

# Buat direktori aplikasi di dalam docker
WORKDIR /usr/src/path

# Menyalin dependencies aplikasi kedalam docker 
COPY package*.json ./

# Instalasi dependencies
RUN npm install

# Menyalin file aplikasi
copy . .

# define port
EXPOSE 2025

# menjalankan aplikasi kita
CMD ["node","index.js"]