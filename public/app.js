//自分自身の情報を入れる
const IAM = {
    token: null,  // トークン
    name: null,    // 名前
    seikai: 0,
    goto: 0,
    result: 0, //直前の問題の正誤
    count: null
};
  
//-------------------------------------
// STEP1. Socket.ioサーバへ接続
//-------------------------------------
const socket = io();
  
// 正常に接続したら
socket.on("connect", ()=>{
    // 表示を切り替える
    $("#no1").style.display = "none";   // 「接続中」を非表示
    $("#no2").style.display = "block";    // 名前入力を表示
});
  
// トークンを発行されたら
socket.on("token", (data)=>{
    IAM.token = data.token;
});
    
//-------------------------------------
// STEP2. 名前の入力
//-------------------------------------
/**
* [イベント] 名前入力フォームが送信された
*/
$("#frm-myname").addEventListener("submit", (e)=>{
    // 規定の送信処理をキャンセル(画面遷移しないなど)
    e.preventDefault();
    
    // 入力内容を取得する
    const myname = $("#txt-myname");
    if( myname.value === "" ){
        return(false);
    }
    
    // 名前をセット
    IAM.name = myname.value;
    
    // 表示を切り替える
    $("#no2").style.display = "none";   // 名前入力を非表示
    $("#no2-5").style.display = "block";         // チャットを表示

    socket.emit("name-box",IAM.name);
});

socket.on("member",(co)=>{
    if(IAM.count==null){
        IAM.count=co;
    }
    document.getElementById("member").innerHTML=(co+1)+"人参加しています。"
})


  
  
//-------------------------------------
// STEP3. ゲーム開始
//-------------------------------------


//問題文と答えを格納する配列
let d=[];
let q=0;　//q+1問目の問題　
let q2=0; //表示用
let k=0;　//問題文のk+1文字目
let time=80; //文字が表示される間隔（ミリ秒）
let time2=3000; //問題が読み切られてから答えが表示されるまでの時間（ミリ秒）
let time3=650  //第n問目の表示から問題文が表示されるまでの時間（ミリ秒）
let count=0;
let app=0;
let c=0;
let maru=7;
let batu=3;

//指定ミリ秒の間、処理を止める
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

socket.on("mondai",(mondai)=>{
    d=mondai;
})

//ゲームをスタートする
function st(){
    socket.emit("start",1);   
}

socket.on("start2",(s)=>{
    $("#no2-5").style.display = "none";   
    $("#no3").style.display = "block";  

    socket.emit("start3",1);   
})

//各プレイヤーの得点を初期値にする
socket.on("p_list",async (player_name)=>{
    point(player_name);
    await sleep(1500);
    socket.emit("int",1);
})

socket.on("ima",async (s)=>{
    if(q==0){
        document.getElementById("mondai").innerHTML = "";
    }
    console.log("4.今何問目？"+q2)
    document.getElementById("ima").innerHTML = "第"+(q2+1)+"問";
    await sleep(time3);
    count=0;
    id=setInterval(appchar,time);
    q2+=1;
})

//問題文を読み上げる & 読み終わったら指定ミリ秒後にans関数を呼び出す
async function appchar(){
    console.log("読み上げ")
    document.getElementById("ima").innerHTML = "";
    app=1;
    let question=["Q. "]+d[q][0];
    let txt = question.charAt(k);
    let x = document.getElementById("mondai").innerHTML;
    if (k <= question.length) {
        x = x + txt;
        document.getElementById("mondai").innerHTML = x;
        count=0;
        k+=1;
    }
    else{
        clearInterval(id);
        await sleep(time2);
        if(c!=2){
            console.log("スルー")
            c=1;
            if(IAM.count==0){
                socket.emit("ans",0);    
            }
        }
    }
}

//キーイベントを受け付けてstop関数を呼び出す
document.addEventListener("keydown", (event) => {
    let keyname=event.key;
    if(app==1){
        if(keyname=="Shift" || keyname=="Enter" || keyname=="Space"){
            if($("#no3").style.display == "block"){
                socket.emit("stop",IAM.name);
            }
        }
    }
});

socket.on("stop2",async (ans_name)=>{
    app=0;
    if(ans_name==IAM.name){
        stop(IAM.name);
    }
    else{
        console.log("ボタンが押された")
        c=2;
        clearInterval(id);
    }
})

//問題文の読み上げを止めてプロンプトを表示し、ans関数を呼び出す
async function stop(key) {
    console.log("ボタン")
    clearInterval(id);
    let result = prompt("答えを入力して「OK」を押してください。回答者は'"+key+"'です。");
    //キャンセルを押した場合
    if(result==null){
        socket.emit("int",1);
    }
    //OKを押した場合
    else{
        ans();
        await sleep(1);

        //正解なら
        if(d[q][1].indexOf(result)!=-1 && result!=""){
            IAM.seikai+=1;
            let correct=prompt("正解! \n\n正解数や誤答数を修正したければ1を、この問題を無かったことにしたければ2を押してください。");
            if(correct=="1"){
                IAM.goto+=1;
                IAM.seikai-=1;
                IAM.result=0;
                if(IAM.goto!=batu){
                }
                socket.emit("ans",IAM);
                
            }
            else if(correct=="2"){
                IAM.seikai-=1;
                socket.emit("ans",IAM);
            }
            else if(correct==""){
                IAM.result=1;
                socket.emit("ans",IAM); 
            }
        }
        //誤答なら
        else{
            IAM.goto+=1;
            let correct=prompt("不正解。 \n\n正解数や誤答数を修正したければ1を、この問題を無かったことにしたければ2を押してください。"); 
            if(correct=="1"){
                IAM.goto-=1;
                IAM.seikai+=1;
                IAM.result=1;
                if(IAM.seikai!=maru){
                }
                socket.emit("ans",IAM);
            } 
            else if(correct=="2"){
                IAM.goto-=1;
                socket.emit("ans",IAM);
            }  
            else if(correct!=null){
                IAM.result=0;
                socket.emit("ans",IAM); 
            }
        }
    }
}

//答えを表示する
function ans(){
    if(count!=2){
        console.log("ans")
        let question=["Q. "]+d[q][0];
        document.getElementById("mondai").innerHTML = question;
        let ans=["A. "]+d[q][1];
        document.getElementById("ans").innerHTML = ans;
    }
    count=2;
}
 
function point(player_name){
    text=("");

    for (var n=0;n<player_name.length;n++){
        text+=(player_name[n][0]+"　正解数： "+player_name[n][1]+"　　誤答数: "+player_name[n][2]+"<br>");
    }
    document.getElementById("tokuten").innerHTML = text;
}

socket.on("answer",async (a)=>{
    if(c!=1){
        point(a.list);
    }
    if(a.answer.name!=IAM.name && a.answer!=0){
        if(a.answer.result==1){
            console.log(a.answer.name+"が正解しました");
        }
        else{
            console.log(a.answer.name+"が誤答しました");
        }
    }
    ans();
    next();

})

//画面をリセットして次の問題を用意する
async function next() {
    await sleep(2000);
    console.log("白紙")
    document.getElementById("mondai").innerHTML = "";
    document.getElementById("ans").innerHTML = "";
    document.getElementById("myProgress").value = -1;
    q+=1;
    console.log(q+"問目")
    k=0; 
    socket.emit("next",1);
}


let intervalID;
//一定の間隔でupdataProgressを呼び出す
function start() {
    Max = (time2-200)/50;
    document.getElementById("myProgress").max = Max;
    intervalID = setInterval("updateProgress()", 500);
}

// プログレスバーを更新する
function updateProgress() {
    document.getElementById("myProgress").value = Max;
    Max -= 1;
    if (Max == -1) {
        clearInterval(intervalID);
        ans();
    }
    else if(count==2){
        document.getElementById("myProgress").value = -1;
        clearInterval(intervalID);
    }
}