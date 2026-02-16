# 🍿 PIPOCAFLIX - Plataforma de Streaming Profissional

Streaming completo de filmes e séries construído com HTML5, CSS3 e JavaScript puro (Vanilla JS). Padrão Netflix/Prime Video/Disney+.

---

## 🚀 CARACTERÍSTICAS

✅ **100% Responsivo** - Mobile First Design
✅ **Player Customizado** - Controles HTML5 nativos
✅ **Integração Baserow** - Banco de dados em nuvem
✅ **SmartLink** - Sistema de monetização integrado
✅ **Anti-Roubo** - Proteção total do código
✅ **AdBlock Detector** - Bloqueio de adblockers
✅ **Séries com Temporadas** - Organização automática
✅ **Autoplay Next Episode** - Reprodução contínua
✅ **Web Share API** - Compartilhamento nativo
✅ **Cast API** - Transmissão para TV
✅ **Cache Inteligente** - Performance otimizada
✅ **SEO Otimizado** - Meta tags completas

---

## 📁 ESTRUTURA DO PROJETO
```
/pipocaflix
│
├── index.html              # Página principal
├── search.html             # Página de busca
├── movie.html              # Player de filmes
├── series.html             # Player de séries
│
├── assets/                 # Recursos estáticos
│   ├── logo.png
│   ├── icons/
│   └── images/
│
├── css/                    # Estilos
│   ├── reset.css          # Reset CSS
│   ├── global.css         # Variáveis e globais
│   ├── home.css           # Estilos da home
│   ├── player.css         # Estilos do player
│   ├── series.css         # Estilos de séries
│   ├── search.css         # Estilos de busca
│   └── responsive.css     # Media queries
│
├── js/                     # Scripts
│   ├── api.js             # Camada de API
│   ├── home.js            # Lógica da home
│   ├── search.js          # Lógica de busca
│   ├── movie.js           # Lógica do player de filmes
│   ├── series.js          # Lógica de séries
│   ├── security.js        # Proteção anti-roubo
│   ├── adblock.js         # Detector de AdBlock
│   └── ads.js             # Gerenciamento de anúncios
│
├── config/
│   └── baserow.js         # Configuração do Baserow
│
└── README.md              # Esta documentação
```

---

## 🔧 INSTALAÇÃO

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/pipocaflix.git
cd pipocaflix
```

### 2. Configuração do Baserow

O projeto já está configurado com as credenciais:

- **Servidor:** `http://213.199.56.115`
- **Token:** `1rq7OOnCoVCuSDKXzv8k7JbGh9wO9MsH`

As tabelas já estão mapeadas em `/config/baserow.js`

### 3. Adicionar Logo

Coloque seu logo em `/assets/logo.png`

### 4. Configurar Anúncios (Opcional)

Edite `/js/ads.js` e adicione seus códigos de anúncio:
```javascript
adsManager.setAdCodes(
    'SEU_CÓDIGO_NATIVE_AD',
    'SEU_CÓDIGO_SOCIAL_AD',
    'SEU_CÓDIGO_BANNER_AD'
);
```

---

## 🌐 DEPLOY NO VERCEL

### Método 1: Via GitHub (Recomendado)

1. **Crie um repositório no GitHub**
```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/seu-usuario/pipocaflix.git
   git push -u origin main
```

2. **Acesse [vercel.com](https://vercel.com)**

3. **Clique em "New Project"**

4. **Importe seu repositório do GitHub**

5. **Configure o projeto:**
   - Framework Preset: `Other`
   - Build Command: (deixe vazio)
   - Output Directory: `./`
   - Install Command: (deixe vazio)

6. **Clique em "Deploy"**

7. **Aguarde o deploy (1-2 minutos)**

8. **Acesse seu site:** `https://seu-projeto.vercel.app`

### Método 2: Via Vercel CLI
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy para produção
vercel --prod
```

---

## 🔐 CONFIGURAÇÕES DE SEGURANÇA

### SmartLink

O sistema está configurado para exigir **2 cliques** antes de liberar o player:
```javascript
// Em movie.js e series.js
this.smartlinkRequired = 2;
```

URL do SmartLink:
```
https://www.effectivegatecpm.com/eacwhk55f?key=87f8fc919fb5d70a825293b5490713dd
```

### Proteções Ativas

- ✅ Bloqueio de F12 (DevTools)
- ✅ Bloqueio de CTRL+U (Código Fonte)
- ✅ Bloqueio de CTRL+S (Salvar)
- ✅ Bloqueio de Botão Direito
- ✅ Bloqueio de Seleção de Texto
- ✅ Bloqueio de Print Screen
- ✅ Detecção de DevTools Aberto
- ✅ Redirecionamento Automático

---

## 📊 ESTRUTURA DO BASEROW

### Tabela: Site Conteudos (ID: 4400)

| Campo | ID | Descrição |
|-------|-----|-----------|
| Capa | 34665 | URL da imagem de capa |
| Nome | 29998 | Título do conteúdo |
| Link | 29999 | URL do vídeo (MP4/HLS) |
| Sinopse | 30000 | Descrição do conteúdo |
| Categoria | 34666 | Gênero (Ação, Drama, etc) |
| Ano | 34667 | Ano de lançamento |
| Duração | 34668 | Duração (ex: 2h 15min) |
| Trailer | 34669 | URL do YouTube |
| Fotos Elenco | 34670 | Imagens do elenco |
| Nome Elenco | 34671 | Nomes separados por \| |
| Tipo | 34672 | Filme ou Série |

### Tabela: Episodios App (ID: 5175)

| Campo | ID | Descrição |
|-------|-----|-----------|
| Nome | 35682 | Nome/Link do episódio |
| Temporada | 35684 | Número da temporada |
| Episódio | 35685 | Número do episódio |

### Tabela: Site banners (ID: 5352)

| Campo | ID | Descrição |
|-------|-----|-----------|
| Imagem | 35687 | Imagem do banner |
| Link | 35689 | Link de destino |
| Categoria | 35692 | Categoria do banner |

### Tabela: Site Sessões (ID: 5353)

| Campo | ID | Descrição |
|-------|-----|-----------|
| Categoria | 35693 | Nome da sessão |
| Tipo | 35694 | Filme ou Série |

---

## 🎨 PERSONALIZAÇÃO

### Cores

Edite `/css/global.css`:
```css
:root {
    --primary-color: #e50914;        /* Vermelho Netflix */
    --secondary-color: #ffffff;      /* Branco */
    --background-dark: #141414;      /* Preto */
    --background-light: #1f1f1f;     /* Cinza escuro */
}
```

### Logo

Substitua `/assets/logo.png` pelo seu logo.

No código, o logo aparece como:
```html
<a href="/" class="logo">🍿 PIPOCAFLIX</a>
```

Você pode trocar o emoji por:
```html
<img src="/assets/logo.png" alt="Logo">
```

### Título do Site

Edite cada arquivo HTML:
```html
<title>Seu Nome - Streaming</title>
```

---

## 📱 RECURSOS MOBILE

- ✅ Touch/Swipe em carrosséis
- ✅ Controles adaptados para mobile
- ✅ Player fullscreen otimizado
- ✅ Menu responsivo
- ✅ Busca adaptativa
- ✅ Cards otimizados

---

## 🔄 CACHE E PERFORMANCE

### Cache Automático

O sistema salva cache por **5 minutos**:
```javascript
// Em config/baserow.js
this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
```

### Limpar Cache Manualmente
```javascript
// No console do navegador
pipocaFlixAPI.clearCache();
```

---

## 🐛 TROUBLESHOOTING

### Erro: "Filme não encontrado"

1. Verifique se o ID está correto na URL
2. Verifique se o conteúdo existe no Baserow
3. Verifique a conexão com o Baserow

### Player não carrega

1. Verifique se o link do vídeo está correto
2. Verifique se o formato é MP4 ou HLS
3. Verifique CORS do servidor de vídeo

### Episódios não aparecem

1. Verifique se o campo "Nome" na tabela de episódios contém o nome exato da série
2. Verifique se os campos Temporada e Episódio estão preenchidos

### SmartLink não funciona

1. Verifique se o localStorage está habilitado
2. Limpe o cache do navegador
3. Verifique a URL do SmartLink

---

## 🔒 CORS E PROXY

Se você tiver problemas de CORS com vídeos:

### Opção 1: Usar Cloudflare Workers

Crie um worker em `https://workers.cloudflare.com`:
```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const targetUrl = url.searchParams.get('url')
  
  if (!targetUrl) {
    return new Response('Missing url parameter', { status: 400 })
  }

  const response = await fetch(targetUrl)
  const newResponse = new Response(response.body, response)
  
  newResponse.headers.set('Access-Control-Allow-Origin', '*')
  newResponse.headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
  
  return newResponse
}
```

### Opção 2: Usar proxy no código

Adicione em `/js/api.js`:
```javascript
proxyUrl(url) {
    return `https://seu-worker.workers.dev?url=${encodeURIComponent(url)}`;
}
```

---

## 📈 ANALYTICS (Opcional)

Adicione Google Analytics em todas as páginas HTML:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

---

## 🎯 PRÓXIMOS PASSOS

1. ✅ **Adicionar Conteúdo** - Preencha o Baserow com filmes e séries
2. ✅ **Personalizar Design** - Ajuste cores e logo
3. ✅ **Configurar Anúncios** - Adicione seus códigos de anúncio
4. ✅ **Deploy** - Publique no Vercel
5. ✅ **Domínio Customizado** - Configure seu domínio
6. ✅ **SSL** - Ative HTTPS (automático no Vercel)

---

## 📞 SUPORTE

Para dúvidas ou problemas:

1. Verifique este README
2. Verifique o console do navegador (F12)
3. Verifique a aba Network para erros de API
4. Verifique se o Baserow está acessível

---

## 📜 LICENÇA

Este projeto é fornecido "como está", sem garantias.

Você é livre para usar, modificar e distribuir conforme necessário.

---

## ⚠️ AVISOS IMPORTANTES

1. **Segurança**: Mantenha seu token do Baserow seguro
2. **CORS**: Configure corretamente para evitar bloqueios
3. **Hospedagem de Vídeos**: Use CDN para melhor performance
4. **Backups**: Faça backup regular do Baserow
5. **Atualizações**: Mantenha o código atualizado

---

## 🎬 BOM STREAMING!

Seu **PipocaFlix** está pronto para uso profissional! 🍿

Deploy, personalize e comece a streamar!

---

**Criado com ❤️ para desenvolvedores que querem qualidade Netflix**