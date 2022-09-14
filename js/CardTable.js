/**
 * 牌桌类
 * @constructor
 */
function CardTable() {
  this.GAME_WIN = false // 赢家
  this.TYPE = '' // 出牌的类型
  this.ALL_CARDS = [] // 洗牌堆
  this.DISCARD_PILE = [] // 弃牌堆
  this.LAST_PLAY = [] // 上一次出的牌
  this.numbers = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2'] // 点数
  this.colors = ['♠', '♥', '♣', '♦'] // 花数

  this.playerRule = new PlayRule() // 游戏规则
  this.startState = false // 游戏开始的状态，默认还没有开始

  this.landPress = false // 地主玩家是否被压制

  /**
   * TODO 洗牌模式
   */
  this.shuffleCards = true // 表示是否需要进行洗牌，不洗牌模式

  // 用来存放玩家的数组
  this.playerList = []
  // 底牌玩家
  this.bottomPlayer = new Player('底牌', this)
  // 上一次出牌的玩家
  this.lastPlayer = null

  // 底牌元素
  this.bottomCardEl = document.querySelector('.host_card ul')

  // 操作按钮
  this.passBtnEl = document.querySelector('.pass')
  this.playBtnEl = document.querySelector('.play')
  // 提示信息
  this.titleEl = document.querySelector('.title')
  this.tipsEl = document.querySelector('.tips')
  // 弃牌堆
  this.discardElList = document.querySelectorAll('.discard ul')
  this.startEl = document.querySelector('#start_btn') // 开始按钮元素
  // 底分
  this.bottomScore = 6 // 默认底分为 6 分
  this.bottomScoreEl = document.querySelector('.bottom_score .score')
  // 倍数
  this.multiple = 1 // 默认一倍
  this.multipleEl = document.querySelector('.multiple .score')

  // 初始化
  this.init = function () {
    // 清空牌堆
    this.clearDiscard()
    // 做牌，洗牌
    this.makeCard()
    // 创建3名玩家，清空玩家数组
    for(let i = 1; i <= 3; i++) {
      const newPlayer = new Player('player' + i, this)
      // 添加到玩家集合
      this.playerList.push(newPlayer)
    }
    // 创建幸运玩家
    this.luck = parseInt((Math.random() * 3) + '') // 幸运数字
    // this.luck = 0
    this.currentIndex = this.luck // 当前玩家索引
    this.playerList[this.currentIndex].setFlag() // 设置flag
    // 选出地主
    for (let i = 0; i < this.playerList.length; i++) {
      let identity = '农民'
      if(i === this.luck) {
        identity = '地主'
      }
      this.playerList[i].setIdentity(identity)
    }
    // 发牌
    this.dealCards()

    // 初始化事件
    this.initEvent()
  }

  // 游戏开始
  this.start = function() {
    this.startState = true // 游戏开始
    // 判断如果地主不是player1，自动出牌
    if(this.currentIndex !== 0) {
      this.playerList[this.currentIndex].plays() // 出牌
    }
  }

  // 重新开始游戏
  this.restart = function() {
    // 重置数据
    this.GAME_WIN = false // 赢家
    this.multiple = 1 // 默认一倍
    this.multipleEl.innerHTML = this.multiple + ''
    this.bottomScore = 6 // 默认底分为 6 分
    this.bottomScoreEl.innerHTML = this.bottomScore + ''
    this.TYPE = '' // 出牌的类型
    this.ALL_CARDS = [] // 洗牌堆
    this.DISCARD_PILE = [] // 弃牌堆
    this.LAST_PLAY = [] // 上一次出的牌
    this.playerList = [] // 清空玩家数组
    this.bottomPlayer = new Player('底牌', this) // 底牌玩家
    // 初始化工作
    this.init()

    // 开始游戏
    this.start()
  }

  // 游戏胜利
  this.win = function() {
    // 游戏胜利
    this.GAME_WIN = true
    // 获取胜利的玩家
    const winPlayer = this.playerList[this.currentIndex]
    this.titleEl.innerHTML = winPlayer.name + '胜利了  身份是：' + winPlayer.identity
    // 添加得分
    let score = this.bottomScore * this.multiple
    for (let i = 0; i < this.playerList.length; i++) {
      let s = score
      if(winPlayer.identity === '地主') { // 如果是地主赢了
        if(this.playerList[i].identity === '地主') {
          s = s * 2
        } else {
          s = -s
        }
      } else { // 如果是农名赢了
        if(this.playerList[i].identity === '地主') {
          s = -(s * 2)
        }
      }
      this.playerList[i].scoreEl.innerHTML = (parseInt(this.playerList[i].scoreEl.innerHTML) + s) + ''
      // 渲染牌
      if(this.playerList[i].name !== 'player1')
      this.playerList[i].handleCard()
    }
    // 显示开始按钮
    this.startEl.innerHTML = '继续游戏'
    this.startEl.parentNode.classList.remove('start')
  }

  // 初始化事件
  this.initEvent = function () {
    const player1 = this.playerList[0]
    // 获取子元素
    player1.childrenEl = document.querySelectorAll(`.player1 ul li`)
    // 手中牌
    const that = this
    for (let i = 0; i < player1.childrenEl.length; i++) {
      // 添加到数组
      player1.childrenEl[i].addEventListener('click', function(e) {
        // 添加className
        this.classList.toggle('active')

        // 选中的牌
        const selectCard = {
          card: that.getCardByNode(this),
          el: this
        }
        // 判断是否已被选择，模拟toggle方法
        const index = player1.selectBox.findIndex(select => {
          return select.card === selectCard.card
        })
        // 如果不存在添加，反之删除
        if (index === -1) {
          player1.selectBox.push(selectCard)
        } else {
          player1.selectBox.splice(index, 1)
        }
      })
    }
    // 出牌按钮
    this.passBtnEl.addEventListener('click', player1.passPlays)
    this.playBtnEl.addEventListener('click', player1.plays)
    // 开始按钮
    this.startEl.addEventListener('click', function() {
      this.parentNode.classList.add('start')
      if(this.innerHTML === '开始游戏') {
        that.start()
      } else if(this.innerHTML === '继续游戏') { // 重新开始
        that.restart()
      }
    })

    // 鼠标右键可以进行出牌
    document.querySelector('.main').addEventListener('contextmenu', (e) => {
      e.preventDefault()
      this.playerList[0].plays()
    })
  }

  /**
   * 制作牌
   */
  this.makeCard = function () {
    let size = 1 // 初始化牌的大小
    for (let i = 0; i < this.numbers.length; i++) {
      for (let j = 0; j < this.colors.length; j++) {
        // 创建一张牌对象封装点数和花色
        const card = new Card(this.numbers[i], this.colors[j], size)
        // 添加到牌库
        this.ALL_CARDS.push(card)
      }
      size++ // 点数 + 1
    }
    // 最后添加大王小王
    this.ALL_CARDS.push(new Card('小王', '', size++))
    this.ALL_CARDS.push(new Card('大王', '', size++))

    // 洗牌，将数组顺序打乱
    if(this.shuffleCards) {
      this.ALL_CARDS.sort((a, b) => {
        return Math.random() > 0.5 ? -1 : 1
      })
    }
  }

  /**
   * 发牌
   */
  // 开始发牌
  this.dealCards = function () {
    // 发牌阶段
    if(this.shuffleCards) { // 洗牌模式的发牌规则
      for (let i = 0; i < this.ALL_CARDS.length; i++) {
        if (i >= this.ALL_CARDS.length - 3) {
          this.bottomPlayer.takePlayer(this.ALL_CARDS[i])
        } else if (i % 3 === i % 3) {
          this.playerList[i % 3].takePlayer(this.ALL_CARDS[i])
        }
      }
    } else { // 不洗牌模式的发牌规则
      // 定义一个当前摸牌玩家，随机
      let index = Math.floor(Math.random() * 3)
      for (let i = 0; i < this.ALL_CARDS.length; i++) {
        if (i >= this.ALL_CARDS.length - 3) {
          this.bottomPlayer.takePlayer(this.ALL_CARDS[i]);
        } else {
          this.playerList[index].takePlayer(this.ALL_CARDS[i])
          if(this.playerList[index].box.length === 17) {
            index++
            if(index > 2) {
              index = 0
            }
          }
        }
      }
    }

    // 清空牌库
    this.ALL_CARDS = []
    // 渲染地主牌
    this.bottomCardHandle()
    // 发地主牌
    this.playerList[this.luck].isHost(this.bottomPlayer)
    // 排序
    for (let i = 0; i < this.playerList.length; i++) {
      this.playerList[i].sortCards() // 排序
    }
  }

  /**
   * 渲染地主牌
   */
  this.bottomCardHandle = function() {
    this.bottomCardEl.innerHTML = ''
    for (let i = 0; i < this.bottomPlayer.box.length; i++) {
      const newLi = document.createElement('li')
      // newLi.innerHTML = this.bottomPlayer.box[i].toString()
      newLi.style.backgroundImage = `url(./img/${this.bottomPlayer.box[i].toString()}.jpg)`
      this.bottomCardEl.appendChild(newLi)
    }
  }

  /**
   * 下一名玩家
   */
  this.nextPlayer = function() {
    // 如果存在游戏赢家
    if(this.GAME_WIN) return
    this.playerList[this.currentIndex ++].flag = false // 新的一个回合
    if(this.currentIndex >= this.playerList.length) { // 轮训
      this.currentIndex = 0
    }
    this.playerList[this.currentIndex].setFlag() // 设置flag
    setTimeout(() => {
      this.titleEl.innerHTML = this.playerList[this.currentIndex].name
      // 如果上一次出牌玩家还是自身，等价于另外两名玩家已经被压制了，可以出头牌
      if(this.lastPlayer === this.playerList[this.currentIndex]) {
        this.playerList[this.currentIndex].root = true
        this.landPress = false // 新回合，地主没有被压制
      }
      // 如果不是玩家1，自动出牌
      if(this.currentIndex !== 0) {
        this.playerList[this.currentIndex].plays() // 电脑出牌
      }
    }, 1200)
  }

  /**
   * 渲染牌堆
   */
  this.discardRender = function(selectBox) {
    // 清空牌堆
    this.discardElList[this.currentIndex].innerHTML = ''
    // 根据出牌类型
    let index = selectBox.length - 1
    if (this.TYPE === 'four' && this.isBomb()) { // 如果是大小王炸弹
      index = 1
    }
    this.typeCount = index
    this.LAST_PLAY = selectBox
    for(let i = this.DISCARD_PILE.length - 1; index >= 0; i--, index--) {
      const newLi = document.createElement('li')
      newLi.innerHTML = this.DISCARD_PILE[i].toString()
      newLi.style.backgroundImage = `url(./img/${this.DISCARD_PILE[i].toString()}.jpg)`
      this.discardElList[this.currentIndex].appendChild(newLi)
    }
  }

  /**
   * 清空牌堆
   */
  this.clearDiscard = function() {
    for (let i = 0; i < this.discardElList.length; i++) {
      this.discardElList[i].innerHTML = ''
    }
  }

  /**
   * 获取顶上一张牌
   */
  this.getRootCard = function() {
    if(this.DISCARD_PILE.length) {
      return this.DISCARD_PILE[this.DISCARD_PILE.length - 1]
    } else {
      return null
    }
  }

  /**
   * 设置牌堆的类型
   */
  this.setType = function(type) {
    // 如果类型为炸弹类型，倍数翻倍
    if(type === 'four') {
      this.multiple = this.multiple * 2
      this.multipleEl.innerHTML = this.multiple
    }
    this.TYPE = type
  }

  /**
   * 显示提示
   */
  this.showTips = function(message) {
    this.tipsEl.innerHTML = message
    this.tipsEl.classList.add('show')
    setTimeout(() => {
      this.tipsEl.innerHTML = ''
      this.tipsEl.classList.remove('show')
    }, 1200)
  }

  /**
   * 判断牌定上面两张牌是否是大小王炸弹
   */
  this.isBomb = function() {
    const card1 = this.DISCARD_PILE[this.DISCARD_PILE.length - 1]
    const card2 = this.DISCARD_PILE[this.DISCARD_PILE.length - 2]
    return (card1.number === '大王' && card2.number === '小王') || (card1.number === '小王' && card2.number === '大王')
  }

  /**
   * 根据对应的节点获取对应的牌对象
   */
  this.getCardByNode = function(node) {
    const html = node.innerHTML
    let color
    let number
    if(html === '大王' || html === '小王') {
      color = ''
      number = html
    } else {
      // 选出花色索引
      color = this.colors[this.colors.indexOf(html.substring(html.length - 1))]
      number = html.substring(0, html.indexOf(color))
    }
    // 根据box对象查找
    const index = this.playerList[0].box.findIndex(card => {
      return card.color === color && card.number === number
    })
    // 返回对应的对象
    return this.playerList[0].box[index]
  }

}
