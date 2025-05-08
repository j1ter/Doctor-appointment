import multer from 'multer';

// Настройка хранения файлов в памяти
const storage = multer.memoryStorage();

// Конфигурация multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB лимит
    },
});

export default upload;