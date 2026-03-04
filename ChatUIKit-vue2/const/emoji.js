// 表情列表 - 使用 static 目录绝对路径
const emojiBaseUrl = '/static/emojis/'

// 表情列表
export const emojiList = [
  { alt: '[哈哈]', url: emojiBaseUrl + 'U+1F600.png' },
  { alt: '[笑]', url: emojiBaseUrl + 'U+1F604.png' },
  { alt: '[眨眼]', url: emojiBaseUrl + 'U+1F609.png' },
  { alt: '[惊讶]', url: emojiBaseUrl + 'U+1F62E.png' },
  { alt: '[搞怪]', url: emojiBaseUrl + 'U+1F92A.png' },
  { alt: '[酷]', url: emojiBaseUrl + 'U+1F60E.png' },
  { alt: '[困]', url: emojiBaseUrl + 'U+1F971.png' },
  { alt: '[眩晕]', url: emojiBaseUrl + 'U+1F974.png' },
  { alt: '[微笑]', url: emojiBaseUrl + 'U+263A.png' },
  { alt: '[难过]', url: emojiBaseUrl + 'U+1F641.png' },
  { alt: '[大哭]', url: emojiBaseUrl + 'U+1F62D.png' },
  { alt: '[无表情]', url: emojiBaseUrl + 'U+1F610.png' },
  { alt: '[天使]', url: emojiBaseUrl + 'U+1F607.png' },
  { alt: '[尴尬]', url: emojiBaseUrl + 'U+1F62C.png' },
  { alt: '[书呆子]', url: emojiBaseUrl + 'U+1F913.png' },
  { alt: '[脸红]', url: emojiBaseUrl + 'U+1F633.png' },
  { alt: '[庆祝]', url: emojiBaseUrl + 'U+1F973.png' },
  { alt: '[生气]', url: emojiBaseUrl + 'U+1F620.png' },
  { alt: '[翻白眼]', url: emojiBaseUrl + 'U+1F644.png' },
  { alt: '[闭嘴]', url: emojiBaseUrl + 'U+1F910.png' },
  { alt: '[哀求]', url: emojiBaseUrl + 'U+1F97A.png' },
  { alt: '[挑眉]', url: emojiBaseUrl + 'U+1F928.png' },
  { alt: '[疲惫]', url: emojiBaseUrl + 'U+1F62B.png' },
  { alt: '[生病]', url: emojiBaseUrl + 'U+1F637.png' },
  { alt: '[感冒]', url: emojiBaseUrl + 'U+1F912.png' },
  { alt: '[尖叫]', url: emojiBaseUrl + 'U+1F631.png' },
  { alt: '[飞吻]', url: emojiBaseUrl + 'U+1F618.png' },
  { alt: '[爱慕]', url: emojiBaseUrl + 'U+1F60D.png' },
  { alt: '[恶心]', url: emojiBaseUrl + 'U+1F922.png' },
  { alt: '[恶魔]', url: emojiBaseUrl + 'U+1F47F.png' },
  { alt: '[爆粗]', url: emojiBaseUrl + 'U+1F92C.png' },
  { alt: '[愤怒]', url: emojiBaseUrl + 'U+1F621.png' },
  { alt: '[赞]', url: emojiBaseUrl + 'U+1F44D.png' },
  { alt: '[踩]', url: emojiBaseUrl + 'U+1F44E.png' },
  { alt: '[鼓掌]', url: emojiBaseUrl + 'U+1F44F.png' },
  { alt: '[庆祝]', url: emojiBaseUrl + 'U+1F64C.png' },
  { alt: '[握手]', url: emojiBaseUrl + 'U+1F91D.png' },
  { alt: '[祈祷]', url: emojiBaseUrl + 'U+1F64F.png' },
  { alt: '[心]', url: emojiBaseUrl + 'U+2764.png' },
  { alt: '[心碎]', url: emojiBaseUrl + 'U+1F494.png' },
  { alt: '[双心]', url: emojiBaseUrl + 'U+1F495.png' },
  { alt: '[便便]', url: emojiBaseUrl + 'U+1F4A9.png' },
  { alt: '[嘴唇]', url: emojiBaseUrl + 'U+1F48B.png' },
  { alt: '[太阳]', url: emojiBaseUrl + 'U+2600.png' },
  { alt: '[月亮]', url: emojiBaseUrl + 'U+1F31C.png' },
  { alt: '[彩虹]', url: emojiBaseUrl + 'U+1F308.png' },
  { alt: '[星]', url: emojiBaseUrl + 'U+2B50.png' },
  { alt: '[亮星]', url: emojiBaseUrl + 'U+1F31F.png' },
  { alt: '[派对]', url: emojiBaseUrl + 'U+1F389.png' },
  { alt: '[花束]', url: emojiBaseUrl + 'U+1F490.png' },
  { alt: '[蛋糕]', url: emojiBaseUrl + 'U+1F382.png' },
  { alt: '[礼物]', url: emojiBaseUrl + 'U+1F381.png' }
]

// 表情映射
export const emojiAltMap = emojiList.reduce((map, item) => {
  map[item.alt] = item.url
  return map
}, {})

// 表情映射（反向）
export const emoji = {
  map: emojiList.reduce((map, item) => {
    map[item.alt] = item
    return map
  }, {}),
  urlMap: emojiAltMap
}
