const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const imagekit = require('../libs/imagekit');
const path = require('path');
const getPagination = require('../helpers/pagination');

module.exports = {
    uploadImage: async (req, res, next) => {
        try {
            let { userId, title, description } = req.body;
            let image = req.file;

            if (!userId || !title || !description) {
                return res.status(400).json({
                    status: false,
                    message: 'The field cannot empty',
                    data: null
                });
            }

            if (!image) {
                return res.status(400).json({
                    status: false,
                    message: 'Missing the image!',
                    data: null
                });
            }

            const strFile = req.file.buffer.toString('base64');

            let { url } = await imagekit.upload({
                fileName: Date.now() + path.extname(req.file.originalname),
                file: strFile
            });

            const newImage = await prisma.artGallery.create({
                data: {
                    userId : Number(userId),
                    title,
                    description,
                    image : url,
                }
            });

            return res.status(201).json({
                status: true,
                message: 'CREATED',
                error: null,
                data: newImage
            }); 
        } catch (err) {
            next(err);
        }
    },

    getAllImages: async(req, res, next) => {
        try {
            let { limit = 10, page = 1} = req.query;
            limit = Number(limit);
            page = Number(page);

            let users = await prisma.artGallery.findMany({
                skip: (page - 1) * limit,
                take: limit,
            });

            const { _count } = await prisma.artGallery.aggregate({
                _count: { id: true }
            });

            let pagination = getPagination(req, _count.id, page, limit);

            res.status(200).json({
                status: true,
                message: "OK!",
                data: { pagination, users }
            });
        } catch (err) {
            next(err);
        }
    },

    getDetailImage: async(req, res, next) => {
        try {
            let { id } = req.params;
            let imageDetail = await prisma.artGallery.findUnique({
                where: { id: Number(id) },
                include:{
                    user: true
                }
            });

            if (!imageDetail) {
                return res.status(400).json({
                    status: true,
                    message: "Bad Request!",
                    data: "No User Found with Id " + id
                });
            }

            res.status(200).json({
                status: true,
                message: "OK!",
                data: imageDetail
            });
        } catch (err) {
            next(err);
        }
    },

    updateGallery: async(req, res, next) => {
        let { id } = req.params;
        let { title, description } = req.body;
        let image = req.file;

        let gallery = await prisma.artGallery.findUnique({ where: { id: Number(id) }});
        if (!gallery) {
            return res.status(400).json({
                status: false,
                message: "Image doesn\'t exist!",
                data: null
            });
        }

        const strFile = image.buffer.toString('base64');

        let { url } = await imagekit.upload({
            fileName: Date.now() + path.extname(req.file.originalname),
            file: strFile
        });

        let renewGallery = await prisma.artGallery.update({
            where: ({ id: Number(id) }),
            data: {
                title,
                description,
                image: url
            }
        });

        res.status(200).json({
            status: true,
            message: "Gallery were Successfully Updated!",
            data: renewGallery
        });
    },

    deleteGallery: async(req, res, next) => {
        try {
            let { id } = req.params;

            let deleteImage = await prisma.artGallery.delete({
                where: { id: Number(id) }
            });

            if (!deleteImage) {
                return res.status(400).json({
                    status: false,
                    message: "Image doesn\'t exist!",
                    data: null
                });
            }

            res.status(200).json({
                status: true,
                message: "Gallery were Successfully Updated!",
                data: renewGallery
            });
        } catch (err) {
            next(err);
        }
    }
};