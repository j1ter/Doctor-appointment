import { minioClient, bucketName } from '../config/minio.js';

export const uploadFile = async (file) => {
    const fileName = `${Date.now()}_${file.originalname}`;
    await minioClient.putObject(bucketName, fileName, file.buffer, {
        'Content-Type': file.mimetype
    });
    return fileName;
};

export const downloadFile = async (fileName) => {
    return await minioClient.getObject(bucketName, fileName);
};
// hello