const debugMiddleware = (req, res, next) => {
    console.log('Debug: Request headers:', req.headers);
    console.log('Debug: Request body:', req.body);
    console.log('Debug: Request file:', req.file);
    next();
};

export default debugMiddleware;