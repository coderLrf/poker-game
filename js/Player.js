/**
 * 玩家类
 * @param name 名字
 * @param cardTable 牌桌
 */
function Player(name, cardTable = null) {
  this.name = name // 名称
  this.identity = '' // 身份
  this.box = [] // 用来存放玩家的手牌
  this.selectBox = [] // 用来存放玩家选择的手牌
  this.waitBox = [] // 等下要出的牌
  this.hand = true // 该玩家是否被压制，默认是否压制，被压制的玩家不能出牌
  this.root = false // 出头牌判断
  this.type = '' // 出牌的类型
  this.flag = false // 是否已经出牌，用来限制一回合只能出一次牌

  // 分数元素
  this.scoreEl = document.querySelector(`.${this.name}_score .score`)
  // 身份元素
  this.identityEl = document.querySelector(`.${this.name}_score .identity`)
  // 剩余牌数
  this.cardNumberEl = document.querySelector(`.${this.name}_score .card_number`)
  // 自身元素
  this.El = document.querySelector(`.${this.name} ul`)
  // 牌桌对象
  this.cardTable = cardTable

  // 设置类型
  this.setType = function (type) {
    // 在这里进行了一些限制
    if (type === 'one' || type === 'two' || type === 'three' || type === 'four' || type === 'line') {
      this.type = type
    } else {
      console.log('类型不符合规则')
    }
  }

  // 设置身份
  this.setIdentity = function (identity) {
    this.identity = identity
    this.identityEl.innerHTML = identity
  }

  // 摸牌的方法
  this.takePlayer = function (card) {
    this.box.push(card)
  }

  // 判断自己的地位，如果是地主则可以拿最后的三张牌
  this.isHost = function (bottom) {
    if (this.identity === '地主') {
      this.box.push(...bottom.box)
      // 清空底牌
      bottom.box = []
      // 地主玩家拥有出头牌的能力
      this.root = true
      this.cardTable.titleEl.innerHTML = this.name
    }
    return this.identity === '地主'
  }

  // 判断自己是否有手牌
  this.isEmpty = function () {
    return this.box.length === 0
  }

  // 看牌的方法，可以查看自己的牌
  this.lookBrands = function () {
    // 看牌之前，先将手上的牌清空
    this.El.innerHTML = ''

    // 遍历玩家1的手牌
    for (let i = 0; i < this.box.length; i++) {
      // 创建li元素加入到player1
      const newLi = document.createElement('li')
      newLi.innerHTML = this.box[i].toString()
      newLi.style.backgroundImage = `url(./img/${this.box[i].toString()}.jpg)`
      if (this.name !== 'player1') {
        const newDiv = document.createElement('div')
        newDiv.style.backgroundImage = `url(./img/bg_card.jpg)`
        newLi.appendChild(newDiv)
      }
      this.El.appendChild(newLi)
    }
    this.cardNumberEl.innerHTML = this.box.length + ''
  }

  // 刷新手上的牌
  this.refreshCard = function () {
    if (this.name === 'player1') {
      if (!this.selectBox.length) {
        const lis = this.El.querySelectorAll('li')
        for (let i = 0; i < lis.length; i++) {
          lis[i].classList.remove('active')
        }
        return
      }
      // 选出el
      const selectEl = this.selectBox.map(select => {
        return select.el
      })
      for (let i = 0; i < selectEl.length; i++) {
        this.El.removeChild(selectEl[i]) // 删除
      }
      this.cardNumberEl.innerHTML = this.box.length + ''
    } else {
      this.lookBrands()
    }
  }

  // 对牌进行排序
  this.sortCards = function () {
    if (this.isEmpty()) {
      this.cardTable.GAME_WIN = true // 已经存在赢家
      return
    }
    // 冒泡排序
    for (let i = 1; i < this.box.length; i++) {
      for (let j = 0; j < this.box.length - 1; j++) {
        if (this.box[j].size < this.box[j + 1].size) {
          let temp = this.box[j]
          this.box[j] = this.box[j + 1]
          this.box[j + 1] = temp
        }
      }
    }
    // 看牌
    this.lookBrands()
  }

  /**
   * 不要，直接下一个
   */
  this.passPlays = () => {
    if (this.flag) {
      return
    }
    if (this.cardTable.playerList[this.cardTable.currentIndex] !== this) {
      this.cardTable.showTips('还没有轮到你哟~~')
      return
    }
    // 如果是出头牌，不可以不要
    if (this.root) {
      this.cardTable.showTips('您有出头牌的能力，不可以不要哟~~')
      return
    }
    this.hand = true // 玩家被压制
    if (this.selectBox.length) {
      this.selectBox = []
      this.refreshCard() // 刷新
    }
    this.cardTable.showTips(this.name + '不要~~')
    this.flag = true // 表示已经过了
    this.cardTable.nextPlayer()
  }

  /**
   * 出牌类，根据出牌规则进行出牌，满足出牌规则即可出牌
   */
  this.plays = () => {
    // 游戏还没有开始，或则已经出牌了，将不可以出牌
    if (!this.cardTable.startState || this.flag) {
      return
    }
    // 判断如果不是轮到自己，直接返回
    if (this.cardTable.playerList[this.cardTable.currentIndex] !== this) {
      this.cardTable.showTips('还没有轮到你哟~~')
      return
    }
    // 如果牌堆里面已经有赢家，则游戏结束，或者没有选择牌
    if (this.cardTable.GAME_WIN) {
      return
    }
    // 判断是否可以出头牌
    if (this.root) {
      this.hostPlayer() // 出头牌
      this.root = false
      return
    }
    // 定义一个标记用来标记是否有牌可以出
    let flag = false
    // 先遍历一遍看看是否有牌可以大上大家的
    switch (this.cardTable.TYPE) {
      case 'one':
        flag = this.isPlayOne()
        break
      case 'two':
        flag = this.isPlayTwo()
        break
      case 'three':
        flag = this.isPlayThree()
        break
      case 'four':
        flag = this.isPlayFour()
        break
      case 'line':
        flag = this.isPlayLine()
        break
      default:
    }
    // 判断是否可以出牌
    if (!flag) {
      if(this.cardTable.TYPE !== 'four') {
        if(!this.isBomb()) {
          this.passPlays()
          return
        }
      } else {
        this.passPlays()
        return
      }
    }
    // 出牌，出牌分电脑出牌和玩家出牌
    if (this.name === 'player1') {
      // 玩家选择牌进行打出
      // 判断是否满足规则
      if (!this.cardTable.playerRule.rule(this.selectBox, this)) {
        this.cardTable.showTips('你选择的牌不符合规则，请重新选择')
      } else {
        if (this.type !== this.cardTable.TYPE && this.type !== 'four') {
          this.cardTable.showTips('你选择的牌不符合出牌类型，请重新选择')
        } else {
          if (this.type === 'line' && this.waitBox.length !== this.cardTable.LAST_PLAY.length) {
            this.cardTable.showTips('你选择的牌不符合出牌类型，请重新选择')
          } else {
            this.playCards() // 出牌
          }
        }
      }
    } else {
      // 电脑出牌
      this.setType(this.cardTable.TYPE)
      this.playCards()
    }
  }

  /**
   * 出头牌的方法
   */
  this.hostPlayer = function () {
    // 如果是玩家1出牌
    if (this.name === 'player1') {
      // 如果没有选择牌
      if (!this.selectBox.length) {
        this.cardTable.showTips('还没有选择牌哟~~')
        return
      }
      // 判断是否满足出牌规则
      if (this.cardTable.playerRule.rule(this.selectBox, this)) {
        this.playCards()
      } else {
        this.cardTable.showTips('你选择的牌不符合规则，请重新选择')
      }
    } else {
      // 根据牌的大小来判断出什么类型，从小牌开始枚举
      const type = this.getTopCardType()
      this.setType(type)
      this.playCards()
    }
  }

  /**
   * 出牌的方法
   */
  this.playCards = function () {
    if (this.name === 'player1') {
      this.playerPlays() // 玩家出牌
    } else {
      this.computerPlays() // 电脑出牌
    }
    this.cardTable.nextPlayer() // 下一位出牌
  }

  /**
   * 玩家出牌的方法
   */
  this.playerPlays = function() {
    let flag = false // 是否可以跳过判断，可以出牌
    if (this.root) {
      // 如果是出头牌，则不需要判断是否有牌可以大过大家
      flag = true
    } else {
      // 判断选择的牌是否符合类型
      const playerCard = this.selectBox[this.selectBox.length - 1].card
      const rootCard = this.cardTable.getRootCard()
      if ((playerCard.size > rootCard.size) || (this.type === 'four' && this.cardTable.TYPE !== 'four')) {
        flag = true
      } else {
        this.cardTable.showTips('你选择的牌大不过大家，请重新选择')
        flag = false
      }
    }
    // 如果可以出牌
    if (flag) {
      // 选出指定的牌card
      const cards = this.selectBox.map(select => select.card).sort((a, b) => a.size - b.size)
      for (let i = 0; i < cards.length; i++) {
        // 添加到弃牌堆
        this.cardTable.DISCARD_PILE.push(cards[i])
      }
      // 成功出牌
      this.successPlays(cards)
    } else {
      this.hand = true // 玩家被压制
      return
    }
    // 清空selectBox
    this.selectBox = []
  }

  /**
   * 电脑出牌的方法
   */
  this.computerPlays = function () {
    let flag = false // 是否可以跳过判断，可以出牌
    let outArr = []
    if (this.root) {
      // 如果是出头牌，直接从小出到大
      outArr = []
      if(this.waitBox.length) {
        for (let i = 0; i < this.waitBox.length; i++) {
          this.cardTable.DISCARD_PILE.push(this.waitBox[i])
        }
        outArr = this.waitBox
        this.waitBox = [] // 清空
      } else {
        // 获取出牌数量
        const count = this.getCountByType(this.type)
        for (let i = this.box.length - 1; i >= this.box.length - count; i--) {
          this.cardTable.DISCARD_PILE.push(this.box[i]) // 添加到弃牌堆
          outArr.push(this.box[i]) // 添加到牌堆
        }
      }
      flag = true // 成功出牌
    } else {
      outArr = []
      let u = 0 // 用来保存大于牌堆的最大索引
      // 电脑玩家，过滤掉小牌是对子或则三条的情况下
      const rootCard = this.cardTable.getRootCard()
      if (this.waitBox.length) {
        for (let i = 0; i < this.waitBox.length; i++) {
          this.cardTable.DISCARD_PILE.push(this.waitBox[i])
        }
        outArr = this.waitBox
        flag = true // 成功出牌
        this.setType('line') // 重置出牌类型
        this.waitBox = [] // 清空
      } else {
        for (let i = this.box.length - 1; i >= this.cardTable.typeCount; i--) {
          // 电脑出牌，电脑玩家有牌就压，如果有炸弹也可以压，如果可以压的牌是对子，会跳过
          if (this.box[i].size > rootCard.size) {
            if(u === 0) {
              u = i
            }
            // 新增规则：如果要出牌是个对子、三条、炸弹、顺子，则可以不出
            if(this.cardTable.TYPE === 'one') {
              let index = this.cardTable.playerRule.canToContact(this, i)
              if(index) {
                i = parseInt(index) + 1 // 这里 + 1是为了抵消for循环 - 1
                continue
              }
            }
            if (this.box[i].number === this.box[i - this.cardTable.typeCount].number) {
              // 出牌
              for (let j = i; j >= i - this.cardTable.typeCount; j--) {
                this.cardTable.DISCARD_PILE.push(this.box[j]) // 添加到弃牌堆
                outArr.push(this.box[j]) // 添加到牌堆
              }
              flag = true // 成功出牌
              break
            }
          }
        }
      }
      // 在这里没有如果没有成功出牌，表示手上的牌类型与牌堆类型不符合
      if (!flag) {
        outArr = []
        // 这里可以从u开始遍历，u以下的是上面遍历过了
        for (let i = u; i >= this.cardTable.typeCount; i--) {
          if (this.box[i].number === this.box[i - this.cardTable.typeCount].number) {
            // 出牌
            for (let j = i; j >= i - this.cardTable.typeCount; j--) {
              this.cardTable.DISCARD_PILE.push(this.box[j]) // 添加到弃牌堆
              outArr.push(this.box[j]) // 添加到牌堆
            }
            flag = true // 成功出牌
            break
          }
        }
      }
    }

    // 如果没有成功出牌，这里查找是否有炸弹
    if (!flag) {
      outArr = []
      let bombFlag = false
      if (this.isBomb()) {
        if(this.cardTable.TYPE !== 'four') {
          for (let i = this.box.length - 1; i >= 3; i--) {
            if (this.isFour(i)) {
              // 出牌
              for (let j = i; j >= i - 3; j--) {
                this.cardTable.DISCARD_PILE.push(this.box[j]) // 添加到弃牌堆
                outArr.push(this.box[j]) // 添加到牌堆
              }
              bombFlag = true // 成功出炸弹
              this.setType('four')
              break
            }
          }
        }
        // 如果拥有大小王
        if (this.box[0].number === '大王' && this.box[1].number === '小王' && !bombFlag) {
          this.cardTable.DISCARD_PILE.push(this.box[0], this.box[1])
          outArr.push(this.box[0], this.box[1]) // 添加到牌堆
          bombFlag = true // 成功出炸弹
          this.setType('four')
        }
      }
      // 如果成功出炸弹
      if (bombFlag) {
        this.successPlays(outArr)
      }
    } else {
      this.successPlays(outArr)
    }
  }

  // 删除自身
  this.removeSelf = function (outArr) {
    for (let j = 0; j < outArr.length; j++) {
      this.box.splice(this.box.indexOf(outArr[j]), 1)
    }
  }

  // 成功出牌
  this.successPlays = function (outArr) {
    if (this.type === 'four') {
      this.cardTable.showTips('炸弹来了~~') // 你没有牌可以大过大家
    }
    this.cardTable.setType(this.type)
    this.removeSelf(outArr) // 删除自身
    this.cardTable.discardRender(outArr) // 渲染牌堆
    this.refreshCard() // 刷新手上的牌
    this.hand = false // 玩家没有被压制
    this.flag = true // 已经出牌
    this.cardTable.lastPlayer = this // 上一次出牌的玩家
    this.isWin()
  }

  // 判断是否有牌可以大过大家 ， 如果没有 ， 则直接跳过出牌阶段
  this.isPlayOne = function () {
    const rootCard = this.cardTable.getRootCard()
    for (let i = this.box.length - 1; i >= 0; i--) {
      // 如果有牌可以大过牌堆里面的牌
      if (this.box[i].size > rootCard.size) {
        return true;
      }
    }
    return false;
  }

  // 判断是否有牌可以大过大家 ， 如果没有 ， 则直接跳过出牌阶段
  this.isPlayTwo = function () {
    const rootCard = this.cardTable.getRootCard()
    for (let i = this.box.length - 1; i >= 1; i--) {
      // 如果有牌可以大过牌堆里面的牌
      if (this.box[i].size > rootCard.size) {
        if (this.box[i].number === this.box[i - 1].number) {
          return true;
        }
      }
    }
    return false;
  }

  // 判断是否有牌可以大过大家 ， 如果没有 ， 则直接跳过出牌阶段
  this.isPlayThree = function () {
    const rootCard = this.cardTable.getRootCard()
    for (let i = this.box.length - 1; i >= 2; i--) {
      // 如果有牌可以大过牌堆里面的牌
      if (this.box[i].size > rootCard.size) {
        if (this.box[i].number === this.box[i - 2].number) {
          return true;
        }
      }
    }
    return false;
  }

  // 判断是否有牌可以大过大家 ， 如果没有 ， 则直接跳过出牌阶段
  this.isPlayFour = function () {
    if(this.box.length < 2) {
     return false
    }
    if(this.box[0].number === '大王' || this.box[1].number === '小王') {
      return true
    }
    const rootCard = this.cardTable.getRootCard()
    for (let i = this.box.length - 1; i >= 3; i--) {
      // 如果有牌可以大过牌堆里面的牌
      if (this.box[i].size > rootCard.size) {
        if (this.box[i].number === this.box[i - 3].number) {
          return true;
        }
      }
    }
    return false;
  }

  // 判断是否有牌可以大过大家 ， 如果没有 ， 则直接跳过出牌阶段
  this.isPlayLine = function () {
    if(this.box.length < 5) {
      return false
    }
    const minCard = this.cardTable.LAST_PLAY[0]
    for (let i = this.box.length - 1; i >= 0; i--) {
      if (this.box[i].number === '2' || this.box[i].number === '大王' || this.box[i].number === '小王') {
        continue
      }
      if (this.box[i].size > minCard.size) {
        if (this.cardLineRule(i)) {
          // 是否满足顺子规则
          return true
        } else {
          if (this.waitBox.length) {
            // 重新赋值给i，为了优化
            i = this.box.indexOf(this.waitBox[this.waitBox.length - 1])
          }
          while (i > 0 && this.box[i].number === this.box[i - 1].number) i--
          this.waitBox = []
        }
      }
    }
    return false
  }

  // 一张牌满足顺子出牌规则
  this.cardLineRule = function (index) {
    if(index < 1) {
      return false
    }
    let count = 1
    // 定义两个指针
    let q = index - 1
    let p = index
    // 先添加该元素
    this.waitBox.push(this.box[p])
    // 计算差值
    let dif = Math.abs(this.box[q].size - this.box[p].size)
    while(q > 0 && (dif === 0 || dif === 1)) {
      if (this.box[q].number === '2' || this.box[q].number === '大王' || this.box[q].number === '小王') {
        break
      }
      if(dif === 0) {
        q--
      } else if(dif === 1) {
        this.waitBox.push(this.box[q])
        if(this.waitBox.length === this.cardTable.LAST_PLAY.length) {
          break
        }
        p = q
        q--
      }
      dif = Math.abs(this.box[q].size - this.box[p].size)
    }
    return this.waitBox.length >= this.cardTable.LAST_PLAY.length
  }

  // 判断一张牌是否可以连成炸弹
  this.isFour = function (index) {
    // 手上的牌不足炸弹数量
    if (index - 3 < 0) {
      return false
    }
    return this.box[index].number === this.box[index - 3].number
  }

  // 判断是否有炸弹
  this.isBomb = function () {
    // 手上的牌不足四张
    if(this.box.length < 4) {
      return false
    }
    if (this.box[0].number === '大王' && this.box[1].number === '小王') {
      return true;
    }
    for (let i = this.box.length - 1; i >= 3; i--) {
      if (this.box[i].number === this.box[i - 3].number) {
        return true;
      }
    }
    return false;
  }

  // 获取电脑玩家最小牌的顺子
  this.getMinLine = function() {
    if(this.box.length < 5) {
      return null
    }
    const lines = [] // 用来存放顺子集合
    // 定义双指针
    let p = this.box.length - 1 // 慢指针
    let q = this.box.length - 2 // 快指针
    lines.push(this.box[p])
    // 求两数差值
    let dif = Math.abs(this.box[q].size - this.box[p].size)
    // 计算对子数量
    let pairCount = 0
    while(q > 0 && (dif === 0 || dif === 1)) {
      if (this.box[q].number === '2' || this.box[q].number === '大王' || this.box[q].number === '小王') {
        break
      }
      if(dif === 0) {
        // 累加对子数量
        if(Math.abs(q - p) === 1) {
          pairCount++
        }
        q--
      } else if(dif === 1) {
        lines.push(this.box[q])
        p = q
        q--
      }
      dif = Math.abs(this.box[q].size - this.box[p].size)
    }
    if(lines.length >= 5 && pairCount <= lines.length / 2) {
      return lines
    } else{
      return null
    }
  }

  // 获取电脑玩家最小牌类型
  this.getTopCardType = function () {
    let index = this.box.length - 1
    let count = 0
    while ((index > 0) && (this.box[index].number === this.box[index - 1].number)) {
      count++
      index--
    }
    // 枚举是否有一条顺子
    const lines = this.getMinLine()
    if(lines) { // 如果存在顺子，可以出
      count = lines.length
    }
    let type = null
    switch (count) {
      case 0:
        type = 'one'
        break
      case 1:
        type = 'two'
        break
      case 2:
        type = 'three'
        break
      case 3:
        type = 'four'
        break
      case 4:
      case 5:
      case 6:
      case 7:
      case 8:
      case 9:
      case 10:
      case 11:
      case 12:
        type = 'line'
        this.waitBox = lines
        break
      default:
    }
    return type
  }

  // 根据电脑玩家出头牌的类型来判断出什么牌
  this.getCountByType = function (type) {
    let count = 0
    switch (type) {
      case 'one':
        count = 1
        break
      case 'two':
        count = 2
        break
      case 'three':
        count = 3
        break
      case 'four':
        count = 4
        break
      default:
    }
    return count
  }

  // 是否胜利
  this.isWin = function () {
    if (!this.box.length) {
      this.cardTable.titleEl.innerHTML = this.name + '胜利了'
      this.cardTable.win()
    }
  }

  // 渲染最后的牌
  this.handleCard = function () {
    const cardsEl = document.querySelectorAll(`.${this.name} ul li div`)
    for (let i = 0; i < cardsEl.length; i++) {
      const parentNode = cardsEl[i].parentNode
      parentNode.removeChild(cardsEl[i])
    }
  }
}
// console.log(new Player('张三', '农民'))
