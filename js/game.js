/*人物对象*/
function person(canvas,cobj,runimg,jumpimg){
    this.canvas=canvas;
    this.cobj=cobj;
    this.runimg=runimg;
    this.jumpimg=jumpimg;
    this.x=0;
    this.y=0;
    this.width=160;
    this.height=120;
    this.status="runimg";
    this.state=0;
}
person.prototype={
    draw:function(){
        this.cobj.save();
        this.cobj.translate(this.x,this.y);
        this.cobj.drawImage(this[this.status][this.state],0,0,640,480,0,0,this.width,this.height);
        this.cobj.restore();
    },
    animate:function(num,speed){
        if(this.status=="runimg"){
            this.state=num%15;
        }else{
            this.state=0;
        }

        this.x+=speed;

        if(this.x>this.canvas.width/3){
            this.x=this.canvas.width/3;
        }

    },
    jump:function(){
        var that = this;
        var flag=true;
        touch.on(this.canvas,"touchstart",function(){

            if(!flag){
                return;
            }

            flag=false;
            var inita=0;
            var speeda=10;
            var currenty=that.y;
            var r=150;
            that.status="jumpimg";
            that.state=0;
            var t=setInterval(function(){
                inita+=speeda;
                if(inita>=180){
                    that.status="runimg";
                    clearInterval(t);
                    that.y=currenty;
                    flag=true;
                }else{
                    that.y=currenty-Math.sin(inita*Math.PI/180)*r;
                }
            },50)
        })
    }
}
/*障碍物*/
function barrier(canvas,cobj,barrierimg){
    this.canvas=canvas;
    this.cobj=cobj;
    this.barrierimg=barrierimg;
    this.x=0;
    this.y=0;
    this.width=56;
    this.height=40;
    this.state=0;
}
barrier.prototype={
    draw:function(){
        this.cobj.save();
        this.cobj.translate(this.x,this.y);
        this.cobj.drawImage(this.barrierimg[this.state],0,0,564,400,0,0,this.width,this.height);
        this.cobj.restore();
    },
    animate:function(speed){
        this.x-=speed;
    }
}

/*粒子动画(血液)*/
function lizi(canvas,cobj,x,y){
    this.canvas=canvas;
    this.cobj=cobj;
    this.x=x;
    this.y=y;
    this.r=2+2*Math.random();
    this.speedx=8*Math.random()-4;
    this.speedy=8*Math.random()-4;
    this.color="red";
    this.speedl=0.3;
}
lizi.prototype={
    draw:function(){
        this.cobj.save();
        this.cobj.translate(this.x,this.y);
        this.cobj.fillStyle=this.color;
        this.cobj.beginPath();
        this.cobj.arc(0,0,this.r,0,2*Math.PI);
        this.cobj.fill();
        this.cobj.restore();
    },
    animate:function(){
        this.x+=this.speedx;
        this.y+=this.speedy;
        this.r-=this.speedl;
    }
}
function xue(canvas,cobj,x,y){
    var arr=[];
    for(var i=0;i<20;i++){
        arr.push(new lizi(canvas,cobj,x,y));
    }
    var t=setInterval(function(){
        for(var i=0;i<arr.length;i++){
            arr[i].draw();
            arr[i].animate();
            if(arr[i].r<0){
                arr.splice(i,1);
            }
        }
        if(arr.length<1){
            clearInterval(t);
        }
    },50)
}

function game(canvas,cobj,runimg,jumpimg,barrierimg){
    this.canvas=canvas;
    this.cobj=cobj;
    this.barrierimg=barrierimg;
    this.person=new person(canvas,cobj,runimg,jumpimg);
    this.speed=10;
    this.barrierArr=[];
    //生命
    this.life=3;
    //分数
    this.score=0;
    //当前分数
    this.currentscore=0;
    //关卡难度
    this.step=5;
}
game.prototype={
    play:function(){
        var that=this;
        //人物
        var personNum=0;
        //场景
        var backpos=0;
        //障碍物
        var times=0;
        var randtime=Math.floor(2+5*Math.random())*1000;

        that.person.jump();
        setInterval(function(){
            times+=50;
            that.cobj.clearRect(0,0,that.canvas.width,that.canvas.height);
            //判断障碍物出场时间
            if(times%randtime==0){
                randtime=Math.floor(2+5*Math.random())*1000;
                var barrierObj=new barrier(that.canvas,that.cobj,that.barrierimg);
                barrierObj.state=Math.floor(Math.random()*that.barrierimg.length);
                barrierObj.y=that.canvas.height-barrierObj.height;
                barrierObj.x=that.canvas.width;
                that.barrierArr.push(barrierObj);
                //及时清理之前的障碍物
                if(that.barrierArr.length>5){
                    that.barrierArr.shift();
                }
            }
            for(var i=0;i<that.barrierArr.length;i++){
                that.barrierArr[i].draw();
                that.barrierArr[i].animate(that.speed);

                //判断是否碰撞
                if(hitPix(that.canvas,that.cobj,that.person,that.barrierArr[i])){

                    //血出现的位置
                    xue(that.canvas,that.cobj,that.person.x+that.person.width/2+15,that.person.y+that.person.height/4);

                    if(!that.barrierArr[i].hits){
                        setTimeout(function(){
                            that.life--;
                            if(that.life<0){
                                alert("Game Over! 获得总分："+that.score);
                                location.reload();
                            }
                        },0)
                        that.barrierArr[i].hits="hits";
                    }
                }
                if(that.barrierArr[i].x+that.barrierArr[i].width<that.person.width&&!that.barrierArr[i].hits){
                    if(!that.barrierArr[i].score) {
                        ++that.score;
                        ++that.currentscore;

                        var scorebox=document.querySelector(".score");
                        scorebox.innerHTML="当前分数:"+that.currentscore;

                        if (that.currentscore % that.step == 0) {
                            that.step = that.currentscore * 2;
                            that.currentscore = 0;
                            that.speed += 5;
                        }
                        that.barrierArr[i].score = "true";
                    }
                }
            }


            personNum++;
            that.person.draw();
            that.person.animate(personNum,that.speed);
            backpos-=that.speed;
            that.canvas.style.backgroundPositionX=backpos+"px";
        },50)
    }
}