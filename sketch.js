
let handPose;
let video;
let hands = [];
let playerChoice = "請舉手...";
let computerChoice = "";
let result = "";
let choices = ["石頭", "布", "剪刀"];


// 遊戲狀態控制
let playerScore = 0;
let computerScore = 0;
let tieScore = 0;


let gameState = "WAITING"; // WAITING, COUNTDOWN, RESULT, CHOICE, FINISHED
let countdownValue = 3;
let timer = 0;


// 顏色定義
let colorPrimary = [52, 152, 219];
let colorSecondary = [46, 204, 113];
let colorAccent = [231, 76, 60];
let colorBg = [255, 255, 255, 200];
let colorText = [44, 62, 80];


function preload() {
 // 載入手勢偵測模型
 handPose = ml5.handPose();
}


function setup() {
 let cnv = createCanvas(640, 480);
 cnv.parent(document.querySelector('main')); // 將畫布放入 main 標籤中
 video = createCapture(VIDEO);
 video.size(640, 480);
 video.hide();
 // 開始偵測視訊中的手勢
 handPose.detectStart(video, gotHands);
  textAlign(CENTER, CENTER);
 textSize(32);
}


function gotHands(results) {
 hands = results;
}


function draw() {
 // 繪製視訊畫面
 push();
 translate(width, 0);
 scale(-1, 1); // 鏡像處理，讓操作更直覺
 image(video, 0, 0, width, height);
 pop();


 let currentGesture = "None";
 if (hands.length > 0) {
   let hand = hands[0];
   currentGesture = classifyGesture(hand);


   // 在選擇階段同步更新顯示文字
   if (gameState === "CHOICE" && (currentGesture === "讚" || currentGesture === "倒讚")) {
     playerChoice = currentGesture;
   }
   // 繪製手部關鍵點（選配，增加視覺回饋）
   for (let i = 0; i < hand.keypoints.length; i++) {
     let keypoint = hand.keypoints[i];
     fill(255, 255, 255, 150);
     noStroke();
     // 加入一點發光效果
     fill(colorPrimary[0], colorPrimary[1], colorPrimary[2], 200);
     circle(width - keypoint.x, keypoint.y, 10);
     // 因為鏡像關係，X 座標需調整
   }
 }


 // 狀態邏輯切換 (移至此處以確保倒數不會因手部消失而中斷)
 if (gameState === "WAITING") {
   playerChoice = "準備好了嗎？";
   result = "";
   computerChoice = "";
   // 如果偵測到有效手勢，進入倒數狀態
   if (choices.includes(currentGesture)) {
     gameState = "COUNTDOWN";
     timer = millis();
   }
 } else if (gameState === "COUNTDOWN") {
   let elapsed = millis() - timer;
   countdownValue = 3 - Math.floor(elapsed / 1000);


   // 在倒數時即時顯示玩家目前預備的手勢
   if (choices.includes(currentGesture)) {
     playerChoice = currentGesture;
   }


   // 倒數 3 秒結束
   if (countdownValue <= 0) {
     computerChoice = random(choices);
     determineWinner();
     gameState = "CHOICE";
     timer = millis();
   }
 }


 // 繪製頂部資訊列 (更美觀的卡片感)
 push();
 fill(colorBg);
 noStroke();
 rect(20, 15, width - 40, 100, 15);
  textAlign(CENTER, CENTER);
 fill(colorText);
 textStyle(BOLD);
 textSize(22);
 text("玩家 (你)", width / 4 + 20, 45);
 text("電腦 (CPU)", 3 * width / 4 - 20, 45);
  textSize(36);
 fill(colorPrimary);
 text(playerChoice, width / 4 + 20, 85);
 fill(colorAccent);
 text(computerChoice, 3 * width / 4 - 20, 85);
 pop();


 // 繪製計分系統 (單獨顯示於右上角)
 push();
 textAlign(RIGHT, TOP);
 textSize(16);
 textStyle(BOLD);
 fill(colorText);
 let scoreBoxX = width - 40;
 text(`🏆 勝: ${playerScore}`, scoreBoxX, 30);
 text(`🤝 平: ${tieScore}`, scoreBoxX, 55);
 text(`💀 敗: ${computerScore}`, scoreBoxX, 80);
 pop();


 // 繪製畫面中央的倒數數字或結果
 if (gameState === "COUNTDOWN") {
   fill(255, 0, 0);
   textSize(160);
   text(countdownValue, width / 2, height / 2);
 }


 // 繪製「繼續遊戲」與「結束遊戲」選項
 if (gameState === "CHOICE") {
   // 繪製半透明深色背景，讓選項更突出
   fill(0, 0, 0, 100);
   rect(0, 0, width, height);


   // 顯示勝負結果
   push();
   textStyle(BOLD);
   fill(255);
   stroke(0);
   strokeWeight(4);
   textSize(72);
   text(result, width / 2, height / 2 + 20);
   pop();


   // 繼續遊戲按鈕
   fill(255);
   stroke(colorSecondary);
   strokeWeight(3);
   // 滑鼠懸停 或 手勢辨識效果
   if ((mouseX > width / 2 - 155 && mouseX < width / 2 - 5 && mouseY > height / 2 + 80 && mouseY < height / 2 + 130) || currentGesture === "讚") fill(colorSecondary);
   rect(width / 2 - 155, height / 2 + 80, 150, 55, 15);
   fill(currentGesture === "讚" ? 255 : colorText);
   noStroke();
   textSize(22);
   text("繼續遊戲", width / 2 - 80, height / 2 + 105);


   // 結束遊戲按鈕
   fill(255);
   stroke(colorAccent);
   strokeWeight(3);
   // 滑鼠懸停 或 手勢辨識效果
   if ((mouseX > width / 2 + 5 && mouseX < width / 2 + 155 && mouseY > height / 2 + 80 && mouseY < height / 2 + 130) || currentGesture === "倒讚") fill(colorAccent);
   rect(width / 2 + 5, height / 2 + 80, 150, 55, 15);
   fill(currentGesture === "倒讚" ? 255 : colorText);
   noStroke();
   textSize(22);
   text("結束遊戲", width / 2 + 80, height / 2 + 105);


   // 手勢執行邏輯
   if (currentGesture === "讚") {
     gameState = "WAITING";
   } else if (currentGesture === "倒讚") {
     gameState = "FINISHED";
   }
 }


 // 繪製「遊戲結束」最終畫面
 if (gameState === "FINISHED") {
   push();
   background(44, 62, 80, 240);
   fill(255);
   textAlign(CENTER, CENTER);
   textStyle(BOLD);
   textSize(56);
   text("GAME OVER", width / 2, height / 2 - 40);
   textSize(22);
   textStyle(NORMAL);
   text("若要再次進入遊戲請重新整理頁面", width / 2, height / 2 + 40);
   text(`最終戰績: ${playerScore} 勝 / ${tieScore} 平 / ${computerScore} 敗`, width / 2, height / 2 + 90);
   pop();
   noLoop(); // 停止繪製循環，節省資源
 }


 // 繪製底部遊戲指示
 if (gameState !== "FINISHED") {
   fill(0, 0, 0, 150);
   noStroke();
   rect(0, height - 50, width, 50);
   fill(255);
   textSize(18);
   text("遊戲指示：請舉起手開始倒數；一局結束後，比讚 👍 繼續，比倒讚 👎 結束", width / 2, height - 25);
 }
}


function classifyGesture(hand) {
 // 簡單的手法判定：比較手指尖端與關節的 Y 座標
 // 在 p5 座標系中，Y 越小代表位置越高
 let indexUp = hand.keypoints[8].y < hand.keypoints[6].y;
 let middleUp = hand.keypoints[12].y < hand.keypoints[10].y;
 let ringUp = hand.keypoints[16].y < hand.keypoints[14].y;
 let pinkyUp = hand.keypoints[20].y < hand.keypoints[18].y;


 if (indexUp && middleUp && ringUp && pinkyUp) return "布";
 if (indexUp && middleUp && !ringUp && !pinkyUp) return "剪刀";
  if (!indexUp && !middleUp && !ringUp && !pinkyUp) {
   // 拇指尖端(4)與拇指根部(2)比較。Y值越小越高。
   if (hand.keypoints[4].y < hand.keypoints[2].y - 30) return "讚";
   if (hand.keypoints[4].y > hand.keypoints[2].y + 30) return "倒讚";
   return "石頭";
 }
  return "偵測中...";
}


function determineWinner() {
 if (playerChoice === computerChoice) {
   result = "平手！";
   tieScore++;
 } else if (
   (playerChoice === "石頭" && computerChoice === "剪刀") ||
   (playerChoice === "布" && computerChoice === "石頭") ||
   (playerChoice === "剪刀" && computerChoice === "布")
 ) {
   result = "你贏了！太棒了！";
   playerScore++;
 } else {
   result = "你輸了，再試一次吧！";
   computerScore++;
 }
}


function mousePressed() {
 if (gameState === "CHOICE") {
   // 檢查是否點擊「繼續遊戲」
   if (mouseX > width / 2 - 155 && mouseX < width / 2 - 5 && mouseY > height / 2 + 80 && mouseY < height / 2 + 130) {
     gameState = "WAITING";
   }
   // 檢查是否點擊「結束遊戲」
   if (mouseX > width / 2 + 5 && mouseX < width / 2 + 155 && mouseY > height / 2 + 80 && mouseY < height / 2 + 130) {
     gameState = "FINISHED";
   }
 }
}
