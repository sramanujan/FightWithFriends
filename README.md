FightWithFriends
================

A RTS Game


Prerequisites
-------------
nginx
nodejs
couchbase-server
libcouchbase2
libcouchbase-dev


Node JS Modules
---------------
npm install socket.io
npm install couchbase


Setup
-----
1. Go to http://developers.facebook.com/ and create a new APP.
2. Namespace: USERNAME_fwf
3. App Domains: dev2-hackathon.zc2.zynga.com
4. Site URL: http://fb.USERNAME-fwf.dev2-hackathon.zc2.zynga.com
5. Canvas URL: http://fb.USERNAME-fwf.dev2-hackathon.zc2.zynga.com
6. Secure Canvas URL: https://fb.USERNAME-fwf.dev2-hackathon.zc2.zynga.com
7. Clone this git repo into /home/USERNAME/FightWithFriends (run git clone git@github.com:sramanujan/FightWithFriends.git at /home/<username>)
8. Create a new branch for yourself. (run git checkout -b dev_USERNAME)
9. Edit global.js (part of assets/js/) with the appropriate Facebook APP ID.
10. Copy fwf.conf to USERNAME.fwf.conf and replace the following
    /mnt/FightWithFriends; -----> /home/USERNAME/FightWithFriends;
    server_name *.fwf.dev2-hackathon.zc2.zynga.com fwf.dev2-hackathon.zc2.zynga.com localhost; -----> server_name *.USERNAME.fwf.dev2-hackathon.zc2.zynga.com USERNAME.fwf.dev2-hackathon.zc2.zynga.com localhost;
11. Run: sudo ln -s /home/USERNAME/FightWithFriends/USERNAME.fwf.conf /etc/nginx/conf.d/USERNAME.fwf.conf
12. In /home/USERNAME/FightWithFriends/ folder, run the following:
    npm install socket.io
    npm install couchbase
13. You can start your node js server as and when you want manually. Remember, it will try to use port 8028 by default. This will not work if multiple people are trying to use the same port. The other available ports are: 8090 and 8097.
