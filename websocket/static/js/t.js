function init_control() {
    $("#zone_left .list-group").height(window.innerHeight - 225),
    $("#div_msgpanel").width(.52 * (window.innerWidth - 100)),
    $("#div_msgpanel").height(window.innerHeight - 200),
    $("#div_msgbox").height(window.innerHeight - 246),
    $("#div_privmsg").height(window.innerHeight - 246),
    $(".hotrooms_title").width(window.innerWidth - 340 - $("#div_msgpanel").width()),
    $("#hotrooms").height($("#div_msgbox").height() - 152),
    $("#zone_left").show(),
    $("#zone_center").show(),
    1 != $.cookie("isSound") && $.cookie("isSound") ? $("#msg_tips").attr("src", "IMG/sound_off.png") : $("#msg_tips").attr("src", "IMG/sound_on.png")
}
function init_geturlparams() {
    var a = {
        QueryString: function(a) {
            var b = window.location.search,
            c = RegExp("" + a + "=([^&?]*)", "ig");
            return b.match(c) ? b.match(c)[0].substr(a.length + 1) : null
        }
    };
    return null != a.QueryString("rname") ? ($.cookie("room_name", decodeURIComponent(a.QueryString("rname")), {
        expires: 365
    }), $.cookie("room_psw", a.QueryString("rpsw") ? decodeURIComponent(a.QueryString("rpsw")) : cur_rpsw, {
        expires: 365
    }), window.location.href = "index.html", !1) : ($("body").show(), !0)
}
function fun_getnickname(a) {
    $.cookie("user_id") && $.cookie("user_nickname") && $.cookie("room_name") && a ? (ws || fun_initWebSocket(), $("#inp_nickname").val($.cookie("user_nickname"))) : $.getJSON("http://121.40.165.18:28001/Act/h_main.ashx?callback=?", {
        act: "getRanNick"
    },
    function(b) {
        "OK" == b.state ? ($.cookie("user_id") || $.cookie("user_id", b.msg.id, {
            expires: 365
        }), $.cookie("room_name") || $.cookie("room_name", cur_rname, {
            expires: 365
        }), $.cookie("room_psw") || $.cookie("room_psw", cur_rpsw, {
            expires: 365
        }), a ? ($.cookie("user_nickname", b.msg.nickname, {
            expires: 365
        }), $("#inp_nickname").val(b.msg.nickname)) : sendJson("chgname", b.msg.nickname, !0), ws || fun_initWebSocket()) : layer.msg(b.msg, {
            icon: 6
        })
    })
}
function fun_initWebSocket() {
    return isconning ? (layer.msg("正在连接,请稍后..."), void 0) : (isconning = !0, ws = new WebSocket(ws_addr), ws.onopen = function() {
        isconning = !1,
        $("#btn_conn").attr("disabled", !0),
        clearInterval(tick_autoConnect),
        tick_autoConnect = null,
        sendJson("sign", "", !0)
    },
    ws.onmessage = function(a) {
        fun_loading(!1);
        var b = $.parseJSON(a.data);
        switch (b.code) {
        case - 1 : isforceOut = b.forceout,
            layer.alert(b.content, {
                icon: 5,
                title: "注意"
            });
            break;
        case - 2 : layer.msg(b.content);
            break;
        case 1:
            fun_bindList(b);
            break;
        case 2:
            fun_newuser(b);
            break;
        case 3:
            fun_userlogout(b);
            break;
        case 4:
            fun_userchgname(b);
            break;
        case 5:
            fun_recbrodata(b);
            break;
        case 6:
            fun_bindtoallmsg(b);
            break;
        case 7:
            fun_fromusermsg(b);
            break;
        case 8:
            fun_getprivmsg(b);
            break;
        case 9:
            fun_msgrevoke(b);
            break;
        case 10:
            fun_showhotrooms(b)
        }
    },
    ws.onclose = function() {
        isconning = !1,
        $("#btn_conn").attr("disabled", !1),
        clearInterval(tick_heartpac),
        tick_autoConnect || isforceOut || (layer.alert("连接断开,等待重连...", {
            icon: 5,
            title: "提示"
        }), tick_autoConnect = setInterval(function() {
            fun_initWebSocket()
        },
        5e3))
    },
    void 0)
}
function fun_bindList(a) {
    var b, c, d, e;
    for (dic_userlist = {},
    b = a.users_list, c = "", cur_rauthor = a.rauthor, d = 0; d < b.length; d++) b[d].id != $.cookie("user_id") && (dic_userlist[b[d].id] = b[d].nickname, e = b[d].id == cur_rauthor ? "orange": "black", c += "<a id='userid_" + b[d].id + "' class='list-group-item' style='color:" + e + "' onfocus='this.blur()' onclick='click_userlist(id);'>" + "<span class='badge'></span><span style='margin-right:5px;' class='glyphicon glyphicon-user'></span>" + "<span class='nickname'>" + b[d].nickname + "<span></a>");
    cur_rname = a.rname,
    cur_rpsw = a.rpsw,
    $.cookie("room_name", cur_rname, {
        expires: 365
    }),
    $.cookie("room_psw", cur_rpsw, {
        expires: 365
    }),
    fun_inroom_addhistory(cur_rname, cur_rpsw),
    $("#div_msgbox").html(""),
    $("#msg_title").html(cur_rname),
    $("#user_list").html(c),
    $("#nowusers_count").text(b.length),
    layer.msg("欢迎登录 - " + cur_rname + "~"),
    layer.close(index_inroom)
}
function fun_newuser(a) {
    if (!dic_userlist[a.user.id]) {
        var b = a.user.id == cur_rauthor ? "orange": "black";
        $("#user_list").prepend("<a id='userid_" + a.user.id + "' style='color:" + b + "' class='list-group-item' onfocus='this.blur()' onclick='click_userlist(id);'><span class='badge'></span><span style='margin-right:5px;' class='glyphicon glyphicon-user'></span><span class='nickname'>" + a.user.nickname + "</span></a>"),
        dic_userlist[a.user.id] = a.user.nickname,
        $("#nowusers_count").text(parseInt($("#nowusers_count").text()) + 1)
    }
}
function fun_userlogout(a) {
    $("#userid_" + a.user.id).remove(),
    dic_userlist[a.user.id] && (delete dic_userlist[a.user.id], $("#nowusers_count").text(parseInt($("#nowusers_count").text()) - 1), sel_userid == a.user.id && fun_showPublicZone())
}
function fun_userchgname(a) {
    dic_userlist[a.user.id] ? (dic_userlist[a.user.id] = a.user.nickname, $("#userid_" + a.user.id + " .nickname").text(a.user.nickname)) : ($.cookie("user_nickname", a.user.nickname, {
        expires: 365
    }), $("#inp_nickname").val(a.user.nickname)),
    $("#div_msgbox").append('<div class="chat_msg"><div>' + a.user.time + "</div>" + a.user.beforename + "->" + a.user.nickname + "</div>"),
    $("#div_msgbox").scrollTop($("#div_msgbox")[0].scrollHeight)
}
function fun_recbrodata(a) {
    haveTitleTips("新消息"),
    a.user.id == $.cookie("user_id") && (pub_lastSendTime = a.user.time),
    $("#div_msgbox").append(fun_chatbox(a.user, a.code)),
    $("#div_msgbox").scrollTop($("#div_msgbox")[0].scrollHeight)
}
function fun_bindtoallmsg(a) {
    var b, c;
    for ($("#div_msgbox").html(""), b = a.contents_list, c = 0; c < b.length; c++) $("#div_msgbox").append(fun_chatbox(b[c], a.code));
    $("#div_msgbox").scrollTop($("#div_msgbox")[0].scrollHeight)
}
function fun_fromusermsg(a) {
    var d, b = a.fromuser,
    c = a.touser;
    haveTitleTips("新私信"),
    $.cookie("user_id") == b.id ? (pri_lastSendTime[c.id] = b.time, $("#div_privmsg").append(fun_chatbox(b, a.code)), $("#div_privmsg").scrollTop($("#div_privmsg")[0].scrollHeight)) : sel_userid != b.id ? (d = ($("#userid_" + b.id + " .badge").text() ? parseInt($("#userid_" + b.id + " .badge").text()) : 0) + 1, $("#userid_" + b.id + " .badge").text(d), $("#userid_" + b.id).insertBefore($("#user_list")[0].childNodes[0])) : ($("#div_privmsg").append(fun_chatbox(b, a.code)), $("#div_privmsg").scrollTop($("#div_privmsg")[0].scrollHeight))
}
function fun_getprivmsg(a) {
    var c, b = a.contents_list;
    for ($("#div_privmsg").html(""), c = 0; c < b.length; c++) $("#div_privmsg").append(fun_chatbox(b[c], a.code));
    $("#div_msgbox").hide(),
    $("#div_privmsg").show(),
    $("#div_privmsg").scrollTop($("#div_privmsg")[0].scrollHeight)
}
function fun_msgrevoke(a) {
    $("#" + a.user.content).html("<span style='color:#b2b2b2'>撤回一条消息</span>")
}
function click_userlist(a) {
    a = a.split("_")[1],
    sel_userid != a ? ($("#userid_" + sel_userid).removeClass("active"), $("#userid_" + sel_userid).css("color", sel_userid == cur_rauthor ? "orange": "black"), $("#userid_" + a).addClass("active"), $("#userid_" + a).css("color", "white"), $("#msg_title").html('和[<span style="color:orange">' + dic_userlist[a] + "</span>]的聊天记录"), sel_userid = a, ws && 1 == ws.readyState && (fun_loading(!0), sendJson("getprivmsg", sel_userid, !0), $("#userid_" + sel_userid + " .badge").text(""))) : fun_showPublicZone()
}
function fun_showPublicZone() {
    $("#userid_" + sel_userid).css("color", sel_userid == cur_rauthor ? "orange": "black"),
    $("#userid_" + sel_userid).removeClass("active"),
    sel_userid = "",
    $("#msg_title").html(cur_rname),
    $("#div_msgbox").show(),
    $("#div_privmsg").hide(),
    $("#div_msgbox").scrollTop($("#div_msgbox")[0].scrollHeight)
}
function fun_chatbox(a, b) {
    var d, e, f, g, c = "";
    switch (a.code && (b = a.code), b) {
    case 4:
        c = '<div class="chat_msg"><div>' + a.time + "</div>" + a.beforename + " --> " + a.nickname + "</div>";
        break;
    default:
        d = a.id == $.cookie("user_id"),
        e = 8 == b || 7 == b ? $.cookie("user_id") : a.id,
        f = cur_rauthor == e && 8 != b && 7 != b ? "orange": "#6d6d6d",
        g = d ? "<span style='color:#d2d2d2;'>" + a.time + "</span> <span style='font-weight:900;color:" + f + "'>" + a.nickname + "</span>": "<span style='font-weight:900;color:" + f + "'>" + a.nickname + "</span> " + "<span style='color:#d2d2d2;'>" + a.time + "</span>",
        c = "<div class='chatbox' style='" + (d ? "float:right": "float:left") + "' ><div style='text-align:" + (d ? "right": "left") + "'>" + g + "</div>" + "<div class='chatarrow' style='" + (d ? "right:5px;border-bottom: 8px solid #ffe6b8;": "left:5px;border-bottom: 8px solid #cfffcf;") + "'></div><div id='" + (sortID(e) + a.time.replace(/:/g, "_")) + "' class='chat" + (d ? " selfchat": "") + "' style='max-width:" + ($("#div_msgpanel").width() - 50) + "px;'>" + chg_resource(a.content, a.id) + "<br />" + "</div>" + "</div><div class='clearboth'></div>"
    }
    return c
}
function fun_loading(a) {
    a ? isloading = setTimeout(function() {
        index_loading = layer.load()
    },
    100) : (layer.close(index_loading), clearTimeout(isloading))
}
function fun_strtodate(a) {
    var b = new Date;
    return new Date(b.getFullYear() + "/" + (b.getMonth() + 1) + "/" + b.getDate() + " " + a)
}
function haveTitleTips(a) {
    isFocus || tick_titletips ? isFocus || haveSoundTips() : (haveSoundTips(), tick_titletips = setInterval(function() {
        document.title = -1 == document.title.indexOf(a) ? "[" + a + "]-来聊吧": "[　　　]-来聊吧",
        isFocus && (clearInterval(tick_titletips), tick_titletips = null, document.title = "来聊吧")
    },
    500))
}
function haveSoundTips() {
    if (1 == $.cookie("isSound") || !$.cookie("isSound")) {
        var a = document.getElementById("msg_sound");
        a.play()
    }
}
function sortID(a) {
    if (sel_userid) {
        for (var b = 0; 8 > b; b++) if (a[b] != sel_userid[b]) return a[b] > sel_userid[b] ? a + sel_userid: sel_userid + a;
        return a
    }
    return a
}
function sendJson(a, b, c) {
    ws && 1 == ws.readyState && (c && (clearInterval(tick_heartpac), tick_heartpac = setInterval(function() {
        sendJson("heart", "")
    },
    12e4)), ws.send(JSON.stringify({
        rname: $.cookie("room_name"),
        rpsw: $.cookie("room_psw"),
        id: $.cookie("user_id"),
        name: $.cookie("user_nickname"),
        act: a,
        msg: b
    })))
}
function init_initEmoji() {
    var b, a = "";
    for (b in emoji) a += "<span class='item_emoji' id='emoji_" + b + "' onclick='click_emojiItems(id);'  title='" + b + "'><img class='imgitem_emoji' src='" + emoji[b] + "' /></span>";
    $(".emoji").click(function() {
        index_emoji ? (layer.close(index_emoji), index_emoji = null) : index_emoji = layer.tips("<div  class='list_emoji'>" + a + "</div>", ".emoji", {
            tips: [1, "#fff"],
            time: 0,
            area: ["400px", "205px"],
            shift: 5
        })
    })
}
function click_emojiItems(a) {
    $("#inp_say").insertAtCaret(a.split("_")[1]),
    layer.close(index_emoji),
    index_emoji = null
}
function fun_getuploadimg() {
    $.getJSON("Act/h_main.ashx", {
        act: "getUploadImg"
    },
    function(a) { - 1 != a.code && (uploadPic = a.msg)
    })
}
function bind_imgpage() {
    laypage({
        cont: "uploadimg_pages",
        pages: Math.ceil(uploadPic.length / 10),
        first: !1,
        groups: 5,
        last: !1,
        prev: !1,
        next: !1,
        jump: function(a, b) {
            b || bind_imglist(a.curr)
        }
    })
}
function errpic(a) {
    a.src = "IMG/uploadpic.png"
}
function chg_resource(a, b) {
    var g, h, c = a.match(/\[.*?]/gi),
    d = "",
    e = "",
    f = "";
    if (c) for (g = 0; g < c.length; g++) - 1 != c[g].indexOf(".") ? -1 != c[g].indexOf(".wav") ? (e = c[g].replace("[", "").replace("]", ""), e && (a = a.replace(c[g], '<audio controls="controls"><source src="Voice/' + $.trim(e) + '"></audio>'))) : -1 != c[g].indexOf(".rar") ? (f = c[g].replace("[", "").replace("]", ""), f && (h = f.split("|"), a = a.replace(c[g], '<a href="Files/' + h[2] + '" target="_blank">' + '<img style="float:left;" src="IMG/rarico.png" />' + '<div style="float:left;margin-left:5px;font-size:18px;">' + '<div style="margin-bottom:10px;">' + h[0] + '</div><div style="color:orange;">' + h[1] + "kb</div></div></a>"))) : (d = c[g].replace("[", "").replace("]", ""), d && (a = a.replace(c[g], "<a href='IMG/Upload/" + b + "/" + d + "' target='_blank'>" + "<img onerror='errpic(this)' style='max-width:" + .88 * $("#div_msgpanel").width() + "px;' src='IMG/Upload/" + b + "/" + d + "' /></a>"))) : emoji[c[g]] && (a = a.replace(c[g], "<img src='" + emoji[c[g]] + "' />"));
    return a
}
function init_uploadPic() {
    index_img ? (layer.close(index_img), index_img = null) : (index_img = layer.tips("<div id='uploadimg_list' style='height:250px;'></div><button id='uploadimg_upload' class='btn btn-default uploadimg' type='button'><span style='color:orange;margin-right:5px;' class='glyphicon glyphicon-picture'></span><span class='sp_uploadimg'>上传</span></button><div id='uploadimg_pages' style='float:right;margin-top:5px;'></div>", "#a_uploadimg", {
        tips: [1, "#fff"],
        time: 0,
        area: ["390px", "300px"],
        shift: 5
    }), bind_imglist(1), bind_imgpage(), isBeforeUpload = !1, $("#uploadimg_upload").click(function() {
        isUploadStyle = 0,
        isBeforeUpload = !1,
        document.getElementById("uploading_file").click()
    }))
}
function imgupload_file(a) {
    $.ajax({
        url: "Act/h_main.ashx?act=uploadImg",
        type: "POST",
        data: a,
        cache: !1,
        contentType: !1,
        processData: !1,
        success: function(a) {
            var b, c, d;
            if ($("#uploadimg_upload").attr("disabled", !1), $(".sp_uploadimg").text("上传"), isBeforeUpload = !0, $("#uploading_file").val(""), b = $.parseJSON(a), c = !1, "Fail" == b.state) return layer.alert(b.msg, {
                icon: 5,
                title: "上传结果"
            }),
            void 0;
            for (d = 0; d < uploadPic.length; d++) if (uploadPic[d] == b.msg) {
                c = !0;
                break
            }
            c || uploadPic.splice(0, 0, b.msg),
            bind_imglist(1),
            bind_imgpage()
        }
    })
}
function imgupload_base64(a) {
    $("#uploadimg_upload").attr("disabled", !0),
    $(".sp_uploadimg").html("上传中..."),
    $.post("Act/h_main.ashx?act=uploadPhoto", {
        base64str: a
    },
    function(a) {
        var b, c, d;
        if ($("#uploadimg_upload").attr("disabled", !1), $(".sp_uploadimg").text("上传"), isBeforeUpload = !0, $("#uploading_file").val(""), b = $.parseJSON(a), c = !1, "Fail" == b.state) return layer.alert(b.msg, {
            icon: 5,
            title: "上传结果"
        }),
        void 0;
        for (d = 0; d < uploadPic.length; d++) if (uploadPic[d] == b.msg) {
            c = !0;
            break
        }
        c || uploadPic.splice(0, 0, b.msg),
        bind_imglist(1),
        bind_imgpage()
    })
}
function bind_imglist(a) {
    var d, b = "",
    c = "";
    for (d = 10 * (a - 1); 10 * a > d; d++) uploadPic[d] && (c = uploadPic[d].replace(".", "_"), b += "<div style='height:64px;float:left;margin:25px 5px;'><img id='uploadimgitem_" + uploadPic[d].replace(".", "_") + "'onclick='click_selimg(id);' onmouseover='mouseover_zoomimg(id);' onmouseout='mouseout_closezoom();' style='height:64px;width:64px;' src='IMG/Upload/" + $.cookie("user_id") + "/" + uploadPic[d] + "' /></div>");
    $("#uploadimg_list").html(b)
}
function mouseover_zoomimg(a) {
    var b, c;
    index_zoomimg || (b = a.split("_")[1], c = a.split("_")[2], index_zoomimg = layer.tips("<div><img style='max-width:380px;' src='IMG/Upload/" + $.cookie("user_id") + "/" + b + "." + c + "' /></div>", "#" + a, {
        tipsMore: !0,
        tips: [2, "#fff"],
        time: 0,
        area: "auto",
        maxWidth: 400,
        shift: 5
    }))
}
function mouseout_closezoom() {
    layer.close(index_zoomimg),
    index_zoomimg = null
}
function click_selimg(a) {
    var b = a.split("_"),
    c = b[1] + "." + b[2];
    $("#inp_say").insertAtCaret("[" + c + "]"),
    layer.close(index_img),
    index_img = null,
    layer.close(index_zoomimg),
    index_zoomimg = null
}
function init_getphoto() {
    index_getphoto = layer.open({
        type: 2,
        title: !1,
        closeBtn: 0,
        shadeClose: !0,
        area: ["346px", "305px"],
        content: ["GetVideo.html", "no"]
    })
}
function result_getphoto(a) {
    layer.close(index_getphoto);
    var b = $.parseJSON(a);
    "Fail" != b.state ? (isFocus = !0, $("#inp_say").val("[" + b.msg + "]"), $("#btn_say").trigger("click")) : layer.msg("上传照片失败...")
}
function init_record() {
    index_getvoice = layer.open({
        type: 2,
        title: !1,
        closeBtn: 0,
        skin: "layui-layer-rim",
        shadeClose: !0,
        area: ["150px", "150px"],
        content: ["GetVoice.html", "no"]
    })
}
function voice_errordialog(a) {
    layer.close(index_getvoice),
    layer.msg(a)
}
function result_getvoice(a) {
    layer.close(index_getvoice),
    "Fail" != a.state ? (isFocus = !0, $("#inp_say").val("[" + a.msg + "]"), $("#btn_say").trigger("click")) : layer.msg(a.msg)
}
function uploadfile(a) {
    fun_loading(!0),
    $.ajax({
        url: "Act/h_main.ashx?act=uploadfile",
        type: "POST",
        data: a,
        cache: !1,
        contentType: !1,
        processData: !1,
        success: function(a) {
            fun_loading(!1),
            isBeforeUpload = !0,
            $("#uploading_file").val("");
            var b = $.parseJSON(a);
            "OK" == b.state ? ($("#inp_say").val("[" + b.msg + "]"), $("#btn_say").trigger("click")) : layer.msg(b.msg)
        }
    })
}
function init_doodle() {
    index_doodle = layer.open({
        type: 2,
        title: !1,
        closeBtn: 0,
        shadeClose: !0,
        skin: "layui-layer-rim",
        area: ["756px", "415px"],
        content: ["Doodle.html", "no"]
    })
}
function result_doodle(a) {
    layer.close(index_doodle);
    var b = $.parseJSON(a);
    "Fail" != b.state ? (isFocus = !0, $("#inp_say").val("[" + b.msg + "]"), $("#btn_say").trigger("click")) : layer.msg(b.msg)
}
function fun_applyroom(a, b) {
    ws && 1 == ws.readyState ? sendJson("inroom", a + "|" + b, !0) : ($.cookie("room_name", a, {
        expires: 365
    }), $.cookie("room_psw", b, {
        expires: 365
    }), fun_initWebSocket())
}
function fun_inroom() {
    var a = "<div class='inroom_zone'><div class='inroom_leftzone'><input id='inp_roomname' type='text' placeholder='房间名' style='width:170px;margin:12px 10px;' maxlength='10' class='form-control' /><input id='inp_roompsw' type='text' placeholder='密码（默认空）' style='width:170px;margin:20px 10px;' maxlength='6' class='form-control' /><button id='inroom_ok' class='btn btn-success' style='margin:0px 10px;width:170px;' type='button'>进入</button></div><div class='inroom_rightzone' style='overflow-y:auto;'>" + fun_inroom_showhistory() + "</div></div>";
    index_inroom = layer.open({
        type: 1,
        title: "进入/创建房间",
        skin: "demo-class",
        shadeClose: !0,
        closeBtn: 0,
        area: ["400px", "240px"],
        content: a
    }),
    $(".inroom_zone").keydown(function(a) {
        return 13 == a.keyCode ? ($("#inroom_ok").trigger("click"), !1) : void 0
    }),
    $("#inp_roomname").val(cur_rname),
    $("#inroom_ok").click(function() {
        $.trim($("#inp_roomname").val()) && (fun_loading(!0), fun_applyroom($.trim($("#inp_roomname").val()), $.trim($("#inp_roompsw").val())))
    })
}
function fun_inroom_addhistory(a, b) {
    var c = $.cookie("his_rooms") ? $.cookie("his_rooms").split("|") : [],
    d = a + "," + b,
    e = $.inArray(d, c); - 1 == e ? (c.unshift(d), 11 == c.length && c.pop()) : (c.splice(e, 1), c.unshift(d)),
    $.cookie("his_rooms", c.join("|"), {
        expires: 365
    })
}
function fun_inroom_showhistory() {
    var c, d, e, a = "",
    b = $.cookie("his_rooms") ? $.cookie("his_rooms").split("|") : [];
    for (c = 0; c < b.length; c++) d = b[c].split(","),
    e = his_rooms_colors[Math.floor(Math.random() * his_rooms_colors.length)],
    a += "<button type='button' onclick='click_inroom_tag(\"" + d[0] + '","' + d[1] + "\")' class='btn btn-primary btn-xs' style='margin:8px 6px;background-color:" + e + ";border-color:" + e + "'>" + d[0] + "</button>";
    return a
}
function click_inroom_tag(a, b) {
    fun_loading(!0),
    fun_applyroom(a, b)
}
function fun_showhotrooms(a) {
    var d, b = a.hotrooms_list,
    c = "";
    for (d = 0; d < b.length; d++) c += "<div class='class_hotrooms' onclick='click_hotroom(\"" + b[d].rname + '","' + b[d].needpsw + "\")'>" + "<div style='color:#ffe6b8;margin-right:5px;' class='glyphicon glyphicon-home'></div>" + "<div class='label label-info' style='margin-right:5px;'>" + b[d].msgcount + "</div>" + b[d].rname + "<div style='color:orange;margin-left:5px;' class='" + (1 == b[d].needpsw ? "glyphicon glyphicon-pencil": "") + "'></div></div>";
    $("#hotrooms").html(c)
}
function click_hotroom(a, b) {
    0 == b ? (fun_loading(!0), fun_applyroom(a, "")) : (fun_inroom(), $("#inp_roomname").val(a))
}
var ws_addr, ws, tick_heartpac, tick_titletips, tick_autoConnect, isconning, isforceOut, isFocus, isBeforeUpload, isUploadStyle, index_sharelink, pub_lastSendTime, pri_lastSendTime, cur_rname, cur_rpsw, cur_rauthor, emoji, dic_userlist, sel_userid, isloading, index_loading, index_emoji, uploadPic, index_img, index_zoomimg, index_getphoto, index_getvoice, index_doodle, index_inroom, his_rooms_colors, swfobject = function() {
    function A() {
        var a, c, d;
        if (!t) {
            try {
                a = i.getElementsByTagName("body")[0].appendChild(Q("span")),
                a.parentNode.removeChild(a)
            } catch(b) {
                return
            }
            for (t = !0, c = l.length, d = 0; c > d; d++) l[d]()
        }
    }
    function B(a) {
        t ? a() : l[l.length] = a
    }
    function C(b) {
        if (typeof h.addEventListener != a) h.addEventListener("load", b, !1);
        else if (typeof i.addEventListener != a) i.addEventListener("load", b, !1);
        else if (typeof h.attachEvent != a) R(h, "onload", b);
        else if ("function" == typeof h.onload) {
            var c = h.onload;
            h.onload = function() {
                c(),
                b()
            }
        } else h.onload = b
    }
    function D() {
        k ? E() : F()
    }
    function E() {
        var f, g, c = i.getElementsByTagName("body")[0],
        d = Q(b);
        d.setAttribute("type", e),
        f = c.appendChild(d),
        f ? (g = 0,
        function() {
            if (typeof f.GetVariable != a) {
                var b = f.GetVariable("$version");
                b && (b = b.split(" ")[1].split(","), y.pv = [parseInt(b[0], 10), parseInt(b[1], 10), parseInt(b[2], 10)])
            } else if (10 > g) return g++,
            setTimeout(arguments.callee, 10),
            void 0;
            c.removeChild(d),
            f = null,
            F()
        } ()) : F()
    }
    function F() {
        var c, d, e, f, g, h, i, j, k, l, n, b = m.length;
        if (b > 0) for (c = 0; b > c; c++) if (d = m[c].id, e = m[c].callbackFn, f = {
            success: !1,
            id: d
        },
        y.pv[0] > 0) {
            if (g = P(d)) if (!S(m[c].swfVersion) || y.wk && y.wk < 312) if (m[c].expressInstall && H()) {
                for (h = {},
                h.data = m[c].expressInstall, h.width = g.getAttribute("width") || "0", h.height = g.getAttribute("height") || "0", g.getAttribute("class") && (h.styleclass = g.getAttribute("class")), g.getAttribute("align") && (h.align = g.getAttribute("align")), i = {},
                j = g.getElementsByTagName("param"), k = j.length, l = 0; k > l; l++)"movie" != j[l].getAttribute("name").toLowerCase() && (i[j[l].getAttribute("name")] = j[l].getAttribute("value"));
                I(h, i, d, e)
            } else J(g),
            e && e(f);
            else U(d, !0),
            e && (f.success = !0, f.ref = G(d), e(f))
        } else U(d, !0),
        e && (n = G(d), n && typeof n.SetVariable != a && (f.success = !0, f.ref = n), e(f))
    }
    function G(c) {
        var f, d = null,
        e = P(c);
        return e && "OBJECT" == e.nodeName && (typeof e.SetVariable != a ? d = e: (f = e.getElementsByTagName(b)[0], f && (d = f))),
        d
    }
    function H() {
        return ! u && S("6.0.65") && (y.win || y.mac) && !(y.wk && y.wk < 312)
    }
    function I(b, c, d, e) {
        var g, j, k, l;
        u = !0,
        r = e || null,
        s = {
            success: !1,
            id: d
        },
        g = P(d),
        g && ("OBJECT" == g.nodeName ? (p = K(g), q = null) : (p = g, q = d), b.id = f, (typeof b.width == a || !/%$/.test(b.width) && parseInt(b.width, 10) < 310) && (b.width = "310"), (typeof b.height == a || !/%$/.test(b.height) && parseInt(b.height, 10) < 137) && (b.height = "137"), i.title = i.title.slice(0, 47) + " - Flash Player Installation", j = y.ie && y.win ? "ActiveX": "PlugIn", k = "MMredirectURL=" + ("" + h.location).replace(/&/g, "%26") + "&MMplayerType=" + j + "&MMdoctitle=" + i.title, typeof c.flashvars != a ? c.flashvars += "&" + k: c.flashvars = k, y.ie && y.win && 4 != g.readyState && (l = Q("div"), d += "SWFObjectNew", l.setAttribute("id", d), g.parentNode.insertBefore(l, g), g.style.display = "none",
        function() {
            4 == g.readyState ? g.parentNode.removeChild(g) : setTimeout(arguments.callee, 10)
        } ()), L(b, c, d))
    }
    function J(a) {
        if (y.ie && y.win && 4 != a.readyState) {
            var b = Q("div");
            a.parentNode.insertBefore(b, a),
            b.parentNode.replaceChild(K(a), b),
            a.style.display = "none",
            function() {
                4 == a.readyState ? a.parentNode.removeChild(a) : setTimeout(arguments.callee, 10)
            } ()
        } else a.parentNode.replaceChild(K(a), a)
    }
    function K(a) {
        var d, e, f, g, c = Q("div");
        if (y.win && y.ie) c.innerHTML = a.innerHTML;
        else if (d = a.getElementsByTagName(b)[0], d && (e = d.childNodes)) for (f = e.length, g = 0; f > g; g++) 1 == e[g].nodeType && "PARAM" == e[g].nodeName || 8 == e[g].nodeType || c.appendChild(e[g].cloneNode(!0));
        return c
    }
    function L(c, d, f) {
        var g, i, j, k, l, m, o, p, h = P(f);
        if (y.wk && y.wk < 312) return g;
        if (h) if (typeof c.id == a && (c.id = f), y.ie && y.win) {
            i = "";
            for (j in c) c[j] != Object.prototype[j] && ("data" == j.toLowerCase() ? d.movie = c[j] : "styleclass" == j.toLowerCase() ? i += ' class="' + c[j] + '"': "classid" != j.toLowerCase() && (i += " " + j + '="' + c[j] + '"'));
            k = "";
            for (l in d) d[l] != Object.prototype[l] && (k += '<param name="' + l + '" value="' + d[l] + '" />');
            h.outerHTML = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"' + i + ">" + k + "</object>",
            n[n.length] = c.id,
            g = P(c.id)
        } else {
            m = Q(b),
            m.setAttribute("type", e);
            for (o in c) c[o] != Object.prototype[o] && ("styleclass" == o.toLowerCase() ? m.setAttribute("class", c[o]) : "classid" != o.toLowerCase() && m.setAttribute(o, c[o]));
            for (p in d) d[p] != Object.prototype[p] && "movie" != p.toLowerCase() && M(m, p, d[p]);
            h.parentNode.replaceChild(m, h),
            g = m
        }
        return g
    }
    function M(a, b, c) {
        var d = Q("param");
        d.setAttribute("name", b),
        d.setAttribute("value", c),
        a.appendChild(d)
    }
    function N(a) {
        var b = P(a);
        b && "OBJECT" == b.nodeName && (y.ie && y.win ? (b.style.display = "none",
        function() {
            4 == b.readyState ? O(a) : setTimeout(arguments.callee, 10)
        } ()) : b.parentNode.removeChild(b))
    }
    function O(a) {
        var c, b = P(a);
        if (b) {
            for (c in b)"function" == typeof b[c] && (b[c] = null);
            b.parentNode.removeChild(b)
        }
    }
    function P(a) {
        var b = null;
        try {
            b = i.getElementById(a)
        } catch(c) {}
        return b
    }
    function Q(a) {
        return i.createElement(a)
    }
    function R(a, b, c) {
        a.attachEvent(b, c),
        o[o.length] = [a, b, c]
    }
    function S(a) {
        var b = y.pv,
        c = a.split(".");
        return c[0] = parseInt(c[0], 10),
        c[1] = parseInt(c[1], 10) || 0,
        c[2] = parseInt(c[2], 10) || 0,
        b[0] > c[0] || b[0] == c[0] && b[1] > c[1] || b[0] == c[0] && b[1] == c[1] && b[2] >= c[2] ? !0 : !1
    }
    function T(c, d, e, f) {
        var g, h, j;
        y.ie && y.mac || (g = i.getElementsByTagName("head")[0], g && (h = e && "string" == typeof e ? e: "screen", f && (v = null, w = null), v && w == h || (j = Q("style"), j.setAttribute("type", "text/css"), j.setAttribute("media", h), v = g.appendChild(j), y.ie && y.win && typeof i.styleSheets != a && i.styleSheets.length > 0 && (v = i.styleSheets[i.styleSheets.length - 1]), w = h), y.ie && y.win ? v && typeof v.addRule == b && v.addRule(c, d) : v && typeof i.createTextNode != a && v.appendChild(i.createTextNode(c + " {" + d + "}"))))
    }
    function U(a, b) {
        if (x) {
            var c = b ? "visible": "hidden";
            t && P(a) ? P(a).style.visibility = c: T("#" + a, "visibility:" + c)
        }
    }
    function V(b) {
        var c = /[\\\"<>\.;]/,
        d = null != c.exec(b);
        return d && typeof encodeURIComponent != a ? encodeURIComponent(b) : b
    }
    var p, q, r, s, v, w, a = "undefined",
    b = "object",
    c = "Shockwave Flash",
    d = "ShockwaveFlash.ShockwaveFlash",
    e = "application/x-shockwave-flash",
    f = "SWFObjectExprInst",
    g = "onreadystatechange",
    h = window,
    i = document,
    j = navigator,
    k = !1,
    l = [D],
    m = [],
    n = [],
    o = [],
    t = !1,
    u = !1,
    x = !0,
    y = function() {
        var s, f = typeof i.getElementById != a && typeof i.getElementsByTagName != a && typeof i.createElement != a,
        g = j.userAgent.toLowerCase(),
        l = j.platform.toLowerCase(),
        m = l ? /win/.test(l) : /win/.test(g),
        n = l ? /mac/.test(l) : /mac/.test(g),
        o = /webkit/.test(g) ? parseFloat(g.replace(/^.*webkit\/(\d+(\.\d+)?).*$/, "$1")) : !1,
        p = !1,
        q = [0, 0, 0],
        r = null;
        if (typeof j.plugins != a && typeof j.plugins[c] == b) r = j.plugins[c].description,
        !r || typeof j.mimeTypes != a && j.mimeTypes[e] && !j.mimeTypes[e].enabledPlugin || (k = !0, p = !1, r = r.replace(/^.*\s+(\S+\s+\S+$)/, "$1"), q[0] = parseInt(r.replace(/^(.*)\..*$/, "$1"), 10), q[1] = parseInt(r.replace(/^.*\.(.*)\s.*$/, "$1"), 10), q[2] = /[a-zA-Z]/.test(r) ? parseInt(r.replace(/^.*[a-zA-Z]+(.*)$/, "$1"), 10) : 0);
        else if (typeof h.ActiveXObject != a) try {
            s = new ActiveXObject(d),
            s && (r = s.GetVariable("$version"), r && (p = !0, r = r.split(" ")[1].split(","), q = [parseInt(r[0], 10), parseInt(r[1], 10), parseInt(r[2], 10)]))
        } catch(t) {}
        return {
            w3: f,
            pv: q,
            wk: o,
            ie: p,
            win: m,
            mac: n
        }
    } ();
    return function() {
        y.w3 && ((typeof i.readyState != a && "complete" == i.readyState || typeof i.readyState == a && (i.getElementsByTagName("body")[0] || i.body)) && A(), t || (typeof i.addEventListener != a && i.addEventListener("DOMContentLoaded", A, !1), y.ie && y.win && (i.attachEvent(g,
        function() {
            "complete" == i.readyState && (i.detachEvent(g, arguments.callee), A())
        }), h == top &&
        function() {
            if (!t) {
                try {
                    i.documentElement.doScroll("left")
                } catch(a) {
                    return setTimeout(arguments.callee, 0),
                    void 0
                }
                A()
            }
        } ()), y.wk &&
        function() {
            return t ? void 0 : /loaded|complete/.test(i.readyState) ? (A(), void 0) : (setTimeout(arguments.callee, 0), void 0)
        } (), C(A)))
    } (),
    function() {
        y.ie && y.win && window.attachEvent("onunload",
        function() {
            var b, c, d, e, f, a = o.length;
            for (b = 0; a > b; b++) o[b][0].detachEvent(o[b][1], o[b][2]);
            for (c = n.length, d = 0; c > d; d++) N(n[d]);
            for (e in y) y[e] = null;
            y = null;
            for (f in swfobject) swfobject[f] = null;
            swfobject = null
        })
    } (),
    {
        registerObject: function(a, b, c, d) {
            if (y.w3 && a && b) {
                var e = {};
                e.id = a,
                e.swfVersion = b,
                e.expressInstall = c,
                e.callbackFn = d,
                m[m.length] = e,
                U(a, !1)
            } else d && d({
                success: !1,
                id: a
            })
        },
        getObjectById: function(a) {
            return y.w3 ? G(a) : void 0
        },
        embedSWF: function(c, d, e, f, g, h, i, j, k, l) {
            var m = {
                success: !1,
                id: d
            };
            y.w3 && !(y.wk && y.wk < 312) && c && d && e && f && g ? (U(d, !1), B(function() {
                var n, o, p, q, r, s;
                if (e += "", f += "", n = {},
                k && typeof k === b) for (o in k) n[o] = k[o];
                if (n.data = c, n.width = e, n.height = f, p = {},
                j && typeof j === b) for (q in j) p[q] = j[q];
                if (i && typeof i === b) for (r in i) typeof p.flashvars != a ? p.flashvars += "&" + r + "=" + i[r] : p.flashvars = r + "=" + i[r];
                if (S(g)) s = L(n, p, d),
                n.id == d && U(d, !0),
                m.success = !0,
                m.ref = s;
                else {
                    if (h && H()) return n.data = h,
                    I(n, p, d, l),
                    void 0;
                    U(d, !0)
                }
                l && l(m)
            })) : l && l(m)
        },
        switchOffAutoHideShow: function() {
            x = !1
        },
        ua: y,
        getFlashPlayerVersion: function() {
            return {
                major: y.pv[0],
                minor: y.pv[1],
                release: y.pv[2]
            }
        },
        hasFlashPlayerVersion: S,
        createSWF: function(a, b, c) {
            return y.w3 ? L(a, b, c) : void 0
        },
        showExpressInstall: function(a, b, c, d) {
            y.w3 && H() && I(a, b, c, d)
        },
        removeSWF: function(a) {
            y.w3 && N(a)
        },
        createCSS: function(a, b, c, d) {
            y.w3 && T(a, b, c, d)
        },
        addDomLoadEvent: B,
        addLoadEvent: C,
        getQueryParamValue: function(a) {
            var c, d, b = i.location.search || i.location.hash;
            if (b) {
                if (/\?/.test(b) && (b = b.split("?")[1]), null == a) return V(b);
                for (c = b.split("&"), d = 0; d < c.length; d++) if (c[d].substring(0, c[d].indexOf("=")) == a) return V(c[d].substring(c[d].indexOf("=") + 1))
            }
            return ""
        },
        expressInstallCallback: function() {
            if (u) {
                var a = P(f);
                a && p && (a.parentNode.replaceChild(p, a), q && (U(q, !0), y.ie && y.win && (p.style.display = "block")), r && r(s)),
                u = !1
            }
        }
    }
} (); !
function() {
    if (window.WEB_SOCKET_FORCE_FLASH);
    else {
        if (window.WebSocket) return;
        if (window.MozWebSocket) return window.WebSocket = MozWebSocket,
        void 0
    }
    var a;
    return a = window.WEB_SOCKET_LOGGER ? WEB_SOCKET_LOGGER: window.console && window.console.log && window.console.error ? window.console: {
        log: function() {},
        error: function() {}
    },
    swfobject.getFlashPlayerVersion().major < 10 ? (a.error("Flash Player >= 10.0.0 is required."), void 0) : ("file:" == location.protocol && a.error("WARNING: web-socket-js doesn't work in file:///... URL unless you set Flash Security Settings properly. Open the page via Web server i.e. http://..."), window.WebSocket = function(a, b, c, d, e) {
        var f = this;
        f.__id = WebSocket.__nextId++,
        WebSocket.__instances[f.__id] = f,
        f.readyState = WebSocket.CONNECTING,
        f.bufferedAmount = 0,
        f.__events = {},
        b ? "string" == typeof b && (b = [b]) : b = [],
        f.__createTask = setTimeout(function() {
            WebSocket.__addTask(function() {
                f.__createTask = null,
                WebSocket.__flash.create(f.__id, a, b, c || null, d || 0, e || null)
            })
        },
        0)
    },
    WebSocket.prototype.send = function(a) {
        if (this.readyState == WebSocket.CONNECTING) throw "INVALID_STATE_ERR: Web Socket connection has not been established";
        var b = WebSocket.__flash.send(this.__id, encodeURIComponent(a));
        return 0 > b ? !0 : (this.bufferedAmount += b, !1)
    },
    WebSocket.prototype.close = function() {
        return this.__createTask ? (clearTimeout(this.__createTask), this.__createTask = null, this.readyState = WebSocket.CLOSED, void 0) : (this.readyState != WebSocket.CLOSED && this.readyState != WebSocket.CLOSING && (this.readyState = WebSocket.CLOSING, WebSocket.__flash.close(this.__id)), void 0)
    },
    WebSocket.prototype.addEventListener = function(a, b) {
        a in this.__events || (this.__events[a] = []),
        this.__events[a].push(b)
    },
    WebSocket.prototype.removeEventListener = function(a, b) {
        var d, e;
        if (a in this.__events) for (d = this.__events[a], e = d.length - 1; e >= 0; --e) if (d[e] === b) {
            d.splice(e, 1);
            break
        }
    },
    WebSocket.prototype.dispatchEvent = function(a) {
        var c, d, b = this.__events[a.type] || [];
        for (c = 0; c < b.length; ++c) b[c](a);
        d = this["on" + a.type],
        d && d.apply(this, [a])
    },
    WebSocket.prototype.__handleEvent = function(a) {
        var b, c;
        if ("readyState" in a && (this.readyState = a.readyState), "protocol" in a && (this.protocol = a.protocol), "open" == a.type || "error" == a.type) b = this.__createSimpleEvent(a.type);
        else if ("close" == a.type) b = this.__createSimpleEvent("close"),
        b.wasClean = a.wasClean ? !0 : !1,
        b.code = a.code,
        b.reason = a.reason;
        else {
            if ("message" != a.type) throw "unknown event type: " + a.type;
            c = decodeURIComponent(a.message),
            b = this.__createMessageEvent("message", c)
        }
        this.dispatchEvent(b)
    },
    WebSocket.prototype.__createSimpleEvent = function(a) {
        if (document.createEvent && window.Event) {
            var b = document.createEvent("Event");
            return b.initEvent(a, !1, !1),
            b
        }
        return {
            type: a,
            bubbles: !1,
            cancelable: !1
        }
    },
    WebSocket.prototype.__createMessageEvent = function(a, b) {
        if (window.MessageEvent && "function" == typeof MessageEvent && !window.opera) return new MessageEvent("message", {
            view: window,
            bubbles: !1,
            cancelable: !1,
            data: b
        });
        if (document.createEvent && window.MessageEvent && !window.opera) {
            var c = document.createEvent("MessageEvent");
            return c.initMessageEvent("message", !1, !1, b, null, null, window, null),
            c
        }
        return {
            type: a,
            data: b,
            bubbles: !1,
            cancelable: !1
        }
    },
    WebSocket.CONNECTING = 0, WebSocket.OPEN = 1, WebSocket.CLOSING = 2, WebSocket.CLOSED = 3, WebSocket.__isFlashImplementation = !0, WebSocket.__initialized = !1, WebSocket.__flash = null, WebSocket.__instances = {},
    WebSocket.__tasks = [], WebSocket.__nextId = 0, WebSocket.loadFlashPolicyFile = function(a) {
        WebSocket.__addTask(function() {
            WebSocket.__flash.loadManualPolicyFile(a)
        })
    },
    WebSocket.__initialize = function() {
        var b, c, d;
        if (!WebSocket.__initialized) {
            if (WebSocket.__initialized = !0, WebSocket.__swfLocation && (window.WEB_SOCKET_SWF_LOCATION = WebSocket.__swfLocation), !window.WEB_SOCKET_SWF_LOCATION) return a.error("[WebSocket] set WEB_SOCKET_SWF_LOCATION to location of WebSocketMain.swf"),
            void 0;
            window.WEB_SOCKET_SUPPRESS_CROSS_DOMAIN_SWF_ERROR || WEB_SOCKET_SWF_LOCATION.match(/(^|\/)WebSocketMainInsecure\.swf(\?.*)?$/) || !WEB_SOCKET_SWF_LOCATION.match(/^\w+:\/\/([^\/]+)/) || (b = RegExp.$1, location.host != b && a.error("[WebSocket] You must host HTML and WebSocketMain.swf in the same host ('" + location.host + "' != '" + b + "'). " + "See also 'How to host HTML file and SWF file in different domains' section " + "in README.md. If you use WebSocketMainInsecure.swf, you can suppress this message " + "by WEB_SOCKET_SUPPRESS_CROSS_DOMAIN_SWF_ERROR = true;")),
            c = document.createElement("div"),
            c.id = "webSocketContainer",
            c.style.position = "absolute",
            WebSocket.__isFlashLite() ? (c.style.left = "0px", c.style.top = "0px") : (c.style.left = "-100px", c.style.top = "-100px"),
            d = document.createElement("div"),
            d.id = "webSocketFlash",
            c.appendChild(d),
            document.body.appendChild(c),
            swfobject.embedSWF(WEB_SOCKET_SWF_LOCATION, "webSocketFlash", "1", "1", "10.0.0", null, null, {
                hasPriority: !0,
                swliveconnect: !0,
                allowScriptAccess: "always"
            },
            null,
            function(b) {
                b.success || a.error("[WebSocket] swfobject.embedSWF failed")
            })
        }
    },
    WebSocket.__onFlashInitialized = function() {
        setTimeout(function() {
            WebSocket.__flash = document.getElementById("webSocketFlash"),
            WebSocket.__flash.setCallerUrl(location.href),
            WebSocket.__flash.setDebug( !! window.WEB_SOCKET_DEBUG);
            for (var a = 0; a < WebSocket.__tasks.length; ++a) WebSocket.__tasks[a]();
            WebSocket.__tasks = []
        },
        0)
    },
    WebSocket.__onFlashEvent = function() {
        return setTimeout(function() {
            var b, c;
            try {
                for (b = WebSocket.__flash.receiveEvents(), c = 0; c < b.length; ++c) WebSocket.__instances[b[c].webSocketId].__handleEvent(b[c])
            } catch(d) {
                a.error(d)
            }
        },
        0),
        !0
    },
    WebSocket.__log = function(b) {
        a.log(decodeURIComponent(b))
    },
    WebSocket.__error = function(b) {
        a.error(decodeURIComponent(b))
    },
    WebSocket.__addTask = function(a) {
        WebSocket.__flash ? a() : WebSocket.__tasks.push(a)
    },
    WebSocket.__isFlashLite = function() {
        if (!window.navigator || !window.navigator.mimeTypes) return ! 1;
        var a = window.navigator.mimeTypes["application/x-shockwave-flash"];
        return a && a.enabledPlugin && a.enabledPlugin.filename ? a.enabledPlugin.filename.match(/flashlite/i) ? !0 : !1 : !1
    },
    window.WEB_SOCKET_DISABLE_AUTO_INITIALIZATION || swfobject.addDomLoadEvent(function() {
        WebSocket.__initialize()
    }), void 0)
} (),
function(a) {
    "function" == typeof define && define.amd ? define(["jquery"], a) : a(jQuery)
} (function(a) {
    function c(a) {
        return h.raw ? a: encodeURIComponent(a)
    }
    function d(a) {
        return h.raw ? a: decodeURIComponent(a)
    }
    function e(a) {
        return c(h.json ? JSON.stringify(a) : a + "")
    }
    function f(a) {
        0 === a.indexOf('"') && (a = a.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\"));
        try {
            a = decodeURIComponent(a.replace(b, " "))
        } catch(c) {
            return
        }
        try {
            return h.json ? JSON.parse(a) : a
        } catch(c) {}
    }
    function g(b, c) {
        var d = h.raw ? b: f(b);
        return a.isFunction(c) ? c(d) : d
    }
    var b = /\+/g,
    h = a.cookie = function(b, f, i) {
        var j, k, l, m, n, o, p, q, r;
        if (void 0 !== f && !a.isFunction(f)) return i = a.extend({},
        h.defaults, i),
        "number" == typeof i.expires && (j = i.expires, k = i.expires = new Date, k.setDate(k.getDate() + j)),
        document.cookie = [c(b), "=", e(f), i.expires ? "; expires=" + i.expires.toUTCString() : "", i.path ? "; path=" + i.path: "", i.domain ? "; domain=" + i.domain: "", i.secure ? "; secure": ""].join("");
        for (l = b ? void 0 : {},
        m = document.cookie ? document.cookie.split("; ") : [], n = 0, o = m.length; o > n; n++) {
            if (p = m[n].split("="), q = d(p.shift()), r = p.join("="), b && b === q) {
                l = g(r, f);
                break
            }
            b || void 0 === (r = g(r)) || (l[q] = r)
        }
        return l
    };
    h.defaults = {},
    a.removeCookie = function(b, c) {
        return void 0 !== a.cookie(b) ? (a.cookie(b, "", a.extend({},
        c, {
            expires: -1
        })), !0) : !1
    }
}),
WEB_SOCKET_SWF_LOCATION = "PLUG/WebSocketMain.swf",
ws_addr = "ws://121.40.165.18:8801",
ws = null,
tick_heartpac = null,
tick_titletips = null,
tick_autoConnect = null,
isconning = !1,
isforceOut = !1,
isFocus = !0,
isBeforeUpload = !1,
isUploadStyle = 0,
index_sharelink = null,
pub_lastSendTime = "",
pri_lastSendTime = {},
cur_rname = "公共场所",
cur_rpsw = "",
cur_rauthor = "",
emoji = {
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
dic_userlist = {},
sel_userid = "",
$(function() {
    init_geturlparams() && (init_initEmoji(), init_control(), fun_getnickname(!0), fun_getuploadimg(), window.onblur = function() {
        isFocus = !1
    },
    window.onfocus = function() {
        isFocus = !0
    },
    window.onmousedown = function(a) {
        var b = a.target.id ? a.target.id: a.target.className;
        "layui-layer-content" != b && -1 == a.target.outerHTML.indexOf("data-page") && ( - 1 == b.indexOf("emoji") && (layer.close(index_emoji), index_emoji = null), -1 == b.indexOf("uploadimg") && (layer.close(index_img), index_img = null), -1 == b.indexOf("sharelink") && (layer.close(index_sharelink), index_sharelink = null))
    },
    $("#btn_inroom").click(function() {
        fun_inroom()
    }), $("#btn_getnick").click(function() {
        fun_getnickname(!1)
    }), $("#inp_nickname").change(function() {
        $.trim($("#inp_nickname").val()) && sendJson("chgname", $.trim($("#inp_nickname").val()), !0)
    }), $("#btn_say").click(function() {
        var a = $.trim($("#inp_say").val());
        if (ws && 1 == ws.readyState) {
            if (!a) return layer.msg("不能输入空字符"),
            void 0;
            sel_userid ? sendJson("touser_" + sel_userid + "_" + dic_userlist[sel_userid], a, !0) : sendJson("toall", a, !0),
            $("#inp_say").val("")
        } else layer.msg("你已经离线，请先连接")
    }), $("#btn_conn").click(function() {
        fun_initWebSocket()
    }), $("#inp_say").keydown(function(a) {
        return 13 == a.keyCode && a.ctrlKey ? ($("#btn_say").trigger("click"), !1) : void 0
    }), $("#user_count").click(function() {
        fun_showPublicZone()
    }), $("#a_uploadimg").click(function() {
        init_uploadPic()
    }), $("#a_uploadfile").click(function() {
        isUploadStyle = 1,
        isBeforeUpload = !1,
        document.getElementById("uploading_file").click()
    }), $("#a_getphoto").click(function() {
        init_getphoto()
    }), $("#a_record").click(function() {
        init_record()
    }), $("#a_doodle").click(function() {
        init_doodle()
    }), $("#msg_tips").click(function() {
        1 != $.cookie("isSound") && $.cookie("isSound") ? ($.cookie("isSound", 1, {
            expires: 365
        }), $("#msg_tips").attr("src", "IMG/sound_on.png")) : ($.cookie("isSound", -1, {
            expires: 365
        }), $("#msg_tips").attr("src", "IMG/sound_off.png"))
    }), $("#msg_clear").click(function() {
        var a = layer.confirm("是否确定清除记录？", {
            skin: "demo-class",
            btn: ["确定", "取消"]
        },
        function() {
            layer.close(a),
            $("#div_msgbox").html("")
        })
    }), $("#msg_back").click(function() {
        var b, a = sel_userid ? pri_lastSendTime[sel_userid] ? sel_userid + "_" + pri_lastSendTime[sel_userid] : "": pub_lastSendTime;
        ws && 1 == ws.readyState && a && (b = layer.confirm("是否确定撤回最新消息？", {
            skin: "demo-class",
            btn: ["确定", "取消"]
        },
        function() { - 1 != a.indexOf("_") ? pri_lastSendTime[sel_userid] = "": pub_lastSendTime = "",
            layer.close(b),
            fun_loading(!0),
            sendJson("msgrevoke", a, !0)
        }))
    }), $("#sharelink").click(function() {
        index_sharelink ? (layer.close(index_sharelink), index_sharelink = null) : (index_sharelink = layer.tips("<div style='color:#000;margin:10px 10px'><input id='sharelink_link' type='text' class='form-control' value=" + window.location.href + "?rname=" + cur_rname + (cur_rpsw ? "&rpsw=" + cur_rpsw: "") + " />" + "<div id='sharelink_state' style='float:left;margin:15px 0px;font-size:16px;color:green;'>当前房间的链接url</div>" + "</div>", "#sharelink", {
            tips: [1, "#fff"],
            time: 0,
            area: ["400px", "105px"],
            shift: 5
        }), $("#sharelink_link").click(function() {
            this.select()
        }))
    }), $("#uploading_file").change(function() {
        var a, b, c;
        if (!isBeforeUpload) if (a = document.getElementById("uploading_file").files[0], b = a.size / 1024, c = new FormData, c.append("upload_file", a), 0 == isUploadStyle) if ( - 1 != a.name.toLowerCase().indexOf(".gif")) {
            if (b > 500) return isBeforeUpload = !0,
            $("#uploading_file").val(""),
            layer.msg("gif图片上传失败,当前最大限制500kb"),
            !1;
            imgupload_file(c)
        } else b > 500 ? ($("#uploadimg_upload").attr("disabled", !0), $(".sp_uploadimg").html("上传中..."), lrz(this.files[0], {
            width: 500
        },
        function(a) {
            imgupload_base64(a.base64)
        })) : imgupload_file(c);
        else if (1 == isUploadStyle) {
            if (b > 5120) return isBeforeUpload = !0,
            $("#uploading_file").val(""),
            layer.msg("压缩包的大小不得超过5MB"),
            void 0;
            uploadfile(c)
        }
    }))
}),
$.fn.extend({
    insertAtCaret: function(a) {
        var c, d, e, b = $(this)[0];
        document.selection ? (this.focus(), sel = document.selection.createRange(), sel.text = a, this.focus()) : b.selectionStart || "0" == b.selectionStart ? (c = b.selectionStart, d = b.selectionEnd, e = b.scrollTop, b.value = b.value.substring(0, c) + a + b.value.substring(d, b.value.length), this.focus(), b.selectionStart = c + a.length, b.selectionEnd = c + a.length, b.scrollTop = e) : (this.value += a, this.focus())
    }
}),
isloading = null,
index_emoji = 0,
uploadPic = [],
index_img = null,
index_zoomimg = null,
his_rooms_colors = ["#7c0000", "#0a4e1d", "#091f77", "#d08700", "#2c2c2c", "#540051", "#007a7c", "#3f7095", "#28a15b", "#000000"];