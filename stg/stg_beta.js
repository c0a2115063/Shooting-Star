//==2023/06/13 画面をスクロールさせる==//
//==2023/06/18 自機を動かす ==//
//==2023/06/18 単数の弾を発射する ==//
//==2023/06/18 複数の弾を発射する ==//
//==2023/06/19 弾の自動発射       ==//
//==2023/06/19 敵機を動かす ==//
//==2023/06/21 敵機が弾を打つようにする ==//
//==2023/06/21 敵機を撃ち落とせるようにする ==//
//==2023/06/21 自機のエネルギーを組み込む ==//
//==2023/06/21 エフェクト(爆発演出)を組み込む==//
//==2023/06/24 色々な敵機を登場させる==//
//==2023/06/24 パワーアップアイテムを組み込む==//
//==2023/06/26 スマートフォンに対応させる==//
//==2023/06/26 シューティングゲームの完成==//
//==2023/07/01 もっと面白くリッチなゲームする(BGM追加、ギミック追加)==//
/*起動時の処理*/
function setup() {
    canvasSize(1200,720);       //キャンバスサイズの設定
    loadImg(0, "image/bg.png"); //画像の読み込み
    loadImg(1, "image/spaceship.png");
    loadImg(2, "image/missile.png");
    loadImg(3, "image/explode.png");
    for(var i=0; i<=5; i++) loadImg(4+i, "image/enemy"+i+".png");
    for(var i=0; i<=3; i++) loadImg(9+i, "image/item"+i+".png");
    loadImg(13, "image/laser.png");
    loadImg(14, "image/title_ss.png");
    var SND = ["Titlebgm", "GameOver"];
    for(var i=0; i<SND.length; i++) loadSound(i, "sound/"+SND[i]+".m4a");
    initMissile();
    initObject();
    initEffect();
}
/*メインループ*/
var tmr = 0; //ゲーム内タイマー
var idx = 0; //ゲームシーンを区別する為の変数
var score = 0;
var hiscore = 100000;
var stage = 0;
function mainloop() {
    tmr++;
    drawBG(1);

    switch(idx){
        /*タイトル画面*/
        case 0:
        drawImg(14,200,200);
        if(tmr%40 < 20){
            fText("Press [SPC] or Click to start.", 600, 540, 40,"cyan"); //点滅動作
        }
        if(key[32] > 0 || tapC > 0){//スペースキーまたはクリックしたら
            initSShip(); 
            initObject();
            score = 0;
            stage = 1;
            idx = 1;
            tmr = 0;
            playBgm(0);
        }
        break;
        /*ゲーム中*/
        case 1:
        setEnemy();
        setItem();
        moveShip();
        moveMissile();
        moveObject();
        drawEffect();
        /*エネルギー描画*/
        for(i=0; i<10; i++) fRect(20+i*30, 660, 20, 40, "#c00000"); //残機0のエネルギー
        for(i=0; i<energy; i++) fRect(20+i*30, 660, 20, 40, colorRGB(160-16*i, 240-12*i, 24*i));//エネルギーの残量を描く
        if(tmr < 30*4) fText("STAGE "+stage, 600, 300, 50, "cyan");//ステージ紹介
        if(30*114 < tmr && tmr < 30*118) fText("STAGE CLEAR", 600, 300, 50, "cyan");//ゲームクリア表示
        /*次のステージへ*/
        if(tmr == 30*120){
            stage++;
            tmr = 0;
        }
        break;
        /*ゲームオーバー*/
        case 2:
        playBgm(1);
        if(tmr < 30*2 && tmr % 5 == 1) setEffect(ssX+rnd(120)-60, ssY+rnd(80)-40, 9); //ゲームオーバー時のエフェクト
        moveMissile();
        moveObject();
        drawEffect();
        fText("GAME OVER", 600, 300, 50, "red");
        if(tmr > 130) {
            idx = 0;//自動的にゲームタイトル移動
            stopBgm();
        }
        break;
    }
    fText("SCORE "+score, 200, 50, 40, "white");
    fText("HISCORE "+hiscore, 600, 50, 40, "yellow");
}

/*背景のスクロール*/
var bgX = 0; //背景スクロール位置を管理する変数
function drawBG(spd) {//背景をスクロール位置を管理する
    bgX = (bgX + spd) % 1200;
    drawImg(0, -bgX, 0);
    drawImg(0, 1200-bgX, 0);//左右に2枚の画像を並べて描く
    //=======================立体的な地面を描くコード=======================//
    var hy = 580; //地面の地平線のY座標
    var ofsx = bgX % 40;//縦のラインを移動させるオフセット値
    lineW(2);
    for(var i=1; i<=30; i++){//縦のライン
        var tx = i * 40 - ofsx;//線の奥側のX座標 
        var bx = i * 240 - ofsx * 6 - 3000;//線の手前側のX座標
        line(tx,hy,bx,720,"silver");
    }
    for(var i=1; i<12; i++){//横のライン
        lineW(1+int(i/3));
        line(0, hy, 1200, hy, "gray");
        hy = hy + i* 2;
    }
}
/*自機の管理*/
var ssX = 0;
var ssY = 0;
var automa = 0;//弾の自動発射のON,OFF
var energy = 0;
var muteki = 0;//無敵状態になっている時間
var laser = 0;
var weapon = 0;//最大幾つ何個発射できるのか
/*自機の座標に代入する関数*/
function initSShip() {
    ssX = 400;
    ssY = 360;
    energy = 10;
}
/*キー操作で自機を動かす関数*/
function moveShip() {
    if(key[37] > 0 && ssX > 60)     ssX -= 20; //左
    if(key[39] > 0 && ssX < 1009)   ssX += 20; //右
    if(key[38] > 0 && ssY > 40)     ssY -= 20; //上
    if(key[40] > 0 && ssY < 680)    ssY += 20; //下
    if(key[65] == 1){//Aキーを打った
        key[65]++;
        automa = 1-automa;//値を1に変更
    }
    if(automa == 0 && key[32] == 1){//自動発射OFF
        key[32]++; //連打で次の弾を撃つための記述
        setWeapon();
    }
    if(automa == 1 && tmr%8 == 0) setWeapon(); //弾自動発射
    var col = "black";
    /*弾自動発射システム描画*/
    if(automa == 1) col = "white";
    fRect(900, 20,  280, 60, "blue");
    fText("[A]uto Missile", 1040, 50,36, col);
    /*スマートフォン対応ギミック*/
    if(tapC > 0){//タップ操作
        if(900 < tapX && tapX < 1180 && 20 < tapY && tapY < 80){//[A]uto Missileの位置なら
            tapC = 0;
            automa = 1-automa;//自動発射機能
        }
        else{
            ssX = ssX + int((tapX-ssX)/6);
            ssY = ssY + int((tapY-ssY)/6);
        }
    }
    /*無敵状態*/
    if(muteki % 2 == 0) drawImgC(1,ssX,ssY);//自機の描画
    if(muteki > 0) muteki--;
}
/*弾の管理*/
var MSL_MAX = 100;//最大いくつの弾を撃てるか
var mslX = new Array(MSL_MAX);
var mslY = new Array(MSL_MAX);
var mslXp= new Array(MSL_MAX);
var mslYp= new Array(MSL_MAX);
var mslF = new Array(MSL_MAX);//弾が撃ち出された状態かを管理するフラグ
var mslImg = new Array(MSL_MAX);//通常弾またはレーザーの画像番号を配列に代入
var mslNum = 0;//弾のデータを配列に代入する
/*弾を管理する配列を初期化する関数*/
function initMissile() {
    for(var i=0; i<MSL_MAX; i++) mslF[i] = false;
    mslNum = 0;
}
/*弾を撃ち出す関数*/
function setMissile(x,y,xp,yp) {
    //弾の座標と移動量を代入
    mslX[mslNum] = x;
    mslY[mslNum] = y;
    mslXp[mslNum] = xp;
    mslYp[mslNum] = yp;
    mslF[mslNum] = true;
    mslImg[mslNum] = 2;
    /*レーザーシステム*/
    if(laser > 0){//レーザーアイテム取得⇒100発撃てる
        laser--;//-1
        mslImg[mslNum] = 13;
    }
    mslNum = (mslNum+1)%MSL_MAX;
}
/*弾を動かす関数*/
function moveMissile() {
    for(var i=0; i<MSL_MAX; i++){
        if(mslF[i] == true){
            mslX[i] = mslX[i] + mslXp[i];
            mslY[i] = mslY[i] + mslYp[i];
            drawImgC(mslImg[i], mslX[i], mslY[i]);
            if(mslX[i] > 1200) mslF[i] = false;
        }
    }
}
/*敵機の管理*/
var OBJ_MAX = 100;
var objType = new Array(OBJ_MAX); //0=敵の弾 1=敵機
var objImg = new Array(OBJ_MAX); //物体の画像番号を管理する配列
var objX  = new Array(OBJ_MAX);
var objY  = new Array(OBJ_MAX);
var objXp = new Array(OBJ_MAX);
var objYp = new Array(OBJ_MAX);
var objF  = new Array(OBJ_MAX);
var objLife = new Array(OBJ_MAX);
var objNum = 0;
/*敵機を管理する配列を初期化する関数*/
function initObject() {
    for(var i=0; i<OBJ_MAX;　i++) objF[i] = false;
    objNum = 0;
}
/*敵機をセットする関数*/
function setObject(typ,png,x,y,xp,yp,lif) {
    objType[objNum] = typ;
    objImg[objNum] = png;
    objX[objNum] = x;
    objY[objNum] = y;
    objXp[objNum] = xp;
    objYp[objNum] = yp;
    objF[objNum] = true;
    objLife[objNum] = lif;
    objNum = (objNum+1)%OBJ_MAX;
}
/*敵機を動かす関数*/
function moveObject() {
    for(var i=0; i<OBJ_MAX; i++){
        if(objF[i] == true){
            objX[i] = objX[i] + objXp[i];
            objY[i] = objY[i] + objYp[i];
            /*敵2の特殊な動き*/
            if(objImg[i] == 6){
                if(objY[i] < 60) objYp[i] = 8;
                if(objY[i] > 660) objYp[i] = -8;
            }
            /*敵3の特殊な動き*/
            if(objImg[i] == 7){
                if(objXp[i] < 0){
                    objXp[i] = int(objXp[i]*0.95);
                    if(objXp[i] == 0){
                        setObject(0, 4, objX[i], objY[i], -20, 0, 0);
                        objXp[i] = 20;
                    }
                }
            }
            drawImgC(objImg[i], objX[i], objY[i]);
            
            /*自機が撃った弾とヒットチェック*/
            if(objType[i] == 1){//物体が敵機なら
                var r = 12 + (img[objImg[i]].width + img[objImg[i]].height) / 4;//ヒットチェックの径(距離)をrに代入 ※img[n]:n番に読み込んだ画像
                for(var n=0; n<MSL_MAX; n++){//for文で発射中のすべての弾を調べる。
                    if(mslF[n] == true){
                        if(getDis(objX[i], objY[i], mslX[n], mslY[n]) < r){
                            if(mslImg[n] == 2) mslF[n] = false;//通常弾だったら敵機に当たったら消える
                            objLife[i]--;
                            if(objLife[i] == 0){
                                objF[i] = false;
                                score = score + 100;
                                if(score > hiscore) hiscore = score;
                                setEffect(objX[i], objY[i], 9);
                            }
                            else{
                                setEffect(objX[i], objY[i], 3);
                            }
                        }
                    }
                }       
            }
            /*自機と敵機のヒットチェック*/
            var r = 30 + (img[objImg[i]].width+img[objImg[i]].height)/4;
            if(getDis(objX[i], objY[i], ssX, ssY) < r){
                if(objType[i] <= 1 && muteki == 0){//敵機と弾
                    objF[i] = false;
                    energy--;
                    muteki = 30;
                    //ゲームオーバー切り替え
                    if(energy == 0){
                        mslF[i] = false;
                        idx = 2;
                        tmr = 0;
                        stopBgm();
                    }
                }
                /*アイテムシステム*/
                if(objType[i] == 2){//アイテム
                    objF[i] = false;//アイテム消える
                    if(objImg[i] == 9 && energy < 10) energy++;//エネルギー回復
                    if(objImg[i] == 10) weapon++; //弾の数増える
                    if(objImg[i] == 11) laser = laser + 100;//レーザー砲取得
                    if(objImg[i] == 12) score = 10000;
                }
            }
            if(objX[i]<-100 || objX[i]>1300 || objY[i]<-100 || objY[i]>820) objF[i] = false;
        }
    }   
}
/*エフェクト(爆発演出)の管理*/
var EFCT_MAX = 100;
var efctX = new Array(EFCT_MAX);
var efctY = new Array(EFCT_MAX);
var efctN = new Array(EFCT_MAX);
var efctNum = new Array(EFCT_MAX);
/*エフェクトを管理する配列を初期化する関数*/
function initEffect() {
    for(var i=0; i<EFCT_MAX; i++) efctN[i] = 0;
    efctNum = 0;
}
/*エフェクトをセットする関数*/
function setEffect(x,y,n) {
    efctX[efctNum] = x;
    efctY[efctNum] = y;
    efctN[efctNum] = n;
    efctNum = (efctNum+1) % EFCT_MAX;
}
/*エフェクトを表示する関数*/
function drawEffect() {
    for(var i=0; i<EFCT_MAX; i++){
        if(efctN[i] > 0){
            drawImgTS(3, (9-efctN[i])*128, 0, 128, 128, efctX[i]-64, efctY[i]-64, 128, 128);
            efctN[i]--;
        }
    }
}
/*4種類の敵を出現させる関数*/
function setEnemy() {
    var sec = int(tmr/30);
    if(4 <= sec && sec < 10){
        if(tmr%20 == 0) setObject(1, 5, 1300, 60+rnd(600), -16, 0, 1*stage);//敵機1    
    }
    if(14 <= sec && sec < 20){
        if(tmr%20 == 0) setObject(1, 6, 1300, 60+rnd(600), -12, 8, 3*stage);//敵機2    
    }
    if(24 <= sec && sec < 30){
        if(tmr%20 == 0) setObject(1, 7, 1300, 360+rnd(300), -48, -10, 5*stage);//敵機3    
    }
    if(34 <= sec && sec < 50){
        if(tmr%60 == 0) setObject(1, 8, 1300, rnd(720-192), -6, 0, 0);//障害物        
    }
    if(54 <= sec && sec < 70){
        if(tmr%20 == 0){
            setObject(1, 5, 1300,  60+rnd(600), -16,  4, 1*stage);//敵機1
            setObject(1, 5, 1300, 360+rnd(600), -16, -4, 1*stage);//敵機1
        }
    }
    if(74 <= sec && sec < 90){
        if(tmr%20 == 0) setObject(1, 6, 1300, 60+rnd(600), -12, 8, 3*stage);//敵機2
        if(tmr&45 == 0) setObject(1, 8, 1300, rnd(720-192), -8, 0, 0);//障害物     
    }
    if(94 <= sec && sec < 110){
        if(tmr%10 == 0) setObject(1, 5, 1300, 360, -24 , rnd(11)-5, 1*stage);//敵機1
        if(tmr%20 == 0) setObject(1, 7, 1300, rnd(300), -56, 4+rnd(12), 5*stage);//敵機3 
    }
}
/*複数の弾を一度に放つ関数*/
function setWeapon() {
    var n = weapon; //同時に幾つ発射するのか
    if(n > 8) n = 8;//最大9個
    for(var i=0; i<=n; i++) setMissile(ssX+40, ssY-n*6+i*12, 40, int((i-n/2)*2));
}
/*アイテムを出現させる関数*/
function setItem() {
    if(tmr % 900 ==  0) setObject(2, 9, 1300, 60+rnd(600),  -10, 0, 0); //Energy
    if(tmr % 900 ==300) setObject(2, 10, 1300, 60+rnd(600), -10, 0, 0);//Missile
    if(tmr % 900 ==600) setObject(2, 11, 1300, 60+rnd(600), -10, 0, 0);//Laser
    if(tmr % 900 ==800) setObject(2, 12, 1300, 60+rnd(600), -50, 0, 0);//ポイント
}