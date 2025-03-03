// CORS headers - daha kapsamlı bir şekilde güncelleyelim
router.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // OPTIONS isteklerini handle et
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});