== Deploy nook-server to the VPS ==

Server:   https://nook.noodev8.com  -> nginx -> 127.0.0.1:3013
pm2 name: nookbuffet_prod
Repo:     /apps/nookbuffet               (git clone of noodev8/nookbuffet)
Live:     /apps/production/nook-server   (copy of nook-server, has the .env)
Uploads:  /apps/production/nook-uploads  (UPLOAD_DIR in .env, kept out of the deploy folder)
nginx:    /etc/nginx/sites-available/nook.noodev8.com (client_max_body_size 6M for uploads)

-- Update (run after pushing to GitHub)
cd /apps/nookbuffet && git pull
rsync -av --delete --exclude='.env' --exclude='node_modules' --exclude='uploads' /apps/nookbuffet/nook-server/ /apps/production/nook-server/
cd /apps/production/nook-server && npm install --omit=dev
pm2 restart nookbuffet_prod --update-env

-- Check
pm2 logs nookbuffet_prod --lines 15 --nostream
curl -s https://nook.noodev8.com/

-- New .env settings must be added by hand
nano /apps/production/nook-server/.env
CORS_ORIGIN is comma separated and must list every web address that calls the API
(both Vercel sites).


== Web apps (Vercel) ==
Both deploy automatically when main is pushed to GitHub.

nook-web    Root Directory: nook-web
            NEXT_PUBLIC_API_URL = https://nook.noodev8.com

nook-admin  Root Directory: nook-admin
            NEXT_PUBLIC_API_URL = https://nook.noodev8.com
            NEXT_PUBLIC_WEB_URL = <the nook-web Vercel address>
