(function () {
    var colorStep = 60;//颜色过渡分段值
    window.Countdown = Countdown;

    function Countdown(setting) {
        this.options = setting;
        var options = this.options;
        var _this = this;
        var can = document.createElement("canvas");
        can.setAttribute("id", options.canvasId);
        var parentDiv=document.getElementById(options.parentDivId);
        if(parentDiv == null || parentDiv ==''){
            parentDiv=document.body;
        }
        parentDiv.appendChild(can); 

        this.fontFam = getComputedStyle(parentDiv, null)['font-family'];
        this.canvas = document.getElementById(options.canvasId);
        options.radius=options.radius || 40;
        options.lineWidth=options.lineWidth || 10;
        options.shadowBlur=options.shadowBlur || 0;
        options.fontSize=options.fontSize || '20px';
        this.canvas.width = this.canvas.height = (options.radius + options.lineWidth + options.shadowBlur / 2) * 2;
        this.ctx = this.canvas.getContext('2d');
        var ctx=this.ctx;

        this.init = function () {
            //初始化变量
            _this.initnum = Math.abs(options.startSecs - options.endSecs);
            _this.noteVal =  options.startSecs; //开始时间
            _this.angle = 0; //开始角度
            _this.dn = -90; //旋转开始度数
            noteVal = _this.noteVal;
            //绘制计时圆环
            _this.recordTime();
        },
        this.startRun = function () {
            _this.timer = setInterval(function () {
               _this.statusVal=_this.recordTime();//实时记录当前值
            }, 10)
        },
        this.recordTime =  function () {
            
            _this.varycol = '';
            _this.grad = '';
            varycol=_this.varycol;
            grad=_this.grad;

            //文字及圆环过渡颜色+--------------------------
            if(options.startSecs < 0 || options.endSecs < 0 || options.startSecs == options.endSecs){
				window.console && window.console.log('配置时间有误');
                return;
            }

            //-----------倒计时
            if ( options.startSecs > options.endSecs ) {
                if(noteVal > options.endSecs){
                    noteVal = noteVal - 0.01;
                    varycol = options.color;

                    //判断part存在且长度不为空的时候执行
                    if(options.part && options.part.length!==0){ 
                        options.part.sort(_this.compareDown('time'))//对part数组进行排序倒序
                        
                        if(options.part[0].time <= options.startSecs && options.part[options.part.length-1].time >= options.endSecs){ //在判断正确范围内的时候
                            //根据part生成一组对应时间和色值的判断并计算颜色过渡
                            for (var index = 0; index < options.part.length; index++) {
                                if (noteVal < options.part[index].time && (!options.part[index + 1] || noteVal >= options.part[index + 1].time)) {
                                    options.part[index].__ColorIndex = options.part[index].__ColorIndex || 0;
                                    var _PrevColor = (options.part[index - 1] || options).color;
                                    var _CurColor = options.part[index].color;
                                    var grad1 = gradientColor( colorHex(_PrevColor), colorHex(_CurColor), colorStep);
                                    varycol = grad1[options.part[index].__ColorIndex++]|| grad1[grad1.length - 1];
                                }
                            }
                            bPart=true;//标识

                        }else{
                            bPart=false;
                        }
                    }
                    //执行每秒变化时的函数
                    if( parseInt(noteVal*100)%100 ==0){ 
                        _this.onCountTimes(parseInt(noteVal));
                    }
                    
                }else{
                   _this.timeEnd();
                }
            } 
            //-----------正计时
            if ( options.startSecs < options.endSecs ) {
                if( noteVal < options.endSecs){
                    noteVal = noteVal + 0.01;
                    varycol = options.color;
                    //判断part存在且长度不为空的时候执行
                    if(options.part && options.part.length!==0){ 
                        options.part.sort(_this.compareUp('time'))//对part数组进行排序正序

                        if(options.part[0].time >= options.startSecs && options.part[options.part.length-1].time <= options.endSecs){ //在判断正确范围内的时候
                            //根据part生成一组对应时间和色值的判断并计算颜色过渡
                            for (var index = 0; index < options.part.length; index++) {
                                if (noteVal > options.part[index].time && (!options.part[index + 1] || noteVal <= options.part[index + 1].time)) {
                                    options.part[index].__ColorIndex = options.part[index].__ColorIndex || 0;
                                    var _PrevColor = (options.part[index - 1] || options).color;
                                    var _CurColor = options.part[index].color;
                                    var grad1 = gradientColor(colorHex(_PrevColor),colorHex(_CurColor),colorStep);
                                    varycol = grad1[options.part[index].__ColorIndex++] || grad1[grad1.length - 1];
                                }
                            }
                            bPart=true;//标识
                        }
                        else{
                            bPart=false;
                        }
                    }
                    //执行每秒变化时的函数
                    if( parseInt(noteVal*100)%100 ==0){ 
                        _this.onCountTimes(parseInt(noteVal));
                    }
                }else {
                    _this.timeEnd();
                }
            }
            _this.drawFrame();
            
            return noteVal;
        },
        this.timeEnd=function(){
            //清除定时器
            clearInterval(_this.timer);
            if(options.part && options.part.length!==0 && bPart){ 
                varycol = options.part[ options.part.length-1].color;
            }else{
                varycol = options.color;
            }
            //执行回调函数
            _this.onCountEnd();
        },
        this.drawFrame=function(){
            
            var deg1 = Math.PI * 2; 
            var dotSpeed = deg1 / (_this.initnum*100);
            var defColor = options.color;
            if (_this.angle < deg1) {
                _this.angle += dotSpeed;//角度变化
            }
            if (_this.dn < (360-90)) {
                _this.dn += 360/(_this.initnum*100); //旋转角度
            }
            ctx.save();
            ctx.clearRect(0, 0,_this.canvas.width, _this.canvas.height);
            ctx.translate(_this.canvas.width / 2, _this.canvas.height / 2);

            ctx.beginPath();
            ctx.strokeStyle = options.strokeColor || 'rgba(215, 215, 215, 1)';
            ctx.lineWidth = options.lineWidth;
            ctx.arc(0, 0, options.radius, 0, deg1, false);
            ctx.stroke();

            ctx.fillStyle = varycol;
            ctx.font = options.fontSize +' '+_this.fontFam;
            ctx.textAlign = 'center';
            var numval= (options.startSecs > options.endSecs) ? Math.ceil(noteVal) : Math.floor(noteVal);
            ctx.fillText(numval + (options.fontTxt || '') , 0, parseInt(options.fontSize)/3);

            ctx.beginPath();
            ctx.rotate(-deg1/4);
            ctx.lineWidth = options.lineWidth;
            ctx.strokeStyle = varycol;
            
            if(options.lineRound){
                ctx.lineCap = "round";
            }else{
                ctx.lineCap = "square";
            }
            ctx.shadowBlur =  options.shadowBlur ;
            ctx.shadowColor = options.shadowColor || 0;
            ctx.arc(0, 0, options.radius, 0, _this.angle, false);

            if(options.gradual){ //是否支持颜色到深浅色的渐变
                grad = ctx.createLinearGradient(0,0,0,options.radius);
                grad.addColorStop(0,'rgba(0,0,0,0)'); 

                if(options.gradual=='deep'){
                    grad.addColorStop(0.7,'rgba(0,0,0,0)');
                    grad.addColorStop(1,'rgba(0,0,0,0.1)');  
                }else if(options.gradual=='tint'){
                    grad.addColorStop(0.7,'rgba(255,255,255,0)');
                    grad.addColorStop(1,'rgba(255,255,255,0.27)');  
                }else{
                    grad.addColorStop(1,'rgba(0,0,0,0)');  
                }
                ctx.stroke();
                ctx.beginPath();
                ctx.strokeStyle =grad;
                ctx.arc(0, 0, options.radius, 0, deg1, false);
                ctx.rotate((Math.PI/180)*_this.dn);//旋转角度
                ctx.stroke();
                ctx.restore();
            }else{
                ctx.stroke();
                ctx.restore();
            }
        },
        this.compareUp = function(property){ //数组中对象的属性值进行排序
            return function(a,b){
                var value1 = a[property];
                var value2 = b[property];
                return value1 - value2;
            }
        },
        this.compareDown = function(property){//数组中对象的属性值进行排序
            return function(a,b){
                var value1 = a[property];
                var value2 = b[property];
                return value2 - value1;
            }
        },
        this.onCountTimes = function(times){
            if (typeof options.onCountTimes == 'function') {
                options.onCountTimes(times);
            }
        },
        this.onCountEnd = function(){
            if (typeof options.onCountEnd == 'function') {
                options.onCountEnd();
            }
        },
        this.isSuspended = function(){
            clearInterval(_this.timer);
            //保存暂停时当前值
            _this.statusVal=noteVal;
        },
        this.isContinue = function(){
            noteVal=_this.statusVal;
            //先清除避免重复执行定时器
            clearInterval(_this.timer);
            //继续执行计时
            _this.startRun();
        },
        this.isResetSecs = function(newStaSec,newEndSec){
            clearInterval(_this.timer);
            //重新设置开始和结束时间以及时间差和角度
            options.startSecs = newStaSec || options.startSecs;
            options.endSecs = newEndSec || options.endSecs;
            _this.initnum = Math.abs(options.startSecs - options.endSecs);
            noteVal=options.startSecs;
            _this.angle=0;
            _this.dn = -90; 
            //继续执行计时
            _this.startRun();
        }
        this.init();
    }

})();

function colorHex(color){ // 十六进制颜色转rgb
    var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;  
    var sColor = color.toLowerCase();  
    if(sColor && reg.test(sColor)){  
        if(sColor.length === 4){  
            var sColorNew = "#";  
            for(var i=1; i<4; i+=1){  
                sColorNew += sColor.slice(i,i+1).concat(sColor.slice(i,i+1));     
            }  
            sColor = sColorNew;  
        }  
        //处理六位的颜色值  
        var sColorChange = [];  
        for(var i=1; i<7; i+=2){  
            sColorChange.push(parseInt("0x"+sColor.slice(i,i+2)));    
        }  
        return "rgb(" + sColorChange.join(",") + ")";  
    }else{  
        return sColor;    
    }  
}
function gradientColor(startColor, endColor, step) { // 两个rgb颜色间的过渡颜色转数组
    var startvalue = startColor.replace(/rgb\(|\)/g, "");
    startRGB = startvalue.split(",");
    startR = parseInt(startRGB[0]);
    startG = parseInt(startRGB[1]);
    startB = parseInt(startRGB[2]);

    var endvalue = endColor.replace(/rgb\(|\)/g, "");
    endRGB = endvalue.split(",");
    endR = parseInt(endRGB[0]);
    endG = parseInt(endRGB[1]);
    endB = parseInt(endRGB[2]);

    sR = (endR - startR) / step;//总差值
    sG = (endG - startG) / step;
    sB = (endB - startB) / step;

    var colorArr = [];
    for (var i = 0; i < step; i++) {
        //计算每一步的hex值 
        var hex = 'rgb(' + parseInt((sR * i + startR)) + ',' + parseInt((sG * i + startG)) + ',' + parseInt((sB * i + startB)) + ')';
        colorArr.push(hex);
    }
    return colorArr;
}