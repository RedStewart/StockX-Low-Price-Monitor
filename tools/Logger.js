const chalk = require("chalk");

class Logger {
  static log(msg) {
    return console.log(`${chalk.greenBright(this.logTime())} ${msg}`);
  }

  static warn(msg) {
    return console.log(`${chalk.yellowBright(this.logTime())} ${msg}`);
  }

  static error(msg) {
    return console.log(`${chalk.redBright(this.logTime())} ${msg}`);
  }

  static logTime() {
    const formatTime = (x, n) => {
      while (x.toString().length < n) {
        x = "0" + x;
      }
      return x;
    };

    let date = new Date();
    let h = formatTime(date.getHours(), 2);
    let m = formatTime(date.getMinutes(), 2);
    let s = formatTime(date.getSeconds(), 2);
    let ms = formatTime(date.getMilliseconds(), 3);
    return (date = `[${h}:${m}:${s}:${ms}]`);
  }
}

module.exports = Logger;
