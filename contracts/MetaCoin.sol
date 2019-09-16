pragma solidity >=0.4.21 <0.6.0;

import "./ConvertLib.sol";

// This is a simple example of a coin-like contract.
// It is not standards compatible and cannot be expected to talk to other
// coin/token contracts. If you want to create a standards-compliant
// token, see: https://github.com/ConsenSys/Tokens. Cheers!

contract MetaCoin {
    // 根据账户地址查找账户余额
    mapping (address => uint) balances;

    // event Transfer(address indexed _from, address indexed _to, uint256 _value);

    // 初始账户余额为10000
    constructor() public {
        balances[msg.sender] = 10000;
    }

    // event事件向web3返回数据
    event Transfer(address indexed _from, string message);
    function sendCoin(address receiver, uint amount) public returns(bool sufficient) {
        if (balances[msg.sender] < amount) {
            // 发送失败
            emit Transfer(msg.sender, "MetaCoin不足，发送失败");
            return false;
        } else {
            // 发送失败
            balances[msg.sender] -= amount;
            balances[receiver] += amount;
            emit Transfer(msg.sender, "MetaCoin发送成功");
            return true;
        }
    }

    // 获取账户MetaCoin数量乘以2
    function getBalanceInEth(address addr) public view returns(uint) {
        return ConvertLib.convert(getBalance(addr),2);
    }

    // 获取庄户MetaCoin
    function getBalance(address addr) public view returns(uint) {
        return balances[addr];
    }
}
