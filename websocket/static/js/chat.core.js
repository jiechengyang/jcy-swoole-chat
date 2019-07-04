/**
 * 聊天核心js
 * @authors jiechengyang (2064320087@qq.com)
 * @date    2019-07-04 14:47:31
 * @version $Id$
 */
"use strict";

window.alert = layer.alert;
const cookie = {
    set: function(key, val, time) { //设置cookie方法
        var date = new Date(); //获取当前时间
        time = time || 30;
        var expiresDays = time; //将date设置为n天以后的时间
        date.setTime(date.getTime() + expiresDays * 24 * 3600 * 1000); //格式化为cookie识别的时间
        document.cookie = key + "=" + val + ";expires=" + date.toGMTString(); //设置cookie
    },
    get: function(key) { //获取cookie方法
        /*获取cookie参数*/
        var getCookie = document.cookie.replace(/[ ]/g, ""); //获取cookie，并且将获得的cookie格式化，去掉空格字符
        var arrCookie = getCookie.split(";") //将获得的cookie以"分号"为标识 将cookie保存到arrCookie的数组中
        var tips; //声明变量tips
        for (var i = 0; i < arrCookie.length; i++) { //使用for循环查找cookie中的tips变量
            var arr = arrCookie[i].split("="); //将单条cookie用"等号"为标识，将单条cookie保存为arr数组
            if (key == arr[0]) { //匹配变量名称，其中arr[0]是指的cookie名称，如果该条变量为tips则执行判断语句中的赋值操作
                tips = arr[1]; //将cookie的值赋给变量tips
                break; //终止for循环遍历
            }
        }

        return tips;
    },
    delete: function(key) { //删除cookie方法
        var date = new Date(); //获取当前时间
        date.setTime(date.getTime() - 10000); //将date设置为过去的时间
        document.cookie = key + "=v; expires =" + date.toGMTString(); //设置cookie
    }
}
let utils = {
    trim: (x) => {
        return x.replace(/^\s+|\s+$/gm, '')
    },
    isNull: (value) => {
        if (value == null || value == '' || value == undefined || typeof value == "undefined" || value == "undefined")
            return true;
        return false;
    },
    displayRealTime: (domId) => {
        const obj = document.getElementById(domId);
        const nowDate = new Date();
        const year = nowDate.getFullYear();
        const month = nowDate.getMonth() + 1;
        const date = nowDate.getDate() ;
        obj.innerHTML = year + '-' + month + '-' + date + ' ' + nowDate.toLocaleTimeString();
    },
    regCheck: {
        /*是否带有小数*/
        isDecimal: (strValue) => {
            const objRegExp = /^\d+\.\d+$/;
            return objRegExp.test(strValue);
        },
        /*校验是否中文名称组成 */
        ischina: (str) => {
            const reg = /^[\u4E00-\u9FA5]{2,4}$/; /*定义验证表达式*/
            return reg.test(str); /*进行验证*/
        },

        /*校验是否全由8位数字组成 */
        isStudentNo: (str) => {
            const reg = /^[0-9]{8}$/; /*定义验证表达式*/
            return reg.test(str); /*进行验证*/
        },

        /*校验电话码格式 */
        isTelCode: (str) => {
            const reg = /^((0\d{2,3}-\d{7,8})|(1[3584]\d{9}))$/;
            return reg.test(str);
        },

        /*校验邮件地址是否合法 */
        isEmail: (str) => {
            const reg = new RegExp("^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$");
            return reg.test(str);
        },
        /*校验用户名是否合法 */
        username: (username) => {
            // const reg =/(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6, 15}/;
            const reg = /^[a-zA-Z0-9]{6,15}$/;
            return reg.test(username);
        },
        /*校验密码是否合法 */
        pwd: (password) => {
            // const reg = /[\w]{6,}%$/g;
            // 匹配'x'仅仅当'x'后面不跟着'y',这个叫做正向否定查找。
            // 例如，/\d+(?!\.)/匹配一个数字仅仅当这个数字后面没有跟小数点的时候。正则表达式/\d+(?!\.)/.exec("3.141")匹配‘141’而不是‘3.141’
            // (?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,}
            // 匹配'x'仅仅当'x'后面跟着'y'.这种叫做先行断言。
            // 例如，/Jack(?=Sprat)/会匹配到'Jack'仅仅当它后面跟着'Sprat'。/Jack(?=Sprat|Frost)/匹配‘Jack’仅仅当它后面跟着'Sprat'或者是‘Frost’。但是‘Sprat’和‘Frost’都不是匹配结果的一部分。
            // console.log("Jack(?=Sprat)", /Jack(?=Sprat)/g.test('Jack'));
            const reg = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{6,}$/g
            return reg.test(password);
        }
    },
    openPage: (type, title, content, others) => {
        type = type || 1;
        title = title || false;
        others = others || {
            area: '600px;',
            shade: 0.8,
            id: 'LAY_layuipro', //设定一个id，防止重复弹出
            resize: false,
            // btn: ['火速围观', '残忍拒绝'],
            btnAlign: 'c',
            moveType: 1, //拖拽模式，0或者1
            success: (layero) => {
                var btn = layero.find('.layui-layer-btn');
                btn.find('.layui-layer-btn0').attr({
                    href: 'http://www.layui.com/',
                    target: '_blank'
                });
            }
        }
        var params = $.extend({
            type: type,
            title: title,
            content: content,
            type: type,
        }, others);
        // console.log('params:', params);
        return layer.open(params);
    }
}

let business = {
    loginLayer: null,
    socketIO: null,
    ladda: null,
    session_key: 'ws_swoole_chart_login_start',
    checkLogin: () => {
        var u_login = cookie.get(business.session_key);
        if (utils.isNull(u_login)) {
            //示范一个公告层
            business.loginLayer = utils.openPage(1, false, $("#loginModal").html());
            return false;
        }
    },
    openLogin: () => {
        // layer.closeAll(); //疯狂模式，关闭所有层
        // layer.closeAll('dialog'); //关闭信息框
        // layer.closeAll('page'); //关闭所有页面层
        // layer.closeAll('iframe'); //关闭所有的iframe层
        // layer.closeAll('loading'); //关闭加载层
        // layer.closeAll('tips'); //关闭所有的tips层
        layer.close(business.loginLayer);
        business.loginLayer = utils.openPage(1, false, $("#loginModal").html());
        Ladda.bind( 'button.chart-submit', { timeout: 2000 } );
    },
    openReg: () => {
        layer.close(business.loginLayer);
        business.loginLayer = utils.openPage(1, false, $("#registerModal").html(), {
            area: ['600px', '550px']
        });
        Ladda.bind( 'button.chart-submit', { timeout: 2000 } );
    },
    submitData: (dom) => {
        var form = $(dom).parent().parent('form');
        var action = form.attr('action');
        var formData = new FormData(form.get(0));
        if ('login' === action) {
            if (utils.isNull(formData.get("login.username"))) {
                layer.msg("请输入用户名", { msg: 5 });
                return false;
            }

            if (utils.isNull(formData.get("login.password"))) {
                layer.msg("请输入密码", { msg: 5 });
                return false;
            }
            business.openWebSocket();
            business.login(formData.get("login.username"), formData.get("login.password"));
        } else if ('register' === action) {
            var username = formData.get("reg.username");
            var password = formData.get("reg.password");
            var confirm_passwd = formData.get("reg.confirm_passwd");
            var sex = formData.get("reg.sex");
            var email = formData.get("reg.email");
            if (utils.isNull(username)) {
                layer.msg("亲，您应该需要一个用户昵称的，不然茫茫大海如何寻你", { msg: 5 });
                return false;
            }

            if (!utils.regCheck.username(username)) {
                layer.msg("用户名必须是6-15位字母、数字组成", { msg: 5 });
                return false;
            }

            if (utils.isNull(password)) {
                layer.msg("亲，您应该需要一个密码", { msg: 5 });
                return false;
            }

            if (!utils.regCheck.pwd(password)) {
                layer.msg("密码必须是至少6位字母+数字组合组合", { msg: 5 });
                return false;
            }

            if (password !== confirm_passwd) {
                layer.msg("亲，您两次输入密码不一致", { msg: 5 });
                return false;
            }

            if (utils.isNull(sex)) {
                layer.msg("亲，留下您的性别，我们好给一个属于你的头像", { msg: 5 });
                return false;                
            }

            if (utils.isNull(email)) {
                layer.msg("亲，您应该需要一个邮箱的，不然茫茫大海如何寻你", { msg: 5 });
                return false;
            }

            if (! utils.regCheck.isEmail(email)) {
                layer.msg("请输入正确的邮箱格式");
                return false;
            }

            var params = {
                username: username,
                password: password,
                confirm_passwd: confirm_passwd,
                sex: sex,
                email: email,
            }
            business.openWebSocket();
            business.register(params);
        }
    },
    login: (username, password) => {
        var params = {
            type: 'sign',
            // uid : this.uuid(),
            username: username,
            password: password,
        }
        business.socketIO.bindRequestData(params);
        business.socketIO.RegisterCallFunc.successCall = (ws, response) => {
            if (100 === response.code) {
                Ladda.stopAll();
                $('form[action=\'login\']').find("button[type='reset']").click();
                cookie.set(business.session_key, response.data.uid, 7);
                layer.msg("登录成功，欢迎您进入聊天室");              
            }
        }
    },
    register: (params) => {
        params.type = 'register';
        business.socketIO.bindRequestData(params);
        business.socketIO.RegisterCallFunc.successCall = (ws, response) => {
            Ladda.stopAll();
            layer.msg("恭喜您，注册成功！");
            setTimeout(() => {
                $('form[action=\'register\']').find("button[type='reset']").click();
                business.openLogin();
            }, 1000);
        }
        // business.socketIO.RegisterCallFunc.errorCall = (ws, response) => {

        // }
    },
    openWebSocket: () => {
        layer.load();
        business.socketIO = new SocketIO({
            wsUrl: 'ws://192.168.2.173:9502',
            RegisterCallFunc: {
                errorCall: (ws, response) => {
                    layer.msg(response.msg, { icon: 5 });
                    ws.close();
                    return false;
                },
                successCall: (ws, response) => {
                    layer.msg(response.msg, { icon: 6 });
                    return true;
                }
            }
        });
    }
}

class SocketIO {
    constructor(options) {
        // var _self = this;
        this.wsUrl = '';
        this.ws = null;
        this.callback = function() {};
        this.sign = null;
        this.requestData = null;
        this.u_token;
        this.init(options);
    }
    init(options) {
        if (options) {
            for (var o1 in options) {
                this[o1] = options[o1];
            }
        }
        this.ws = this.createSocket(); //创建WebSocket实例
        this.bindEvents(); //绑定监听事件            
    }
    createSocket() {
        if (typeof(WebSocket) == 'undefined') {
            alert('该浏览器不支持WebSocket，请更换主流浏览器(如:谷歌、火狐、欧朋、360系列、QQ浏览器....)');
            return;
        }
        // CONNECTING：值为0，表示正在连接。
        // OPEN：值为1，表示连接成功，可以通信了。
        // CLOSING：值为2，表示连接正在关闭。
        // CLOSED：值为3，表示连接已经关闭，或者打开连接失败。
        try {
            let ws = new WebSocket(this.wsUrl);
            return ws;
        } catch (e) {
            alert(e);
        }
    }
    uuid(len = 8, radix = 2) {
        let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
        let uuid = [],
            i;
        radix = radix || chars.length;
        if (len) {
            for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
        } else {
            let r;
            uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
            uuid[14] = '4';
            for (i = 0; i < 36; i++) {
                if (!uuid[i]) {
                    r = 0 | Math.random() * 16;
                    uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
                }
            }
        }

        return uuid.join('');
    }
    bindRequestData(params) {
        this.requestData = params;
    }
    bindEvents() {
        // 连接成功后
        const _self = this;
        this.ws.addEventListener('open', (event) => {
            console.log('Connection open ...');
            setTimeout(() => {
                layer.closeAll('loading');
            }, 200, layer);

            if (!utils.isNull(_self.requestData)) {
                _self.ws.send(JSON.stringify(_self.requestData));
            }
        });

        // 连接关闭后
        this.ws.addEventListener("close", (event) => {
            var code = event.code;
            var reason = event.reason;
            var wasClean = event.wasClean;
            console.log({ code: code, reason: reason, wasClean: wasClean });
            console.log('Connection close ...');
            layer.closeAll('loading');

        });

        // 收到服务器数据后
        this.ws.addEventListener("message", (event) => {
            let data = event.data;
            let json = JSON.parse(data);
            let _self = this;
            if (100 !== json.code) {
                if (typeof _self.RegisterCallFunc.errorCall === 'function') {
                    return _self.RegisterCallFunc.errorCall(_self.ws, json);
                }
                console.log('json data:', JSON.parse(data));
                return false;
            }

            return typeof _self.RegisterCallFunc.successCall === 'function' ? _self.RegisterCallFunc.successCall(_self.ws, json) : true;
        });

        // 连接失败
        this.ws.addEventListener("error", (event) => {
            console.log('Connection error ...');
            // 0 (CONNECTING)
            // 正在链接中
            // 1 (OPEN)
            // 已经链接并且可以通讯
            // 2 (CLOSING)
            // 连接正在关闭
            // 3 (CLOSED)
            // 连接已关闭或者没有链接成功
            const readyState = _self.ws.readyState;
            if (3 === readyState) {
                layer.msg("服务器出错请稍候在试", { icon: 5 });
                return false;
            }
        });
    }
}

$(() => {
    if (business.checkLogin()) {
        layer.load();
        var socket = new SocketIO({
            wsUrl: 'ws://192.168.2.173:9502',
            errorCall: () => {

            },
            successCall: () => {

            },
        });
    }

    Ladda.bind( 'button.chart-submit', { timeout: 2000 } );

    setInterval(() => {
        utils.displayRealTime('current_time');
    }, 1000)
    // business.ladda.toggle();
    // business.ladda.setProgress( 0 );
     // console.log(Ladda.bind( 'button#loginBtn'));//, { timeout: 2000 } 
    /* 登录注册 event bind start */
    const bindEvent = () => {
        // 登录btn
        $("a#loginModalBtn").on('click', (event) => {
            layer.close(business.loginLayer);
            business.loginLayer = null;
            utils.openPage(1, false, $("#loginModal").html());
        });

        // 注册btn
        $("a#registerModalBtn").on('click', (event) => {
            layer.close(business.loginLayer);
            utils.openPage(1, false, $("#registerModal").html(), {
                area: ['600px', '550px']
            });
        });

        // 按钮提交
        $("form.chart-form").on('click', "button.chart-submit", () => {
            business.submitData(this);
        });
    }
    /* 登录注册 event bind end */

    /* 聊天相关的业务逻辑 start*/
    $("textarea[name='message']").on('keydown', (event) => {
        let msg = utils.trim($(this).val());
        if (event.keyCode === 13 && msg) {
            socket.send(JSON.stringify({
                type: 'msg',
                from: socket.uid,
                body: msg
            }))
        }
    })
    /* 聊天相关的业务逻辑 end*/
})