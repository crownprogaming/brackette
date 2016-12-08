/**
 * Helper.js are functions that can be used by any class.
 */
var bcrypt = require('bcrypt-nodejs');
module.exports = {

    /**
     * Generates a hash value of a string.
     */
    generateHash: function(password) {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    },

   /**
    * Checks whether a password and hashed password matches.
    */
    validPassword: function(password, hashedPassword) {
        return bcrypt.compareSync(password, hashedPassword);
    },

}
