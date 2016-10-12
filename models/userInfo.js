var sequelize = require('../config').getSequelize();
var Sequelize = require('sequelize');
var UserInfo = sequelize.define('userInfo', {
    userId: {
        type: Sequelize.INTEGER(11),
        field: 'user_id',
        allowNull: false,
    },
    gamerTag: {
        type: Sequelize.STRING(150),
        field: 'gamer_tag',
        defaultValue: null
    },
    profileImg: {
        type: Sequelize.STRING(150),
        field: 'profile_img',
        defaultValue: null
    }
});
UserInfo.sync();
module.exports = UserInfo;