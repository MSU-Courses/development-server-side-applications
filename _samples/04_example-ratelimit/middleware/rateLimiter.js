// так называемое "ведро" где хранятся ключи
const buckets = new Map()

export default function rateLimiter({ capacity, refillRate }) {
    return (req, res, next) => {
        const key = req.ip // может быть userId

        // если у клиента нет ведра, создаем его
        if (!buckets.has(key)) {
            buckets.set(key, {
                tokens: capacity,
                lastRefill: Date.now()
            })
        }

        // получаем ведро клиента, получаем время и получаем сколько прошло с поледнего обновления
        const bucket = buckets.get(key)
        const now = Date.now()
        const expired = (now - bucket.lastRefill) / 1000

        // Пополняем ведро токенами, и делаем чтоб не было больше capacity
        bucket.tokens = Math.min(
            capacity,
            bucket.tokens + expired * refillRate
        )
        bucket.lastRefill = now

        // Вывод текущих данных (для логирования)
        console.log({
            tokens: bucket.tokens,
            expired,
            lastRefill: bucket.lastRefill
        });

        // если есть токены, разрешаем вход и забираем 1
        if (bucket.tokens >= 1) {
            bucket.tokens -= 1
            next()
        } else { // иначе выдаем 429 ошибку
            res.status(429).json({
                error: "Too Many Requests"
            })
        }
    }
}