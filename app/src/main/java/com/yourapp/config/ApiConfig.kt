object ApiConfig {
    const val PRODUCTION_BASE_URL = "http://socialcampus-production.up.railway.app"
    const val DEBUG_BASE_URL = "http://10.0.2.2:3000/api/"
    
    val BASE_URL = if (BuildConfig.DEBUG) DEBUG_BASE_URL else PRODUCTION_BASE_URL
} 