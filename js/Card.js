/**
 * 工厂类，用于生产各种对象
 */

/**
 * 创建一个牌的方法
 * @param number 点数
 * @param color 颜色
 * @param size 大小
 * @constructor 一张牌
 */
function Card(number, color, size){
  this.number = number
  this.color = color
  this.size = size

  this.toString = function() {
    return this.number + this.color
  }
}



// const card = new Card('A', '♣', 1)
// console.log(card.number)
