const store = new Map();

const getCache = async (key) => {
    const entry = store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
        store.delete(key);
        return null;
    }
    return entry.value;
};

const setCache = async (key, value, ttlSeconds = 60) => {
    store.set(key, {
        value: JSON.parse(JSON.stringify(value)),
        expiresAt: Date.now() + ttlSeconds * 1000
    });
};

const deleteCache = async (key) => {
    store.delete(key);
};

module.exports = { getCache, setCache, deleteCache };
