
const avatarList = ["https://raw.githubusercontent.com/Ashwinvalento/cartoon-avatar/master/lib/images/female/109.png", "https://raw.githubusercontent.com/Ashwinvalento/cartoon-avatar/master/lib/images/female/11.png", "https://raw.githubusercontent.com/Ashwinvalento/cartoon-avatar/master/lib/images/female/112.png", "https://raw.githubusercontent.com/Ashwinvalento/cartoon-avatar/master/lib/images/male/102.png", "https://raw.githubusercontent.com/Ashwinvalento/cartoon-avatar/master/lib/images/male/103.png", "https://raw.githubusercontent.com/Ashwinvalento/cartoon-avatar/master/lib/images/male/104.png"];
const avatar = () => {
    return avatarList[Math.floor((Math.random() * avatarList.length) + 1)];
}

module.exports = avatar;