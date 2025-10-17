cd /home/hosting_users/hwaksee
git pull origin main
npm install --prefix client
npm run build --prefix client
pm2 restart hwaksee-prod