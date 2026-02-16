// config/baserow.js
const BASEROW_CONFIG = {
    baseURL: 'http://213.199.56.115/api',
    token: '1rq7OOnCoVCuSDKXzv8k7JbGh9wO9MsH',
    tables: {
        conteudos: 4400,
        episodios: 5175,
        banners: 5352,
        sessoes: 5353
    },
    fields: {
        conteudos: {
            capa: 34665,
            nome: 29998,
            link: 29999,
            sinopse: 30000,
            categoria: 34666,
            ano: 34667,
            duracao: 34668,
            trailer: 34669,
            fotosElenco: 34670,
            nomeElenco: 34671,
            tipo: 34672
        },
        episodios: {
            nome: 35682,
            temporada: 35684,
            episodio: 35685
        },
        banners: {
            imagem: 35687,
            link: 35689,
            categoria: 35692
        },
        sessoes: {
            categoria: 35693,
            tipo: 35694
        }
    }
};

class BaserowAPI {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
    }

    getHeaders() {
        return {
            'Authorization': `Token ${BASEROW_CONFIG.token}`,
            'Content-Type': 'application/json'
        };
    }

    getCacheKey(endpoint, params) {
        return `${endpoint}_${JSON.stringify(params)}`;
    }

    async fetchWithRetry(url, options = {}, retries = 3) {
        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(url, {
                    ...options,
                    headers: this.getHeaders()
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                return await response.json();
            } catch (error) {
                console.error(`Tentativa ${i + 1} falhou:`, error);
                
                if (i === retries - 1) {
                    throw new Error(`Falha após ${retries} tentativas: ${error.message}`);
                }
                
                // Aguarda antes de tentar novamente (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
            }
        }
    }

    async getRows(tableId, params = {}) {
        const cacheKey = this.getCacheKey(`table_${tableId}`, params);
        
        // Verifica cache
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                console.log('Retornando do cache:', cacheKey);
                return cached.data;
            }
        }

        const queryParams = new URLSearchParams({
            user_field_names: 'true',
            ...params
        });

        const url = `${BASEROW_CONFIG.baseURL}/database/rows/table/${tableId}/?${queryParams}`;
        
        try {
            const data = await this.fetchWithRetry(url);
            
            // Salva no cache
            this.cache.set(cacheKey, {
                data: data,
                timestamp: Date.now()
            });
            
            return data;
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
            
            // Retorna dados em cache mesmo expirados se houver
            if (this.cache.has(cacheKey)) {
                console.warn('Retornando cache expirado devido a erro');
                return this.cache.get(cacheKey).data;
            }
            
            throw error;
        }
    }

    async searchRows(tableId, searchTerm, searchField) {
        const params = {
            search: searchTerm,
            size: 50
        };
        
        return await this.getRows(tableId, params);
    }

    async getRowById(tableId, rowId) {
        const url = `${BASEROW_CONFIG.baseURL}/database/rows/table/${tableId}/${rowId}/?user_field_names=true`;
        
        try {
            return await this.fetchWithRetry(url);
        } catch (error) {
            console.error('Erro ao buscar row por ID:', error);
            throw error;
        }
    }

    clearCache() {
        this.cache.clear();
        console.log('Cache limpo');
    }
}

// Instância global
const baserowAPI = new BaserowAPI();