const touchArea1 = document.getElementById("touch-area1")
//タッチに反応する
touchArea1.addEventListener("touchstart", () => {
      if(count==0){
          int();
      }
      else if(count==1){
          stop("you");
      }
      else if(count==2){
          next();
      }
})

//読み込むcsvファイルをプルダウンから取得
function select(n){
    n=parseInt(n,10);
    switch(n){
        case 1:
            csv_read("csv/STU1~9.csv");
            break;
        case 2:
            csv_read("csv/STU1~23.csv");
            break;
        case 3:
            csv_read("csv/abc.csv");
            break;
        case 4:
            csv_read("csv/漢字.csv");
            break;
    }
}

//プルダウン
window.addEventListener('DOMContentLoaded', function(){
       const spinner = document.getElementById('loading');

	// select要素を取得
	var select_csv = document.querySelector("select[name=csv]");
     spinner.classList.remove('loaded');
     select(select_csv.value);

	select_csv.addEventListener('change',function(){
                spinner.classList.remove('loaded');
		select(select_csv.value);
	});
});

//csvファイルを読み込み
function csv_read(csv_path)
{
    const spinner = document.getElementById('loading');
    fetch(csv_path)
    .then((res) => {
        if(!res.ok) {
            console.log('正常にリクエストを処理できませんでした。');
        }
        return res.text();
    })
    .then((csv_data) => {
            let b =csv_data.split('\r\n');
            d=[];
            for(let i = 0; i<b.length; i++){
                let c =b[i].split(',');
                d.push(c);
                d=shuffle(d);
                spinner.classList.add('loaded');
            }
    })
    .catch((error) => {
        console.log('エラーが発生しました。');
    })
}
//問題文と答えを格納する配列
let d=[];　

//取得した配列をランダムにシャッフル
const shuffle = ([...array]) => {
    for (let i = array.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

window.onload = function() {
    if($("#no3").style.display == ""){
        init();
    }
  };

//csvファイルの読み込み => データを多次元配列に格納
function init(){
    document.getElementById("mondai").innerHTML = "EnterかShiftを押すと問題文が表示されます。";
    const spinner = document.getElementById('loading');
    spinner.classList.add('loaded');
    let file = document.querySelector('#getfile');
    file.onchange = function (){
        spinner.classList.remove('loaded');
        let fileList = file.files;
        console.log(fileList)
        let reader = new FileReader(); 
        reader.readAsText(fileList[0]);
        reader.onload=function(){
            let a=reader.result;
            console.log(a)
            let b =　a.split('\r\n');
            d=[];
            for(let i = 0; i<b.length; i++){
                let c =b[i].split(',');
                d.push(c);
                d=shuffle(d);
            }
            spinner.classList.add('loaded');
        }
    };
};


//準備
let q=0;　//q+1問目の問題　
let q2=0; //表示用
let k=0;　//問題文のk+1文字目
let time=80; //文字が表示される間隔（ミリ秒）
let time2=3000; //問題が読み切られてから答えが表示されるまでの時間（ミリ秒）
let time3=650  //第n問目の表示から問題文が表示されるまでの時間（ミリ秒）
let maru=null;　//目標○数
let batu=null;　//失格×数
let count=0;  //場合分け用
let count2=0; //場合分け用その2
var seikai={};　//各プレイヤーの正解数
var goto={};  //各プレイヤーの誤答数
var n={};　//プレイヤーの名前
var music1 = new Audio('music/question.mp3'); //効果音
var music2 = new Audio('music/button.mp3');
var music3 = new Audio('music/correct.mp3');
var music4 = new Audio('music/wrong.mp3');
var music5 = new Audio('music/win.mp3');
var music6 = new Audio('music/lose.mp3');
var music7 = new Audio('music/through.mp3');


//指定ミリ秒の間、処理を止める
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let id;
//指定した間隔でappchar関数を呼び出す
async function int(){
    if(d.length==0){
        alert("使用する問題ファイルを選択してください。");
    }
    else{
        count=1;
        if(q==0){
            document.getElementById("mondai").innerHTML = "";
        }
        music1.play();
        document.getElementById("ima").innerHTML = "第"+(q2+1)+"問";
        await sleep(time3);
        id=setInterval(appchar,time);
        q2+=1;
    }
}

//問題文を読み上げる & 読み終わったら指定ミリ秒後にans関数を呼び出す
async function appchar(){
    document.getElementById("ima").innerHTML = "";
    let question=["Q. "]+d[q][0];
    let txt = question.charAt(k);
    let x = document.getElementById("mondai").innerHTML;
    if (k <= question.length) {
        x = x + txt;
        document.getElementById("mondai").innerHTML = x;
        k+=1;
    }
    else{
        clearInterval(id);
        start();
    }
}

//キーイベントを受け付けてstop関数を呼び出す
document.addEventListener("keydown", (event) => {
    let keyname=event.key;
    if(keyname=="Shift"){
        if(count==0){
            int();
        }
        else if(count==1){
            if (n[keyname]==null){
                stop(keyname);
            }
            else{
                stop(n[keyname]);
            }
        }
        else if(count==2){
            next();
        }
    }
});

//勝利or失格を通知する
function res(key){
    if(seikai[key]==maru){
        music5.play();
        alert("正解数"+maru+"で回答者'"+key+"'の勝利です。");
    }
    if(goto[key]==batu){
        music6.play();
        alert("誤答数"+batu+"で回答者'"+key+"'は失格です。");
    }
    if(count2==0){
        point();
    }
}

//問題文の読み上げを止めてプロンプトを表示し、ans関数を呼び出す
async function stop(key) {
    music2.play();
    clearInterval(id);
    if(key==" "){
        key="space";
    }
    if(!(key in seikai)){
        seikai[key]=0;
    }
    if(!(key in goto)){
        goto[key]=0;
    }
    let result = prompt("答えを入力して「OK」を押してください。回答者は'"+key+"'です。");
    //キャンセルを押した場合
    if(result==null){
        await sleep(1000);
        int();
    }
    //OKを押した場合
    else{
        ans();
        await sleep(1);

        //何も入力していない
        if (result==""){
            goto[key]+=1;
            if(count2==0){
                music4.play();
                let correct=prompt("不正解。 \n\n"+"回答者'"+key+"'の現在の正解数:"+seikai[key]+"  誤答数:"+goto[key]+"\n\n正解数や誤答数を修正したければ1を、この問題を無かったことにしたければ2を押してください。"); 
                if(correct=="1"){
                    goto[key]-=1;
                    seikai[key]+=1;
                    if(seikai[key]!=maru){
                        music3.play();
                    }
                } 
                if(correct=="2"){
                    goto[key]-=1;
                }  
            }
            res(key);
        }
        //正解なら
        else if(d[q][1].indexOf(result)!=-1){
            if(key in seikai){
                seikai[key]+=1;
            }
            music3.play();
            let correct=prompt("正解! \n\n"+"回答者'"+key+"'の現在の正解数:"+seikai[key]+"  誤答数:"+goto[key]+"\n\n正解数や誤答数を修正したければ1を、この問題を無かったことにしたければ2を押してください。");
            if(correct=="1"){
                goto[key]+=1;
                seikai[key]-=1;
                if(goto[key]!=batu){
                    music4.play();
                }
            }
            if(correct=="2"){
                seikai[key]-=1;
            }
            res(key);
        }
        //誤答なら
        else{
            if(key in goto){
                goto[key]+=1;
            }
            music4.play();
            let correct=prompt("不正解。 \n\n"+"回答者'"+key+"'の現在の正解数:"+seikai[key]+"  誤答数:"+goto[key]+"\n\n正解数や誤答数を修正したければ1を、この問題を無かったことにしたければ2を押してください。"); 
            if(correct=="1"){
                goto[key]-=1;
                seikai[key]+=1;
                if(seikai[key]!=maru){
                    music3.play();
                }
            } 
            if(correct=="2"){
                goto[key]-=1;
            }  
            res(key);
        }
    }
}

//答えを表示する
function ans(){
    count=2;
    let question=["Q. "]+d[q][0];
    document.getElementById("mondai").innerHTML = question;
    let ans=["A. "]+d[q][1];
    document.getElementById("ans").innerHTML = ans;
}

//画面をリセットして次の問題を用意する
function next() {
    document.getElementById("mondai").innerHTML = "";
    document.getElementById("ans").innerHTML = "";
    document.getElementById("myProgress").value = -1;
    q+=1;
    k=0; 
    count=0;
}

//正解数と誤答数を表示する
function point(){
    if((Object.values(seikai).length)!=0){
        text=("");
        for(var player in seikai){
            if (goto[player]==batu){
                text+=("'"+player+"'は失格です。<br>");
            }
            else if (seikai[player]==maru){
                text=("'"+player+"'の勝利です。<br>");
                document.getElementById("tokuten").innerHTML = text;
                return false;
            }
            else{
                text+=("'"+player+"'　正解数: "+seikai[player]+"  　誤答数: "+goto[player]+"<br>");
            }
        }
    }
    document.getElementById("tokuten").innerHTML = text;
}

//ルール設定
function rule(){
    if(maru==null){
        if(window.confirm("現在はフリーモードです。N○M×に変更しますか？")){
            maru=prompt("何○にしますか？");
            batu=prompt("何×にしますか？");
        }
    }
    else {
        if(window.confirm("現在のルールは"+maru+"◯"+batu+"×です。変更しますか？")){
            maru=prompt("何○にしますか？");
            batu=prompt("何×にしますか？");
        }
    }
}

//速度設定
function speed(){
    if(window.confirm("問題文が表示されるスピードは'1文字/"+time+"ミリ秒'です。変更しますか？")){
        time=prompt("'1文字/何ミリ秒'にしますか？");
    }
    if(window.confirm("答えが表示されるまでの時間は'"+time2+"ミリ秒'です。変更しますか？")){
        time2=prompt("'何ミリ秒'にしますか？");
    }
}

//連想配列の消去
function del(li){
    for(var i in li){
        delete li[i];
    }
}

//正解数等のリセット
function reset(){
    del(seikai);
    del(goto);
    q2=0;
    alert('正解数と誤答数をリセットしました。');
    document.getElementById("tokuten").innerHTML = "";
}

//名前登録
function na(){
    if(window.confirm("使用するキーに名前を登録しますか？")){
        let key=prompt("使用するキーを登録してください。");
        if(key=="ひとり"){
            if(count2==0){
                count2=1;
                alert("一人用モードになりました。得点が表示されなくなります。");
            }
            else{
                count2=0;
                alert("通常モードに戻りました。得点が表示されるようになります。")
            }
        }
        else{
            let nam=prompt("名前を登録してください。");
            n[key]=nam;
            seikai[nam]=0;
            goto[nam]=0;
            point();
        }
    }
}

//bgmをミュートする
function enableMute() {
    music2.muted = true;
    music3.muted = true;
    music4.muted = true;
    music1.muted = true;
    music5.muted = true;
    music6.muted = true;
    music7.muted = true;
}

//bgmをonにする
function disableMute() {
  music1.muted = false;
  music2.muted = false;
  music3.muted = false;
  music4.muted = false;
  music5.muted = false;
  music6.muted = false;
  music7.muted = false;
}

var intervalID;
//一定の間隔でupdataProgressを呼び出す
function start() {
  Max = (time2-200)/50;
  document.getElementById("myProgress").max = Max;
  intervalID = setInterval("updateProgress()", 50);
}

// プログレスバーを更新する
function updateProgress() {
  document.getElementById("myProgress").value = Max;
  Max -= 1;
  if (Max == -1) {
    clearInterval(intervalID);
    music7.play();
    ans();
  }
  else if(count==2){
    document.getElementById("myProgress").value = -1;
    clearInterval(intervalID);
  }
}
