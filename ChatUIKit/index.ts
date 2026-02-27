import {
  useAppUserStore,
  useChatStore,
  useConnStore,
  useContactStore,
  useConvStore,
  useGroupStore,
  useMessageStore,
  useConfigStore
} from "./stores";
import { ChatUIKitInitParams, FeatureConfig } from "./configType";
import { logger } from "./log";
import { setActivePinia, createPinia } from 'pinia'

// 全局 pinia 实例（用于在 init 之前延迟初始化）
let globalPinia: ReturnType<typeof createPinia> | null = null;

class ChatKIT {
  // Store instances (延迟初始化)
  private _connStore: ReturnType<typeof useConnStore> | null = null;
  private _chatStore: ReturnType<typeof useChatStore> | null = null;
  private _appUserStore: ReturnType<typeof useAppUserStore> | null = null;
  private _convStore: ReturnType<typeof useConvStore> | null = null;
  private _contactStore: ReturnType<typeof useContactStore> | null = null;
  private _groupStore: ReturnType<typeof useGroupStore> | null = null;
  private _messageStore: ReturnType<typeof useMessageStore> | null = null;
  private _configStore: ReturnType<typeof useConfigStore> | null = null;
  private _initialized = false;

  // 确保 pinia 已激活
  private ensurePinia() {
    if (!globalPinia) {
      globalPinia = createPinia();
      setActivePinia(globalPinia);
    }
  }

  // Getters - 延迟初始化 stores
  get connStore() {
    this.ensurePinia();
    if (!this._connStore) this._connStore = useConnStore();
    return this._connStore;
  }
  get chatStore() {
    this.ensurePinia();
    if (!this._chatStore) this._chatStore = useChatStore();
    return this._chatStore;
  }
  get appUserStore() {
    this.ensurePinia();
    if (!this._appUserStore) this._appUserStore = useAppUserStore();
    return this._appUserStore;
  }
  get convStore() {
    this.ensurePinia();
    if (!this._convStore) this._convStore = useConvStore();
    return this._convStore;
  }
  get contactStore() {
    this.ensurePinia();
    if (!this._contactStore) this._contactStore = useContactStore();
    return this._contactStore;
  }
  get groupStore() {
    this.ensurePinia();
    if (!this._groupStore) this._groupStore = useGroupStore();
    return this._groupStore;
  }
  get messageStore() {
    this.ensurePinia();
    if (!this._messageStore) this._messageStore = useMessageStore();
    return this._messageStore;
  }
  get configStore() {
    this.ensurePinia();
    if (!this._configStore) this._configStore = useConfigStore();
    return this._configStore;
  }

  constructor() {
    // 不要在构造函数中访问 store
  }

  // 初始化IM SDK
  public init(params: ChatUIKitInitParams) {
    this.ensurePinia();
    
    if (this._connStore?.conn) {
      return;
    }
    
    this.configStore.setThemeConfig(params.config.theme);
    this.connStore.setChatConn(params.chat);
    params.config.isDebug && logger.enableDebug();
    this._initialized = true;
  }

  /** 获取IM连接实例 */
  public getChatConn() {
    return this.connStore.getChatConn;
  }
  /** 获取UIKIT主题配置 */
  public getThemeConfig() {
    return this.configStore.getThemeConfig;
  }
  /** 获取UIKIT功能配置 */
  public getFeatureConfig() {
    return this.configStore.getFeatureConfig;
  }
  /** 隐藏UIKIT功能 */
  public hideFeature(features: Array<keyof FeatureConfig>) {
    this.configStore.hideFeature(features);
  }
  /** 在 onShow 生命周期检测IM链接是否有效*/
  public onShow() {
    try {
      // 如果IM是登录状态，则检测IM链接是否有效
      const conn = this.getChatConn();
      if (conn && conn.logout === false) {
        conn.onShow();
      }
    } catch (e) {
      // connStore 未初始化，忽略
    }
  }
  
  /** 获取全局 Pinia 实例（用于 app.use） */
  public getPinia() {
    this.ensurePinia();
    return globalPinia!;
  }
}

const ChatUIKit = new ChatKIT();

export { ChatUIKit, globalPinia };

export type { ChatKIT };
