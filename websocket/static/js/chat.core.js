/**
 * 聊天核心js
 * @authors jiechengyang (2064320087@qq.com)
 * @date    2019-07-04 14:47:31
 * @version $Id$
 */
"use strict"

window.alert = layer.alert
const cookie = {
    set: function(key, value, delay) { //设置cookie方法
        delay = delay || "7d";
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
        let str = parseInt(phpTimestamp) * 1000//将php时间戳转化为整形并乘以1000
        return utils.toDate(str)
    },
    toDate: (time) => {
        let newDate = new Date(time)
        let year = newDate.getUTCFullYear()//取年份
        let month = newDate.getUTCMonth() + 1//取月份
        let nowday = newDate.getUTCDate()//取天数
        let hours = newDate.getHours()//取小时
        let minutes = newDate.getMinutes()//取分钟
        let seconds = newDate.getSeconds()//取秒

        return year + "-" + month + "-" + nowday + " " + hours + ":" + minutes + ":" + seconds        
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
                    console.log(data)
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
            utils.onContextmenu('#users-list .self_uid', [
                {
                    text: '退出登录',
                    href: '#',
                    action: function(e) {
                        e.preventDefault()
                        layer.confirm('确认退出吗?', {icon: 3, title:'提示'}, function(index) {
                            business.logout(index)
                        })
                    }
                }
            ])
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
            }
        ]

        context.attach(id, opts)
    },
    logout: (layIndex) => {
        layIndex = layIndex || null;
        const uid = cookie.get(business.session_key)
        cookie.delete(business.session_key)
        business.socketIO.ws.send(JSON.stringify({
            type: 'logout',
            uid: uid            
        }))

        business.socketIO.RegisterCallFunc.successCall = (ws, response) => {
            ws.close()
            location.reload()
            return true
        }        
    },
    chat: (uid) => {
        // from = from || cookie.get(business.session_key);
        // static/images/woman_logo.jpg
        // let html = $("#chatModel").html()
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
                '<div class="ibox-content">' +
                    '<div class="row">' +
                        '<div class="col-md-12 ">' +
                            '<div class="chat-discussion">' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="row">' + 
                        '<div class="col-sm-12">' +
                            '<div class="chat-message-form">' +
                                '<div class="form-group">' +
                                    '<textarea class="form-control message-input" name="message" placeholder="输入消息内容，按回车键发送" onkeydown="business.sendMsg(this)" data-to="' + uid + '"></textarea>' +
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
            // btn: ['火速围观', '残忍拒绝'],
            // btnAlign: 'c',
            // moveType: 1, //拖拽模式，0或者1,                      
        }

        let chatLayer = utils.openPage(1, title, html, params)
        let muid = cookie.get(business.session_key)
        // {F82D2637-4B3F-8561-A95B-6EF6CDBC4D6F} {1CC18625-2759-01EA-1705-0D4204FF0CA2}
        // 我发送别人
        let msgs = business.getStorageMsg(muid, uid)
        console.log('我发送别人:' + msgs);
        if (!utils.isNull(msgs)) {
            for (let i = 0; i < msgs.length; i++) {
                const user = business.getUser(msgs[i][0])
                if (!user) continue
                console.log(msgs[i]);
                business.creatChatDom(user, msgs[i][1], msgs[i][2], msgs[i][3])
            }
        }
        // 我收到
        msgs = business.getStorageMsg(uid, muid)
        console.log('我收到:' + msgs);
        if (!utils.isNull(msgs)) {
            for (let i = 0; i < msgs.length; i++) {
                const user = business.getUser(msgs[i][0])
                if (!user) continue
                business.creatChatDom(user, msgs[i][0], msgs[i][2], msgs[i][3])
            }
        }
    },
    getStorageMsg: (from, to) => {
        const cache = new StoreCache(business.storage_key)
        const key = from + ':' + to
        return JSON.parse(cache.get(key))
    },
    sendMsg: (dom) => {
        if (!business.isLogin()) {
            return false
        }
        let msg = utils.trim($(dom).val())
        if (event.keyCode === 13 && msg) {
            // console.log(msg, $(dom).data('to'))
            business.createChatSendMsg(cookie.get(business.session_key), $(dom).data('to'), msg, new Date().getTime())
            business.socketIO.ws.send(JSON.stringify({
                type: 'msg',
                // from: from,
                to: $(dom).data('to'),
                body: msg
            }))
            $(dom).val('')
        }
    },
    createChatSendMsg: (from, to, msg, time) => {
        // 我发送给别人的信息
        const user = business.getUser(from)
        if (!user) 
            return
        const createTime = utils.toDate(time)
        console.log('我发送给别人的信息#from:' + from + '#to:' + to)
        business.creatChatDom(user, to, msg, createTime)
        business.saveChatMsgByCache(from, to, msg, createTime)
    },
    createChatReceiveMsg: (from, to, msg, time) => {
        // 我收到别人发给我的信息
        const user = business.getUser(from)//别人
        if (!user) 
            return
        const createTime = utils.toPhpDate(time)
        console.log('我收到别人发给我的信息#to:' + to + '#from' + from)
        business.creatChatDom(user, from, msg, createTime)
        // business.saveChatMsgByCache(to, from, msg, createTime)
        business.saveChatMsgByCache(from, to, msg, createTime)
    },

    creatChatDom: (user, uid, msg, createTime) => {
        if (utils.isNull(uid))
            return
        const dom = $('<div class="chat-message"></div>')
        const sexLogo =  1 == user.sex ? 'woman_logo.jpg' : 'man_logo.jpg'
        $('<img class="message-avatar" src="static/images/' + sexLogo + '" alt="">').appendTo(dom)
        const msdom  = $("<div class='message'></div>")
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
    saveChatMsgByCache: (from, to, msg, time) => {
        let cache = new StoreCache(business.storage_key)
        const key = from + ':' + to
        console.log('key:', key);
        let oldData = JSON.parse(cache.get(key)) || []
        oldData.push([from, to, msg, time])
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

class SocketIO {
    constructor(options) {
        // var _self = this
        this.wsUrl = ''
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
                } else if (107 === response.code) { //下线通知
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
                console.log(data);
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
    bindEvents() {
        // 连接成功后
        const _self = this
        this.ws.addEventListener('open', (event) => {
            console.log('Connection open ...')
            setTimeout(() => {
                layer.closeAll('loading')
            }, 200, layer)

            if (!utils.isNull(_self.requestData)) {
                _self.ws.send(JSON.stringify(_self.requestData))
            }
        })

        // 连接关闭后
        this.ws.addEventListener("close", (event) => {
            var code = event.code
            var reason = event.reason
            var wasClean = event.wasClean
            console.log({ code: code, reason: reason, wasClean: wasClean })
            console.log('Connection close ...')
            layer.closeAll('loading')

        })

        // 收到服务器数据后
        this.ws.addEventListener("message", (event) => {
            let data = event.data
            let json = JSON.parse(data)
            let _self = this
            console.log('json data:', JSON.parse(data))
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
            // 0 (CONNECTING)
            // 正在链接中
            // 1 (OPEN)
            // 已经链接并且可以通讯
            // 2 (CLOSING)
            // 连接正在关闭
            // 3 (CLOSED)
            // 连接已关闭或者没有链接成功
            const readyState = _self.ws.readyState
            if (3 === readyState) {
                layer.msg("服务器出错请稍候在试", { icon: 5 })
                return false
            }
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
        business.initManPage(true)
    } else {
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