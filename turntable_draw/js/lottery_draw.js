//drawData 长度可为2，4,6,8,10,等偶数  AwardId与下面prizeId 的随机值对应
var drawData={"Code":0,"Message":"","Data":[
    {"AwardId":5,"AwardName":"学术规划课","AwardWorth":"580","AwardChance":20.00,"AwardCount":500,"LotteryCount":0,"AwardImage":"images/jppic01.png"},
    {"AwardId":6,"AwardName":"语法班","AwardWorth":"588","AwardChance":20.00,"AwardCount":500,"LotteryCount":0,"AwardImage":"images/jppic02.png"},
    {"AwardId":7,"AwardName":"CETP定位测试","AwardWorth":"50","AwardChance":20.00,"AwardCount":500,"LotteryCount":0,"AwardImage":"images/jppic03.png"},
    {"AwardId":8,"AwardName":"全科小班课代金券","AwardWorth":"500","AwardChance":20.00,"AwardCount":500,"LotteryCount":0,"AwardImage":"images/jppic04.png"},
    {"AwardId":9,"AwardName":"薄弱项分析","AwardWorth":"199","AwardChance":20.00,"AwardCount":500,"LotteryCount":0,"AwardImage":"images/jppic05.png"},
    {"AwardId":10,"AwardName":"感谢参与","AwardWorth":"0","AwardChance":20.00,"AwardCount":500,"LotteryCount":0,"AwardImage":"images/jppic06.png"},
    {"AwardId":11,"AwardName":"考前机经","AwardWorth":"199","AwardChance":20.00,"AwardCount":500,"LotteryCount":0,"AwardImage":"images/jppic07.png"},
    {"AwardId":12,"AwardName":"一对一代金券","AwardWorth":"800","AwardChance":20.00,"AwardCount":500,"LotteryCount":0,"AwardImage":"images/jppic08.png"}
],"ErrorData":null,"ServerTime":"2017-08-07 11:22:16"}

var bRotate = false; //标识
var length = drawData.Data.length; // 数据的长度绘制扇形
var canvas = document.getElementById('rotatecanvas'),
ctx = canvas.getContext('2d');
var recordVal = 0;// 第一次抽奖时默认之前的结果是“0”,与下一轮的角度对应上

(function(){
    
    var cavobj={};
    cavobj.x=canvas.width/2;
    cavobj.y=canvas.height/2;
    cavobj.radius = 206;// 圆盘半径;
    cavobj.angle= 360/length; //块的角度，旋转角度

    window.cavobj=cavobj;

})();


function lotteryDraw(){
    _this = this;
    this.init=function(){
        //加载图片
        cavobj.img=[];
        for(var i=0;i<length;i++){
            cavobj.img[i]={};
            cavobj.img[i] = new Image();
            cavobj.img[i].src = drawData["Data"][i].AwardImage;
            if(i==length-1){// 最后一次循环执行onload事件
                cavobj.img[i].onload = function(){
                     _this.drawCircle();
                }
            }
        }

    }
    this.drawCircle=function(){ //绘制内容块颜色和图片

        var deg = Math.PI/180;
        var startAngle,endAngle;

        if(length%4==0){  //是否是4的倍数来旋转扇形起始角度保证再指针在中间位置
            startAngle = 0 - (cavobj.angle/2);
            endAngle = 360/length - (cavobj.angle/2);
        }else{
           startAngle = 0 ;
           endAngle = 360/length;
        }

        var _this=this;

        for(var i=0;i<length;i++){
            ctx.beginPath();
            var criscolor=['#ffd3b8','#ffecb8'];// 定义颜色
            var fillcol= (i%2 ==0) ? criscolor[0]: criscolor[1];
            ctx.fillStyle = fillcol;

            // 绘制扇形
            ctx.save();
            ctx.moveTo(cavobj.x,cavobj.y);
            ctx.globalCompositeOperation="destination-over";
            ctx.arc(cavobj.x,cavobj.y,cavobj.radius,deg*startAngle,deg*endAngle);
            ctx.fill();
            ctx.restore();
            
            // 绘制图片
            ctx.save();
            ctx.translate(cavobj.x,cavobj.y);//将绘图原点移到画布中点
            var rtangle = deg*(cavobj.angle*i);
            ctx.rotate(rtangle);// 
            ctx.translate(-cavobj.x,-cavobj.y);//将画布原点移动
            ctx.globalCompositeOperation="source-over";
            
            ctx.drawImage(cavobj.img[i],cavobj.x-cavobj.img[i].width/2, 0);  
            ctx.restore();

            startAngle += cavobj.angle;
            endAngle += cavobj.angle;
        }
    },
    this.startRun=function(){  //开始运行抽奖

        bRotate=true;
        var item=null;
       // 延时（ajax）请求到结果后
            
        prizeId=   rnd(5,12); //随机数
        item = _this.convertID(prizeId);//id转下标
        
        
        var num=0;  //计数器1
        var inum=0; //计数器2
        var speed=1;//速度

        // 请求前的循环旋转动画
		var inv= function(){  
            num++;
            //执行旋转动画
            _this.rotate(2);
            timer = setTimeout(inv,speed);
            if(item !==null && num %180==0  && num < 720){
               clearInterval(timer);
               //执行runTimer2动画2
               if( item >=0 && item < length){ 
                   //runTimer2(item);
                   recordVal = runTimer2(item);

               }else{
                   return false;
               }
            }else if( num > 720 ){
                //console.log("请求超时");
                clearInterval(timer);
                for(a=0;a<length;a++){
                   if(drawData.Data[a].AwardWorth=='0'|| drawData.Data[a].AwardWorth==null){
                       item = a; // 感谢参与
                   }
                }
                runTimer2(item);
                return;
            }
		}
        var timer=setTimeout(inv,speed);  

        //请求到奖品后的动画
        function runTimer2(index){
            
            var angleArr =[];//角度
            for(i=0;i<length;i++){
                angleArr.push( -cavobj.angle*i);
            }
            var nangle=1080 + parseInt(angleArr[index]) + recordVal * cavobj.angle;// 一共旋转的角度  默认4圈 + 从0开始应该旋转的角度 + 上一轮结果的角度

            var niv= function(){  
                inum++;
                _this.rotate(2);  
                if(inum>(nangle/2-190)){
                    //减速
                    speed=speed+0.09;
                }
                if(inum>=nangle/2){
                    clearInterval(timer2);
                    // 停止定时器，执行抽奖结果
                    _this.resultDraw(index, drawData.Data[index].AwardName,'¥'+drawData.Data[index].AwardWorth); //传入下标的结果
                }else{
                    timer2 = setTimeout(niv,speed);
                }
            }
            var timer2=setTimeout(niv,speed);  

            return index;
        }

    },
    this.rotate=function(d){
        ctx.clearRect(0,0, canvas.width, canvas.height);//先清掉画布上的内容
        ctx.translate(cavobj.x,cavobj.y);//将绘图原点移到画布中点
        ctx.rotate((Math.PI/180)*d);//旋转角度度数
        ctx.translate(-cavobj.x,-cavobj.y);//将画布原点移动
        _this.drawCircle();
    },
    this.convertID=function(id){
        var idArr=[];
        for(i=0;i<length;i++){
            idArr.push(drawData.Data[i].AwardId);
            if( id==idArr[i] ){
                return i;
            }
        }
    },
    this.resultDraw=function(awards,txt,money){
        bRotate = !bRotate;
        //结果
        $('.resultbox').fadeIn(300);
        
        if(drawData.Data[awards].AwardWorth=='0'||drawData.Data[awards].AwardWorth==null){ // 没有抽中时
            $("#result-txt").html('哎呀！还差一点点');
        }else{
            var retxt="恭喜获得价值<span>"+money+"</span>" +txt;
            $("#result-txt").html(retxt);
        }
        //只能抽奖一次
        // $('.pointer').addClass('disabled');
        // $('.pointer').unbind('click');
    },
    this.init();
 
}


// 取随机数
function rnd(n, m){
    return Math.floor(Math.random()*(m-n+1)+n)
}

