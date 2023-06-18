//==2023/06/13 画面をスクロールさせる==//
//==2023/06/18 自機を動かす ==//
//==2023/06/18 単数の弾を発射する ==//
//==2023/06/18 複数の弾を発射する ==//

/*起動時の処理*/
function setup() {
    canvasSize(1200,720);       //キャンバスサイズの設定
    loadImg(0, "image/bg.png"); //画像の読み込み
    loadImg(1, "image/spaceship.png");
    loadImg(2, "image/missile.png");
    initSShip();
    initMissile();
}
/*メインループ*/
function mainloop() {
    drawBG(1);
    moveShip();
    moveMissile();
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
/*自機の座標に代入する関数*/
function initSShip() {
    ssX = 400;
    ssY = 360;
}
/*キー操作で自機を動かす関数*/
function moveShip() {
    if(key[37] > 0 && ssX > 60)     ssX -= 20; //左
    if(key[39] > 0 && ssX < 1009)   ssX += 20; //右
    if(key[38] > 0 && ssY > 40)     ssY -= 20; //上
    if(key[40] > 0 && ssY < 680)    ssY += 20; //下
    if(key[32] == 1){
        key[32]++; //連打で次の弾を撃つための記述
        setMissile(ssX+40, ssY, 40, 0); //弾発射
    }
    drawImgC(1,ssX,ssY);//自機の描画
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