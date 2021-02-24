import loggerLib from "../helpers/logger.mjs";

describe("Jasmine mock logger library works", function() {
  const logger = loggerLib.getLogger("test.jasmine.logger");
  var appender;

  beforeEach(function() {
    appender = new loggerLib.Appender();
    logger.addAppender(appender);
  });

  afterEach(function() {
    logger.removeAppender(appender);
    appender = null;
  });

  it("for one message", function() {
    logger.info("Hello World");
    expect(appender.events.length).toBe(1);
    if (appender.events.length > 0) {
      let event = appender.events[0];
      expect(event.level).toBe("INFO");
      expect(event.message).toBe("Hello World");
    }
  });

  it("for two messages", function() {
    logger.info("Hello World");
    logger.debug("It's a small world after all");

    expect(appender.events.length).toBe(2);
    if (appender.events.length > 0) {
      let event = appender.events[0];
      expect(event.level).toBe("INFO");
      expect(event.message).toBe("Hello World");
    }
    if (appender.events.length > 1) {
      let event = appender.events[1];
      expect(event.level).toBe("DEBUG");
      expect(event.message).toBe("It's a small world after all");
    }
  });
});
