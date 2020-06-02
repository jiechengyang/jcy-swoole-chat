# jcy-swoole-chat

# 开发目的
  基于swoole4开发的聊天demo，未使用swoole协程。仅供参考学习。

## *客户端*

​	浏览器pc端基本实现了聊天的功能,肯定存在问题，这个基础版本设计了除用户登录机制，还有一个用户中心的功能，会继续做好它。

 	等工作稳定下来之后，我还要自此之前做一个im聊天，前端框架我找好了，用lay-im或网易-im



### 启动流程

1. 修改[config.js](/websocket/static/js/config.js)下的ws配置

```js
let ChatBaseConfig = {
    wsUrl: 'ws://192.168.0.107:9502',//修改成自己的
}
```

2. 配置一个web站点并访问，此时需要登录，无账号者需要注册（写的时候稍微把密码难度验证加上了，需要字母+数字）

   <img src="/assets/img/login.png" alt="登录" style="zoom:50%;" />

   <img src="/assets/img/reg.png" alt="注册" style="zoom:50%;" />

   <img src="/assets/img/loginAfter.png" alt="登录之后" style="zoom:50%;" />

   3. 换个浏览器登录第二个账号，第一个账号会看到第二个账号在线

      <img src="/assets/img/twoUser.png" alt="用户2登录" style="zoom:50%;" />

      <img src="/assets/img/twoUser2.png" alt="用户2登录" style="zoom:50%;" />

      4. 退出登录，右键点击自己头像，点击退出登录

         <img src="/assets/img/logout.png" alt="退出登录" style="zoom:50%;" />

         5. 开始对话，右键点击你要对话人的头像，点击“发起聊天”

            <img src="/assets/img/talk1.png" alt="对话1" style="zoom:50%;" />

            <img src="/assets/img/talk2.png" alt="对话1" style="zoom:50%;" />

## *服务端*

1. 配置本地文件

   #### touch [/config/common-local.php],内容如下:

```php
return [
    'aes'  => [
        'key' => 'yK6DS3Rh@e1cXgg1',//自己修改
        'iv' => 'T%E3jQIml#9CDJ!g'//自己修改
    ]
];
```
2. Server运行命令

```bash
php init.php -m RedisChatClient
```
```bash
php init.php -m SwooleTableChatClient
```
```bash
php init.php -m ImChat
```
3. 参数说明

   ```b
   -m: 表示三个版本，分别使用三种技术交互
   -d: 守护进程模式运行 如果：php init.php -m redisChatClient -d 1 就会以守护进程运行服务具体参考swoole文档
   ```

   

4. 运行截图

   <img src="/assets/img/startService.png" alt="startService" style="zoom:50%;" />

   ## 部分代码参考

   1. 前端交互代码 [chat.core.js](/websocket/static/js/chat.core,js)

      ```js
      class SocketIO {
          constructor(options) {
              // var _self = this
              this.wsUrl = ChatBaseConfig.wsUrl //'ws://192.168.2.120:9502'
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
      
      ```

      2. 后端主程序代码  [Application.php](/chat/Application.php)

         ```php
         <?php declare(strict_types=1);
         /**
          *
          * @Authors jiechengyang (2064320087@qq.com)
          * @Link    http://www.boomyang.cn
          * @addTime    2019-06-27 14:16:53
          */
         
         namespace chat;
         
         use chat\helper\Color;
         use chat\core\BaseSwoole;
         
         class Application
         {
             private static $_instance;
         
             private static $config;
         
             private static $rootPath;
         
             private static $appFlag = 'chat';
         
             private static $classPath = [];
         
             private static $modes = [
                 'RedisChatClient' => "chat\\client\\RedisChatClient",
                 'SwooleTableChatClient' => "chat\\client\\SwooleTableChatClient",
                 'ImClient' => "client\\ImClient",
             ];
         
             public function __construct($config)
             {
                 self::$config = $config;
             }
         
             public static function getInstance($config)
             {
                 if (is_null(self::$_instance) || !(self::$_instance instanceof self)) {
                     self::$_instance = new self($config);
                 }
         
                 return self::$_instance;
             }
         
             public function run()
             {
                 self::$rootPath = ROOT_PATH;
                 spl_autoload_register(__CLASS__ . '::autoLoader');//get_class()
                 $this->mkdir();
                 $this->errorHandler();
                 $this->draw();
                 $params = getopt('m:d:');
                 if (empty($params['m']) || (!array_key_exists($params['m'], self::$modes))) {
                     Color::showError('please chose: RedisChatClient/SwooleTableChatClient/ImClient three modes');
                     echo PHP_EOL, PHP_EOL;
                     return;
                 }
         
                 $client = self::$modes[$params['m']];
                 if (isset($params['d']) && $params['d'] === '1') {
                     self::$config['socket']['daemonize'] = true;
                 }
         
                 $server = new BaseSwoole(self::$config['socket']);
                 $server->setClient(new $client());
                 $server->run();
         
             }
         
             private function draw()
             {
                 echo <<<IMG
                             .::::.
                                .::::::::.
                               :::::::::::  JSwoole
                           ..:::::::::::'
                         '::::::::::::'
                           .::::::::::
                      '::::::::::::::..
                           ..::::::::::::.
                         ``::::::::::::::::
                          ::::``:::::::::'        .:::.
                         ::::'   ':::::'       .::::::::.
                       .::::'      ::::     .:::::::'::::.
                      .:::'       :::::  .:::::::::' ':::::.
                     .::'        :::::.:::::::::'      ':::::.
                    .::'         ::::::::::::::'         ``::::.
                ...:::           ::::::::::::'              ``::.
               ```` ':.          ':::::::::'                  ::::..
                                  '.:::::'                    ':'````..
         IMG;
                 echo PHP_EOL, PHP_EOL;
             }
         
         
             // get sys config
             public static function getSwooleConfig(): array
             {
                 return self::$config['swoole'];
             }
         
             public static function getRedisConfig(): array
             {
                 return self::$config['redis'];
             }
         
             public static function getUserConfig(): array
             {
                 return self::$config['user'];
             }
         
             public static function getAesConfig(): array
             {
                 return self::$config['aes'];
             }
         
         
             /**
              * 创建框架启动的必要目录（日志、swoole real data）
              */
             public function mkdir(): void
             {
                 if (!is_dir(self::$config['swoole']['log']['path'])) {
                     mkdir(self::$config['swoole']['log']['path'], 0777, true);
                 }
         
             }
         
             private function errorHandler(): void
             {
                 if (SCHAT_DEBUG) {
                     set_exception_handler(__CLASS__ . '::exceptionHandler');
                 } else {
                     error_reporting(E_ALL);
                     ini_set('display_errors', 'Off');
                     ini_set('log_errors', 'On');
                     ini_set('error_log', self::$config['swoole']['log']['path'] . DIRECTORY_SEPARATOR . 'error.log');
                 }
             }
         
             final public static function exceptionHandler($exception): void
             {
                 $exceptionHash = array(
                     'className' => 'Exception',
                     'message' => $exception->getMessage(),
                     'code' => $exception->getCode(),
                     'file' => $exception->getFile(),
                     'line' => $exception->getLine(),
                     'userAgent' => isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : '',
                     'trace' => array(),
                 );
                 if (self::$config['swoole']['log']['trace']) {
                     $traceItems = $exception->getTrace();
                     foreach ($traceItems as $traceItem) {
                         $traceHash = array(
                             'file' => isset($traceItem['file']) ? $traceItem['file'] : 'null',
                             'line' => isset($traceItem['line']) ? $traceItem['line'] : 'null',
                             'function' => isset($traceItem['function']) ? $traceItem['function'] : 'null',
                             'args' => array(),
                         );
         
                         if (!empty($traceItem['class'])) {
                             $traceHash['class'] = $traceItem['class'];
                         }
         
                         if (!empty($traceItem['type'])) {
                             $traceHash['type'] = $traceItem['type'];
                         }
         
                         if (!empty($traceItem['args'])) {
                             foreach ($traceItem['args'] as $argsItem) {
                                 $traceHash['args'][] = \var_export($argsItem, true);
                             }
                         }
         
                         $exceptionHash['trace'][] = $traceHash;
                     }
                 }
                 print_r($exceptionHash);
             }
         
             /**
              * @param $class
              * 自动注册
              */
             final public static function autoLoader($class): void
             {
                 if (isset(self::$classPath[$class])) {
                     require_once "" . self::$classPath[$class] . "";
                     return;
                 }
         
                 $baseClassPath = str_replace('\\', DIRECTORY_SEPARATOR, $class) . '.php';
                 $class = substr($baseClassPath, strpos($baseClassPath, self::$appFlag) + strlen(self::$appFlag) + 1);
                 $classPath = str_replace('\\', DIRECTORY_SEPARATOR, self::$rootPath . DIRECTORY_SEPARATOR . $class);
                 if (is_file($classPath)) {
                     self::$classPath[$class] = $classPath;
                     require_once "{$classPath}";
                     return;
                 }
             }
         }
         ```         

         ## 技术小结

         1. 前端登录存储使用的cookie

         2. 前端聊天记录存储使用的是localstore

         3. 前端聊天记录传输到服务端之间的数据加密 aes对称加密

         4. 服务端使用redis存储数据（用户，登录状态等）
		 5. <font color=red>php严格模式下，需要注意变量类型是否一致</font>

            
         ## 第三方开源库
      
         - [Bootstrap](http://getbootstrap.com/)
         - [Jquery](https://jquery.com/)
         - [layer](https://layer.layui.com/)
         - [crypto-js](https://www.npmjs.com/package/crypto-js)
         - [swoole](https://www.swoole.com/)
         - [websocketTest站主](http://www.websocket-test.com/)
        
            