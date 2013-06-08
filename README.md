FightWithFriends
================

A RTS Game


Prerequisites
-------------
1. nginx
2. nodejs
3. couchbase-server
4. libcouchbase2
5. libcouchbase-dev


Node JS Modules
---------------
1. npm install socket.io
2. npm install couchbase
3. npm instlal forever


Setup
-----
1. Clone this git repo into /home/USERNAME/FightWithFriends (run git clone git@github.com:sramanujan/FightWithFriends.git at /home/<username>)
2. Create a new branch for yourself. (run git checkout -b dev_USERNAME)
3. Copy fwf.conf to USERNAME.fwf.conf and replace the following
    /mnt/FightWithFriends; -----> /home/USERNAME/FightWithFriends;
    server_name fwf.dev2-hackathon.zc2.zynga.com localhost; -----> server_name USERNAME-fwf.dev2-hackathon.zc2.zynga.com localhost;
4. Run: sudo ln -s /home/USERNAME/FightWithFriends/USERNAME.fwf.conf /etc/nginx/conf.d/USERNAME.fwf.conf
5. In /home/USERNAME/FightWithFriends/ folder, run the following:
    npm install socket.io
    npm install couchbase
6. You can start your node js server as and when you want manually. Remember, it will try to use port 8028 by default. This will not work if multiple people are trying to use the same port. The other available ports are: 8080 and 8097.

Local Setup
-----------
1. It is mostly the same as above. Remeber to setup the prerequisite softwares.
2. For couchbase, hit localhost:8091 and configure it with root user name "fwf-root", root password "fwf-rootpwd", and a new bucket "fwf".
3. Add "127.0.0.1   USERNAME-fwf.dev2-hackathon.zc2.zynga.com" into your /etc/hosts file whenever you want to use local setup in place of remote setup (remember to clear it to check remote setup!).
