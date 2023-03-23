# Getting my indoor bike to work according to FTMS spec

When trying to connect my bike to fitness apps I noticed there were only a few of them that would accept data from the bike. While investigating the issue I found the bike to not follow the latest released version of the FTMS spec, which led me to hope the issue could be solved by creating a Bluetooth proxy device.

## Inspiration

[ptx2](https://ptx2.net/posts/unbricking-a-bike-with-a-raspberry-pi/)
[Huawei](https://developer.huawei.com/consumer/en/doc/development/HMSCore-Guides/ibd-0000001051005923)
[RapidTables](https://www.rapidtables.com/convert/number/hex-to-binary.html)

## Autostart in Raspberry Pi

### Prepare image

- Install Pi OS Lite
- Enable WiFi + SSH

### Update components

```
sudo apt update && sudo apt upgrade
```

### Install node

```
wget https://unofficial-builds.nodejs.org/download/release/v18.5.0/node-v18.5.0-linux-armv6l.tar.gz
tar -zxf node-v18.5.0-linux-armv6l.tar.gz 
cp -r node-v18.5.0-linux-armv6l/ /usr/local
node -v

sudo apt install build-essential libcap2-bin

npm i -g pnpm pm2

sudo setcap cap_net_raw+eip $(eval readlink -f `which node`)
```

### Build app

```
mkdir app && cd app
wget https://github.com/raknes/echo-bike-server/tarball/master -O - | tar -xz --strip 1
pnpm i && pnpm build
```

### Install app as service

```
pm2 start dist/index.js
pm2 startup systemd

# pm2 generates a command to be run
# copy generated command and run it
sudo env PATH=...

pm2 save

pm2 list
pm2 status
pm2 show app
```
