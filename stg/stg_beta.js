//==2023/06/13 画面をスクロールさせる==//
//==2023/06/18 自機を動かす ==//

/*起動時の処理*/
function setup() {
    canvasSize(1200,720);       //キャンバスサイズの設定
    loadImg(0, "image/bg.png"); //画像の読み込み
    loadImg(1, "image/spaceship.png");
    initSShip();
}
/*メインループ*/
function mainloop() {
    drawBG(1);
    moveShip();
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
    drawImgC(1,ssX,ssY);//自機の描画
}

