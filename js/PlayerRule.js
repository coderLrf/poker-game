/**
 * 玩家规则类，每一名玩家需要遵循游戏规则来进行开始游戏
 * @constructor
 */
function PlayRule() {

  // 牌库
  this.box = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', '大王', '小王']

  // 规则方法
  this.rule = function (outCard, player) {
    let flag = false
    // 根据用户输入的字符串长度来判断出的是哪种类型
    switch (outCard.length) {
      case 1: // 出单张
        player.setType('one')
        flag = this.oneCard(outCard)
        break;
      case 2: // 出对子
        player.setType('two')
        flag = this.twoCard(outCard, player)
        break;
      case 3: // 出三条
        player.setType('three')
        flag = this.threeCard(outCard)
        break;
      case 4: // 出炸弹
        player.setType('four')
        flag = this.fourCard(outCard)
        break;
      case 5:
      case 6:
      case 7:
      case 8:
      case 9:
      case 10:
      case 11:
      case 12:
      case 13:
        player.setType('line')
        flag = this.lineCard(outCard)
        break
      default:
    }

    return flag
  }

  // 单张牌的规则，满足单牌的规则
  this.oneCard = function (outCard) {
    const card = outCard[0].card
    return this.box.indexOf(card.number) !== -1 // 满足点数即可
  }

  // 两张牌的规则
  this.twoCard = function (outCard, player) {
    const card1 = outCard[0].card
    const card2 = outCard[1].card
    if ((card1.number === '大王' && card2.number === '小王') || (card1.number === '小王' && card2.number === '大王')) {
      player.setType('four')
      return true
    }

    return (card1.number === card2.number)
  }

  // 三张牌的规则
  this.threeCard = function (outCard) {
    const card1 = outCard[0].card
    const card2 = outCard[1].card
    const card3 = outCard[2].card
    return card1.number === card2.number && card1.number === card3.number && card3.number === card2.number
  }

  // 四张牌的规则
  this.fourCard = function (outCard) {
    const card1 = outCard[0].card
    const card2 = outCard[outCard.length - 1].card

    return card1.number === card2.number
  }

  // 顺子的规则
  this.lineCard = function (outCard) {
    const lines = outCard.map(card => card.card)
    // 根据大小进行排序
    lines.sort((card1, card2) => {
      return card1.size - card2.size
    })
    // 排除大王和小王和2
    const index = lines.findIndex(card => {
      return card.number === '大王' || card.number === '小王' || card.number === '2'
    })
    if (index !== -1) {
      return false
    }
    // 排除重复可能
    for (let i = 0; i < lines.length - 1; i++) {
      if (lines[i].size === lines[i + 1].size) {
        return false // 不满足
      }
    }
    // 求出最大值和最小值
    let maxSize = lines[0].size
    let minSize = lines[0].size

    for (let i = 1; i < lines.length; i++) {
      if (maxSize < lines[i].size) {
        maxSize = lines[i].size
      }
      if (minSize > lines[i].size) {
        minSize = lines[i].size
      }
    }

    // 使用最大值与最小值之差
    return (maxSize - minSize) <= lines.length - 1
  }

  /**
   * 下面是给电脑玩家判断一张牌是否能够成为对子、三条、炸弹、顺子
   */

  // 是否存在以下关系
  this.canToContact = function (player, index) {
    if(player.box.length < 2) {
      return null
    }
    if(((index > 0) && (player.box[index].number === '小王' && player.box[index - 1].number !== '大王'))
      || (player.box[index].number === '大王')) {
      return null
    }
    return this.canToLine(player, index)
      || this.canToBomb(player, index)
      || this.canToThree(player, index)
      || this.canToPair(player, index)
  }

  // 对子
  this.canToPair = function (player, index) {
    let count = 1
    // 判断前后是否一样即可
    while (index > 0 && (player.box[index - 1].number === player.box[index].number) && count < 2) { // 前面
      count++
      index--
    }
    if(count === 1) {
      while (index < player.box.length - 1 && (player.box[index + 1].number === player.box[index].number)) { // 后面
        count++
        index++
      }
      if(count > 1) {
        index -= (count - 1)
      }
    }
    return count >= 2 ? index - 1 : null
  }

  // 三条
  this.canToThree = function (player, index) {
    let count = 1
    while (index > 0 && (player.box[index - 1].number === player.box[index].number)) { // 前面
      count++
      index--
    }
    if(count < 3) {
      index += count - 1
      while(index < player.box.length - 1 && (player.box[index + 1].number === player.box[index].number)) { // 后面
        count++
        index++
      }
    }
    return count >= 3 ? index - 1 : null
  }

  // 炸弹
  this.canToBomb = function (player, index) {
    // 至少四张，大小王除外
    if (index >= 1 && index < player.box.length - 1) {
      if (player.box[index].number === '小王' && player.box[index - 1].number === '大王'
        || player.box[index + 1].number === '小王' && player.box[index].number === '大王') {
        return true
      }
    }
    let count = 1
    while (index > 0 && (player.box[index - 1].number === player.box[index].number)) { // 前面
      count++
      index--
    }
    if(count < 4) { // 后面
      index += count - 1
      while(index < player.box.length - 1 && (player.box[index].number === player.box[index + 1].number)) {
        count++
        index++
      }
    }
    return count >= 4 ? index - 1 : null
  }

  // 顺子
  this.canToLine = function (player, index) {
    if (player.box.length < 5 || index < 1) {
      return null
    }
    // 2、大小王不计入顺子中
    if (player.box[index].number === '2' || player.box[index].number === '大王' || player.box[index].number === '小王') {
      return null
    }
    // 使用双指针
    let q = index - 1
    let p = index
    // 累加数
    let count = 1
    // 差值
    let dif = Math.abs(player.box[q].size - player.box[p].size)
    let ans = null
    // 遍历前面
    while (q > 0 && (dif === 0 || dif === 1)) {
      if (player.box[q].number === '2' || player.box[q].number === '大王' || player.box[q].number === '小王') {
        break
      }
      if(dif === 0) {
        while(q > 0 && dif === 0) {
          q--
          dif = Math.abs(player.box[q].size - player.box[p].size)
        }
        continue
      }
      if(dif === 1) {
        count++
        p = q
        q--
        dif = Math.abs(player.box[q].size - player.box[p].size)
      } else {
        break
      }
    }
    let pre_q = q // 前面最快的指针
    // 如果count小于5，并且不等于最后一个，则可以向后遍历
    if(count < 5 && index !== player.box.length - 1) {
      q = index + 1
      p = index
      dif = Math.abs(player.box[q].size - player.box[p].size) // 差值
      // 遍历后面
      while (q < player.box.length - 1 && (dif === 0 || dif === 1)) {
        if (player.box[q].number === '2' || player.box[q].number === '大王' || player.box[q].number === '小王') {
          break
        }
        if(dif === 0) {
          while(q < player.box.length - 1 && dif === 0) {
            q++
            dif = Math.abs(player.box[q].size - player.box[p].size)
          }
          continue
        }
        if(dif === 1) {
          count++
          p = q
          q++
          dif = Math.abs(player.box[q].size - player.box[p].size)
        } else {
          break
        }
      }
    }
    if(count >= 5) {
      // 前面最快的指针
      ans = pre_q
      if(ans === 0) { // 对于0  if判断的特殊处理
        ans = '0'
      }
    }
    return ans
  }

}
