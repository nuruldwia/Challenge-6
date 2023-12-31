const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

module.exports = {
    register: async(req, res, next) => {
        try {
            let { username, email, password, password_confirmation } = req.body;

            if(password != password_confirmation) {
                return res.status(400).json({
                    status: false,
                    message: 'Bad Request!',
                    err: 'Please ensure that the password and password confirmation match!',
                    data: null
                });
            }

            let userExist = await prisma.users.findUnique({ where: { email }});
            if(userExist) {
                return res.status(400).json({
                    status: false,
                    message: 'Bad Request',
                    err: 'user has already been used!',
                    data: null
                });
            }

            let encryptedPassword = await bcrypt.hash(password, 10);
            
            let user = await prisma.users.create({
                data: {
                    username,
                    email,
                    password: encryptedPassword
                }
            });

            return res.status(201).json({
                status: true,
                message: 'Created!',
                err: null,
                data: { user }
            });

        } catch (err) {
            next(err);
        }
    },

    login: async(req, res, next) => {
        try {
            let { email, password } = req.body;

            let user = await prisma.users.findUnique({ where: { email } });
            if (!user) {
                return res.status(400).json({
                    status: false,
                    message: 'Bad Request',
                    err: 'invalid email or password!',
                    data: null
                });
            }

            let isPasswordCorrect = await bcrypt.compare(password, user.password);
            if (!isPasswordCorrect) {
                return res.status(400).json({
                    status: false,
                    message: 'Bad Request',
                    err: 'invalid email or password!',
                    data: null
                });
            }

            return res.status(200).json({
                status: true,
                message: 'OK',
                err: null,
                data: { user }
            });
        } catch (err) {
            next(err);
        }
    }
};