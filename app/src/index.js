import Web3 from "web3";
import metaCoinArtifact from "../../build/contracts/MetaCoin.json";

const App = {
  web3: null,
  account: null,
  meta: null,

  start: async function() {
    const { web3 } = this;

    try {
      // 获取合约实例
      const networkId = await web3.eth.net.getId();

      const deployedNetwork = metaCoinArtifact.networks[networkId];

      this.meta = new web3.eth.Contract(
        metaCoinArtifact.abi,
        deployedNetwork.address,
      );

      // 获取账户
      try{
        const accounts = await web3.eth.getAccounts();
        if(accounts.length == 0) {
          alert("以太坊账户为空");
          return;
        }
        console.log("accounts", accounts);
        this.account = accounts[0];
        this.refreshBalance();
      } catch(err) {
        console.error("获取以太坊账户失败");
      }
      
      
    } catch (error) {
      console.error("不能连接到合约或区块");
    }
  },

  refreshBalance: async function() {
    const { getBalance } = this.meta.methods;
    try{
      const balance = await getBalance(this.account).call();
      const balanceElement = document.getElementsByClassName("balance")[0];
      balanceElement.innerHTML = balance;
    } catch(err) {
      console.log(err);
      this.setStatus("获取余额失败");
    }
    
    
    
  },

  sendCoin: async function() {
    const amount = parseInt(document.getElementById("amount").value);
    const receiver = document.getElementById("receiver").value;

    // eventTransferMessage.watch(function(err, event){
    //   console.log("err:", err);
    //   console.log("event", event);
    // })

    // 判断账号有效性
    if(await this.isAccountCorrect(receiver)) {
      this.setStatus("发送进行中，请等待...");
      const { sendCoin } = this.meta.methods;

      // try {
      //   console.log("amount: ", amount);
      //   await sendCoin(receiver, amount).send({ from: this.account });
      // } catch (err) {
      //   console.log(err);
      //   return false;
      // }
      // console.log(this.meta.events);

      let self = this;
      this.meta.events.Transfer()
      .on("data", function(event) {
        // event 内包含了从交易返回的所有数据，event.returnValue即可获得
        // 发送成功或失败的消息
        console.log("data", event);
        const _from = event.returnValues[0];
        const message = event.returnValues[1];
        alert("Transfer()事件返回：" + JSON.stringify(event));
        self.setStatus(message);

      }).on("error", function(error){
        console.log(error);
        self.setStatus("发送交易失败");
      });

      await sendCoin(receiver, amount).send({ from: this.account, gas: 1000000})
      
      // this.setStatus("Transaction complete!");
      this.refreshBalance();
    } else {
      this.setStatus("输入账户错误");
    }
    
  },

  setStatus: function(message) {
    const status = document.getElementById("status");
    status.innerHTML = message;
  },

  isAccountCorrect: async function(receiver) {
    const { web3 } = this;
    const accounts = await web3.eth.getAccounts();
    for(let i = 0; i < accounts.length; i++) {
        if(receiver == accounts[i]) {
            return true;
        }
    }
    return false;
  },
};

window.App = App;

window.addEventListener("load", function() {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    window.ethereum.enable(); // get permission to access accounts
  } else {
    console.warn(
      "No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live",
    );
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(
      // new Web3.providers.HttpProvider("http://127.0.0.1:8545"),
      new Web3.providers.WebsocketProvider('ws://localhost:8545'),
    );
  }

  App.start();
});
