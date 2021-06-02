// generateFont.js
var path = require('path');
var fs = require('fs');
var util = require('util');

var md5 = require('md5');
var Fontmin = require('fontmin');

const FONTS = ['FZZJ-YLKSJW', 'FZBaiZHXTJW']; // 我们只允许a,b,c,d这4种字体
const FONT_DIR = path.join(__dirname, 'font'); // 存放原始字体的目录
const SUB_FONT_DIR = path.join(__dirname, 'subfont'); // 子集字体的目录

// 判断文件是否存在
const access = (filename) =>
  new Promise((resolve) => fs.access(filename, (error) => resolve(!error)));
const writeFile = util.promisify(fs.writeFile);

exports.generateFont = async(ctx) => {
  // font 表示指定字体，text 表示提取的文本
  const {font} = ctx.query;
  let {text} = ctx.query;
  if (!font || !FONTS.includes(font) || !text) {
    ctx.status = 400;
    ctx.body = '参数错误';
    return;
  }
  // 对text去重以及排序
  text = Array.from(new Set(text))
              .sort()
              .join('');
  /**
   * 对text作md5来标记是否已经缓存
   * 缓存存在返回缓存
   * 缓存不存在创建缓存
   */
  const textMd5 = md5(text);
  const cacheFile = `${SUB_FONT_DIR}/${font}_${textMd5}.ttf`;
  const exist = await access(cacheFile);
  if (!exist) {
    const fontmin = new Fontmin()
      .src(`${FONT_DIR}/${font}.ttf`)
      .use(Fontmin.glyph({text}));
    const content = await new Promise((resolve, reject) => {
      fontmin.run((error, files) => {
        if (error) {
          return reject(error);
        }
        return resolve(files[ 0 ].contents);
      });
    });
    await writeFile(cacheFile, content);
  }
  ctx.body = fs.createReadStream(cacheFile);
};