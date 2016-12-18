var loggerLib = (function() {
  function BasicLogger() {
    this.appenders = [];
    this.levels.forEach(function(level) {
      this[level.toLowerCase()] = this.log.bind(this, level);
    }, this);
  }
  BasicLogger.prototype = {
    log: function(level, message) {
      this.appenders.forEach(function(appender) {
        appender.notify(level, message);
      });
    },

    addAppender: function(appender) {
      this.appenders.push(appender);
    },

    removeAppender: function(appender) {
      let index = this.appenders.indexOf(appender);
      if (index != -1)
        this.appenders.splice(index, 1);
    },

    levels: ["FATAL", "ERROR", "WARN", "INFO", "DEBUG", "TRACE"]
  };

  BasicLogger.prototype.levels.forEach(function(level) {
    BasicLogger.prototype[level.toLowerCase()] = function() {};
  });

  function BasicAppender() {
    this.clear();
  }
  BasicAppender.prototype = {
    clear: function() {
      this.events = [];
    },
    notify: function(level, message) {
      this.events.push({ level, message });
    }
  };

  var loggerMap = new Map();
  
  var loggerLib = {
    getLogger: function(name) {
      if (!loggerMap.has(name))
        loggerMap.set(name, new BasicLogger());
      return loggerMap.get(name);
    },

    Appender: BasicAppender
  };
  return loggerLib;
})();
