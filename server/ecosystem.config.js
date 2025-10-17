module.exports = {
        apps: [{
                name: 'hwaksee-prod',
                script: './server.prod.js',
                env: {
                NODE_ENV: 'production',
                PORT: 80,
                MONGO_URI: 'mongodb+srv://design2hyun_db_user:CfeE0ap8EStfeaQo@cluster0.fzelmvg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
                JWT_SECRET: 'your_jwt_secret',
                NAVER_CLIENT_ID: '56pRp0qxTMj5X6A9K6S4cu',
                NAVER_CLIENT_SECRET: '$2a$04$szNqwgYgPPcNZduboVkGTO',
                NAVER_ORDER_API: 'https://api.commerce.naver.com/external/v2/products'
                }
        }]
}
