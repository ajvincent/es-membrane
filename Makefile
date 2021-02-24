all:: clean browser node-tests gui-tests

.PHONY:: clean base browser all travis-ci node-tests gui-tests

DIST=docs/dist

travis-ci:: all
ifneq ("$(shell git status --porcelain)","")
	@echo "This test fails because the build process changed some files that haven't been committed yet."
	@exit 1;
endif

base::
	npm run rollup

clean::
	@rm -rf $(DIST)

browser:: base
	@mkdir -p $(DIST)/browser
	@cp wrappers/browser/fireJasmine.js $(DIST)/browser/fireJasmine.js
	@cp wrappers/browser/test-browser.xhtml $(DIST)/browser/test-browser.xhtml

gui-tests::
	npm run gui-tests

node-tests::
	npm test
