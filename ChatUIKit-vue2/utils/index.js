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
    if (!a.lastMessage?.time) {
      return 0
    }
    return a.lastMessage?.time > b.lastMessage?.time ? -1 : 1
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

// 渲染文本（解析表情）
export const renderTxt = (txt) => {
  if (txt === undefined || txt === null) {
    return []
  }
  
  // 简化版表情处理
  const emojiMap = {}
  
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
    if (match[1] in emojiMap) {
      rnTxt.push({
        type: 'emoji',
        value: emojiMap[match[1]],
        alt: match[1]
      })
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
  switch (message?.type) {
    case 'txt':
      lastMsg = message?.msg || ''
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

// 按名称分组
export function groupByName(name) {
  let initial = '#'
  if (!name || typeof name !== 'string') {
    return initial
  }
  if (checkCharacter(name.substring(0, 1)) === 'en') {
    initial = name.substring(0, 1).toUpperCase()
  } else if (checkCharacter(name.substring(0, 1)) === 'zh') {
    // 简化为返回第一个字符
    initial = name.substring(0, 1)
  } else {
    initial = '#'
  }
  return initial
}
