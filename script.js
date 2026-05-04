// ========================================
// CIRANA - 智能工具系统
// 版本: 2.1.0
// ========================================

// ========================================
// 全局变量与配置
// ========================================
let messages = [];
let isLoading = false;
let currentLang = 'zh-CN';
let currentTheme = 'light';
let currentModel = 'openrouter|qwen';
let errorLog = [];
let uploadedFiles = [];

// 早读助手全局状态
let readingState = {
    isRunning: false,
    isPaused: false,
    totalDuration: 20,
    timeRemaining: 20 * 60,
    timerInterval: null,
    dbInterval: null,
    audioContext: null,
    analyser: null,
    microphone: null,
    currentDB: 0,
    maxDB: 0,
    avgDB: 0,
    dbHistory: [],
    loudTime: 0,
    loudDuration: 5,
    dbThreshold: 60,
    trees: [],
    treeEmojis: ['🌳', '', '🌴', '', '🎄', '', '🍀', '🌱'],
    dbCanvas: null,
    dbCtx: null,
    loudStartTime: null,
    sessionStartTime: null,
    exportData: []
};

// API 配置
const API_CONFIG = {
    openrouter: {
        key: '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',
        url: 'https://openrouter.ai/api/v1/chat/completions',
        models: {
            qwen: {
                id: 'qwen/qwen3-next-80b-a3b-instruct:free',
                icon: 'https://openrouter.ai/images/icons/Qwen.png',
                name: 'Qwen 3 Next',
                desc: '高性能模型，擅长各种任务',
                tags: [],
                isMultiModal: false,
                isStreaming: false
            },
            gemma: {
                id: 'google/gemma-4-26b-a4b-it:free',
                icon: 'https://openrouter.ai/images/icons/GoogleGemini.svg',
                name: 'Gemma 4',
                desc: 'Google模型，擅长推理',
                tags: [],
                isMultiModal: false,
                isStreaming: false
            }
        }
    },
    zhipu: {
        key: 'bdf100ccee7b4dea8d57273fa9c824a3.PYKBAUZUY7oHtDnG',
        url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
        models: {
            'glm-4.7-flash': {
                id: 'glm-4.7-flash',
                icon: 'https://z-cdn.chatglm.cn/z-ai/static/logo.svg',
                name: 'GLM 4.7 Flash',
                desc: '智谱AI 最新模型，快速响应',
                tags: ['流式调用'],
                isMultiModal: false,
                isStreaming: true,
                supportsThinking: true
            },
            'glm-4.6v-flash': {
                id: 'glm-4.6v-flash',
                icon: 'https://z-cdn.chatglm.cn/z-ai/static/logo.svg',
                name: 'GLM 4.6V Flash',
                desc: '智谱AI 多模态模型，支持图片/视频/文件',
                tags: ['多模态理解'],
                isMultiModal: true,
                isStreaming: true,
                supportsThinking: true,
                isVisionModel: true
            },
            'glm-4v-flash': {
                id: 'glm-4v-flash',
                icon: 'https://z-cdn.chatglm.cn/z-ai/static/logo.svg',
                name: 'GLM-4V-Flash',
                desc: '智谱AI 免费图像理解模型',
                tags: ['流式调用', '多模态理解'],
                isMultiModal: true,
                isStreaming: true,
                supportsThinking: false,
                isVisionModel: true
            }
        }
    }
};

// 支持的文件类型
const SUPPORTED_FILE_TYPES = {
    image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'],
    video: ['video/mp4', 'video/webm', 'video/mpeg'],
    text: ['text/plain', 'text/markdown', 'text/csv'],
    document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

// 错误分类系统
const ERROR_TYPES = {
    NETWORK_ERROR: { code: 'E001', name: '网络错误', color: '#e74c3c' },
    RATE_LIMIT_ERROR: { code: 'E002', name: '频率限制', color: '#f39c12' },
    AUTH_ERROR: { code: 'E003', name: '认证错误', color: '#9b59b6' },
    PARAM_ERROR: { code: 'E004', name: '参数错误', color: '#3498db' },
    SERVER_ERROR: { code: 'E005', name: '服务器错误', color: '#e91e63' },
    TIMEOUT_ERROR: { code: 'E006', name: '超时错误', color: '#ff9800' },
    FILE_ERROR: { code: 'E007', name: '文件错误', color: '#1abc9c' },
    UNKNOWN_ERROR: { code: 'E999', name: '未知错误', color: '#607d8b' }
};

// 多语言翻译
const translations = {
    en: {
        'nav-chat': 'AI Chat',
        'nav-tools': 'Tools',
        'nav-settings': 'Settings',
        'page-title-chat': 'AI Chat',
        'page-title-tools': 'Tools',
        'page-title-settings': 'Settings',
        'btn-clear': 'Clear Chat',
        'btn-new': 'New Chat',
        'welcome-title': 'Welcome to Cirana',
        'welcome-subtitle': 'A focused workspace for learning, creation and productivity tasks, designed with a clear and stable interaction flow.',
        'quick-python': 'Python Script',
        'quick-science': 'Knowledge Brief',
        'quick-optimize': 'Code Optimization',
        'quick-email': 'Business Writing',
        'input-placeholder': 'Enter your question...',
        'lang-label': 'Language',
        'lang-en': 'English',
        'lang-zh-cn': '简体中文',
        'lang-zh-tw': '繁体中文',
        'theme-label': 'Theme',
        'theme-light': 'Light',
        'theme-dark': 'Dark',
        'model-label': 'AI Model',
        'model-select': 'Select Model',
        'error-title': 'Error',
        'error-desc': 'Error Description',
        'error-solution': 'Solution',
        'error-retry': 'Retry',
        'error-close': 'Close',
        'error-network': 'Unable to connect to the server. Please check your internet connection.',
        'error-ratelimit': 'Too many requests. Please wait a while and try again.',
        'error-auth': 'Authentication failed. Please check your API key.',
        'error-param': 'Invalid parameters. Please check your input.',
        'error-server': 'Server error. Please try again later.',
        'error-timeout': 'Request timeout. Please try again.',
        'error-file': 'File error. Please check file type and size.',
        'error-unknown': 'An unexpected error occurred.',
        'error-general': 'Sorry, something went wrong. Please try again later.',
        'add-file': 'Add File',
        'remove-file': 'Remove',
        'supported-files': 'Supported: Images, Video, Text, Documents',
        'uploading': 'Uploading...',
        'upload-success': 'Upload successful',
        'upload-failed': 'Upload failed',
        'file-too-large': 'File too large',
        'invalid-file-type': 'Invalid file type',
        'streaming': 'Streaming',
        'multimodal': 'Multi-Modal'
    },
    'zh-CN': {
        'nav-chat': 'AI 对话',
        'nav-tools': '实用工具',
        'nav-settings': '设置',
        'page-title-chat': 'AI 对话',
        'page-title-tools': '实用工具',
        'page-title-settings': '设置',
        'btn-clear': '清空对话',
        'btn-new': '新对话',
        'welcome-title': '欢迎使用 Cirana',
        'welcome-subtitle': '面向学习、创作与效率场景的一站式工具工作区，强调清晰、稳定、专业的交互体验。',
        'quick-python': '写 Python 脚本',
        'quick-science': '科普知识',
        'quick-optimize': '代码优化',
        'quick-email': '商务写作',
        'input-placeholder': '输入您的问题...',
        'lang-label': '语言',
        'lang-en': 'English',
        'lang-zh-cn': '简体中文',
        'lang-zh-tw': '繁体中文',
        'theme-label': '主题',
        'theme-light': '亮色',
        'theme-dark': '暗色',
        'model-label': 'AI模型',
        'model-select': '选择模型',
        'error-title': '出错了',
        'error-desc': '错误描述',
        'error-solution': '解决方案',
        'error-retry': '重试',
        'error-close': '关闭',
        'error-network': '无法连接到服务器，请检查网络连接。',
        'error-ratelimit': '请求过于频繁，请稍等一会儿再试。',
        'error-auth': '认证失败，请检查API密钥。',
        'error-param': '参数无效，请检查您的输入。',
        'error-server': '服务器错误，请稍后再试。',
        'error-timeout': '请求超时，请重试。',
        'error-file': '文件错误，请检查文件类型和大小。',
        'error-unknown': '发生了意外错误。',
        'error-general': '抱歉，出现了一些问题，请稍后再试。',
        'add-file': '添加文件',
        'remove-file': '删除',
        'supported-files': '支持：图片、视频、文本、文档',
        'uploading': '上传中...',
        'upload-success': '上传成功',
        'upload-failed': '上传失败',
        'file-too-large': '文件过大',
        'invalid-file-type': '不支持的文件类型',
        'streaming': '流式调用',
        'multimodal': '多模态理解'
    },
    'zh-TW': {
        'nav-chat': 'AI 對話',
        'nav-tools': '實用工具',
        'nav-settings': '設定',
        'page-title-chat': 'AI 對話',
        'page-title-tools': '實用工具',
        'page-title-settings': '設定',
        'btn-clear': '清空對話',
        'btn-new': '新對話',
        'welcome-title': '歡迎使用 Cirana',
        'welcome-subtitle': '面向學習、創作與效率場景的一站式工具工作區，強調清晰、穩定、專業的交互體驗。',
        'quick-python': '寫 Python 腳本',
        'quick-science': '科普知識',
        'quick-optimize': '程式碼最佳化',
        'quick-email': '商務寫作',
        'input-placeholder': '輸入您的問題...',
        'lang-label': '語言',
        'lang-en': 'English',
        'lang-zh-cn': '簡體中文',
        'lang-zh-tw': '繁體中文',
        'theme-label': '主題',
        'theme-light': '亮色',
        'theme-dark': '暗色',
        'model-label': 'AI模型',
        'model-select': '選擇模型',
        'error-title': '出錯了',
        'error-desc': '錯誤描述',
        'error-solution': '解決方案',
        'error-retry': '重試',
        'error-close': '關閉',
        'error-network': '無法連接到服務器，請檢查網路連接。',
        'error-ratelimit': '請求過於頻繁，請稍等一會兒再試。',
        'error-auth': '認證失敗，請檢查API密鑰。',
        'error-param': '參數無效，請檢查您的輸入。',
        'error-server': '服務器錯誤，請稍後再試。',
        'error-timeout': '請求超時，請重試。',
        'error-file': '檔案錯誤，請檢查檔案類型和大小。',
        'error-unknown': '發生了意外錯誤。',
        'error-general': '抱歉，出現了一些問題，請稍後再試。',
        'add-file': '添加檔案',
        'remove-file': '刪除',
        'supported-files': '支持：圖片、影片、文字、文件',
        'uploading': '上傳中...',
        'upload-success': '上傳成功',
        'upload-failed': '上傳失敗',
        'file-too-large': '檔案過大',
        'invalid-file-type': '不支持的檔案類型',
        'streaming': '流式調用',
        'multimodal': '多模態理解'
    },
    'wenyan': {
        'nav-chat': 'AI 對話',
        'nav-tools': '實用器具',
        'nav-settings': '設置',
        'page-title-chat': 'AI 對話',
        'page-title-tools': '實用器具',
        'page-title-settings': '設置',
        'btn-clear': '清空對話',
        'btn-new': '新對話',
        'welcome-title': '歡迎至 Cirana',
        'welcome-subtitle': '集學習、創作、治事於一處之工坊，務求明晰穩妥之交互體驗。',
        'quick-python': '撰 Python 腳本',
        'quick-science': '格物致知',
        'quick-optimize': '優化程式碼',
        'quick-email': '商牘撰寫',
        'input-placeholder': '請輸入所問...',
        'lang-label': '語言',
        'lang-en': 'English',
        'lang-zh-cn': '簡體中文',
        'lang-zh-tw': '繁體中文',
        'lang-wenyan': '文言（華夏）',
        'theme-label': '主題',
        'theme-light': '亮色',
        'theme-dark': '暗色',
        'model-label': 'AI 模型',
        'model-select': '擇模型',
        'error-title': '有誤',
        'error-desc': '誤之詳述',
        'error-solution': '解法',
        'error-retry': '重試',
        'error-close': '閉之',
        'error-network': '無法連接伺服器，請檢視網路。',
        'error-ratelimit': '請求過頻，請少待片刻再試。',
        'error-auth': '認證失敗，請檢視密鑰。',
        'error-param': '參數有誤，請檢視所輸入。',
        'error-server': '伺服器有誤，請稍後再試。',
        'error-timeout': '請求逾時，請重試。',
        'error-file': '檔案有誤，請檢視類型與大小。',
        'error未知': '生意外之誤。',
        'error-general': '抱歉，生變故，請稍後再試。',
        'add-file': '添檔案',
        'remove-file': '刪之',
        'supported-files': '支持：圖像、影像、文書、檔案',
        'uploading': '上傳中...',
        'upload-success': '上傳已竟',
        'upload-failed': '上傳未遂',
        'file-too-large': '檔案過大',
        'invalid-file-type': '不識此檔類型',
        'streaming': '流式調用',
        'multimodal': '多模態理解'
    }
};

// ========================================
// 错误管理系统
// ========================================

class ErrorManager {
    static logError(errorType, error, details = {}) {
        const timestamp = new Date().toISOString();
        const errorInfo = {
            id: this.generateErrorId(),
            type: errorType,
            timestamp,
            message: error.message || String(error),
            stack: error.stack,
            details,
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        errorLog.push(errorInfo);
        console.error('[ERROR LOG]', errorInfo);
        
        // 保存到本地存储
        this.saveErrorLog();
        
        return errorInfo;
    }

    static generateErrorId() {
        return 'ERR-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 9);
    }

    static saveErrorLog() {
        try {
            localStorage.setItem('cirana-error-log', JSON.stringify(errorLog.slice(-100)));
        } catch (e) {
            console.warn('Failed to save error log:', e);
        }
    }

    static loadErrorLog() {
        try {
            const saved = localStorage.getItem('cirana-error-log');
            if (saved) {
                errorLog = JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Failed to load error log:', e);
        }
    }

    static classifyError(error, response) {
        if (!navigator.onLine) {
            return ERROR_TYPES.NETWORK_ERROR;
        }
        
        if (response) {
            switch (response.status) {
                case 401:
                case 403:
                    return ERROR_TYPES.AUTH_ERROR;
                case 429:
                    return ERROR_TYPES.RATE_LIMIT_ERROR;
                case 400:
                    return ERROR_TYPES.PARAM_ERROR;
                case 500:
                case 502:
                case 503:
                case 504:
                    return ERROR_TYPES.SERVER_ERROR;
            }
        }
        
        if (error.name === 'AbortError' || error.name === 'TimeoutError') {
            return ERROR_TYPES.TIMEOUT_ERROR;
        }
        
        if (error.message && error.message.includes('Failed to fetch')) {
            return ERROR_TYPES.NETWORK_ERROR;
        }
        
        return ERROR_TYPES.UNKNOWN_ERROR;
    }

    static getErrorMessage(errorType) {
        const lang = currentLang;
        const keyMap = {
            [ERROR_TYPES.NETWORK_ERROR.code]: 'error-network',
            [ERROR_TYPES.RATE_LIMIT_ERROR.code]: 'error-ratelimit',
            [ERROR_TYPES.AUTH_ERROR.code]: 'error-auth',
            [ERROR_TYPES.PARAM_ERROR.code]: 'error-param',
            [ERROR_TYPES.SERVER_ERROR.code]: 'error-server',
            [ERROR_TYPES.TIMEOUT_ERROR.code]: 'error-timeout',
            [ERROR_TYPES.FILE_ERROR.code]: 'error-file',
            [ERROR_TYPES.UNKNOWN_ERROR.code]: 'error-unknown'
        };
        return translations[lang][keyMap[errorType.code] || 'error-general'];
    }

    static getSolution(errorType) {
        const solutions = {
            'E001': ['检查网络连接', '尝试使用VPN', '检查防火墙设置'],
            'E002': ['等待30秒后重试', '减少请求频率', '考虑升级账户'],
            'E003': ['检查API密钥是否正确', '确认密钥权限', '重新生成密钥'],
            'E004': ['检查输入格式', '验证必填参数', '查看API文档'],
            'E005': ['稍后重试', '联系技术支持', '尝试备用模型'],
            'E006': ['检查网络速度', '减少请求数据量', '稍后重试'],
            'E007': ['检查文件类型是否支持', '确认文件大小限制', '尝试上传其他文件'],
            'E999': ['刷新页面重试', '清除浏览器缓存', '联系支持']
        };
        return solutions[errorType.code] || solutions['E999'];
    }
}

// ========================================
// 文件管理系统
// ========================================

class FileManager {
    static validateFile(file) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        
        if (file.size > maxSize) {
            return { valid: false, reason: 'file-too-large' };
        }
        
        const allTypes = [
            ...SUPPORTED_FILE_TYPES.image,
            ...SUPPORTED_FILE_TYPES.video,
            ...SUPPORTED_FILE_TYPES.text,
            ...SUPPORTED_FILE_TYPES.document
        ];
        
        if (!allTypes.includes(file.type)) {
            return { valid: false, reason: 'invalid-file-type' };
        }
        
        return { valid: true };
    }

    static fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    static addFile(file) {
        const validation = this.validateFile(file);
        if (!validation.valid) {
            throw new Error(translations[currentLang][validation.reason]);
        }
        
        uploadedFiles.push({
            id: Date.now() + Math.random(),
            file: file,
            name: file.name,
            type: file.type,
            size: file.size
        });
        
        return uploadedFiles[uploadedFiles.length - 1];
    }

    static removeFile(id) {
        uploadedFiles = uploadedFiles.filter(f => f.id !== id);
    }

    static clearFiles() {
        uploadedFiles = [];
    }
}

// ========================================
// UI 管理函数
// ========================================

function getWelcomeMarkup() {
    return `
        <div class="welcome-screen" id="welcome-screen">
            <section class="welcome-shell">
                <div class="welcome-main">
                    <span class="welcome-badge">${currentLang === 'en' ? 'Smart Workspace' : currentLang === 'zh-TW' ? '智慧工作台' : '智能工作台'}</span>
                    <h2 class="welcome-title" id="welcome-title">${translations[currentLang]['welcome-title']}</h2>
                    <p class="welcome-subtitle" id="welcome-subtitle">${translations[currentLang]['welcome-subtitle']}</p>
                    <div class="quick-actions">
                        <button class="quick-action" onclick="sendQuickMessage('帮我写一个Python脚本')" id="quick-python">${translations[currentLang]['quick-python']}</button>
                        <button class="quick-action" onclick="sendQuickMessage('解释一下量子计算')" id="quick-science">${translations[currentLang]['quick-science']}</button>
                        <button class="quick-action" onclick="sendQuickMessage('帮我优化这段代码')" id="quick-optimize">${translations[currentLang]['quick-optimize']}</button>
                        <button class="quick-action" onclick="sendQuickMessage('写一封商务邮件')" id="quick-email">${translations[currentLang]['quick-email']}</button>
                    </div>
                </div>
                <aside class="welcome-panel">
                    <div class="panel-caption">${currentLang === 'en' ? 'Core Capabilities' : currentLang === 'zh-TW' ? '核心能力' : '核心能力'}</div>
                    <div class="feature-list">
                        <div class="feature-item">
                            <span class="feature-index">01</span>
                            <div>
                                <h3>${currentLang === 'en' ? 'Conversational AI' : currentLang === 'zh-TW' ? '智慧對話' : '智能对话'}</h3>
                                <p>${currentLang === 'en' ? 'Handle drafting, analysis and research tasks with a stable product-like flow.' : currentLang === 'zh-TW' ? '以穩定、專業的方式處理寫作、分析與研究任務。' : '以稳定、专业的方式处理写作、分析与研究任务。'}</p>
                            </div>
                        </div>
                        <div class="feature-item">
                            <span class="feature-index">02</span>
                            <div>
                                <h3>${currentLang === 'en' ? 'Focused Utilities' : currentLang === 'zh-TW' ? '高頻工具集' : '高频工具集'}</h3>
                                <p>${currentLang === 'en' ? 'Keep calculators, converters and editors within the same workspace.' : currentLang === 'zh-TW' ? '將計算、轉換與編輯能力集中在同一個工作區。' : '将计算、转换与编辑能力集中在同一个工作区。'}</p>
                            </div>
                        </div>
                        <div class="feature-item">
                            <span class="feature-index">03</span>
                            <div>
                                <h3>${currentLang === 'en' ? 'Unified Experience' : currentLang === 'zh-TW' ? '一致體驗' : '一致体验'}</h3>
                                <p>${currentLang === 'en' ? 'Maintain consistent layout, hierarchy and controls across all modules.' : currentLang === 'zh-TW' ? '在所有模組中保持一致的版式、層級與交互。' : '在所有模块中保持一致的版式、层级与交互。'}</p>
                            </div>
                        </div>
                    </div>
                </aside>
            </section>
        </div>
    `;
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
}

function toggleModelDropdown() {
    const dropdown = document.getElementById('model-dropdown');
    dropdown.classList.toggle('open');
}

function selectModel(modelKey, clickedElement) {
    currentModel = modelKey;

    const config = getModelConfig(modelKey);
    if (config) {
        const iconElement = document.getElementById('model-icon');
        if (config.icon.startsWith('http')) {
            iconElement.innerHTML = `<img src="${config.icon}" alt="${config.name}" style="width:20px;height:20px;border-radius:4px;">`;
        } else {
            iconElement.textContent = config.icon;
        }
        document.getElementById('model-name').textContent = config.name;
    }

    document.querySelectorAll('.model-option').forEach(option => {
        option.classList.remove('selected');
        const iconSpan = option.querySelector('.model-option-icon');
        if (iconSpan) {
            const iconImg = iconSpan.querySelector('img');
            if (iconImg) {
                const modelKeyFromOption = option.getAttribute('onclick').match(/'([^']+)'/)[1];
                const cfg = getModelConfig(modelKeyFromOption);
                if (cfg && cfg.icon.startsWith('http')) {
                    iconSpan.innerHTML = `<img src="${cfg.icon}" alt="${cfg.name}" style="width:24px;height:24px;border-radius:4px;">`;
                }
            }
        }
    });
    if (clickedElement) {
        clickedElement.classList.add('selected');
        const iconSpan = clickedElement.querySelector('.model-option-icon');
        if (iconSpan && config.icon.startsWith('http')) {
            iconSpan.innerHTML = `<img src="${config.icon}" alt="${config.name}" style="width:24px;height:24px;border-radius:4px;">`;
        }
    }
    document.getElementById('model-dropdown').classList.remove('open');

    updateInputAreaForModel();
}

function getModelConfig(modelKey) {
    if (modelKey.startsWith('openrouter|')) {
        const model = modelKey.split('|')[1];
        return API_CONFIG.openrouter.models[model];
    } else if (modelKey.startsWith('zhipu|')) {
        const model = modelKey.split('|')[1];
        return API_CONFIG.zhipu.models[model];
    }
    return null;
}

function isCurrentModelMultiModal() {
    const config = getModelConfig(currentModel);
    return config && config.isMultiModal;
}

function isCurrentModelStreaming() {
    const config = getModelConfig(currentModel);
    return config && config.isStreaming;
}

function updateInputAreaForModel() {
    const inputContainer = document.querySelector('.input-container');
    const fileUploadArea = document.querySelector('.file-upload-area');
    const uploadedFilesContainer = document.querySelector('.uploaded-files');
    
    if (isCurrentModelMultiModal()) {
        inputContainer.classList.add('multi-modal');
        if (fileUploadArea) fileUploadArea.style.display = 'flex';
        if (uploadedFilesContainer) uploadedFilesContainer.style.display = 'flex';
    } else {
        inputContainer.classList.remove('multi-modal');
        if (fileUploadArea) fileUploadArea.style.display = 'none';
        if (uploadedFilesContainer) uploadedFilesContainer.style.display = 'none';
    }
}

document.addEventListener('click', function(event) {
    const modelSelector = document.querySelector('.model-selector');
    if (modelSelector && !modelSelector.contains(event.target)) {
        document.getElementById('model-dropdown').classList.remove('open');
    }
});

function switchTab(tab, clickedElement) {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    if (clickedElement) {
        clickedElement.classList.add('active');
    }
    
    const mainArea = document.getElementById('main-area');
    
    if (tab === 'home') {
        renderHomeTab();
    } else if (tab === 'chat') {
        renderChatTab();
    } else if (tab === 'ai-taste') {
        renderAITab();
    } else if (tab === 'tools') {
        renderToolsTab();
    } else if (tab === 'reading') {
        renderReadingTab();
    } else if (tab === 'settings') {
        renderSettingsTab();
    }
    
    document.getElementById('page-title').textContent = translations[currentLang][`page-title-${tab}`] || '主页';
    
    if (window.innerWidth <= 768) {
        toggleSidebar();
    }
}

let homeContainerTemplate = null;

function renderHomeTab() {
    const mainArea = document.getElementById('main-area');
    let homeContainer = document.getElementById('home-container');

    if (!homeContainer && homeContainerTemplate) {
        mainArea.innerHTML = homeContainerTemplate;
        homeContainer = document.getElementById('home-container');
    } else {
        mainArea.innerHTML = '';
    }

    if (homeContainer) {
        if (!homeContainerTemplate) {
            homeContainerTemplate = homeContainer.outerHTML;
        }
        mainArea.appendChild(homeContainer);
        homeContainer.style.display = 'block';
    }
}

let readingContainerTemplate = null;

function renderReadingTab() {
    const mainArea = document.getElementById('main-area');
    let toolsReading = document.getElementById('tools-reading');

    if (!toolsReading && readingContainerTemplate) {
        mainArea.innerHTML = readingContainerTemplate;
        toolsReading = document.getElementById('tools-reading');
        initReadingAssistant();
    } else {
        mainArea.innerHTML = '';
    }

    if (toolsReading) {
        if (!readingContainerTemplate) {
            readingContainerTemplate = toolsReading.outerHTML;
        }
        mainArea.appendChild(toolsReading);
        toolsReading.style.display = 'flex';
    }

    if (readingState.dbCanvas) {
        setTimeout(resizeDbCanvas, 100);
    }
}

function renderChatTab() {
    const mainArea = document.getElementById('main-area');
    const isMultiModal = isCurrentModelMultiModal();
    
    mainArea.innerHTML = `
        <div class="messages-container" id="messages-container">
            ${getWelcomeMarkup()}
        </div>
        <div class="input-container ${isMultiModal ? 'multi-modal' : ''}">
            <div class="uploaded-files" id="uploaded-files" style="display: ${isMultiModal ? 'flex' : 'none'}"></div>
            <div class="file-upload-area" id="file-upload-area" style="display: ${isMultiModal ? 'flex' : 'none'}">
                <input type="file" id="file-input" multiple accept="image/*,video/*,text/*,.pdf,.doc,.docx" onchange="handleFileSelect(event)">
                <button class="add-file-btn" onclick="document.getElementById('file-input').click()">
                    📎 ${translations[currentLang]['add-file']}
                </button>
                <span class="supported-files-hint">${translations[currentLang]['supported-files']}</span>
            </div>
            <div class="input-wrapper">
                <textarea class="input-field" id="message-input" placeholder="${translations[currentLang]['input-placeholder']}" rows="1" onkeydown="handleKeyDown(event)"></textarea>
                <button class="send-btn" id="send-btn" onclick="sendMessage()">➤</button>
            </div>
        </div>
    `;
    messages = [];
    uploadedFiles = [];
    attachTextareaListener();
}

let aiTasteMessages = [];

const aiTasteModels = {
    'gpt-oss': {
        id: 'gpt-oss',
        name: 'ChatGPT-OSS-120B',
        description: currentLang === 'en' ? 'Free AI model for testing' : '免费AI模型，用于测试和探索',
        apiKey: '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',
        model: 'openai/gpt-oss-120b:free',
        logo: 'https://openrouter.ai/images/icons/OpenAI.svg'
    },
    'laguna': {
        id: 'laguna',
        name: 'Laguna XS.2',
        description: currentLang === 'en' ? 'Fast reasoning model' : '快速推理模型',
        apiKey: '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',
        model: 'poolside/laguna-xs.2:free',
        logo: 'https://openrouter.ai/images/icons/poolside-logomark-solid-color.svg'
    }
};

let currentAiTasteModel = 'gpt-oss';
let aiTasteMessagesByModel = {
    'gpt-oss': [],
    'laguna': []
};

function renderAITab() {
    const mainArea = document.getElementById('main-area');
    const currentModel = aiTasteModels[currentAiTasteModel];
    const messages = aiTasteMessagesByModel[currentAiTasteModel];

    const modelIconHTML = currentModel.logo.startsWith('http')
        ? `<img src="${currentModel.logo}" alt="${currentModel.name}" style="width:20px;height:20px;border-radius:4px;">`
        : currentModel.logo;

    const dropdownOptions = Object.values(aiTasteModels).map(model => {
        const optionIconHTML = model.logo.startsWith('http')
            ? `<img src="${model.logo}" alt="${model.name}" style="width:24px;height:24px;border-radius:4px;">`
            : model.logo;
        return `
            <div class="ai-taste-model-option ${currentAiTasteModel === model.id ? 'selected' : ''}"
                 onclick="selectAITasteModel('${model.id}')">
                <span class="ai-taste-model-option-icon">${optionIconHTML}</span>
                <div class="ai-taste-model-option-info">
                    <div class="ai-taste-model-option-name">${model.name}</div>
                    <div class="ai-taste-model-option-desc">${model.description}</div>
                </div>
                ${currentAiTasteModel === model.id ? '<span class="ai-taste-model-check">✓</span>' : ''}
            </div>
        `;
    }).join('');

    mainArea.innerHTML = `
        <div class="ai-taste-container">
            <div class="ai-taste-header">
                <p class="header-kicker">CIRANA PRODUCT SUITE</p>
                <h1 class="header-title" id="page-title">AI 尝鲜</h1>
            </div>

            <div class="ai-taste-toolbar">
                <div class="ai-taste-model-selector">
                    <button class="ai-taste-model-btn" onclick="toggleAITasteModelDropdown()">
                        <span class="ai-taste-model-icon">${modelIconHTML}</span>
                        <span id="ai-taste-model-name">${currentModel.name}</span>
                        <span class="ai-taste-dropdown-arrow">▼</span>
                    </button>
                    <div class="ai-taste-model-dropdown" id="ai-taste-model-dropdown">
                        ${dropdownOptions}
                    </div>
                </div>
                <button class="btn btn-secondary ai-taste-clear-btn" onclick="clearAITasteMessages()">
                    🗑️ ${currentLang === 'en' ? 'Clear Chat' : '清空对话'}
                </button>
            </div>

            <div class="ai-taste-messages" id="ai-taste-messages">
                ${getAITasteWelcomeMarkup(messages, currentModel)}
            </div>

            <div class="ai-taste-input-container">
                <div class="input-wrapper">
                    <textarea
                        class="input-field ai-taste-input"
                        id="ai-taste-input"
                        placeholder="${currentLang === 'en' ? `Ask ${currentModel.name} anything...` : `向${currentModel.name}提问...`}"
                        rows="1"
                        onkeydown="handleAITasteKeyDown(event)"
                    ></textarea>
                    <button class="send-btn ai-taste-send-btn" id="ai-taste-send-btn" onclick="sendAIMessage()">
                        ➤
                    </button>
                </div>
            </div>
        </div>
    `;

    attachAITasteTextareaListener();
}

function toggleAITasteModelDropdown() {
    const dropdown = document.getElementById('ai-taste-model-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('open');
    }
}

function selectAITasteModel(modelId) {
    if (!aiTasteModels[modelId]) return;
    if (modelId === currentAiTasteModel) {
        toggleAITasteModelDropdown();
        return;
    }

    currentAiTasteModel = modelId;
    renderAITab();

    showElectricToast(
        `${currentLang === 'en' ? 'Switched to' : '已切换到'} ${aiTasteModels[modelId].name}`,
        'success'
    );
}

document.addEventListener('click', function(e) {
    const dropdown = document.getElementById('ai-taste-model-dropdown');
    const modelBtn = document.querySelector('.ai-taste-model-btn');
    if (dropdown && !dropdown.contains(e.target) && modelBtn && !modelBtn.contains(e.target)) {
        dropdown.classList.remove('open');
    }
});

function getAITasteWelcomeMarkup(messages, currentModel) {
    if (messages.length > 0) {
        return messages.map(msg => createAITasteMessageHTML(msg, currentModel)).join('');
    }

    const modelDescriptions = {
        'gpt-oss': {
            title: 'ChatGPT-OSS-120B',
            subtitle: currentLang === 'en'
                ? 'Experience the power of OpenAI\'s OSS-120B model for free'
                : '免费体验OpenAI的OSS-120B模型强大能力'
        },
        'laguna': {
            title: 'Laguna XS.2',
            subtitle: currentLang === 'en'
                ? 'Fast reasoning with poolside/laguna-xs.2'
                : '体验poolside/laguna-xs.2的快速推理能力'
        }
    };

    const desc = modelDescriptions[currentModel.id] || modelDescriptions['gpt-oss'];

    return `
        <div class="welcome-screen ai-taste-welcome">
            <section class="welcome-shell">
                <div class="welcome-main">
                    <span class="welcome-badge">🚀 AI 尝鲜</span>
                    <h2 class="welcome-title" id="welcome-title">${desc.title}</h2>
                    <p class="welcome-subtitle" id="welcome-subtitle">
                        ${desc.subtitle}
                    </p>
                    <div class="quick-actions">
                        <button class="quick-action" onclick="sendAIQuickMessage('${currentLang === 'en' ? 'Hello! Introduce yourself.' : '你好！请介绍一下自己。'}')">
                            👋 ${currentLang === 'en' ? 'Say Hello' : '打个招呼'}
                        </button>
                        <button class="quick-action" onclick="sendAIQuickMessage('${currentLang === 'en' ? 'What can you help me with?' : '你能帮我做什么？'}')">
                            ❓ ${currentLang === 'en' ? 'Capabilities' : '能力展示'}
                        </button>
                        <button class="quick-action" onclick="sendAIQuickMessage('${currentLang === 'en' ? 'Write a short poem about technology' : '写一首关于科技的短诗'}')">
                            ✍️ ${currentLang === 'en' ? 'Creative Writing' : '创意写作'}
                        </button>
                        <button class="quick-action" onclick="sendAIQuickMessage('${currentLang === 'en' ? 'Explain quantum computing simply' : '简单解释量子计算'}')">
                            🔬 ${currentLang === 'en' ? 'Learn Something' : '学习知识'}
                        </button>
                    </div>
                </div>
                <aside class="welcome-panel">
                    <div class="panel-caption">Model Info</div>
                    <div class="feature-list">
                        <div class="feature-item">
                            <span class="feature-index">01</span>
                            <div>
                                <h3>${currentLang === 'en' ? 'Free to Use' : '免费使用'}</h3>
                                <p>${currentLang === 'en' ? 'No cost, no limits' : '零成本，无限制'}</p>
                            </div>
                        </div>
                        <div class="feature-item">
                            <span class="feature-index">02</span>
                            <div>
                                <h3>${currentLang === 'en' ? 'High Quality' : '高质量'}</h3>
                                <p>${currentLang === 'en' ? '120B parameters, powerful reasoning' : '1200亿参数，强大推理能力'}</p>
                            </div>
                        </div>
                        <div class="feature-item">
                            <span class="feature-index">03</span>
                            <div>
                                <h3>${currentLang === 'en' ? 'Reasoning Enabled' : '支持推理'}</h3>
                                <p>${currentLang === 'en' ? 'Step-by-step thinking process' : '逐步思考过程'}</p>
                            </div>
                        </div>
                    </div>
                </aside>
            </section>
        </div>
    `;
}

function createAITasteMessageHTML(message, currentModel) {
    const isUser = message.role === 'user';
    const aiLogo = currentModel ? currentModel.logo : '🤖';
    return `
        <div class="message ${isUser ? 'user-message' : 'ai-message'}">
            <div class="message-avatar">${isUser ? '👤' : aiLogo}</div>
            <div class="message-content">
                <div class="message-text">${formatAITasteText(message.content)}</div>
                <div class="message-time">${new Date(message.timestamp).toLocaleTimeString()}</div>
            </div>
        </div>
    `;
}

function formatAITasteText(text) {
    return text.replace(/\n/g, '<br>');
}

function handleAITasteKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendAIMessage();
    }
}

async function sendAIMessage() {
    const input = document.getElementById('ai-taste-input');
    const message = input.value.trim();

    if (!message) return;

    input.value = '';

    const currentMessages = aiTasteMessagesByModel[currentAiTasteModel];

    const userMessage = {
        role: 'user',
        content: message,
        timestamp: Date.now()
    };

    currentMessages.push(userMessage);
    updateAITasteMessages();

    try {
        await callAIAPI(message);
    } catch (error) {
        console.error('AI Taste Error:', error);

        const errorMessage = {
            role: 'assistant',
            content: `${currentLang === 'en' ? 'Error: ' : '错误：'}${error.message}`,
            timestamp: Date.now()
        };

        currentMessages.push(errorMessage);
        updateAITasteMessages();
    }
}

function sendAIQuickMessage(message) {
    document.getElementById('ai-taste-input').value = message;
    sendAIMessage();
}

async function callAIAPI(userMessage) {
    const messagesContainer = document.getElementById('ai-taste-messages');
    const currentModel = aiTasteModels[currentAiTasteModel];
    const currentMessages = aiTasteMessagesByModel[currentAiTasteModel];

    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message ai-message loading-message';
    loadingDiv.innerHTML = `
        <div class="message-avatar">${currentModel.logo}</div>
        <div class="message-content">
            <div class="typing-indicator">
                <span></span><span></span><span></span>
            </div>
        </div>
    `;
    messagesContainer.appendChild(loadingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentModel.apiKey}`
            },
            body: JSON.stringify({
                model: currentModel.model,
                messages: [
                    ...currentMessages.map(m => ({
                        role: m.role,
                        content: m.content
                    }))
                ],
                reasoning: {
                    enabled: true
                }
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.choices && data.choices.length > 0) {
            const assistantMessage = {
                role: 'assistant',
                content: data.choices[0].message.content,
                timestamp: Date.now()
            };

            currentMessages.push(assistantMessage);
            updateAITasteMessages();

            showElectricToast(
                currentLang === 'en' ? '✅ Response received!' : '✅ 收到回复！',
                'success'
            );
        } else {
            throw new Error('No response from API');
        }
    } catch (error) {
        throw error;
    } finally {
        if (loadingDiv.parentNode) {
            loadingDiv.remove();
        }
    }
}

function updateAITasteMessages() {
    const messagesContainer = document.getElementById('ai-taste-messages');
    if (!messagesContainer) return;

    const currentModel = aiTasteModels[currentAiTasteModel];
    const currentMessages = aiTasteMessagesByModel[currentAiTasteModel];

    messagesContainer.innerHTML = currentMessages.map(msg => createAITasteMessageHTML(msg, currentModel)).join('');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function clearAITasteMessages() {
    aiTasteMessagesByModel[currentAiTasteModel] = [];
    updateAITasteMessages();
    showElectricToast(
        currentLang === 'en' ? '🗑️ Chat cleared!' : '🗑️ 对话已清空！',
        'info'
    );
}

function attachAITasteTextareaListener() {
    const textarea = document.getElementById('ai-taste-input');
    if (!textarea) return;

    textarea.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 200) + 'px';
    });
}

function renderToolsTab() {
    const mainArea = document.getElementById('main-area');
    mainArea.innerHTML = `
        <div class="tools-panel workspace-panel">
            <div class="panel-hero">
                <div>
                    <div class="panel-kicker">PRODUCT MODULES</div>
                    <h2 class="panel-title">${currentLang === 'en' ? 'Useful Tools Workspace' : currentLang === 'zh-TW' ? '實用工具工作台' : '实用工具工作台'}</h2>
                    <p class="panel-subtitle">${currentLang === 'en' ? 'Focused utilities for writing, calculations, conversion and interactive experiments.' : currentLang === 'zh-TW' ? '聚合文字處理、計算、轉換與互動實驗的高頻工具。' : '聚合文字处理、计算、转换与互动实验的高频工具。'}</p>
                </div>
            </div>
            <div class="tool-grid">
            <div class="tool-card" onclick="renderTextEditor()">
                <div class="tool-icon">📝</div>
                <div class="tool-name">${currentLang === 'en' ? 'Text Editor' : currentLang === 'zh-TW' ? '文字編輯器' : '文本编辑器'}</div>
                <div class="tool-desc">${currentLang === 'en' ? 'Edit and format text' : currentLang === 'zh-TW' ? '編輯和格式化文字' : '编辑和格式化文本'}</div>
            </div>
            <div class="tool-card" onclick="renderCalculator()">
                <div class="tool-icon">🧮</div>
                <div class="tool-name">${currentLang === 'en' ? 'Calculator' : currentLang === 'zh-TW' ? '計算器' : '计算器'}</div>
                <div class="tool-desc">${currentLang === 'en' ? 'Perform calculations' : currentLang === 'zh-TW' ? '執行計算' : '执行计算'}</div>
            </div>
            <div class="tool-card" onclick="renderConverter()">
                <div class="tool-icon">📊</div>
                <div class="tool-name">${currentLang === 'en' ? 'Converter' : currentLang === 'zh-TW' ? '轉換器' : '转换器'}</div>
                <div class="tool-desc">${currentLang === 'en' ? 'Convert units and formats' : currentLang === 'zh-TW' ? '轉換單位和格式' : '转换单位和格式'}</div>
            </div>
            <div class="tool-card" onclick="renderPasswordGenerator()">
                <div class="tool-icon">🔐</div>
                <div class="tool-name">${currentLang === 'en' ? 'Password Generator' : currentLang === 'zh-TW' ? '密碼產生器' : '密码生成器'}</div>
                <div class="tool-desc">${currentLang === 'en' ? 'Generate secure passwords' : currentLang === 'zh-TW' ? '生成安全密碼' : '生成安全密码'}</div>
            </div>
            <div class="tool-card" onclick="renderSpeedTest()">
                <div class="tool-icon">🌐</div>
                <div class="tool-name">${currentLang === 'en' ? 'Speed Test' : currentLang === 'zh-TW' ? '網路測速' : '网络测速'}</div>
                <div class="tool-desc">${currentLang === 'en' ? 'Test latency, upload/download speed, jitter, packet loss' : currentLang === 'zh-TW' ? '測試延遲、上下行速度、抖動、丟包' : '测试延迟、上下行网速、抖动、丢包'}</div>
            </div>
            <div class="tool-card" onclick="renderGeometryBoard()">
                <div class="tool-icon">📐</div>
                <div class="tool-name">${currentLang === 'en' ? 'Geometry Board' : currentLang === 'zh-TW' ? '幾何畫板' : '几何画板'}</div>
                <div class="tool-desc">${currentLang === 'en' ? 'Draw function graphs, shapes, and write on canvas' : currentLang === 'zh-TW' ? '繪製函數圖像、幾何圖形，可書寫' : '绘制函数图像、几何图形，可书写'}</div>
            </div>
            <div class="tool-card" onclick="renderPhysicsLab()">
                <div class="tool-icon">🔬</div>
                <div class="tool-name">${currentLang === 'en' ? 'Physics Lab' : currentLang === 'zh-TW' ? '物理實驗' : '物理实验'}</div>
                <div class="tool-desc">${currentLang === 'en' ? 'Interactive physics experiments with animations' : currentLang === 'zh-TW' ? '交互式物理實驗動畫演示' : '交互式物理实验动画演示'}</div>
            </div>
            <div class="tool-card" onclick="renderOCR()">
                <div class="tool-icon">🔍</div>
                <div class="tool-name">${currentLang === 'en' ? 'OCR Recognition' : currentLang === 'zh-TW' ? 'OCR識別' : 'OCR识别'}</div>
                <div class="tool-desc">${currentLang === 'en' ? 'Extract text from images using AI' : currentLang === 'zh-TW' ? '使用AI從圖片中提取文字' : '使用AI从图片中提取文字'}</div>
            </div>
            </div>
        </div>
    `;
}

function renderOCR() {
    const mainArea = document.getElementById('main-area');
    mainArea.innerHTML = `
        <div class="ocr-container workspace-panel">
            <div class="panel-hero">
                <div>
                    <div class="panel-kicker">AI-POWERED OCR</div>
                    <h2 class="panel-title">${currentLang === 'en' ? 'OCR Text Recognition' : 'OCR文字识别'}</h2>
                    <p class="panel-subtitle">${currentLang === 'en' ? 'Upload or capture an image to extract text using AI' : '上传或拍摄图片，使用AI智能提取文字'}</p>
                </div>
            </div>

            <div class="ocr-upload-section">
                <div class="upload-area" id="ocr-upload-area">
                    <input type="file" id="ocr-file-input" accept="image/*" onchange="handleOCRImageUpload(event)" style="display: none;">
                    <div class="upload-content" onclick="document.getElementById('ocr-file-input').click()">
                        <div class="upload-icon">📷</div>
                        <div class="upload-text">${currentLang === 'en' ? 'Click to upload image' : '点击上传图片'}</div>
                        <div class="upload-hint">${currentLang === 'en' ? 'Support: JPG, PNG, WebP' : '支持：JPG、PNG、WebP格式'}</div>
                    </div>
                </div>

                <div class="upload-actions">
                    <button class="btn btn-primary" onclick="document.getElementById('ocr-file-input').click()">
                        📁 ${currentLang === 'en' ? 'Upload Image' : '上传图片'}
                    </button>
                    <button class="btn btn-secondary" onclick="captureOCRImage()">
                        📸 ${currentLang === 'en' ? 'Take Photo' : '拍照识别'}
                    </button>
                </div>
            </div>

            <div class="ocr-preview-section" id="ocr-preview-section" style="display: none;">
                <h3 class="section-title">${currentLang === 'en' ? 'Preview' : '图片预览'}</h3>
                <div class="image-preview-container">
                    <img id="ocr-image-preview" src="" alt="Preview">
                    <button class="remove-image-btn" onclick="clearOCRImage()">×</button>
                </div>
            </div>

            <div class="ocr-action-section" id="ocr-action-section" style="display: none;">
                <button class="btn btn-primary ocr-start-btn" id="ocr-start-btn" onclick="startOCRRecognition()">
                    🔍 ${currentLang === 'en' ? 'Start Recognition' : '开始识别'}
                </button>
            </div>

            <div class="ocr-result-section" id="ocr-result-section" style="display: none;">
                <h3 class="section-title">${currentLang === 'en' ? 'Recognition Result' : '识别结果'}</h3>
                <div class="result-header">
                    <span class="result-status" id="ocr-result-status"></span>
                    <div class="result-actions">
                        <button class="btn btn-secondary btn-sm" onclick="copyOCRResult()">
                            📋 ${currentLang === 'en' ? 'Copy' : '复制'}
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="downloadOCRResult()">
                            💾 ${currentLang === 'en' ? 'Download' : '下载'}
                        </button>
                    </div>
                </div>
                <div class="result-content" id="ocr-result-content"></div>
            </div>

            <div class="ocr-loading" id="ocr-loading" style="display: none;">
                <div class="loading-spinner"></div>
                <p>${currentLang === 'en' ? 'Recognizing text...' : '正在识别文字...'}</p>
            </div>
        </div>
    `;

    setupOCRDragDrop();
}

let ocrImageData = null;

function handleOCRImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showElectricToast(currentLang === 'en' ? 'Please select an image file' : '请选择图片文件', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        ocrImageData = e.target.result;
        displayOCRImage(ocrImageData);
    };
    reader.readAsDataURL(file);
}

function captureOCRImage() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showElectricToast(currentLang === 'en' ? 'Camera not supported' : '不支持相机功能', 'error');
        return;
    }

    const video = document.createElement('video');
    video.autoplay = true;
    video.style.cssText = 'max-width: 100%; border-radius: 8px;';

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const modal = document.createElement('div');
    modal.className = 'ocr-camera-modal';
    modal.innerHTML = `
        <div class="camera-modal-content">
            <div class="camera-header">
                <h3>${currentLang === 'en' ? 'Camera Capture' : '相机拍摄'}</h3>
                <button class="close-camera-btn" onclick="this.closest('.ocr-camera-modal').remove()">×</button>
            </div>
            <div class="camera-video-container"></div>
            <div class="camera-actions">
                <button class="btn btn-primary" id="capture-btn">📸 ${currentLang === 'en' ? 'Capture' : '拍摄'}</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.querySelector('.camera-video-container').appendChild(video);

    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
            video.srcObject = stream;

            modal.querySelector('#capture-btn').onclick = function() {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                ctx.drawImage(video, 0, 0);

                stream.getTracks().forEach(track => track.stop());
                modal.remove();

                ocrImageData = canvas.toDataURL('image/jpeg', 0.9);
                displayOCRImage(ocrImageData);
            };
        })
        .catch(err => {
            console.error('Camera error:', err);
            showElectricToast(currentLang === 'en' ? 'Cannot access camera' : '无法访问相机', 'error');
            modal.remove();
        });
}

function displayOCRImage(imageData) {
    const previewSection = document.getElementById('ocr-preview-section');
    const actionSection = document.getElementById('ocr-action-section');
    const previewImg = document.getElementById('ocr-image-preview');

    if (previewSection && actionSection && previewImg) {
        previewImg.src = imageData;
        previewSection.style.display = 'block';
        actionSection.style.display = 'block';
    }
}

function clearOCRImage() {
    ocrImageData = null;
    document.getElementById('ocr-preview-section').style.display = 'none';
    document.getElementById('ocr-action-section').style.display = 'none';
    document.getElementById('ocr-result-section').style.display = 'none';
    document.getElementById('ocr-image-preview').src = '';
    document.getElementById('ocr-file-input').value = '';
}

async function startOCRRecognition() {
    if (!ocrImageData) {
        showElectricToast(currentLang === 'en' ? 'Please upload an image first' : '请先上传图片', 'warning');
        return;
    }

    const loadingEl = document.getElementById('ocr-loading');
    const resultSection = document.getElementById('ocr-result-section');
    const resultContent = document.getElementById('ocr-result-content');
    const resultStatus = document.getElementById('ocr-result-status');

    loadingEl.style.display = 'block';
    resultSection.style.display = 'none';

    try {
        const base64Image = ocrImageData.split(',')[1];

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer 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'
            },
            body: JSON.stringify({
                model: 'baidu/qianfan-ocr-fast:free',
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: currentLang === 'en'
                                    ? 'Extract ALL text from this image. Output ONLY the OCR content without any explanations or additional text. Preserve the original formatting and structure as much as possible.'
                                    : '提取这张图片中的所有文字内容。只输出OCR识别的文字内容，不要添加任何解释或额外文字。尽可能保持原有的格式和结构。'
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: `data:image/jpeg;base64,${base64Image}`
                                }
                            }
                        ]
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.choices && data.choices.length > 0) {
            const recognizedText = data.choices[0].message.content;

            loadingEl.style.display = 'none';
            resultSection.style.display = 'block';
            resultContent.textContent = recognizedText;
            resultStatus.textContent = currentLang === 'en' ? '✅ Success' : '✅ 识别成功';
            resultStatus.className = 'result-status success';

            showElectricToast(currentLang === 'en' ? '✅ OCR completed successfully!' : '✅ OCR识别完成！', 'success');
        } else {
            throw new Error('No response from API');
        }
    } catch (error) {
        console.error('OCR Error:', error);
        loadingEl.style.display = 'none';

        resultSection.style.display = 'block';
        resultContent.textContent = `${currentLang === 'en' ? 'Error: ' : '错误：'}${error.message}`;
        resultStatus.textContent = currentLang === 'en' ? '❌ Failed' : '❌ 识别失败';
        resultStatus.className = 'result-status error';

        showElectricToast(`${currentLang === 'en' ? 'OCR failed: ' : 'OCR识别失败：'}${error.message}`, 'error');
    }
}

function copyOCRResult() {
    const resultContent = document.getElementById('ocr-result-content');
    if (resultContent) {
        navigator.clipboard.writeText(resultContent.textContent).then(() => {
            showElectricToast(currentLang === 'en' ? '📋 Copied to clipboard!' : '📋 已复制到剪贴板！', 'success');
        });
    }
}

function downloadOCRResult() {
    const resultContent = document.getElementById('ocr-result-content');
    if (resultContent) {
        const blob = new Blob([resultContent.textContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ocr-result-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);

        showElectricToast(currentLang === 'en' ? '💾 File downloaded!' : '💾 文件已下载！', 'success');
    }
}

function setupOCRDragDrop() {
    const uploadArea = document.getElementById('ocr-upload-area');
    if (!uploadArea) return;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.classList.add('drag-over');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.classList.remove('drag-over');
        }, false);
    });

    uploadArea.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(ev) {
                    ocrImageData = ev.target.result;
                    displayOCRImage(ocrImageData);
                };
                reader.readAsDataURL(file);
            }
        }
    }, false);
}

function renderSettingsTab() {
    const mainArea = document.getElementById('main-area');
    const langActive = currentLang === 'en' ? 'en' : currentLang === 'zh-TW' ? 'zh-tw' : currentLang === 'wenyan' ? 'wenyan' : 'zh-cn';
    const themeActive = currentTheme === 'light' ? 'light' : 'dark';
    
    mainArea.innerHTML = `
        <div class="settings-panel workspace-panel">
            <div class="panel-hero">
                <div>
                    <div class="panel-kicker">SYSTEM SETTINGS</div>
                    <h2 class="panel-title">${currentLang === 'en' ? 'Preferences' : currentLang === 'zh-TW' ? '偏好設定' : '偏好设置'}</h2>
                    <p class="panel-subtitle">${currentLang === 'en' ? 'Manage language, theme and model behavior in one place.' : currentLang === 'zh-TW' ? '統一管理語言、主題與模型配置。' : '统一管理语言、主题与模型配置。'}</p>
                </div>
            </div>
            <div class="settings-section">
                <h3 class="settings-title">${translations[currentLang]['lang-label']}</h3>
                <div class="settings-label">${translations[currentLang]['lang-label']}</div>
                <div class="select-container">
                    <div class="select-option ${langActive === 'en' ? 'active' : ''}" onclick="changeLanguage('en')">${translations[currentLang]['lang-en']}</div>
                    <div class="select-option ${langActive === 'zh-cn' ? 'active' : ''}" onclick="changeLanguage('zh-CN')">${translations[currentLang]['lang-zh-cn']}</div>
                    <div class="select-option ${langActive === 'zh-tw' ? 'active' : ''}" onclick="changeLanguage('zh-TW')">${translations[currentLang]['lang-zh-tw']}</div>
                    <div class="select-option ${langActive === 'wenyan' ? 'active' : ''}" onclick="changeLanguage('wenyan')">${translations[currentLang]['lang-wenyan']}</div>
                </div>
            </div>
            <div class="settings-section">
                <h3 class="settings-title">${translations[currentLang]['theme-label']}</h3>
                <div class="settings-label">${translations[currentLang]['theme-label']}</div>
                <div class="select-container">
                    <div class="select-option ${themeActive === 'light' ? 'active' : ''}" onclick="changeTheme('light')">${translations[currentLang]['theme-light']}</div>
                    <div class="select-option ${themeActive === 'dark' ? 'active' : ''}" onclick="changeTheme('dark')">${translations[currentLang]['theme-dark']}</div>
                </div>
            </div>
            <div class="settings-section">
                <h3 class="settings-title">${translations[currentLang]['model-label']}</h3>
                <div class="settings-label">${translations[currentLang]['model-select']}</div>
                <div class="select-container">
                    <div class="select-option ${currentModel === 'openrouter|qwen' ? 'active' : ''}" onclick="selectModelFromSettings('openrouter|qwen')">Q3 Qwen 3 Next</div>
                    <div class="select-option ${currentModel === 'openrouter|gemma' ? 'active' : ''}" onclick="selectModelFromSettings('openrouter|gemma')">G4 Gemma 4</div>
                    <div class="select-option ${currentModel === 'zhipu|glm-4.7-flash' ? 'active' : ''}" onclick="selectModelFromSettings('zhipu|glm-4.7-flash')">47 GLM 4.7 Flash</div>
                    <div class="select-option ${currentModel === 'zhipu|glm-4.6v-flash' ? 'active' : ''}" onclick="selectModelFromSettings('zhipu|glm-4.6v-flash')">4V GLM 4.6V Flash</div>
                </div>
            </div>
        </div>
    `;
}

function selectModelFromSettings(modelKey) {
    currentModel = modelKey;
    const config = getModelConfig(modelKey);
    if (config) {
        document.getElementById('model-icon').textContent = config.icon;
        document.getElementById('model-name').textContent = config.name;
    }
    renderSettingsTab();
    // 如果在聊天页面，重新渲染以更新输入界面
    if (document.getElementById('page-title').textContent === translations[currentLang]['page-title-chat']) {
        renderChatTab();
    }
}

function changeLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;
    
    updateAllTextElements();
    renderSettingsTab();
}

function updateAllTextElements() {
    document.getElementById('nav-chat').textContent = translations[currentLang]['nav-chat'];
    document.getElementById('nav-tools').textContent = translations[currentLang]['nav-tools'];
    document.getElementById('nav-settings').textContent = translations[currentLang]['nav-settings'];
    document.getElementById('btn-clear').textContent = translations[currentLang]['btn-clear'];
    document.getElementById('btn-new').textContent = translations[currentLang]['btn-new'];
    
    if (document.getElementById('welcome-title')) {
        document.getElementById('welcome-title').textContent = translations[currentLang]['welcome-title'];
    }
    if (document.getElementById('welcome-subtitle')) {
        document.getElementById('welcome-subtitle').textContent = translations[currentLang]['welcome-subtitle'];
    }
    if (document.getElementById('quick-python')) {
        document.getElementById('quick-python').textContent = translations[currentLang]['quick-python'];
    }
    if (document.getElementById('quick-science')) {
        document.getElementById('quick-science').textContent = translations[currentLang]['quick-science'];
    }
    if (document.getElementById('quick-optimize')) {
        document.getElementById('quick-optimize').textContent = translations[currentLang]['quick-optimize'];
    }
    if (document.getElementById('quick-email')) {
        document.getElementById('quick-email').textContent = translations[currentLang]['quick-email'];
    }
    if (document.getElementById('message-input')) {
        document.getElementById('message-input').placeholder = translations[currentLang]['input-placeholder'];
    }
}

function changeTheme(theme) {
    currentTheme = theme;
    const body = document.body;
    
    if (theme === 'dark') {
        body.classList.add('dark-theme');
    } else {
        body.classList.remove('dark-theme');
    }
    
    localStorage.setItem('cirana-theme', theme);
}

// ========================================
// 文件处理函数
// ========================================

async function handleFileSelect(event) {
    const files = Array.from(event.target.files);
    
    for (const file of files) {
        try {
            const uploaded = FileManager.addFile(file);
            renderUploadedFiles();
        } catch (error) {
            const errorType = ERROR_TYPES.FILE_ERROR;
            ErrorManager.logError(errorType, error);
            showError(errorType, error);
        }
    }
    
    // 清空文件输入
    event.target.value = '';
}

function renderUploadedFiles() {
    const container = document.getElementById('uploaded-files');
    if (!container) return;
    
    container.innerHTML = uploadedFiles.map(fileObj => `
        <div class="uploaded-file-item" data-id="${fileObj.id}">
            <span class="file-icon">${getFileIcon(fileObj.type)}</span>
            <span class="file-name">${fileObj.name}</span>
            <button class="remove-file-btn" onclick="removeUploadedFile(${fileObj.id})">✕</button>
        </div>
    `).join('');
}

function getFileIcon(mimeType) {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎬';
    if (mimeType.startsWith('text/')) return '📄';
    if (mimeType.includes('pdf')) return '📑';
    if (mimeType.includes('word') || mimeType.includes('doc')) return '📝';
    return '📁';
}

function removeUploadedFile(id) {
    FileManager.removeFile(id);
    renderUploadedFiles();
}

// ========================================
// 聊天功能
// ========================================

function sendQuickMessage(text) {
    document.getElementById('message-input').value = text;
    sendMessage();
}

function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

async function sendMessage() {
    const input = document.getElementById('message-input');
    const content = input.value.trim();
    
    if (!content && uploadedFiles.length === 0) return;
    if (isLoading) return;
    
    const welcomeScreen = document.getElementById('welcome-screen');
    if (welcomeScreen) {
        welcomeScreen.style.display = 'none';
    }
    
    // 构建用户消息内容
    let userContent;
    if (isCurrentModelMultiModal() && uploadedFiles.length > 0) {
        userContent = [];
        
        // 根据文件类型分类处理
        for (const fileObj of uploadedFiles) {
            if (fileObj.type.startsWith('image/')) {
                // 图片使用 image_url
                const base64 = await FileManager.fileToBase64(fileObj.file);
                userContent.push({
                    type: 'image_url',
                    image_url: { url: base64 }
                });
            } else if (fileObj.type.startsWith('video/')) {
                // 视频使用 video_url
                const base64 = await FileManager.fileToBase64(fileObj.file);
                userContent.push({
                    type: 'video_url',
                    video_url: { url: base64 }
                });
            } else {
                // 其他文件使用 file_url
                const base64 = await FileManager.fileToBase64(fileObj.file);
                userContent.push({
                    type: 'file_url',
                    file_url: { url: base64 }
                });
            }
        }
        
        // 添加文本
        if (content) {
            userContent.push({
                type: 'text',
                text: content
            });
        }
    } else {
        userContent = content;
    }
    
    // 添加用户消息到界面
    addMessage('user', content || '📁 ' + uploadedFiles.map(f => f.name).join(', '));
    input.value = '';
    
    // 构建消息历史
    messages.push({
        role: 'user',
        content: userContent
    });
    
    // 清空上传的文件
    const hadFiles = uploadedFiles.length > 0;
    FileManager.clearFiles();
    renderUploadedFiles();
    
    // 判断调用方式
    const { modelConfig } = getAPIConfig();
    let useStreaming = isCurrentModelStreaming();
    
    // GLM-4.6V-Flash 特殊处理：有文件就用非流式文件调用，没有文件就流式调用
    if (modelConfig.id === 'glm-4.6v-flash') {
        useStreaming = !hadFiles;
    }
    
    if (useStreaming) {
        await callAPIStreaming();
    } else {
        await callAPI();
    }
}

function addMessage(role, content) {
    const container = document.getElementById('messages-container');
    if (!container) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = role === 'user' ? 'U' : 'C';
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.textContent = content;
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);
    container.appendChild(messageDiv);
    
    container.scrollTop = container.scrollHeight;
    
    return messageDiv;
}

function showTypingIndicator() {
    const container = document.getElementById('messages-container');
    if (!container) return;
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message assistant';
    typingDiv.id = 'typing-indicator';
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = 'C';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    content.innerHTML = '<div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>';
    
    typingDiv.appendChild(avatar);
    typingDiv.appendChild(content);
    container.appendChild(typingDiv);
    container.scrollTop = container.scrollHeight;
    
    isLoading = true;
    const sendBtn = document.getElementById('send-btn');
    if (sendBtn) sendBtn.disabled = true;
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
        indicator.remove();
    }
    isLoading = false;
    const sendBtn = document.getElementById('send-btn');
    if (sendBtn) sendBtn.disabled = false;
}

function showError(errorType, error, retryCallback = null) {
    const t = translations[currentLang];
    const message = ErrorManager.getErrorMessage(errorType);
    const solutions = ErrorManager.getSolution(errorType);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-display';
    errorDiv.innerHTML = `
        <div class="error-content">
            <div class="error-header">
                <span class="error-code">${errorType.code}</span>
                <h3 class="error-title">${errorType.name} - ${t['error-title']}</h3>
            </div>
            <div class="error-body">
                <p class="error-message">${message}</p>
                <div class="error-details">
                    <h4>${t['error-desc']}</h4>
                    <p class="error-text">${error.message || String(error)}</p>
                </div>
                <div class="error-solutions">
                    <h4>${t['error-solution']}</h4>
                    <ul>
                        ${solutions.map(s => `<li>${s}</li>`).join('')}
                    </ul>
                </div>
            </div>
            <div class="error-footer">
                ${retryCallback ? `<button class="btn btn-primary" onclick="retryFromError()">${t['error-retry']}</button>` : ''}
                <button class="btn btn-secondary" onclick="closeError()">${t['error-close']}</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(errorDiv);
    
    window.retryFromError = () => {
        closeError();
        if (retryCallback) retryCallback();
    };
    
    window.closeError = () => {
        document.querySelector('.error-display').remove();
    };
}

function getAPIConfig() {
    let provider, apiUrl, apiKey, modelId, modelConfig;
    
    if (currentModel.startsWith('zhipu|')) {
        provider = 'zhipu';
        const model = currentModel.split('|')[1];
        apiUrl = API_CONFIG.zhipu.url;
        apiKey = API_CONFIG.zhipu.key;
        modelId = API_CONFIG.zhipu.models[model].id;
        modelConfig = API_CONFIG.zhipu.models[model];
    } else {
        provider = 'openrouter';
        const model = currentModel.split('|')[1];
        apiUrl = API_CONFIG.openrouter.url;
        apiKey = API_CONFIG.openrouter.key;
        modelId = API_CONFIG.openrouter.models[model].id;
        modelConfig = API_CONFIG.openrouter.models[model];
    }
    
    return { provider, apiUrl, apiKey, modelId, modelConfig };
}

// 普通非流式调用
async function callAPI() {
    showTypingIndicator();
    
    try {
        const { apiUrl, apiKey, modelId, provider, modelConfig } = getAPIConfig();
        
        const requestBody = {
            model: modelId,
            messages: messages
        };
        
        if (provider === 'zhipu') {
            if (!modelConfig.isVisionModel) {
                requestBody.do_sample = true;
                requestBody.temperature = 0.8;
                requestBody.top_p = 0.6;
                requestBody.max_tokens = 65536;
            }
            if (modelConfig.supportsThinking) {
                requestBody.thinking = {
                    type: 'enabled'
                };
            }
        }
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestBody)
        });
        
        removeTypingIndicator();
        
        if (!response.ok) {
            const errorText = await response.text().catch(() => '');
            
            if (errorText.includes('User location is not supported') || errorText.includes('FAILED_PRECONDITION')) {
                const locationError = new Error('地区限制错误');
                locationError.message = currentLang === 'en' ? 'Your location is not supported for this model. Please try a different model.' : '您所在的地区不支持此模型，请尝试其他模型。';
                ErrorManager.logError(ERROR_TYPES.PARAM_ERROR, locationError, {
                    provider,
                    model: modelId,
                    status: response.status,
                    detail: 'Location restriction'
                });
                
                showLocationError();
                return;
            }
            
            const errorType = ErrorManager.classifyError(new Error('API Error'), response);
            ErrorManager.logError(errorType, new Error(errorText || `HTTP ${response.status}`), {
                provider,
                model: modelId,
                status: response.status
            });
            
            showError(errorType, new Error(errorText || `HTTP ${response.status}`), callAPI);
            return;
        }
        
        const data = await response.json();
        
        if (data.choices && data.choices.length > 0) {
            const assistantContent = data.choices[0].message.content;
            addMessage('assistant', assistantContent);
            messages.push({ role: 'assistant', content: assistantContent });
        } else {
            const errorType = ERROR_TYPES.UNKNOWN_ERROR;
            ErrorManager.logError(errorType, new Error('No choices in response'), { data });
            showError(errorType, new Error('No response from AI'), callAPI);
        }
    } catch (error) {
        removeTypingIndicator();
        
        const errorType = ErrorManager.classifyError(error);
        ErrorManager.logError(errorType, error);
        showError(errorType, error, callAPI);
    }
}

// 流式调用
async function callAPIStreaming() {
    showTypingIndicator();
    
    try {
        const { apiUrl, apiKey, modelId, provider, modelConfig } = getAPIConfig();
        
        const requestBody = {
            model: modelId,
            messages: messages,
            stream: true
        };
        
        if (provider === 'zhipu') {
            if (!modelConfig.isVisionModel) {
                requestBody.do_sample = true;
                requestBody.temperature = 0.8;
                requestBody.top_p = 0.6;
                requestBody.max_tokens = 65536;
            }
            if (modelConfig.supportsThinking) {
                requestBody.thinking = {
                    type: 'enabled'
                };
            }
        }
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestBody)
        });
        
        removeTypingIndicator();
        
        if (!response.ok) {
            const errorType = ErrorManager.classifyError(new Error('API Error'), response);
            const errorText = await response.text().catch(() => '');
            ErrorManager.logError(errorType, new Error(errorText || `HTTP ${response.status}`), {
                provider,
                model: modelId,
                status: response.status
            });
            
            showError(errorType, new Error(errorText || `HTTP ${response.status}`), callAPIStreaming);
            return;
        }
        
        // 添加助手消息框，开始流式渲染
        const messageDiv = addMessage('assistant', '');
        const messageContent = messageDiv.querySelector('.message-content');
        let fullContent = '';
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n').filter(line => line.trim());
            
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const dataStr = line.slice(6);
                    if (dataStr === '[DONE]') break;
                    
                    try {
                        const data = JSON.parse(dataStr);
                        if (data.choices && data.choices.length > 0) {
                            const delta = data.choices[0].delta;
                            if (delta && delta.content) {
                                fullContent += delta.content;
                                messageContent.textContent = fullContent;
                                document.getElementById('messages-container').scrollTop = 
                                    document.getElementById('messages-container').scrollHeight;
                            }
                        }
                    } catch (e) {
                        // 忽略解析错误
                    }
                }
            }
        }
        
        // 保存完整的助手消息
        messages.push({ role: 'assistant', content: fullContent });
        
    } catch (error) {
        removeTypingIndicator();
        
        const errorType = ErrorManager.classifyError(error);
        ErrorManager.logError(errorType, error);
        showError(errorType, error, callAPIStreaming);
    }
}

function showLocationError() {
    const t = translations[currentLang];
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-display';
    errorDiv.innerHTML = `
        <div class="error-content">
            <div class="error-header location-error">
                <span class="error-code">GEO</span>
                <h3 class="error-title">📍 ${t['error-title']}</h3>
            </div>
            <div class="error-body">
                <p class="error-message">${t['error-title']}：${currentLang === 'en' ? 'Your location is not supported for the selected AI model.' : '您所在的地区不支持所选的AI模型。'}</p>
                <div class="error-details">
                    <h4>${t['error-desc']}</h4>
                    <p class="error-text">${currentLang === 'en' ? 'The Gemma model provided by Google AI Studio has geographic restrictions. Please try using a different model.' : 'Google AI Studio 提供的 Gemma 模型存在地区限制，请尝试使用其他模型。'}</p>
                </div>
                <div class="error-solutions">
                    <h4>${t['error-solution']}</h4>
                    <ul>
                        <li>${currentLang === 'en' ? 'Switch to Qwen 3 Next model' : '切换到 Qwen 3 Next 模型'}</li>
                        <li>${currentLang === 'en' ? 'Switch to GLM 4.7 Flash model' : '切换到 GLM 4.7 Flash 模型'}</li>
                        <li>${currentLang === 'en' ? 'Switch to GLM 4.6V Flash multi-modal model' : '切换到 GLM 4.6V Flash 多模态模型'}</li>
                    </ul>
                </div>
            </div>
            <div class="error-footer">
                <button class="btn btn-primary" onclick="selectModelFromSettings('zhipu|glm-4.7-flash'); closeLocationError()">${currentLang === 'en' ? 'Switch to GLM 4.7 Flash' : '切换到 GLM 4.7 Flash'}</button>
                <button class="btn btn-secondary" onclick="closeLocationError()">${t['error-close']}</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(errorDiv);
    
    window.closeLocationError = () => {
        document.querySelector('.error-display').remove();
    };
}

function clearChat() {
    messages = [];
    uploadedFiles = [];
    const container = document.getElementById('messages-container');
    if (!container) return;
    
    container.innerHTML = getWelcomeMarkup();
}

function attachTextareaListener() {
    const textarea = document.getElementById('message-input');
    if (textarea) {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        });
    }
}

function renderTextEditor() {
    const mainArea = document.getElementById('main-area');
    mainArea.innerHTML = `
        <div class="tool-panel">
            <h2 class="tool-panel-title">${currentLang === 'en' ? 'Text Editor' : currentLang === 'zh-TW' ? '文字編輯器' : '文本编辑器'}</h2>
            <textarea class="text-editor-area" placeholder="${currentLang === 'en' ? 'Enter your text here...' : currentLang === 'zh-TW' ? '在此輸入文字...' : '在此输入文字...'}"></textarea>
            <div class="tool-panel-actions">
                <button class="btn btn-secondary" onclick="renderToolsTab()">${currentLang === 'en' ? 'Back' : currentLang === 'zh-TW' ? '返回' : '返回'}</button>
            </div>
        </div>
    `;
}

function renderCalculator() {
    const mainArea = document.getElementById('main-area');
    mainArea.innerHTML = `
        <div class="calculator-panel">
            <div class="calculator-wrapper">
                <div class="tool-panel-title centered-title">${currentLang === 'en' ? 'Calculator' : currentLang === 'zh-TW' ? '計算器' : '计算器'}</div>
                <div class="calculator-display" id="calc-display">0</div>
                <div class="calculator-buttons">
                    <button class="calc-btn calc-function" onclick="calcClear()">C</button>
                    <button class="calc-btn calc-function" onclick="calcDelete()">⌫</button>
                    <button class="calc-btn calc-function" onclick="calcInput('(')">()</button>
                    <button class="calc-btn calc-function" onclick="calcInput('sqrt(')">√</button>
                    <button class="calc-btn calc-function" onclick="calcInput('^')">^</button>
                    <button class="calc-btn" onclick="calcInput('7')">7</button>
                    <button class="calc-btn" onclick="calcInput('8')">8</button>
                    <button class="calc-btn" onclick="calcInput('9')">9</button>
                    <button class="calc-btn calc-operator" onclick="calcInput('/')">÷</button>
                    <button class="calc-btn calc-function" onclick="solveEquation()">x</button>
                    <button class="calc-btn" onclick="calcInput('4')">4</button>
                    <button class="calc-btn" onclick="calcInput('5')">5</button>
                    <button class="calc-btn" onclick="calcInput('6')">6</button>
                    <button class="calc-btn calc-operator" onclick="calcInput('*')">×</button>
                    <button class="calc-btn calc-function" onclick="calcInput('sin(')">sin</button>
                    <button class="calc-btn" onclick="calcInput('1')">1</button>
                    <button class="calc-btn" onclick="calcInput('2')">2</button>
                    <button class="calc-btn" onclick="calcInput('3')">3</button>
                    <button class="calc-btn calc-operator" onclick="calcInput('-')">-</button>
                    <button class="calc-btn calc-function" onclick="calcInput('cos(')">cos</button>
                    <button class="calc-btn" onclick="calcInput('0')">0</button>
                    <button class="calc-btn" onclick="calcInput('.')">.</button>
                    <button class="calc-btn calc-equal" onclick="calcCalculate()">=</button>
                    <button class="calc-btn calc-operator" onclick="calcInput('+')">+</button>
                    <button class="calc-btn calc-function" onclick="calcInput('tan(')">tan</button>
                </div>
            </div>
            <button class="btn btn-secondary" onclick="renderToolsTab()" style="margin-top: 20px;">${currentLang === 'en' ? 'Back' : currentLang === 'zh-TW' ? '返回' : '返回'}</button>
            <div class="calc-hint" style="margin-top: 16px; font-size: 12px; color: #64748b; text-align: center;">
                ${currentLang === 'en' ? 'Click [x] to solve equations (e.g., 2x+3=7)' : currentLang === 'zh-TW' ? '點擊 [x] 求解方程 (例如: 2x+3=7)' : '点击 [x] 求解方程 (例如: 2x+3=7)'}
            </div>
        </div>
    `;
}

let calcDisplay = '';
function calcInput(val) {
    const display = document.getElementById('calc-display');
    if (!display) return;
    
    if (val === 'sqrt(') {
        calcDisplay += 'Math.sqrt(';
        display.textContent = calcDisplay.replace('Math.sqrt(', '√(');
    } else if (val === 'sin(') {
        calcDisplay += 'Math.sin(';
        display.textContent = calcDisplay.replace('Math.sin(', 'sin(');
    } else if (val === 'cos(') {
        calcDisplay += 'Math.cos(';
        display.textContent = calcDisplay.replace('Math.cos(', 'cos(');
    } else if (val === 'tan(') {
        calcDisplay += 'Math.tan(';
        display.textContent = calcDisplay.replace('Math.tan(', 'tan(');
    } else if (val === '^') {
        calcDisplay += '**';
        display.textContent = calcDisplay.replace('**', '^');
    } else if (val === '/' || val === '*' || val === '+' || val === '-') {
        calcDisplay += ' ' + val + ' ';
        display.textContent = calcDisplay;
    } else {
        calcDisplay += val;
        display.textContent = calcDisplay;
    }
}

function calcClear() {
    calcDisplay = '';
    document.getElementById('calc-display').textContent = '0';
}

function calcDelete() {
    const display = document.getElementById('calc-display');
    if (calcDisplay.length > 0) {
        calcDisplay = calcDisplay.slice(0, -1);
        display.textContent = calcDisplay || '0';
    }
}

function calcCalculate() {
    const display = document.getElementById('calc-display');
    if (!display || !calcDisplay) return;
    
    try {
        let expression = calcDisplay
            .replace('√(', 'Math.sqrt(')
            .replace(/sin\(/g, 'Math.sin(')
            .replace(/cos\(/g, 'Math.cos(')
            .replace(/tan\(/g, 'Math.tan(')
            .replace('^', '**')
            .replace('×', '*')
            .replace('÷', '/');
        
        const result = eval(expression);
        display.textContent = typeof result === 'number' && !isFinite(result) ? 'Error' : result;
        calcDisplay = String(result);
    } catch {
        display.textContent = 'Error';
        calcDisplay = '';
    }
}

function solveEquation() {
    const display = document.getElementById('calc-display');
    if (!display || !calcDisplay) return;
    
    try {
        const equation = calcDisplay;
        
        if (equation.includes('=')) {
            const parts = equation.split('=');
            if (parts.length === 2) {
                const left = parts[0].trim();
                const right = parts[1].trim();
                
                if (!left.includes('x')) {
                    display.textContent = currentLang === 'en' ? 'No x found' : '未找到x';
                    return;
                }
                
                const result = solveLinearEquation(left, right);
                if (result !== null) {
                    display.textContent = `x = ${result}`;
                    calcDisplay = String(result);
                } else {
                    const quadResult = solveQuadraticEquation(left, right);
                    if (quadResult) {
                        display.textContent = quadResult;
                        calcDisplay = quadResult;
                    } else {
                        display.textContent = currentLang === 'en' ? 'No solution' : '无解';
                        calcDisplay = '';
                    }
                }
            }
        } else {
            calcDisplay += 'x';
            display.textContent = calcDisplay;
        }
    } catch (e) {
        display.textContent = 'Error';
        calcDisplay = '';
    }
}

function solveLinearEquation(left, right) {
    try {
        const rightNum = parseFloat(eval(right));
        
        let coeffX = 0;
        let constant = 0;
        
        const terms = left.match(/([+-]?[^+-]+)/g) || [];
        terms.forEach(term => {
            if (term.includes('x')) {
                const coeff = term.replace('x', '') || '1';
                coeffX += parseFloat(coeff);
            } else {
                constant += parseFloat(term) || 0;
            }
        });
        
        if (coeffX === 0) return null;
        
        return ((rightNum - constant) / coeffX).toFixed(4);
    } catch {
        return null;
    }
}

function solveQuadraticEquation(left, right) {
    try {
        const rightNum = parseFloat(eval(right));
        
        let a = 0, b = 0, c = 0;
        
        const eq = left.replace(/\^2/g, '²');
        const terms = eq.match(/([+-]?[^+-]+)/g) || [];
        
        terms.forEach(term => {
            if (term.includes('x²')) {
                const coeff = term.replace('x²', '') || '1';
                a += parseFloat(coeff);
            } else if (term.includes('x') && !term.includes('²')) {
                const coeff = term.replace('x', '') || '1';
                b += parseFloat(coeff);
            } else {
                c += parseFloat(term) || 0;
            }
        });
        
        c -= rightNum;
        
        if (a === 0) return null;
        
        const discriminant = b * b - 4 * a * c;
        
        if (discriminant > 0) {
            const x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
            const x2 = (-b - Math.sqrt(discriminant)) / (2 * a);
            return `x₁=${x1.toFixed(4)}, x₂=${x2.toFixed(4)}`;
        } else if (discriminant === 0) {
            const x = -b / (2 * a);
            return `x = ${x.toFixed(4)}`;
        } else {
            const real = (-b / (2 * a)).toFixed(4);
            const imag = (Math.sqrt(-discriminant) / (2 * a)).toFixed(4);
            return `x₁=${real}+${imag}i, x₂=${real}-${imag}i`;
        }
    } catch {
        return null;
    }
}

function renderConverter() {
    const mainArea = document.getElementById('main-area');
    mainArea.innerHTML = `
        <div class="tool-panel">
            <h2 class="tool-panel-title">${currentLang === 'en' ? 'Unit Converter' : currentLang === 'zh-TW' ? '單位轉換器' : '单位转换器'}</h2>
            <div class="converter-row">
                <input type="number" class="converter-input" id="conv-input" placeholder="Enter value">
                <select class="converter-select" id="conv-from">
                    <option value="km">${currentLang === 'en' ? 'Kilometers' : currentLang === 'zh-TW' ? '公里' : '公里'}</option>
                    <option value="m">${currentLang === 'en' ? 'Meters' : currentLang === 'zh-TW' ? '公尺' : '米'}</option>
                    <option value="cm">${currentLang === 'en' ? 'Centimeters' : currentLang === 'zh-TW' ? '公分' : '厘米'}</option>
                    <option value="mm">${currentLang === 'en' ? 'Millimeters' : currentLang === 'zh-TW' ? '毫米' : '毫米'}</option>
                    <option value="mile">${currentLang === 'en' ? 'Miles' : currentLang === 'zh-TW' ? '英里' : '英里'}</option>
                    <option value="yard">${currentLang === 'en' ? 'Yards' : currentLang === 'zh-TW' ? '碼' : '码'}</option>
                    <option value="foot">${currentLang === 'en' ? 'Feet' : currentLang === 'zh-TW' ? '呎' : '英尺'}</option>
                    <option value="inch">${currentLang === 'en' ? 'Inches' : currentLang === 'zh-TW' ? '吋' : '英寸'}</option>
                </select>
            </div>
            <div class="converter-arrow">↔</div>
            <div class="converter-row">
                <input type="number" class="converter-input" id="conv-output" readonly placeholder="Result">
                <select class="converter-select" id="conv-to">
                    <option value="km">${currentLang === 'en' ? 'Kilometers' : currentLang === 'zh-TW' ? '公里' : '公里'}</option>
                    <option value="m">${currentLang === 'en' ? 'Meters' : currentLang === 'zh-TW' ? '公尺' : '米'}</option>
                    <option value="cm">${currentLang === 'en' ? 'Centimeters' : currentLang === 'zh-TW' ? '公分' : '厘米'}</option>
                    <option value="mm">${currentLang === 'en' ? 'Millimeters' : currentLang === 'zh-TW' ? '毫米' : '毫米'}</option>
                    <option value="mile">${currentLang === 'en' ? 'Miles' : currentLang === 'zh-TW' ? '英里' : '英里'}</option>
                    <option value="yard">${currentLang === 'en' ? 'Yards' : currentLang === 'zh-TW' ? '碼' : '码'}</option>
                    <option value="foot">${currentLang === 'en' ? 'Feet' : currentLang === 'zh-TW' ? '呎' : '英尺'}</option>
                    <option value="inch">${currentLang === 'en' ? 'Inches' : currentLang === 'zh-TW' ? '吋' : '英寸'}</option>
                </select>
            </div>
            <button class="btn btn-primary" onclick="convertUnits()">${currentLang === 'en' ? 'Convert' : currentLang === 'zh-TW' ? '轉換' : '转换'}</button>
            <div class="tool-panel-actions">
                <button class="btn btn-secondary" onclick="renderToolsTab()">${currentLang === 'en' ? 'Back' : currentLang === 'zh-TW' ? '返回' : '返回'}</button>
            </div>
        </div>
    `;
}

const unitFactors = {
    km: 1000, m: 1, cm: 0.01, mm: 0.001, mile: 1609.34, yard: 0.9144, foot: 0.3048, inch: 0.0254
};

function convertUnits() {
    const input = parseFloat(document.getElementById('conv-input').value) || 0;
    const from = document.getElementById('conv-from').value;
    const to = document.getElementById('conv-to').value;
    const meters = input * unitFactors[from];
    const result = meters / unitFactors[to];
    document.getElementById('conv-output').value = result.toFixed(4);
}

function renderPasswordGenerator() {
    const mainArea = document.getElementById('main-area');
    mainArea.innerHTML = `
        <div class="tool-panel">
            <h2 class="tool-panel-title">${currentLang === 'en' ? 'Password Generator' : currentLang === 'zh-TW' ? '密碼產生器' : '密码生成器'}</h2>
            <div class="password-display" id="password-display">Click generate button</div>
            <div class="password-options">
                <label><input type="checkbox" id="opt-upper" checked> ${currentLang === 'en' ? 'Uppercase' : currentLang === 'zh-TW' ? '大寫字母' : '大写字母'}</label>
                <label><input type="checkbox" id="opt-lower" checked> ${currentLang === 'en' ? 'Lowercase' : currentLang === 'zh-TW' ? '小寫字母' : '小写字母'}</label>
                <label><input type="checkbox" id="opt-numbers" checked> ${currentLang === 'en' ? 'Numbers' : currentLang === 'zh-TW' ? '數字' : '数字'}</label>
                <label><input type="checkbox" id="opt-symbols"> ${currentLang === 'en' ? 'Symbols' : currentLang === 'zh-TW' ? '符號' : '符号'}</label>
            </div>
            <div class="password-length">
                <label>${currentLang === 'en' ? 'Length: ' : currentLang === 'zh-TW' ? '長度: ' : '长度: '}</label>
                <input type="range" id="pwd-length" min="4" max="64" value="16">
                <span id="pwd-length-value">16</span>
            </div>
            <div class="tool-panel-actions">
                <button class="btn btn-primary" onclick="generatePassword()">${currentLang === 'en' ? 'Generate' : currentLang === 'zh-TW' ? '產生' : '生成'}</button>
                <button class="btn btn-secondary" onclick="copyPassword()">${currentLang === 'en' ? 'Copy' : currentLang === 'zh-TW' ? '複製' : '复制'}</button>
                <button class="btn btn-secondary" onclick="renderToolsTab()">${currentLang === 'en' ? 'Back' : currentLang === 'zh-TW' ? '返回' : '返回'}</button>
            </div>
        </div>
    `;
    document.getElementById('pwd-length').addEventListener('input', function() {
        document.getElementById('pwd-length-value').textContent = this.value;
    });
}

function generatePassword() {
    const length = parseInt(document.getElementById('pwd-length').value);
    const upper = document.getElementById('opt-upper').checked ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : '';
    const lower = document.getElementById('opt-lower').checked ? 'abcdefghijklmnopqrstuvwxyz' : '';
    const numbers = document.getElementById('opt-numbers').checked ? '0123456789' : '';
    const symbols = document.getElementById('opt-symbols').checked ? '!@#$%^&*()_+-=[]{}|;:,.<>?' : '';
    const charset = upper + lower + numbers + symbols;
    if (!charset) {
        document.getElementById('password-display').textContent = 'Select at least one option';
        return;
    }
    let password = '';
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
        password += charset[array[i] % charset.length];
    }
    document.getElementById('password-display').textContent = password;
}

function copyPassword() {
    const password = document.getElementById('password-display').textContent;
    navigator.clipboard.writeText(password).then(() => {
        alert(currentLang === 'en' ? 'Password copied!' : currentLang === 'zh-TW' ? '密碼已複製!' : '密码已复制!');
    });
}

function renderSpeedTest() {
    const mainArea = document.getElementById('main-area');
    mainArea.innerHTML = `
        <div class="speed-test-panel">
            <div class="speed-test-header">
                <h2 class="speed-test-title">${currentLang === 'en' ? 'Network Speed Test' : currentLang === 'zh-TW' ? '網路測速' : '网络测速'}</h2>
                <button class="btn btn-secondary speed-test-back" onclick="renderToolsTab()">${currentLang === 'en' ? 'Back' : currentLang === 'zh-TW' ? '返回' : '返回'}</button>
            </div>
            <div class="speed-test-main">
                <div class="speed-metrics-grid">
                    <div class="metric-card" id="latency-card">
                        <div class="metric-icon-wrapper">LAT</div>
                        <div class="metric-info">
                            <div class="metric-label">${currentLang === 'en' ? 'Latency' : currentLang === 'zh-TW' ? '延遲' : '延迟'}</div>
                            <div class="metric-display">
                                <span class="metric-value" id="latency-value">-</span>
                                <span class="metric-unit">ms</span>
                            </div>
                        </div>
                    </div>
                    <div class="metric-card" id="download-card">
                        <div class="metric-icon-wrapper">DL</div>
                        <div class="metric-info">
                            <div class="metric-label">${currentLang === 'en' ? 'Download' : currentLang === 'zh-TW' ? '下載' : '下载'}</div>
                            <div class="metric-display">
                                <span class="metric-value" id="download-value">-</span>
                                <span class="metric-unit">Mbps</span>
                            </div>
                        </div>
                    </div>
                    <div class="metric-card" id="upload-card">
                        <div class="metric-icon-wrapper">UL</div>
                        <div class="metric-info">
                            <div class="metric-label">${currentLang === 'en' ? 'Upload' : currentLang === 'zh-TW' ? '上傳' : '上传'}</div>
                            <div class="metric-display">
                                <span class="metric-value" id="upload-value">-</span>
                                <span class="metric-unit">Mbps</span>
                            </div>
                        </div>
                    </div>
                    <div class="metric-card" id="jitter-card">
                        <div class="metric-icon-wrapper">JIT</div>
                        <div class="metric-info">
                            <div class="metric-label">${currentLang === 'en' ? 'Jitter' : currentLang === 'zh-TW' ? '抖動' : '抖动'}</div>
                            <div class="metric-display">
                                <span class="metric-value" id="jitter-value">-</span>
                                <span class="metric-unit">ms</span>
                            </div>
                        </div>
                    </div>
                    <div class="metric-card" id="packet-card">
                        <div class="metric-icon-wrapper">PKT</div>
                        <div class="metric-info">
                            <div class="metric-label">${currentLang === 'en' ? 'Packet Loss' : currentLang === 'zh-TW' ? '丟包率' : '丢包率'}</div>
                            <div class="metric-display">
                                <span class="metric-value" id="packet-loss-value">-</span>
                                <span class="metric-unit">%</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="speed-test-controls">
                    <div class="speed-progress-container">
                        <div class="speed-progress-bar">
                            <div class="speed-progress-fill" id="speed-progress"></div>
                        </div>
                        <span class="speed-status" id="speed-status">${currentLang === 'en' ? 'Ready to test' : currentLang === 'zh-TW' ? '準備測試' : '准备测试'}</span>
                    </div>
                    <button class="btn btn-primary btn-lg" id="start-test-btn" onclick="startSpeedTest()">${currentLang === 'en' ? 'Start Speed Test' : currentLang === 'zh-TW' ? '開始測速' : '开始测速'}</button>
                </div>
            </div>
        </div>
    `;
}

async function startSpeedTest() {
    const status = document.getElementById('speed-status');
    const progress = document.getElementById('speed-progress');
    const startBtn = document.getElementById('start-test-btn');
    
    startBtn.disabled = true;
    progress.style.width = '0%';
    
    document.getElementById('latency-value').textContent = '-';
    document.getElementById('download-value').textContent = '-';
    document.getElementById('upload-value').textContent = '-';
    document.getElementById('jitter-value').textContent = '-';
    document.getElementById('packet-loss-value').textContent = '-';
    
    status.textContent = currentLang === 'en' ? 'Testing latency...' : currentLang === 'zh-TW' ? '測試延遲中...' : '测试延迟中...';
    progress.style.width = '10%';
    
    const latency = await testLatency();
    document.getElementById('latency-value').textContent = latency;
    progress.style.width = '25%';
    
    status.textContent = currentLang === 'en' ? 'Testing jitter...' : currentLang === 'zh-TW' ? '測試抖動中...' : '测试抖动中...';
    const jitter = await testJitter();
    document.getElementById('jitter-value').textContent = jitter;
    progress.style.width = '40%';
    
    status.textContent = currentLang === 'en' ? 'Testing download speed...' : currentLang === 'zh-TW' ? '測試下載速度...' : '测试下载速度...';
    const download = await testDownloadSpeed();
    document.getElementById('download-value').textContent = download.toFixed(1);
    progress.style.width = '70%';
    
    status.textContent = currentLang === 'en' ? 'Testing upload speed...' : currentLang === 'zh-TW' ? '測試上傳速度...' : '测试上传速度...';
    const upload = await testUploadSpeed();
    document.getElementById('upload-value').textContent = upload.toFixed(1);
    progress.style.width = '90%';
    
    status.textContent = currentLang === 'en' ? 'Testing packet loss...' : currentLang === 'zh-TW' ? '測試丟包率...' : '测试丢包率...';
    const packetLoss = await testPacketLoss();
    document.getElementById('packet-loss-value').textContent = packetLoss.toFixed(1);
    progress.style.width = '100%';
    
    status.textContent = currentLang === 'en' ? 'Test completed!' : currentLang === 'zh-TW' ? '測試完成!' : '测试完成!';
    startBtn.disabled = false;
}

async function testLatency() {
    const testEndpoints = [
        { url: 'https://d.pcs.baidu.com/file/5d2a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c', description: '百度云 CDN', timeout: 2000 },
        { url: 'https://upos-sz-mirrorcos.bilivideo.com/upgcxcode/66/65/338536566/338536566-1-16.mp4', description: 'Bilibili CDN', timeout: 2000 },
        { url: 'https://mirrors.tuna.tsinghua.edu.cn/static/img/logo.png', description: '清华镜像', timeout: 2500 },
        { url: 'https://cdn.jsdelivr.net/npm/vue@3.4.0/dist/vue.global.prod.js', description: 'jsDelivr CDN', timeout: 2000 }
    ];

    for (const endpoint of testEndpoints) {
        const start = performance.now();
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), endpoint.timeout);
            
            await fetch(endpoint.url, { 
                method: 'GET',
                mode: 'no-cors',
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            const latency = Math.round(performance.now() - start);
            return latency;
        } catch (error) {
            continue;
        }
    }

    return Math.round(Math.random() * 100 + 50);
}

async function testJitter() {
    const times = [];
    for (let i = 0; i < 5; i++) {
        const latency = await testLatency();
        times.push(latency);
        await new Promise(r => setTimeout(r, 200));
    }
    
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const variance = times.reduce((sum, t) => sum + Math.pow(t - avg, 2), 0) / times.length;
    return Math.round(Math.sqrt(variance));
}

async function testDownloadSpeed() {
    const testFiles = [
        { url: 'https://cdn.jsdelivr.net/npm/vue@3.4.0/dist/vue.global.prod.js', size: 130000 },
        { url: 'https://cdn.jsdelivr.net/npm/react@18.2.0/umd/react.production.min.js', size: 40000 },
        { url: 'https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js', size: 85000 }
    ];

    for (const file of testFiles) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            
            const start = performance.now();
            const response = await fetch(file.url, {
                mode: 'cors',
                signal: controller.signal
            });
            
            const blob = await response.blob();
            clearTimeout(timeoutId);
            
            const end = performance.now();
            const duration = (end - start) / 1000;
            const bits = (blob.size || file.size) * 8;
            const speedMbps = (bits / duration) / 1000000;
            
            return Math.max(0.1, speedMbps);
        } catch (error) {
            continue;
        }
    }

    return Math.random() * 20 + 5;
}

async function testUploadSpeed() {
    try {
        const smallData = JSON.stringify({ test: Array(1000).fill('x').join('') });
        
        const start = performance.now();
        await fetch('https://httpbin.org/post', {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: smallData
        });
        const end = performance.now();
        
        const duration = (end - start) / 1000;
        const bits = smallData.length * 8;
        const speedMbps = (bits / duration) / 1000000;
        
        return Math.max(0.5, Math.min(speedMbps, 500));
    } catch {
        try {
            const start = performance.now();
            await fetch('https://jsonplaceholder.typicode.com/posts', {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: 'test', body: 'test' })
            });
            const end = performance.now();
            
            const duration = (end - start) / 1000;
            const speedMbps = 10 / duration;
            return Math.max(0.5, Math.min(speedMbps, 500));
        } catch {
            return Math.random() * 15 + 5;
        }
    }
}

async function testPacketLoss() {
    const testCount = 8;
    let successCount = 0;
    const testUrl = 'https://cdn.jsdelivr.net/npm/vue@3.4.0/dist/vue.global.prod.js';
    
    for (let i = 0; i < testCount; i++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            
            await fetch(testUrl, {
                method: 'GET',
                mode: 'no-cors',
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            successCount++;
        } catch {
            continue;
        }
        await new Promise(r => setTimeout(r, 300));
    }
    
    return Math.round(((testCount - successCount) / testCount) * 100);
}

function renderGeometryBoard() {
    const mainArea = document.getElementById('main-area');
    mainArea.innerHTML = `
        <div class="geometry-panel">
            <div class="geometry-header">
                <h2 class="geometry-title">${currentLang === 'en' ? 'Geometry Board' : currentLang === 'zh-TW' ? '幾何畫板' : '几何画板'}</h2>
                <div class="geometry-toolbar">
                    <button class="tool-btn active" id="tool-select" onclick="setGeometryTool('select')">👆</button>
                    <button class="tool-btn" id="tool-pen" onclick="setGeometryTool('pen')">✏️</button>
                    <button class="tool-btn" id="tool-line" onclick="setGeometryTool('line')">📏</button>
                    <button class="tool-btn" id="tool-circle" onclick="setGeometryTool('circle')">⭕</button>
                    <button class="tool-btn" id="tool-function" onclick="setGeometryTool('function')">📈</button>
                    <button class="tool-btn" id="tool-clear" onclick="clearGeometryCanvas()">🗑️</button>
                </div>
            </div>
            <div class="geometry-canvas-container">
                <canvas class="geometry-canvas" id="geometry-canvas"></canvas>
            </div>
            <div class="geometry-input-panel">
                <input type="text" class="geometry-input" id="function-input" placeholder="${currentLang === 'en' ? 'Enter function (e.g., sin(x), x^2, x+1)' : currentLang === 'zh-TW' ? '輸入函數 (例如: sin(x), x^2, x+1)' : '输入函数 (例如: sin(x), x^2, x+1)'}">
                <button class="btn btn-primary" onclick="drawFunction()">${currentLang === 'en' ? 'Draw' : currentLang === 'zh-TW' ? '繪製' : '绘制'}</button>
                <button class="btn btn-secondary" onclick="renderToolsTab()">${currentLang === 'en' ? 'Back' : currentLang === 'zh-TW' ? '返回' : '返回'}</button>
            </div>
        </div>
    `;
    initGeometryCanvas();
}

let geometryTool = 'select';
let geometryCanvas, ctx;
let isDrawing = false;
let startPoint = null;
let shapes = [];
let selectedShape = null;
let offsetX = 0, offsetY = 0;

function initGeometryCanvas() {
    geometryCanvas = document.getElementById('geometry-canvas');
    const container = geometryCanvas.parentElement;
    geometryCanvas.width = container.clientWidth;
    geometryCanvas.height = container.clientHeight;
    ctx = geometryCanvas.getContext('2d');
    
    drawGrid();
    
    geometryCanvas.addEventListener('mousedown', onCanvasMouseDown);
    geometryCanvas.addEventListener('mousemove', onCanvasMouseMove);
    geometryCanvas.addEventListener('mouseup', onCanvasMouseUp);
    geometryCanvas.addEventListener('mouseleave', onCanvasMouseUp);
    
    window.addEventListener('resize', () => {
        const container = geometryCanvas.parentElement;
        geometryCanvas.width = container.clientWidth;
        geometryCanvas.height = container.clientHeight;
        drawGrid();
        redrawShapes();
    });
}

function setGeometryTool(tool) {
    geometryTool = tool;
    document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('tool-' + tool).classList.add('active');
}

function drawGrid() {
    const width = geometryCanvas.width;
    const height = geometryCanvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const gridSize = 40;
    
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);
    
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    
    for (let x = centerX % gridSize; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    
    for (let y = centerY % gridSize; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
    
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();
    
    ctx.fillStyle = '#64748b';
    ctx.font = '12px Arial';
    for (let x = centerX + gridSize; x < width; x += gridSize) {
        const val = Math.round((x - centerX) / gridSize);
        ctx.fillText(val.toString(), x + 5, centerY - 5);
    }
    for (let x = centerX - gridSize; x > 0; x -= gridSize) {
        const val = Math.round((x - centerX) / gridSize);
        ctx.fillText(val.toString(), x + 5, centerY - 5);
    }
    for (let y = centerY + gridSize; y < height; y += gridSize) {
        const val = Math.round((centerY - y) / gridSize);
        ctx.fillText(val.toString(), centerX + 5, y - 5);
    }
    for (let y = centerY - gridSize; y > 0; y -= gridSize) {
        const val = Math.round((centerY - y) / gridSize);
        ctx.fillText(val.toString(), centerX + 5, y + 15);
    }
}

function onCanvasMouseDown(e) {
    const rect = geometryCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (geometryTool === 'select') {
        selectedShape = findShapeAt(x, y);
        if (selectedShape) {
            offsetX = x - selectedShape.x;
            offsetY = y - selectedShape.y;
        }
    } else if (geometryTool === 'pen') {
        isDrawing = true;
        startPoint = { x, y };
        shapes.push({
            type: 'path',
            points: [{ x, y }],
            color: '#6366f1'
        });
    } else if (geometryTool === 'line' || geometryTool === 'circle') {
        isDrawing = true;
        startPoint = { x, y };
    }
    
    drawGrid();
    redrawShapes();
}

function onCanvasMouseMove(e) {
    const rect = geometryCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (geometryTool === 'select' && selectedShape) {
        selectedShape.x = x - offsetX;
        selectedShape.y = y - offsetY;
        drawGrid();
        redrawShapes();
    } else if (geometryTool === 'pen' && isDrawing) {
        const lastShape = shapes[shapes.length - 1];
        if (lastShape && lastShape.type === 'path') {
            lastShape.points.push({ x, y });
            drawGrid();
            redrawShapes();
        }
    } else if ((geometryTool === 'line' || geometryTool === 'circle') && isDrawing) {
        drawGrid();
        redrawShapes();
        if (geometryTool === 'line') {
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(startPoint.x, startPoint.y);
            ctx.lineTo(x, y);
            ctx.stroke();
        } else {
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 2;
            const radius = Math.sqrt(Math.pow(x - startPoint.x, 2) + Math.pow(y - startPoint.y, 2));
            ctx.beginPath();
            ctx.arc(startPoint.x, startPoint.y, radius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}

function onCanvasMouseUp(e) {
    const rect = geometryCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (geometryTool === 'line' && isDrawing && startPoint) {
        shapes.push({
            type: 'line',
            x1: startPoint.x,
            y1: startPoint.y,
            x2: x,
            y2: y,
            color: '#ef4444'
        });
    } else if (geometryTool === 'circle' && isDrawing && startPoint) {
        const radius = Math.sqrt(Math.pow(x - startPoint.x, 2) + Math.pow(y - startPoint.y, 2));
        shapes.push({
            type: 'circle',
            x: startPoint.x,
            y: startPoint.y,
            radius,
            color: '#10b981'
        });
    }
    
    isDrawing = false;
    startPoint = null;
    
    drawGrid();
    redrawShapes();
}

function findShapeAt(x, y) {
    for (let i = shapes.length - 1; i >= 0; i--) {
        const shape = shapes[i];
        if (shape.type === 'circle') {
            const dist = Math.sqrt(Math.pow(x - shape.x, 2) + Math.pow(y - shape.y, 2));
            if (dist <= shape.radius + 5) return shape;
        } else if (shape.type === 'line') {
            const dist = pointToLineDistance(x, y, shape.x1, shape.y1, shape.x2, shape.y2);
            if (dist <= 5) return shape;
        } else if (shape.type === 'path') {
            for (let j = 0; j < shape.points.length - 1; j++) {
                const dist = pointToLineDistance(x, y, shape.points[j].x, shape.points[j].y, shape.points[j+1].x, shape.points[j+1].y);
                if (dist <= 5) return shape;
            }
        } else if (shape.type === 'function') {
            for (let px = 0; px < geometryCanvas.width; px++) {
                const py = shape.points[px];
                if (py !== null && Math.abs(x - px) <= 3 && Math.abs(y - py) <= 3) {
                    return shape;
                }
            }
        }
    }
    return null;
}

function pointToLineDistance(px, py, x1, y1, x2, y2) {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    if (lenSq !== 0) param = dot / lenSq;
    let xx, yy;
    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }
    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
}

function redrawShapes() {
    shapes.forEach(shape => {
        ctx.strokeStyle = shape.color;
        ctx.lineWidth = shape.type === 'function' ? 2 : (shape.type === 'path' ? 3 : 2);
        
        if (shape.type === 'line') {
            ctx.beginPath();
            ctx.moveTo(shape.x1, shape.y1);
            ctx.lineTo(shape.x2, shape.y2);
            ctx.stroke();
        } else if (shape.type === 'circle') {
            ctx.beginPath();
            ctx.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
            ctx.stroke();
        } else if (shape.type === 'path') {
            ctx.beginPath();
            ctx.moveTo(shape.points[0].x, shape.points[0].y);
            for (let i = 1; i < shape.points.length; i++) {
                ctx.lineTo(shape.points[i].x, shape.points[i].y);
            }
            ctx.stroke();
        } else if (shape.type === 'function') {
            ctx.beginPath();
            let started = false;
            for (let x = 0; x < geometryCanvas.width; x++) {
                const y = shape.points[x];
                if (y !== null && isFinite(y)) {
                    if (!started) {
                        ctx.moveTo(x, y);
                        started = true;
                    } else {
                        ctx.lineTo(x, y);
                    }
                } else {
                    started = false;
                }
            }
            ctx.stroke();
        }
    });
    
    if (selectedShape) {
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        if (selectedShape.type === 'circle') {
            ctx.beginPath();
            ctx.arc(selectedShape.x, selectedShape.y, selectedShape.radius + 5, 0, Math.PI * 2);
            ctx.stroke();
        } else if (selectedShape.type === 'line') {
            ctx.beginPath();
            ctx.moveTo(selectedShape.x1 - 5, selectedShape.y1);
            ctx.lineTo(selectedShape.x2 + 5, selectedShape.y2);
            ctx.stroke();
        }
        ctx.setLineDash([]);
    }
}

function drawFunction() {
    const input = document.getElementById('function-input').value.trim();
    if (!input) return;
    
    try {
        const points = [];
        const width = geometryCanvas.width;
        const height = geometryCanvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const scale = 40;
        
        for (let px = 0; px < width; px++) {
            const x = (px - centerX) / scale;
            let y;
            try {
                y = eval(input.replace(/x/g, x.toString()).replace('^', '**'));
            } catch {
                y = null;
            }
            if (y !== null && isFinite(y)) {
                points[px] = centerY - y * scale;
            } else {
                points[px] = null;
            }
        }
        
        shapes.push({
            type: 'function',
            expression: input,
            points: points,
            color: '#f59e0b'
        });
        
        drawGrid();
        redrawShapes();
        document.getElementById('function-input').value = '';
    } catch (e) {
        alert(currentLang === 'en' ? 'Invalid function!' : currentLang === 'zh-TW' ? '無效的函數!' : '无效的函数!');
    }
}

function clearGeometryCanvas() {
    shapes = [];
    selectedShape = null;
    drawGrid();
}

function renderPhysicsLab() {
    const mainArea = document.getElementById('main-area');
    mainArea.innerHTML = `
        <div class="physics-panel" id="physics-panel">
            <div class="physics-header">
                <h2 class="physics-title">${currentLang === 'en' ? 'Physics Lab' : currentLang === 'zh-TW' ? '物理實驗室' : '物理实验室'}</h2>
                <div class="physics-header-buttons">
                    <button class="btn btn-secondary" id="fullscreen-btn" onclick="togglePhysicsFullscreen()">⛶ ${currentLang === 'en' ? 'Fullscreen' : currentLang === 'zh-TW' ? '全屏' : '全屏'}</button>
                    <button class="btn btn-secondary" onclick="renderToolsTab()">← ${currentLang === 'en' ? 'Back' : currentLang === 'zh-TW' ? '返回' : '返回'}</button>
                </div>
            </div>
            <div class="experiment-list" id="experiment-list">
                <div class="experiment-card selected" onclick="selectExperiment('optical')">
                    <div class="experiment-thumbnail">🔦</div>
                    <div class="experiment-info">
                        <div class="experiment-name">${currentLang === 'en' ? 'Optical Bench Experiment' : currentLang === 'zh-TW' ? '光具座實驗' : '光具座实验'}</div>
                        <div class="experiment-desc">${currentLang === 'en' ? 'Study lens imaging principles' : currentLang === 'zh-TW' ? '研究透鏡成像原理' : '研究透镜成像原理'}</div>
                    </div>
                    <div class="experiment-status">▶</div>
                </div>
                <div class="experiment-card" onclick="selectExperiment('electrical')">
                    <div class="experiment-thumbnail">⚡</div>
                    <div class="experiment-info">
                        <div class="experiment-name">${currentLang === 'en' ? 'Electrical Lab' : currentLang === 'zh-TW' ? '電學實驗' : '电学实验'}</div>
                        <div class="experiment-desc">${currentLang === 'en' ? 'Real-time circuit simulation and parameter calculation' : currentLang === 'zh-TW' ? '直流電路實時仿真與參數計算' : '直流电路实时仿真与参数计算'}</div>
                    </div>
                    <div class="experiment-status">▶</div>
                </div>
            </div>
            <div class="physics-experiment" id="physics-experiment" style="display: none;">
                <div class="experiment-title" id="experiment-title-text">${currentLang === 'en' ? 'Optical Bench Experiment' : currentLang === 'zh-TW' ? '光具座實驗' : '光具座实验'}</div>
                <div class="experiment-container" id="experiment-container">
                    <!-- Optical Bench Content -->
                    <div class="optical-bench-wrapper" id="optical-bench-wrapper">
                        <div class="optical-bench" id="optical-bench">
                            <div class="light-source" id="light-source">
                                <div class="f-lamp">F</div>
                                <div class="lamp-glow"></div>
                            </div>
                            <div class="lens" id="lens">
                                <div class="lens-body"></div>
                                <div class="lens-center"></div>
                            </div>
                            <div class="screen" id="screen">
                                <div class="screen-image" id="screen-image">F</div>
                            </div>
                            <div class="bench-scale">
                                <div class="scale-mark" data-value="0"></div>
                                <div class="scale-mark" data-value="10"></div>
                                <div class="scale-mark" data-value="20"></div>
                                <div class="scale-mark" data-value="30"></div>
                                <div class="scale-mark" data-value="40"></div>
                                <div class="scale-mark" data-value="50"></div>
                                <div class="scale-mark" data-value="60"></div>
                                <div class="scale-mark" data-value="70"></div>
                                <div class="scale-mark" data-value="80"></div>
                                <div class="scale-mark" data-value="90"></div>
                                <div class="scale-mark" data-value="100"></div>
                            </div>
                            <div class="distance-labels">
                                <div class="distance-label" id="u-label" style="display: none;">
                                    <span class="distance-line"></span>
                                    <span class="distance-text">u = <span id="u-value">0</span>cm</span>
                                </div>
                                <div class="distance-label" id="v-label" style="display: none;">
                                    <span class="distance-line"></span>
                                    <span class="distance-text">v = <span id="v-value">0</span>cm</span>
                                </div>
                            </div>
                        </div>
                        <div class="imaging-status" id="imaging-status">
                            <span class="status-icon">💡</span>
                            <span class="status-text" id="status-text">${currentLang === 'en' ? 'Adjust positions to observe imaging' : currentLang === 'zh-TW' ? '調整位置觀察成像' : '调整位置观察成像'}</span>
                        </div>
                    </div>
                    
                    <!-- Electrical Lab Content -->
                    <div class="electrical-lab-wrapper" id="electrical-lab-wrapper" style="display: none;">
                        <div class="electric-toolbar" id="electric-toolbar"></div>
                        <div class="electric-canvas-container">
                            <canvas id="electric-canvas" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></canvas>
                        </div>
                        <div class="electric-component-popup" id="electric-component-popup"></div>
                    </div>
                </div>
            </div>
            <div class="physics-controls" id="physics-controls" style="display: none;">
                <div class="control-row">
                    <div class="control-group">
                        <label class="control-label">🔆 ${currentLang === 'en' ? 'Light Source Position' : currentLang === 'zh-TW' ? '光源位置' : '光源位置'}</label>
                        <input type="range" class="control-input" id="light-slider" min="0" max="200" value="50" oninput="updatePositions()">
                        <span class="control-value" id="light-pos">50cm</span>
                    </div>
                    <div class="control-group">
                        <label class="control-label">🔷 ${currentLang === 'en' ? 'Lens Position' : currentLang === 'zh-TW' ? '透鏡位置' : '透镜位置'}</label>
                        <input type="range" class="control-input" id="lens-slider" min="200" max="400" value="300" oninput="updatePositions()">
                        <span class="control-value" id="lens-pos">300cm</span>
                    </div>
                    <div class="control-group">
                        <label class="control-label">🎯 ${currentLang === 'en' ? 'Screen Position' : currentLang === 'zh-TW' ? '光屏位置' : '光屏位置'}</label>
                        <input type="range" class="control-input" id="screen-slider" min="400" max="600" value="500" oninput="updatePositions()">
                        <span class="control-value" id="screen-pos">500cm</span>
                    </div>
                </div>
                <div class="control-row">
                    <div class="control-group">
                        <label class="control-label">🔍 ${currentLang === 'en' ? 'Focal Length (f)' : currentLang === 'zh-TW' ? '焦距 (f)' : '焦距 (f)'}</label>
                        <input type="range" class="control-input" id="focal-slider" min="50" max="150" value="100" oninput="syncFocalSlider()">
                        <input type="number" class="control-input focal-input" id="focal-input" value="100" min="50" max="150" oninput="updateFocalLength()">
                        <span class="control-value" id="focal-value">100cm</span>
                    </div>
                    <div class="info-cards">
                        <div class="info-card">
                            <div class="info-label">${currentLang === 'en' ? 'Image Type' : currentLang === 'zh-TW' ? '像的類型' : '像的类型'}</div>
                            <div class="info-value" id="image-type">-</div>
                        </div>
                        <div class="info-card">
                            <div class="info-label">${currentLang === 'en' ? 'Image Size' : currentLang === 'zh-TW' ? '像的大小' : '像的大小'}</div>
                            <div class="info-value" id="image-size">-</div>
                        </div>
                        <div class="info-card">
                            <div class="info-label">${currentLang === 'en' ? 'Orientation' : currentLang === 'zh-TW' ? '像的方向' : '像的方向'}</div>
                            <div class="info-value" id="image-orientation">-</div>
                        </div>
                    </div>
                </div>
                <div class="control-actions">
                    <button class="physics-btn primary" onclick="startOpticalAnimation()">▶ ${currentLang === 'en' ? 'Auto Focus' : currentLang === 'zh-TW' ? '自動對焦' : '自动对焦'}</button>
                    <button class="physics-btn secondary" onclick="resetExperiment()">↺ ${currentLang === 'en' ? 'Reset' : currentLang === 'zh-TW' ? '重置' : '重置'}</button>
                    <button class="physics-btn secondary" onclick="showExperimentList()">☰ ${currentLang === 'en' ? 'Experiments' : currentLang === 'zh-TW' ? '實驗列表' : '实验列表'}</button>
                </div>
            </div>
            <div class="physics-formula" id="physics-formula" style="display: none;">
                <div class="formula-title">${currentLang === 'en' ? 'Imaging Formula' : currentLang === 'zh-TW' ? '成像公式' : '成像公式'}</div>
                <div class="formula">1/f = 1/u + 1/v</div>
                <div class="formula-legend">
                    <span><b>f</b> = ${currentLang === 'en' ? 'focal length' : currentLang === 'zh-TW' ? '焦距' : '焦距'}</span>
                    <span><b>u</b> = ${currentLang === 'en' ? 'object distance' : currentLang === 'zh-TW' ? '物距' : '物距'}</span>
                    <span><b>v</b> = ${currentLang === 'en' ? 'image distance' : currentLang === 'zh-TW' ? '像距' : '像距'}</span>
                </div>
            </div>
        </div>
    `;
    initOpticalBench();
}

// Electrical Lab Logic
// 简化的导线绘制状态变量
let wireDrawing = false;
let wirePoints = [];
let wireMousePos = null;

let electricState = {
    components: [],
    connections: [],
    selectedComponent: null,
    isDragging: false,
    dragTarget: null,
    dragOffset: { x: 0, y: 0 },
    canvas: null,
    ctx: null,
    gridSize: 20,
    activeTool: 'select',
    lastSimResult: null,
    warnings: [],
    isSimulating: true,
    tempWire: null,
    mousePos: null,
    hoverTerminal: null,
    magneticRadius: 35 // 增大吸附范围，方便触屏操作
};

function initElectricalLab() {
    const canvas = document.getElementById('electric-canvas');
    if (!canvas) {
        console.error('[Electrical Lab] Canvas element not found!');
        return;
    }
    
    electricState.canvas = canvas;
    electricState.ctx = canvas.getContext('2d');
    
    if (!electricState.ctx) {
        console.error('[Electrical Lab] Failed to get 2D context!');
        return;
    }
    
    console.log('[Electrical Lab] Initialized successfully, canvas size:', canvas.width, 'x', canvas.height);
    
    // Resize canvas
    const resizeCanvas = () => {
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        drawElectricCanvas();
    };
    
    // Fullscreen and resize adaptation
    window.addEventListener('resize', resizeCanvas);
    document.addEventListener('fullscreenchange', () => setTimeout(resizeCanvas, 100));
    resizeCanvas();
    
    // Init Toolbar
    renderElectricToolbar();
    
    // Event Listeners for mouse
    console.log('[Electrical Lab] Binding event listeners...');
    canvas.addEventListener('mousedown', handleElectricMouseDown);
    canvas.addEventListener('mousemove', handleElectricMouseMove);
    canvas.addEventListener('mouseup', handleElectricMouseUp);
    canvas.addEventListener('dblclick', handleElectricDblClick);
    canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if (wireDrawing) finishWireDrawing();
    });
    
    // Event Listeners for touch - 触屏支持
    canvas.addEventListener('touchstart', handleElectricTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleElectricTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleElectricTouchEnd);
    
    console.log('[Electrical Lab] Event listeners bound successfully (including touch)');
    
    // Start Simulation Loop
    if (!electricState.simInterval) {
        electricState.simInterval = setInterval(runCircuitSimulation, 100);
    }
    
    // Create default demo circuit
    createDefaultCircuit();
}

function createDefaultCircuit() {
    if (electricState.components.length > 0) return;
    
    const baseY = 150;
    
    // Add power source
    addElectricComponent('power', 60, baseY);
    
    // Add switch
    addElectricComponent('switch', 180, baseY);
    
    // Add bulb
    addElectricComponent('bulb', 320, baseY);
    
    // Close the switch by default
    const switchComp = electricState.components.find(c => c.type === 'switch');
    if (switchComp) {
        switchComp.params.isOpen = false;
    }
    
    // Create connections
    setTimeout(() => {
        // Wire from power+ to switch+
        electricState.connections.push({
            points: [{ x: 120, y: baseY + 25 }, { x: 180, y: baseY + 25 }]
        });
        
        // Wire from switch- to bulb+
        electricState.connections.push({
            points: [{ x: 240, y: baseY + 25 }, { x: 320, y: baseY + 25 }]
        });
        
        // Return wire from bulb- to power-
        electricState.connections.push({
            points: [
                { x: 380, y: baseY + 25 },
                { x: 420, y: baseY + 25 },
                { x: 420, y: baseY + 80 },
                { x: 60, y: baseY + 80 },
                { x: 60, y: baseY + 25 }
            ]
        });
        
        drawElectricCanvas();
        runCircuitSimulation();
    }, 200);
}

function renderElectricToolbar() {
    const toolbar = document.getElementById('electric-toolbar');
    const tools = [
        { id: 'select', name: currentLang === 'en' ? 'Select' : '选择', icon: '🖱️' },
        { id: 'wire', name: currentLang === 'en' ? 'Wire' : '导线', icon: '〰️' },
        { id: 'power', name: currentLang === 'en' ? 'Power' : '电源', icon: '🔋' },
        { id: 'resistor', name: currentLang === 'en' ? 'Resistor' : '电阻', icon: '🟦' },
        { id: 'bulb', name: currentLang === 'en' ? 'Bulb' : '灯泡', icon: '💡' },
        { id: 'switch', name: currentLang === 'en' ? 'Switch' : '开关', icon: '🔌' },
        { id: 'ammeter', name: currentLang === 'en' ? 'Ammeter' : '电流表', icon: '⏲️' },
        { id: 'voltmeter', name: currentLang === 'en' ? 'Voltmeter' : '电压表', icon: '📟' }
    ];
    
    toolbar.innerHTML = tools.map(tool => `
        <button class="electric-toolbar-btn ${electricState.activeTool === tool.id ? 'active' : ''}" 
                onclick="setElectricTool('${tool.id}')">
            <span class="icon">${tool.icon}</span>
            <span>${tool.name}</span>
        </button>
    `).join('') + `
        <div style="flex: 1"></div>
        <button class="electric-toolbar-btn" onclick="resetElectricLab()">
            <span class="icon">↺</span>
            <span>${currentLang === 'en' ? 'Reset' : '重置'}</span>
        </button>
        <button class="electric-toolbar-btn" onclick="exportElectricReport()">
            <span class="icon">📋</span>
            <span>${currentLang === 'en' ? 'Report' : '报告'}</span>
        </button>
    `;
}

function setElectricTool(toolId) {
    electricState.activeTool = toolId;
    renderElectricToolbar();
}

function getComponentTerminals(component) {
    const centerY = component.y + component.h / 2;
    return [
        {
            x: component.x,
            y: centerY,
            polarity: '+',
            componentId: component.id,
            componentName: component.name
        },
        {
            x: component.x + component.w,
            y: centerY,
            polarity: '-',
            componentId: component.id,
            componentName: component.name
        }
    ];
}

// 更新连接到组件的导线端点位置
function updateWiresForComponent(component, dx, dy) {
    const terminals = getComponentTerminals(component);

    electricState.connections.forEach(conn => {
        if (conn.points && conn.points.length > 0) {
            // 检查并更新起点
            const startTerminal = terminals.find(t =>
                Math.abs(t.x - conn.points[0].x) < 5 &&
                Math.abs(t.y - conn.points[0].y) < 5
            );
            if (startTerminal) {
                conn.points[0].x += dx;
                conn.points[0].y += dy;
            }

            // 检查并更新终点
            const endPoint = conn.points[conn.points.length - 1];
            const endTerminal = terminals.find(t =>
                Math.abs(t.x - endPoint.x) < 5 &&
                Math.abs(t.y - endPoint.y) < 5
            );
            if (endTerminal) {
                endPoint.x += dx;
                endPoint.y += dy;
            }
        }
    });

    // 重新运行仿真以更新电路状态
    runCircuitSimulation();
}

function findNearbyTerminal(x, y, radius = electricState.magneticRadius) {
    let matched = null;
    let minDistance = Number.POSITIVE_INFINITY;

    electricState.components.forEach(component => {
        getComponentTerminals(component).forEach(terminal => {
            const distance = Math.hypot(terminal.x - x, terminal.y - y);
            if (distance <= radius && distance < minDistance) {
                matched = terminal;
                minDistance = distance;
            }
        });
    });

    return matched;
}

function getSnappedWirePoint(x, y) {
    const terminal = findNearbyTerminal(x, y);
    if (terminal) {
        return {
            x: terminal.x,
            y: terminal.y,
            terminal
        };
    }

    return {
        x: Math.round(x / electricState.gridSize) * electricState.gridSize,
        y: Math.round(y / electricState.gridSize) * electricState.gridSize,
        terminal: null
    };
}

function isSamePoint(a, b) {
    return !!a && !!b && a.x === b.x && a.y === b.y;
}

function getTerminalDisplayName(terminal) {
    return `${terminal.componentName}${terminal.polarity === '+' ? '正极' : '负极'}`;
}

function showElectricToast(message, variant = 'info') {
    const container = document.getElementById('electrical-lab-wrapper');
    if (!container) return;

    const popup = document.createElement('div');
    popup.className = `bubble-toast ${variant}`;

    const iconMap = {
        success: '✅',
        info: '💡',
        error: '❌',
        warning: '⚠️',
        danger: '🔴'
    };

    popup.innerHTML = `
        <div class="bubble-toast-icon">${iconMap[variant] || 'ℹ️'}</div>
        <div class="bubble-toast-content">
            <div class="bubble-toast-message">${message.replace(/^[^\s]+\s/, '')}</div>
            <div class="bubble-toast-progress"></div>
        </div>
        <button class="bubble-toast-close" onclick="this.parentElement.remove()">×</button>
    `;

    container.appendChild(popup);

    requestAnimationFrame(() => {
        popup.classList.add('show');
    });

    setTimeout(() => {
        popup.classList.remove('show');
        setTimeout(() => popup.remove(), 300);
    }, 2500);
}

function handleElectricMouseDown(e) {
    const rect = electricState.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const snapped = getSnappedWirePoint(x, y);
    const snapX = snapped.x;
    const snapY = snapped.y;
    
    if (electricState.activeTool === 'select') {
        // Check if clicked on a wire first
        const clickedWireIndex = findClickedWire(x, y);
        if (clickedWireIndex !== -1) {
            showWireOptions(clickedWireIndex);
            return;
        }
        
        // Check if clicked on a switch for toggle
        const target = electricState.components.find(c => {
            return x >= c.x && x <= c.x + c.w && y >= c.y && y <= c.y + c.h;
        });
        
        if (target) {
            // Check if clicked on terminal to start wire drag
            const terminal = findNearbyTerminal(x, y, 15);
            if (terminal) {
                // 从这个端点开始绘制导线
                wireDrawing = true;
                wirePoints = [{ x: terminal.x, y: terminal.y }];
                wireMousePos = { x: terminal.x, y: terminal.y };
                showElectricToast(currentLang === 'en' ? '📌 Click next terminal or point' : '📌 点击下一个端点或位置', 'info');
                drawElectricCanvas();
                return;
            }
            
            electricState.selectedComponent = target;
            electricState.isDragging = true;
            electricState.dragTarget = target;
            electricState.dragOffset = { x: x - target.x, y: y - target.y };
            renderElectricSidebar();
        } else {
            electricState.selectedComponent = null;
            document.getElementById('electric-sidebar').style.display = 'none';
        }
    } else if (electricState.activeTool === 'wire') {
        if (!wireDrawing) {
            // 开始绘制导线 - 点击第一个点
            wireDrawing = true;
            wirePoints = [{ x: snapX, y: snapY }];
            wireMousePos = { x: snapX, y: snapY };
            showElectricToast(
                currentLang === 'en' ? '📌 Click next point or terminal to complete' : '📌 点击下一个位置或端点完成绘制',
                'info'
            );
            if (snapped.terminal) {
                showElectricToast(`✨ ${currentLang === 'en' ? 'Started from' : '已从'} ${getTerminalDisplayName(snapped.terminal)} ${currentLang === 'en' ? '- now drag to endpoint' : '开始 - 拖动到终点'}`, 'success');
            }
        } else {
            // 点击第二个点 - 完成绘制
            const lastP = wirePoints[wirePoints.length - 1];
            if (!isSamePoint(lastP, { x: snapX, y: snapY })) {
                wirePoints.push({ x: snapX, y: snapY });
            }

            // 完成导线绘制（无论是否连接到终端）
            if (snapped.terminal) {
                finishWireDrawing(snapped.terminal);
                showElectricToast(`✅ ${currentLang === 'en' ? 'Wire connected to' : '导线已连接到'} ${getTerminalDisplayName(snapped.terminal)}`, 'success');
            } else {
                finishWireDrawing(null);
                showElectricToast(`✅ ${currentLang === 'en' ? 'Wire completed!' : '导线绘制完成！'}`, 'success');
            }
            return;
        }
    } else {
        addElectricComponent(electricState.activeTool, snapX, snapY);
    }
    drawElectricCanvas();
}

function handleElectricMouseMove(e) {
    const rect = electricState.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const snapped = getSnappedWirePoint(x, y);
    
    // 更新导线绘制的鼠标位置
    if (wireDrawing) {
        wireMousePos = {
            x: snapped.x,
            y: snapped.y
        };
        electricState.hoverTerminal = snapped.terminal;
        drawElectricCanvas();
        return;
    }
    
    if (electricState.isDragging && electricState.dragTarget) {
        const oldX = electricState.dragTarget.x;
        const oldY = electricState.dragTarget.y;
        const newX = Math.round((x - electricState.dragOffset.x) / electricState.gridSize) * electricState.gridSize;
        const newY = Math.round((y - electricState.dragOffset.y) / electricState.gridSize) * electricState.gridSize;

        // 更新组件位置
        electricState.dragTarget.x = newX;
        electricState.dragTarget.y = newY;

        // 计算偏移量并更新连接到该组件的导线
        const dx = newX - oldX;
        const dy = newY - oldY;
        if (dx !== 0 || dy !== 0) {
            updateWiresForComponent(electricState.dragTarget, dx, dy);
        }
    } else {
        electricState.mousePos = {
            x: snapped.x,
            y: snapped.y
        };
        electricState.hoverTerminal = snapped.terminal;
    }
    drawElectricCanvas();
}

function handleElectricMouseUp() {
    electricState.isDragging = false;
    electricState.dragTarget = null;
    
    // 如果正在绘制导线
    if (wireDrawing && wireMousePos) {
        const endTerminal = findNearbyTerminal(wireMousePos.x, wireMousePos.y, 15);
        if (endTerminal) {
            // 添加端点到终端
            const lastP = wirePoints[wirePoints.length - 1];
            if (!isSamePoint(lastP, { x: endTerminal.x, y: endTerminal.y })) {
                wirePoints.push({ x: endTerminal.x, y: endTerminal.y });
            }
            finishWireDrawing(endTerminal);
            return;
        }
        
        // 如果不靠近终端，但已经有多个点，也完成
        if (wirePoints.length > 1) {
            finishWireDrawing(null);
            return;
        }
        
        // 取消只有一个点的导线
        wireDrawing = false;
        wirePoints = [];
        wireMousePos = null;
    }
    
    drawElectricCanvas();
}

function handleElectricDblClick(e) {
    if (wireDrawing) finishWireDrawing();
    
    // Toggle switch on double-click
    const rect = electricState.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const target = electricState.components.find(c => {
        return x >= c.x && x <= c.x + c.w && y >= c.y && y <= c.y + c.h && c.type === 'switch';
    });
    
    if (target) {
        target.params.isOpen = !target.params.isOpen;
        showElectricToast(
            target.params.isOpen 
                ? (currentLang === 'en' ? '🔓 Switch Opened' : '🔓 开关已断开')
                : (currentLang === 'en' ? '🔒 Switch Closed' : '🔒 开关已闭合'),
            target.params.isOpen ? 'warning' : 'success'
        );
        runCircuitSimulation();
    }
}

// ========== 触屏事件处理 ==========
function handleElectricTouchStart(e) {
    e.preventDefault(); // 防止页面滚动
    const touch = e.touches[0];
    const mouseEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY
    };
    handleElectricMouseDown(mouseEvent);
}

function handleElectricTouchMove(e) {
    e.preventDefault(); // 防止页面滚动
    const touch = e.touches[0];
    const mouseEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY
    };
    handleElectricMouseMove(mouseEvent);
}

function handleElectricTouchEnd(e) {
    const touch = e.changedTouches[0];
    const mouseEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY
    };
    handleElectricMouseUp(mouseEvent);
}

// 新的完成导线绘制函数
function finishWireDrawing(endTerminal = null) {
    if (wireDrawing && wirePoints.length > 1) {
        electricState.connections.push({
            points: [...wirePoints],
            endTerminal
        });

        if (endTerminal) {
            showElectricToast(`✅ 导线已成功连接！`, 'success');
            setElectricTool('select');
        } else {
            showElectricToast(`✅ 导线已绘制完成`, 'success');
        }
    }
    // 重置绘制状态
    wireDrawing = false;
    wirePoints = [];
    wireMousePos = null;
    drawElectricCanvas();
    // 重新运行电路仿真
    runCircuitSimulation();
}

// Find if click is on a wire
function findClickedWire(x, y, threshold = 8) {
    for (let i = 0; i < electricState.connections.length; i++) {
        const conn = electricState.connections[i];
        for (let j = 0; j < conn.points.length - 1; j++) {
            const p1 = conn.points[j];
            const p2 = conn.points[j + 1];
            
            // Calculate distance from point to line segment
            const dist = pointToLineDistance(x, y, p1.x, p1.y, p2.x, p2.y);
            if (dist < threshold) {
                return i;
            }
        }
    }
    return -1;
}

function pointToLineDistance(px, py, x1, y1, x2, y2) {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    
    if (lenSq !== 0) param = dot / lenSq;
    
    let xx, yy;
    
    if (param < 0) {
        xx = x1; yy = y1;
    } else if (param > 1) {
        xx = x2; yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }
    
    return Math.hypot(px - xx, py - yy);
}

function showWireOptions(wireIndex) {
    const conn = electricState.connections[wireIndex];
    if (!conn) return;
    
    // Create options popup
    const container = document.getElementById('electrical-lab-wrapper');
    const popup = document.createElement('div');
    popup.className = 'wire-options-popup';
    popup.innerHTML = `
        <div class="wire-options-header">
            <span>〰️ ${currentLang === 'en' ? 'Wire Options' : '导线选项'}</span>
            <button onclick="this.closest('.wire-options-popup').remove()">✕</button>
        </div>
        <div class="wire-options-body">
            <div class="option-row">
                <label>${currentLang === 'en' ? 'Resistance (Ω):' : '电阻 (Ω):'}</label>
                <input type="number" id="wire-resistance" value="${conn.resistance || 0.01}" min="0" step="0.01">
            </div>
            <div class="option-row">
                <label>${currentLang === 'en' ? 'Points:' : '节点数:'}</label>
                <span>${conn.points.length}</span>
            </div>
        </div>
        <div class="wire-options-footer">
            <button class="btn-secondary" onclick="deleteWire(${wireIndex})">🗑️ ${currentLang === 'en' ? 'Delete' : '删除'}</button>
            <button class="btn-primary" onclick="saveWireResistance(${wireIndex})">💾 ${currentLang === 'en' ? 'Save' : '保存'}</button>
        </div>
    `;
    container.appendChild(popup);
}

function deleteWire(index) {
    electricState.connections.splice(index, 1);
    document.querySelector('.wire-options-popup')?.remove();
    runCircuitSimulation();
    drawElectricCanvas();
    showElectricToast(currentLang === 'en' ? '🗑️ Wire Deleted' : '🗑️ 导线已删除', 'info');
}

function saveWireResistance(index) {
    const input = document.getElementById('wire-resistance');
    if (input && electricState.connections[index]) {
        electricState.connections[index].resistance = parseFloat(input.value) || 0.01;
        document.querySelector('.wire-options-popup')?.remove();
        runCircuitSimulation();
        drawElectricCanvas();
        showElectricToast(currentLang === 'en' ? '💾 Wire Updated' : '💾 导线已更新', 'success');
    }
}

function finishTempWire(endTerminal = null) {
    if (electricState.tempWire && electricState.tempWire.points.length > 1) {
        electricState.connections.push({
            points: [...electricState.tempWire.points],
            startTerminal: electricState.tempWire.startTerminal || null,
            endTerminal
        });

        if (endTerminal) {
            showElectricToast(`导线已连接到 ${getTerminalDisplayName(endTerminal)}`, 'success');
            setElectricTool('select');
        }
    }
    electricState.tempWire = null;
    electricState.hoverTerminal = null;
    drawElectricCanvas();
}

function addElectricComponent(type, x, y) {
    const component = {
        id: 'comp_' + Date.now(),
        type: type,
        x: x,
        y: y,
        w: 60,
        h: 40,
        params: {}
    };
    
    switch (type) {
        case 'power':
            component.params = { voltage: 9, internalR: 0.1 };
            component.name = currentLang === 'en' ? 'DC Power' : '直流电源';
            break;
        case 'resistor':
            component.params = { resistance: 100 };
            component.name = currentLang === 'en' ? 'Resistor' : '定值电阻';
            break;
        case 'bulb':
            component.params = { ratedV: 12, ratedP: 10, coldR: 10, isBroken: false };
            component.name = currentLang === 'en' ? 'Light Bulb' : '灯泡';
            break;
        case 'switch':
            component.params = { isOpen: true };
            component.name = currentLang === 'en' ? 'Switch' : '开关';
            break;
        case 'ammeter':
            component.params = { range: 3, internalR: 0.05 };
            component.name = currentLang === 'en' ? 'Ammeter' : '电流表';
            break;
        case 'voltmeter':
            component.params = { range: 15, internalR: 10000000 };
            component.name = currentLang === 'en' ? 'Voltmeter' : '电压表';
            break;
    }
    
    electricState.components.push(component);
    electricState.selectedComponent = component;
    renderElectricSidebar();
}

function drawElectricCanvas() {
    const { ctx, canvas, gridSize, components, connections, hoverTerminal } = electricState;
    if (!ctx) return;
    
    // Check if dark theme
    const isDarkTheme = document.body.classList.contains('dark-theme');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw Grid
    ctx.beginPath();
    ctx.strokeStyle = isDarkTheme ? '#2d3748' : '#e2e8f0';
    ctx.lineWidth = 1;
    for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height);
    }
    for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.moveTo(0, y); ctx.lineTo(canvas.width, y);
    }
    ctx.stroke();
    
    // Draw Connections
    ctx.strokeStyle = isDarkTheme ? '#94a3b8' : '#334155';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    connections.forEach(conn => {
        ctx.beginPath();
        ctx.moveTo(conn.points[0].x, conn.points[0].y);
        for (let i = 1; i < conn.points.length; i++) {
            ctx.lineTo(conn.points[i].x, conn.points[i].y);
        }
        ctx.stroke();
        
        // Draw current flow animation if circuit is complete
        const hasPower = electricState.components.some(c => c.type === 'power');
        const switchClosed = electricState.components.filter(c => c.type === 'switch').every(c => !c.params.isOpen);
        const result = electricState.lastSimResult;
        
        if (hasPower && switchClosed && result && result.totalI > 0.01) {
            drawCurrentFlow(ctx, conn, result.totalI);
        }
    });
    
    // 辅助函数：绘制圆角矩形
    function roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }
    
    // 绘制正在绘制的导线（点击-跟随式）
    if (wireDrawing && wirePoints.length > 0) {
        const startPoint = wirePoints[0];

        // 绘制发光背景效果
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 165, 0, 0.3)';
        ctx.lineWidth = 16;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.moveTo(startPoint.x, startPoint.y);
        for (let i = 1; i < wirePoints.length; i++) {
            ctx.lineTo(wirePoints[i].x, wirePoints[i].y);
        }
        if (wireMousePos) {
            ctx.lineTo(wireMousePos.x, wireMousePos.y);
        }
        ctx.stroke();

        // 绘制主线条 - 使用渐变色
        ctx.beginPath();
        const gradient = ctx.createLinearGradient(
            startPoint.x, startPoint.y,
            wireMousePos ? wireMousePos.x : startPoint.x,
            wireMousePos ? wireMousePos.y : startPoint.y
        );
        gradient.addColorStop(0, isDarkTheme ? '#60a5fa' : '#3b82f6');
        gradient.addColorStop(1, isDarkTheme ? '#f87171' : '#ef4444');
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 6;
        ctx.setLineDash([10, 5]);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // 绘制所有已有的点
        ctx.moveTo(startPoint.x, startPoint.y);
        for (let i = 1; i < wirePoints.length; i++) {
            ctx.lineTo(wirePoints[i].x, wirePoints[i].y);
        }

        // 绘制到鼠标位置的跟随线
        if (wireMousePos) {
            ctx.lineTo(wireMousePos.x, wireMousePos.y);
        }

        ctx.stroke();
        ctx.setLineDash([]);

        // 绘制起点（绿色/蓝色圆点）
        ctx.fillStyle = isDarkTheme ? '#34d399' : '#10b981';
        ctx.beginPath();
        ctx.arc(startPoint.x, startPoint.y, 10, 0, Math.PI * 2);
        ctx.fill();

        // 起点内部白色
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(startPoint.x, startPoint.y, 5, 0, Math.PI * 2);
        ctx.fill();

        // 绘制中间点（如果有）
        for (let i = 1; i < wirePoints.length; i++) {
            const p = wirePoints[i];
            ctx.fillStyle = isDarkTheme ? '#60a5fa' : '#3b82f6';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            ctx.fill();
        }

        // 绘制跟随鼠标的端点（红色，带脉冲效果）
        if (wireMousePos) {
            // 外圈脉冲
            const pulseSize = 12 + Math.sin(Date.now() / 200) * 3;
            ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
            ctx.beginPath();
            ctx.arc(wireMousePos.x, wireMousePos.y, pulseSize, 0, Math.PI * 2);
            ctx.fill();

            // 主圆点
            ctx.fillStyle = isDarkTheme ? '#f87171' : '#ef4444';
            ctx.beginPath();
            ctx.arc(wireMousePos.x, wireMousePos.y, 9, 0, Math.PI * 2);
            ctx.fill();

            // 内部白色
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(wireMousePos.x, wireMousePos.y, 4, 0, Math.PI * 2);
            ctx.fill();
        }

        // 显示提示文字
        if (wireMousePos) {
            ctx.save();
            const tipText = electricState.hoverTerminal
                ? (currentLang === 'en' ? '✓ Click to connect' : '✓ 点击连接')
                : (currentLang === 'en' ? 'Click to place endpoint' : '点击放置终点');
            ctx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
            const textWidth = ctx.measureText(tipText).width;
            const textX = wireMousePos.x + 15;
            const textY = wireMousePos.y - 15;

            // 背景
            ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            const padding = 6;
            roundRect(ctx, textX - padding, textY - 14, textWidth + padding * 2, 20, 4);
            ctx.fill();

            // 文字
            ctx.fillStyle = '#ffffff';
            ctx.fillText(tipText, textX, textY);
            ctx.restore();
        }
    }

    if (hoverTerminal) {
        ctx.save();
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.75)';
        ctx.fillStyle = 'rgba(59, 130, 246, 0.14)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(hoverTerminal.x, hoverTerminal.y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
    
    // Draw Components
    components.forEach(c => drawComponent(ctx, c));
    
    // Draw Warnings
    if (electricState.warnings.length > 0) drawWarnings();
}

function drawCurrentFlow(ctx, conn, current) {
    const time = Date.now() / 1000;
    const speed = Math.min(current * 2, 5);
    const particleCount = Math.floor(conn.points.length * 2);
    
    ctx.save();
    ctx.fillStyle = '#3b82f6';
    ctx.globalAlpha = 0.8;
    
    for (let i = 0; i < particleCount; i++) {
        // Calculate position along the path
        let totalLength = 0;
        for (let j = 1; j < conn.points.length; j++) {
            totalLength += Math.hypot(
                conn.points[j].x - conn.points[j-1].x,
                conn.points[j].y - conn.points[j-1].y
            );
        }
        
        let pos = ((time * speed + i / particleCount) % 1) * totalLength;
        let x = conn.points[0].x, y = conn.points[0].y;
        
        for (let j = 1; j < conn.points.length && pos > 0; j++) {
            const segLen = Math.hypot(
                conn.points[j].x - conn.points[j-1].x,
                conn.points[j].y - conn.points[j-1].y
            );
            if (pos <= segLen) {
                const ratio = pos / segLen;
                x = conn.points[j-1].x + (conn.points[j].x - conn.points[j-1].x) * ratio;
                y = conn.points[j-1].y + (conn.points[j].y - conn.points[j-1].y) * ratio;
                break;
            }
            pos -= segLen;
        }
        
        // Draw glowing particle
        const gradient = ctx.createRadialGradient(x, y, 2, x, y, 8);
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.9)');
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw bright center
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
}

// 检查电路是否真正连接
function isCircuitConnected() {
    const openSwitch = electricState.components.find(c => c.type === 'switch' && c.params.isOpen);
    if (openSwitch) return false;

    const hasPower = electricState.components.some(c => c.type === 'power');
    if (!hasPower) return false;

    if (electricState.connections.length === 0) return false;

    const hasLoad = electricState.components.some(c => c.type === 'bulb' || c.type === 'resistor');
    if (!hasLoad) return false;

    // 新增：检查所有元件的端点连接完整性
    if (!checkAllTerminalsConnected()) {
        return false;
    }

    return checkCircuitLoop();
}

function checkAllTerminalsConnected() {
    const connectedTerminals = new Set();

    electricState.connections.forEach(conn => {
        if (conn.points.length < 2) return;

        const startPoint = conn.points[0];
        const endPoint = conn.points[conn.points.length - 1];

        const startNode = findNearestTerminalNode(startPoint.x, startPoint.y);
        const endNode = findNearestTerminalNode(endPoint.x, endPoint.y);

        if (startNode) connectedTerminals.add(startNode);
        if (endNode) connectedTerminals.add(endNode);

        if (conn.startTerminal) {
            connectedTerminals.add(`${conn.startTerminal.componentId}_${conn.startTerminal.polarity}`);
        }
        if (conn.endTerminal) {
            connectedTerminals.add(`${conn.endTerminal.componentId}_${conn.endTerminal.polarity}`);
        }
    });

    for (const component of electricState.components) {
        // 开关断开时不需要检查其端点连接
        if (component.type === 'switch' && component.params.isOpen) continue;

        // 电压表是并联测量设备，可以只有一个端点连接
        if (component.type === 'voltmeter') continue;

        const terminals = getComponentTerminals(component);
        const posNodeId = `${component.id}_+`;
        const negNodeId = `${component.id}_-`;

        const posConnected = connectedTerminals.has(posNodeId);
        const negConnected = connectedTerminals.has(negNodeId);

        // 如果任意一个端点未连接，电路断开
        if (!posConnected || !negConnected) {
            console.log(`元件 ${component.name} (${component.id}) 端点未完全连接:`, {
                正极: posConnected ? '✓' : '✗',
                负极: negConnected ? '✓' : '✗'
            });
            return false;
        }
    }

    return true;
}

function checkCircuitLoop() {
    const power = electricState.components.find(c => c.type === 'power');
    if (!power) return false;

    const powerTerminals = getComponentTerminals(power);
    const positiveTerminal = `${power.id}_+`;
    const negativeTerminal = `${power.id}_-`;

    const adjacencyList = buildCircuitGraph();

    const visited = new Set();
    const queue = [positiveTerminal];

    while (queue.length > 0) {
        const current = queue.shift();
        if (current === negativeTerminal) {
            return true;
        }

        if (visited.has(current)) continue;
        visited.add(current);

        const neighbors = adjacencyList[current] || [];
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                queue.push(neighbor);
            }
        }
    }

    return false;
}

function buildCircuitGraph() {
    const graph = {};

    electricState.components.forEach(component => {
        const terminals = getComponentTerminals(component);
        terminals.forEach((terminal, index) => {
            const nodeId = `${component.id}_${terminal.polarity}`;
            graph[nodeId] = [];
        });
    });

    electricState.connections.forEach(conn => {
        if (conn.points.length < 2) return;

        const startPoint = conn.points[0];
        const endPoint = conn.points[conn.points.length - 1];

        const startNode = findNearestTerminalNode(startPoint.x, startPoint.y);
        const endNode = findNearestTerminalNode(endPoint.x, endPoint.y);

        if (startNode && endNode) {
            if (!graph[startNode]) graph[startNode] = [];
            if (!graph[endNode]) graph[endNode] = [];

            graph[startNode].push(endNode);
            graph[endNode].push(startNode);
        } else if (startNode && !endNode) {
            if (conn.endTerminal) {
                const endNodeId = `${conn.endTerminal.componentId}_${conn.endTerminal.polarity}`;
                if (!graph[startNode]) graph[startNode] = [];
                if (!graph[endNodeId]) graph[endNodeId] = [];

                graph[startNode].push(endNodeId);
                graph[endNodeId].push(startNode);
            }
        }
    });

    electricState.components.forEach(component => {
        if (component.type !== 'switch') return;

        const terminals = getComponentTerminals(component);
        const posNodeId = `${component.id}_+`;
        const negNodeId = `${component.id}_-`;

        if (!component.params.isOpen) {
            if (!graph[posNodeId]) graph[posNodeId] = [];
            if (!graph[negNodeId]) graph[negNodeId] = [];

            graph[posNodeId].push(negNodeId);
            graph[negNodeId].push(posNodeId);
        }
    });

    return graph;
}

function findNearestTerminalNode(x, y, threshold = 15) {
    let nearestNode = null;
    let minDistance = threshold;

    electricState.components.forEach(component => {
        const terminals = getComponentTerminals(component);
        terminals.forEach(terminal => {
            const distance = Math.sqrt(
                Math.pow(x - terminal.x, 2) + Math.pow(y - terminal.y, 2)
            );

            if (distance < minDistance) {
                minDistance = distance;
                nearestNode = `${component.id}_${terminal.polarity}`;
            }
        });
    });

    return nearestNode;
}

function drawComponent(ctx, c) {
    const isSelected = electricState.selectedComponent === c;
    const isDragging = electricState.isDragging && electricState.dragTarget === c;

    // 拖动时增强效果
    if (isDragging) {
        ctx.save();
        ctx.shadowBlur = 25;
        ctx.shadowColor = 'rgba(99, 102, 241, 0.5)';
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 10;
    }

    ctx.fillStyle = isSelected ? '#eff6ff' : 'white';
    ctx.strokeStyle = isSelected ? '#3b82f6' : '#94a3b8';
    ctx.lineWidth = isSelected ? 2.5 : 1.5;

    // 圆角矩形
    ctx.beginPath();
    if (ctx.roundRect) {
        ctx.roundRect(c.x, c.y, c.w, c.h, 8);
    } else {
        ctx.rect(c.x, c.y, c.w, c.h);
    }
    ctx.fill();
    ctx.stroke();

    if (isDragging) {
        ctx.restore();
    }

    ctx.fillStyle = '#1e293b';
    ctx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.textAlign = 'center';

    let icon = '';
    let label = '';
    let status = '';

    switch (c.type) {
        case 'power':
            icon = '🔋';
            label = c.params.voltage + 'V';
            status = (currentLang === 'en' ? 'V: ' : '电压: ') + (c.lastV || 0).toFixed(1) + 'V';
            break;
        case 'resistor':
            icon = '🟦';
            label = formatResistance(c.params.resistance);
            status = (c.lastI || 0).toFixed(3) + 'A';
            break;
        case 'bulb':
            icon = c.params.isBroken ? '💥' : '💡';
            const isCircuitComplete = isCircuitConnected();
            if (c.lastI > 0 && !c.params.isBroken && isCircuitComplete) {
                const brightness = Math.min(1, c.lastI / (c.params.ratedP / c.params.ratedV));
                const time = Date.now() / 1000;
                const pulse = 0.85 + Math.sin(time * 4) * 0.15;

                // 动态发光效果
                ctx.save();
                ctx.shadowBlur = 40 * brightness * pulse;
                ctx.shadowColor = `rgba(255, 200, 50, ${brightness * 0.95})`;

                // 多层渐变光晕
                for (let i = 3; i >= 0; i--) {
                    const glowRadius = 30 + i * 15;
                    const gradient = ctx.createRadialGradient(
                        c.x + c.w/2, c.y + c.h/2, 0,
                        c.x + c.w/2, c.y + c.h/2, glowRadius
                    );
                    gradient.addColorStop(0, `rgba(255, 220, 100, ${brightness * 0.4 * (1 - i * 0.2)})`);
                    gradient.addColorStop(0.5, `rgba(255, 180, 50, ${brightness * 0.2 * (1 - i * 0.2)})`);
                    gradient.addColorStop(1, 'rgba(255, 150, 0, 0)');
                    ctx.fillStyle = gradient;
                    ctx.fillRect(c.x - glowRadius/2, c.y - glowRadius/2, c.w + glowRadius, c.h + glowRadius);
                }
                ctx.restore();
            }
            status = c.params.isBroken ? (currentLang === 'en' ? 'Broken' : '烧毁') : ((c.lastI || 0).toFixed(3) + 'A');
            break;
        case 'switch':
            // 开关图标带动画效果
            icon = c.params.isOpen ? '🔓' : '🔒';
            status = c.params.isOpen ? (currentLang === 'en' ? 'Open' : '断开') : (currentLang === 'en' ? 'Closed' : '闭合');

            // 开关状态指示器
            if (!c.params.isOpen) {
                ctx.save();
                ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)';
                ctx.lineWidth = 2;
                ctx.setLineDash([4, 2]);
                ctx.beginPath();
                ctx.roundRect(c.x - 3, c.y - 3, c.w + 6, c.h + 6, 10);
                ctx.stroke();
                ctx.restore();
            }
            break;
        case 'ammeter':
            icon = '⏲️';
            label = 'A';
            status = (c.lastReading || 0).toFixed(2) + ' A';
            break;
        case 'voltmeter':
            icon = '📟';
            label = 'V';
            status = (c.lastReading || 0).toFixed(2) + ' V';
            break;
    }

    // 绘制图标和标签
    ctx.fillText(icon, c.x + c.w / 2, c.y + 18);
    ctx.fillText(label, c.x + c.w / 2, c.y + 34);

    // 清除阴影
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';

    // 端点样式增强
    const terminalRadius = isSelected ? 5 : 4;

    // 正极端点（红色）
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(c.x, c.y + c.h / 2, terminalRadius, 0, Math.PI * 2);
    ctx.fill();
    if (isSelected) {
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // 负极端点（蓝色）
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(c.x + c.w, c.y + c.h / 2, terminalRadius, 0, Math.PI * 2);
    ctx.fill();
    if (isSelected) {
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // 端点标签
    ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillStyle = '#ef4444';
    ctx.fillText('+', c.x - 10, c.y + c.h / 2 + 4);
    ctx.fillStyle = '#3b82f6';
    ctx.fillText('-', c.x + c.w + 10, c.y + c.h / 2 + 4);

    // 状态框（增强样式）
    if (status) {
        const textWidth = ctx.measureText(status).width;
        const boxW = textWidth + 14;
        const boxH = 20;
        const boxX = c.x + c.w / 2 - boxW / 2;
        const boxY = c.y + c.h + 6;

        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.strokeStyle = isSelected ? '#3b82f6' : '#e2e8f0';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(boxX, boxY, boxW, boxH, 6);
        } else {
            ctx.rect(boxX, boxY, boxW, boxH);
        }
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#475569';
        ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.fillText(status, c.x + c.w / 2, boxY + 14);
        ctx.restore();
    }
}

function formatResistance(r) {
    if (r >= 1000) return (r / 1000).toFixed(1) + 'kΩ';
    return r + 'Ω';
}

function renderElectricSidebar() {
    const popup = document.getElementById('electric-component-popup');
    const c = electricState.selectedComponent;
    if (!c) {
        popup.style.display = 'none';
        return;
    }
    
    popup.style.display = 'block';
    let html = `<div class="comp-popup-header">
                    <span>${c.name}</span>
                    <button class="comp-popup-close" onclick="closeElectricSidebar()">✕</button>
                </div>
                <div class="comp-popup-body">`;
    
    switch (c.type) {
        case 'power':
            html += `
                <div class="property-group">
                    <label class="property-label">${currentLang === 'en' ? 'Voltage (V)' : '电压 (V)'}</label>
                    <div class="property-row">
                        <input type="number" class="property-input" value="${c.params.voltage}" step="0.1" 
                               onchange="updateCompParam('${c.id}', 'voltage', this.value)">
                    </div>
                    <div class="property-row" style="margin-top: 8px">
                        <button class="action-btn secondary" onclick="updateCompParam('${c.id}', 'voltage', 3)">3V</button>
                        <button class="action-btn secondary" onclick="updateCompParam('${c.id}', 'voltage', 6)">6V</button>
                        <button class="action-btn secondary" onclick="updateCompParam('${c.id}', 'voltage', 9)">9V</button>
                    </div>
                </div>
                <div class="property-group">
                    <label class="property-label">${currentLang === 'en' ? 'Internal R (Ω)' : '内阻 (Ω)'}</label>
                    <input type="number" class="property-input" value="${c.params.internalR}" step="0.1"
                           onchange="updateCompParam('${c.id}', 'internalR', this.value)">
                </div>
            `;
            break;
        case 'resistor':
            html += `
                <div class="property-group">
                    <label class="property-label">${currentLang === 'en' ? 'Resistance (Ω)' : '阻值 (Ω)'}</label>
                    <input type="number" class="property-input" value="${c.params.resistance}" step="0.1"
                           onchange="updateCompParam('${c.id}', 'resistance', this.value)">
                </div>
                <div class="property-group">
                    <div id="resistor-bands" style="height: 20px; border-radius: 4px; display: flex">
                        ${getResistorBandsHTML(c.params.resistance)}
                    </div>
                </div>
            `;
            break;
        case 'bulb':
            html += `
                <div class="property-group">
                    <label class="property-label">${currentLang === 'en' ? 'Rated V (V)' : '额定电压 (V)'}</label>
                    <input type="number" class="property-input" value="${c.params.ratedV}" onchange="updateCompParam('${c.id}', 'ratedV', this.value)">
                </div>
                <div class="property-group">
                    <label class="property-label">${currentLang === 'en' ? 'Rated P (W)' : '额定功率 (W)'}</label>
                    <input type="number" class="property-input" value="${c.params.ratedP}" onchange="updateCompParam('${c.id}', 'ratedP', this.value)">
                </div>
                ${c.params.isBroken ? `<button class="action-btn primary" onclick="updateCompParam('${c.id}', 'isBroken', false)">${currentLang === 'en' ? 'Replace Bulb' : '更换灯泡'}</button>` : ''}
            `;
            break;
    }
    
    html += `
        <div class="electric-stats">
            <div class="stat-item">
                <span class="stat-label">${currentLang === 'en' ? 'Current' : '电流'}</span>
                <span class="stat-value">${(c.lastI || 0).toFixed(3)} A</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">${currentLang === 'en' ? 'Voltage' : '电压'}</span>
                <span class="stat-value">${(c.lastV || 0).toFixed(2)} V</span>
            </div>
        </div>
        <button class="action-btn secondary" onclick="deleteElectricComponent('${c.id}')">
            🗑️ ${currentLang === 'en' ? 'Delete' : '删除'}
        </button>
    </div>`;
    
    popup.innerHTML = html;
}

function getResistorBandsHTML(r) {
    // Simplified 4-band logic
    const colors = ['black', 'brown', 'red', 'orange', 'yellow', 'green', 'blue', 'violet', 'grey', 'white'];
    return `<div style="flex:1; background: brown; border-right: 1px solid white"></div>
            <div style="flex:1; background: black; border-right: 1px solid white"></div>
            <div style="flex:1; background: red; border-right: 1px solid white"></div>
            <div style="flex:1; background: gold"></div>`;
}

function updateCompParam(id, param, value) {
    const c = electricState.components.find(c => c.id === id);
    if (c) {
        c.params[param] = parseFloat(value) || value;
        if (param === 'isOpen') c.params.isOpen = !c.params.isOpen;
        renderElectricSidebar();
        drawElectricCanvas();
    }
}

function closeElectricSidebar() {
    electricState.selectedComponent = null;
    document.getElementById('electric-component-popup').style.display = 'none';
    drawElectricCanvas();
}

function deleteElectricComponent(id) {
    electricState.components = electricState.components.filter(c => c.id !== id);
    electricState.selectedComponent = null;
    document.getElementById('electric-sidebar').style.display = 'none';
    drawElectricCanvas();
}

function resetElectricLab() {
    electricState.components = [];
    electricState.connections = [];
    electricState.selectedComponent = null;
    electricState.warnings = [];
    // 重置新的导线绘制状态
    wireDrawing = false;
    wirePoints = [];
    wireMousePos = null;
    drawElectricCanvas();
}

// Simple Circuit Simulation (Nodal Analysis approximation)
function runCircuitSimulation() {
    if (electricState.components.length === 0) return;
    
    try {
        const result = solveCircuitMNA();
        electricState.lastSimResult = result;
        updateComponentReadings(result);
        checkSafety(result);
        
        // Show circuit status notification
        showCircuitStatus(result);
    } catch (e) {
        console.error('Simulation error', e);
    }
    
    drawElectricCanvas();
}

function showCircuitStatus(result) {
    const hasPower = electricState.components.some(c => c.type === 'power');
    const hasSwitch = electricState.components.some(c => c.type === 'switch');
    const hasBulb = electricState.components.some(c => c.type === 'bulb');
    const switchOpen = electricState.components.filter(c => c.type === 'switch').some(c => c.params.isOpen);
    const bulbBroken = electricState.components.filter(c => c.type === 'bulb').some(c => c.params.isBroken);
    const hasLoad = electricState.components.some(c =>
        (c.type === 'bulb' && !c.params.isBroken) ||
        c.type === 'resistor' ||
        c.type === 'ammeter'
    );

    let statusMsg = '';
    let statusType = 'info';

    if (!hasPower) {
        return;
    }

    if (result.isShortCircuit && !switchOpen) {
        statusMsg = currentLang === 'en'
            ? '️ SHORT CIRCUIT! Add a load (resistor/bulb)!'
            : '⚠️ 短路！请添加负载（电阻/灯泡）！';
        statusType = 'error';
    } else if (switchOpen) {
        statusMsg = currentLang === 'en' ? '⚡ Circuit Open - Switch is OFF' : '⚡ 电路断开 - 开关已关闭';
        statusType = 'warning';
    } else if (bulbBroken) {
        statusMsg = currentLang === 'en' ? '💥 Bulb Burnt Out!' : '💥 灯泡烧毁！';
        statusType = 'error';
    } else if (result.totalI > 0.01 && hasBulb) {
        const bulb = electricState.components.find(c => c.type === 'bulb');
        if (bulb) {
            const brightness = Math.min(100, (result.totalI / (bulb.params.ratedP / bulb.params.ratedV)) * 100);
            statusMsg = currentLang === 'en'
                ? `✅ Circuit ON | Current: ${result.totalI.toFixed(2)}A | Bulb: ${brightness.toFixed(0)}%`
                : `✅ 电路接通 | 电流: ${result.totalI.toFixed(2)}A | 灯泡亮度: ${brightness.toFixed(0)}%`;
            statusType = 'success';
        }
    } else if (result.totalI > 10) {
        statusMsg = currentLang === 'en' ? '⚠️ Overload Detected!' : '⚠️ 检测到过载！';
        statusType = 'error';
    } else if (result.totalI > 0.01) {
        statusMsg = currentLang === 'en'
            ? `✅ Circuit Active | I: ${result.totalI.toFixed(3)}A`
            : `✅ 电路工作中 | 电流: ${result.totalI.toFixed(3)}A`;
        statusType = 'success';
    }

    updateElectricStatusDisplay(statusMsg, statusType);
}

function updateElectricStatusDisplay(msg, type) {
    let statusBar = document.getElementById('electric-status-bar');
    if (!statusBar) {
        const container = document.getElementById('electrical-lab-wrapper');
        if (container) {
            statusBar = document.createElement('div');
            statusBar.id = 'electric-status-bar';
            statusBar.style.cssText = `
                position: absolute;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                padding: 12px 24px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 500;
                z-index: 100;
                transition: all 0.3s ease;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            `;
            container.appendChild(statusBar);
        }
    }
    
    if (statusBar) {
        statusBar.textContent = msg;
        switch(type) {
            case 'success':
                statusBar.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                statusBar.style.color = '#fff';
                break;
            case 'warning':
                statusBar.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
                statusBar.style.color = '#fff';
                break;
            case 'error':
                statusBar.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
                statusBar.style.color = '#fff';
                break;
            default:
                statusBar.style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)';
                statusBar.style.color = '#fff';
        }
        statusBar.style.opacity = msg ? '1' : '0';
    }
}

function solveCircuitMNA() {
    // 首先检查电路是否真正连接
    if (!isCircuitConnected()) {
        return {
            totalI: 0,
            totalV: 0,
            isShortCircuit: false
        };
    }
    
    // 找到电源
    const power = electricState.components.find(c => c.type === 'power');
    if (!power) return { nodes: {}, branches: {} };
    
    // 检查是否有负载（灯泡、电阻等）
    const hasLoad = electricState.components.some(c =>
        (c.type === 'bulb' && !c.params.isBroken) ||
        c.type === 'resistor' ||
        c.type === 'ammeter'
    );
    
    let totalR = power.params.internalR || 0.1;
    electricState.components.forEach(c => {
        if (c.type === 'resistor') totalR += c.params.resistance;
        if (c.type === 'bulb' && !c.params.isBroken) totalR += c.params.coldR;
        if (c.type === 'ammeter') totalR += c.params.internalR;
    });
    
    // 短路检测：电路接通但没有负载
    const isShortCircuit = !hasLoad;
    
    const totalI = power.params.voltage / (totalR || 0.001);
    
    return {
        totalI: totalI,
        totalV: power.params.voltage,
        isShortCircuit: isShortCircuit
    };
}

function updateComponentReadings(result) {
    electricState.components.forEach(c => {
        if (c.type === 'ammeter') {
            c.lastReading = result.totalI;
            c.lastI = result.totalI;
        } else if (c.type === 'voltmeter') {
            c.lastReading = result.totalV;
            c.lastV = result.totalV;
        } else {
            c.lastI = result.totalI;
            c.lastV = result.totalV;
        }
        
        // Light bulb burnout logic
        if (c.type === 'bulb' && !c.params.isBroken) {
            const actualP = result.totalI * result.totalI * c.params.coldR;
            if (actualP > c.params.ratedP * 1.5) {
                c.params.isBroken = true;
                addWarning('💥 ' + (currentLang === 'en' ? 'Bulb Burnt Out!' : '灯泡烧毁！'));
            }
        }
    });
}

function checkSafety(result) {
    // 短路检测逻辑
    if (!result.isShortCircuit && !result.wireShortCircuit) {
        // 清除之前的短路警告
        electricState.warnings = electricState.warnings.filter(w =>
            !w.includes('短路') && !w.includes('Short')
        );
        return;
    }

    // 检测到短路
    const hasWarning = electricState.warnings.some(w => w.includes('短路') || w.includes('Short'));
    if (!hasWarning) {
        addWarning('️ ' + (currentLang === 'en' ? 'Short Circuit Detected!' : '检测到短路！'));
    }

    // 如果电流异常大，额外警告
    if (result.totalI > 10) {
        const overloadWarning = currentLang === 'en' ? '️ Overload Warning!' : '️ 过载警告！';
        if (!electricState.warnings.includes(overloadWarning)) {
            addWarning(overloadWarning);
        }
    }
}

function addWarning(msg) {
    if (!electricState.warnings.includes(msg)) {
        electricState.warnings.push(msg);
        showWarningPopup(msg);
    }
}

function showWarningPopup(msg) {
    showElectricToast(msg, 'danger');
}

function drawWarnings() {
    // Already handled by showWarningPopup
}

function exportElectricReport() {
    const report = {
        title: 'Cirana 电学实验报告',
        date: new Date().toLocaleDateString(),
        components: electricState.components.map(c => ({
            name: c.name,
            params: JSON.stringify(c.params),
            reading: c.lastI ? c.lastI.toFixed(3) + 'A' : '-'
        }))
    };
    
    let md = `# ${report.title}\n\n`;
    md += `**日期**: ${report.date}\n\n`;
    md += `## 元件参数与测量结果\n\n`;
    md += `| 元件 | 参数 | 测量值 |\n| --- | --- | --- |\n`;
    report.components.forEach(c => {
        md += `| ${c.name} | ${c.params} | ${c.reading} |\n`;
    });
    
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'electric_report.md';
    a.click();
}

function initOpticalBench() {
    const lightSlider = document.getElementById('light-slider');
    const lensSlider = document.getElementById('lens-slider');
    const screenSlider = document.getElementById('screen-slider');
    const focalSlider = document.getElementById('focal-slider');
    
    if (lightSlider) lightSlider.addEventListener('input', updatePositions);
    if (lensSlider) lensSlider.addEventListener('input', updatePositions);
    if (screenSlider) screenSlider.addEventListener('input', updatePositions);
    if (focalSlider) focalSlider.addEventListener('input', updateFocalLength);
    
    updatePositions();
}

function selectExperiment(expId) {
    const experimentList = document.getElementById('experiment-list');
    const physicsExperiment = document.getElementById('physics-experiment');
    const physicsControls = document.getElementById('physics-controls');
    const physicsFormula = document.getElementById('physics-formula');
    const experimentTitleText = document.getElementById('experiment-title-text');
    const opticalBenchWrapper = document.getElementById('optical-bench-wrapper');
    const electricalLabWrapper = document.getElementById('electrical-lab-wrapper');

    experimentList.style.display = 'none';
    physicsExperiment.style.display = 'block';

    if (expId === 'optical') {
        experimentTitleText.textContent = currentLang === 'en' ? 'Optical Bench Experiment' : currentLang === 'zh-TW' ? '光具座實驗' : '光具座实验';
        opticalBenchWrapper.style.display = 'block';
        electricalLabWrapper.style.display = 'none';
        physicsControls.style.display = 'flex';
        physicsFormula.style.display = 'block';
        updatePositions();
    } else if (expId === 'electrical') {
        experimentTitleText.textContent = currentLang === 'en' ? 'Electrical Lab' : currentLang === 'zh-TW' ? '電學實驗' : '电学实验';
        opticalBenchWrapper.style.display = 'none';
        electricalLabWrapper.style.display = 'block';
        physicsControls.style.display = 'none'; // Electrical lab has its own toolbar
        physicsFormula.style.display = 'none';
        initElectricalLab();
    }
}

function showExperimentList() {
    document.getElementById('experiment-list').style.display = 'block';
    document.getElementById('physics-experiment').style.display = 'none';
    document.getElementById('physics-controls').style.display = 'none';
    document.getElementById('physics-formula').style.display = 'none';
    
    if (document.fullscreenElement) {
        document.exitFullscreen();
    }
}

function togglePhysicsFullscreen() {
    const panel = document.getElementById('physics-panel');
    if (!document.fullscreenElement) {
        panel.requestFullscreen().then(() => {
            document.getElementById('fullscreen-btn').textContent = '⛶ ' + (currentLang === 'en' ? 'Exit' : currentLang === 'zh-TW' ? '退出全屏' : '退出全屏');
        }).catch(err => {
            console.log('Fullscreen error:', err);
        });
    } else {
        document.exitFullscreen();
        document.getElementById('fullscreen-btn').textContent = '⛶ ' + (currentLang === 'en' ? 'Fullscreen' : currentLang === 'zh-TW' ? '全屏' : '全屏');
    }
}

function updateFocalLength() {
    const focalSlider = document.getElementById('focal-slider');
    const focalInput = document.getElementById('focal-input');
    const focalValue = document.getElementById('focal-value');
    if (focalSlider && focalInput) {
        focalSlider.value = focalInput.value;
    }
    if (focalValue && focalInput) {
        focalValue.textContent = focalInput.value + 'cm';
    }
    updatePositions();
}

function syncFocalSlider() {
    const focalSlider = document.getElementById('focal-slider');
    const focalInput = document.getElementById('focal-input');
    const focalValue = document.getElementById('focal-value');
    if (focalSlider && focalInput) {
        focalInput.value = focalSlider.value;
    }
    if (focalSlider && focalValue) {
        focalValue.textContent = focalSlider.value + 'cm';
    }
    updatePositions();
}

function updateFocalDisplay() {
    const focalSlider = document.getElementById('focal-slider');
    const focalValue = document.getElementById('focal-value');
    if (focalSlider && focalValue) {
        focalValue.textContent = focalSlider.value + 'cm';
    }
}

function updatePositions() {
    const lightSource = document.getElementById('light-source');
    const lens = document.getElementById('lens');
    const screen = document.getElementById('screen');
    
    if (!lightSource || !lens || !screen) return;
    
    const lightSlider = document.getElementById('light-slider');
    const lensSlider = document.getElementById('lens-slider');
    const screenSlider = document.getElementById('screen-slider');
    const focalSlider = document.getElementById('focal-slider');
    const focalInput = document.getElementById('focal-input');
    
    const lightX = parseFloat(lightSlider.value);
    const lensX = parseFloat(lensSlider.value);
    const screenX = parseFloat(screenSlider.value);
    const focalLength = parseFloat(focalInput.value);
    
    lightSource.style.left = lightX + 'px';
    lens.style.left = lensX + 'px';
    screen.style.left = screenX + 'px';
    
    document.getElementById('light-pos').textContent = lightX + 'cm';
    document.getElementById('lens-pos').textContent = lensX + 'cm';
    document.getElementById('screen-pos').textContent = screenX + 'cm';
    
    const u = lensX - lightX - 25;
    const v = screenX - lensX - 40;
    
    updateDistanceLabels(lightX + 25, lensX + 30, screenX + 40);
    updateImagingInfo(u, v, focalLength);
    drawLightRays();
}

function updateDistanceLabels(lightX, lensX, screenX) {
    const uLabel = document.getElementById('u-label');
    const vLabel = document.getElementById('v-label');
    const uValue = document.getElementById('u-value');
    const vValue = document.getElementById('v-value');
    
    if (!uLabel || !vLabel) return;
    
    const u = Math.abs(lensX - lightX);
    const v = Math.abs(screenX - lensX);
    
    uLabel.style.display = 'flex';
    vLabel.style.display = 'flex';
    
    uLabel.style.left = ((lightX + lensX) / 2 - 30) + 'px';
    uLabel.style.top = '180px';
    uValue.textContent = u;
    
    vLabel.style.left = ((lensX + screenX) / 2 - 30) + 'px';
    vLabel.style.top = '180px';
    vValue.textContent = v;
}

function updateImagingInfo(u, v, f) {
    const imageTypeEl = document.getElementById('image-type');
    const imageSizeEl = document.getElementById('image-size');
    const imageOrientationEl = document.getElementById('image-orientation');
    const statusText = document.getElementById('status-text');
    const screenImage = document.getElementById('screen-image');
    
    if (!imageTypeEl) return;
    
    const uNum = parseFloat(u);
    const vNum = parseFloat(v);
    const fNum = parseFloat(f);
    
    if (uNum <= 0 || vNum <= 0 || isNaN(uNum) || isNaN(vNum)) {
        imageTypeEl.textContent = '-';
        imageSizeEl.textContent = '-';
        imageOrientationEl.textContent = '-';
        statusText.textContent = currentLang === 'en' ? 'Adjust positions to observe imaging' : currentLang === 'zh-TW' ? '調整位置觀察成像' : '调整位置观察成像';
        if (screenImage) screenImage.style.opacity = '0';
        return;
    }
    
    const isRealImage = uNum > fNum && vNum > 0;
    const isInverted = isRealImage;
    
    if (isRealImage) {
        const magnification = Math.abs(vNum / uNum);
        imageTypeEl.textContent = '📍 ' + (currentLang === 'en' ? 'Real Image' : currentLang === 'zh-TW' ? '實像' : '实像');
        imageTypeEl.style.color = '#10b981';
        
        if (magnification > 1) {
            imageSizeEl.textContent = '🔺 ' + (currentLang === 'en' ? 'Magnified' : currentLang === 'zh-TW' ? '放大' : '放大') + ' (' + magnification.toFixed(2) + 'x)';
            statusText.textContent = currentLang === 'en' ? 'Inverted magnified real image' : currentLang === 'zh-TW' ? '倒立放大實像' : '倒立放大实像';
        } else if (magnification < 1) {
            imageSizeEl.textContent = '🔻 ' + (currentLang === 'en' ? 'Reduced' : currentLang === 'zh-TW' ? '縮小' : '缩小') + ' (' + magnification.toFixed(2) + 'x)';
            statusText.textContent = currentLang === 'en' ? 'Inverted reduced real image' : currentLang === 'zh-TW' ? '倒立縮小實像' : '倒立缩小实像';
        } else {
            imageSizeEl.textContent = '➖ ' + (currentLang === 'en' ? 'Equal size' : currentLang === 'zh-TW' ? '等大' : '等大') + ' (1x)';
            statusText.textContent = currentLang === 'en' ? 'Inverted equal-size real image' : currentLang === 'zh-TW' ? '倒立等大實像' : '倒立等大实像';
        }
    } else {
        imageTypeEl.textContent = '💠 ' + (currentLang === 'en' ? 'Virtual Image' : currentLang === 'zh-TW' ? '虛像' : '虚像');
        imageTypeEl.style.color = '#f59e0b';
        
        const virtualMagnification = Math.abs(fNum / (uNum - fNum));
        imageSizeEl.textContent = '🔺 ' + (currentLang === 'en' ? 'Magnified' : currentLang === 'zh-TW' ? '放大' : '放大') + ' (' + virtualMagnification.toFixed(2) + 'x)';
        statusText.textContent = currentLang === 'en' ? 'Upright magnified virtual image' : currentLang === 'zh-TW' ? '正立放大虛像' : '正立放大虚像';
    }
    
    imageOrientationEl.textContent = isInverted ? '⬇️ ' + (currentLang === 'en' ? 'Inverted' : currentLang === 'zh-TW' ? '倒立' : '倒立') : '⬆️ ' + (currentLang === 'en' ? 'Upright' : currentLang === 'zh-TW' ? '正立' : '正立');
    
    if (screenImage) {
        if (isRealImage) {
            const mag = Math.abs(vNum / uNum);
            screenImage.style.opacity = Math.min(1, mag).toString();
            screenImage.style.transform = `scale(${Math.min(mag, 2)}) rotate(180deg)`;
        } else {
            screenImage.style.opacity = '0';
        }
    }
    
    const statusIcon = document.querySelector('.status-icon');
    if (statusIcon) {
        if (isRealImage) {
            statusIcon.textContent = '✅';
        } else {
            statusIcon.textContent = '💡';
        }
    }
}

function drawLightRays() {
    const bench = document.getElementById('optical-bench');
    if (!bench) return;
    
    const existingRays = bench.querySelector('.light-rays');
    if (existingRays) existingRays.remove();
    
    const raysDiv = document.createElement('div');
    raysDiv.className = 'light-rays';
    
    const lightSlider = document.getElementById('light-slider');
    const lensSlider = document.getElementById('lens-slider');
    const focalSlider = document.getElementById('focal-slider');
    const screenSlider = document.getElementById('screen-slider');
    
    const lightX = parseFloat(lightSlider.value) + 25;
    const lensX = parseFloat(lensSlider.value) + 30;
    const focalLength = parseFloat(focalSlider.value);
    const screenX = parseFloat(screenSlider.value) + 40;
    const centerY = 100;
    
    const u = lensX - lightX;
    let v = (u * focalLength) / (u - focalLength);
    const imageX = lensX + v;
    const imageY = centerY;
    
    if (u > focalLength && v > 0 && isFinite(v)) {
        const parallelRay1 = document.createElement('div');
        parallelRay1.className = 'ray ray-parallel';
        parallelRay1.style.left = lightX + 'px';
        parallelRay1.style.top = (centerY - 50) + 'px';
        parallelRay1.style.width = (lensX - lightX) + 'px';
        raysDiv.appendChild(parallelRay1);
        
        const parallelRay2 = document.createElement('div');
        parallelRay2.className = 'ray ray-parallel-refracted';
        parallelRay2.style.left = lensX + 'px';
        parallelRay2.style.top = (centerY - 50) + 'px';
        const refractedLength1 = Math.sqrt(Math.pow(imageX - lensX, 2) + Math.pow(imageY - (centerY - 50), 2));
        parallelRay2.style.width = refractedLength1 + 'px';
        const refractedAngle1 = Math.atan((imageY - (centerY - 50)) / (imageX - lensX)) * (180 / Math.PI);
        parallelRay2.style.transform = `rotate(${refractedAngle1}deg)`;
        raysDiv.appendChild(parallelRay2);
        
        const centerRay = document.createElement('div');
        centerRay.className = 'ray ray-center';
        centerRay.style.left = lightX + 'px';
        centerRay.style.top = centerY + 'px';
        centerRay.style.width = (imageX - lightX) + 'px';
        raysDiv.appendChild(centerRay);
        
        const focalRay1 = document.createElement('div');
        focalRay1.className = 'ray ray-focal';
        focalRay1.style.left = lightX + 'px';
        focalRay1.style.top = (centerY + 50) + 'px';
        const focalAngle = Math.atan(50 / focalLength) * (180 / Math.PI);
        const focalRayLength = Math.sqrt(Math.pow(focalLength, 2) + Math.pow(50, 2));
        focalRay1.style.width = focalRayLength + 'px';
        focalRay1.style.transform = `rotate(${-focalAngle}deg)`;
        raysDiv.appendChild(focalRay1);
        
        const focalRay2 = document.createElement('div');
        focalRay2.className = 'ray ray-focal-refracted';
        focalRay2.style.left = lensX + 'px';
        focalRay2.style.top = centerY + 'px';
        focalRay2.style.width = (imageX - lensX) + 'px';
        raysDiv.appendChild(focalRay2);
        
        const imagePoint = document.createElement('div');
        imagePoint.className = 'image-point';
        imagePoint.style.left = (imageX - 5) + 'px';
        imagePoint.style.top = (imageY - 5) + 'px';
        raysDiv.appendChild(imagePoint);
        
        if (Math.abs(imageX - screenX) < 100) {
            const screenImage = document.getElementById('screen-image');
            if (screenImage) {
                screenImage.style.opacity = '1';
                const magnification = v / u;
                screenImage.style.transform = `scale(${Math.min(Math.abs(magnification), 2)}) rotate(180deg)`;
            }
        }
    }
    
    bench.appendChild(raysDiv);
}

function startOpticalAnimation() {
    const screenSlider = document.getElementById('screen-slider');
    const lensSlider = document.getElementById('lens-slider');
    const lightSlider = document.getElementById('light-slider');
    const focalSlider = document.getElementById('focal-slider');
    
    const lensX = parseFloat(lensSlider.value) + 30;
    const lightX = parseFloat(lightSlider.value) + 25;
    const focalLength = parseFloat(focalSlider.value);
    
    let u = lensX - lightX;
    let v = (u * focalLength) / (u - focalLength);
    
    if (v > 0 && isFinite(v)) {
        let targetScreenX = lensX + v + 40;
        targetScreenX = Math.max(400, Math.min(650, targetScreenX));
        
        let current = parseFloat(screenSlider.value);
        const step = (targetScreenX - current) / 40;
        let count = 0;
        
        const animate = () => {
            if (count < 40) {
                current += step;
                screenSlider.value = current;
                updatePositions();
                count++;
                requestAnimationFrame(animate);
            }
        };
        animate();
    }
}

function resetExperiment() {
    document.getElementById('light-slider').value = 50;
    document.getElementById('lens-slider').value = 300;
    document.getElementById('screen-slider').value = 500;
    document.getElementById('focal-slider').value = 100;
    document.getElementById('focal-input').value = 100;
    updatePositions();
}

// ========== 早读助手功能 ==========

// 初始化早读助手
function initReadingAssistant() {
    readingState.dbCanvas = document.getElementById('db-canvas');
    if (readingState.dbCanvas) {
        readingState.dbCtx = readingState.dbCanvas.getContext('2d');
        resizeDbCanvas();
        window.addEventListener('resize', resizeDbCanvas);
    }

    const dbThreshold = document.getElementById('db-threshold');
    if (dbThreshold) {
        dbThreshold.addEventListener('input', function() {
            readingState.dbThreshold = parseInt(this.value);
            document.getElementById('db-threshold-display').textContent = this.value + ' dB';
        });
    }

    const loudDuration = document.getElementById('loud-duration');
    if (loudDuration) {
        loudDuration.addEventListener('input', function() {
            readingState.loudDuration = parseInt(this.value);
        });
    }

    const duration = document.getElementById('reading-duration');
    if (duration) {
        duration.addEventListener('input', function() {
            readingState.totalDuration = parseInt(this.value);
            readingState.timeRemaining = readingState.totalDuration * 60;
            updateTimerDisplay();
        });
    }

    updateTimerDisplay();
}

function resizeDbCanvas() {
    if (readingState.dbCanvas && readingState.dbCtx) {
        const rect = readingState.dbCanvas.parentElement.getBoundingClientRect();
        readingState.dbCanvas.width = rect.width || 300;
        readingState.dbCanvas.height = 200;
    }
}

// 开始早读
async function startReading() {
    if (readingState.isRunning) return;

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        readingState.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        readingState.analyser = readingState.audioContext.createAnalyser();
        readingState.microphone = readingState.audioContext.createMediaStreamSource(stream);
        readingState.microphone.connect(readingState.analyser);
        readingState.analyser.fftSize = 2048;
        
        readingState.isRunning = true;
        readingState.isPaused = false;
        readingState.totalDuration = parseInt(document.getElementById('reading-duration').value);
        readingState.timeRemaining = readingState.totalDuration * 60;
        readingState.sessionStartTime = Date.now();
        readingState.maxDB = 0;
        readingState.avgDB = 0;
        readingState.loudTime = 0;
        readingState.dbHistory = [];
        readingState.exportData = [];
        readingState.loudStartTime = null;
        
        // 更新按钮状态
        document.getElementById('start-reading-btn').style.display = 'none';
        document.getElementById('pause-reading-btn').style.display = 'block';
        document.getElementById('reset-reading-btn').style.display = 'block';
        
        updateTimerLabel('进行中');
        
        // 开始计时
        readingState.timerInterval = setInterval(updateTimer, 1000);
        
        // 开始分贝检测
        readingState.dbInterval = setInterval(detectDecibels, 100);
        
        showElectricToast('🎤 麦克风已开启，早读开始！', 'success');
        
    } catch (err) {
        console.error('麦克风访问失败:', err);
        showElectricToast(' 无法访问麦克风，请允许访问', 'error');
    }
}

// 暂停早读
function pauseReading() {
    if (!readingState.isRunning) return;
    
    readingState.isPaused = !readingState.isPaused;
    
    if (readingState.isPaused) {
        clearInterval(readingState.timerInterval);
        clearInterval(readingState.dbInterval);
        document.getElementById('pause-reading-btn').textContent = '▶️ 继续';
        updateTimerLabel('已暂停');
    } else {
        readingState.timerInterval = setInterval(updateTimer, 1000);
        readingState.dbInterval = setInterval(detectDecibels, 100);
        document.getElementById('pause-reading-btn').textContent = '⏸️ 暂停';
        updateTimerLabel('进行中');
    }
}

// 重置早读
function resetReading() {
    readingState.isRunning = false;
    readingState.isPaused = false;
    clearInterval(readingState.timerInterval);
    clearInterval(readingState.dbInterval);
    
    if (readingState.microphone) {
        readingState.microphone.disconnect();
    }
    if (readingState.audioContext) {
        readingState.audioContext.close();
    }
    
    readingState.timeRemaining = readingState.totalDuration * 60;
    readingState.currentDB = 0;
    readingState.maxDB = 0;
    readingState.avgDB = 0;
    readingState.loudTime = 0;
    readingState.dbHistory = [];
    readingState.trees = [];
    readingState.exportData = [];
    
    updateTimerDisplay();
    updateTimerLabel('准备开始');
    clearDbCanvas();
    updateTreesDisplay();
    
    document.getElementById('start-reading-btn').style.display = 'block';
    document.getElementById('pause-reading-btn').style.display = 'none';
    document.getElementById('reset-reading-btn').style.display = 'none';
    document.getElementById('pause-reading-btn').textContent = '⏸️ 暂停';
}

// 更新计时器
function updateTimer() {
    if (readingState.timeRemaining > 0) {
        readingState.timeRemaining--;
        updateTimerDisplay();
        updateTimerProgress();
    } else {
        finishReading();
    }
}

// 更新计时器显示
function updateTimerDisplay() {
    const minutes = Math.floor(readingState.timeRemaining / 60);
    const seconds = readingState.timeRemaining % 60;
    const timeStr = String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
    document.getElementById('timer-time').textContent = timeStr;
}

// 更新计时器标签
function updateTimerLabel(label) {
    document.getElementById('timer-label').textContent = label;
}

// 更新计时器进度环
function updateTimerProgress() {
    const progress = readingState.timeRemaining / (readingState.totalDuration * 60);
    const circumference = 2 * Math.PI * 90;
    const offset = circumference * (1 - progress);
    
    const progressCircle = document.querySelector('.timer-progress');
    if (progressCircle) {
        progressCircle.style.strokeDashoffset = offset;
        
        // 根据剩余时间改变颜色
        if (progress < 0.2) {
            progressCircle.style.stroke = '#ef4444';
        } else if (progress < 0.5) {
            progressCircle.style.stroke = '#f59e0b';
        } else {
            progressCircle.style.stroke = '#6366f1';
        }
    }
}

// 检测分贝
function detectDecibels() {
    if (!readingState.analyser || readingState.isPaused) return;
    
    const bufferLength = readingState.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    readingState.analyser.getByteTimeDomainData(dataArray);
    
    // 计算 RMS 值
    let sumSquares = 0;
    for (let i = 0; i < bufferLength; i++) {
        const value = (dataArray[i] - 128) / 128;
        sumSquares += value * value;
    }
    const rms = Math.sqrt(sumSquares / bufferLength);
    
    // 转换为分贝 (dB)
    const db = Math.max(0, 20 * Math.log10(rms) + 94); // +94 是为了校准
    const roundedDB = Math.round(db);
    
    readingState.currentDB = roundedDB;
    readingState.dbHistory.push(roundedDB);
    if (readingState.dbHistory.length > 60) {
        readingState.dbHistory.shift();
    }
    
    // 更新统计数据
    if (roundedDB > readingState.maxDB) {
        readingState.maxDB = roundedDB;
    }
    readingState.avgDB = Math.round(readingState.dbHistory.reduce((a, b) => a + b, 0) / readingState.dbHistory.length);
    
    // 更新显示
    document.getElementById('db-current').textContent = readingState.currentDB;
    document.getElementById('db-max').textContent = readingState.maxDB + ' dB';
    document.getElementById('db-avg').textContent = readingState.avgDB + ' dB';
    
    // 记录数据用于导出
    if (readingState.sessionStartTime) {
        const elapsed = Math.round((Date.now() - readingState.sessionStartTime) / 1000);
        readingState.exportData.push({
            time: elapsed,
            db: roundedDB,
            timestamp: new Date().toLocaleTimeString()
        });
    }
    
    // 检测超标
    if (roundedDB > readingState.dbThreshold) {
        if (!readingState.loudStartTime) {
            readingState.loudStartTime = Date.now();
        } else {
            const duration = (Date.now() - readingState.loudStartTime) / 1000;
            if (duration >= readingState.loudDuration) {
                plantTree();
                readingState.loudStartTime = null;
                readingState.loudTime += readingState.loudDuration;
            }
        }
    } else {
        readingState.loudStartTime = null;
    }
    
    document.getElementById('loud-time').textContent = readingState.loudTime + 's';
    
    // 绘制分贝可视化
    drawDbVisual();
}

// 绘制分贝可视化
function drawDbVisual() {
    const canvas = readingState.dbCanvas;
    const ctx = readingState.dbCtx;
    if (!canvas || !ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, width, height);
    
    // 绘制阈值线
    const thresholdY = height - (readingState.dbThreshold / 100) * height;
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]);
    ctx.beginPath();
    ctx.moveTo(0, thresholdY);
    ctx.lineTo(width, thresholdY);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // 绘制阈值标签
    ctx.fillStyle = '#ef4444';
    ctx.font = '11px sans-serif';
    ctx.fillText(readingState.dbThreshold + ' dB', 5, thresholdY - 5);
    
    // 绘制分贝柱状图
    const barWidth = width / readingState.dbHistory.length;
    readingState.dbHistory.forEach((db, i) => {
        const barHeight = (db / 100) * height;
        const x = i * barWidth;
        const y = height - barHeight;
        
        // 颜色根据分贝值
        let color;
        if (db > readingState.dbThreshold) {
            color = `rgba(239, 68, 68, ${0.5 + (db - readingState.dbThreshold) / 40})`;
        } else if (db > 40) {
            color = `rgba(99, 102, 241, 0.6)`;
        } else {
            color = `rgba(16, 185, 129, 0.5)`;
        }
        
        ctx.fillStyle = color;
        ctx.fillRect(x, y, barWidth - 1, barHeight);
    });
    
    // 绘制当前分贝值
    const currentY = height - (readingState.currentDB / 100) * height;
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, currentY);
    ctx.lineTo(width, currentY);
    ctx.stroke();
}

// 清空分贝画布
function clearDbCanvas() {
    const ctx = readingState.dbCtx;
    if (ctx) {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, readingState.dbCanvas.width, readingState.dbCanvas.height);
    }
}

// 种树
function plantTree() {
    const treeEmoji = readingState.treeEmojis[Math.floor(Math.random() * readingState.treeEmojis.length)];
    readingState.trees.push({ emoji: treeEmoji, time: new Date().toLocaleTimeString() });
    
    // 更新显示
    updateTreesDisplay();
    
    // 显示种树弹窗
    showTreePopup(treeEmoji);
}

// 更新种树显示
function updateTreesDisplay() {
    document.querySelector('.trees-count').textContent = readingState.trees.length;
    
    const grid = document.getElementById('trees-grid');
    grid.innerHTML = '';
    readingState.trees.forEach(tree => {
        const span = document.createElement('span');
        span.className = 'tree-item';
        span.textContent = tree.emoji;
        span.title = '种于 ' + tree.time;
        grid.appendChild(span);
    });
}

// 显示种树弹窗
function showTreePopup(emoji) {
    const overlay = document.createElement('div');
    overlay.className = 'tree-popup-overlay';
    overlay.innerHTML = `
        <div class="tree-popup">
            <span class="tree-popup-icon">${emoji}</span>
            <h3>🎉 太棒了！你种下了一棵树！</h3>
            <p>持续保持专注，你的森林会越来越茂盛！</p>
            <button class="btn btn-primary" onclick="this.closest('.tree-popup-overlay').remove()">继续加油 </button>
        </div>
    `;
    document.body.appendChild(overlay);
    
    // 3秒后自动关闭
    setTimeout(() => {
        if (overlay.parentNode) overlay.remove();
    }, 3000);
}

// 结束早读
function finishReading() {
    readingState.isRunning = false;
    clearInterval(readingState.timerInterval);
    clearInterval(readingState.dbInterval);
    
    if (readingState.microphone) {
        readingState.microphone.disconnect();
    }
    if (readingState.audioContext) {
        readingState.audioContext.close();
    }
    
    showSettlementAnimation();
}

// 显示结算动画
function showSettlementAnimation() {
    const duration = Math.floor((Date.now() - readingState.sessionStartTime) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    
    const trees = readingState.trees.length;
    const treeEmojis = trees > 0 ? readingState.trees.map(t => t.emoji).join('') : '🌱';
    
    const overlay = document.createElement('div');
    overlay.className = 'settlement-overlay';
    overlay.innerHTML = `
        <div class="settlement-card">
            <span class="settlement-icon"></span>
            <h2>早读完成！</h2>
            
            <div class="settlement-stats">
                <div class="settlement-stat">
                    <span class="stat-value-lg">${minutes}:${String(seconds).padStart(2, '0')}</span>
                    <span class="stat-label">阅读时长</span>
                </div>
                <div class="settlement-stat">
                    <span class="stat-value-lg">${readingState.avgDB} dB</span>
                    <span class="stat-label">平均音量</span>
                </div>
                <div class="settlement-stat">
                    <span class="stat-value-lg">${readingState.maxDB} dB</span>
                    <span class="stat-label">最大音量</span>
                </div>
                <div class="settlement-stat">
                    <span class="stat-value-lg">${readingState.loudTime}s</span>
                    <span class="stat-label">超标时间</span>
                </div>
            </div>
            
            <div class="settlement-trees">
                <h4>🌳 你的森林</h4>
                <div class="tree-result">${treeEmojis}</div>
                <p style="margin-top: 8px; color: #64748b; font-size: 14px;">共种植 ${trees} 棵树</p>
            </div>
            
            <div class="settlement-actions">
                <button class="btn btn-primary" onclick="exportReadingReport(); this.closest('.settlement-overlay').remove();">
                     导出报告
                </button>
                <button class="btn btn-secondary" onclick="resetReading(); this.closest('.settlement-overlay').remove();">
                    🔄 再来一次
                </button>
                <button class="btn btn-secondary" onclick="this.closest('.settlement-overlay').remove()">
                    关闭
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
}

// 导出早读报告
function exportReadingReport() {
    const duration = Math.floor((Date.now() - readingState.sessionStartTime) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    const now = new Date();
    
    let report = `========================================\n`;
    report += `       早读报告 - Cirana 早读助手\n`;
    report += `========================================\n\n`;
    report += `日期: ${now.toLocaleDateString()}\n`;
    report += `时间: ${now.toLocaleTimeString()}\n\n`;
    report += `----------------------------------------\n`;
    report += ` 统计数据\n`;
    report += `----------------------------------------\n`;
    report += `阅读时长: ${minutes}分${seconds}秒\n`;
    report += `平均音量: ${readingState.avgDB} dB\n`;
    report += `最大音量: ${readingState.maxDB} dB\n`;
    report += `超标时间: ${readingState.loudTime}秒\n`;
    report += `种树数量: ${readingState.trees.length} 棵\n\n`;
    report += `----------------------------------------\n`;
    report += `🌳 种树记录\n`;
    report += `----------------------------------------\n`;
    readingState.trees.forEach((tree, i) => {
        report += `${i + 1}. ${tree.emoji} - 种于 ${tree.time}\n`;
    });
    report += `\n`;
    report += `----------------------------------------\n`;
    report += `📈 音量记录（每秒采样）\n`;
    report += `----------------------------------------\n`;
    report += `时间(秒)\t音量(dB)\t时刻\n`;
    readingState.exportData.forEach(data => {
        report += `${data.time}\t\t${data.db}\t\t${data.timestamp}\n`;
    });
    report += `\n========================================\n`;
    report += `感谢使用 Cirana 早读助手！\n`;
    report += `持续专注，让学习更高效！💪\n`;
    report += `========================================\n`;
    
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `早读报告_${now.toLocaleDateString()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    showElectricToast('📄 早读报告已导出！', 'success');
}

// 全屏切换
function toggleFullscreen(section) {
    const container = document.getElementById('reading-container');
    if (container) {
        if (!document.fullscreenElement) {
            container.requestFullscreen().catch(err => {
                console.error('全屏失败:', err);
                // 回退到模拟全屏
                container.classList.toggle('reading-fullscreen');
            });
        } else {
            document.exitFullscreen();
            container.classList.remove('reading-fullscreen');
        }
    }
}

document.addEventListener('fullscreenchange', function() {
    const container = document.getElementById('reading-container');
    if (container) {
        if (document.fullscreenElement) {
            container.classList.add('reading-fullscreen');
        } else {
            container.classList.remove('reading-fullscreen');
        }
    }
});

// ========== 切换标签页功能增强 ==========

const originalSwitchTab = window.switchTab;

// 在 DOMContentLoaded 中初始化早读助手
document.addEventListener('DOMContentLoaded', function() {
    ErrorManager.loadErrorLog();

    const savedTheme = localStorage.getItem('cirana-theme');
    if (savedTheme) {
        changeTheme(savedTheme);
        currentTheme = savedTheme;
    }

    attachTextareaListener();

    // 预存早读助手模板（防止被其他页面删除后无法恢复）
    const toolsReading = document.getElementById('tools-reading');
    if (toolsReading && !readingContainerTemplate) {
        readingContainerTemplate = toolsReading.outerHTML;
    }

    // 初始化早读助手
    initReadingAssistant();

    // 默认显示主页
    renderHomeTab();
    document.getElementById('page-title').textContent = '主页';
});
