"use strict"

if (typeof loggerLib != "object") {
  if (typeof require == "function") {
    var { loggerLib } = require("../../dist/node/mocks.js");
  }
  else
    throw new Error("Unable to run tests: cannot get MembraneMocks");
}

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

  it("at a basic level", function() {
    logger.info("Hello World");
    expect(appender.events.length).toBe(1);
    if (appender.events.length > 0) {
      let event = appender.events[0];
      expect(event.level).toBe("INFO");
      expect(event.message).toBe("Hello World");
    }
  });
});
