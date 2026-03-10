// 工具函数集合

// 格式化日期
export const formatDate = function (date, fmt = '') {
  const o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds(),
    'q+': Math.floor((date.getMonth() + 3) / 3),
    S: date.getMilliseconds()
  }
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(
      RegExp.$1,
      (date.getFullYear() + '').substr(4 - RegExp.$1.length)
    )
  for (let k in o)
    if (new RegExp('(' + k + ')').test(fmt))
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)
      )
  return fmt
}

// 自动缩短时间显示
export const getTimeStringAutoShort = function (timestamp, mustIncludeTime) {
  let currentDate = new Date()
  let srcDate = new Date(parseInt(timestamp))

  let currentYear = currentDate.getFullYear()
  let currentMonth = currentDate.getMonth() + 1
  let currentDateD = currentDate.getDate()

  let srcYear = srcDate.getFullYear()
  let srcMonth = srcDate.getMonth() + 1
  let srcDateD = srcDate.getDate()

  let ret = ''
  let timeExtraStr = mustIncludeTime ? ' ' + formatDate(srcDate, 'hh:mm') : ''

  if (currentYear == srcYear) {
    let currentTimestamp = currentDate.getTime()
    let srcTimestamp = timestamp
    let deltaTime = currentTimestamp - srcTimestamp

    if (currentMonth == srcMonth && currentDateD == srcDateD) {
      if (deltaTime < 60 * 1000) ret = '刚刚'
      else ret = formatDate(srcDate, 'hh:mm')
    } else {
      ret = formatDate(srcDate, 'M/d') + timeExtraStr
    }
  } else {
    ret = formatDate(srcDate, 'yyyy/M/d') + timeExtraStr
  }

  return ret
}

// 平台检测
export const isWeb = () => {
  try {
    return uni.getSystemInfoSync().uniPlatform === 'web'
  } catch (e) {
    return false
  }
}

export const isWXProgram = () => {
  try {
    return uni.getSystemInfoSync().uniPlatform === 'mp-weixin'
  } catch (e) {
    return false
  }
}

export const isAndroid = () => {
  try {
    return uni.getSystemInfoSync().platform === 'android'
  } catch (e) {
    return false
  }
}

export const isIOS = () => {
  try {
    return uni.getSystemInfoSync().platform === 'ios'
  } catch (e) {
    return false
  }
}

// 深拷贝
export function deepClone(value) {
  if (value === null || typeof value !== 'object') {
    return value
  }

  if (value instanceof Date) {
    return new Date(value.getTime())
  }

  if (Array.isArray(value)) {
    return value.map((item) => deepClone(item))
  }

  if (value instanceof Map) {
    const clonedMap = new Map()
    value.forEach((v, k) => {
      clonedMap.set(deepClone(k), deepClone(v))
    })
    return clonedMap
  }

  if (value instanceof Set) {
    const clonedSet = new Set()
    value.forEach((v) => {
      clonedSet.add(deepClone(v))
    })
    return clonedSet
  }

  if (value instanceof Object) {
    const clonedObj = {}
    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(value[key])
      }
    }
    return clonedObj
  }

  return value
}

// 按置顶排序
export function sortByPinned(a, b) {
  if (a.isPinned && !b.isPinned) {
    return -1
  } else if (!a.isPinned && b.isPinned) {
    return 1
  } else if ((!a.isPinned && !b.isPinned) || (a.isPinned && b.isPinned)) {
    if (!(a.lastMessage && a.lastMessage.time)) {
      return 0
    }
    const timeA = a.lastMessage && a.lastMessage.time
      const timeB = b.lastMessage && b.lastMessage.time
      return timeA > timeB ? -1 : 1
  } else {
    return 0
  }
}

// 格式化文本消息中的表情
export function formatTextMessage(txt) {
  if (txt === undefined) {
    return ''
  }
  
  // 表情映射表
  const emojiAltMap = {
    '[微笑]': '😊',
    '[撇嘴]': '😒',
    '[色]': '😍',
    '[发呆]': '😳',
    '[得意]': '😎',
    '[流泪]': '😭',
    '[害羞]': '😳',
    '[闭嘴]': '🤐',
    '[睡]': '😴',
    '[大哭]': '😭',
    '[尴尬]': '😅',
    '[发怒]': '😡',
    '[调皮]': '😜',
    '[呲牙]': '😁',
    '[惊讶]': '😮',
    '[难过]': '😔',
    '[酷]': '😎',
    '[冷汗]': '😰',
    '[抓狂]': '😤',
    '[吐]': '🤮',
    '[偷笑]': '🤭',
    '[可爱]': '😊',
    '[白眼]': '🙄',
    '[傲慢]': '😏',
    '[饥饿]': '😋',
    '[困]': '😪',
    '[惊恐]': '😱',
    '[流汗]': '😓',
    '[憨笑]': '😄',
    '[大兵]': '💂',
    '[奋斗]': '💪',
    '[咒骂]': '🤬',
    '[疑问]': '❓',
    '[嘘]': '🤫',
    '[晕]': '😵',
    '[折磨]': '😫',
    '[衰]': '😞',
    '[骷髅]': '💀',
    '[敲打]': '👊',
    '[再见]': '👋',
    '[擦汗]': '😓',
    '[抠鼻]': '🤥',
    '[鼓掌]': '👏',
    '[糗大了]': '😳',
    '[坏笑]': '😏',
    '[左哼哼]': '😤',
    '[右哼哼]': '😤',
    '[哈欠]': '🥱',
    '[鄙视]': '😒',
    '[委屈]': '😣',
    '[快哭了]': '😢',
    '[阴险]': '😈',
    '[亲亲]': '😘',
    '[吓]': '😱',
    '[可怜]': '🥺',
    '[菜刀]': '🔪',
    '[西瓜]': '🍉',
    '[啤酒]': '🍺',
    '[篮球]': '🏀',
    '[乒乓]': '🏓',
    '[咖啡]': '☕',
    '[饭]': '🍚',
    '[猪头]': '🐷',
    '[玫瑰]': '🌹',
    '[凋谢]': '🥀',
    '[嘴唇]': '💋',
    '[爱心]': '❤️',
    '[心碎]': '💔',
    '[蛋糕]': '🎂',
    '[闪电]': '⚡',
    '[炸弹]': '💣',
    '[刀]': '🔪',
    '[足球]': '⚽',
    '[瓢虫]': '🐞',
    '[便便]': '💩',
    '[月亮]': '🌙',
    '[太阳]': '☀️',
    '[礼物]': '🎁',
    '[拥抱]': '🤗',
    '[强]': '👍',
    '[弱]': '👎',
    '[握手]': '🤝',
    '[胜利]': '✌️',
    '[抱拳]': '🙏',
    '[勾引]': '👉',
    '[拳头]': '✊',
    '[差劲]': '👎',
    '[爱你]': '🤟',
    '[NO]': '🙅',
    '[OK]': '👌',
    '[爱情]': '💑',
    '[飞吻]': '😘',
    '[跳跳]': '💃',
    '[发抖]': '😰',
    '[怄火]': '😡',
    '[转圈]': '💫',
    '[磕头]': '🙇',
    '[回头]': '🔙',
    '[跳绳]': '🏃',
    '[挥手]': '👋',
    '[激动]': '😆',
    '[街舞]': '💃',
    '[献吻]': '😘',
    '[左太极]': '☯️',
    '[右太极]': '☯️'
  }
  
  let rnTxt = ''
  let match = null
  const regex = /(\[.*?\])/g
  let start = 0
  let index = 0
  while ((match = regex.exec(txt))) {
    index = match.index
    if (index > start) {
      rnTxt += txt.substring(start, index)
    }
    if (match[1] in emojiAltMap) {
      rnTxt += emojiAltMap[match[1]]
    } else {
      rnTxt += match[1]
    }
    start = index + match[1].length
  }
  rnTxt += txt.substring(start, txt.length)
  return rnTxt
}

import { emojiAltMap } from '../const/emoji.js'

// 渲染文本（解析表情）
export const renderTxt = (txt) => {
  if (txt === undefined || txt === null) {
    return []
  }
  
  let rnTxt = []
  let match
  const regex = /(\[.*?\])/g
  let start = 0
  let index = 0
  while ((match = regex.exec(txt))) {
    index = match.index
    if (index > start) {
      rnTxt.push({
        type: 'text',
        value: txt.substring(start, index)
      })
    }
    // 检查是否匹配到表情
    if (match[1] in emojiAltMap) {
      const emojiChar = emojiAltMap[match[1]]
      // 获取表情图片 URL
      const { emoji } = require('../const/emoji.js')
      const emojiUrl = emoji.map[emojiChar]?.url
      if (emojiUrl) {
        rnTxt.push({
          type: 'emoji',
          value: emojiUrl,
          alt: match[1]
        })
      } else {
        rnTxt.push({
          type: 'text',
          value: match[1]
        })
      }
    } else {
      rnTxt.push({
        type: 'text',
        value: match[1]
      })
    }
    start = index + match[1].length
  }

  rnTxt.push({
    type: 'text',
    value: txt.substring(start, txt.length)
  })
  return rnTxt
}

// 数组分块
export function splitArrayIntoChunks(arr, chunkSize) {
  const result = []
  for (let i = 0; i < arr.length; i += chunkSize) {
    result.push(arr.slice(i, i + chunkSize))
  }
  return result
}

// 格式化消息预览
export const formatMessage = (message) => {
  let lastMsg = ''
  switch (message && message.type) {
    case 'txt':
      lastMsg = (message && message.msg) || ''
      break
    case 'img':
      lastMsg = '[图片]'
      break
    case 'audio':
      lastMsg = '[语音]'
      break
    case 'file':
      lastMsg = '[文件]'
      break
    case 'video':
      lastMsg = '[视频]'
      break
    case 'custom':
      if (message.customEvent === 'userCard') {
        lastMsg = '[名片]'
      } else {
        lastMsg = '[自定义]'
      }
      break
    case 'combine':
      lastMsg = '[聊天记录]'
      break
    default:
      lastMsg = '[未知消息]'
      break
  }
  return lastMsg
}

// 检查字符类型
export function checkCharacter(character) {
  const pattern = /[\u4E00-\u9FA5]/
  const isChinese = pattern.test(character)
  const isLetter = /^[a-zA-Z]$/.test(character)

  if (isChinese) {
    return 'zh'
  } else if (isLetter) {
    return 'en'
  } else {
    return 'unknown'
  }
}

/**
 * 防抖函数
 * @param {Function} fn - 要执行的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Function}
 */
export function debounce(fn, delay = 300) {
  let timer = null
  return function (...args) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

/**
 * 节流函数
 * @param {Function} fn - 要执行的函数
 * @param {number} interval - 间隔时间（毫秒）
 * @returns {Function}
 */
export function throttle(fn, interval = 300) {
  let lastTime = 0
  return function (...args) {
    const now = Date.now()
    if (now - lastTime >= interval) {
      lastTime = now
      fn.apply(this, args)
    }
  }
}

/**
 * 生成 UUID
 * @returns {string}
 */
export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * 生成消息 ID（短格式）
 * @returns {string}
 */
export function generateMessageId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

/**
 * 获取文件扩展名
 * @param {string} filename - 文件名
 * @returns {string}
 */
export function getFileExtension(filename) {
  if (!filename || typeof filename !== 'string') return ''
  const index = filename.lastIndexOf('.')
  return index === -1 ? '' : filename.substring(index + 1).toLowerCase()
}

/**
 * 获取文件图标类型
 * @param {string} filename - 文件名
 * @returns {string}
 */
export function getFileIconType(filename) {
  const ext = getFileExtension(filename)
  const iconMap = {
    image: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'],
    video: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'],
    audio: ['mp3', 'wav', 'wma', 'aac', 'flac', 'ogg'],
    word: ['doc', 'docx'],
    excel: ['xls', 'xlsx', 'csv'],
    ppt: ['ppt', 'pptx'],
    pdf: ['pdf'],
    zip: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'],
    code: ['js', 'ts', 'vue', 'html', 'css', 'json', 'xml', 'java', 'py', 'cpp', 'c', 'h', 'php', 'rb', 'go', 'rs']
  }
  
  for (const [type, extensions] of Object.entries(iconMap)) {
    if (extensions.includes(ext)) {
      return type
    }
  }
  return 'file'
}

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @param {number} decimals - 小数位数
 * @returns {string}
 */
export function formatFileSize(bytes, decimals = 2) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i]
}

/**
 * 截断文本（添加省略号）
 * @param {string} str - 原文本
 * @param {number} maxLength - 最大长度
 * @returns {string}
 */
export function truncateText(str, maxLength = 100) {
  if (!str || str.length <= maxLength) return str
  return str.substring(0, maxLength) + '...'
}

/**
 * 解析 URL 参数
 * @param {string} url - URL 字符串
 * @returns {Object}
 */
export function parseUrlParams(url) {
  const params = {}
  if (!url) return params
  const queryString = url.split('?')[1]
  if (!queryString) return params
  
  const pairs = queryString.split('&')
  for (const pair of pairs) {
    const [key, value] = pair.split('=')
    if (key) {
      params[decodeURIComponent(key)] = value ? decodeURIComponent(value) : ''
    }
  }
  return params
}

/**
 * 休眠/延迟函数
 * @param {number} ms - 毫秒数
 * @returns {Promise}
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 判断对象是否为空
 * @param {Object} obj
 * @returns {boolean}
 */
export function isEmptyObject(obj) {
  return Object.keys(obj).length === 0
}

/**
 * 数组去重（支持对象数组按字段去重）
 * @param {Array} arr - 数组
 * @param {string} key - 对象字段（可选）
 * @returns {Array}
 */
export function uniqueArray(arr, key) {
  if (!Array.isArray(arr)) return []
  if (!key) {
    return [...new Set(arr)]
  }
  const seen = new Set()
  return arr.filter(item => {
    const val = item[key]
    if (seen.has(val)) return false
    seen.add(val)
    return true
  })
}

/**
 * 获取图片宽高比
 * @param {string} url - 图片 URL
 * @returns {Promise<{width: number, height: number}>}
 */
export function getImageSize(url) {
  return new Promise((resolve, reject) => {
    uni.getImageInfo({
      src: url,
      success: (res) => {
        resolve({
          width: res.width,
          height: res.height,
          ratio: res.width / res.height
        })
      },
      fail: reject
    })
  })
}

/**
 * 安全获取嵌套对象属性
 * @param {Object} obj - 对象
 * @param {string} path - 路径，如 'a.b.c'
 * @param {*} defaultValue - 默认值
 * @returns {*}
 */
export function get(obj, path, defaultValue = undefined) {
  const keys = path.split('.')
  let result = obj
  for (const key of keys) {
    if (result == null || typeof result !== 'object') {
      return defaultValue
    }
    result = result[key]
  }
  return result !== undefined ? result : defaultValue
}

/**
 * 校验手机号（中国大陆）
 * @param {string} phone - 手机号
 * @returns {boolean}
 */
export function isValidPhone(phone) {
  return /^1[3-9]\d{9}$/.test(phone)
}

/**
 * 校验邮箱
 * @param {string} email - 邮箱
 * @returns {boolean}
 */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * 隐藏手机号中间四位
 * @param {string} phone - 手机号
 * @returns {string}
 */
export function maskPhone(phone) {
  if (!phone || phone.length !== 11) return phone
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

/**
 * 复制到剪贴板
 * @param {string} text - 要复制的文本
 * @returns {Promise<boolean>}
 */
export function copyToClipboard(text) {
  return new Promise((resolve) => {
    uni.setClipboardData({
      data: text,
      success: () => {
        uni.showToast({ title: '已复制', icon: 'success' })
        resolve(true)
      },
      fail: () => {
        uni.showToast({ title: '复制失败', icon: 'none' })
        resolve(false)
      }
    })
  })
}

/**
 * 保存图片到相册
 * @param {string} url - 图片 URL
 * @returns {Promise<boolean>}
 */
export function saveImageToAlbum(url) {
  return new Promise((resolve) => {
    uni.downloadFile({
      url,
      success: (res) => {
        if (res.statusCode === 200) {
          uni.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: () => {
              uni.showToast({ title: '保存成功', icon: 'success' })
              resolve(true)
            },
            fail: () => {
              uni.showToast({ title: '保存失败', icon: 'none' })
              resolve(false)
            }
          })
        } else {
          resolve(false)
        }
      },
      fail: () => {
        resolve(false)
      }
    })
  })
}

/**
 * 检查权限
 * @param {string} permission - 权限名，如 'camera', 'album', 'record'
 * @returns {Promise<boolean>}
 */
export function checkPermission(permission) {
  return new Promise((resolve) => {
    // 微信小程序权限检查
    // #ifdef MP-WEIXIN
    const scopeMap = {
      camera: 'scope.camera',
      album: 'scope.writePhotosAlbum',
      record: 'scope.record'
    }
    const scope = scopeMap[permission]
    if (!scope) {
      resolve(true)
      return
    }
    uni.getSetting({
      success: (res) => {
        if (res.authSetting[scope] === false) {
          // 用户拒绝过，需要引导开启
          uni.showModal({
            title: '需要权限',
            content: '请在设置中开启相关权限',
            success: (modalRes) => {
              if (modalRes.confirm) {
                uni.openSetting()
              }
            }
          })
          resolve(false)
        } else {
          resolve(true)
        }
      }
    })
    // #endif
    
    // #ifndef MP-WEIXIN
    resolve(true)
    // #endif
  })
}

import { pinyin } from 'pinyin-pro'

// 按名称分组（支持拼音首字母）
export function groupByName(name) {
  let initial = '#'
  if (!name || typeof name !== 'string') {
    return initial
  }
  const firstChar = name.substring(0, 1)
  if (checkCharacter(firstChar) === 'en') {
    initial = firstChar.toUpperCase()
  } else if (checkCharacter(firstChar) === 'zh') {
    // 使用 pinyin-pro 转换为拼音首字母
    try {
      const py = pinyin(firstChar, { toneType: 'none' })
      initial = py.charAt(0).toUpperCase()
    } catch (e) {
      initial = '#'
    }
  } else {
    initial = '#'
  }
  return initial
}
