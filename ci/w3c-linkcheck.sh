#!/bin/bash

subject=$(git log -1 --oneline)
if [[ "$subject" != *full?linkcheck* ]]; then
    echo "No [full-linkcheck] annotation found. Exiting."
    exit 0
fi
sudo apt-get install -q  -y cpanminus
sudo cpanm install--reinstall W3C::LinkChecker
echo "Allowed_Protocols = http,https,ftp,file" > /tmp/checklink.conf
export  W3C_CHECKLINK_CFG="/tmp/checklink.conf"

checklink \
    --suppress-broken '-1:https://opencpn.org/' \
    --suppress-broken '-1:https://www.opencpn.org/flyspray/' \
    --suppress-broken '403:https://www.opencpn.org/' \
    --suppress-broken '403:https://opencpn.org/flyspray/' \
    --suppress-broken '403:https://opencpn.org/flyspray/index.php?project=0&do=index' \
    --suppress-broken '403:https://opencpn.org/OpenCPN/info/downloadplugins.html' \
    --suppress-broken '403:$dokuwiki?id=opencpn:opencpn_user_manual' \
    --suppress-broken '-1:https://cubian.org/downloads/' \
    --suppress-broken '-1:https://cubian.org/2013/08/12/enlarge-cubian-rootfs-partition/' \
    --suppress-redirect 'https://opencpn-manuals.github.io/development->https://opencpn-manuals.github.io/development/' \
    --exclude apple.com \
    --exclude bigdumboat.com \
    --exclude  cloudsmith.io/orgs/opencpn \
    --exclude cruisersforum.com \
    --exclude firebasestorage.googleapis.com \
    --exclude github.com/travis-ci \
    --exclude mailto: \
    --exclude opencpn.org \
    --depth 4 -s docs/index.html |& grep -v "Use of uninitialized value"
