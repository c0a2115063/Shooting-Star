//==2023/06/13 画面をスクロールさせる==//

/*起動時の処理*/
function setup() {
    canvasSize(1200,720);       //キャンバスサイズの設定
    loadImg(0, "image/bg.png"); //画像の読み込み
}

/*メインループ*/
function mainloop() {
    drawBG(1);
}

/*背景のスクロール*/
var bgX = 0; //背景スクロール位置を管理する変数
function drawBG(spd) {//背景をスクロール位置を管理する
    bgX = (bgX + spd) % 1200;
    drawImg(0, -bgX, 0);
    drawImg(0, 1200-bgX, 0);//左右に2枚の画像を並べて描く
}