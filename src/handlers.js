/*
* Handlers for different routes
*
*/

const helpers = require('../lib/helpers');
const _data = require('../lib/data');


const handler = {};

handler.users = function (data, callback) {

    let validMethods = ['POST', 'GET', 'PUT', 'DELETE'];

    if (validMethods.includes(data.method)) {

        handler._users[data.method](data, callback);

    } else {

        callback(405, { "error": "method not allowed" });

    }

}

handler._users = {};

handler._users.POST = function (data, callback) {

    let payload = data.content;

    let firstName = helpers.validName(payload.firstName);
    let lastName = helpers.validName(payload.lastName);
    let password = helpers.validPassword(payload.password);
    let phoneNumber = helpers.validPhoneNumber(payload.phoneNumber);
    let tosAgreement = typeof payload.tosAgreement === "boolean" && payload.tosAgreement === true ? true : false;
    let hashedPassword = helpers.hash(password);


    if (firstName && lastName && hashedPassword && phoneNumber && tosAgreement) {

        let user = {

            firstName: firstName,
            lastName: lastName,
            hashedPassword: hashedPassword,
            phoneNumber: phoneNumber,
            tosAgreement: true

        }

        _data.create("users", phoneNumber, user)
            .then((e) => {

                if (e) {

                    callback(500, { 'Error': 'Could not store the data, the user may already exist' });

                } else {

                    callback(200, { 'Nice': 'The POST operation was succesful' });

                }

            })


    } else {

        callback(400, { 'Error': 'Missing or not suitable fields' });


    }


}

handler._users.PUT = function (data, callback) {

    let payload = data.content;

    let firstName = helpers.validName(payload.firstName);
    let lastName = helpers.validName(payload.lastName);
    let password = helpers.validPassword(payload.password);
    let phoneNumber = helpers.validPhoneNumber(payload.phoneNumber);
    let tokenId = helpers.validToken(data.headers.tokenid);

    if (phoneNumber) {

        handler._tokens.authenticate(tokenId, phoneNumber, (allowed) => {

            console.log(allowed);

            if (allowed) {

                if (firstName || lastName || password) {

                    _data.read('users', phoneNumber)
                        .then((res) => {

                            if (res) {

                                if (firstName) {

                                    res.firstName = firstName;

                                }

                                if (lastName) {

                                    res.lastName = lastName;

                                }

                                if (password) {

                                    res.hashedPassword = helpers.hash(password);

                                }

                                _data.update('users', phoneNumber, res)
                                    .then((e) => {

                                        if (e) {

                                            callback(500, { 'Error': 'Could not store the data, the user may already exist' });


                                        } else {

                                            callback(200, { 'Nice': 'The PUT operation was succesful' });

                                        }


                                    });

                            } else {

                                callback(404, { 'Error': 'This user does not exist' });

                            }

                        });

                } else {

                    callback(400, { 'Error': 'Must provide a field to update' });

                }



            } else {

                callback(403, { 'Error': 'Must provide a valid token' });

            }


        });


    } else {

        callback(400, { 'Error': 'Must provide a valid phone number' });


    }

}

handler._users.DELETE = function (data, callback) {

    let pn = data.url.searchParams.get('phoneNumber');
    let phoneNumber = helpers.validPhoneNumber(pn);
    let tokenId = helpers.validToken(data.headers.tokenid);

    if (phoneNumber) {

        handler._tokens.authenticate(tokenId, phoneNumber, (allowed) => {

            if (allowed) {

                _data.delete('users', phoneNumber)
                    .then((res) => {

                        if (!res) {

                            callback(200, { 'Nice': 'The DELETE operation was succesful' });

                        } else {

                            callback(500, { 'Error': 'Could not delete the user, it may not exist' });

                        }

                    });

            } else {

                callback(403, { 'Error': 'You should have a valid token' });

            }

        });

    } else {

        callback(400, { 'Error': 'Must provide a valid phone number' });
    }
}

handler._users.GET = function (data, callback) {

    let pn = data.url.searchParams.get('phoneNumber');
    let phoneNumber = helpers.validPhoneNumber(pn);
    let tokenId = helpers.validToken(data.headers.tokenid);

    if (phoneNumber) {

        handler._tokens.authenticate(tokenId, phoneNumber, (allowed) => {

            if (allowed) {

                let user = _data.read('users', phoneNumber)
                    .then((res) => {

                        if (res) {

                            delete res.hashedPassword;

                            callback(200, res);

                        } else {

                            callback(404, { 'Error': 'This user does not exist' });

                        }

                    });



            } else {

                callback(403, { 'Error': 'You should have a valid token' });

            }

        });



    } else {

        callback(400, { 'Error': 'Must provide a valid phone number' });
    }

}

handler.ping = function (data, callback) {

    callback(200, { 'Ping': 'Server is up' });

};

handler.notFound = function (data, callback) {

    callback(404, { 'status': '404 not found' });

};

handler.tokens = function (data, callback) {

    let validMethods = ['POST', 'GET', 'PUT', 'DELETE'];

    if (validMethods.includes(data.method)) {

        handler._tokens[data.method](data, callback);

    } else {

        callback(405, { "Error": "method not allowed" });

    }

}

handler._tokens = {};

handler._tokens.POST = function (data, callback) {

    let payload = data.content;
    let phoneNumber = helpers.validPhoneNumber(payload.phoneNumber);
    let password = helpers.validPassword(payload.password);
    let hashedPassword = typeof (password) === "string" ? helpers.hash(password) : false;

    if (phoneNumber && hashedPassword) {

        _data.read('users', phoneNumber).then((userData) => {

            if (userData) {

                let userPassword = userData.hashedPassword;

                if (userPassword === hashedPassword) {


                    //Random 20-character string will be the authentication token

                    let tokenId = helpers.createToken(20);

                    let expiringDate = Date.now() + 1000 * 60 * 60;

                    let token = {

                        tokenId: tokenId,
                        phoneNumber: phoneNumber,
                        expires: expiringDate,

                    }

                    _data.create('tokens', tokenId, token)

                        .then((e) => {

                            if (e) {

                                callback(500, { 'Error': 'Could not register the token' });

                            } else {

                                callback(200, token);

                            }


                        });




                } else {

                    callback(400, { 'Error': 'The password is incorrect' });

                }



            } else {

                callback(500, { 'Error': 'Could not find any data for this user' });

            }


        });

    } else {

        callback(400, { 'Error': 'Missing or not suitable fields' });

    }

}

handler._tokens.GET = function (data, callback) {

    let ti = data.url.searchParams.get('tokenId');
    let tokenId = helpers.validToken(ti);

    if (tokenId) {

        _data.read('tokens', tokenId).then((data) => {

            if (data) {

                callback(200, data);

            } else {

                callback(404);

            }


        });


    } else {

        callback(400, { 'Error': 'Must provide a valid token id' });

    }


}

handler._tokens.PUT = function (data, callback) {

    let tokenId = helpers.validToken(data.content.tokenId);
    let extend = typeof (data.content.extend) === 'boolean' ? data.content.extend : false;

    if (tokenId && extend) {

        _data.read('tokens', tokenId).then((data) => {

            if (data) {

                if (data.expires > Date.now()) {

                    data.expires = data.expires + 1000 * 60 * 60;

                    _data.update('tokens', tokenId, data).then((e) => {

                        if (!e) {

                            callback(200);

                        } else {

                            callback(500);

                        }

                    });


                } else {

                    callback(400, { 'Error': 'The token has already expired' });

                }



            } else {

                callback(404);

            }


        });


    } else {

        callback(400, { 'Error': 'The user must provide valid fields' });

    }

}

handler._tokens.DELETE = function (data, callback) {

    let ti = data.url.searchParams.get('tokenId');
    let tokenId = helpers.validToken(ti);


    if (tokenId) {

        _data.delete('tokens', tokenId)
            .then((res) => {

                if (!res) {

                    callback(200, { 'Nice': 'The DELETE operation was succesful' });

                } else {

                    callback(500, { 'Error': 'Could not delete the token, it may not exist' });

                }

            });

    } else {

        callback(400, { 'Error': 'Must provide a valid token ' });
    }
}

handler._tokens.authenticate = function (tokenId, phoneNumber, callback) {

   if (tokenId) {
        _data.read('tokens', tokenId)
            .then((data) => {

                if (data) {

                    callback(data.phoneNumber === phoneNumber && data.expires > Date.now() ? true : false);


                } else {

                    callback(false);

                }

            });
    } else {

        callback(false);

    }

}

module.exports = handler;