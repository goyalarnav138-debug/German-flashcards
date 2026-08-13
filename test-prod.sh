killall node || true
NODE_ENV=production npm run start &
sleep 3
curl -sI http://0.0.0.0:3000/
curl -sI http://0.0.0.0:3000/some-random-route
curl -s http://0.0.0.0:3000/some-random-route | head -n 5
killall node || true
