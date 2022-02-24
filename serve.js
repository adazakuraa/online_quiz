const crypto = require('crypto');
const app  = require("express")();
const http = require("http").createServer(app);
const io   = require("socket.io")(http);

// HTMLやJSなどを配置するディレクトリ
const DOCUMENT_ROOT = __dirname + "/public";

/**
 * "/"にアクセスがあったらindex.htmlを返却
 */
app.get("https://adazakuraa.github.io/online_quiz/", (req, res)=>{
  res.sendFile(DOCUMENT_ROOT + "/index.html");
});
app.get("/:file", (req, res)=>{
  res.sendFile(DOCUMENT_ROOT + "/" + req.params.file);
});


let d=[["もんだいぶん1","こたえ1"],["問題文2","答え2"],["問題文3","答え2"],["問題文4","答え2"],["問題文5","答え2"]];
var player_name=[[1,2,3],[1,2,3],[1,2,3]];
let count=0;
let flag=0;
let flag2=0;
let flag3=0;

//取得した配列をシャッフル
const shuffle = ([...array]) => {
    for (let i = array.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};



/**
 * [イベント] ユーザーが接続
 */
io.on("connection", (socket)=>{
    //問題文を送る
    io.emit("mondai",d);  

    //---------------------------------
    // ログイン
    //---------------------------------
    (()=>{
        // トークンを作成
        const token = makeToken(socket.id);

        // 本人にトークンを送付
        io.to(socket.id).emit("token", {token:token});
    })();

    //参加者リストを作る
    socket.on("name-box",(player)=>{
        player_name[count][0]=player;
        player_name[count][1]=0;
        player_name[count][2]=0;

        io.emit("member",count);
        count+=1;
    });

    //ゲームスタート
    socket.on("start",(star)=>{
        io.emit("start2",1);
    });

    socket.on("start3",(star)=>{
        io.emit("p_list",player_name);
    });

    //問題文の読み上げ
    socket.on("int",(int)=>{
        if(flag==0){
            console.log("3.問題文の読み上げ");
            io.emit("ima",1);
        }
        flag=1;
    });

    //回答する
    socket.on("stop",(ans_name)=>{
        if(flag2==0){
            console.log("4.回答");
            io.emit("stop2",ans_name);
        }
        flag2=1;
        flag3=0;
    });

    socket.on("ans",(answer)=>{
        if(answer!=0){
            player_name[answer.count][1]=answer.seikai;
            player_name[answer.count][2]=answer.goto;
        }
        else{
            flag3=0;
        }
        io.emit("answer",{
            list: player_name,
            answer: answer
        });
    });

    socket.on("next",(s)=>{
        if(flag3==0){
            console.log("次の問題");
            io.emit("ima",1);
        }
        flag3=1;
        flag=0;
        flag2=0;
    });

});

/**
 * 3000番でサーバを起動する
 */
http.listen(3000, ()=>{
  console.log("listening on *:3000");
});


/**
 * トークンを作成する
 *
 * @param  {string} id - socket.id
 * @return {string}
 */
function makeToken(id){
  const str = "aqwsedrftgyhujiko" + id;
  return( crypto.createHash("sha1").update(str).digest('hex') );
}
