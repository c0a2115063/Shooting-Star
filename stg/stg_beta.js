//==2023/06/13 画面をスクロールさせる==//
//==2023/06/18 自機を動かす ==//
//==2023/06/18 単数の弾を発射する ==//
//==2023/06/18 複数の弾を発射する ==//
//==2023/06/19 弾の自動発射       ==//
//==2023/06/19 敵機を動かす ==//
//==2023/06/21 敵機が弾を打つようにする ==//
//==2023/06/21 敵機を撃ち落とせるようにする ==//
//==2023/06/21 自機のエネルギーを組み込む ==//
/*起動時の処理*/
function setup() {
    canvasSize(1200,720);       //キャンバスサイズの設定
    loadImg(0, "image/bg.png"); //画像の読み込み
    loadImg(1, "image/spaceship.png");
    loadImg(2, "image/missile.png");
    loadImg(4, "image/enemy0.png");
    loadImg(5, "image/enemy1.png");
    initSShip();
    initMissile();
    initObject();
}
/*メインループ*/
var tmr = 0; //ゲーム内タイマー
function mainloop() {
    tmr++;
    drawBG(1);
    moveShip();
    moveMissile();
    if(tmr%10 == 0) setObject(1, 5,1200, rnd(700), -12, 0);
    moveObject();
    /*エネルギー描画*/
    for(i=0; i<10; i++) fRect(20+i*30, 660, 20, 40, "#c00000"); //残機0のエネルギー
    for(i=0; i<energy; i++) fRect(20+i*30, 660, 20, 40, colorRGB(160-16*i, 240-12*i, 24*i));//エネルギーの残量を描く
}
/*背景のスクロール*/
var bgX = 0; //背景スクロール位置を管理する変数
function drawBG(spd) {//背景をスクロール位置を管理する
    bgX = (bgX + spd) % 1200;
    drawImg(0, -bgX, 0);
    drawImg(0, 1200-bgX, 0);//左右に2枚の画像を並べて描く
}
/*自機の管理*/
var ssX = 0;
var ssY = 0;
var automa = 0;//弾の自動発射のON,OFF
var energy = 0;
var muteki = 0;//無敵状態になっている時間
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
        setMissile(ssX+40, ssY, 40, 0); //弾発射
    }
    if(automa == 1 && tmr%8 == 0) setMissile(ssX+40, ssY, 40, 0); //弾自動発射
    var col = "black";
    /*弾自動発射システム描画*/
    if(automa == 1) col = "white";
    fRect(900, 20,  280, 60, "blue");
    fText("[A]uto Missile", 1040, 50,36, col);
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
var mslNum = 0;//弾のデータを配列に代入する
/*弾を管理する配列を初期化する関数*/
function initMissile() {
    for(var i=0; i<MSL_MAX;　i++) mslF[i] = false;
    mslNum = 0;
}
/*弾を撃ち出す関数*/
function setMissile(x,y,xp,yp) {
    if (mslF[mslNum] == false) {//撃ち出された状態なら
        //弾の座標と移動量を代入
        mslX[mslNum] = x;
        mslY[mslNum] = y;
        mslXp[mslNum] = xp;
        mslYp[mslNum] = yp;
        mslF[mslNum] = true;
        mslNum = (mslNum+1)%MSL_MAX;
    }
}
/*弾を動かす関数*/
function moveMissile() {
    for(var i=0; i<MSL_MAX; i++){
        if(mslF[i] == true){
            mslX[i] = mslX[i] + mslXp[i];
            mslY[i] = mslY[i] + mslYp[i];
            drawImgC(2, mslX[i], mslY[i]);
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
var objNum = 0;
/*敵機を管理する配列を初期化する関数*/
function initObject() {
    for(var i=0; i<OBJ_MAX;　i++) objF[i] = false;
    objNum = 0;
}
/*敵機をセットする関数*/
function setObject(typ, png, x,y,xp,yp) {
    objType[objNum] = typ;
    objImg[objNum] = png;
    objX[objNum] = x;
    objY[objNum] = y;
    objXp[objNum] = xp;
    objYp[objNum] = yp;
    objF[objNum] = true;
    objNum = (objNum+1)%OBJ_MAX;
}
/*敵機を動かす関数*/
function moveObject() {
    for(var i=0; i<OBJ_MAX; i++){
        if(objF[i] == true){
            objX[i] = objX[i] + objXp[i];
            objY[i] = objY[i] + objYp[i];
            drawImgC(objImg[i], objX[i], objY[i]);
            if(objType[i] == 1 && rnd(100) < 3) setObject(0, 4, objX[i], objY[i], -24, 0);
            if(objX[i] < 0) objF[i] = false;

            /*自機が撃った弾とヒットチェック*/
            if(objType[i] == 1){//物体が敵機なら
                var r = 12 + (img[objImg[i]].width + img[objImg[i]].height) / 4;//ヒットチェックの径(距離)をrに代入 ※img[n]:n番に読み込んだ画像
                for(var n=0; n<MSL_MAX; n++){//for文で発射中のすべての弾を調べる。
                    if(mslF[n] == true){
                        if(getDis(objX[i], objY[i], mslX[n], mslY[n]) < r){
                            objF[i] = false;
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
                }
            }
        }
    }   
}