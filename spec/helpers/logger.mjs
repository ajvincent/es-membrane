class BasicLogger {
  constructor() {
    this.appenders = [];
    this.levels.forEach(function(level) {
      this[level.toLowerCase()] = this.log.bind(this, level);
    }, this);
  }

  log(level, message) {
    var exn = null, exnFound = false;
    this.appenders.forEach(function(appender) {
      try {
        appender.notify(level, message);
      }
      catch (e) {
        if (!exnFound) {
          exnFound = true;
          exn = e;
        }
      }
    });
    if (exnFound)
      throw exn;
  }

  addAppender(appender) {
    this.appenders.push(appender);
  }

  removeAppender(appender) {
    let index = this.appenders.indexOf(appender);
    if (index != -1)
      this.appenders.splice(index, 1);
  }
}

BasicLogger.prototype.levels = [
  "FATAL",
  "ERROR",
  "WARN",
  "INFO",
  "DEBUG",
  "TRACE"
];

BasicLogger.prototype.levels.forEach(function(level) {
  BasicLogger.prototype[level.toLowerCase()] = function() {};
});

class BasicAppender {
  constructor() {
    this.clear();
    this.threshold = "TRACE";
  }

  clear() {
    this.events = [];
  }
  notify(level, message) {
    if (BasicLogger.prototype.levels.indexOf(level) <= BasicLogger.prototype.levels.indexOf(this.threshold))
      this.events.push({ level, message });
  }
  setThreshold(level) {
    if (BasicLogger.prototype.levels.includes(level))
      this.threshold = level;
  }
}

var loggerMap = new Map();

export default {
  getLogger: function(name) {
    if (!loggerMap.has(name))
      loggerMap.set(name, new BasicLogger());
    return loggerMap.get(name);
  },

  Appender: BasicAppender
};

