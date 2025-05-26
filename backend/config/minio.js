import * as Minio from 'minio'

const minioClient = new Minio.Client({
    endPoint: 'localhost',
    port: 9000,
    useSSL: false,
    accessKey: 'minioadmin',
    secretKey: 'minioadmin'
});


const bucketName = 'medical-records';

export { minioClient, bucketName };