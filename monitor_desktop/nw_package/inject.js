var is_nwjs = (typeof nw != 'undefined');
var is_nwjsdev = is_nwjs && (window.navigator.plugins.namedItem('Native Client') !== null);
function empty(o) {
    return o==null || o==undefined || o==0 || o.length==0;
}
var in_monitor = window.location.href.indexOf('monitor.server.com')!=-1;
var logged_in = 0;
if(typeof($)!='undefined') {
    if (is_nwjsdev)
        nw.Window.get().showDevTools();
    $(document).ready(function(){
        if (in_monitor) {
            // 在·monitor页面里，1小时后刷新一次页面
            setTimeout(function(){
                window.location.reload();
            }, 60*60*1000);
            // 在·monitor页面里，2秒后检查是否是登录态界面
            setTimeout(function(){
                logged_in = $('#menubar').children().length!=0;
            }, 1000);
        }
    });
}
function adjustJSON(t){
    var lines = t.split("\n");
    var ret = '';
    for(var i=0; i<lines.length; ++i) {
        var idx = lines[i].indexOf(':');
        if (idx<1) {
            ret += lines[i]+'\n';
        } else {
            ret += '"'+lines[i].substr(0,idx).trim()+'"'+lines[i].substring(idx)+'\n';
        }
    }
    return ret;
}
function loadAlert(cb_win) {
    $.ajax({
        url:'/alert', 
        cache:false, 
        dataType:'text',
        async: true,
        method: "POST",
        data: {
            action:"myalert",
            "alertrecordbean.keywords":"",
            "alertrecordbean.mixids":"",
            "alertrecordbean.my":true,
            limit:100,
            moduleid:1
        },
        timeout:4000,
        success:function(t){
            // 报警后台返回的json的key都缺少双引号，使用正则处理加上双引号后才能正常解析
            if (t.length<=1) {
                // 没有返回正常json内容，通常是因为登录已超时
                if (cb_win.first_switch_to_not_logged_in==0)
                    first_switch_to_not_logged_in = (new Date()).getTime()/1000;
                return;
            }
            t = adjustJSON(t);
            var data = JSON.parse(t);
            if (!empty(data)) {
                cb_win.updateAlertList(data.data);
            }
        },
        error:function(req,txtstatus,msg){
            if(txtstatus!='timeout')
                console.log('加载报警数据出错');
            else
                console.log('加载报警数据超时');
        }
    });
}