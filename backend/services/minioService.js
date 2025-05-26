import { minioClient, bucketName } from '../config/minio.js';

export const uploadFile = async (file, fileName) => {
    // Преобразуем имя файла в UTF-8
    const utf8FileName = Buffer.from(fileName, 'utf8').toString('utf8');
    console.log('Uploading to MinIO with filename:', utf8FileName);
    await minioClient.putObject(bucketName, utf8FileName, file.buffer, {
        'Content-Type': file.mimetype,
    });
    return utf8FileName;
};

export const downloadFile = async (fileName) => {
    return await minioClient.getObject(bucketName, fileName);
};
// hello