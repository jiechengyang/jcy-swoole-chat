/**
 * 聊天核心js
 * @authors jiechengyang (2064320087@qq.com)
 * @date    2019-07-04 14:47:31
 * @version $Id$
 */
"use strict"

/* 重写window属性 */
window.onbeforeunload = onbeforeunload_handler;
window.onunload = onunload_handler;
$.fn.extend({
    insertAtCaret: function(a) {
        var c, d, e, b = $(this)[0];
        document.selection ? (this.focus(), sel = document.selection.createRange(), sel.text = a, this.focus()) : b.selectionStart || "0" == b.selectionStart ? (c = b.selectionStart, d = b.selectionEnd, e = b.scrollTop, b.value = b.value.substring(0, c) + a + b.value.substring(d, b.value.length), this.focus(), b.selectionStart = c + a.length, b.selectionEnd = c + a.length, b.scrollTop = e) : (this.value += a, this.focus())
    }
})

function onbeforeunload_handler() {
    var warning = "确认退出?";
    return warning;
}

function onunload_handler() {
    var warning = "确认退出?";
}

window.alert = layer.alert

/* 重写window属性 */
const cookie = {
    set: function(key, value, delay) { //设置cookie方法
        delay = delay || "1d";
        delay = delay.toLocaleLowerCase();
        var expireDate = new Date();
        var num = parseInt(delay);
        if (delay.indexOf("d") !== -1) {
            expireDate.setDate(expireDate.getDate() + num);
        } else if (delay.indexOf("h") !== -1) {
            expireDate.setHours(expireDate.getHours() + num);
        } else if (delay.indexOf("m") !== -1) {
            expireDate.setMinutes(expireDate.getMinutes() + num);
        } else if (delay.indexOf("s") !== -1) {
            expireDate.setSeconds(expireDate.getSeconds() + num);
        } else {
            expireDate.setDate(expireDate.getDate() + num);
        }

        if (typeof value == "object") {
            value = JSON.stringify(value);
        }
        value = escape(value);
        document.cookie = key + "=" + value + ";expires=" + expireDate.toGMTString();
    },
    get: function(key) { //获取cookie方法
        var objCookie = {};
        var cookie = document.cookie;
        var keyValueList = cookie.split(";");
        for (var index in keyValueList) {
            var keyValue = keyValueList[index].split("=");
            var k = keyValue[0].trim();
            var v = keyValue[1];
            v = unescape(v);
            v = this.decodeJson(v);
            objCookie[k] = v;
        }

        if (typeof key == "undefined") {
            return objCookie;
        }

        return objCookie[key];
    },
    delete: function(key) { //删除cookie方法
        if (typeof key == "undefined") {
            var cookieList = this.get();
            for (key in cookieList) {
                this.del(key);
            }
            return true;
        } else {
            if (this.get(key) == "undefined") {
                return false;
            } else {
                return this.set(key, '', "0s");
            }
        }
    },
    decodeJson: function(value) {
        //数组转成的对象字符串
        var regAryStr = /^\[[\s|\S]*\]$/;
        //对象转成的对象字符串
        var regObjStr = /^\{([\"\s|\S]+\"\:\"[\s|\S]*)+\"\}$/;
        if (regAryStr.test(value)) {
            return eval("(" + value + ")");
        }
        if (regObjStr.test(value)) {
            return JSON.parse(value);
        }
        return value;
    }
}

let utils = {
    trim: (x) => {
        return x.replace(/^\s+|\s+$/gm, '')
    },
    isNull: (value) => {
        if (value == null || value == '' || value == undefined || typeof value == "undefined" || value == "undefined")
            return true
        return false
    },
    displayRealTime: (domId) => {
        const obj = document.getElementById(domId)
        const nowDate = new Date()
        const year = nowDate.getFullYear()
        const month = nowDate.getMonth() + 1
        const date = nowDate.getDate()
        obj.innerHTML = year + '-' + month + '-' + date + ' ' + nowDate.toLocaleTimeString()
    },
    regCheck: {
        /*是否带有小数*/
        isDecimal: (strValue) => {
            const objRegExp = /^\d+\.\d+$/
            return objRegExp.test(strValue)
        },
        /*校验是否中文名称组成 */
        ischina: (str) => {
            const reg = /^[\u4E00-\u9FA5]{2,4}$/ /*定义验证表达式*/
            return reg.test(str) /*进行验证*/
        },

        /*校验是否全由8位数字组成 */
        isStudentNo: (str) => {
            const reg = /^[0-9]{8}$/ /*定义验证表达式*/
            return reg.test(str) /*进行验证*/
        },

        /*校验电话码格式 */
        isTelCode: (str) => {
            const reg = /^((0\d{2,3}-\d{7,8})|(1[3584]\d{9}))$/
            return reg.test(str)
        },

        /*校验邮件地址是否合法 */
        isEmail: (str) => {
            const reg = new RegExp("^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$")
            return reg.test(str)
        },
        /*校验用户名是否合法 */
        username: (username) => {
            // const reg =/(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6, 15}/
            const reg = /^[a-zA-Z0-9]{6,15}$/
            return reg.test(username)
        },
        /*校验密码是否合法 */
        pwd: (password) => {
            // const reg = /[\w]{6,}%$/g
            // 匹配'x'仅仅当'x'后面不跟着'y',这个叫做正向否定查找。
            // 例如，/\d+(?!\.)/匹配一个数字仅仅当这个数字后面没有跟小数点的时候。正则表达式/\d+(?!\.)/.exec("3.141")匹配‘141’而不是‘3.141’
            // (?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,}
            // 匹配'x'仅仅当'x'后面跟着'y'.这种叫做先行断言。
            // 例如，/Jack(?=Sprat)/会匹配到'Jack'仅仅当它后面跟着'Sprat'。/Jack(?=Sprat|Frost)/匹配‘Jack’仅仅当它后面跟着'Sprat'或者是‘Frost’。但是‘Sprat’和‘Frost’都不是匹配结果的一部分。
            // console.log("Jack(?=Sprat)", /Jack(?=Sprat)/g.test('Jack'))
            const reg = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{6,}$/g
            return reg.test(password)
        }
    },
    openPage: (type, title, content, others) => {
        type = type || 1
        title = title || false
        others = others || {
            area: '600px',
            shade: 0.8,
            id: 'LAY_layuipro', //设定一个id，防止重复弹出
            resize: false,
            // btn: ['火速围观', '残忍拒绝'],
            btnAlign: 'c',
            moveType: 1, //拖拽模式，0或者1,
            success: (layero) => {
                var btn = layero.find('.layui-layer-btn')
                btn.find('.layui-layer-btn0').attr({
                    href: 'http://www.layui.com/',
                    target: '_blank'
                })
            }
        }
        var params = $.extend({
            type: type,
            title: title,
            content: content,
            type: type,
        }, others)
        return layer.open(params)
    },
    onContextmenu: (id, opts) => {
        context.init({
            preventDoubleContext: false,
            // filter: function($obj) {}
        })

        context.attach(id, opts)
    },
    toPhpDate: (phpTimestamp) => {
        let str = parseInt(phpTimestamp) * 1000 //将php时间戳转化为整形并乘以1000
        return utils.toDate(str)
    },
    toDate: (time) => {
        let newDate = new Date(time)
        let year = newDate.getUTCFullYear() //取年份
        let month = newDate.getUTCMonth() + 1 //取月份
        let nowday = newDate.getUTCDate() //取天数
        let hours = newDate.getHours() //取小时
        let minutes = newDate.getMinutes() //取分钟
        let seconds = newDate.getSeconds() //取秒

        return year + "-" + month + "-" + nowday + " " + hours + ":" + minutes + ":" + seconds
    }
}

// 聊天工具栏js
let chatControl = {
    index_emoji: null,
    index_img: null,
    isBeforeUpload: null,
    isUploadStyle: 0,
    emoji: {
        "[最右]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/c8/lxhzuiyou_thumb.gif",
        "[泪流满面]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/64/lxhtongku_thumb.gif",
        "[江南style]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/67/gangnamstyle_thumb.gif",
        "[偷乐]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/fa/lxhtouxiao_thumb.gif",
        "[加油啊]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/03/lxhjiayou_thumb.gif",
        "[doge]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/b6/doge_thumb.gif",
        "[喵喵]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/4a/mm_thumb.gif",
        "[笑cry]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/34/xiaoku_thumb.gif",
        "[xkl转圈]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/f4/xklzhuanquan_thumb.gif",
        "[微笑]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/5c/huanglianwx_thumb.gif",
        "[嘻嘻]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/0b/tootha_thumb.gif",
        "[哈哈]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/6a/laugh.gif",
        "[可爱]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/14/tza_thumb.gif",
        "[可怜]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/af/kl_thumb.gif",
        "[挖鼻]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/0b/wabi_thumb.gif",
        "[吃惊]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/f4/cj_thumb.gif",
        "[害羞]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/6e/shamea_thumb.gif",
        "[挤眼]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/c3/zy_thumb.gif",
        "[闭嘴]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/29/bz_thumb.gif",
        "[鄙视]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/71/bs2_thumb.gif",
        "[爱你]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/6d/lovea_thumb.gif",
        "[泪]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/9d/sada_thumb.gif",
        "[偷笑]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/19/heia_thumb.gif",
        "[亲亲]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/8f/qq_thumb.gif",
        "[生病]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/b6/sb_thumb.gif",
        "[太开心]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/58/mb_thumb.gif",
        "[白眼]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/d9/landeln_thumb.gif",
        "[右哼哼]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/98/yhh_thumb.gif",
        "[左哼哼]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/6d/zhh_thumb.gif",
        "[嘘]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/a6/x_thumb.gif",
        "[衰]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/af/cry.gif",
        "[委屈]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/73/wq_thumb.gif",
        "[吐]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/9e/t_thumb.gif",
        "[哈欠]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/cc/haqianv2_thumb.gif",
        "[抱抱]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/27/bba_thumb.gif",
        "[怒]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/7c/angrya_thumb.gif",
        "[疑问]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/5c/yw_thumb.gif",
        "[馋嘴]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/a5/cza_thumb.gif",
        "[拜拜]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/70/88_thumb.gif",
        "[思考]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/e9/sk_thumb.gif",
        "[汗]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/24/sweata_thumb.gif",
        "[困]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/40/kunv2_thumb.gif",
        "[睡]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/96/huangliansj_thumb.gif",
        "[钱]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/90/money_thumb.gif",
        "[失望]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/0c/sw_thumb.gif",
        "[酷]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/40/cool_thumb.gif",
        "[色]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/20/huanglianse_thumb.gif",
        "[哼]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/49/hatea_thumb.gif",
        "[鼓掌]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/36/gza_thumb.gif",
        "[晕]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/d9/dizzya_thumb.gif",
        "[悲伤]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/1a/bs_thumb.gif",
        "[泪]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/9d/sada_thumb.gif",
        "[偷笑]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/19/heia_thumb.gif",
        "[抓狂]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/62/crazya_thumb.gif",
        "[黑线]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/91/h_thumb.gif",
        "[阴险]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/6d/yx_thumb.gif",
        "[怒骂]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/60/numav2_thumb.gif",
        "[互粉]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/89/hufen_thumb.gif",
        "[心]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/40/hearta_thumb.gif",
        "[伤心]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/ea/unheart.gif",
        "[猪头]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/58/pig.gif",
        "[熊猫]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/6e/panda_thumb.gif",
        "[兔子]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/81/rabbit_thumb.gif",
        "[ok]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/d6/ok_thumb.gif",
        "[耶]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/d9/ye_thumb.gif",
        "[good]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/d8/good_thumb.gif",
        "[no]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/ae/buyao_org.gif",
        "[赞]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/d0/z2_thumb.gif",
        "[来]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/40/come_thumb.gif",
        "[弱]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/d8/sad_thumb.gif",
        "[草泥马]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/7a/shenshou_thumb.gif",
        "[神马]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/60/horse2_thumb.gif",
        "[囧]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/15/j_thumb.gif",
        "[浮云]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/bc/fuyun_thumb.gif",
        "[给力]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/1e/geiliv2_thumb.gif",
        "[围观]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/f2/wg_thumb.gif",
        "[威武]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/70/vw_thumb.gif",
        "[奥特曼]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/bc/otm_thumb.gif",
        "[礼物]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/c4/liwu_thumb.gif",
        "[钟]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/d3/clock_thumb.gif",
        "[话筒]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/9f/huatongv2_thumb.gif",
        "[蜡烛]": "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/d9/lazhuv2_thumb.gif"
    },
    uploadPic: [],
    initEmoji: () => {
        const a = '<span class="item_emoji" id="emoji_[最右]" onclick="chatControl.clickEmojiItems(id);" title="[最右]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/c8/lxhzuiyou_thumb.gif"></span><span class="item_emoji" id="emoji_[泪流满面]" onclick="chatControl.clickEmojiItems(id);" title="[泪流满面]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/64/lxhtongku_thumb.gif"></span><span class="item_emoji" id="emoji_[江南style]" onclick="chatControl.clickEmojiItems(id);" title="[江南style]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/67/gangnamstyle_thumb.gif"></span><span class="item_emoji" id="emoji_[偷乐]" onclick="chatControl.clickEmojiItems(id);" title="[偷乐]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/fa/lxhtouxiao_thumb.gif"></span><span class="item_emoji" id="emoji_[加油啊]" onclick="chatControl.clickEmojiItems(id);" title="[加油啊]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/03/lxhjiayou_thumb.gif"></span><span class="item_emoji" id="emoji_[doge]" onclick="chatControl.clickEmojiItems(id);" title="[doge]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/b6/doge_thumb.gif"></span><span class="item_emoji" id="emoji_[喵喵]" onclick="chatControl.clickEmojiItems(id);" title="[喵喵]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/4a/mm_thumb.gif"></span><span class="item_emoji" id="emoji_[笑cry]" onclick="chatControl.clickEmojiItems(id);" title="[笑cry]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/34/xiaoku_thumb.gif"></span><span class="item_emoji" id="emoji_[xkl转圈]" onclick="chatControl.clickEmojiItems(id);" title="[xkl转圈]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/f4/xklzhuanquan_thumb.gif"></span><span class="item_emoji" id="emoji_[微笑]" onclick="chatControl.clickEmojiItems(id);" title="[微笑]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/5c/huanglianwx_thumb.gif"></span><span class="item_emoji" id="emoji_[嘻嘻]" onclick="chatControl.clickEmojiItems(id);" title="[嘻嘻]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/0b/tootha_thumb.gif"></span><span class="item_emoji" id="emoji_[哈哈]" onclick="chatControl.clickEmojiItems(id);" title="[哈哈]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/6a/laugh.gif"></span><span class="item_emoji" id="emoji_[可爱]" onclick="chatControl.clickEmojiItems(id);" title="[可爱]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/14/tza_thumb.gif"></span><span class="item_emoji" id="emoji_[可怜]" onclick="chatControl.clickEmojiItems(id);" title="[可怜]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/af/kl_thumb.gif"></span><span class="item_emoji" id="emoji_[挖鼻]" onclick="chatControl.clickEmojiItems(id);" title="[挖鼻]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/0b/wabi_thumb.gif"></span><span class="item_emoji" id="emoji_[吃惊]" onclick="chatControl.clickEmojiItems(id);" title="[吃惊]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/f4/cj_thumb.gif"></span><span class="item_emoji" id="emoji_[害羞]" onclick="chatControl.clickEmojiItems(id);" title="[害羞]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/6e/shamea_thumb.gif"></span><span class="item_emoji" id="emoji_[挤眼]" onclick="chatControl.clickEmojiItems(id);" title="[挤眼]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/c3/zy_thumb.gif"></span><span class="item_emoji" id="emoji_[闭嘴]" onclick="chatControl.clickEmojiItems(id);" title="[闭嘴]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/29/bz_thumb.gif"></span><span class="item_emoji" id="emoji_[鄙视]" onclick="chatControl.clickEmojiItems(id);" title="[鄙视]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/71/bs2_thumb.gif"></span><span class="item_emoji" id="emoji_[爱你]" onclick="chatControl.clickEmojiItems(id);" title="[爱你]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/6d/lovea_thumb.gif"></span><span class="item_emoji" id="emoji_[泪]" onclick="chatControl.clickEmojiItems(id);" title="[泪]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/9d/sada_thumb.gif"></span><span class="item_emoji" id="emoji_[偷笑]" onclick="chatControl.clickEmojiItems(id);" title="[偷笑]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/19/heia_thumb.gif"></span><span class="item_emoji" id="emoji_[亲亲]" onclick="chatControl.clickEmojiItems(id);" title="[亲亲]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/8f/qq_thumb.gif"></span><span class="item_emoji" id="emoji_[生病]" onclick="chatControl.clickEmojiItems(id);" title="[生病]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/b6/sb_thumb.gif"></span><span class="item_emoji" id="emoji_[太开心]" onclick="chatControl.clickEmojiItems(id);" title="[太开心]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/58/mb_thumb.gif"></span><span class="item_emoji" id="emoji_[白眼]" onclick="chatControl.clickEmojiItems(id);" title="[白眼]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/d9/landeln_thumb.gif"></span><span class="item_emoji" id="emoji_[右哼哼]" onclick="chatControl.clickEmojiItems(id);" title="[右哼哼]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/98/yhh_thumb.gif"></span><span class="item_emoji" id="emoji_[左哼哼]" onclick="chatControl.clickEmojiItems(id);" title="[左哼哼]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/6d/zhh_thumb.gif"></span><span class="item_emoji" id="emoji_[嘘]" onclick="chatControl.clickEmojiItems(id);" title="[嘘]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/a6/x_thumb.gif"></span><span class="item_emoji" id="emoji_[衰]" onclick="chatControl.clickEmojiItems(id);" title="[衰]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/af/cry.gif"></span><span class="item_emoji" id="emoji_[委屈]" onclick="chatControl.clickEmojiItems(id);" title="[委屈]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/73/wq_thumb.gif"></span><span class="item_emoji" id="emoji_[吐]" onclick="chatControl.clickEmojiItems(id);" title="[吐]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/9e/t_thumb.gif"></span><span class="item_emoji" id="emoji_[哈欠]" onclick="chatControl.clickEmojiItems(id);" title="[哈欠]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/cc/haqianv2_thumb.gif"></span><span class="item_emoji" id="emoji_[抱抱]" onclick="chatControl.clickEmojiItems(id);" title="[抱抱]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/27/bba_thumb.gif"></span><span class="item_emoji" id="emoji_[怒]" onclick="chatControl.clickEmojiItems(id);" title="[怒]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/7c/angrya_thumb.gif"></span><span class="item_emoji" id="emoji_[疑问]" onclick="chatControl.clickEmojiItems(id);" title="[疑问]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/5c/yw_thumb.gif"></span><span class="item_emoji" id="emoji_[馋嘴]" onclick="chatControl.clickEmojiItems(id);" title="[馋嘴]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/a5/cza_thumb.gif"></span><span class="item_emoji" id="emoji_[拜拜]" onclick="chatControl.clickEmojiItems(id);" title="[拜拜]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/70/88_thumb.gif"></span><span class="item_emoji" id="emoji_[思考]" onclick="chatControl.clickEmojiItems(id);" title="[思考]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/e9/sk_thumb.gif"></span><span class="item_emoji" id="emoji_[汗]" onclick="chatControl.clickEmojiItems(id);" title="[汗]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/24/sweata_thumb.gif"></span><span class="item_emoji" id="emoji_[困]" onclick="chatControl.clickEmojiItems(id);" title="[困]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/40/kunv2_thumb.gif"></span><span class="item_emoji" id="emoji_[睡]" onclick="chatControl.clickEmojiItems(id);" title="[睡]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/96/huangliansj_thumb.gif"></span><span class="item_emoji" id="emoji_[钱]" onclick="chatControl.clickEmojiItems(id);" title="[钱]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/90/money_thumb.gif"></span><span class="item_emoji" id="emoji_[失望]" onclick="chatControl.clickEmojiItems(id);" title="[失望]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/0c/sw_thumb.gif"></span><span class="item_emoji" id="emoji_[酷]" onclick="chatControl.clickEmojiItems(id);" title="[酷]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/40/cool_thumb.gif"></span><span class="item_emoji" id="emoji_[色]" onclick="chatControl.clickEmojiItems(id);" title="[色]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/20/huanglianse_thumb.gif"></span><span class="item_emoji" id="emoji_[哼]" onclick="chatControl.clickEmojiItems(id);" title="[哼]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/49/hatea_thumb.gif"></span><span class="item_emoji" id="emoji_[鼓掌]" onclick="chatControl.clickEmojiItems(id);" title="[鼓掌]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/36/gza_thumb.gif"></span><span class="item_emoji" id="emoji_[晕]" onclick="chatControl.clickEmojiItems(id);" title="[晕]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/d9/dizzya_thumb.gif"></span><span class="item_emoji" id="emoji_[悲伤]" onclick="chatControl.clickEmojiItems(id);" title="[悲伤]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/1a/bs_thumb.gif"></span><span class="item_emoji" id="emoji_[抓狂]" onclick="chatControl.clickEmojiItems(id);" title="[抓狂]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/62/crazya_thumb.gif"></span><span class="item_emoji" id="emoji_[黑线]" onclick="chatControl.clickEmojiItems(id);" title="[黑线]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/91/h_thumb.gif"></span><span class="item_emoji" id="emoji_[阴险]" onclick="chatControl.clickEmojiItems(id);" title="[阴险]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/6d/yx_thumb.gif"></span><span class="item_emoji" id="emoji_[怒骂]" onclick="chatControl.clickEmojiItems(id);" title="[怒骂]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/60/numav2_thumb.gif"></span><span class="item_emoji" id="emoji_[互粉]" onclick="chatControl.clickEmojiItems(id);" title="[互粉]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/89/hufen_thumb.gif"></span><span class="item_emoji" id="emoji_[心]" onclick="chatControl.clickEmojiItems(id);" title="[心]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/40/hearta_thumb.gif"></span><span class="item_emoji" id="emoji_[伤心]" onclick="chatControl.clickEmojiItems(id);" title="[伤心]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/ea/unheart.gif"></span><span class="item_emoji" id="emoji_[猪头]" onclick="chatControl.clickEmojiItems(id);" title="[猪头]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/58/pig.gif"></span><span class="item_emoji" id="emoji_[熊猫]" onclick="chatControl.clickEmojiItems(id);" title="[熊猫]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/6e/panda_thumb.gif"></span><span class="item_emoji" id="emoji_[兔子]" onclick="chatControl.clickEmojiItems(id);" title="[兔子]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/81/rabbit_thumb.gif"></span><span class="item_emoji" id="emoji_[ok]" onclick="chatControl.clickEmojiItems(id);" title="[ok]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/d6/ok_thumb.gif"></span><span class="item_emoji" id="emoji_[耶]" onclick="chatControl.clickEmojiItems(id);" title="[耶]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/d9/ye_thumb.gif"></span><span class="item_emoji" id="emoji_[good]" onclick="chatControl.clickEmojiItems(id);" title="[good]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/d8/good_thumb.gif"></span><span class="item_emoji" id="emoji_[no]" onclick="chatControl.clickEmojiItems(id);" title="[no]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/ae/buyao_org.gif"></span><span class="item_emoji" id="emoji_[赞]" onclick="chatControl.clickEmojiItems(id);" title="[赞]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/d0/z2_thumb.gif"></span><span class="item_emoji" id="emoji_[来]" onclick="chatControl.clickEmojiItems(id);" title="[来]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/40/come_thumb.gif"></span><span class="item_emoji" id="emoji_[弱]" onclick="chatControl.clickEmojiItems(id);" title="[弱]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/d8/sad_thumb.gif"></span><span class="item_emoji" id="emoji_[草泥马]" onclick="chatControl.clickEmojiItems(id);" title="[草泥马]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/7a/shenshou_thumb.gif"></span><span class="item_emoji" id="emoji_[神马]" onclick="chatControl.clickEmojiItems(id);" title="[神马]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/60/horse2_thumb.gif"></span><span class="item_emoji" id="emoji_[囧]" onclick="chatControl.clickEmojiItems(id);" title="[囧]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/15/j_thumb.gif"></span><span class="item_emoji" id="emoji_[浮云]" onclick="chatControl.clickEmojiItems(id);" title="[浮云]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/bc/fuyun_thumb.gif"></span><span class="item_emoji" id="emoji_[给力]" onclick="chatControl.clickEmojiItems(id);" title="[给力]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/1e/geiliv2_thumb.gif"></span><span class="item_emoji" id="emoji_[围观]" onclick="chatControl.clickEmojiItems(id);" title="[围观]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/f2/wg_thumb.gif"></span><span class="item_emoji" id="emoji_[威武]" onclick="chatControl.clickEmojiItems(id);" title="[威武]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/70/vw_thumb.gif"></span><span class="item_emoji" id="emoji_[奥特曼]" onclick="chatControl.clickEmojiItems(id);" title="[奥特曼]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/bc/otm_thumb.gif"></span><span class="item_emoji" id="emoji_[礼物]" onclick="chatControl.clickEmojiItems(id);" title="[礼物]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/c4/liwu_thumb.gif"></span><span class="item_emoji" id="emoji_[钟]" onclick="chatControl.clickEmojiItems(id);" title="[钟]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/d3/clock_thumb.gif"></span><span class="item_emoji" id="emoji_[话筒]" onclick="chatControl.clickEmojiItems(id);" title="[话筒]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/9f/huatongv2_thumb.gif"></span><span class="item_emoji" id="emoji_[蜡烛]" onclick="chatControl.clickEmojiItems(id);" title="[蜡烛]"><img class="imgitem_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/d9/lazhuv2_thumb.gif"></span>';
        chatControl.index_emoji ? (layer.close(chatControl.index_emoji), chatControl.index_emoji = null) : chatControl.index_emoji = layer.tips("<div  class='list_emoji'>" + a + "</div>", ".emoji", {
            tips: [1, "#fff"],
            time: 0,
            area: ["400px", "235px"],
            shift: 5
        })
    },
    initUploadPic: () => {
        chatControl.index_img ? (layer.close(chatControl.index_img), chatControl.index_img = null) : (chatControl.index_img = layer.tips("<div id='uploadimg_list' style='height:250px;'></div><button id='uploadimg_upload' class='btn btn-default uploadimg' type='button'><span style='color:orange;margin-right:5px;' class='glyphicon glyphicon-picture'></span><span class='sp_uploadimg'>上传</span></button><div id='uploadimg_pages' style='float:right;margin-top:5px;'></div>", "#a_uploadimg", {
            tips: [1, "#fff"],
            time: 0,
            area: ["390px", "300px"],
            shift: 5
        }), chatControl.bindImgList(1), chatControl.bindImgpage(), chatControl.isBeforeUpload = !1, $("#uploadimg_upload").on('click', () => {
            chatControl.isUploadStyle = 0,
                chatControl.isBeforeUpload = !1,
                document.getElementById("uploading_file").click()
        }))
    },
    bindImgList: (a) => {
        var d, b = "",
            c = "";
        for (d = 10 * (a - 1); 10 * a > d; d++) chatControl.uploadPic[d] && (c = chatControl.uploadPic[d].replace(".", "_"), b += "<div style='height:64px;float:left;margin:25px 5px;'><img id='uploadimgitem_" + chatControl.uploadPic[d].replace(".", "_") + "'onclick='chatControl.clickSelimg(id);' onmouseover='chatControl.mouseoverZoomimg(id);' onmouseout='chatControl.mouseoutClosezoom();' style='height:64px;width:64px;' src='IMG/Upload/" + $.cookie("user_id") + "/" + chatControl.uploadPic[d] + "' /></div>");
        $("#uploadimg_list").html(b)
    },
    bindImgpage: () => {
        laypage({
            cont: "uploadimg_pages",
            pages: Math.ceil(chatControl.uploadPic.length / 10),
            first: !1,
            groups: 5,
            last: !1,
            prev: !1,
            next: !1,
            jump: function(a, b) {
                b || chatControl.bindImgList(a.curr)
            }
        })
    },
    clickSelimg: () => {

    },
    mouseoverZoomimg: () => {

    },
    mouseoutClosezoom: () => {

    },
    clickEmojiItems: (a) => {
        $(".message-input").insertAtCaret(a.split("_")[1]),
            layer.close(chatControl.index_emoji),
            chatControl.index_emoji = null
    },
    imguploadBase64: () => {
        $("#uploadimg_upload").attr("disabled", !0),
            $(".sp_uploadimg").html("上传中...");
        // $.post("Act/h_main.ashx?act=uploadPhoto", {
        //     base64str: a
        // },
        // function(a) {
        //     var b, c, d;
        //     if ($("#uploadimg_upload").attr("disabled", !1), $(".sp_uploadimg").text("上传"), isBeforeUpload = !0, $("#uploading_file").val(""), b = $.parseJSON(a), c = !1, "Fail" == b.state) return layer.alert(b.msg, {
        //         icon: 5,
        //         title: "上传结果"
        //     }),
        //     void 0;
        //     for (d = 0; d < uploadPic.length; d++) if (uploadPic[d] == b.msg) {
        //         c = !0;
        //         break
        //     }
        //     c || uploadPic.splice(0, 0, b.msg),
        //     bind_imglist(1),
        //     bind_imgpage()
        // })
    },
    imguploadFile: (a) => {
        // $.ajax({
        //     url: "Act/h_main.ashx?act=uploadImg",
        //     type: "POST",
        //     data: a,
        //     cache: !1,
        //     contentType: !1,
        //     processData: !1,
        //     success: function(a) {
        //         var b, c, d;
        //         if ($("#uploadimg_upload").attr("disabled", !1), $(".sp_uploadimg").text("上传"), isBeforeUpload = !0, $("#uploading_file").val(""), b = $.parseJSON(a), c = !1, "Fail" == b.state) return layer.alert(b.msg, {
        //                 icon: 5,
        //                 title: "上传结果"
        //             }),
        //             void 0;
        //         for (d = 0; d < uploadPic.length; d++)
        //             if (uploadPic[d] == b.msg) {
        //                 c = !0;
        //                 break
        //             }
        //         c || uploadPic.splice(0, 0, b.msg),
        //             bind_imglist(1),
        //             bind_imgpage()
        //     }
        // })
    }
}

let business = {
    loginLayer: null,
    socketIO: null,
    ladda: null,
    session_key: 'ws_swoole_chart_login_start',
    storage_key: 'jswoole.chat',
    userList: null,
    isLogin: () => {
        var u_login = cookie.get(business.session_key)
        if (utils.isNull(u_login)) {
            //示范一个公告层
            business.loginLayer = utils.openPage(1, false, $("#loginModal").html())
            return false
        }

        return true
    },
    openLogin: () => {
        // layer.closeAll() //疯狂模式，关闭所有层
        // layer.closeAll('dialog') //关闭信息框
        // layer.closeAll('page') //关闭所有页面层
        // layer.closeAll('iframe') //关闭所有的iframe层
        // layer.closeAll('loading') //关闭加载层
        // layer.closeAll('tips') //关闭所有的tips层
        layer.close(business.loginLayer)
        business.loginLayer = utils.openPage(1, false, $("#loginModal").html())
        Ladda.bind('button.chart-submit', { timeout: 2000 })
    },
    openReg: () => {
        layer.close(business.loginLayer)
        business.loginLayer = utils.openPage(1, false, $("#registerModal").html(), {
            area: ['600px', '580px']
        })
        Ladda.bind('button.chart-submit', { timeout: 2000 })
    },
    submitData: (dom) => {
        var form = $(dom).parent().parent('form')
        var action = form.attr('action')
        var formData = new FormData(form.get(0))
        if ('login' === action) {
            if (utils.isNull(formData.get("login.username"))) {
                layer.msg("请输入用户名", { msg: 5 })
                return false
            }

            if (utils.isNull(formData.get("login.password"))) {
                layer.msg("请输入密码", { msg: 5 })
                return false
            }
            business.openWebSocket()
            business.login(formData.get("login.username"), formData.get("login.password"))
        } else if ('register' === action) {
            var username = formData.get("reg.username")
            var password = formData.get("reg.password")
            var confirm_passwd = formData.get("reg.confirm_passwd")
            var sex = formData.get("reg.sex")
            var email = formData.get("reg.email")
            if (utils.isNull(username)) {
                layer.msg("亲，您应该需要一个用户昵称的，不然茫茫大海如何寻你", { msg: 5 })
                return false
            }

            if (!utils.regCheck.username(username)) {
                layer.msg("用户名必须是6-15位字母、数字组成", { msg: 5 })
                return false
            }

            if (utils.isNull(password)) {
                layer.msg("亲，您应该需要一个密码", { msg: 5 })
                return false
            }

            if (!utils.regCheck.pwd(password)) {
                layer.msg("密码必须是至少6位字母+数字组合组合", { msg: 5 })
                return false
            }

            if (password !== confirm_passwd) {
                layer.msg("亲，您两次输入密码不一致", { msg: 5 })
                return false
            }

            if (utils.isNull(sex)) {
                layer.msg("亲，留下您的性别，我们好给一个属于你的头像", { msg: 5 })
                return false
            }

            if (utils.isNull(email)) {
                layer.msg("亲，您应该需要一个邮箱的，不然茫茫大海如何寻你", { msg: 5 })
                return false
            }

            if (!utils.regCheck.isEmail(email)) {
                layer.msg("请输入正确的邮箱格式")
                return false
            }

            var params = {
                username: username,
                password: password,
                confirm_passwd: confirm_passwd,
                sex: sex,
                email: email,
            }
            business.openWebSocket()
            business.register(params)
        }
    },
    login: (username, password) => {
        var params = {
            type: 'sign',
            // uid : this.uuid(),
            username: username,
            password: password,
        }
        business.socketIO.bindRequestData(params)
        business.socketIO.RegisterCallFunc.successCall = (ws, response) => {
            const data = response.data
            Ladda.stopAll()
            $('form[action=\'login\']').find("button[type='reset']").click()
            cookie.set(business.session_key, response.data.uid)
            layer.msg("登录成功，欢迎您进入聊天室")
            layer.close(business.loginLayer)
            business.initManPage(true, data)
        }
    },
    register: (params) => {
        params.type = 'register'
        business.socketIO.bindRequestData(params)
        business.socketIO.RegisterCallFunc.successCall = (ws, response) => {
            Ladda.stopAll()
            layer.msg("恭喜您，注册成功！")
            setTimeout(() => {
                $('form[action=\'register\']').find("button[type='reset']").click()
                business.openLogin()
            }, 1000)
        }
    },
    openWebSocket: () => {
        layer.load()
        business.socketIO = new SocketIO({
            wsUrl: 'ws://192.168.2.121:9502'
        })
    },
    initManPage: (sure, res) => {
        res = res || null
        if (sure) {
            $("#chat-discussion").show()
            $("#chat-discussion").removeClass('hide')
            $("#chat-users").show()
            $("#chat-users").removeClass('hide')
            if (utils.isNull(res)) { //已经登陆，需要向服务端获取用户列表
                business.socketIO.bindRequestData({
                    type: 'users',
                    uid: cookie.get(business.session_key)
                })
                business.socketIO.RegisterCallFunc.successCall = (ws, response) => {
                    const data = response.data
                    business.createUsers(data.users)
                    business.userList = data.users
                    return true;
                }
            } else {
                business.createUsers(res.users)
                business.userList = res.users
            }
        } else {
            $("#chat-discussion").hide()
            $("#chat-discussion").addClass('hide')
            $("#chat-users").hide()
            $("#chat-users").addClass('hide')
        }
    },
    createUsers: (users) => {
        if (!utils.isNull(users) && users.length) {
            $("#users-list").empty()
            for (const i in users) {
                const user = users[i]
                const avatar = 1 == user.sex ? 'woman_logo.jpg' : 'man_logo.jpg'
                const uid = cookie.get(business.session_key)
                let self_html = ''
                let self_class = ''
                if (uid === user.uid) {
                    self_html = '<span class="label label-success"><i class="fa fa-heart"></i> 我</span>'
                    self_class = 'self_uid'
                }
                // 是否在线判断
                const online_html = 1 == user.online ? '<span class="pull-right label label-primary">在线</span>' : '<span class="pull-right label label-danger">离线</span>'
                const child = "<div class=\"chat-user " + self_class + "\" data-uid=\"" + user.uid + "\">" + online_html + "<div><img class=\"chat-avatar\" src=\"static/images/" + avatar + "\" alt=\"\"> " + self_html + "</div><div class=\"chat-user-name\"><a href=\"javascript:;\">" + user.username + "</a></div></div>"
                $("#users-list").append(child)
                uid !== user.uid && business.contextmenu("div.chat-user[data-uid='" + user.uid + "']", user.uid)
            }
            // 右键菜单
            // utils.onContextmenu('#users-list')
            utils.onContextmenu('#users-list .self_uid', [{
                text: '退出登录',
                href: '#',
                action: function(e) {
                    e.preventDefault()
                    layer.confirm('确认退出吗?', { icon: 3, title: '提示' }, function(index) {
                        business.logout(index)
                    })
                }
            }])
        }
    },
    contextmenu: (id, uid) => {
        context.init({
            preventDoubleContext: false,
        })

        const opts = [{
            header: '菜单列表'
        }, {
            text: '发起聊天',
            href: 'javascript:;',
            action: function(e) {
                e.preventDefault()
                business.chat(uid)
            }
        }, {
            text: '互加好友',
            href: '#'
        }, {
            text: '设为特别关心',
            href: '#'
        }]

        context.attach(id, opts)
    },
    logout: (layIndex) => {
        layIndex = layIndex || null;
        const uid = cookie.get(business.session_key)
        cookie.delete(business.session_key)
        // business.socketIO.ws.send(JSON.stringify({
        //     type: 'logout',
        //     uid: uid
        // }))
        business.socketIO.send({
            type: 'logout',
            uid: uid
        })

        business.socketIO.RegisterCallFunc.successCall = (ws, response) => {
            ws.close()
            location.reload()
            return true
        }
    },
    chat: (uid) => {
        const user = business.getUser(uid)
        if (!user) return
        const sex_logo = 1 == user.sex ? 'static/images/woman_logo.jpg' : 'static/images/man_logo.jpg'
        const title = '和' + user.username + '聊天'
        let suid = uid.replace("{", '')
        suid = suid.replace("}", '')
        let html = '<div  id="chatModel-' + suid + '">' +
            '<div class="ibox">' +
            '<div class="ibox-title">' +
            '<img class="message-avatar" src="' + sex_logo + '" alt="">' +
            '</div>' +
            '<div class="ibox-content" style="height:100%">' +
            '<div class="row chat-msg-box">' +
            '<div class="col-md-12 ">' +
            '<div class="chat-discussion">' +
            '</div>' +
            '</div>' +
            '</div>' +
            '<div class="chat-input-box">' +
            '<div class="col-sm-12">' +
            '<div class="chat-message-form">' +
            '<div style="float:left;margin-top:4px;">' +
            '<a class="emoji" style="margin-right:10px;" data-toggle="popover" data-placement="top" title="表情"><img style="outline-width:40px;" class="img_emoji" src="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/5c/huanglianwx_thumb.gif"></a>' +
            '<a id="a_uploadimg" style="margin-right:10px;" title="上传图片"><img style="padding-top:4px;" class="img_uploadimg" src="static/images/uploadpic.png"></a>' +
            '<a id="a_uploadfile" style="margin-right:10px;" title="上传文件"><img src="static/images/uploadfile.png"></a>' +
            '<input id="uploading_file" type="file" style="display:none;">' +
            '<a id="a_doodle" style="margin-right:10px;" title="涂鸦"><img src="static/images/doodle.png"></a>' +
            '<a style="cursor:default;margin-right:10px;">|</a>' +
            '<a id="a_getphoto" style="margin-right:10px;" title="拍照"><img src="static/images/camera.png"></a>' +
            '<a id="a_record" style="margin-right:10px;" title="录音"><img src="static/images/record.png"></a>' +
            '</div>' +
            '<div class="form-group">' +
            '<textarea class="form-control message-input" name="message" placeholder="输入消息内容，按回车键发送" onkeydown="business.sendMsg(event, this)" data-to="' + uid + '"></textarea>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';
        const params = {
            area: ['1000px'],
            shade: 0.8,
            id: 'LAY_layui_chat', //设定一个id，防止重复弹出
            resize: true,
            maxmin: true,
            shadeClose: true,
            closeBtn: 1,
            end: () => {
                layer.closeAll('tips')
            }
            // btn: ['火速围观', '残忍拒绝'],
            // btnAlign: 'c',
            // moveType: 1, //拖拽模式，0或者1,              
        }

        let chatLayer = utils.openPage(1, title, html, params)
        let muid = cookie.get(business.session_key)
        let msgs = business.getStorageMsg(muid, uid)
        // console.log('我俩的记录:' + msgs);
        if (!utils.isNull(msgs)) {
            for (let i = 0; i < msgs.length; i++) {
                const user = business.getUser(msgs[i][0])
                if (!user) continue
                business.creatChatDom(user, uid, msgs[i][2], msgs[i][3])
            }
        }
        // 我收到
        // let msgs = business.getStorageMsg(uid, muid)
        // console.log('我收到:' + msgs);
        // if (!utils.isNull(msgs)) {
        //     for (let i = 0; i < msgs.length; i++) {
        //         const user = business.getUser(msgs[i][1])
        //         if (!user) continue
        //         business.creatChatDom(user, msgs[i][0], msgs[i][2], msgs[i][3])
        //     }
        // }
        //###bind event ####
        $(".emoji").on('click', () => {
            chatControl.initEmoji()
        })

        $("#a_uploadimg").on('click', () => {
            chatControl.initUploadPic()
        })

        $("#uploading_file").change(function() {
            var a, b, c;
            if (!chatControl.isBeforeUpload)
                if (a = document.getElementById("uploading_file").files[0], b = a.size / 1024, c = new FormData(), c.append("upload_file", a), 0 == chatControl.isUploadStyle)
                    if (-1 != a.name.toLowerCase().indexOf(".gif")) {
                        if (b > 500) return isBeforeUpload = !0,
                            $("#uploading_file").val(""),
                            layer.msg("gif图片上传失败,当前最大限制500kb"),
                            !1;
                        imgupload_file(c)
                    } else b > 500 ? ($("#uploadimg_upload").attr("disabled", !0), $(".sp_uploadimg").html("上传中..."), lrz(this.files[0], {
                            width: 500
                        },
                        function(a) {
                            chatControl.imguploadBase64(a.base64)
                        })) : chatControl.imguploadFile(c);
            else if (1 == chatControl.isUploadStyle) {
                if (b > 5120) return chatControl.isBeforeUpload = !0,
                    $("#uploading_file").val(""),
                    layer.msg("压缩包的大小不得超过5MB"),
                    void 0;
                uploadfile(c)
            }
        })
    },
    getStorageMsg: (from, to) => {
        const cache = new StoreCache(business.storage_key)
        const key = from + ':' + to
        return JSON.parse(cache.get(key))
    },
    sendMsg: (e, dom) => {
        if (!business.isLogin()) {
            return false
        }
        let msg = utils.trim($(dom).val())
        if (event.keyCode === 13 && msg) {
            e.preventDefault()
            if (msg.length > 1000) {
                layer.msg("字数超过限制，最多只能发送1000字", { icon: 5 })
                // msg = msg.substring(0, 1000)
                return false
            }
            // console.log('aes加密后:', enaes, enaes.length)
            // console.log('aes解密后:', aes.Decrypt(enaes))
            // return
            // business.socketIO.ws.send(JSON.stringify({
            //     type: 'msg',
            //     // from: from,
            //     to: $(dom).data('to'),
            //     body: enaes
            // }))

            business.socketIO.send({
                type: 'msg',
                // from: from,
                to: $(dom).data('to'),
                body: msg
            })

            const load = layer.load()
            business.socketIO.RegisterCallFunc.successCall = (ws, response) => {
                business.createChatSendMsg(cookie.get(business.session_key), $(dom).data('to'), msg, new Date().getTime())
                dom.value = ''
                layer.close(load)
                return true;
            }
            // business.createChatSendMsg(cookie.get(business.session_key), $(dom).data('to'), msg, new Date().getTime())
            // dom.value = ''
        }
    },
    createChatSendMsg: (from, to, msg, time) => {
        // 我发送给别人的信息
        const user = business.getUser(from)
        if (!user)
            return
        const createTime = utils.toDate(time)
        // console.log('我发送给别人的信息#from:' + from + '#to:' + to)
        business.creatChatDom(user, to, msg, createTime)
        business.saveChatMsgByCache(from, to, msg, createTime)
    },
    createChatReceiveMsg: (from, to, msg, time) => {
        // 我收到别人发给我的信息
        const user = business.getUser(from) //别人
        if (!user)
            return
        business.chat(from)
        const createTime = utils.toPhpDate(time)
        // console.log('我收到别人发给我的信息#to:' + to + '#from' + from)
        business.creatChatDom(user, from, msg, createTime)
        // business.saveChatMsgByCache(to, from, msg, createTime)
        // business.saveChatMsgByCache(from, to, msg, createTime)
        business.saveChatMsgByCache(to, from, msg, createTime, 2)
    },

    creatChatDom: (user, uid, msg, createTime) => {
        if (utils.isNull(uid))
            return
        const dom = $('<div class="chat-message"></div>')
        const sexLogo = 1 == user.sex ? 'woman_logo.jpg' : 'man_logo.jpg'
        $('<img class="message-avatar" src="static/images/' + sexLogo + '" alt="">').appendTo(dom)
        const msdom = $("<div class='message'></div>")
        msdom.appendTo(dom)
        const ud = $('<a class="message-author" href="#"> ' + user.username + '</a>')
        ud.appendTo(msdom)
        const td = $('<span class="message-date"> ' + createTime + ' </span>')
        td.appendTo(msdom)
        const md = $('<span class="message-content">' + msg + '</span>')
        md.appendTo(msdom)
        let suid = uid.replace("{", '')
        suid = suid.replace("}", '')
        $('#chatModel-' + suid + '   div.chat-discussion').append(dom)

    },
    saveChatMsgByCache: (from, to, msg, time, type) => {
        if (utils.isNull(from) || utils.isNull(to))
            return
        type = type || 1
        let cache = new StoreCache(business.storage_key)
        const key = from + ':' + to
        let oldData = JSON.parse(cache.get(key)) || []
        if (1 === type) {
            oldData.push([from, to, msg, time])
        } else {
            oldData.push([to, from, msg, time])
        }
        // console.log('cachekey:', key)
        // console.log('oldData:', oldData)
        cache.set(key, JSON.stringify(oldData))
    },
    getUser: (uid) => {
        let user = []
        if (business.userList) {
            for (let i = 0; i < business.userList.length; i++) {
                if (uid === business.userList[i].uid) {
                    user = business.userList[i]
                    break
                }
            }
        }
        return user
    }
}

class StoreCache {
    constructor(prefix) {
        this.prefix = prefix ? `${prefix}_` : ''
    }
    get(key) {
        return JSON.parse(localStorage.getItem(this.prefix + key))
    }
    set(key, value) {
        localStorage.setItem(this.prefix + key, JSON.stringify(value))
    }
    remove(key) {
        localStorage.removeItem(this.prefix + key)
    }
    clear() {
        localStorage.clear()
    }
}

class CryptoJsAes {
    constructor() {
        this.key = CryptoJS.enc.Utf8.parse("yK6DS3Rh@e1cXgg1") //十六位十六进制数作为密钥 1234123412ABCDEF CryptoJS.MD5("yK6DS3Rh@e1cXgg1")
        this.iv = CryptoJS.enc.Utf8.parse('T%E3jQIml#9CDJ!g') //十六位十六进制数作为密钥偏移量 ABCDEF1234123412
    }
    // 解密方法- 对于解密端，应该包括：解密秘钥长度，秘钥，IV值，解密模式，PADDING方式
    decryptCBC(word) {
        // let encryptedHexStr = CryptoJS.enc.Hex.parse(word)
        // let srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr)
        // let decrypt = CryptoJS.AES.decrypt(srcs, this.key, { iv: this.iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.ZeroPadding })// CryptoJS.pad.Pkcs7 decrypt(srcs, ...)
        // let decryptedStr = decrypt.toString(CryptoJS.enc.Utf8)

        // return decryptedStr.toString()
        let base64 = CryptoJS.enc.Base64.parse(word)
        let srcs = CryptoJS.enc.Base64.stringify(base64)
        let decrypt = CryptoJS.AES.decrypt(srcs, this.key, { iv: this.iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.ZeroPadding })
        let decryptedStr = decrypt.toString(CryptoJS.enc.Utf8)
        return decryptedStr.toString()
    }
    // 加密方法- 对于加密端，应该包括：加密秘钥长度，秘钥，IV值，加密模式，PADDING方式
    encryptCBC(word) {
        let srcs = CryptoJS.enc.Utf8.parse(word)
        let encrypted = CryptoJS.AES.encrypt(srcs, this.key, { iv: this.iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.ZeroPadding })

        // return encrypted.ciphertext.toString().toUpperCase()
        return CryptoJS.enc.Base64.stringify(encrypted.ciphertext)
    }
    decryptMd5(word) {
        let hash = CryptoJS.MD5(this.key).toString();
        return JSON.parse(CryptoJS.AES.decrypt(word, hash).toString(CryptoJS.enc.Utf8));
    }
    encryptMd5(word) {
        let hash = CryptoJS.MD5(this.key).toString();
        return CryptoJS.AES.encrypt(word, hash).toString();
    }
}

class SocketIO {
    constructor(options) {
        // var _self = this
        this.wsUrl = ''
        this.wsState = 0
        this.ws = null
        this.callback = function() {}
        this.sign = null
        this.requestData = null
        this.u_token
        this.RegisterCallFunc = {
            errorCall: (ws, response) => {
                layer.msg(response.msg, { icon: 5 })
                if (105 === response.code) {
                    ws.close()
                } else if (107 === response.code) { //下线通知(抢登或者服务端token失效)
                    cookie.delete(business.session_key)
                    location.reload()
                }

                return false
            },
            successCall: (ws, response) => {
                layer.msg(response.msg, { icon: 6 })
                return true
            },
            broadcastUsersCall: (ws, response) => {
                business.createUsers(response.data.users);
                return true;
            },
            chatCall: (ws, response) => {
                const data = response.data
                business.createChatReceiveMsg(data.from, data.to, data.msg, data.time)
            }
        }
        this.init(options)
    }
    init(options) {
        if (options) {
            for (const o1 in options) {
                this[o1] = options[o1]
            }
        }
        this.ws = this.createSocket() //创建WebSocket实例
        this.bindEvents() //绑定监听事件            
    }
    createSocket() {
        if (typeof(WebSocket) == 'undefined') {
            alert('该浏览器不支持WebSocket，请更换主流浏览器(如:谷歌、火狐、欧朋、360系列、QQ浏览器....)')
            return
        }
        // CONNECTING：值为0，表示正在连接。
        // OPEN：值为1，表示连接成功，可以通信了。
        // CLOSING：值为2，表示连接正在关闭。
        // CLOSED：值为3，表示连接已经关闭，或者打开连接失败。
        try {
            let ws = new WebSocket(this.wsUrl)
            return ws
        } catch (e) {
            alert(e)
        }
    }
    uuid(len = 8, radix = 2) {
        let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('')
        let uuid = [],
            i
        radix = radix || chars.length
        if (len) {
            for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix]
        } else {
            let r
            uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-'
            uuid[14] = '4'
            for (i = 0; i < 36; i++) {
                if (!uuid[i]) {
                    r = 0 | Math.random() * 16
                    uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r]
                }
            }
        }

        return uuid.join('')
    }
    bindRequestData(params) {
        this.requestData = params
    }
    send(data, aes) {
        if (this.wsState < 0)
            return false
        aes = aes || true
        let str = JSON.stringify(data)
        if (aes) {
            const aes = new CryptoJsAes()
            str = aes.encryptCBC(str) //aes.encryptMd5(str)
        }

        this.ws.send(str)
    }
    bindEvents() {
        // 连接成功后
        const _self = this
        this.ws.addEventListener('open', (event) => {
            _self.wsState = 1
            console.log('Connection open ...')
            setTimeout(() => {
                layer.closeAll('loading')
            }, 200, layer)

            if (!utils.isNull(_self.requestData)) {
                // _self.ws.send(JSON.stringify(_self.requestData))
                _self.send(_self.requestData)
            }
        })

        // 连接关闭后
        this.ws.addEventListener("close", (event) => {
            _self.wsState = -1
            var code = event.code
            var reason = event.reason
            var wasClean = event.wasClean
            console.log({ code: code, reason: reason, wasClean: wasClean })
            console.log('Connection close ...')
            layer.closeAll('loading')
            layer.closeAll('page')
            const msg = '与服务器断开连接  <button class="btn btn-danger btn-sm" type="button" onclick="javascript:location.reload()">刷新试一试</button>'
            $("#sys-msg").html(msg)
            // setTimeout(() => {
            //     location.reload()
            // }, 500)

        })

        // 收到服务器数据后
        this.ws.addEventListener("message", (event) => {
            _self.wsState = 2
            let data = event.data
            let json = JSON.parse(data)
            // let _self = this
            if (102 === json.code) { // 广播更新用户
                return _self.RegisterCallFunc.broadcastUsersCall(self.ws, json);
            } else if (100 === json.code) { // 通常状态下成功返回
                if (typeof _self.RegisterCallFunc.successCall === 'function') {
                    const res = _self.RegisterCallFunc.successCall(_self.ws, json)
                    _self.RegisterCallFunc.successCal = (ws, response) => {
                        layer.msg(response.msg, { icon: 6 })
                        return true
                    }

                    return true
                }

                return true
            } else if (104 === json.code) { // 对传信息的成功操作（该状态码下可以是字符串、图片文件、word、txt、excel、pdf、压缩文件、音频文件、视频文件【2MB】）
                return _self.RegisterCallFunc.chatCall(self.ws, json);
            } else { //通常状态下错误返回
                if (typeof _self.RegisterCallFunc.errorCall === 'function') {
                    let res = _self.RegisterCallFunc.errorCall(_self.ws, json)
                }
                _self.RegisterCallFunc.errorCall = (ws, response) => {
                    layer.msg(response.msg, { icon: 5 })
                    ws.close()
                    return false
                }
                return false
            }

        })

        // 连接失败
        this.ws.addEventListener("error", (event) => {
            console.log('Connection error ...')
            layer.msg("服务器出错请稍候在试", { icon: 5 })
            _self.wsState = -3
            const msg = '服务器出错请稍候在试  <button class="btn btn-danger btn-sm" type="button" onclick="javascript:location.reload()">刷新试一试</button>'
            $("#sys-msg").html(msg)
            layer.closeAll('page')
            // 0 (CONNECTING)
            // 正在链接中
            // 1 (OPEN)
            // 已经链接并且可以通讯
            // 2 (CLOSING)
            // 连接正在关闭
            // 3 (CLOSED)
            // 连接已关闭或者没有链接成功
            // const readyState = _self.ws.readyState
            // if (3 === readyState) {
            //     layer.msg("服务器出错请稍候在试", { icon: 5 })
            //     layer.closeAll('page')
            //     return false
            // }
        })
    }
}

$(document).ready(() => {
    // 初始化检测登录相关
    if (business.isLogin()) {
        layer.load()
        business.socketIO = new SocketIO({
            wsUrl: 'ws://192.168.2.121:9502',
        })
        $("#sys-msg").html('欢迎大家来到JSWOOLE聊天室')
        business.initManPage(true)
    } else {
        $("#sys-msg").html('欢迎大家来到JSWOOLE聊天室  <button type="button" class="btn btn-info btn-sm" onclick="business.openLogin()">登录</button>')
        business.initManPage(false)
    }

    // 按钮loadding效果
    Ladda.bind('button.chart-submit', { timeout: 2000 })

    // 时间器
    setInterval(() => {
        utils.displayRealTime('current_time')
    }, 1000)
    // business.ladda.toggle()
    // business.ladda.setProgress( 0 )
    // console.log(Ladda.bind( 'button#loginBtn'))//, { timeout: 2000 } 
    /* 登录注册 event bind start */
    const bindEvent = () => {
        // 登录btn
        $("a#loginModalBtn").on('click', (event) => {
            layer.close(business.loginLayer)
            business.loginLayer = null
            utils.openPage(1, false, $("#loginModal").html())
        })

        // 注册btn
        $("a#registerModalBtn").on('click', (event) => {
            layer.close(business.loginLayer)
            utils.openPage(1, false, $("#registerModal").html(), {
                area: ['600px', '550px']
            })
        })

        // 按钮提交
        $("form.chart-form").on('click', "button.chart-submit", () => {
            business.submitData(this)
        })
    }
    /* 登录注册 event bind end */
})